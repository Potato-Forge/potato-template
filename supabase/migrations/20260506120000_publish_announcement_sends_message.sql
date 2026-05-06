/*
@target notification announcements
@action 发布公告时自动生成并投递一条系统消息给所有用户
@date 2026-05-06
*/

create or replace function public.publish_announcement(p_announcement_id uuid)
returns public.announcements
language plpgsql
security definer
set search_path = public
as $$
declare
  v_announcement public.announcements%rowtype;
  v_message_id uuid;
  v_message_type text;
begin
  if not has_roles(array['admin', 'system_admin', 'super_admin']) then
    raise exception 'Only admins can publish announcements';
  end if;

  update public.announcements
  set status = 'published',
      publish_at = coalesce(publish_at, timezone('utc', now())),
      updated_at = timezone('utc', now())
  where id = p_announcement_id
  returning * into v_announcement;

  if not found then
    raise exception 'Announcement % not found', p_announcement_id;
  end if;

  if v_announcement.priority in ('high', 'urgent') then
    v_message_type := 'warning';
  else
    v_message_type := 'info';
  end if;

  insert into public.system_messages (
    title,
    summary,
    content,
    message_type,
    target_type,
    source_module,
    source_event,
    payload,
    send_status,
    created_by
  )
  values (
    v_announcement.title,
    coalesce(v_announcement.summary, left(v_announcement.content, 240)),
    v_announcement.content,
    v_message_type,
    'all',
    'announcement',
    'published',
    jsonb_build_object('announcement_id', v_announcement.id, 'priority', v_announcement.priority),
    'draft',
    auth.uid()
  )
  returning id into v_message_id;

  perform public.dispatch_system_message(v_message_id);

  return v_announcement;
end;
$$;

comment on function public.publish_announcement(uuid) is
  '发布公告并自动创建系统消息，随后投递给所有用户。';