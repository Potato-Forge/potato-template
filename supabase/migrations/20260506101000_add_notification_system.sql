/*
@target notification domain tables
@action 新增公告、系统消息、消息日志与基础 RLS
@date 2026-05-06
*/

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text null,
  content text not null,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published', 'expired', 'archived')),
  publish_at timestamptz null,
  expire_at timestamptz null,
  allow_comment boolean not null default true,
  pinned boolean not null default false,
  created_by uuid null references public.profiles (id) on delete set null,
  updated_by uuid null references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint announcements_expire_after_publish check (
    expire_at is null or publish_at is null or expire_at > publish_at
  )
);

create table if not exists public.announcement_likes (
  announcement_id uuid not null references public.announcements (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (announcement_id, user_id)
);

create table if not exists public.announcement_comments (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid not null references public.announcements (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  status text not null default 'visible' check (status in ('visible', 'hidden', 'deleted')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.system_messages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text null,
  content text not null,
  message_type text not null default 'info' check (message_type in ('info', 'success', 'warning', 'error')),
  target_type text not null default 'all' check (target_type in ('all', 'users', 'roles')),
  target_user_ids uuid[] not null default '{}',
  target_role_codes text[] not null default '{}',
  source_module text null,
  source_event text null,
  payload jsonb not null default '{}'::jsonb,
  send_status text not null default 'draft' check (send_status in ('draft', 'scheduled', 'sent', 'cancelled')),
  send_at timestamptz null,
  expire_at timestamptz null,
  created_by uuid null references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint system_messages_expire_after_send check (
    expire_at is null or send_at is null or expire_at > send_at
  )
);

create table if not exists public.system_message_recipients (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.system_messages (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  delivery_status text not null default 'pending' check (delivery_status in ('pending', 'sent', 'failed')),
  delivered_at timestamptz null,
  read_at timestamptz null,
  dismissed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (message_id, user_id)
);

create table if not exists public.system_message_logs (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.system_messages (id) on delete cascade,
  recipient_id uuid null references public.system_message_recipients (id) on delete cascade,
  actor_user_id uuid null references public.profiles (id) on delete set null,
  action text not null check (action in ('created', 'scheduled', 'sent', 'delivered', 'read', 'dismissed', 'failed')),
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists announcements_status_publish_idx
  on public.announcements (status, pinned desc, priority, publish_at desc);

create index if not exists announcements_expire_idx
  on public.announcements (expire_at);

create index if not exists announcement_comments_announcement_idx
  on public.announcement_comments (announcement_id, created_at desc);

create index if not exists system_messages_send_status_idx
  on public.system_messages (send_status, send_at desc);

create index if not exists system_messages_target_type_idx
  on public.system_messages (target_type);

create index if not exists system_message_recipients_user_idx
  on public.system_message_recipients (user_id, read_at, created_at desc);

create index if not exists system_message_logs_message_idx
  on public.system_message_logs (message_id, created_at desc);

create or replace function public.tg_set_notification_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_announcements_updated_at on public.announcements;
create trigger set_announcements_updated_at
before update on public.announcements
for each row execute function public.tg_set_notification_updated_at();

drop trigger if exists set_announcement_comments_updated_at on public.announcement_comments;
create trigger set_announcement_comments_updated_at
before update on public.announcement_comments
for each row execute function public.tg_set_notification_updated_at();

drop trigger if exists set_system_messages_updated_at on public.system_messages;
create trigger set_system_messages_updated_at
before update on public.system_messages
for each row execute function public.tg_set_notification_updated_at();

drop trigger if exists set_system_message_recipients_updated_at on public.system_message_recipients;
create trigger set_system_message_recipients_updated_at
before update on public.system_message_recipients
for each row execute function public.tg_set_notification_updated_at();

create or replace function public.log_system_message_event(
  p_message_id uuid,
  p_action text,
  p_actor_user_id uuid default auth.uid(),
  p_recipient_id uuid default null,
  p_detail jsonb default '{}'::jsonb
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.system_message_logs (message_id, recipient_id, actor_user_id, action, detail)
  values (p_message_id, p_recipient_id, p_actor_user_id, p_action, coalesce(p_detail, '{}'::jsonb));
$$;

create or replace function public.dispatch_system_message(p_message_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_message public.system_messages%rowtype;
  v_inserted_count integer := 0;
begin
  if not has_roles(array['admin', 'system_admin', 'super_admin']) then
    raise exception 'Only admins can dispatch system messages';
  end if;

  select * into v_message
  from public.system_messages
  where id = p_message_id;

  if not found then
    raise exception 'System message % not found', p_message_id;
  end if;

  with target_users as (
    select distinct p.id as user_id
    from public.profiles p
    left join public.user_roles ur on ur.user_id = p.id
    where (
      v_message.target_type = 'all'
      or (v_message.target_type = 'users' and p.id = any(v_message.target_user_ids))
      or (v_message.target_type = 'roles' and ur.role_code = any(v_message.target_role_codes))
    )
  ),
  inserted as (
    insert into public.system_message_recipients (
      message_id,
      user_id,
      delivery_status,
      delivered_at
    )
    select p_message_id, target_users.user_id, 'sent', timezone('utc', now())
    from target_users
    on conflict (message_id, user_id) do update
    set delivery_status = excluded.delivery_status,
        delivered_at = excluded.delivered_at,
        updated_at = timezone('utc', now())
    returning id, user_id
  )
  select count(*) into v_inserted_count from inserted;

  update public.system_messages
  set send_status = 'sent',
      send_at = coalesce(send_at, timezone('utc', now()))
  where id = p_message_id;

  perform public.log_system_message_event(
    p_message_id,
    'sent',
    auth.uid(),
    null,
    jsonb_build_object('recipient_count', v_inserted_count)
  );

  insert into public.system_message_logs (message_id, recipient_id, actor_user_id, action, detail)
  select p_message_id,
         inserted.id,
         auth.uid(),
         'delivered',
         jsonb_build_object('user_id', inserted.user_id)
  from public.system_message_recipients inserted
  where inserted.message_id = p_message_id
    and inserted.delivered_at is not null;

  return v_inserted_count;
end;
$$;

create or replace function public.mark_system_message_read(p_recipient_id uuid)
returns public.system_message_recipients
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.system_message_recipients%rowtype;
begin
  update public.system_message_recipients
  set read_at = coalesce(read_at, timezone('utc', now()))
  where id = p_recipient_id
    and (user_id = auth.uid() or has_roles(array['admin', 'system_admin', 'super_admin']))
  returning * into v_row;

  if not found then
    raise exception 'Message recipient % not found or access denied', p_recipient_id;
  end if;

  perform public.log_system_message_event(
    v_row.message_id,
    'read',
    auth.uid(),
    v_row.id,
    jsonb_build_object('user_id', v_row.user_id, 'read_at', v_row.read_at)
  );

  return v_row;
end;
$$;

alter table public.announcements enable row level security;
alter table public.announcement_likes enable row level security;
alter table public.announcement_comments enable row level security;
alter table public.system_messages enable row level security;
alter table public.system_message_recipients enable row level security;
alter table public.system_message_logs enable row level security;

drop policy if exists "Allow admins to manage announcements" on public.announcements;
drop policy if exists "Allow users to view published announcements" on public.announcements;
drop policy if exists "Allow admins to manage announcement likes" on public.announcement_likes;
drop policy if exists "Allow users to manage own announcement likes" on public.announcement_likes;
drop policy if exists "Allow users to read announcement likes" on public.announcement_likes;
drop policy if exists "Allow admins to manage announcement comments" on public.announcement_comments;
drop policy if exists "Allow users to read visible announcement comments" on public.announcement_comments;
drop policy if exists "Allow users to create own announcement comments" on public.announcement_comments;
drop policy if exists "Allow users to update own announcement comments" on public.announcement_comments;
drop policy if exists "Allow admins to manage system messages" on public.system_messages;
drop policy if exists "Allow admins to manage message recipients" on public.system_message_recipients;
drop policy if exists "Allow users to read own message recipients" on public.system_message_recipients;
drop policy if exists "Allow users to update own message recipients" on public.system_message_recipients;
drop policy if exists "Allow admins to read system message logs" on public.system_message_logs;
drop policy if exists "Allow admins to insert system message logs" on public.system_message_logs;

create policy "Allow admins to manage announcements" on public.announcements
for all
to authenticated
using (has_roles(array['admin', 'system_admin', 'super_admin']))
with check (has_roles(array['admin', 'system_admin', 'super_admin']));

create policy "Allow users to view published announcements" on public.announcements
for select
to authenticated
using (
  status = 'published'
  and coalesce(publish_at, timezone('utc', now())) <= timezone('utc', now())
  and (expire_at is null or expire_at > timezone('utc', now()))
);

create policy "Allow admins to manage announcement likes" on public.announcement_likes
for all
to authenticated
using (has_roles(array['admin', 'system_admin', 'super_admin']))
with check (has_roles(array['admin', 'system_admin', 'super_admin']));

create policy "Allow users to read announcement likes" on public.announcement_likes
for select
to authenticated
using (true);

create policy "Allow users to manage own announcement likes" on public.announcement_likes
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Allow users to delete own announcement likes" on public.announcement_likes
for delete
to authenticated
using (user_id = auth.uid());

create policy "Allow admins to manage announcement comments" on public.announcement_comments
for all
to authenticated
using (has_roles(array['admin', 'system_admin', 'super_admin']))
with check (has_roles(array['admin', 'system_admin', 'super_admin']));

create policy "Allow users to read visible announcement comments" on public.announcement_comments
for select
to authenticated
using (status = 'visible');

create policy "Allow users to create own announcement comments" on public.announcement_comments
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.announcements a
    where a.id = announcement_comments.announcement_id
      and a.allow_comment = true
      and a.status = 'published'
      and coalesce(a.publish_at, timezone('utc', now())) <= timezone('utc', now())
      and (a.expire_at is null or a.expire_at > timezone('utc', now()))
  )
);

create policy "Allow users to update own announcement comments" on public.announcement_comments
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Allow users to delete own announcement comments" on public.announcement_comments
for delete
to authenticated
using (user_id = auth.uid());

create policy "Allow admins to manage system messages" on public.system_messages
for all
to authenticated
using (has_roles(array['admin', 'system_admin', 'super_admin']))
with check (has_roles(array['admin', 'system_admin', 'super_admin']));

create policy "Allow admins to manage message recipients" on public.system_message_recipients
for all
to authenticated
using (has_roles(array['admin', 'system_admin', 'super_admin']))
with check (has_roles(array['admin', 'system_admin', 'super_admin']));

create policy "Allow users to read own message recipients" on public.system_message_recipients
for select
to authenticated
using (user_id = auth.uid());

create policy "Allow users to update own message recipients" on public.system_message_recipients
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Allow admins to read system message logs" on public.system_message_logs
for select
to authenticated
using (has_roles(array['admin', 'system_admin', 'super_admin']));

create policy "Allow admins to insert system message logs" on public.system_message_logs
for insert
to authenticated
with check (has_roles(array['admin', 'system_admin', 'super_admin']));

comment on function public.dispatch_system_message(uuid) is
'Materialize recipients for a system message based on its target type and mark it as sent.';

comment on function public.mark_system_message_read(uuid) is
'Mark a system message recipient row as read for the current user and append a message log entry.';