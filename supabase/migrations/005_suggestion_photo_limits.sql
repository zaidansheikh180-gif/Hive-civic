-- Apply after the existing schema and migrations 001-004, with the matching
-- client release. This file is not evidence that it has run on live Supabase.
begin;

-- Existing objects remain readable; new uploads have a 5 MiB ceiling and a
-- MIME allowlist enforced by Storage, not merely by the browser.
do $$ begin
  if not exists (select 1 from storage.buckets where id = 'suggestion-photos') then
    raise exception 'suggestion-photos bucket not found';
  end if;
end $$;

update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png']::text[]
where id = 'suggestion-photos';

-- Keep the existing public read and admin delete policies; replace only the
-- broad upload policy. Object names must be <owner uuid>/<suggestion uuid>/<file>.
drop policy if exists "Allow authenticated upload of suggestion photos" on storage.objects;
create policy "Owner uploads own submitted suggestion photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'suggestion-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and array_length(storage.foldername(name), 1) = 2
    and name ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png)$'
    and exists (
      select 1 from public.suggestions s
      where s.id::text = (storage.foldername(name))[2]
        and s.user_id = (select auth.uid()) and s.status = 'submitted'
    )
  );

-- Remove the three-argument function that trusted a caller-supplied URL.
-- Read services derive the public URL from the verified path and the
-- configured Supabase client. Preserve legacy stored URLs on existing rows.
-- Existing grants on this signature are removed with the function.
drop function if exists public.attach_suggestion_photo(uuid, text, text);
create function public.attach_suggestion_photo(p_suggestion_id uuid, p_photo_path text)
returns public.suggestions language plpgsql security definer set search_path = ''
as $$
declare result_row public.suggestions;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  if p_photo_path !~* ('^' || (select auth.uid())::text || '/' || p_suggestion_id::text || '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png)$') then
    raise exception 'Invalid photo path';
  end if;
  if not exists (
    select 1 from storage.objects o
    where o.bucket_id = 'suggestion-photos' and o.name = p_photo_path
      and o.owner_id = (select auth.uid())::text
  ) then raise exception 'Photo object not found for current user'; end if;
  update public.suggestions
  set photo_path = p_photo_path, photo_url = null, updated_at = now()
  where id = p_suggestion_id and user_id = (select auth.uid()) and status = 'submitted'
  returning * into result_row;
  if result_row.id is null then raise exception 'Suggestion not found or not owned by current user'; end if;
  return result_row;
end;
$$;
-- Supabase can have direct API-role default grants in addition to PUBLIC.
-- Revoke every default route before granting only the signed-in role.
revoke all on function public.attach_suggestion_photo(uuid, text) from public, anon, authenticated;
grant execute on function public.attach_suggestion_photo(uuid, text) to authenticated;

-- The hardened public view in migration 001 exposed only photo_url. New rows
-- store a verified path instead; append photo_path so public feed/tracking can
-- derive the URL without letting callers supply an arbitrary host. This path
-- contains the uploader UUID and is therefore publicly visible with the photo.
create or replace view public.public_suggestions with (security_invoker = false) as
select id, reference_id, category, title, description, location_text,
       photo_url, is_anonymous, status, support_count, created_at, updated_at,
       photo_path
from public.suggestions;
grant select on public.public_suggestions to anon, authenticated;

commit;
