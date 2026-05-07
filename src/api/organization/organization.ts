import type { Database } from '@/types/database.types'
import { supabase } from '..'

export type Organization = Database['public']['Tables']['organizations']['Row']
export type OrgInsert = Database['public']['Tables']['organizations']['Insert']
export type OrgUpdate = Database['public']['Tables']['organizations']['Update']

export type OrgMember = Database['public']['Tables']['org_members']['Row']
export type OrgRole = Database['public']['Tables']['org_roles']['Row']

export const orgKeys = {
  all: ['organizations'] as const,
  list: () => ['organizations', 'list'] as const,
  detail: (id: string) => ['organizations', 'detail', id] as const,
  members: (orgId: string) => ['organizations', 'members', orgId] as const,
  roles: (orgId: string) => ['organizations', 'roles', orgId] as const,
}

// ─────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────

export const getOrganizations = async (query?: { name?: string; status?: boolean }) => {
  let builder = supabase.from('organizations').select('*').order('name', { ascending: true })

  if (query?.name) {
    builder = builder.ilike('name', `%${query.name}%`)
  }
  if (query?.status !== undefined) {
    builder = builder.eq('status', query.status)
  }

  const { data, error } = await builder
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export const getOrgDetail = async (id: string) => {
  const { data, error } = await supabase.from('organizations').select('*').eq('id', id).single()
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export const createOrg = async (payload: OrgInsert) => {
  const { data, error } = await supabase.from('organizations').insert(payload).select('*').single()
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export const updateOrg = async (id: string, payload: OrgUpdate) => {
  const { data, error } = await supabase
    .from('organizations')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  if (error) {
    throw new Error(error.message)
  }
  return data
}

export const deleteOrg = async (id: string) => {
  const { error } = await supabase.from('organizations').delete().eq('id', id)
  if (error) {
    throw new Error(error.message)
  }
}

// ─────────────────────────────────────────────────────────
// Members  (org ↔ user)
// ─────────────────────────────────────────────────────────

export const getOrgMemberIds = async (orgId: string): Promise<string[]> => {
  const { data, error } = await supabase.from('org_members').select('user_id').eq('org_id', orgId)
  if (error) {
    throw new Error(error.message)
  }
  return data.map((r) => r.user_id)
}

/** Replaces all members for an organization (delete + insert). */
export const setOrgMembers = async (orgId: string, userIds: string[]): Promise<void> => {
  const { error: deleteError } = await supabase.from('org_members').delete().eq('org_id', orgId)
  if (deleteError) {
    throw new Error(deleteError.message)
  }

  const normalized = Array.from(new Set(userIds.filter(Boolean)))
  if (normalized.length === 0) return

  const { error: insertError } = await supabase
    .from('org_members')
    .insert(normalized.map((user_id) => ({ org_id: orgId, user_id })))
  if (insertError) {
    throw new Error(insertError.message)
  }
}

// ─────────────────────────────────────────────────────────
// Roles  (org ↔ role)
// ─────────────────────────────────────────────────────────

export const getOrgRoleCodes = async (orgId: string): Promise<string[]> => {
  const { data, error } = await supabase.from('org_roles').select('role_code').eq('org_id', orgId)
  if (error) {
    throw new Error(error.message)
  }
  return data.map((r) => r.role_code)
}

/** Replaces all default roles for an organization (delete + insert). */
export const setOrgRoles = async (orgId: string, roleCodes: string[]): Promise<void> => {
  const { error: deleteError } = await supabase.from('org_roles').delete().eq('org_id', orgId)
  if (deleteError) {
    throw new Error(deleteError.message)
  }

  const normalized = Array.from(new Set(roleCodes.filter(Boolean)))
  if (normalized.length === 0) return

  const { error: insertError } = await supabase
    .from('org_roles')
    .insert(normalized.map((role_code) => ({ org_id: orgId, role_code })))
  if (insertError) {
    throw new Error(insertError.message)
  }
}
