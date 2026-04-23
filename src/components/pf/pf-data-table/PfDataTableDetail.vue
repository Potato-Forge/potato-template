<script setup lang="ts">
import type { PfDataTableItem } from './PfDataTable.types'
import PfDataTablePreviewValue from './PfDataTablePreviewValue.vue'

const props = withDefaults(
  defineProps<{
    title?: string
    columns: PfDataTableItem[]
    data?: Record<string, any> | null
    loading?: boolean
    error?: string | null
  }>(),
  {
    title: '详情预览',
    data: null,
    loading: false,
    error: null,
  },
)

const visibleColumns = computed(() => props.columns.filter((item) => item.detail?.show !== false))
</script>

<template>
  <div class="h-full flex flex-col gap-4">
    <pf-text as="h3" class="text-lg font-semibold">{{ title }}</pf-text>

    <div class="min-h-0 flex-1">
      <pf-loading :loading="loading" text="加载详情中...">
        <div v-if="error" class="flex h-full items-center justify-center text-destructive">
          {{ error }}
        </div>

        <pf-empty
          v-else-if="!data"
          title="暂无详情数据"
          description="请稍后重试或检查当前记录是否存在"
        />

        <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            v-for="item in visibleColumns"
            :key="String(item.key)"
            class="rounded-md border border-border bg-card p-3"
          >
            <pf-text as="p" class="mb-2 text-sm text-muted-foreground">{{ item.name }}</pf-text>
            <pf-data-table-preview-value :item="item" :row-data="data" scene="detail" />
          </div>
        </div>
      </pf-loading>
    </div>
  </div>
</template>
