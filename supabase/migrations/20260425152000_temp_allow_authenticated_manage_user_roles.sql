/*
@target user_roles
@action 临时放开 user_roles 的最小可用 RLS，保障用户-角色绑定可正常查询与更新
@date 2026-04-25
*/

-- Ensure RLS is enabled.
alter table if exists public.user_roles enable row level security;

-- Rebuild temp policies to keep migration idempotent.
drop policy if exists "TEMP Authenticated can select user roles" on public.user_roles;
drop policy if exists "TEMP Authenticated can insert user roles" on public.user_roles;
drop policy if exists "TEMP Authenticated can delete user roles" on public.user_roles;
drop policy if exists "Allow admins to manage user roles" on public.user_roles;

-- TEMP: minimum required privileges for current admin pages.
-- Current frontend update flow = select + delete + insert (no update statement).
create policy "TEMP Authenticated can select user roles" on public.user_roles
for select
to authenticated
using (true);

create policy "TEMP Authenticated can insert user roles" on public.user_roles
for insert
to authenticated
with check (true);

create policy "TEMP Authenticated can delete user roles" on public.user_roles
for delete
to authenticated
using (true);
