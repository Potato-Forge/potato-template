<script setup lang="ts">
import 'vxe-table/lib/style.css'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { VxeColumn, VxeTable, VxeUI } from 'vxe-table'
import type { PfFormConfigItem, PfFormRules } from '@/components/pf/pf-form/PfForm.types'
import { pfToast } from '@/components/pf/pf-toast'
import { usePfModal } from '@/components/pf/pf-modal/usePfModal'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import PfDataTableDetail from './PfDataTableDetail.vue'
import PfDataTableForm from './PfDataTableForm.vue'
import PfDataTablePreviewValue from './PfDataTablePreviewValue.vue'
import type { PfDataTableContainerMode, PfDataTableItem } from './PfDataTable.types'

const props = withDefaults(
  defineProps<{
    columns: PfDataTableItem[]
    rowKey?: string
    queryKeyBase?: readonly unknown[]
    containerMode?: PfDataTableContainerMode
    defaultQuery?: Record<string, any>
    queryColumnsPerRow?: number
    listQuery?: (query: Record<string, any>) => Promise<Record<string, any>[]>
    detail?: (id: string | number) => Promise<Record<string, any>>
    create?: (payload: Record<string, any>) => Promise<Record<string, any>>
    update?: (id: string | number, payload: Record<string, any>) => Promise<Record<string, any>>
    delete?: (id: string | number, rowData: Record<string, any>) => Promise<void>
    formRules?: PfFormRules<Record<string, any>>
    tableData?: Record<string, any>[]
    tableLoading?: boolean
    hideCreate?: boolean
    hideDetail?: boolean
    hideEdit?: boolean
    hideDelete?: boolean
    /**
     * 是否在组件挂载后用 `defaultQuery` 自动拉取列表。
     * 设为 false 后用户必须显式点击"查询"按钮才会触发首次请求。
     * @default true
     */
    autoFetch?: boolean
  }>(),
  {
    rowKey: 'id',
    queryKeyBase: () => ['pf-data-table'] as const,
    containerMode: 'drawer',
    defaultQuery: () => ({}),
    queryColumnsPerRow: 3,
    listQuery: undefined,
    detail: undefined,
    create: undefined,
    update: undefined,
    delete: undefined,
    formRules: undefined,
    tableData: () => [],
    tableLoading: false,
    hideCreate: false,
    hideDetail: false,
    hideEdit: false,
    hideDelete: false,
    autoFetch: true,
  },
)

const emits = defineEmits<{
  (e: 'form-query', payload: Record<string, any>): void
  (e: 'created', payload: Record<string, any>): void
  (e: 'updated', payload: Record<string, any>): void
  (e: 'deleted', payload: string | number): void
}>()

const queryClient = useQueryClient()

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) return error.message
  return '操作失败，请稍后重试'
}

const getItemConfig = (item: PfDataTableItem) => {
  if ('config' in item) {
    return item.config
  }
  return undefined
}

const queryFormItems = computed<PfFormConfigItem[]>(() => {
  return props.columns
    .map((item) => {
      if (!item.query) return null

      if (item.query === true) {
        return {
          ...item,
          readonly: false,
          disabled: false,
        } as PfFormConfigItem
      }

      if (item.query.enable === false) return null

      return {
        ...item,
        name: item.query.name || item.name,
        type: item.query.type || item.type,
        default: item.query.default ?? item.default,
        help: item.query.help ?? item.help,
        rules: item.query.rules,
        config: item.query.config ?? getItemConfig(item),
        readonly: false,
        disabled: false,
      } as PfFormConfigItem
    })
    .filter((item): item is PfFormConfigItem => Boolean(item))
})

// `submittedQuery` 只在用户显式点击"查询/重置"或父组件 defaultQuery 变更时同步,
// 其他时刻打字不会触发请求 —— listQueryKey 以它为唯一驱动源。
const submittedQuery = ref<Record<string, any>>({ ...props.defaultQuery })
// 标记用户是否手动修改过查询 —— true 后父组件的 defaultQuery 变化不再覆盖用户输入。
const userInteractedQuery = ref(false)

watch(
  () => props.defaultQuery,
  (next) => {
    if (userInteractedQuery.value) return
    submittedQuery.value = { ...next }
  },
  { deep: true },
)

const listQueryKey = computed(() => [...props.queryKeyBase, 'list', submittedQuery.value])

const {
  data: queryRows,
  isLoading: isListLoading,
  isFetching: isListFetching,
  refetch,
} = useQuery({
  queryKey: listQueryKey,
  queryFn: () => props.listQuery?.(submittedQuery.value) || Promise.resolve([]),
  // autoFetch=false 时等到 userInteractedQuery 为 true 再发起请求,实现"显式查询"语义。
  enabled: computed(
    () => Boolean(props.listQuery) && (props.autoFetch || userInteractedQuery.value),
  ),
})

const rows = computed(() => {
  if (props.listQuery) {
    return queryRows.value || []
  }
  return props.tableData
})

const tableRows = computed<Record<string, any>[]>(() => {
  return (rows.value || []).map((row) => ({ ...(row || {}) }))
})

const isTableLoading = computed(() => {
  if (props.listQuery) return isListLoading.value || isListFetching.value
  return props.tableLoading
})

const tableColumns = computed(() => props.columns.filter((item) => item.table?.show !== false))

const queryFormRef = useTemplateRef('queryFormRef')
const isQuerySubmitting = ref(false)
const isResettingQuery = ref(false)
const isQueryBusy = computed(
  () => isQuerySubmitting.value || isResettingQuery.value || isListFetching.value,
)

const handleQuerySubmit = async (payload: Record<string, any>) => {
  isQuerySubmitting.value = true
  userInteractedQuery.value = true

  const nextQuery = { ...payload }
  // 若与当前 submittedQuery 引用深度相等,key 不变,tanstack-query 不会自动重发 —— 显式 refetch 以尊重用户意图。
  const shouldForceRefetch = isShallowEqual(nextQuery, submittedQuery.value)
  submittedQuery.value = nextQuery
  emits('form-query', nextQuery)

  try {
    await nextTick()
    if (shouldForceRefetch && props.listQuery) {
      await refetch()
    }
  } finally {
    isQuerySubmitting.value = false
  }
}

const triggerQuery = () => {
  queryFormRef.value?.submit()
}

const resetQuery = async () => {
  isResettingQuery.value = true

  try {
    queryFormRef.value?.reset()
    const nextQuery = { ...props.defaultQuery }
    const shouldForceRefetch = isShallowEqual(nextQuery, submittedQuery.value)
    submittedQuery.value = nextQuery
    userInteractedQuery.value = true
    emits('form-query', nextQuery)
    await nextTick()
    if (shouldForceRefetch && props.listQuery) {
      await refetch()
    }
  } finally {
    isResettingQuery.value = false
  }
}

const isShallowEqual = (a: Record<string, any>, b: Record<string, any>) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    if (a[key] !== b[key]) return false
  }
  return true
}

const opened = ref(false)
const panelMode = ref<'detail' | 'create' | 'edit' | null>(null)
const activeRow = ref<Record<string, any> | null>(null)
const activeRowId = ref<string | number | null>(null)

const resolveRowId = (row: Record<string, any>) => row?.[props.rowKey]

const openCreate = () => {
  panelMode.value = 'create'
  activeRow.value = null
  activeRowId.value = null
  opened.value = true
}

const openEdit = (row: Record<string, any>) => {
  panelMode.value = 'edit'
  activeRow.value = { ...row }
  activeRowId.value = resolveRowId(row)
  opened.value = true
}

const openDetail = (row: Record<string, any>) => {
  panelMode.value = 'detail'
  activeRow.value = { ...row }
  activeRowId.value = resolveRowId(row)
  opened.value = true
}

const closePanel = () => {
  opened.value = false
}

watch(opened, (val) => {
  if (!val) {
    panelMode.value = null
    activeRow.value = null
    activeRowId.value = null
  }
})

const detailQueryKey = computed(() => [...props.queryKeyBase, 'detail', activeRowId.value])

const {
  data: detailData,
  isLoading: isDetailLoading,
  isError: isDetailError,
  error: detailError,
} = useQuery({
  queryKey: detailQueryKey,
  queryFn: () => props.detail?.(activeRowId.value as string | number) || Promise.resolve({}),
  enabled: computed(
    () =>
      opened.value && panelMode.value === 'detail' && Boolean(props.detail) && !!activeRowId.value,
  ),
})

const createMutation = useMutation({
  mutationFn: async (payload: Record<string, any>) => {
    if (!props.create) throw new Error('未配置 create')
    return props.create(payload)
  },
  onSuccess: (saved) => {
    queryClient.invalidateQueries({ queryKey: props.queryKeyBase })
    pfToast.success('创建成功')
    emits('created', saved)
    closePanel()
  },
  onError: (error) => {
    pfToast.error('创建失败', getErrorMessage(error))
  },
})

const updateMutation = useMutation({
  mutationFn: async (payload: Record<string, any>) => {
    if (!props.update) throw new Error('未配置 update')
    const rowId = activeRowId.value
    if (!rowId) throw new Error('缺少更新 id')
    return props.update(rowId, payload)
  },
  onMutate: async (payload) => {
    const rowId = activeRowId.value
    if (!rowId) return { previous: [] as Record<string, any>[] }

    // 取消整棵 queryKeyBase 下的进行中请求,防止它们回来覆盖乐观补丁。
    await queryClient.cancelQueries({ queryKey: props.queryKeyBase })
    const previous = queryClient.getQueryData<Record<string, any>[]>(listQueryKey.value) || []

    queryClient.setQueryData<Record<string, any>[]>(listQueryKey.value, (old = []) =>
      old.map((item) => (resolveRowId(item) === rowId ? { ...item, ...payload } : item)),
    )

    return { previous }
  },
  onSuccess: (saved) => {
    // 乐观补丁已生效;invalidate 触发 server truth 重新拉取,无需再 setQueryData 一次。
    queryClient.invalidateQueries({ queryKey: props.queryKeyBase })
    pfToast.success('更新成功')
    emits('updated', saved)
    closePanel()
  },
  onError: (error, _payload, context) => {
    if (context?.previous) {
      queryClient.setQueryData(listQueryKey.value, context.previous)
    }
    pfToast.error('更新失败', getErrorMessage(error))
  },
})

const deleteMutation = useMutation({
  mutationFn: async (row: Record<string, any>) => {
    if (!props.delete) throw new Error('未配置 delete')
    const rowId = resolveRowId(row)
    if (!rowId) throw new Error('缺少删除 id')
    await props.delete(rowId, row)
    return rowId
  },
  onSuccess: (rowId) => {
    queryClient.invalidateQueries({ queryKey: props.queryKeyBase })
    emits('deleted', rowId)
    pfToast.success('删除成功')
  },
  onError: (error) => {
    pfToast.error('删除失败', getErrorMessage(error))
  },
})

const handleFormSubmit = async (payload: Record<string, any>) => {
  if (panelMode.value === 'create') {
    await createMutation.mutateAsync(payload)
    return
  }

  if (panelMode.value === 'edit') {
    await updateMutation.mutateAsync(payload)
  }
}

const pfModal = usePfModal()

const deletingRowId = computed<string | number | null>(() => {
  if (!deleteMutation.isPending.value || !deleteMutation.variables) return null
  return resolveRowId(deleteMutation.variables)
})

const isRowDeleting = (row: Record<string, any>) => {
  return deletingRowId.value !== null && resolveRowId(row) === deletingRowId.value
}

const openDeleteConfirm = async (row: Record<string, any>) => {
  if (deleteMutation.isPending.value) return

  await pfModal.confirm({
    title: '确认删除',
    description: '删除后数据不可恢复,确定要继续吗?',
    positiveText: '确认删除',
    negativeText: '取消',
    // pf-modal 会在 onPositive 执行期间自动显示 positiveLoading 态,
    // 无需手动管理气泡 open/close 状态。
    onPositive: async () => {
      await deleteMutation.mutateAsync(row)
    },
  })
}

const panelTitle = computed(() => {
  if (panelMode.value === 'create') return '新增数据'
  if (panelMode.value === 'edit') return '编辑数据'
  return '详情预览'
})

const detailPayload = computed(() => {
  if (!props.detail) return activeRow.value
  return detailData.value || null
})

const isFormSaving = computed(
  () => createMutation.isPending.value || updateMutation.isPending.value,
)

const showQuery = computed(() => queryFormItems.value.length > 0)
const queryButtonText = computed(() => (isQueryBusy.value ? '查询中...' : '查询'))
const resetButtonText = computed(() => (isResettingQuery.value ? '重置中...' : '重置'))

// light/dark switch
const isDark = useDark()
watch(
  isDark,
  (val) => {
    if (val) VxeUI.setTheme('dark')
    else VxeUI.setTheme('light')
  },
  { immediate: true },
)
</script>

<template>
  <div class="h-full flex flex-col gap-4 p-4">
    <pf-card v-if="showQuery" border class="p-4">
      <pf-form
        ref="queryFormRef"
        :form-config="queryFormItems"
        :form-data="defaultQuery"
        :columns-per-row="queryColumnsPerRow"
        :on-submit="handleQuerySubmit"
      />

      <div class="mt-4 flex items-center justify-end gap-2">
        <pf-button
          icon="i-tabler-search"
          variant="secondary"
          type="info"
          :disabled="isQueryBusy"
          @click="triggerQuery"
        >
          {{ queryButtonText }}</pf-button
        >
        <pf-button
          icon="i-tabler-refresh"
          variant="ghost"
          type="warning"
          :disabled="isQueryBusy"
          @click="resetQuery"
          >{{ resetButtonText }}</pf-button
        >
        <pf-button
          icon="i-tabler-plus"
          v-if="!hideCreate"
          :disabled="isTableLoading"
          @click="openCreate"
          >新增</pf-button
        >
      </div>
    </pf-card>

    <div v-else-if="!hideCreate" class="flex items-center justify-end">
      <pf-button icon="i-tabler-plus" :disabled="isTableLoading" @click="openCreate"
        >新增</pf-button
      >
    </div>

    <div class="min-h-0 flex-1 overflow-hidden rounded-md border border-border">
      <pf-loading :loading="isTableLoading" text="加载数据中...">
        <vxe-table
          class="pf-data-table-vxe"
          :data="tableRows"
          :row-config="{ keyField: rowKey }"
          stripe
          border
          auto-resize
          height="auto"
        >
          <vxe-column
            v-for="item in tableColumns"
            :key="String(item.key)"
            :field="String(item.key)"
            :title="item.name"
            :width="item.table?.width"
            :min-width="item.table?.minWidth || 160"
            :max-width="item.table?.maxWidth"
            :align="item.table?.align"
            :sortable="item.table?.sortable"
          >
            <template #default="{ row }">
              <pf-data-table-preview-value :item="item" :row-data="row" scene="table" />
            </template>
          </vxe-column>

          <vxe-column title="操作" width="230" fixed="right" align="center">
            <template #default="{ row }">
              <div class="flex items-center justify-center gap-2">
                <pf-button v-if="!hideDetail" size="sm" variant="outline" @click="openDetail(row)">
                  详情
                </pf-button>
                <pf-button v-if="!hideEdit" size="sm" variant="outline" @click="openEdit(row)">
                  编辑
                </pf-button>
                <div v-if="!hideDelete">
                  <pf-button
                    size="sm"
                    variant="destructive"
                    :disabled="deleteMutation.isPending.value"
                    @click="openDeleteConfirm(row)"
                  >
                    {{ isRowDeleting(row) ? '删除中...' : '删除' }}
                  </pf-button>
                </div>
              </div>
            </template>
          </vxe-column>
        </vxe-table>
      </pf-loading>

      <pf-empty
        v-if="!isTableLoading && tableRows.length === 0"
        title="暂无数据"
        description="请调整查询条件后重试"
      />
    </div>
  </div>

  <Sheet v-if="containerMode === 'drawer'" v-model:open="opened">
    <SheetContent side="right" class="w-full flex flex-col sm:max-w-2xl">
      <SheetHeader class="shrink-0">
        <SheetTitle>{{ panelTitle }}</SheetTitle>
      </SheetHeader>

      <div class="min-h-0 flex-1 overflow-auto py-4">
        <pf-data-table-detail
          v-if="panelMode === 'detail'"
          :columns="columns"
          :data="detailPayload"
          :loading="isDetailLoading"
          :error="isDetailError ? getErrorMessage(detailError) : null"
        />

        <pf-data-table-form
          v-else-if="panelMode === 'create' || panelMode === 'edit'"
          :columns="columns"
          :mode="panelMode"
          :form-data="activeRow"
          :form-rules="formRules"
          :loading="isFormSaving"
          @submit="handleFormSubmit"
          @cancel="closePanel"
        />
      </div>
    </SheetContent>
  </Sheet>

  <Dialog v-else v-model:open="opened">
    <DialogContent class="max-h-[90vh] max-w-4xl flex flex-col overflow-hidden">
      <DialogHeader class="shrink-0">
        <DialogTitle>{{ panelTitle }}</DialogTitle>
        <DialogDescription class="sr-only">
          {{ panelMode === 'detail' ? '查看当前记录详情' : '编辑当前记录表单' }}
        </DialogDescription>
      </DialogHeader>

      <div class="min-h-0 flex-1 overflow-auto">
        <pf-data-table-detail
          v-if="panelMode === 'detail'"
          :columns="columns"
          :data="detailPayload"
          :loading="isDetailLoading"
          :error="isDetailError ? getErrorMessage(detailError) : null"
        />

        <pf-data-table-form
          v-else-if="panelMode === 'create' || panelMode === 'edit'"
          :columns="columns"
          :mode="panelMode"
          :form-data="activeRow"
          :form-rules="formRules"
          :loading="isFormSaving"
          @submit="handleFormSubmit"
          @cancel="closePanel"
        />
      </div>
    </DialogContent>
  </Dialog>
</template>

<style>
.pf-data-table-vxe {
  --vxe-ui-layout-background-color: hsl(var(--background));
  --vxe-ui-table-header-background-color: hsl(var(--accent));
  --vxe-ui-table-border-color: hsl(var(--border));
  --vxe-ui-table-row-hover-background-color: hsl(var(--muted));
  --vxe-ui-table-row-striped-background-color: hsl(var(--secondary));
  --vxe-ui-table-row-hover-striped-background-color: hsl(var(--muted));
  --vxe-ui-table-row-current-background-color: hsl(var(--selected));
  --vxe-ui-table-row-hover-current-background-color: hsl(var(--selected));
  --vxe-ui-font-color: hsl(var(--foreground));
  --vxe-ui-font-primary-color: hsl(var(--primary));
}
</style>
