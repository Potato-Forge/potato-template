<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { h } from 'vue'
import { formatISO, isValid, parse } from 'date-fns'
import { z } from 'zod'
import type { PfDataTableItem } from '@/components/pf/pf-data-table'
import type { PfFormRules } from '@/components/pf/pf-form/PfForm.types'
import { pfToast } from '@/components/pf/pf-toast'
import PageLayout from '@/layouts/page-layout/PageLayout.vue'
import {
  archiveAnnouncement,
  announcementKeys,
  createAnnouncement,
  getAnnouncementDetail,
  getAnnouncements,
  publishAnnouncement,
  updateAnnouncement,
  withdrawAnnouncement,
  type Announcement,
} from '@/api/notification/announcement'

const defaultQuery = {
  title: '',
  status: '',
  priority: '',
}

const schema = z.object({
  title: z.string().min(1, '公告标题不能为空').max(120, '公告标题长度不能超过 120 个字符'),
  summary: z.string().max(240, '摘要长度不能超过 240 个字符').optional().or(z.literal('')),
  content: z.string().min(1, '公告内容不能为空'),
  priority: z.string().min(1, '优先级不能为空'),
  expire_at: z.string().optional().or(z.literal('')),
})

const formRules = computed<PfFormRules<Record<string, any>>>(() => ({
  schema,
}))

const queryClient = useQueryClient()

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

const columns = computed<PfDataTableItem<Announcement>[]>(() => [
  {
    name: '公告ID',
    key: 'id',
    type: 'text',
    readonly: true,
    create: false,
    edit: false,
    query: false,
    table: { show: false },
  },
  {
    name: '公告标题',
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
    table: { minWidth: 220, textDisplay: 'ellipsis', tooltip: true },
  },
  {
    name: '公告内容',
    key: 'content',
    type: 'text',
    create: true,
    edit: true,
    query: false,
    table: { minWidth: 260, textDisplay: 'ellipsis', tooltip: true },
  },
  {
    name: '优先级',
    key: 'priority',
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
          { label: '低', value: 'low' },
          { label: '普通', value: 'normal' },
          { label: '高', value: 'high' },
          { label: '紧急', value: 'urgent' },
        ],
      },
      default: '',
    },
    config: {
      variant: 'combobox',
      options: [
        { label: '低', value: 'low' },
        { label: '普通', value: 'normal' },
        { label: '高', value: 'high' },
        { label: '紧急', value: 'urgent' },
      ],
    },
    default: 'normal',
    rules: { required: true },
    table: {
      width: 120,
      align: 'center',
      render: (value) =>
        renderBadge(String(value || 'normal'), {
          low: { label: '低', cls: 'bg-muted text-muted-foreground' },
          normal: { label: '普通', cls: 'bg-info/15 text-info' },
          high: { label: '高', cls: 'bg-warning/15 text-warning' },
          urgent: { label: '紧急', cls: 'bg-destructive/15 text-destructive' },
        }),
    },
  },
  {
    name: '状态',
    key: 'status',
    type: 'options',
    create: false,
    edit: false,
    query: {
      enable: true,
      type: 'options',
      config: {
        variant: 'combobox',
        options: [
          { label: '全部', value: '' },
          { label: '草稿', value: 'draft' },
          { label: '定时', value: 'scheduled' },
          { label: '已发布', value: 'published' },
          { label: '已过期', value: 'expired' },
          { label: '已归档', value: 'archived' },
        ],
      },
      default: '',
    },
    config: {
      variant: 'combobox',
      options: [
        { label: '草稿', value: 'draft' },
        { label: '定时', value: 'scheduled' },
        { label: '已发布', value: 'published' },
        { label: '已过期', value: 'expired' },
        { label: '已归档', value: 'archived' },
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
          published: { label: '已发布', cls: 'bg-success/15 text-success' },
          expired: { label: '已过期', cls: 'bg-warning/15 text-warning' },
          archived: { label: '已归档', cls: 'bg-muted text-muted-foreground' },
        }),
    },
  },
  {
    name: '允许评论',
    key: 'allow_comment',
    type: 'toggle',
    create: true,
    edit: true,
    query: false,
    default: true,
    config: { varient: 'switch' },
    table: { width: 120, align: 'center' },
  },
  {
    name: '置顶',
    key: 'pinned',
    type: 'toggle',
    create: true,
    edit: true,
    query: false,
    default: false,
    config: { varient: 'switch' },
    table: { width: 100, align: 'center' },
  },
  {
    name: '发布时间',
    key: 'publish_at',
    type: 'datetime',
    create: false,
    edit: false,
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
  {
    name: '更新时间',
    key: 'updated_at',
    type: 'datetime',
    readonly: true,
    create: false,
    edit: false,
    query: false,
    table: { minWidth: 180 },
  },
])

const handleListQuery = async (query: Record<string, any>) => {
  return await getAnnouncements({
    title: query.title || null,
    status: query.status || null,
    priority: query.priority || null,
  })
}

const handleDetailQuery = async (id: string | number) => {
  return await getAnnouncementDetail(String(id))
}

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

const handleCreate = async (payload: Record<string, any>) => {
  return await createAnnouncement({
    title: payload.title,
    summary: payload.summary || null,
    content: payload.content,
    priority: payload.priority || 'normal',
    status: 'draft',
    publish_at: null,
    expire_at: normalizeNullableDatetime(payload.expire_at),
    allow_comment: Boolean(payload.allow_comment),
    pinned: Boolean(payload.pinned),
  })
}

const handleUpdate = async (id: string | number, payload: Record<string, any>) => {
  return await updateAnnouncement(String(id), {
    title: payload.title,
    summary: payload.summary || null,
    content: payload.content,
    priority: payload.priority || 'normal',
    expire_at: normalizeNullableDatetime(payload.expire_at),
    allow_comment: Boolean(payload.allow_comment),
    pinned: Boolean(payload.pinned),
  })
}

const publishMutation = useMutation({
  mutationFn: async (row: Announcement) => publishAnnouncement(String(row.id)),
  onSuccess: async () => {
    pfToast.success('公告已发布')
    await queryClient.invalidateQueries({ queryKey: announcementKeys.all })
  },
  onError: (error) => {
    pfToast.error('发布失败', error instanceof Error ? error.message : '发布公告失败')
  },
})

const withdrawMutation = useMutation({
  mutationFn: async (row: Announcement) => withdrawAnnouncement(String(row.id)),
  onSuccess: async () => {
    pfToast.success('公告已撤回')
    await queryClient.invalidateQueries({ queryKey: announcementKeys.all })
  },
  onError: (error) => {
    pfToast.error('撤回失败', error instanceof Error ? error.message : '撤回公告失败')
  },
})

const handlePublish = async (row: Announcement) => {
  await publishMutation.mutateAsync(row)
}

const handleWithdraw = async (row: Announcement) => {
  await withdrawMutation.mutateAsync(row)
}

const handleDelete = async (id: string | number) => {
  await archiveAnnouncement(String(id))
  pfToast.success('公告已删除')
  await queryClient.invalidateQueries({ queryKey: announcementKeys.all })
}

const isPublishingRow = (row: Announcement) => {
  return publishMutation.isPending.value && publishMutation.variables.value?.id === row.id
}

const isWithdrawingRow = (row: Announcement) => {
  return withdrawMutation.isPending.value && withdrawMutation.variables.value?.id === row.id
}
</script>

<template>
  <PageLayout mode="single" background="transparent">
    <pf-data-table
      :columns="columns"
      :query-key-base="announcementKeys.all"
      :default-query="defaultQuery"
      :list-query="handleListQuery"
      :detail="handleDetailQuery"
      :create="handleCreate"
      :update="handleUpdate"
      :delete="handleDelete"
      :form-rules="formRules"
      :action-column="{ widthMode: 'auto', minWidth: 360 }"
      container-mode="drawer"
      row-key="id"
    >
      <template #extra-actions="{ row }">
        <pf-button
          v-if="row.status !== 'published'"
          size="tiny"
          variant="default"
          :disabled="isPublishingRow(row)"
          @click="handlePublish(row)"
        >
          {{ isPublishingRow(row) ? '发布中...' : '发布' }}
        </pf-button>
        <pf-button
          v-else
          size="tiny"
          variant="ghost"
          type="warning"
          :disabled="isWithdrawingRow(row)"
          @click="handleWithdraw(row)"
        >
          {{ isWithdrawingRow(row) ? '撤回中...' : '撤回' }}
        </pf-button>
      </template>
    </pf-data-table>
  </PageLayout>
</template>

<style scoped></style>
