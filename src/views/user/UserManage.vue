<script setup lang="ts">
import { z } from 'zod'
import { h } from 'vue'
import type { PfDataTableItem } from '@/components/pf/pf-data-table'
import type { PfUploadFileItem } from '@/components/pf/pf-upload'
import type { PfFormRules } from '@/components/pf/pf-form/PfForm.types'
import {
  createUser,
  deleteUser,
  getUserDetail,
  getUsers,
  removeUserAvatarByObjectPath,
  removeUserAvatarByPublicUrl,
  resolveAvatarPublicUrl,
  uploadUserAvatar,
  updateUser,
  userKeys,
  type UserProfile,
} from '@/api/user/user'
import PfImg from '@/components/pf/pf-img/PfImg.vue'

const defaultQuery = {
  username: '',
  email: '',
  status: '',
}

const userSchema = z.object({
  username: z.string().min(1, '用户名不能为空').max(32, '用户名长度不能超过 32 个字符'),
  email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
  full_name: z.string().max(64, '姓名长度不能超过 64 个字符').optional().or(z.literal('')),
  avatar_upload: z.array(z.any()).optional(),
  status: z.string().min(1, '状态不能为空'),
})

const formRules = computed<PfFormRules<Record<string, any>>>(() => ({
  schema: userSchema,
}))

const avatarUploadHandler = async (payload: {
  file: File
  onProgress: (percent: number) => void
  signal: AbortSignal
}) => {
  const uploaded = await uploadUserAvatar(payload)
  return {
    remoteUrl: uploaded.publicUrl,
    remotePath: uploaded.objectPath,
  }
}

const toAvatarUploadItems = (avatarPath: string | null | undefined): PfUploadFileItem[] => {
  if (!avatarPath) {
    return []
  }

  const avatarUrl = resolveAvatarPublicUrl(avatarPath)
  if (!avatarUrl) {
    return []
  }

  return [
    {
      id: `avatar-${avatarPath}`,
      name: avatarPath.split('/').pop() || 'avatar',
      size: 0,
      type: 'image/*',
      status: 'success',
      progress: 100,
      isImage: true,
      remoteUrl: avatarUrl,
      remotePath: avatarPath,
      isObjectUrl: false,
    },
  ]
}

const mapProfileForForm = (
  profile: UserProfile,
): UserProfile & { avatar_upload: PfUploadFileItem[] } => ({
  ...profile,
  avatar_upload: toAvatarUploadItems(profile.avatar_url),
})

const columns = computed<PfDataTableItem<UserProfile>[]>(() => [
  {
    name: '用户ID',
    key: 'id',
    type: 'text',
    readonly: true,
    create: false,
    edit: false,
    query: false,
    table: {
      width: 80,
      textDisplay: 'ellipsis',
    },
  },
  {
    name: '用户名',
    key: 'username',
    type: 'text',
    create: true,
    edit: true,
    query: true,
    rules: {
      max: 32,
    },
    table: {
      minWidth: 120,
    },
  },
  {
    name: '邮箱',
    key: 'email',
    type: 'text',
    create: true,
    edit: true,
    query: true,
    table: {
      minWidth: 220,
    },
  },
  {
    name: '姓名',
    key: 'full_name',
    type: 'text',
    create: true,
    edit: true,
    query: false,
    table: {
      minWidth: 140,
    },
  },
  {
    name: '头像上传',
    key: 'avatar_upload',
    type: 'upload',
    create: true,
    edit: true,
    query: false,
    table: {
      show: false,
    },
    detail: {
      show: false,
    },
    config: {
      trigger: 'gallery',
      listType: 'gallery',
      multiple: false,
      accept: 'image/*',
      maxFiles: 1,
      maxSize: 5 * 1024 * 1024,
      uploadHandler: avatarUploadHandler,
    },
    help: '上传后会自动保存到 Supabase Storage 的 assets 公共桶',
  },
  {
    name: '头像地址',
    key: 'avatar_url',
    type: 'text',
    create: false,
    edit: false,
    query: false,
    table: {
      minWidth: 120,
      align: 'center',
      render: (value) => {
        if (!value) {
          return h('span', '-')
        }

        const avatarUrl = resolveAvatarPublicUrl(String(value))
        if (!avatarUrl) {
          return h('span', '-')
        }

        return h('img', {
          src: avatarUrl,
          alt: 'avatar',
          class: 'h-8 w-8 rounded-full object-cover',
        })
      },
    },
    detail: {
      show: true,
      render: (value: unknown) => {
        if (!value) {
          return h('span', '-')
        }

        const avatarUrl = resolveAvatarPublicUrl(String(value))
        if (!avatarUrl) {
          return h('span', '-')
        }

        return h(PfImg, {
          src: avatarUrl,
          alt: 'avatar',
          class: 'size-8',
        })
      },
    },
  },
  {
    name: '状态',
    key: 'status',
    type: 'options',
    create: true,
    edit: true,
    query: {
      enable: true,
      type: 'options',
      config: {
        variant: 'combobox',
        options: [
          { label: '全部', value: '' },
          { label: '启用', value: 'active' },
          { label: '禁用', value: 'inactive' },
        ],
      },
      default: '',
    },
    config: {
      variant: 'combobox',
      options: [
        { label: '启用', value: 'active' },
        { label: '禁用', value: 'inactive' },
      ],
    },
    default: 'active',
    rules: {
      required: true,
    },
    table: {
      width: 120,
      align: 'center',
    },
    render: (value) => {
      const normalized = String(value || 'inactive')
      const mapping: Record<string, { label: string; cls: string }> = {
        active: { label: '启用', cls: 'bg-success/15 text-success' },
        inactive: { label: '禁用', cls: 'bg-destructive/15 text-destructive' },
      }
      const target = mapping[normalized] ?? {
        label: '禁用',
        cls: 'bg-destructive/15 text-destructive',
      }
      return h(
        'span',
        {
          class: `inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${target.cls}`,
        },
        target.label,
      )
    },
  },
  {
    name: '创建时间',
    key: 'created_at',
    type: 'datetime',
    readonly: true,
    create: false,
    edit: false,
    query: false,
    table: {
      minWidth: 190,
    },
  },
  {
    name: '更新时间',
    key: 'updated_at',
    type: 'datetime',
    readonly: true,
    create: false,
    edit: false,
    query: false,
    table: {
      minWidth: 190,
    },
  },
])

const handleListQuery = async (query: Record<string, any>) => {
  const users = await getUsers({
    username: query.username || null,
    email: query.email || null,
    status: query.status || null,
  })

  return users.map((item) => mapProfileForForm(item))
}

const handleDetailQuery = async (id: string | number) => {
  const profile = await getUserDetail(id)
  return mapProfileForForm(profile)
}

const getFirstAvatarFileItem = (payload: Record<string, any>) => {
  const files = Array.isArray(payload.avatar_upload)
    ? (payload.avatar_upload as PfUploadFileItem[])
    : []
  if (!files.length) return null
  return files[0] || null
}

const resolveAvatarUpload = async (payload: Record<string, any>, userId: string) => {
  void userId
  const avatarFileItem = getFirstAvatarFileItem(payload)
  if (!avatarFileItem) {
    return {
      avatarPath: null as string | null,
      uploadedObjectPath: null as string | null,
    }
  }

  if (avatarFileItem.file instanceof File && !avatarFileItem.remotePath) {
    throw new Error('头像上传尚未完成，请稍后重试')
  }

  const avatarPath = avatarFileItem.remotePath || null
  const isUploadedByCurrentSubmit = Boolean(avatarFileItem.file instanceof File && avatarPath)

  return {
    avatarPath,
    uploadedObjectPath: isUploadedByCurrentSubmit ? avatarPath : null,
  }
}

const handleCreate = async (payload: Record<string, any>) => {
  const userId = crypto.randomUUID()
  const { avatarPath, uploadedObjectPath } = await resolveAvatarUpload(payload, userId)

  try {
    return await createUser({
      id: userId,
      username: payload.username || null,
      email: payload.email || null,
      full_name: payload.full_name || null,
      avatar_url: avatarPath,
      status: payload.status,
    })
  } catch (error) {
    if (uploadedObjectPath) {
      await removeUserAvatarByObjectPath(uploadedObjectPath).catch(() => undefined)
    }
    throw error
  }
}

const handleUpdate = async (id: string | number, payload: Record<string, any>) => {
  const userId = String(id)
  const currentProfile = await getUserDetail(userId)
  const hasNewAvatar = Boolean(getFirstAvatarFileItem(payload)?.file)
  const { avatarPath, uploadedObjectPath } = await resolveAvatarUpload(payload, userId)
  const nextAvatarPath = hasNewAvatar ? avatarPath : currentProfile.avatar_url

  try {
    const updated = await updateUser(userId, {
      username: payload.username || null,
      email: payload.email || null,
      full_name: payload.full_name || null,
      avatar_url: nextAvatarPath,
      status: payload.status,
    })

    if (hasNewAvatar && currentProfile.avatar_url && currentProfile.avatar_url !== nextAvatarPath) {
      await removeUserAvatarByPublicUrl(currentProfile.avatar_url).catch(() => undefined)
    }

    return updated
  } catch (error) {
    if (uploadedObjectPath) {
      await removeUserAvatarByObjectPath(uploadedObjectPath).catch(() => undefined)
    }
    throw error
  }
}

const handleDelete = async (id: string | number) => {
  await deleteUser(id)
}
</script>

<template>
  <pf-data-table
    :columns="columns"
    :query-key-base="userKeys.all"
    :default-query="defaultQuery"
    :list-query="handleListQuery"
    :detail="handleDetailQuery"
    :create="handleCreate"
    :update="handleUpdate"
    :delete="handleDelete"
    :form-rules="formRules"
    container-mode="modal"
    row-key="id"
  />
</template>

<style scoped></style>
