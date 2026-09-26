-- Profile self-service: signed-in users may update only their own display name.
-- Apply after 003_rls_performance_hardening.sql. Database operators can still
-- assign admin/moderator roles via the SQL Editor; client JWTs cannot.
begin;

-- RLS limits rows, not columns. Restrict the authenticated database role to
-- full_name so a forged client cannot edit role, email or another profile field.
revoke update on public.profiles from public, anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

-- Admin privileges to edit another user's profile aren't needed for self-service.
drop policy if exists "Users can update own profile without elevating role" on public.profiles;
create policy "Users can update own display name" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

commit;
