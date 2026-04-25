<script setup lang="ts">
import { z } from 'zod'
import type { PfDataTableItem } from '@/components/pf/pf-data-table'
import type { PfFormRules } from '@/components/pf/pf-form/PfForm.types'
import {
  getRoles,
  getRoleDetail,
  createRole,
  updateRole,
  deleteRole,
  roleKeys,
  type Role,
} from '@/api/role/role'
import RolePermission from './components/RolePermission.vue'

const roleSchema = z.object({
  // `code` 在编辑模式下不展示,若这里强制必填会导致 update 提交被 schema 拦截。
  // 创建模式的必填由字段级 rules.required 保证。
  code: z.string().max(64, '角色编码长度不能超过 64 个字符').optional().or(z.literal('')),
  name: z.string().min(1, '角色名称不能为空').max(64, '角色名称长度不能超过 64 个字符'),
  description: z.string().max(256, '描述不能超过 256 个字符').optional().or(z.literal('')),
})

const formRules = computed<PfFormRules<Record<string, any>>>(() => ({
  schema: roleSchema,
}))

const columns = computed<PfDataTableItem<Role>[]>(() => [
  {
    name: '角色ID',
    key: 'id',
    type: 'text',
    readonly: true,
    create: false,
    edit: false,
    query: false,
    table: {
      show: false,
    },
  },
  {
    name: '角色编码',
    key: 'code',
    type: 'text',
    create: true,
    edit: false,
    query: true,
    rules: {
      required: true,
      max: 64,
    },
    table: {
      minWidth: 140,
    },
  },
  {
    name: '角色名称',
    key: 'name',
    type: 'text',
    create: true,
    edit: true,
    query: true,
    rules: {
      required: true,
      max: 64,
    },
    table: {
      minWidth: 160,
    },
  },
  {
    name: '描述',
    key: 'description',
    type: 'text',
    create: true,
    edit: true,
    query: false,
    table: {
      minWidth: 200,
      textDisplay: 'ellipsis',
      tooltip: true,
    },
  },
])

const defaultQuery = {
  code: '',
  name: '',
}

const handleListQuery = async (query: Record<string, any>) => {
  const roles = await getRoles()
  return roles.filter((r) => {
    if (query.code && !r.code.includes(query.code)) return false
    if (query.name && !r.name.includes(query.name)) return false
    return true
  })
}

const handleDetailQuery = async (id: string | number) => {
  return await getRoleDetail(String(id))
}

const handleCreate = async (payload: Record<string, any>) => {
  return await createRole({
    code: payload.code,
    name: payload.name,
    description: payload.description || null,
  })
}

const handleUpdate = async (id: string | number, payload: Record<string, any>) => {
  return await updateRole(String(id), {
    name: payload.name,
    description: payload.description || null,
  })
}

const handleDelete = async (id: string | number) => {
  await deleteRole(String(id))
}

// Role permission drawer
const permissionOpen = ref(false)
const activeRoleCode = ref('')
const activeRoleName = ref('')

const openRolePermission = (row: Record<string, any>) => {
  activeRoleCode.value = row.code
  activeRoleName.value = row.name
  permissionOpen.value = true
}
</script>

<template>
  <pf-data-table
    :columns="columns"
    :query-key-base="roleKeys.all"
    :default-query="defaultQuery"
    :list-query="handleListQuery"
    :detail="handleDetailQuery"
    :create="handleCreate"
    :update="handleUpdate"
    :delete="handleDelete"
    :form-rules="formRules"
    container-mode="drawer"
    row-key="id"
  >
    <template #extra-actions="{ row }">
      <pf-button size="sm" variant="outline" @click="openRolePermission(row)"> 权限配置 </pf-button>
    </template>
  </pf-data-table>

  <RolePermission
    v-model:open="permissionOpen"
    :role-code="activeRoleCode"
    :role-name="activeRoleName"
  />
</template>

<style scoped></style>
