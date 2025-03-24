-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists wrappers with schema extensions;

-- User Profile table (extends Supabase auth.users)
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  subscription_plan text check (subscription_plan in ('free', 'premium')) default 'free',
  tasks_limit integer default 100,
  stripe_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Function to create profile for new (auth) users
create or replace function public.handle_new_user() 
returns trigger
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql;

-- Trigger to create profile for new (auth) users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Security policy: Users can read their own profile
create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = user_id);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Create storage bucket with size and MIME type restrictions
do $$
begin
  if exists (
    select 1 from storage.buckets where id = 'task-attachments'
  ) then
    -- Delete all objects in bucket first
    delete from storage.objects where bucket_id = 'task-attachments';
    -- Then delete bucket
    delete from storage.buckets where id = 'task-attachments';
  end if;
end $$;

-- Create storage bucket with size and MIME type restrictions
insert into storage.buckets (
  id, 
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'task-attachments',
  'task-attachments',
  true,
  1000000, -- 1MB in bytes
  array[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
);

-- Security policy: Public can view attachments
create policy "Public can view attachments"
on storage.objects for select
using (bucket_id = 'task-attachments');

-- Security policy: Users can upload their own attachments
create policy "Users can upload their own attachments"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'task-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Security policy: Users can delete their own attachments
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
create table public.usage_tracking (
  user_id uuid references public.profiles on delete cascade,
  year_month text,
  tasks_created integer default 0,
  primary key (user_id, year_month)
);

-- Security policy: Users can read their own usage tracking
create policy "Users can read own usage tracking"
on public.usage_tracking for select
using (auth.uid() = user_id);

-- Enable RLS for usage tracking
alter table public.usage_tracking enable row level security;

-- Stripe integration
create foreign data wrapper stripe_wrapper
  handler stripe_fdw_handler
  validator stripe_fdw_validator;

create server stripe_server
foreign data wrapper stripe_wrapper
options (
  api_key_name 'stripe'
);

create schema stripe;

-- Stripe customers table
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

-- Function to handle Stripe customer creation
create or replace function public.handle_stripe_customer_creation()
returns trigger
security definer
set search_path = public
as $$
declare
  customer_email text;
begin
  -- Get user email
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
  
  return new;
end;
$$ language plpgsql;

-- Trigger to create Stripe customer on profile creation
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
begin
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

-- Trigger to delete Stripe customer on profile deletion
create trigger delete_stripe_customer_on_profile_deletion
  before delete on public.profiles
  for each row
  execute function public.handle_stripe_customer_deletion();

-- Security policy: Users can read their own Stripe data
create policy "Users can read own Stripe data"
  on public.profiles
  for select
  using (auth.uid() = user_id);
