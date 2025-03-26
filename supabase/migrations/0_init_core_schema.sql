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
  email_preferences jsonb default '{"marketing": false, "product_updates": true, "security": true}'::jsonb,
  tasks_created integer default 0,
  tasks_limit integer default 10,
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

-- Create generic storage bucket with size and MIME type restrictions
-- First, try a direct insert approach
insert into storage.buckets (id, name)
values ('app-storage', 'app-storage')
on conflict (id) do nothing;

-- Note: Skipping bucket property updates as they're not supported in this version

-- Log the operation
do $$
begin
  raise notice 'Storage bucket app-storage created or updated';
end $$;

-- Security policy: Public can view files
drop policy if exists "Public can view files" on storage.objects;
create policy "Public can view files"
on storage.objects for select
using (bucket_id = 'app-storage');

-- Security policy: Users can upload their own files
drop policy if exists "Users can upload their own files" on storage.objects;
create policy "Users can upload their own files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'app-storage'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Security policy: Users can delete their own files
drop policy if exists "Users can delete their own files" on storage.objects;
create policy "Users can delete their own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'app-storage'
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
  storage_used numeric(10,2) default 0,
  resources_used integer default 0,
  projects_created integer default 0,
  last_active timestamp with time zone default timezone('utc'::text, now()),
  primary key (user_id, year_month)
);

-- Security policy: Users can read their own usage tracking
drop policy if exists "Users can read own usage tracking" on public.usage_tracking;
create policy "Users can read own usage tracking"
on public.usage_tracking for select
using (auth.uid() = user_id);

-- Enable RLS for usage tracking
alter table public.usage_tracking enable row level security;

-- Function to update user profile
create or replace function public.update_user_profile(
  p_user_id uuid,
  p_name text,
  p_email_preferences jsonb default null
)
returns public.profiles
security definer
set search_path to public
as $$
declare
  updated_profile public.profiles;
begin
  update public.profiles
  set 
    name = coalesce(p_name, name),
    email_preferences = coalesce(p_email_preferences, email_preferences),
    updated_at = timezone('utc'::text, now())
  where user_id = p_user_id
  returning * into updated_profile;
  
  return updated_profile;
end;
$$ language plpgsql;

-- Security policy: Users can update their own profile
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = user_id);

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
  stripe_enabled boolean;
begin
  -- Check if Stripe is properly configured
  begin
    -- Test if we can access the stripe schema and customers table
    perform 1 from stripe.customers limit 1;
    stripe_enabled := true;
  exception when others then
    -- If there's an error, Stripe is not properly configured
    stripe_enabled := false;
  end;

  -- Skip Stripe integration if not configured
  if not stripe_enabled then
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

-- Create the trigger but make the function handle the Stripe configuration check
create trigger create_stripe_customer_on_profile_creation
  before insert on public.profiles
  for each row
  execute function public.handle_stripe_customer_creation();

-- Function to handle Stripe customer deletion
create or replace function public.handle_stripe_customer_deletion()
returns trigger
security definer
set search_path = public
as $$
declare
  stripe_enabled boolean;
begin
  -- Check if Stripe is properly configured
  begin
    -- Test if we can access the stripe schema and customers table
    perform 1 from stripe.customers limit 1;
    stripe_enabled := true;
  exception when others then
    -- If there's an error, Stripe is not properly configured
    stripe_enabled := false;
  end;

  -- Skip Stripe integration if not configured
  if not stripe_enabled then
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

-- Create the trigger but make the function handle the Stripe configuration check
create trigger delete_stripe_customer_on_profile_deletion
  before delete on public.profiles
  for each row
  execute function public.handle_stripe_customer_deletion();

-- Security policy: Users can read their own Stripe data
drop policy if exists "Users can read own Stripe data" on public.profiles;
create policy "Users can read own Stripe data"
  on public.profiles
  for select
  using (auth.uid() = user_id);

-- Function to track user activity and update usage metrics
create or replace function public.track_user_activity(
  p_user_id uuid,
  p_storage_delta numeric(10,2) default 0,
  p_api_calls_delta integer default 1,
  p_resources_delta integer default 0,
  p_projects_delta integer default 0
)
returns void
security definer
set search_path to public
as $$
declare
  current_year_month text := to_char(now(), 'YYYY-MM');
begin
  -- Update or insert usage tracking record
  insert into public.usage_tracking (
    user_id, 
    year_month, 
    api_calls, 
    storage_used, 
    resources_used,
    projects_created,
    last_active
  )
  values (
    p_user_id, 
    current_year_month, 
    p_api_calls_delta, 
    p_storage_delta, 
    p_resources_delta,
    p_projects_delta,
    now()
  )
  on conflict (user_id, year_month) do update
  set 
    api_calls = usage_tracking.api_calls + p_api_calls_delta,
    storage_used = usage_tracking.storage_used + p_storage_delta,
    resources_used = usage_tracking.resources_used + p_resources_delta,
    projects_created = usage_tracking.projects_created + p_projects_delta,
    last_active = now();
end;
$$ language plpgsql;

-- Security policy: Users can update their own usage tracking
drop policy if exists "Users can update own usage tracking" on public.usage_tracking;
create policy "Users can update own usage tracking"
on public.usage_tracking for update
using (auth.uid() = user_id);
