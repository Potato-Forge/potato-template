<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { PfFormSelectOption } from '../PfForm.types'

const props = defineProps<{
  modelValue?: any
  multiple?: boolean
  variant?: 'combobox' | 'checkbox'
  options?: PfFormSelectOption[]
  optionsFn?: () => Promise<PfFormSelectOption[]>
  placeholder?: string
  searchable?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: any): void
  (e: 'blur'): void
}>()

// ── 选项加载 ──────────────────────────────────────────────
const resolvedOptions = ref<PfFormSelectOption[]>([])
const isLoadingOptions = ref(false)

watchEffect(async () => {
  if (props.optionsFn) {
    isLoadingOptions.value = true
    try {
      resolvedOptions.value = await props.optionsFn()
    } finally {
      isLoadingOptions.value = false
    }
  } else {
    resolvedOptions.value = props.options ?? []
  }
})

// ── 值处理 ────────────────────────────────────────────────
const normalizedValue = computed(() => {
  if (props.multiple) {
    if (!props.modelValue) return []
    return Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
  }
  return props.modelValue ?? null
})

const isSelected = (optionValue: any) => {
  if (props.multiple) {
    return (normalizedValue.value as any[]).some((v: any) => v === optionValue)
  }
  return normalizedValue.value === optionValue
}

const toggleOption = (optionValue: any) => {
  if (props.multiple) {
    const current = normalizedValue.value as any[]
    const next = isSelected(optionValue)
      ? current.filter((v) => v !== optionValue)
      : [...current, optionValue]
    emit('update:modelValue', next)
  } else {
    // 单选点击已选中项则取消
    const next = normalizedValue.value === optionValue ? null : optionValue
    emit('update:modelValue', next)
    emit('blur')
  }
}

// ── Combobox 下拉状态 ─────────────────────────────────────
const isOpen = ref(false)
const searchQuery = ref('')

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) return resolvedOptions.value
  const q = searchQuery.value.toLowerCase()
  return resolvedOptions.value.filter((opt) => {
    const searchSource = [opt.label, opt.description, opt.searchText].filter(Boolean).join(' ')
    return searchSource.toLowerCase().includes(q)
  })
})

const selectedLabels = computed(() => {
  if (props.multiple) {
    const vals = normalizedValue.value as any[]
    return resolvedOptions.value.filter((opt) => vals.includes(opt.value)).map((opt) => opt.label)
  }
  const found = resolvedOptions.value.find((opt) => opt.value === normalizedValue.value)
  return found ? [found.label] : []
})

const displayText = computed(() => {
  if (selectedLabels.value.length === 0) return props.placeholder || '请选择'
  if (props.multiple) {
    if (selectedLabels.value.length <= 2) return selectedLabels.value.join('、')
    return `${selectedLabels.value.slice(0, 2).join('、')} 等 ${selectedLabels.value.length} 项`
  }
  return selectedLabels.value[0]
})

const hasValue = computed(() =>
  props.multiple ? (normalizedValue.value as any[]).length > 0 : normalizedValue.value !== null,
)

const closeDropdown = () => {
  isOpen.value = false
  searchQuery.value = ''
  emit('blur')
}

const handleMultiConfirm = () => {
  closeDropdown()
}

const handleMultiClear = () => {
  emit('update:modelValue', [])
  closeDropdown()
}

// 点击外部关闭
const containerRef = ref<HTMLElement | null>(null)
onMounted(() => {
  const handler = (e: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
      if (isOpen.value) closeDropdown()
    }
  }
  document.addEventListener('mousedown', handler)
  onBeforeUnmount(() => document.removeEventListener('mousedown', handler))
})
</script>

<template>
  <!-- ── Combobox 变体 ─────────────────────────── -->
  <div v-if="variant === 'combobox' || !variant" ref="containerRef" class="relative w-full">
    <!-- 触发按钮 -->
    <button
      type="button"
      :disabled="disabled || isLoadingOptions"
      class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-accent/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      :class="isOpen ? 'ring-2 ring-ring ring-offset-2' : ''"
      @click="isOpen = !isOpen"
    >
      <span :class="hasValue ? 'text-foreground' : 'text-muted-foreground'">
        <span v-if="isLoadingOptions" class="text-muted-foreground">加载中...</span>
        <span v-else>{{ displayText }}</span>
      </span>
      <Icon
        icon="tabler:chevron-down"
        class="ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </button>

    <!-- 已选标签（多选时显示） -->
    <div v-if="multiple && (normalizedValue as any[]).length > 0" class="mt-1 flex flex-wrap gap-1">
      <span
        v-for="label in selectedLabels"
        :key="label"
        class="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary"
      >
        {{ label }}
        <Icon
          icon="tabler:x"
          class="h-3 w-3 cursor-pointer hover:text-destructive"
          @click.stop="toggleOption(resolvedOptions.find((o) => o.label === label)?.value)"
        />
      </span>
    </div>

    <!-- 下拉列表 -->
    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1 scale-98"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-1 scale-98"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md"
      >
        <!-- 搜索框 -->
        <div v-if="searchable" class="border-b border-border p-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索..."
            class="w-full rounded border-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autofocus
          />
        </div>

        <!-- 选项列表 -->
        <ul class="max-h-60 overflow-auto p-1">
          <li v-if="filteredOptions.length === 0" class="px-3 py-2 text-sm text-muted-foreground">
            暂无选项
          </li>
          <li
            v-for="opt in filteredOptions"
            :key="opt.value"
            class="flex cursor-pointer items-start gap-2 rounded px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            :class="[
              opt.disabled ? 'cursor-not-allowed opacity-50' : '',
              isSelected(opt.value) ? 'bg-primary/10 text-primary font-medium' : '',
            ]"
            @click="!opt.disabled && toggleOption(opt.value)"
          >
            <!-- 多选复选框标记 -->
            <Icon
              v-if="multiple"
              :icon="isSelected(opt.value) ? 'tabler:square-check-filled' : 'tabler:square'"
              class="h-4 w-4 shrink-0"
              :class="isSelected(opt.value) ? 'text-primary' : 'text-muted-foreground'"
            />
            <!-- 单选选中标记 -->
            <Icon
              v-else
              icon="tabler:check"
              class="h-4 w-4 shrink-0 transition-opacity"
              :class="isSelected(opt.value) ? 'opacity-100 text-primary' : 'opacity-0'"
            />
            <span class="min-w-0 flex-1">
              <span class="block truncate">{{ opt.label }}</span>
              <span v-if="opt.description" class="block text-xs text-muted-foreground truncate">
                {{ opt.description }}
              </span>
            </span>
          </li>
        </ul>

        <!-- 多选确认按钮 -->
        <div v-if="multiple" class="border-t border-border p-2 flex justify-end gap-2">
          <button
            type="button"
            class="text-xs px-3 py-1.5 rounded text-muted-foreground hover:bg-accent"
            @click="handleMultiClear"
          >
            清空
          </button>
          <button
            type="button"
            class="text-xs px-3 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90"
            @click="handleMultiConfirm"
          >
            确认
          </button>
        </div>
      </div>
    </Transition>
  </div>

  <!-- ── Checkbox 变体 ──────────────────────────── -->
  <div v-else-if="variant === 'checkbox'" class="flex flex-wrap gap-x-4 gap-y-2 py-1">
    <span v-if="isLoadingOptions" class="text-sm text-muted-foreground">加载中...</span>
    <label
      v-for="opt in resolvedOptions"
      :key="opt.value"
      class="flex cursor-pointer items-start gap-2 text-sm select-none"
      :class="opt.disabled ? 'cursor-not-allowed opacity-50' : ''"
    >
      <span
        class="grid place-content-center h-4 w-4 shrink-0 rounded-sm border border-primary transition-colors"
        :class="isSelected(opt.value) ? 'bg-primary text-primary-foreground' : 'bg-background'"
        @click="!opt.disabled && toggleOption(opt.value)"
      >
        <Icon v-if="isSelected(opt.value)" icon="tabler:check" class="h-3 w-3" />
      </span>
      <span class="min-w-0">
        <span class="block leading-4">{{ opt.label }}</span>
        <span v-if="opt.description" class="block text-xs text-muted-foreground leading-4">
          {{ opt.description }}
        </span>
      </span>
    </label>
  </div>
</template>
