import type { Database } from '@/types/database.types'
import { supabase } from '..'

export type UserProfile = Database['public']['Tables']['profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type UserListQuery = {
  username?: string | null
  email?: string | null
  status?: string | null
}

export const userKeys = {
  all: ['users'] as const,
  list: (query: UserListQuery) => [...userKeys.all, 'list', query] as const,
  detail: (id: string | number) => [...userKeys.all, 'detail', String(id)] as const,
}

export const getUsers = async (query: UserListQuery = {}) => {
  let request = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false, nullsFirst: false })

  if (query.username) {
    request = request.ilike('username', `%${query.username}%`)
  }

  if (query.email) {
    request = request.ilike('email', `%${query.email}%`)
  }

  if (query.status) {
    request = request.eq('status', query.status)
  }

  const { data, error } = await request

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const getUserDetail = async (id: string | number) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', String(id))
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('未找到该用户或暂无权限查看')
  }

  return data
}

export type CreateUserPayload = Omit<UserProfileInsert, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
}

export const createUser = async (payload: CreateUserPayload) => {
  const nextPayload: UserProfileInsert = {
    id: payload.id || crypto.randomUUID(),
    username: payload.username ?? null,
    email: payload.email ?? null,
    full_name: payload.full_name ?? null,
    avatar_url: payload.avatar_url ?? null,
    status: payload.status || 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from('profiles').insert(nextPayload).select('*').single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export const updateUser = async (id: string | number, payload: UserProfileUpdate) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', String(id))
    .select('*')
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('更新失败：未找到该用户或暂无权限修改')
  }

  return data
}

export const deleteUser = async (id: string | number) => {
  const { error } = await supabase.from('profiles').delete().eq('id', String(id))

  if (error) {
    throw new Error(error.message)
  }
}
