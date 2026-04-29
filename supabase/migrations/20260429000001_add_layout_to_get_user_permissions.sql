drop function if exists get_user_permissions();

create function get_user_permissions()
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
  p_sort       int,
  p_layout     text
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
    coalesce(p.sort, 0) as p_sort,
    p.layout      as p_layout
  from permissions p
  inner join role_permissions rp on rp.permission_id = p.id
  inner join user_roles ur on ur.role_code = rp.role_code
  where ur.user_id = auth.uid()
    and coalesce(p.status, true) = true
  order by p_sort asc, p_id asc
$$;

comment on function get_user_permissions() is
  'Returns the full set of active permissions for the currently authenticated user, '
  'including routing fields and layout metadata needed for dynamic route generation.';