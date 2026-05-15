WITH help_root AS (
  SELECT id
  FROM permissions
  WHERE code = 'help'
),
component_root AS (
  INSERT INTO permissions (name, code, type, path, component, icon, sort, status, parent_id)
  SELECT
    '组件文档',
    'help:components',
    'menu',
    '/help/components',
    'Help/ComponentDocs',
    'tabler:binary-tree-2',
    30,
    true,
    id
  FROM help_root
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
),
upserted AS (
  INSERT INTO permissions (name, code, type, path, component, icon, sort, status, parent_id)
  SELECT '总览', 'help:components:overview', 'menu', '/help/components/overview', 'Help/ComponentDocs/Overview', 'tabler:layout-dashboard', 10, true, id FROM component_root
  UNION ALL
  SELECT 'PfButton', 'help:components:pf-button', 'menu', '/help/components/pf-button', 'Help/ComponentDocs/Detail', 'tabler:pointer', 20, true, id FROM component_root
  UNION ALL
  SELECT 'PfForm', 'help:components:pf-form', 'menu', '/help/components/pf-form', 'Help/ComponentDocs/Detail', 'tabler:forms', 30, true, id FROM component_root
  UNION ALL
  SELECT 'PfDataTable', 'help:components:pf-data-table', 'menu', '/help/components/pf-data-table', 'Help/ComponentDocs/Detail', 'tabler:table', 40, true, id FROM component_root
  UNION ALL
  SELECT 'PfModal', 'help:components:pf-modal', 'menu', '/help/components/pf-modal', 'Help/ComponentDocs/Detail', 'tabler:window-maximize', 50, true, id FROM component_root
  UNION ALL
  SELECT 'PfUpload', 'help:components:pf-upload', 'menu', '/help/components/pf-upload', 'Help/ComponentDocs/Detail', 'tabler:upload', 60, true, id FROM component_root
  UNION ALL
  SELECT 'PfTree', 'help:components:pf-tree', 'menu', '/help/components/pf-tree', 'Help/ComponentDocs/Detail', 'tabler:hierarchy-2', 70, true, id FROM component_root
  UNION ALL
  SELECT 'PfCard', 'help:components:pf-card', 'menu', '/help/components/pf-card', 'Help/ComponentDocs/Detail', 'tabler:cards', 80, true, id FROM component_root
  UNION ALL
  SELECT 'PfText', 'help:components:pf-text', 'menu', '/help/components/pf-text', 'Help/ComponentDocs/Detail', 'tabler:typography', 90, true, id FROM component_root
  UNION ALL
  SELECT 'PfSwitch', 'help:components:pf-switch', 'menu', '/help/components/pf-switch', 'Help/ComponentDocs/Detail', 'tabler:toggle-left', 100, true, id FROM component_root
  UNION ALL
  SELECT 'PfCheckbox', 'help:components:pf-checkbox', 'menu', '/help/components/pf-checkbox', 'Help/ComponentDocs/Detail', 'tabler:checkbox', 110, true, id FROM component_root
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
  WHERE code IN (
    'help:components',
    'help:components:overview',
    'help:components:pf-button',
    'help:components:pf-form',
    'help:components:pf-data-table',
    'help:components:pf-modal',
    'help:components:pf-upload',
    'help:components:pf-tree',
    'help:components:pf-card',
    'help:components:pf-text',
    'help:components:pf-switch',
    'help:components:pf-checkbox'
  )
) AS permissions
ON CONFLICT DO NOTHING;