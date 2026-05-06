/*
@target permissions, role_permissions
@action 重构系统管理菜单层级，新增通知系统分组
@date 2026-05-06
*/

do $$
declare
  manage_root_id int;
  access_root_id int;
  notification_root_id int;
begin
  select id into manage_root_id
  from public.permissions
  where code = 'manage';

  if manage_root_id is null then
    raise exception 'Permission code manage not found';
  end if;

  insert into public.permissions (name, code, type, path, component, icon, sort, status, parent_id, layout)
  values (
    '权限管理',
    'manage:access',
    'menu',
    '/manage/access',
    null,
    'tabler:shield-lock',
    10,
    true,
    manage_root_id,
    'admin'
  )
  on conflict (code) do update
  set name = excluded.name,
      type = excluded.type,
      path = excluded.path,
      component = excluded.component,
      icon = excluded.icon,
      sort = excluded.sort,
      status = excluded.status,
      parent_id = excluded.parent_id,
      layout = excluded.layout;

  insert into public.permissions (name, code, type, path, component, icon, sort, status, parent_id, layout)
  values (
    '通知系统',
    'manage:notification',
    'menu',
    '/manage/notification',
    null,
    'tabler:bell-ringing',
    20,
    true,
    manage_root_id,
    'admin'
  )
  on conflict (code) do update
  set name = excluded.name,
      type = excluded.type,
      path = excluded.path,
      component = excluded.component,
      icon = excluded.icon,
      sort = excluded.sort,
      status = excluded.status,
      parent_id = excluded.parent_id,
      layout = excluded.layout;

  select id into access_root_id
  from public.permissions
  where code = 'manage:access';

  select id into notification_root_id
  from public.permissions
  where code = 'manage:notification';

  update public.permissions
  set name = '权限配置',
      path = '/manage/access/permission',
      component = 'Manage/Permission',
      icon = 'tabler:shield-lock',
      sort = 10,
      status = true,
      parent_id = access_root_id,
      layout = 'admin'
  where code = 'manage:permission';

  update public.permissions
  set name = '角色管理',
      path = '/manage/access/roles',
      component = 'Manage/Roles',
      icon = 'tabler:shield-check',
      sort = 20,
      status = true,
      parent_id = access_root_id,
      layout = 'admin'
  where code = 'manage:roles';

  update public.permissions
  set name = '用户管理',
      path = '/manage/access/user',
      component = 'Manage/User',
      icon = 'tabler:users',
      sort = 30,
      status = true,
      parent_id = access_root_id,
      layout = 'admin'
  where code = 'manage:user';

  insert into public.permissions (name, code, type, path, component, icon, sort, status, parent_id, layout)
  values
    (
      '公告管理',
      'manage:notification:announcement',
      'menu',
      '/manage/notification/announcement',
      'Manage/Notification/Announcements',
      'tabler:speakerphone',
      10,
      true,
      notification_root_id,
      'admin'
    ),
    (
      '消息管理',
      'manage:notification:message',
      'menu',
      '/manage/notification/message',
      'Manage/Notification/Messages',
      'tabler:message-circle-2',
      20,
      true,
      notification_root_id,
      'admin'
    ),
    (
      '消息日志',
      'manage:notification:log',
      'menu',
      '/manage/notification/log',
      'Manage/Notification/Logs',
      'tabler:history',
      30,
      true,
      notification_root_id,
      'admin'
    )
  on conflict (code) do update
  set name = excluded.name,
      type = excluded.type,
      path = excluded.path,
      component = excluded.component,
      icon = excluded.icon,
      sort = excluded.sort,
      status = excluded.status,
      parent_id = excluded.parent_id,
      layout = excluded.layout;

  insert into public.role_permissions (role_code, permission_id)
  select role_list.role_code, permission_list.id
  from (values ('super_admin'), ('system_admin')) as role_list(role_code)
  cross join lateral (
    select id
    from public.permissions
    where code in (
      'manage:access',
      'manage:permission',
      'manage:roles',
      'manage:user',
      'manage:notification',
      'manage:notification:announcement',
      'manage:notification:message',
      'manage:notification:log'
    )
  ) as permission_list
  on conflict do nothing;
end $$;