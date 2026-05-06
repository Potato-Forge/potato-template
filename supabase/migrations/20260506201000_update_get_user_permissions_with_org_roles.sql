-- Updates get_user_permissions() to also include permissions inherited via
-- organization membership:
--   auth.uid() → org_members → org_roles → role_permissions → permissions
--
-- The two paths are UNIONed (deduped) so the return signature stays identical.

drop function if exists get_user_permissions();

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
  -- Path 1: direct user_roles
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

  union

  -- Path 2: org membership → org default roles
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
  inner join role_permissions rp  on rp.permission_id = p.id
  inner join org_roles        orr on orr.role_code     = rp.role_code
  inner join org_members      om  on om.org_id         = orr.org_id
  inner join organizations    o   on o.id              = om.org_id
  where om.user_id = auth.uid()
    and coalesce(o.status, true) = true
    and coalesce(p.status, true) = true

  order by p_sort asc, p_id asc
$$;

comment on function get_user_permissions() is
  'Returns the full set of active permissions for the currently authenticated user. '
  'Includes permissions from direct user_roles AND permissions inherited via organization '
  'membership (org_members → org_roles → role_permissions). Duplicates are deduped by UNION.';
