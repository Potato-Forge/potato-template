import type { Database } from '@/types/database.types'
import { supabase } from '..'

export type Permission = Database['public']['Tables']['permissions']['Row']
export type PermissionInsert = Database['public']['Tables']['permissions']['Insert']
export type PermissionUpdate = Database['public']['Tables']['permissions']['Update']

export type AllPermissionItem = Database['public']['Tables']['permissions']['Row']
export type PermissionSortUpdate = {
  id: number
  parent_id: number | null
  sort: number
}

export const permissionKeys = {
  all: ['permissions'] as const,
}

export const getAllPermissions = async () => {
  const { data, error } = await supabase
    .from('permissions')
    .select('*')
    .order('parent_id', { ascending: true, nullsFirst: true })
    .order('sort', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export type CreatePermissionPayload = Omit<PermissionInsert, 'id' | 'created_at' | 'updated_at'>

export const createPermission = async (payload: CreatePermissionPayload) => {
  const { data, error } = await supabase.from('permissions').insert(payload).select('*').single()
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export const updatePermission = async (id: number, payload: PermissionUpdate) => {
  const { data, error } = await supabase
    .from('permissions')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export const reorderPermissions = async (updates: PermissionSortUpdate[]) => {
  const { error } = await supabase.rpc('reorder_permissions', {
    updates,
  })

  if (error) {
    throw new Error(error.message)
  }
}
