import type { Database } from '@/types/database.types'
import { supabase } from '..'

export type Permission = Database['public']['Tables']['permissions']['Row']

export type AllPermissionItem = Database['public']['Tables']['permissions']['Row']

export const permissionKeys = {
  all: ['permissions'] as const,
}

export const getAllPermissions = async () => {
  const { data, error } = await supabase
    .from('permissions')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) {
    throw new Error(error.message)
  }
  return data
}
