<script setup lang="ts">
import { z } from 'zod'
import { h } from 'vue'
import type { PfDataTableItem } from '@/components/pf/pf-data-table'
import type { PfFormRules } from '@/components/pf/pf-form/PfForm.types'
import PageLayoutSingle from '@/layouts/page-layout/PageLayoutSingle.vue'
import {
  createUser,
  deleteUser,
  getUserDetail,
  getUsers,
  updateUser,
  userKeys,
  type UserProfile,
} from '@/api/user/user'

const defaultQuery = {
  username: '',
  email: '',
  status: '',
}

const userSchema = z.object({
  username: z.string().min(1, '用户名不能为空').max(32, '用户名长度不能超过 32 个字符'),
  email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
  full_name: z.string().max(64, '姓名长度不能超过 64 个字符').optional().or(z.literal('')),
  avatar_url: z.string().url('头像地址需要是有效 URL').optional().or(z.literal('')),
  status: z.string().min(1, '状态不能为空'),
})

const formRules = computed<PfFormRules<Record<string, any>>>(() => ({
  schema: userSchema,
}))

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
      width: 240,
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
      minWidth: 160,
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
    name: '头像地址',
    key: 'avatar_url',
    type: 'text',
    create: true,
    edit: true,
    query: false,
    table: {
      minWidth: 240,
    },
    detail: {
      show: true,
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
  return await getUsers({
    username: query.username || null,
    email: query.email || null,
    status: query.status || null,
  })
}

const handleDetailQuery = async (id: string | number) => {
  return await getUserDetail(id)
}

const handleCreate = async (payload: Record<string, any>) => {
  return await createUser({
    username: payload.username || null,
    email: payload.email || null,
    full_name: payload.full_name || null,
    avatar_url: payload.avatar_url || null,
    status: payload.status || 'active',
  })
}

const handleUpdate = async (id: string | number, payload: Record<string, any>) => {
  return await updateUser(id, {
    username: payload.username || null,
    email: payload.email || null,
    full_name: payload.full_name || null,
    avatar_url: payload.avatar_url || null,
    status: payload.status || 'active',
  })
}

const handleDelete = async (id: string | number) => {
  await deleteUser(id)
}
</script>

<template>
  <PageLayoutSingle class="h-full min-h-0">
    <pf-data-table
      title="用户管理"
      :columns="columns"
      :query-key-base="userKeys.all"
      :default-query="defaultQuery"
      :list-query="handleListQuery"
      :detail-query="handleDetailQuery"
      :create-request="handleCreate"
      :update-request="handleUpdate"
      :delete-request="handleDelete"
      :form-rules="formRules"
      container-mode="drawer"
      row-key="id"
    />
  </PageLayoutSingle>
</template>

<style scoped></style>
