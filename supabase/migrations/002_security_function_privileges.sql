-- HIVE security verification follow-up.
-- The live Supabase project was verified to retain default API execution grants
-- after function creation. Explicitly restrict exposed SECURITY DEFINER functions.

begin;

revoke execute on function public.add_support(uuid) from anon, authenticated;
grant execute on function public.add_support(uuid) to authenticated;
revoke execute on function public.remove_support(uuid) from anon, authenticated;
grant execute on function public.remove_support(uuid) to authenticated;
revoke execute on function public.attach_suggestion_photo(uuid,text,text) from anon, authenticated;
grant execute on function public.attach_suggestion_photo(uuid,text,text) to authenticated;
revoke execute on function public.is_admin() from anon, authenticated;
grant execute on function public.is_admin() to authenticated;

revoke execute on function public.increment_support(uuid) from anon, authenticated;
revoke execute on function public.decrement_support(uuid) from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.record_suggestion_history() from anon, authenticated;

alter function public.increment_support(uuid) set search_path=public;
alter function public.decrement_support(uuid) set search_path=public;
alter function public.handle_new_user() set search_path=public;

commit;
