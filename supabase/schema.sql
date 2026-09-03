-- ==============================================================================
-- HIVE: Digital Suggestion Box for Local Governance
-- Supabase Database Schema, Functions, Triggers & Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked with Supabase Auth users)
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default 'Municipal Administrator',
  role text not null default 'admin' check (role in ('admin', 'moderator')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Authenticated users can read profiles"
  on public.profiles
  for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- Trigger: Automatically generate public profile upon Supabase auth.users signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Municipal Administrator'),
    'admin'
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, profiles.full_name);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. SUGGESTIONS TABLE (Public Civic Proposals)
-- ------------------------------------------------------------------------------
create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  reference_id text not null unique,
  category text not null check (category in (
    'Roads & Footpaths',
    'Street Lighting',
    'Waste Management',
    'Water & Sanitation',
    'Public Spaces',
    'Transport',
    'Education',
    'Environment',
    'Community Facilities',
    'Other'
  )),
  title text not null,
  description text not null,
  location_text text not null,
  photo_path text,
  photo_url text,
  contact_name text,
  contact_email text,
  contact_phone text,
  is_anonymous boolean not null default false,
  status text not null default 'submitted' check (status in (
    'submitted',
    'under_review',
    'accepted',
    'planned',
    'implemented',
    'rejected'
  )),
  support_count integer not null default 1,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indices for rapid filtering, search & sorting
create index if not exists idx_suggestions_reference_id on public.suggestions(reference_id);
create index if not exists idx_suggestions_status on public.suggestions(status);
create index if not exists idx_suggestions_category on public.suggestions(category);
create index if not exists idx_suggestions_created_at on public.suggestions(created_at desc);
create index if not exists idx_suggestions_support on public.suggestions(support_count desc);

-- Enable RLS on suggestions
alter table public.suggestions enable row level security;

-- Suggestions Policies
-- 1. Public can read suggestions (civic transparency)
create policy "Allow public read suggestions"
  on public.suggestions
  for select
  using (true);

-- 2. Anyone (anon or authenticated) can submit a suggestion with status 'submitted'
create policy "Allow public submit suggestion"
  on public.suggestions
  for insert
  with check (
    status = 'submitted' and
    reference_id ~* '^DSB-[0-9]{4}-[A-Z0-9]{6}$'
  );

-- 3. Anyone can increment support count for community endorsements
create policy "Allow public support count increment"
  on public.suggestions
  for update
  using (true)
  with check (true);

-- 4. Authenticated admins can update any suggestion (e.g. status, admin_notes)
create policy "Allow authenticated admin update suggestion"
  on public.suggestions
  for update
  to authenticated
  using (true)
  with check (true);

-- 5. Authenticated admins can delete suggestions if required
create policy "Allow authenticated admin delete suggestion"
  on public.suggestions
  for delete
  to authenticated
  using (true);

-- ------------------------------------------------------------------------------
-- 3. SUGGESTION STATUS HISTORY TABLE (Public Audit Trail & Stage Transitions)
-- ------------------------------------------------------------------------------
create table if not exists public.suggestion_status_history (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid not null references public.suggestions(id) on delete cascade,
  old_status text check (old_status is null or old_status in (
    'submitted', 'under_review', 'accepted', 'planned', 'implemented', 'rejected'
  )),
  new_status text not null check (new_status in (
    'submitted', 'under_review', 'accepted', 'planned', 'implemented', 'rejected'
  )),
  note text,
  changed_by text not null default 'Citizen Intake System',
  created_at timestamptz not null default now()
);

create index if not exists idx_history_suggestion_id on public.suggestion_status_history(suggestion_id);
create index if not exists idx_history_created_at on public.suggestion_status_history(created_at asc);

-- Enable RLS on suggestion_status_history
alter table public.suggestion_status_history enable row level security;

-- Status History Policies
-- 1. Public can view audit histories for transparency
create policy "Allow public read status history"
  on public.suggestion_status_history
  for select
  using (true);

-- 2. Anyone can insert initial status history when submitting a suggestion
create policy "Allow insert initial status history"
  on public.suggestion_status_history
  for insert
  with check (new_status = 'submitted');

-- 3. Authenticated admins can insert subsequent status history entries
create policy "Allow authenticated admin insert status history"
  on public.suggestion_status_history
  for insert
  to authenticated
  with check (true);

-- ------------------------------------------------------------------------------
-- 4. STORAGE BUCKET FOR SUGGESTION PHOTOS
-- ------------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('suggestion-photos', 'suggestion-photos', true)
on conflict (id) do nothing;

create policy "Allow public read of suggestion photos"
  on storage.objects
  for select
  using (bucket_id = 'suggestion-photos');

create policy "Allow public upload of suggestion photos"
  on storage.objects
  for insert
  with check (bucket_id = 'suggestion-photos');
