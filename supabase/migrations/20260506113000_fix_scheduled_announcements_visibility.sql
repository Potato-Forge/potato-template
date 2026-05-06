/*
@target notification announcements
@action 允许普通用户读取已到发布时间的 scheduled 公告，并将 announcements 加入 realtime publication
@date 2026-05-06
*/

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'announcements'
  ) then
    alter publication supabase_realtime add table public.announcements;
  end if;
end;
$$;

alter table public.announcements replica identity full;

drop policy if exists "Allow users to view published announcements" on public.announcements;

create policy "Allow users to view published announcements" on public.announcements
for select
to authenticated
using (
  status in ('published', 'scheduled')
  and coalesce(publish_at, timezone('utc', now())) <= timezone('utc', now())
  and (expire_at is null or expire_at > timezone('utc', now()))
);