import type { Database } from '@/types/database.types'
import { supabase } from '..'

export type UserProfile = Database['public']['Tables']['profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['profiles']['Update']

const AVATAR_BUCKET = 'assets'
const AVATAR_FOLDER = 'avatars'
const DEFAULT_ASSETS_PUBLIC_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${AVATAR_BUCKET}`

const normalizeUrlBase = (value: string) => value.replace(/\/+$/, '')

const normalizeStoragePath = (value: string) => value.replace(/^\/+/, '')

const getAssetsPublicBaseUrl = () => {
  const customBase = import.meta.env.VITE_SUPABASE_ASSETS_PUBLIC_BASE_URL
  const base = customBase || DEFAULT_ASSETS_PUBLIC_BASE_URL
  return normalizeUrlBase(base)
}

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

export const getUserRoleCodes = async (userId: string | number): Promise<string[]> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role_code')
    .eq('user_id', String(userId))

  if (error) {
    throw new Error(error.message)
  }

  return data.map((item) => item.role_code)
}

export const setUserRoles = async (userId: string | number, roleCodes: string[]): Promise<void> => {
  const normalizedUserId = String(userId)

  const { error: deleteError } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', normalizedUserId)
  if (deleteError) {
    throw new Error(deleteError.message)
  }

  const normalizedRoleCodes = Array.from(new Set(roleCodes.filter(Boolean)))
  if (normalizedRoleCodes.length === 0) return

  const { error: insertError } = await supabase.from('user_roles').insert(
    normalizedRoleCodes.map((roleCode) => ({
      user_id: normalizedUserId,
      role_code: roleCode,
    })),
  )
  if (insertError) {
    throw new Error(insertError.message)
  }
}

const getFileExtension = (fileName: string) => {
  const parts = fileName.split('.')
  if (parts.length <= 1) return 'bin'
  const ext = parts.pop()
  return ext ? ext.toLowerCase() : 'bin'
}

const getAvatarObjectPathFromPublicUrl = (publicUrl: string) => {
  if (!publicUrl) {
    return null
  }

  if (!/^https?:\/\//i.test(publicUrl)) {
    return normalizeStoragePath(publicUrl)
  }

  try {
    const url = new URL(publicUrl)
    const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`
    const index = url.pathname.indexOf(marker)
    if (index === -1) return null
    const path = url.pathname.slice(index + marker.length)
    return path || null
  } catch {
    return null
  }
}

export const resolveAvatarPublicUrl = (storedPathOrUrl: string | null | undefined) => {
  if (!storedPathOrUrl) return null

  if (/^https?:\/\//i.test(storedPathOrUrl)) {
    return storedPathOrUrl
  }

  const objectPath = normalizeStoragePath(storedPathOrUrl)
  if (!objectPath) return null
  return `${getAssetsPublicBaseUrl()}/${objectPath}`
}

const uploadAssetObject = async (params: {
  file: File
  objectPath: string
  onProgress?: (percent: number) => void
  signal?: AbortSignal
}) => {
  const uploadUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${AVATAR_BUCKET}/${normalizeStoragePath(params.objectPath)}`
  const { data } = await supabase.auth.getSession()
  const accessToken = data.session?.access_token

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    const abortBySignal = () => {
      xhr.abort()
      reject(new DOMException('上传已取消', 'AbortError'))
    }

    xhr.open('POST', uploadUrl)
    xhr.setRequestHeader('apikey', import.meta.env.VITE_SUPABASE_KEY)
    xhr.setRequestHeader(
      'Authorization',
      `Bearer ${accessToken || import.meta.env.VITE_SUPABASE_KEY}`,
    )
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.setRequestHeader('content-type', params.file.type || 'application/octet-stream')

    xhr.upload.onprogress = (event) => {
      if (!params.onProgress || !event.lengthComputable || event.total <= 0) return
      const percent = (event.loaded / event.total) * 100
      params.onProgress(percent)
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        params.onProgress?.(100)
        resolve()
        return
      }

      try {
        const response = JSON.parse(xhr.responseText || '{}')
        reject(new Error(response?.message || `上传失败（${xhr.status}）`))
      } catch {
        reject(new Error(`上传失败（${xhr.status}）`))
      }
    }

    xhr.onerror = () => {
      reject(new Error('上传失败，请检查网络连接'))
    }

    xhr.onabort = () => {
      reject(new DOMException('上传已取消', 'AbortError'))
    }

    if (params.signal) {
      if (params.signal.aborted) {
        abortBySignal()
        return
      }
      params.signal.addEventListener('abort', abortBySignal, { once: true })
    }

    xhr.send(params.file)
  })
}

export const uploadUserAvatar = async (params: {
  file: File
  onProgress?: (percent: number) => void
  signal?: AbortSignal
}) => {
  const ext = getFileExtension(params.file.name)
  const objectPath = `${AVATAR_FOLDER}/${Date.now()}-${crypto.randomUUID()}.${ext}`

  await uploadAssetObject({
    file: params.file,
    objectPath,
    onProgress: params.onProgress,
    signal: params.signal,
  })

  return {
    objectPath: normalizeStoragePath(objectPath),
    publicUrl: resolveAvatarPublicUrl(objectPath) || '',
  }
}

export const removeUserAvatarByObjectPath = async (objectPath: string) => {
  if (!objectPath) return

  const { error } = await supabase.storage.from(AVATAR_BUCKET).remove([objectPath])
  if (error) {
    throw new Error(error.message)
  }
}

export const removeUserAvatarByPublicUrl = async (publicUrl: string | null | undefined) => {
  if (!publicUrl) return

  const objectPath = getAvatarObjectPathFromPublicUrl(publicUrl)
  if (!objectPath) return

  await removeUserAvatarByObjectPath(objectPath)
}
