/*
@target profiles
@action 临时允许 authenticated 用户更新自己的 profile（后续 RBAC 完成后回收）
@date 2026-04-25
*/

drop policy if exists "TEMP Allow authenticated users to update profiles" on profiles;

create policy "TEMP Allow authenticated users to update profiles" on profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);