create or replace function has_roles(role_codes text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from user_roles ur
    where ur.user_id = auth.uid()
      and ur.role_code = any(role_codes)
  )
$$;

comment on function has_roles(text[]) is 
'检查当前登录用户是否拥有指定的角色。
@param role_codes - 需要校验的角色编码数组，如 array[''admin'', ''editor'']
@return boolean - 如果用户拥有其中任意一个角色，返回 true';