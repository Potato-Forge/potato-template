import type { Database } from '@/types/database.types'
import { supabase } from '..'

export type Announcement = Database['public']['Tables']['announcements']['Row']
export type AnnouncementInsert = Database['public']['Tables']['announcements']['Insert']
export type AnnouncementUpdate = Database['public']['Tables']['announcements']['Update']
export type AnnouncementComment = Database['public']['Tables']['announcement_comments']['Row']

export type VisibleAnnouncement = Pick<
  Announcement,
  'id' | 'title' | 'summary' | 'content' | 'priority' | 'status' | 'publish_at' | 'created_at'
>

export type AnnouncementListQuery = {
  title?: string | null
  status?: string | null
  priority?: string | null
}

export const announcementKeys = {
  all: ['notifications', 'announcements'] as const,
  list: (query: AnnouncementListQuery) => [...announcementKeys.all, 'list', query] as const,
  detail: (id: string) => [...announcementKeys.all, 'detail', id] as const,
}

export const getAnnouncements = async (query: AnnouncementListQuery = {}) => {
  let request = supabase
    .from('announcements')
    .select('*')
    .order('pinned', { ascending: false })
    .order('publish_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (query.title) {
    request = request.ilike('title', `%${query.title}%`)
  }

  if (query.status) {
    request = request.eq('status', query.status)
  } else {
    request = request.neq('status', 'archived')
  }

  if (query.priority) {
    request = request.eq('priority', query.priority)
  }

  const { data, error } = await request
  if (error) throw new Error(error.message)
  return data
}

export const getVisibleAnnouncements = async (limit = 20) => {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('announcements')
    .select('id, title, summary, content, priority, status, publish_at, created_at')
    .in('status', ['published', 'scheduled'])
    .or(`publish_at.is.null,publish_at.lte.${now}`)
    .or(`expire_at.is.null,expire_at.gt.${now}`)
    .order('pinned', { ascending: false })
    .order('publish_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []) as VisibleAnnouncement[]
}

export const getAnnouncementDetail = async (id: string) => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error('未找到该公告或暂无权限查看')
  return data
}

export const createAnnouncement = async (payload: AnnouncementInsert) => {
  const { data, error } = await supabase.from('announcements').insert(payload).select('*').single()
  if (error) throw new Error(error.message)
  return data
}

export const updateAnnouncement = async (id: string, payload: AnnouncementUpdate) => {
  const { data, error } = await supabase
    .from('announcements')
    .update(payload)
    .eq('id', id)
    .select('*')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('更新公告失败：记录不存在或暂无权限修改')
  return data
}

export const publishAnnouncement = async (id: string) => {
  const { data, error } = await supabase.rpc('publish_announcement', {
    p_announcement_id: id,
  })

  if (error) throw new Error(error.message)
  if (!data) throw new Error('发布公告失败：记录不存在或暂无权限修改')
  return data
}

export const withdrawAnnouncement = async (id: string) => {
  const { data, error } = await supabase
    .from('announcements')
    .update({
      status: 'draft',
      publish_at: null,
    })
    .eq('id', id)
    .select('*')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('撤回公告失败：记录不存在或暂无权限修改')
  return data
}

export const archiveAnnouncement = async (id: string) => {
  const { data, error } = await supabase
    .from('announcements')
    .update({
      status: 'archived',
      pinned: false,
    })
    .eq('id', id)
    .select('*')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('删除公告失败：记录不存在或暂无权限修改')
  return data
}

export const getAnnouncementComments = async (announcementId: string) => {
  const { data, error } = await supabase
    .from('announcement_comments')
    .select('*')
    .eq('announcement_id', announcementId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export const createAnnouncementComment = async (payload: {
  announcement_id: string
  user_id: string
  content: string
}) => {
  const { data, error } = await supabase
    .from('announcement_comments')
    .insert({
      announcement_id: payload.announcement_id,
      user_id: payload.user_id,
      content: payload.content,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const toggleAnnouncementLike = async (
  announcementId: string,
  userId: string,
  liked: boolean,
) => {
  if (liked) {
    const { error } = await supabase.from('announcement_likes').insert({
      announcement_id: announcementId,
      user_id: userId,
    })
    if (error) throw new Error(error.message)
    return
  }

  const { error } = await supabase
    .from('announcement_likes')
    .delete()
    .eq('announcement_id', announcementId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}
