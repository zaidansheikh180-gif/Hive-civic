-- HIVE security hardening migration
-- Apply after the existing supabase/schema.sql.
-- The migration is intentionally additive/reversible in concept: it replaces
-- broad policies, adds safe public projections, and moves sensitive mutations
-- behind ownership/role checks.

begin;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('citizen', 'admin'));

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Suggestions: citizens can read their own rows; admins can read all.
drop policy if exists "Allow public read suggestions" on public.suggestions;
drop policy if exists "Allow authenticated users to submit suggestions" on public.suggestions;
drop policy if exists "Citizens can submit their own suggestions" on public.suggestions;
create policy "Citizens can submit their own suggestions" on public.suggestions
  for insert to authenticated
  with check ((auth.uid() = user_id or user_id is null) and status = 'submitted'
    and reference_id ~ '^DSB-[0-9]{4}-[A-Z0-9]{6}$');

drop policy if exists "Citizens can read own suggestions" on public.suggestions;
create policy "Citizens can read own suggestions" on public.suggestions
  for select to authenticated using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Allow admins to update suggestions" on public.suggestions;
drop policy if exists "Admins can update suggestions" on public.suggestions;
create policy "Admins can update suggestions" on public.suggestions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Allow admins to delete suggestions" on public.suggestions;
drop policy if exists "Admins can delete suggestions" on public.suggestions;
create policy "Admins can delete suggestions" on public.suggestions
  for delete to authenticated using (public.is_admin());

-- Safe public projection deliberately excludes user_id, contact details,
-- admin_notes, and storage internals.
drop view if exists public.public_suggestions;
create view public.public_suggestions with (security_invoker = false) as
select id, reference_id, category, title, description, location_text,
       photo_url, is_anonymous, status, support_count, created_at, updated_at
from public.suggestions;
revoke all on public.suggestions from anon;
grant select on public.public_suggestions to anon, authenticated;

-- Status history is written by database triggers, not by arbitrary clients.
drop policy if exists "Allow public read status history" on public.suggestion_status_history;
drop policy if exists "Allow insert initial status history on submission" on public.suggestion_status_history;
drop policy if exists "Citizens can insert initial history for own submission" on public.suggestion_status_history;
drop policy if exists "Allow admins to insert status history entries" on public.suggestion_status_history;
drop policy if exists "Admins can insert status history entries" on public.suggestion_status_history;

drop policy if exists "Citizens can read own status history" on public.suggestion_status_history;
create policy "Citizens can read own status history" on public.suggestion_status_history
  for select to authenticated using (
    public.is_admin() or exists (
      select 1 from public.suggestions s
      where s.id = suggestion_id and s.user_id = auth.uid()
    )
  );

create or replace function public.record_suggestion_history()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.suggestion_status_history
      (suggestion_id, old_status, new_status, note, changed_by)
    values (new.id, null, new.status, 'Civic suggestion registered in HIVE.', 'Citizen Intake System');
    return new;
  end if;

  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into public.suggestion_status_history
      (suggestion_id, old_status, new_status, note, changed_by)
    values (
      new.id,
      old.status,
      new.status,
      'Status transitioned from ' || replace(old.status, '_', ' ') || ' to ' || replace(new.status, '_', ' ') || '.',
      coalesce(auth.uid()::text, 'System')
    );
  end if;
  return new;
end;
$$;

drop trigger if exists suggestion_initial_history on public.suggestions;
create trigger suggestion_initial_history after insert on public.suggestions
  for each row execute function public.record_suggestion_history();
drop trigger if exists suggestion_status_history_trigger on public.suggestions;
create trigger suggestion_status_history_trigger after update of status on public.suggestions
  for each row execute function public.record_suggestion_history();

revoke all on public.suggestion_status_history from anon;

drop view if exists public.public_suggestion_status_history;
create view public.public_suggestion_status_history with (security_invoker = false) as
select id, suggestion_id, old_status, new_status, note, created_at
from public.suggestion_status_history;
grant select on public.public_suggestion_status_history to anon, authenticated;

-- Photo attachment is performed through an ownership-checked RPC because the
-- citizen UPDATE policy intentionally does not permit arbitrary column changes.
create or replace function public.attach_suggestion_photo(
  p_suggestion_id uuid, p_photo_path text, p_photo_url text
)
returns public.suggestions language plpgsql security definer set search_path = public
as $$
declare result_row public.suggestions;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.suggestions
  set photo_path = p_photo_path, photo_url = p_photo_url, updated_at = now()
  where id = p_suggestion_id and user_id = auth.uid() and status = 'submitted'
  returning * into result_row;
  if result_row.id is null then raise exception 'Suggestion not found or not owned by current user'; end if;
  return result_row;
end;
$$;
revoke execute on function public.attach_suggestion_photo(uuid, text, text) from public;
grant execute on function public.attach_suggestion_photo(uuid, text, text) to authenticated;

-- User-bound community support prevents one browser from repeatedly inflating
-- the counter. The existing support_count remains the aggregate display value.
create table if not exists public.suggestion_supports (
  suggestion_id uuid not null references public.suggestions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (suggestion_id, user_id)
);
alter table public.suggestion_supports enable row level security;

drop policy if exists "Users can read own supports" on public.suggestion_supports;
create policy "Users can read own supports" on public.suggestion_supports
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can create own supports" on public.suggestion_supports;
create policy "Users can create own supports" on public.suggestion_supports
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can remove own supports" on public.suggestion_supports;
create policy "Users can remove own supports" on public.suggestion_supports
  for delete to authenticated using (auth.uid() = user_id);

create or replace function public.add_support(p_suggestion_id uuid)
returns integer language plpgsql security definer set search_path = public
as $$
declare result_count integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.suggestion_supports (suggestion_id, user_id)
    values (p_suggestion_id, auth.uid()) on conflict do nothing;
  if not found then
    select support_count into result_count from public.suggestions where id = p_suggestion_id;
    return coalesce(result_count, 0);
  end if;
  update public.suggestions set support_count = support_count + 1, updated_at = now()
    where id = p_suggestion_id returning support_count into result_count;
  return coalesce(result_count, 0);
end;
$$;

create or replace function public.remove_support(p_suggestion_id uuid)
returns integer language plpgsql security definer set search_path = public
as $$
declare result_count integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  delete from public.suggestion_supports where suggestion_id = p_suggestion_id and user_id = auth.uid();
  if not found then
    select support_count into result_count from public.suggestions where id = p_suggestion_id;
    return coalesce(result_count, 0);
  end if;
  update public.suggestions set support_count = greatest(1, support_count - 1), updated_at = now()
    where id = p_suggestion_id returning support_count into result_count;
  return coalesce(result_count, 0);
end;
$$;
revoke execute on function public.add_support(uuid) from public;
revoke execute on function public.remove_support(uuid) from public;
grant execute on function public.add_support(uuid) to authenticated;
grant execute on function public.remove_support(uuid) to authenticated;

-- Legacy support RPCs remain callable only by authenticated users; the frontend
-- no longer uses them because toggleSupport is now user-bound.
revoke execute on function public.increment_support(uuid) from public;
revoke execute on function public.decrement_support(uuid) from public;
grant execute on function public.increment_support(uuid) to authenticated;
grant execute on function public.decrement_support(uuid) to authenticated;

commit;
