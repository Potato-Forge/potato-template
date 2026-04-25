/*
@target profiles
@action 临时允许 authenticated 用户新增自己的 profile（后续 RBAC 完成后回收）
@date 2026-04-25
*/

drop policy if exists "TEMP Allow authenticated users to insert profiles" on profiles;

create policy "TEMP Allow authenticated users to insert profiles" on profiles
for insert
to authenticated
with check (auth.uid() = id);