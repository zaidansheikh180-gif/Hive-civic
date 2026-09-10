import React, { useState } from 'react';
import { Database, Copy, Check, X, Shield, Terminal } from 'lucide-react';

const SQL_SCHEMA = `-- ==============================================================================
-- HIVE: Digital Suggestion Box for Local Governance
-- Supabase Database Schema, Profiles, Roles, RLS Policies & Storage
-- ==============================================================================

create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Supabase Auth user metadata & roles)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default 'Citizen',
  role text not null default 'citizen' check (role in ('citizen', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Helper function to check if current authenticated user has admin role
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Profiles Policies
create policy "Users can read own profile or admins read all"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

create policy "Users can insert own profile as citizen"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id and (role = 'citizen' or public.is_admin()));

create policy "Users can update own profile without elevating role"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (
    public.is_admin() or (
      auth.uid() = id and
      role = (select p.role from public.profiles p where p.id = auth.uid())
    )
  );

-- Trigger: Automatically generate public profile upon Supabase auth.users signup
-- SECURITY: All new registrations are strictly assigned 'citizen' role.
-- Admin elevation MUST be performed by an existing administrator or database operator.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Citizen'),
    'citizen' -- Strictly 'citizen' to prevent role-spoofing via user_metadata
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

-- 2. SUGGESTIONS TABLE (Civic Proposals & Infrastructure Reports)
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
  user_id uuid references auth.users(id) on delete set null,
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
  updated_at timestamptz not null default now(),
  constraint check_anonymous_contact check (
    not is_anonymous or (contact_name is null and contact_email is null and contact_phone is null)
  )
);

create index if not exists idx_suggestions_reference_id on public.suggestions(reference_id);
create index if not exists idx_suggestions_user_id on public.suggestions(user_id);
create index if not exists idx_suggestions_status on public.suggestions(status);
create index if not exists idx_suggestions_category on public.suggestions(category);
create index if not exists idx_suggestions_created_at on public.suggestions(created_at desc);
create index if not exists idx_suggestions_support on public.suggestions(support_count desc);

alter table public.suggestions enable row level security;

create policy "Allow public read suggestions"
  on public.suggestions
  for select
  using (true);

create policy "Allow authenticated users to submit suggestions"
  on public.suggestions
  for insert
  to authenticated
  with check (
    (auth.uid() = user_id or user_id is null) and
    status = 'submitted' and
    reference_id ~* '^DSB-[0-9]{4}-[A-Z0-9]{6}$'
  );

create policy "Allow admins to update suggestions"
  on public.suggestions
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Allow admins to delete suggestions"
  on public.suggestions
  for delete
  to authenticated
  using (public.is_admin());

-- Stored procedures for community support count
create or replace function public.increment_support(suggestion_id uuid)
returns integer as $$
declare
  updated_count integer;
begin
  update public.suggestions
  set support_count = support_count + 1
  where id = suggestion_id
  returning support_count into updated_count;

  return updated_count;
end;
$$ language plpgsql security definer;

create or replace function public.decrement_support(suggestion_id uuid)
returns integer as $$
declare
  updated_count integer;
begin
  update public.suggestions
  set support_count = greatest(1, support_count - 1)
  where id = suggestion_id
  returning support_count into updated_count;

  return updated_count;
end;
$$ language plpgsql security definer;

-- 3. SUGGESTION STATUS HISTORY TABLE (Tamper-evident Civic Audit Trail)
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

alter table public.suggestion_status_history enable row level security;

create policy "Allow public read status history"
  on public.suggestion_status_history
  for select
  using (true);

create policy "Allow insert initial status history on submission"
  on public.suggestion_status_history
  for insert
  to authenticated
  with check (
    new_status = 'submitted' and
    exists (
      select 1 from public.suggestions s
      where s.id = suggestion_id and (s.user_id = auth.uid() or s.user_id is null)
    )
  );

create policy "Allow admins to insert status history entries"
  on public.suggestion_status_history
  for insert
  to authenticated
  with check (public.is_admin());

-- 4. STORAGE BUCKET FOR SUGGESTION ATTACHMENT PHOTOS
insert into storage.buckets (id, name, public)
values ('suggestion-photos', 'suggestion-photos', true)
on conflict (id) do nothing;

create policy "Allow public read of suggestion photos"
  on storage.objects
  for select
  using (bucket_id = 'suggestion-photos');

create policy "Allow authenticated upload of suggestion photos"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'suggestion-photos');

create policy "Allow admins to delete suggestion photos"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'suggestion-photos' and public.is_admin());

-- 5. CANONICAL INITIAL SEED DATA (Safe Demonstration Records)
insert into public.suggestions (
  id, reference_id, title, description, category, location_text, status, support_count, is_anonymous, created_at
) values
(
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'DSB-2026-7F3K9P',
  'Install Pedestrian Crossing at 5th and Main',
  'Traffic volume has increased significantly since the opening of the community center. A marked pedestrian crosswalk with push-button illuminated signals is urgently needed.',
  'Roads & Footpaths',
  '5th Ave & Main St Intersection',
  'under_review',
  24,
  false,
  '2026-03-01 10:00:00+00'
),
(
  'c9a646d3-9c61-4cd7-9f51-75e964b96b7e',
  'DSB-2026-9B4X2T',
  'Repair Broken Streetlights on Oak Lane',
  'Three consecutive streetlights have been non-functional for over two weeks, creating severe visibility and safety hazards for nighttime pedestrians.',
  'Street Lighting',
  'Oak Lane between 2nd and 4th Avenue',
  'planned',
  42,
  false,
  '2026-03-02 14:30:00+00'
),
(
  'b5e86a01-2f78-4db8-8316-24838b93198e',
  'DSB-2026-5K1L8Q',
  'Community Garden Composting Station',
  'Add public sealed compost drop bins in Riverside Park to divert organic waste from local landfills and support the community garden project.',
  'Waste Management',
  'Riverside Park, North Horticultural Section',
  'implemented',
  67,
  true,
  '2026-02-20 09:15:00+00'
),
(
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'DSB-2026-8H2C6Y',
  'Upgrade Playground Lighting and Surface Rubber',
  'Replace aging sodium vapor floodlights with energy-efficient solar LED arrays and patch degraded rubber mulch under swings.',
  'Public Spaces',
  'Elmwood Community Park, West Playground',
  'under_review',
  15,
  false,
  '2026-03-03 11:00:00+00'
),
(
  'd4e5f6a1-b2c3-4d5e-8f9a-0b1c2d3e4f5a',
  'DSB-2026-3M7N2P',
  'Pothole Repair and Drainage Clearing on 12th Avenue',
  'Deep road depressions damaging vehicles and pooling stagnant stormwater adjacent to the rapid bus terminal.',
  'Roads & Footpaths',
  '12th Ave near Transit Interchange Hub',
  'submitted',
  31,
  false,
  '2026-03-04 08:45:00+00'
),
(
  'e6f7a8b9-c0d1-4e2f-8a3b-4c5d6e7f8a9b',
  'DSB-2026-1V4W9Z',
  'Community Center Secure Bicycle Lockers',
  'Install lockable bike lockers with CCTV coverage to promote green multi-modal transit for neighborhood commuters.',
  'Transport',
  'Civic Plaza Community Recreation Center',
  'implemented',
  53,
  true,
  '2026-02-15 16:20:00+00'
)
on conflict (reference_id) do nothing;

-- Initial status history entries
insert into public.suggestion_status_history (suggestion_id, old_status, new_status, note, changed_by, created_at)
values
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', null, 'submitted', 'Intake proposal registered into civic ledger.', 'Citizen Intake Portal', '2026-03-01 10:00:00+00'),
  ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'submitted', 'under_review', 'Forwarded to Department of Transportation traffic safety engineers for field observation.', 'Municipal Engineering Admin', '2026-03-02 11:15:00+00'),
  ('c9a646d3-9c61-4cd7-9f51-75e964b96b7e', null, 'submitted', 'Intake proposal registered.', 'Citizen Intake Portal', '2026-03-02 14:30:00+00'),
  ('c9a646d3-9c61-4cd7-9f51-75e964b96b7e', 'submitted', 'under_review', 'Electrical inspection completed; parts requisitioned.', 'Public Works Dispatcher', '2026-03-03 09:00:00+00'),
  ('c9a646d3-9c61-4cd7-9f51-75e964b96b7e', 'under_review', 'accepted', 'Approved for electrical maintenance crew dispatch.', 'Municipal Works Director', '2026-03-04 14:00:00+00'),
  ('c9a646d3-9c61-4cd7-9f51-75e964b96b7e', 'accepted', 'planned', 'Scheduled for bucket truck maintenance on Tuesday night shift.', 'Municipal Operations Lead', '2026-03-05 16:00:00+00'),
  ('b5e86a01-2f78-4db8-8316-24838b93198e', null, 'submitted', 'Intake proposal registered.', 'Citizen Intake Portal', '2026-02-20 09:15:00+00'),
  ('b5e86a01-2f78-4db8-8316-24838b93198e', 'submitted', 'implemented', 'Three bear-resistant compost containers installed and operational.', 'Parks & Recreation Supervisor', '2026-02-28 15:30:00+00'),
  ('d4e5f6a1-b2c3-4d5e-8f9a-0b1c2d3e4f5a', null, 'submitted', 'Intake proposal registered into civic ledger.', 'Citizen Intake Portal', '2026-03-04 08:45:00+00')
on conflict do nothing;

-- 6. HOW TO CREATE AN ADMINISTRATOR ACCOUNT
-- 1. Sign up through /auth/register or Supabase Auth.
-- 2. In Supabase SQL Editor run:
--    UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin@domain.gov';
`;

interface SchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchemaModal: React.FC<SchemaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col glass-panel border border-[#E7C226]/40 shadow-[0_0_50px_rgba(231,194,38,0.2)] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E7C226]/10 border border-[#E7C226]/30 flex items-center justify-center text-[#E7C226]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-helvetica uppercase text-white tracking-wide flex items-center gap-2">
                <span>Supabase Database Schema Setup</span>
                <span className="text-[10px] font-mono bg-[#E7C226]/15 text-[#E7C226] px-2 py-0.5 rounded border border-[#E7C226]/30">
                  SQL Ready
                </span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Tables: profiles, suggestions, suggestion_status_history, strict RLS & Storage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="px-5 py-3.5 bg-[#E7C226]/5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-neutral-300">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#E7C226] flex-shrink-0" />
            <span>1. Click &ldquo;Copy SQL Schema&rdquo; &rarr; 2. Open Supabase SQL Editor &rarr; 3. Run query.</span>
          </div>

          <button
            onClick={handleCopy}
            className="btn-cut px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 flex-shrink-0 shadow-[0_0_12px_rgba(231,194,38,0.3)]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy SQL Schema</span>
              </>
            )}
          </button>
        </div>

        {/* Code View */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#08080C] font-mono text-xs text-neutral-300">
          <pre className="whitespace-pre overflow-x-auto leading-relaxed selection:bg-[#E7C226] selection:text-black">
            {SQL_SCHEMA}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/40 text-xs font-mono">
          <span className="text-neutral-400">
            Filesystem location: <code className="text-[#E7C226]">/supabase/schema.sql</code>
          </span>
          <button
            onClick={onClose}
            className="btn-cut-border px-4 py-1.5 text-xs font-bold uppercase"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
