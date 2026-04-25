/*
@target roles, role_permissions
@action 修复角色管理相关 RLS，允许 admin/super_admin 执行角色与角色权限 CRUD
@date 2026-04-25
*/

-- Ensure RLS is enabled on role-related tables.
alter table if exists public.roles enable row level security;
alter table if exists public.role_permissions enable row level security;

-- Rebuild policies to keep migration idempotent.
drop policy if exists "Allow admins to manage roles" on public.roles;
drop policy if exists "Allow admins to manage role permissions" on public.role_permissions;

create policy "Allow admins to manage roles" on public.roles
for all
to authenticated
using (has_roles(array['admin', 'super_admin']))
with check (has_roles(array['admin', 'super_admin']));

create policy "Allow admins to manage role permissions" on public.role_permissions
for all
to authenticated
using (has_roles(array['admin', 'super_admin']))
with check (has_roles(array['admin', 'super_admin']));
