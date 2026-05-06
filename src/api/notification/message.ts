import type { Database, Json } from '@/types/database.types'
import { supabase } from '..'

export type SystemMessage = Database['public']['Tables']['system_messages']['Row']
export type SystemMessageInsert = Database['public']['Tables']['system_messages']['Insert']
export type SystemMessageUpdate = Database['public']['Tables']['system_messages']['Update']
export type SystemMessageRecipient =
  Database['public']['Tables']['system_message_recipients']['Row']

export type SystemMessageListQuery = {
  title?: string | null
  messageType?: string | null
  sendStatus?: string | null
}

export const systemMessageKeys = {
  all: ['notifications', 'messages'] as const,
  list: (query: SystemMessageListQuery) => [...systemMessageKeys.all, 'list', query] as const,
  detail: (id: string) => [...systemMessageKeys.all, 'detail', id] as const,
  inbox: ['notifications', 'messages', 'inbox'] as const,
}

export const getSystemMessages = async (query: SystemMessageListQuery = {}) => {
  let request = supabase
    .from('system_messages')
    .select('*')
    .order('send_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (query.title) {
    request = request.ilike('title', `%${query.title}%`)
  }

  if (query.messageType) {
    request = request.eq('message_type', query.messageType)
  }

  if (query.sendStatus) {
    request = request.eq('send_status', query.sendStatus)
  }

  const { data, error } = await request
  if (error) throw new Error(error.message)
  return data
}

export const getSystemMessageDetail = async (id: string) => {
  const { data, error } = await supabase
    .from('system_messages')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error('未找到该系统消息或暂无权限查看')
  return data
}

export const createSystemMessage = async (payload: SystemMessageInsert) => {
  const { data, error } = await supabase
    .from('system_messages')
    .insert(payload)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data
}

export const updateSystemMessage = async (id: string, payload: SystemMessageUpdate) => {
  const { data, error } = await supabase
    .from('system_messages')
    .update(payload)
    .eq('id', id)
    .select('*')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('更新系统消息失败：记录不存在或暂无权限修改')
  return data
}

export const deleteSystemMessage = async (id: string) => {
  const { error } = await supabase.from('system_messages').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export const dispatchSystemMessage = async (messageId: string) => {
  const { data, error } = await supabase.rpc('dispatch_system_message', { p_message_id: messageId })
  if (error) throw new Error(error.message)
  return data
}

export const markSystemMessageRead = async (recipientId: string) => {
  const { data, error } = await supabase.rpc('mark_system_message_read', {
    p_recipient_id: recipientId,
  })
  if (error) throw new Error(error.message)
  return data
}

export const getMySystemMessageInbox = async () => {
  const { data, error } = await supabase
    .from('system_message_recipients')
    .select('*, system_messages (*)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export const normalizeDelimitedValues = (value: string | null | undefined) => {
  if (!value) return [] as string[]
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export const normalizeJsonPayload = (value: string | Json | null | undefined): Json => {
  if (!value) return {}
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (!trimmed) return {}
  return JSON.parse(trimmed) as Json
}
