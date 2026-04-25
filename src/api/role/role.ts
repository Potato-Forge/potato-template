import type { Database } from '@/types/database.types'
import { supabase } from '..'

export type Role = Database['public']['Tables']['roles']['Row']
export type RoleInsert = Database['public']['Tables']['roles']['Insert']
export type RoleUpdate = Database['public']['Tables']['roles']['Update']

export const roleKeys = {
  all: ['roles'] as const,
  list: () => ['roles', 'list'] as const,
  detail: (id: string) => ['roles', 'detail', id] as const,
  permissions: (code: string) => ['roles', 'permissions', code] as const,
}

export const getRoles = async () => {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('name', { ascending: true })
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export const getRoleDetail = async (id: string) => {
  const { data, error } = await supabase.from('roles').select('*').eq('id', id).single()
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export const createRole = async (payload: RoleInsert) => {
  const { data, error } = await supabase.from('roles').insert(payload).select('*').single()
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export const updateRole = async (id: string, payload: RoleUpdate) => {
  const { data, error } = await supabase
    .from('roles')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export const deleteRole = async (id: string) => {
  // First fetch the role to get its code
  const { data: role, error: fetchError } = await supabase
    .from('roles')
    .select('code')
    .eq('id', id)
    .single()
  if (fetchError) {
    throw new Error(fetchError.message)
  }

  // Clear role permissions first
  const { error: rpError } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_code', role.code)
  if (rpError) {
    throw new Error(rpError.message)
  }

  // Then delete the role
  const { error } = await supabase.from('roles').delete().eq('id', id)
  if (error) {
    throw new Error(error.message)
  }
}

/** Returns permission_id list for the given role code */
export const getRolePermissions = async (roleCode: string): Promise<number[]> => {
  const { data, error } = await supabase
    .from('role_permissions')
    .select('permission_id')
    .eq('role_code', roleCode)
  if (error) {
    throw new Error(error.message)
  }
  return data.map((r) => r.permission_id)
}

/** Replaces all permissions for a role (delete + insert) */
export const setRolePermissions = async (
  roleCode: string,
  permissionIds: number[],
): Promise<void> => {
  // Delete existing
  const { error: deleteError } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_code', roleCode)
  if (deleteError) {
    throw new Error(deleteError.message)
  }

  if (permissionIds.length === 0) return

  // Insert new
  const rows = permissionIds.map((permission_id) => ({
    role_code: roleCode,
    permission_id,
  }))
  const { error: insertError } = await supabase.from('role_permissions').insert(rows)
  if (insertError) {
    throw new Error(insertError.message)
  }
}
