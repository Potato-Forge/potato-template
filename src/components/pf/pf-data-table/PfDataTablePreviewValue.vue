<script setup lang="ts">
import { format } from 'date-fns'
import { Icon } from '@iconify/vue'
import type { PfDataTableItem } from './PfDataTable.types'

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

const customRenderComponent = computed(() => {
  if (!props.item.render) return null

  return {
    render: () =>
      props.item.render?.(value.value, props.rowData, {
        scene: props.scene,
        column: props.item,
      }),
  }
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
</script>

<template>
  <component :is="customRenderComponent" v-if="customRenderComponent" />
  <div v-else-if="item.type === 'icon'" class="inline-flex items-center gap-2">
    <Icon v-if="iconValue" :icon="iconValue" class="text-lg" />
    <span>{{ iconValue || '-' }}</span>
  </div>
  <span v-else class="line-clamp-2 break-all">{{ normalizedText }}</span>
</template>
