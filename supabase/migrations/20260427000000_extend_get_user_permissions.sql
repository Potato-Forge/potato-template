-- Extends get_user_permissions() to return full route/menu fields
-- required for dynamic route loading in the frontend.
--
-- Returns per-permission:
--   p_id, p_code, p_name, p_parent_id, p_type  (existing)
--   p_path, p_component, p_icon, p_is_hidden, p_sort  (new)

create or replace function get_user_permissions()
returns table (
  p_id         int,
  p_code       text,
  p_name       text,
  p_parent_id  int,
  p_type       text,
  p_path       text,
  p_component  text,
  p_icon       text,
  p_is_hidden  boolean,
  p_sort       int
)
language sql
security definer
stable
as $$
  select
    p.id          as p_id,
    p.code        as p_code,
    p.name        as p_name,
    p.parent_id   as p_parent_id,
    p.type        as p_type,
    p.path        as p_path,
    p.component   as p_component,
    p.icon        as p_icon,
    coalesce(p.is_hidden, false) as p_is_hidden,
    coalesce(p.sort, 0) as p_sort
  from permissions p
  inner join role_permissions rp on rp.permission_id = p.id
  inner join user_roles ur on ur.role_code = rp.role_code
  where ur.user_id = auth.uid()
    and coalesce(p.status, true) = true
  order by p_sort asc, p_id asc
$$;

comment on function get_user_permissions() is
  'Returns the full set of active permissions for the currently authenticated user, '
  'including routing fields (path, component) needed for dynamic route generation. '
  'Duplicates across multiple roles are deduplicated by the INNER JOIN + ORDER BY.';
