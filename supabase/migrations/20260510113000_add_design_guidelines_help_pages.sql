UPDATE permissions
SET
  name = '设计规范',
  path = '/help/system',
  component = 'Help/SystemHelp',
  icon = 'tabler:book-2'
WHERE code = 'help:system';

WITH design_root AS (
  SELECT id
  FROM permissions
  WHERE code = 'help:system'
),
upserted AS (
  INSERT INTO permissions (name, code, type, path, component, icon, sort, status, parent_id)
  SELECT '色彩规范', 'help:system:colors', 'menu', '/help/system/colors', 'Help/SystemHelp/Colors', 'tabler:palette', 10, true, id FROM design_root
  UNION ALL
  SELECT '排版与空间', 'help:system:foundation', 'menu', '/help/system/foundation', 'Help/SystemHelp/Foundation', 'tabler:spacing-horizontal', 20, true, id FROM design_root
  UNION ALL
  SELECT '组件规范', 'help:system:components', 'menu', '/help/system/components', 'Help/SystemHelp/Components', 'tabler:components', 30, true, id FROM design_root
  ON CONFLICT (code) DO UPDATE
  SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    path = EXCLUDED.path,
    component = EXCLUDED.component,
    icon = EXCLUDED.icon,
    sort = EXCLUDED.sort,
    status = EXCLUDED.status,
    parent_id = EXCLUDED.parent_id
  RETURNING id
)
INSERT INTO role_permissions (role_code, permission_id)
SELECT roles.role_code, permissions.id
FROM (VALUES ('super_admin'), ('system_admin')) AS roles(role_code)
CROSS JOIN LATERAL (
  SELECT id
  FROM permissions
  WHERE code IN ('help:system', 'help:system:colors', 'help:system:foundation', 'help:system:components')
) AS permissions
ON CONFLICT DO NOTHING;