/* 
  @target permissions
  @action 临时增加 admin 编辑 permissions 权限
  @date 2026-02-17
 */

-- Create a policy to allow users with 'admin' role to update any permissions
create policy "Allow admins to edit permissions" on permissions for
all
  using (has_roles(array['admin','super_admin']))
  with check (has_roles(array['admin','super_admin']));