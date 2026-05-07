<script setup lang="ts">
import { z } from 'zod'
import type { PfDataTableItem } from '@/components/pf/pf-data-table'
import type { PfFormRules } from '@/components/pf/pf-form/PfForm.types'
import PageLayout from '@/layouts/page-layout/PageLayout.vue'
import {
  getOrganizations,
  getOrgDetail,
  createOrg,
  updateOrg,
  deleteOrg,
  orgKeys,
  type Organization,
} from '@/api/organization/organization'
import OrgMemberBinding from './components/OrgMemberBinding.vue'
import OrgRoleBinding from './components/OrgRoleBinding.vue'

const orgSchema = z.object({
  name: z.string().min(1, '组织名称不能为空').max(128, '组织名称长度不能超过 128 个字符'),
  description: z.string().max(256, '描述不能超过 256 个字符').optional().or(z.literal('')),
  status: z.boolean().optional(),
})

const formRules = computed<PfFormRules<Record<string, any>>>(() => ({
  schema: orgSchema,
}))

const columns = computed<PfDataTableItem<Organization>[]>(() => [
  {
    name: '组织ID',
    key: 'id',
    type: 'text',
    readonly: true,
    create: false,
    edit: false,
    query: false,
    table: { show: false },
  },
  {
    name: '组织名称',
    key: 'name',
    type: 'text',
    create: true,
    edit: true,
    query: true,
    rules: { required: true, max: 128 },
    table: { minWidth: 180 },
  },
  {
    name: '描述',
    key: 'description',
    type: 'text',
    create: true,
    edit: true,
    query: false,
    table: { minWidth: 220, textDisplay: 'ellipsis', tooltip: true },
  },
  {
    name: '状态',
    key: 'status',
    type: 'select',
    create: true,
    edit: true,
    query: true,
    options: [
      { label: '启用', value: true },
      { label: '禁用', value: false },
    ],
    defaultValue: true,
    table: {
      minWidth: 100,
      render: (row) => (row.status ? '启用' : '禁用'),
    },
  },
])

const defaultQuery = {
  name: '',
  status: undefined,
}

const handleListQuery = async (query: Record<string, any>) => {
  return await getOrganizations({
    name: query.name || undefined,
    status: query.status !== undefined && query.status !== '' ? query.status : undefined,
  })
}

const handleDetailQuery = async (id: string | number) => {
  return await getOrgDetail(String(id))
}

const handleCreate = async (payload: Record<string, any>) => {
  return await createOrg({
    name: payload.name,
    description: payload.description || null,
    status: payload.status ?? true,
  })
}

const handleUpdate = async (id: string | number, payload: Record<string, any>) => {
  return await updateOrg(String(id), {
    name: payload.name,
    description: payload.description || null,
    status: payload.status ?? true,
  })
}

const handleDelete = async (id: string | number) => {
  await deleteOrg(String(id))
}

// Member binding drawer
const memberOpen = ref(false)
const activeOrgId = ref('')
const activeOrgName = ref('')

const openMemberBinding = (row: Record<string, any>) => {
  activeOrgId.value = row.id
  activeOrgName.value = row.name
  memberOpen.value = true
}

// Role binding drawer
const roleOpen = ref(false)

const openRoleBinding = (row: Record<string, any>) => {
  activeOrgId.value = row.id
  activeOrgName.value = row.name
  roleOpen.value = true
}
</script>

<template>
  <PageLayout mode="single" background="transparent">
    <pf-data-table
      :columns="columns"
      :query-key-base="orgKeys.all"
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
        <pf-button
          v-permission="'manage:organization:member'"
          size="tiny"
          type="info"
          variant="outline"
          @click="openMemberBinding(row)"
        >
          成员管理
        </pf-button>
        <pf-button
          v-permission="'manage:organization:role'"
          size="tiny"
          type="info"
          variant="outline"
          @click="openRoleBinding(row)"
        >
          角色绑定
        </pf-button>
      </template>
    </pf-data-table>
  </PageLayout>

  <OrgMemberBinding v-model:open="memberOpen" :org-id="activeOrgId" :org-name="activeOrgName" />

  <OrgRoleBinding v-model:open="roleOpen" :org-id="activeOrgId" :org-name="activeOrgName" />
</template>

<style scoped></style>
