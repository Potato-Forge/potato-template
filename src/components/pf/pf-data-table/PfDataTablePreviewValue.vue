<script setup lang="ts">
import { format } from 'date-fns'
import { Icon } from '@iconify/vue'
import type { PfDataTableItem } from './PfDataTable.types'
import { pfToast } from '../pf-toast'

const props = withDefaults(
  defineProps<{
    item: PfDataTableItem
    rowData: Record<string, any>
    scene?: 'table' | 'detail'
  }>(),
  {
    scene: 'table',
  },
)

const value = computed(() => props.rowData?.[String(props.item.key)])

const customRenderNode = computed(() => {
  if (props.scene === 'table' && props.item.table?.render) {
    return props.item.table.render(value.value, props.rowData)
  }

  if (props.scene === 'detail' && props.item.detail?.render) {
    return props.item.detail.render(value.value, props.rowData)
  }

  if (!props.item.render) return null

  return props.item.render(value.value, props.rowData, {
    scene: props.scene,
    column: props.item,
  })
})

const isPrimitiveCustomRender = computed(() => {
  return (
    typeof customRenderNode.value === 'string' ||
    typeof customRenderNode.value === 'number' ||
    typeof customRenderNode.value === 'boolean'
  )
})

const optionsMap = computed(() => {
  if (props.item.type !== 'options') return new Map<any, string>()

  const options = props.item.config?.options || []
  return new Map<any, string>(
    options.map((option: { label: string; value: any }) => [option.value, option.label]),
  )
})

const normalizedText = computed(() => {
  const raw = value.value

  if (raw === null || raw === undefined || raw === '') {
    return '-'
  }

  if (props.item.type === 'datetime' || props.item.type === 'date' || props.item.type === 'time') {
    try {
      return format(new Date(raw as string | number | Date), 'yyyy-MM-dd HH:mm:ss')
    } catch {
      return String(raw)
    }
  }

  if (props.item.type === 'options') {
    if (Array.isArray(raw)) {
      return raw.map((item) => optionsMap.value.get(item) || String(item)).join(', ')
    }

    return optionsMap.value.get(raw) || String(raw)
  }

  if (props.item.type === 'toggle') {
    return raw ? '是' : '否'
  }

  if (typeof raw === 'object') {
    return JSON.stringify(raw)
  }

  return String(raw)
})

const iconValue = computed(() => {
  if (props.item.type !== 'icon') return null
  if (!value.value) return null
  return String(value.value)
})

const tableTextDisplay = computed(() => {
  if (props.scene !== 'table') return 'wrap' as const
  return props.item.table?.textDisplay || 'wrap'
})

const tableTextClass = computed(() => {
  if (tableTextDisplay.value === 'single-line') {
    return 'block max-w-full whitespace-nowrap'
  }

  if (tableTextDisplay.value === 'wrap') {
    return 'block max-w-full whitespace-normal break-words'
  }

  return 'block max-w-full overflow-hidden text-ellipsis whitespace-nowrap'
})

const tableTextRef = ref<HTMLElement | null>(null)
const isTextOverflowing = ref(false)

const updateOverflowState = () => {
  const el = tableTextRef.value
  if (!el) {
    isTextOverflowing.value = false
    return
  }

  // Add a tiny tolerance to avoid sub-pixel jitter.
  isTextOverflowing.value = el.scrollWidth > el.clientWidth + 1
}

watch(
  [normalizedText, tableTextDisplay, () => props.scene],
  async () => {
    await nextTick()
    updateOverflowState()
  },
  { immediate: true },
)

useResizeObserver(tableTextRef, () => {
  updateOverflowState()
})

const showTableTooltip = computed(() => {
  if (props.scene !== 'table') return false
  if (tableTextDisplay.value !== 'ellipsis') return false
  if (props.item.table?.tooltip === false) return false
  return isTextOverflowing.value
})

const customRenderAlignClass = computed(() => {
  if (props.scene !== 'table') return ''
  const align = props.item.table?.align
  if (align === 'center') return 'justify-center'
  if (align === 'right') return 'justify-end'
  return 'justify-start'
})

// clipboard
const { copy, isSupported } = useClipboard({
  source: normalizedText.value,
})
const handleTextCopy = () => {
  if (!isSupported.value) {
    pfToast.error('当前环境不支持复制功能')
    return
  }
  copy()
  pfToast.success('复制成功', { position: 'top-right' })
}
</script>

<template>
  <div
    v-if="customRenderNode !== null && customRenderNode !== undefined"
    class="flex w-full items-center"
    :class="customRenderAlignClass"
  >
    <span v-if="isPrimitiveCustomRender" :class="tableTextClass">{{
      String(customRenderNode)
    }}</span>
    <component v-else :is="customRenderNode" />
  </div>
  <div v-else-if="item.type === 'icon'" class="inline-flex items-center gap-2">
    <Icon v-if="iconValue" :icon="iconValue" class="text-lg" />
    <span>{{ iconValue || '-' }}</span>
  </div>
  <pf-tooltip
    v-else-if="showTableTooltip"
    :content="normalizedText"
    placement="top"
    :interactive="true"
  >
    <span ref="tableTextRef" :class="tableTextClass">{{ normalizedText }}</span>
    <template #content>
      <div>
        <div class="max-w-xs break-words text-left text-sm text-gray-200">{{ normalizedText }}</div>
        <pf-button
          size="tiny"
          @click="handleTextCopy"
          class="mt-2 inline"
          icon="i-tabler-copy"
        ></pf-button>
      </div>
    </template>
  </pf-tooltip>
  <span v-else ref="tableTextRef" :class="tableTextClass">{{ normalizedText }}</span>
</template>
