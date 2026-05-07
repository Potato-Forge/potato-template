<script setup lang="ts">
import { computed } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { zhCN } from 'date-fns/locale'
import { format as DateFormat, isValid as isValidDate, parse as DateParse } from 'date-fns'
import { useSystemStore } from '@/store/systemStore'

type PfFormDatePrimitive = string | number | Date | null
type PfFormDateValue = PfFormDatePrimitive | PfFormDatePrimitive[]

const props = withDefaults(
  defineProps<{
    modelValue: PfFormDateValue
    type?: 'date' | 'time' | 'datetime'
    format?: 'timestamp' | 'format' | 'iso' | string
    range?: boolean
  }>(),
  {
    modelValue: null,
    type: 'datetime',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: PfFormDateValue): void
}>()

const systemStore = useSystemStore()
const { isDarkMode: isDark } = storeToRefs(systemStore)

// custom picker ui
const pickerSlotUi = computed(() => {
  const inputIcon = props.type === 'time' ? 'i-tabler-clock' : 'i-tabler-calendar'
  const actionRowTranslate = {
    selectBtnLabel: '确定',
    cancelBtnLabel: '取消',
    nowBtnLabel: '现在',
  }
  return {
    inputIcon,
    actionRowTranslate,
  }
})

/**
 * 显示格式（仅控制输入框展示，不影响 model 输出格式）
 */
const displayFormat = computed(() => {
  switch (props.type) {
    case 'date':
      return 'yyyy-MM-dd'
    case 'time':
      return 'HH:mm:ss'
    default:
      return 'yyyy-MM-dd HH:mm:ss'
  }
})

const pickerFormats = computed(() => {
  return {
    input: displayFormat.value,
  }
})

const resolvedOutputFormat = computed(() => {
  if (!props.format || props.format === 'format') {
    return displayFormat.value
  }

  return props.format
})

const textInputConfig = computed(() => {
  return {
    format: displayFormat.value,
    openMenu: 'open',
    enterSubmit: true,
    tabSubmit: true,
    applyOnBlur: true,
    selectOnFocus: true,
  }
})

const timeConfig = computed(() => {
  const now = new Date()
  return {
    timePickerInline: true,
    hoursIncrement: 1,
    minutesIncrement: 1,
    secondsIncrement: 1,
    hoursGridIncrement: 1,
    minutesGridIncrement: 1,
    secondsGridIncrement: 1,
    startTime: {
      hours: now.getHours(),
      minutes: now.getMinutes(),
      seconds: now.getSeconds(),
    },
  }
})

const pickerUi = computed(() => {
  return {
    input:
      'h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm leading-5 text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
    menu: 'border border-border bg-card text-foreground shadow-lg rounded-md',
    calendar: 'text-foreground',
    calendarCell: 'text-foreground',
    navBtnPrev:
      'h-7 w-7 rounded border border-border text-muted-foreground hover:text-foreground hover:border-ring',
    navBtnNext:
      'h-7 w-7 rounded border border-border text-muted-foreground hover:text-foreground hover:border-ring',
  }
})

const toValidDate = (value: PfFormDatePrimitive): Date | null => {
  if (value == null || value === '') return null

  if (value instanceof Date) {
    return isValidDate(value) ? value : null
  }

  if (typeof value === 'number') {
    const parsed = new Date(value)
    return isValidDate(parsed) ? parsed : null
  }

  const normalized = value.trim()
  if (!normalized) return null

  if (props.format === 'timestamp') {
    const timestamp = Number(normalized)
    if (!Number.isNaN(timestamp)) {
      const parsed = new Date(timestamp)
      if (isValidDate(parsed)) return parsed
    }
  }

  if (props.format && props.format !== 'iso' && props.format !== 'format') {
    const parsed = DateParse(normalized, props.format, new Date())
    if (isValidDate(parsed)) return parsed
  }

  const parsedByDisplay = DateParse(normalized, displayFormat.value, new Date())
  if (isValidDate(parsedByDisplay)) return parsedByDisplay

  const parsedByNative = new Date(normalized)
  return isValidDate(parsedByNative) ? parsedByNative : null
}

const serializeDate = (value: Date | null) => {
  if (!value || !isValidDate(value)) return null

  if (resolvedOutputFormat.value === 'timestamp') {
    return value.getTime()
  }

  if (resolvedOutputFormat.value === 'iso') {
    return value.toISOString()
  }

  return DateFormat(value, resolvedOutputFormat.value)
}

const pickerModelValue = computed<Date | Date[] | null>(() => {
  if (Array.isArray(props.modelValue)) {
    const parsedRange = props.modelValue.map((item) => toValidDate(item))
    return parsedRange.every(Boolean) ? (parsedRange as Date[]) : null
  }

  return toValidDate(props.modelValue)
})

const handleUpdateValue = (val: Date | Date[] | null) => {
  if (!val) {
    emit('update:modelValue', null)
    return
  }

  if (Array.isArray(val)) {
    const [start, end] = val
    emit('update:modelValue', start && end ? [serializeDate(start), serializeDate(end)] : null)
    return
  }

  emit('update:modelValue', serializeDate(val))
}

const formatActionPreviewValue = (value: Date | Date[] | null | undefined) => {
  if (!value) return ''

  const formatSingle = (item: Date) => DateFormat(item, displayFormat.value)

  if (Array.isArray(value)) {
    return value
      .filter((item): item is Date => isValidDate(item))
      .map(formatSingle)
      .join(' ~ ')
  }

  return isValidDate(value) ? formatSingle(value) : ''
}
</script>

<template>
  <div class="pf-datepicker">
    <VueDatePicker
      :model-value="pickerModelValue"
      @update:model-value="handleUpdateValue"
      :locale="zhCN"
      :dark="isDark"
      :formats="pickerFormats"
      :ui="pickerUi"
      :range="props.range || false"
      :text-input="textInputConfig"
      :time-config="timeConfig"
      :action-row="pickerSlotUi.actionRowTranslate"
    >
      <template #input-icon>
        <div class="mx-2 flex items-center text-muted-foreground">
          <div :class="`${pickerSlotUi.inputIcon}`"></div>
        </div>
      </template>

      <template #clear-icon>
        <div class="mx-2 flex items-center text-muted-foreground">
          <div class="i-tabler-x"></div>
        </div>
      </template>

      <template #clock-icon>
        <div class="mx-2 flex items-center text-muted-foreground gap-2 text-primary">
          <div class="i-tabler-clock"></div>
          <span class="font-semibold">点击选择时间</span>
        </div>
      </template>

      <template #arrow-left>
        <div class="mx-2 flex items-center text-muted-foreground">
          <div class="i-tabler-chevron-left"></div>
        </div>
      </template>

      <template #arrow-right>
        <div class="mx-2 flex items-center text-muted-foreground">
          <div class="i-tabler-chevron-right"></div>
        </div>
      </template>

      <template #arrow-up>
        <div class="mx-2 flex items-center text-muted-foreground">
          <div class="i-tabler-chevron-up"></div>
        </div>
      </template>

      <template #arrow-down>
        <div class="mx-2 flex items-center text-muted-foreground">
          <div class="i-tabler-chevron-down"></div>
        </div>
      </template>

      <template #calendar-icon>
        <div class="mx-2 flex items-center text-muted-foreground gap-2 text-primary">
          <div class="i-tabler-calendar"></div>
          <span class="font-semibold">点击选择日期</span>
        </div>
      </template>

      <template #action-preview="{ value }">
        <span class="text-primary">{{
          formatActionPreviewValue(value as Date | Date[] | null)
        }}</span>
      </template>
    </VueDatePicker>
  </div>
</template>

<style scoped>
.pf-datepicker {
  inline-size: 100%;
}

/* ───────────────── Input: aligns with ui/input/Input.vue ───────────────── */
:deep(.dp__input) {
  block-size: 2.25rem; /* h-9 = 36px */
  inline-size: 100%;
  border-radius: calc(var(--radius) - 2px); /* rounded-md */
  border: 1px solid hsl(var(--input));
  background: transparent;
  padding: 0.25rem 1.875rem 0.25rem 0.75rem; /* py-1 px-3, keep right for dp icons */
  font-size: 0.875rem; /* text-sm */
  line-height: 1.25rem;
  color: hsl(var(--foreground));
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 5%); /* shadow-sm */
  transition:
    color 0.15s,
    background-color 0.15s,
    border-color 0.15s,
    box-shadow 0.15s;
  font-family: inherit;
}

/* When left calendar icon is shown, dp adds this class to open up left padding */
:deep(.dp__input.dp__input_icon_pad) {
  padding-inline-start: var(--dp-input-icon-padding, 2.25rem);
}

:deep(.dp__input::placeholder) {
  color: hsl(var(--muted-foreground));
}

:deep(.dp__input_focus),
:deep(.dp__input:focus) {
  outline: none;
  border-color: hsl(var(--ring));
  box-shadow: 0 0 0 1px hsl(var(--ring));
}

:deep(.dp__input:disabled) {
  cursor: not-allowed;
  opacity: 0.5;
}

:deep(.dp__input_wrap) {
  inline-size: 100%;
}

/* ───────────────── Theme variable bridge – Light ───────────────── */
:deep(.dp__theme_light) {
  --dp-background-color: hsl(var(--card));
  --dp-text-color: hsl(var(--foreground));
  --dp-hover-color: hsl(var(--accent));
  --dp-hover-text-color: hsl(var(--accent-foreground));
  --dp-hover-icon-color: hsl(var(--muted-foreground));
  --dp-primary-color: hsl(var(--primary));
  --dp-primary-disabled-color: hsl(var(--selected));
  --dp-primary-text-color: hsl(var(--primary-foreground));
  --dp-secondary-color: hsl(var(--border));
  --dp-border-color: hsl(var(--border));
  --dp-menu-border-color: hsl(var(--border));
  --dp-border-color-hover: hsl(var(--ring));
  --dp-border-color-focus: hsl(var(--ring));
  --dp-disabled-color: hsl(var(--muted));
  --dp-disabled-color-text: hsl(var(--muted-foreground));
  --dp-scroll-bar-background: hsl(var(--muted));
  --dp-scroll-bar-color: hsl(var(--muted-foreground));
  --dp-success-color: hsl(var(--success));
  --dp-success-color-disabled: hsl(var(--success) / 0.6);
  --dp-icon-color: hsl(var(--muted-foreground));
  --dp-danger-color: hsl(var(--destructive));
  --dp-marker-color: hsl(var(--destructive));
  --dp-tooltip-color: hsl(var(--popover));
  --dp-highlight-color: hsl(var(--selected) / 0.5);
  --dp-range-between-dates-background-color: hsl(var(--selected));
  --dp-range-between-dates-text-color: hsl(var(--selected-foreground));
  --dp-range-between-border-color: hsl(var(--selected));
  --dp-border-radius: calc(var(--radius) - 2px);
  --dp-cell-border-radius: calc(var(--radius) - 4px);
  --dp-font-size: 0.875rem;
}

/* ───────────────── Theme variable bridge – Dark ───────────────── */
:deep(.dp__theme_dark) {
  --dp-background-color: hsl(var(--card));
  --dp-text-color: hsl(var(--foreground));
  --dp-hover-color: hsl(var(--accent));
  --dp-hover-text-color: hsl(var(--accent-foreground));
  --dp-hover-icon-color: hsl(var(--muted-foreground));
  --dp-primary-color: hsl(var(--primary));
  --dp-primary-disabled-color: hsl(var(--selected));
  --dp-primary-text-color: hsl(var(--primary-foreground));
  --dp-secondary-color: hsl(var(--border));
  --dp-border-color: hsl(var(--border));
  --dp-menu-border-color: hsl(var(--border));
  --dp-border-color-hover: hsl(var(--ring));
  --dp-border-color-focus: hsl(var(--ring));
  --dp-disabled-color: hsl(var(--muted));
  --dp-disabled-color-text: hsl(var(--muted-foreground));
  --dp-scroll-bar-background: hsl(var(--card));
  --dp-scroll-bar-color: hsl(var(--muted-foreground));
  --dp-success-color: hsl(var(--success));
  --dp-success-color-disabled: hsl(var(--success) / 0.6);
  --dp-icon-color: hsl(var(--muted-foreground));
  --dp-danger-color: hsl(var(--destructive));
  --dp-marker-color: hsl(var(--destructive));
  --dp-tooltip-color: hsl(var(--popover));
  --dp-highlight-color: hsl(var(--selected) / 0.5);
  --dp-range-between-dates-background-color: hsl(var(--selected));
  --dp-range-between-dates-text-color: hsl(var(--selected-foreground));
  --dp-range-between-border-color: hsl(var(--selected));
  --dp-border-radius: calc(var(--radius) - 2px);
  --dp-cell-border-radius: calc(var(--radius) - 4px);
  --dp-font-size: 0.875rem;
}

/* ───────────────── Dropdown menu panel ───────────────── */
:deep(.dp__menu) {
  border-color: hsl(var(--border));
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 10%),
    0 4px 6px -4px rgb(0 0 0 / 10%);
}

/* ───────────────── Action row buttons ───────────────── */
:deep(.dp__action_select) {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-radius: calc(var(--radius) - 4px);
}

:deep(.dp__action_select:hover) {
  background-color: hsl(var(--primary) / 0.9);
}

:deep(.dp__action_cancel) {
  color: hsl(var(--muted-foreground));
  border-color: hsl(var(--border));
  border-radius: calc(var(--radius) - 4px);
}

:deep(.dp__action_cancel:hover) {
  border-color: hsl(var(--ring));
  color: hsl(var(--foreground));
}
</style>
