/*
@target permissions, role_permissions
@action 新增组织管理菜单及按钮权限，归属于 manage:access 分组
@date 2026-05-06
*/

do $$
declare
  access_root_id int;
  org_node_id    int;
begin
  -- Locate the access group
  select id into access_root_id
  from public.permissions
  where code = 'manage:access';

  if access_root_id is null then
    raise exception 'Permission code manage:access not found. Ensure migration 20260506100000 has been applied.';
  end if;

  -- Insert the organization management menu page
  insert into public.permissions (name, code, type, path, component, icon, sort, status, parent_id, layout)
  values (
    '组织管理',
    'manage:organization',
    'menu',
    '/manage/access/organization',
    'Manage/Organization',
    'tabler:building-community',
    40,
    true,
    access_root_id,
    'admin'
  )
  on conflict (code) do update
  set name      = excluded.name,
      type      = excluded.type,
      path      = excluded.path,
      component = excluded.component,
      icon      = excluded.icon,
      sort      = excluded.sort,
      status    = excluded.status,
      parent_id = excluded.parent_id,
      layout    = excluded.layout;

  -- Fetch the newly inserted/updated org node id
  select id into org_node_id
  from public.permissions
  where code = 'manage:organization';

  -- Insert button-level permissions
  insert into public.permissions (name, code, type, path, component, icon, sort, status, parent_id, layout)
  values
    ('成员管理', 'manage:organization:member', 'button', null, null, null, 1, true, org_node_id, 'admin'),
    ('角色绑定', 'manage:organization:role',   'button', null, null, null, 2, true, org_node_id, 'admin')
  on conflict (code) do update
  set name      = excluded.name,
      sort      = excluded.sort,
      status    = excluded.status,
      parent_id = excluded.parent_id;

  -- Grant all above permissions to admin roles
  insert into public.role_permissions (role_code, permission_id)
  select role_list.role_code, perm.id
  from (values ('super_admin'), ('system_admin')) as role_list(role_code)
  cross join lateral (
    select id
    from public.permissions
    where code in (
      'manage:organization',
      'manage:organization:member',
      'manage:organization:role'
    )
  ) as perm
  on conflict do nothing;
end $$;
