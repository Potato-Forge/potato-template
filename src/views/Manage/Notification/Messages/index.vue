<script setup lang="ts">
import { h } from 'vue'
import { formatISO, isValid, parse } from 'date-fns'
import { z } from 'zod'
import type { PfDataTableItem } from '@/components/pf/pf-data-table'
import type { PfFormRules } from '@/components/pf/pf-form/PfForm.types'
import { pfToast } from '@/components/pf/pf-toast/usePfToast'
import PageLayout from '@/layouts/page-layout/PageLayout.vue'
import {
  createSystemMessage,
  deleteSystemMessage,
  dispatchSystemMessage,
  getSystemMessageDetail,
  getSystemMessages,
  normalizeDelimitedValues,
  systemMessageKeys,
  updateSystemMessage,
  type SystemMessage,
} from '@/api/notification/message'

type SystemMessageFormModel = SystemMessage & {
  target_role_codes_input?: string
  target_user_ids_input?: string
}

const defaultQuery = {
  title: '',
  messageType: '',
  sendStatus: '',
}

const schema = z.object({
  title: z.string().min(1, '消息标题不能为空').max(120, '消息标题长度不能超过 120 个字符'),
  summary: z.string().max(240, '摘要长度不能超过 240 个字符').optional().or(z.literal('')),
  content: z.string().min(1, '消息内容不能为空'),
  message_type: z.string().min(1, '消息类型不能为空'),
  target_type: z.string().min(1, '发送对象不能为空'),
  send_status: z.string().min(1, '发送状态不能为空'),
  send_at: z.string().optional().or(z.literal('')),
  expire_at: z.string().optional().or(z.literal('')),
  source_module: z.string().max(64, '来源模块长度不能超过 64 个字符').optional().or(z.literal('')),
  source_event: z.string().max(64, '来源事件长度不能超过 64 个字符').optional().or(z.literal('')),
  target_role_codes_input: z.string().optional().or(z.literal('')),
  target_user_ids_input: z.string().optional().or(z.literal('')),
})

const formRules = computed<PfFormRules<Record<string, any>>>(() => ({
  schema,
}))

const renderBadge = (value: string, mapping: Record<string, { label: string; cls: string }>) => {
  const target = mapping[value] ?? { label: value || '-', cls: 'bg-muted text-muted-foreground' }
  return h(
    'span',
    {
      class: `inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${target.cls}`,
    },
    target.label,
  )
}

const mapMessageForForm = (message: SystemMessage): SystemMessageFormModel => ({
  ...message,
  target_role_codes_input: message.target_role_codes.join(', '),
  target_user_ids_input: message.target_user_ids.join(', '),
})

const columns = computed<PfDataTableItem<SystemMessageFormModel>[]>(() => [
  {
    name: '消息ID',
    key: 'id',
    type: 'text',
    readonly: true,
    create: false,
    edit: false,
    query: false,
    table: { show: false },
  },
  {
    name: '消息标题',
    key: 'title',
    type: 'text',
    create: true,
    edit: true,
    query: true,
    rules: { required: true, max: 120 },
    table: { minWidth: 220 },
  },
  {
    name: '摘要',
    key: 'summary',
    type: 'text',
    create: true,
    edit: true,
    query: false,
    table: { minWidth: 200, textDisplay: 'ellipsis', tooltip: true },
  },
  {
    name: '消息内容',
    key: 'content',
    type: 'text',
    create: true,
    edit: true,
    query: false,
    table: { minWidth: 260, textDisplay: 'ellipsis', tooltip: true },
  },
  {
    name: '消息类型',
    key: 'message_type',
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
          { label: '通知', value: 'info' },
          { label: '成功', value: 'success' },
          { label: '警告', value: 'warning' },
          { label: '错误', value: 'error' },
        ],
      },
      default: '',
    },
    config: {
      variant: 'combobox',
      options: [
        { label: '通知', value: 'info' },
        { label: '成功', value: 'success' },
        { label: '警告', value: 'warning' },
        { label: '错误', value: 'error' },
      ],
    },
    default: 'info',
    rules: { required: true },
    table: {
      width: 120,
      align: 'center',
      render: (value) =>
        renderBadge(String(value || 'info'), {
          info: { label: '通知', cls: 'bg-info/15 text-info' },
          success: { label: '成功', cls: 'bg-success/15 text-success' },
          warning: { label: '警告', cls: 'bg-warning/15 text-warning' },
          error: { label: '错误', cls: 'bg-destructive/15 text-destructive' },
        }),
    },
  },
  {
    name: '发送对象',
    key: 'target_type',
    type: 'options',
    create: true,
    edit: true,
    query: false,
    config: {
      variant: 'combobox',
      options: [
        { label: '全员', value: 'all' },
        { label: '指定用户', value: 'users' },
        { label: '指定角色', value: 'roles' },
      ],
    },
    default: 'all',
    rules: { required: true },
    table: {
      width: 120,
      align: 'center',
      render: (value) =>
        renderBadge(String(value || 'all'), {
          all: { label: '全员', cls: 'bg-info/15 text-info' },
          users: { label: '指定用户', cls: 'bg-warning/15 text-warning' },
          roles: { label: '指定角色', cls: 'bg-success/15 text-success' },
        }),
    },
  },
  {
    name: '角色编码',
    key: 'target_role_codes_input',
    type: 'text',
    create: true,
    edit: true,
    query: false,
    help: '多个角色编码用英文逗号分隔，仅在发送对象为指定角色时生效',
    table: { minWidth: 200, textDisplay: 'ellipsis', tooltip: true },
  },
  {
    name: '用户ID列表',
    key: 'target_user_ids_input',
    type: 'text',
    create: true,
    edit: true,
    query: false,
    help: '多个用户 ID 用英文逗号分隔，仅在发送对象为指定用户时生效',
    table: { minWidth: 200, textDisplay: 'ellipsis', tooltip: true },
  },
  {
    name: '发送状态',
    key: 'send_status',
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
          { label: '草稿', value: 'draft' },
          { label: '定时', value: 'scheduled' },
          { label: '已发送', value: 'sent' },
          { label: '已取消', value: 'cancelled' },
        ],
      },
      default: '',
    },
    config: {
      variant: 'combobox',
      options: [
        { label: '草稿', value: 'draft' },
        { label: '定时', value: 'scheduled' },
        { label: '已发送', value: 'sent' },
        { label: '已取消', value: 'cancelled' },
      ],
    },
    default: 'draft',
    rules: { required: true },
    table: {
      width: 120,
      align: 'center',
      render: (value) =>
        renderBadge(String(value || 'draft'), {
          draft: { label: '草稿', cls: 'bg-muted text-muted-foreground' },
          scheduled: { label: '定时', cls: 'bg-info/15 text-info' },
          sent: { label: '已发送', cls: 'bg-success/15 text-success' },
          cancelled: { label: '已取消', cls: 'bg-warning/15 text-warning' },
        }),
    },
  },
  {
    name: '来源模块',
    key: 'source_module',
    type: 'text',
    create: true,
    edit: true,
    query: false,
    table: { minWidth: 140 },
  },
  {
    name: '来源事件',
    key: 'source_event',
    type: 'text',
    create: true,
    edit: true,
    query: false,
    table: { minWidth: 140 },
  },
  {
    name: '计划发送时间',
    key: 'send_at',
    type: 'datetime',
    create: true,
    edit: true,
    query: false,
    table: { minWidth: 180 },
  },
  {
    name: '过期时间',
    key: 'expire_at',
    type: 'datetime',
    create: true,
    edit: true,
    query: false,
    table: { minWidth: 180 },
  },
  {
    name: '创建时间',
    key: 'created_at',
    type: 'datetime',
    readonly: true,
    create: false,
    edit: false,
    query: false,
    table: { minWidth: 180 },
  },
])

const notificationDatetimeFormat = 'yyyy-MM-dd HH:mm:ss'

const normalizeNullableDatetime = (value: unknown) => {
  const normalized = String(value || '').trim()
  if (!normalized) return null

  const parsedByDisplay = parse(normalized, notificationDatetimeFormat, new Date())
  if (isValid(parsedByDisplay)) {
    return formatISO(parsedByDisplay)
  }

  const parsedByNative = new Date(normalized)
  if (!Number.isNaN(parsedByNative.getTime())) {
    return parsedByNative.toISOString()
  }

  return normalized
}

const handleListQuery = async (query: Record<string, any>) => {
  const data = await getSystemMessages({
    title: query.title || null,
    messageType: query.messageType || null,
    sendStatus: query.sendStatus || null,
  })

  return data.map((item) => mapMessageForForm(item))
}

const handleDetailQuery = async (id: string | number) => {
  return mapMessageForForm(await getSystemMessageDetail(String(id)))
}

const buildPayload = (payload: Record<string, any>) => ({
  title: payload.title,
  summary: payload.summary || null,
  content: payload.content,
  message_type: payload.message_type || 'info',
  target_type: payload.target_type || 'all',
  target_role_codes: normalizeDelimitedValues(payload.target_role_codes_input),
  target_user_ids: normalizeDelimitedValues(payload.target_user_ids_input),
  send_status: payload.send_status || 'draft',
  send_at: normalizeNullableDatetime(payload.send_at),
  expire_at: normalizeNullableDatetime(payload.expire_at),
  source_module: payload.source_module || null,
  source_event: payload.source_event || null,
})

const handleCreate = async (payload: Record<string, any>) => {
  return await createSystemMessage(buildPayload(payload))
}

const handleUpdate = async (id: string | number, payload: Record<string, any>) => {
  return await updateSystemMessage(String(id), buildPayload(payload))
}

const handleDelete = async (id: string | number) => {
  await deleteSystemMessage(String(id))
}

const handleDispatch = async (row: Record<string, any>) => {
  const count = await dispatchSystemMessage(String(row.id))
  pfToast.success('系统消息已发送', `本次共投递 ${count || 0} 条接收记录`)
}
</script>

<template>
  <PageLayout mode="single" background="transparent">
    <pf-data-table
      :columns="columns"
      :query-key-base="systemMessageKeys.all"
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
          size="tiny"
          type="info"
          variant="outline"
          :disabled="row.send_status === 'sent'"
          @click="handleDispatch(row)"
        >
          立即发送
        </pf-button>
      </template>
    </pf-data-table>
  </PageLayout>
</template>

<style scoped></style>
