/* 
@target profiles
@action 设置仅用户可以访问自己的 profile 数据
@date 2026-02-14
 */
-- Enable RLS on the profiles table
alter table profiles enable row level security;

-- Create a policy to allow users to select their own profile
create policy "Allow users to select their own profile" on profiles for
select
  using (auth.uid () = id);