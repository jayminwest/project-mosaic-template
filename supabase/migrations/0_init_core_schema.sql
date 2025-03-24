-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "wrappers" schema extensions;

-- User Profile table (extends Supabase auth.users)
drop table if exists public.profiles;
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  subscription_plan text check (subscription_plan in ('free', 'premium')) default 'free',
  usage_limit integer default 100,
  stripe_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Function to create profile for new (auth) users
create or replace function public.handle_new_user() 
returns trigger
security definer
set search_path to public
as $$
begin
  insert into public.profiles (user_id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql;

-- Trigger to create profile for new (auth) users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Security policy: Users can read their own profile
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = user_id);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Create storage bucket with size and MIME type restrictions
insert into storage.buckets
  (id, name, public, file_size_limit, allowed_mime_types)
values
  ('task-attachments', 'task-attachments', true, 1000000, array[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]);

-- Security policy: Public can view attachments
drop policy if exists "Public can view attachments" on storage.objects;
create policy "Public can view attachments"
on storage.objects for select
using (bucket_id = 'task-attachments');

-- Security policy: Users can upload their own attachments
drop policy if exists "Users can upload their own attachments" on storage.objects;
create policy "Users can upload their own attachments"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'task-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Security policy: Users can delete their own attachments
drop policy if exists "Users can delete their own attachments" on storage.objects;
create policy "Users can delete their own attachments"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'task-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Grant necessary permissions
grant delete on storage.objects to authenticated;

-- Usage tracking
drop table if exists public.usage_tracking;
create table public.usage_tracking (
  user_id uuid references public.profiles on delete cascade,
  year_month text,
  api_calls integer default 0,
  storage_used integer default 0,
  resources_used integer default 0,
  primary key (user_id, year_month)
);

-- Security policy: Users can read their own usage tracking
drop policy if exists "Users can read own usage tracking" on public.usage_tracking;
create policy "Users can read own usage tracking"
on public.usage_tracking for select
using (auth.uid() = user_id);

-- Enable RLS for usage tracking
alter table public.usage_tracking enable row level security;

-- Stripe integration
do $$
begin
  if not exists (select 1 from pg_foreign_data_wrapper where fdwname = 'stripe_wrapper') then
    create foreign data wrapper stripe_wrapper
      handler stripe_fdw_handler
      validator stripe_fdw_validator;
  end if;
  
  if not exists (select 1 from pg_foreign_server where srvname = 'stripe_server') then
    create server stripe_server
    foreign data wrapper stripe_wrapper
    options (
      api_key_name 'stripe'
    );
  end if;
  
  if not exists (select 1 from information_schema.schemata where schema_name = 'stripe') then
    create schema stripe;
  end if;
end
$$;

-- Stripe customers table
do $$
begin
  if not exists (
    select 1 from information_schema.tables 
    where table_schema = 'stripe' and table_name = 'customers'
  ) then
    create foreign table stripe.customers (
      id text,
      email text,
      name text,
      description text,
      created timestamp,
      attrs jsonb
    )
    server stripe_server
    options (
      object 'customers',
      rowid_column 'id'
    );
  end if;
end
$$;

-- Function to check if Stripe is properly configured
create or replace function public.is_stripe_configured()
returns boolean
security definer
set search_path = public
as $$
declare
  stripe_enabled boolean := false;
begin
  begin
    -- Test if we can access the stripe schema and customers table
    perform 1 from stripe.customers limit 1;
    stripe_enabled := true;
  exception when others then
    -- If there's an error, Stripe is not properly configured
    stripe_enabled := false;
  end;
  
  return stripe_enabled;
end;
$$ language plpgsql;

-- Function to handle Stripe customer creation
create or replace function public.handle_stripe_customer_creation()
returns trigger
security definer
set search_path = public
as $$
declare
  customer_email text;
begin
  -- Skip Stripe integration if not configured
  if not public.is_stripe_configured() then
    return new;
  end if;

  -- Get user email
  begin
    select email into customer_email
    from auth.users
    where id = new.user_id;

    -- Create Stripe customer
    insert into stripe.customers (email, name)
    values (customer_email, new.name);
    
    -- Get the created customer ID from Stripe
    select id into new.stripe_customer_id
    from stripe.customers
    where email = customer_email
    order by created desc
    limit 1;
  exception when others then
    -- Log error but continue with user creation
    raise notice 'Failed to create Stripe customer: %', SQLERRM;
  end;
  
  return new;
end;
$$ language plpgsql;

-- Conditionally create the trigger only if Stripe is configured
drop trigger if exists create_stripe_customer_on_profile_creation on public.profiles;

do $$
begin
  if public.is_stripe_configured() then
    execute 'create trigger create_stripe_customer_on_profile_creation
      before insert on public.profiles
      for each row
      execute function public.handle_stripe_customer_creation()';
  end if;
end $$;

-- Function to handle Stripe customer deletion
create or replace function public.handle_stripe_customer_deletion()
returns trigger
security definer
set search_path = public
as $$
begin
  -- Skip Stripe integration if not configured
  if not public.is_stripe_configured() then
    return old;
  end if;

  if old.stripe_customer_id is not null then
    begin
      delete from stripe.customers where id = old.stripe_customer_id;
    exception when others then
      -- Log the error if needed, but continue with the deletion
      raise notice 'Failed to delete Stripe customer: %', SQLERRM;
    end;
  end if;
  return old;
end;
$$ language plpgsql;

-- Conditionally create the trigger only if Stripe is configured
drop trigger if exists delete_stripe_customer_on_profile_deletion on public.profiles;

do $$
begin
  if public.is_stripe_configured() then
    execute 'create trigger delete_stripe_customer_on_profile_deletion
      before delete on public.profiles
      for each row
      execute function public.handle_stripe_customer_deletion()';
  end if;
end $$;

-- Security policy: Users can read their own Stripe data
drop policy if exists "Users can read own Stripe data" on public.profiles;
create policy "Users can read own Stripe data"
  on public.profiles
  for select
  using (auth.uid() = user_id);
