-- Seed initial RBAC permissions for the Potato Template manage section.
--
-- Inserts permissions only if they don't already exist (idempotent via ON CONFLICT).
-- Permission tree:
--   管理中心 (menu, parent)
--   ├─ 权限管理       (menu)  code: manage:permission
--   │   └─ 新建权限   (button) code: manage:permission:create
--   ├─ 用户管理       (menu)  code: manage:user
--   │   └─ 角色管理   (button) code: manage:user:role
--   └─ 角色管理       (menu)  code: manage:roles
--       ├─ 权限配置   (button) code: manage:role:permission
--       └─ 用户管理   (button) code: manage:role:user

-- Ensure unique constraint on code exists to support ON CONFLICT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'permissions_code_key' AND conrelid = 'permissions'::regclass
  ) THEN
    ALTER TABLE permissions ADD CONSTRAINT permissions_code_key UNIQUE (code);
  END IF;
END $$;

-- 1. 管理中心 (parent menu group, no route path)
INSERT INTO permissions (name, code, type, path, component, icon, sort, status)
VALUES ('管理中心', 'manage', 'menu', '/manage', null, 'tabler:settings', 100, true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  path = EXCLUDED.path,
  icon = EXCLUDED.icon,
  sort = EXCLUDED.sort,
  status = EXCLUDED.status;

-- 2. 权限管理 (leaf menu page)
INSERT INTO permissions (name, code, type, path, component, icon, sort, status, parent_id)
SELECT '权限管理', 'manage:permission', 'menu',
       '/manage/permission', 'views/permission/PermissionSettings', 'tabler:shield', 10, true,
       p.id
FROM permissions p WHERE p.code = 'manage'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  path = EXCLUDED.path,
  component = EXCLUDED.component,
  icon = EXCLUDED.icon,
  sort = EXCLUDED.sort,
  status = EXCLUDED.status,
  parent_id = EXCLUDED.parent_id;

-- 3. 用户管理 (leaf menu page)
INSERT INTO permissions (name, code, type, path, component, icon, sort, status, parent_id)
SELECT '用户管理', 'manage:user', 'menu',
       '/manage/user', 'views/user/UserManage', 'tabler:user', 20, true,
       p.id
FROM permissions p WHERE p.code = 'manage'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  path = EXCLUDED.path,
  component = EXCLUDED.component,
  icon = EXCLUDED.icon,
  sort = EXCLUDED.sort,
  status = EXCLUDED.status,
  parent_id = EXCLUDED.parent_id;

-- 4. 角色管理 (leaf menu page)
INSERT INTO permissions (name, code, type, path, component, icon, sort, status, parent_id)
SELECT '角色管理', 'manage:roles', 'menu',
       '/manage/roles', 'views/roles/RoleSettings', 'tabler:shield-check', 30, true,
       p.id
FROM permissions p WHERE p.code = 'manage'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  path = EXCLUDED.path,
  component = EXCLUDED.component,
  icon = EXCLUDED.icon,
  sort = EXCLUDED.sort,
  status = EXCLUDED.status,
  parent_id = EXCLUDED.parent_id;

-- 5. Button: 新建权限
INSERT INTO permissions (name, code, type, path, component, icon, sort, status, parent_id)
SELECT '新建权限', 'manage:permission:create', 'button',
       null, null, null, 1, true,
       p.id
FROM permissions p WHERE p.code = 'manage:permission'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  parent_id = EXCLUDED.parent_id;

-- 6. Button: 用户角色管理
INSERT INTO permissions (name, code, type, path, component, icon, sort, status, parent_id)
SELECT '用户角色管理', 'manage:user:role', 'button',
       null, null, null, 1, true,
       p.id
FROM permissions p WHERE p.code = 'manage:user'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  parent_id = EXCLUDED.parent_id;

-- 7. Button: 角色权限配置
INSERT INTO permissions (name, code, type, path, component, icon, sort, status, parent_id)
SELECT '角色权限配置', 'manage:role:permission', 'button',
       null, null, null, 1, true,
       p.id
FROM permissions p WHERE p.code = 'manage:roles'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  parent_id = EXCLUDED.parent_id;

-- 8. Button: 角色用户管理
INSERT INTO permissions (name, code, type, path, component, icon, sort, status, parent_id)
SELECT '角色用户管理', 'manage:role:user', 'button',
       null, null, null, 2, true,
       p.id
FROM permissions p WHERE p.code = 'manage:roles'
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  parent_id = EXCLUDED.parent_id;

-- 9. 仪表盘 (public, 无 code 限制，但记录到权限表供参考)
INSERT INTO permissions (name, code, type, path, component, icon, sort, status)
VALUES ('仪表盘', 'admin:dashboard', 'menu', '/admin/dashboard', 'views/dashboard/index', 'tabler:dashboard', 1, true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  path = EXCLUDED.path,
  component = EXCLUDED.component,
  icon = EXCLUDED.icon,
  sort = EXCLUDED.sort,
  status = EXCLUDED.status;

-- 10. Assign all manage permissions to admin & super_admin roles
--     (skip if role_permissions already has the pair)
INSERT INTO role_permissions (role_code, permission_id)
SELECT r.role_code, p.id
FROM (VALUES ('super_admin'), ('system_admin')) AS r(role_code)
CROSS JOIN permissions p
WHERE p.code IN (
  'manage', 'manage:permission', 'manage:user', 'manage:roles',
  'manage:permission:create',
  'manage:user:role',
  'manage:role:permission', 'manage:role:user'
)
ON CONFLICT DO NOTHING;
