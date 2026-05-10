-- Reset permissions and role_permissions based on the current views structure.
-- New menu groups:
-- 1) 系统概览 (Admin)
-- 2) 系统管理 (Manage)
-- 3) 系统帮助 (Help)
--
-- Component convention:
-- Store folder path only (for example: Manage/Permission).
-- Frontend resolves it to /src/views/<component>/index.vue.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'permissions_code_key'
      AND conrelid = 'permissions'::regclass
  ) THEN
    ALTER TABLE permissions ADD CONSTRAINT permissions_code_key UNIQUE (code);
  END IF;
END $$;

DELETE FROM role_permissions
WHERE permission_id IN (SELECT id FROM permissions);

DELETE FROM permissions;

INSERT INTO permissions (name, code, type, path, component, icon, sort, status, parent_id)
VALUES
  ('系统概览', 'admin', 'menu', '/admin', NULL, 'tabler:layout-dashboard', 10, true, NULL),
  ('系统管理', 'manage', 'menu', '/manage', NULL, 'tabler:settings-cog', 20, true, NULL),
  ('系统帮助', 'help', 'menu', '/help', NULL, 'tabler:help-circle', 30, true, NULL);

WITH admin_root AS (
  SELECT id FROM permissions WHERE code = 'admin'
),
manage_root AS (
  SELECT id FROM permissions WHERE code = 'manage'
),
help_root AS (
  SELECT id FROM permissions WHERE code = 'help'
),
inserted AS (
  INSERT INTO permissions (name, code, type, path, component, icon, sort, status, parent_id)
  SELECT 'Dashboard', 'admin:dashboard', 'menu', '/admin/dashboard', 'Admin/Dashboard', 'tabler:dashboard', 10, true, id FROM admin_root
  UNION ALL
  SELECT '权限管理', 'manage:permission', 'menu', '/manage/permission', 'Manage/Permission', 'tabler:shield-lock', 10, true, id FROM manage_root
  UNION ALL
  SELECT '角色管理', 'manage:roles', 'menu', '/manage/roles', 'Manage/Roles', 'tabler:shield-check', 20, true, id FROM manage_root
  UNION ALL
  SELECT '用户管理', 'manage:user', 'menu', '/manage/user', 'Manage/User', 'tabler:users', 30, true, id FROM manage_root
  UNION ALL
  SELECT '设计规范', 'help:system', 'menu', '/help/system', 'Help/SystemHelp', 'tabler:book-2', 10, true, id FROM help_root
  UNION ALL
  SELECT '上传示例', 'help:upload', 'menu', '/help/upload', 'Help/UploadDemo', 'tabler:upload', 20, true, id FROM help_root
  RETURNING id, code
),
permission_node AS (
  SELECT id FROM inserted WHERE code = 'manage:permission'
),
roles_node AS (
  SELECT id FROM inserted WHERE code = 'manage:roles'
),
user_node AS (
  SELECT id FROM inserted WHERE code = 'manage:user'
),
design_node AS (
  SELECT id FROM inserted WHERE code = 'help:system'
)
INSERT INTO permissions (name, code, type, path, component, icon, sort, status, parent_id)
SELECT '新建权限', 'manage:permission:create', 'button', NULL, NULL, NULL, 1, true, id FROM permission_node
UNION ALL
SELECT '角色权限配置', 'manage:roles:permission', 'button', NULL, NULL, NULL, 1, true, id FROM roles_node
UNION ALL
SELECT '角色用户绑定', 'manage:roles:user', 'button', NULL, NULL, NULL, 2, true, id FROM roles_node
UNION ALL
SELECT '用户角色绑定', 'manage:user:role', 'button', NULL, NULL, NULL, 1, true, id FROM user_node
UNION ALL
SELECT '色彩规范', 'help:system:colors', 'menu', '/help/system/colors', 'Help/SystemHelp/Colors', 'tabler:palette', 10, true, id FROM design_node
UNION ALL
SELECT '排版与空间', 'help:system:foundation', 'menu', '/help/system/foundation', 'Help/SystemHelp/Foundation', 'tabler:spacing-horizontal', 20, true, id FROM design_node
UNION ALL
SELECT '组件规范', 'help:system:components', 'menu', '/help/system/components', 'Help/SystemHelp/Components', 'tabler:components', 30, true, id FROM design_node;

INSERT INTO role_permissions (role_code, permission_id)
SELECT r.role_code, p.id
FROM (VALUES ('super_admin'), ('system_admin')) AS r(role_code)
CROSS JOIN permissions p
ON CONFLICT DO NOTHING;
