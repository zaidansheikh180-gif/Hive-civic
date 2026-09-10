-- HIVE RLS performance hardening.
-- Wrap auth calls in SELECT so they are evaluated once per statement rather
-- than repeatedly per row, and add the missing support user foreign-key index.

begin;

create index if not exists idx_suggestion_supports_user_id
  on public.suggestion_supports(user_id);

drop policy if exists "Users can read own profile or admins read all" on public.profiles;
create policy "Users can read own profile or admins read all" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id or (select public.is_admin()));

drop policy if exists "Users can insert own profile as citizen" on public.profiles;
create policy "Users can insert own profile as citizen" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id and (role = 'citizen' or (select public.is_admin())));

drop policy if exists "Users can update own profile without elevating role" on public.profiles;
create policy "Users can update own profile without elevating role" on public.profiles
  for update to authenticated
  using ((select public.is_admin()) or (select auth.uid()) = id)
  with check ((select public.is_admin()) or ((select auth.uid()) = id and role = (select p.role from public.profiles p where p.id = (select auth.uid()))));

drop policy if exists "Citizens can submit their own suggestions" on public.suggestions;
create policy "Citizens can submit their own suggestions" on public.suggestions
  for insert to authenticated
  with check ((select auth.uid()) = user_id and status='submitted' and reference_id ~ '^DSB-[0-9]{4}-[A-Z0-9]{6}$');

drop policy if exists "Citizens can read own suggestions" on public.suggestions;
create policy "Citizens can read own suggestions" on public.suggestions
  for select to authenticated
  using ((select auth.uid()) = user_id or (select public.is_admin()));

drop policy if exists "Admins can update suggestions" on public.suggestions;
create policy "Admins can update suggestions" on public.suggestions
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Admins can delete suggestions" on public.suggestions;
create policy "Admins can delete suggestions" on public.suggestions
  for delete to authenticated using ((select public.is_admin()));

drop policy if exists "Citizens can read own status history" on public.suggestion_status_history;
create policy "Citizens can read own status history" on public.suggestion_status_history
  for select to authenticated
  using ((select public.is_admin()) or exists (
    select 1 from public.suggestions s
    where s.id = suggestion_id and s.user_id = (select auth.uid())
  ));

drop policy if exists "Users can read own supports" on public.suggestion_supports;
create policy "Users can read own supports" on public.suggestion_supports
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can create own supports" on public.suggestion_supports;
create policy "Users can create own supports" on public.suggestion_supports
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can remove own supports" on public.suggestion_supports;
create policy "Users can remove own supports" on public.suggestion_supports
  for delete to authenticated using ((select auth.uid()) = user_id);

commit;
