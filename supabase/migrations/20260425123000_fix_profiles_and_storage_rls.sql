/*
@target profiles, storage.objects, storage.buckets
@action 修复用户管理与头像上传相关的 RLS，保障 assets 桶上传/下载/预览可用
@date 2026-04-25
*/

-- Ensure base table RLS is enabled.
alter table if exists public.profiles enable row level security;

-- Rebuild profile policies to support both self-service and admin management.
drop policy if exists "Allow users to select their own profile" on public.profiles;
drop policy if exists "TEMP Allow authenticated users to insert profiles" on public.profiles;
drop policy if exists "TEMP Allow authenticated users to update profiles" on public.profiles;
drop policy if exists "Allow users to insert their own profile" on public.profiles;
drop policy if exists "Allow users to update their own profile" on public.profiles;
drop policy if exists "Allow admins to manage all profiles" on public.profiles;

create policy "Allow users to select their own profile" on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Allow users to insert their own profile" on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Allow users to update their own profile" on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Allow admins to manage all profiles" on public.profiles
for all
to authenticated
using (has_roles(array['admin', 'super_admin']))
with check (has_roles(array['admin', 'super_admin']));

-- Ensure assets bucket exists and is public for preview URL access.
insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do update
set public = excluded.public;

-- Configure object-level policies for upload/delete operations.
-- NOTE: storage.objects is managed by Supabase internal owner role in some environments,
-- so avoid ALTER TABLE here to keep migration executable with limited privileges.

drop policy if exists "Public can view assets" on storage.objects;
drop policy if exists "Authenticated can upload assets" on storage.objects;
drop policy if exists "Authenticated can update assets" on storage.objects;
drop policy if exists "Authenticated can delete assets" on storage.objects;

-- Public read is required for direct preview links in UI.
create policy "Public can view assets" on storage.objects
for select
to public
using (bucket_id = 'assets');

-- Allow authenticated users to upload avatar objects into assets bucket.
create policy "Authenticated can upload assets" on storage.objects
for insert
to authenticated
with check (bucket_id = 'assets');

-- Allow authenticated users to edit/remove objects in assets bucket.
create policy "Authenticated can update assets" on storage.objects
for update
to authenticated
using (bucket_id = 'assets')
with check (bucket_id = 'assets');

create policy "Authenticated can delete assets" on storage.objects
for delete
to authenticated
using (bucket_id = 'assets');
