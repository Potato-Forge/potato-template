/*
@target role_permissions
@action 为 admin 角色补齐系统管理与通知系统菜单权限
@date 2026-05-06
*/

insert into public.role_permissions (role_code, permission_id)
select existing_roles.code, permission_list.id
from public.roles as existing_roles
cross join lateral (
  select id
  from public.permissions
  where code in (
    'manage',
    'manage:access',
    'manage:permission',
    'manage:roles',
    'manage:user',
    'manage:permission:create',
    'manage:user:role',
    'manage:role:permission',
    'manage:role:user',
    'manage:notification',
    'manage:notification:announcement',
    'manage:notification:message',
    'manage:notification:log'
  )
) as permission_list
where existing_roles.code in ('admin', 'system_admin', 'super_admin')
on conflict do nothing;