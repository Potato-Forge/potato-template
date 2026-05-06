import type { Database } from '@/types/database.types'
import { supabase } from '..'

export type SystemMessageLog = Database['public']['Tables']['system_message_logs']['Row']

export type SystemMessageLogQuery = {
  action?: string | null
  messageId?: string | null
}

export const systemMessageLogKeys = {
  all: ['notifications', 'message-logs'] as const,
  list: (query: SystemMessageLogQuery) => [...systemMessageLogKeys.all, 'list', query] as const,
}

export const getSystemMessageLogs = async (query: SystemMessageLogQuery = {}) => {
  let request = supabase
    .from('system_message_logs')
    .select('*')
    .order('created_at', { ascending: false })

  if (query.action) {
    request = request.eq('action', query.action)
  }

  if (query.messageId) {
    request = request.eq('message_id', query.messageId)
  }

  const { data, error } = await request
  if (error) throw new Error(error.message)
  return data
}

export const getSystemMessageLogDetail = async (id: string) => {
  const { data, error } = await supabase
    .from('system_message_logs')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) throw new Error('未找到该消息日志或暂无权限查看')
  return data
}
