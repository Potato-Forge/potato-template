/*
@target notification realtime
@action 将系统消息收件箱表加入 realtime publication，并为按 user_id 过滤的更新事件开启完整副本身份
@date 2026-05-06
*/

alter publication supabase_realtime add table public.system_message_recipients;

alter table public.system_message_recipients replica identity full;