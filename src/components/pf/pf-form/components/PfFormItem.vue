<script setup lang="ts">
import { format } from 'date-fns'
import type { PfFormConfigItem } from '../PfForm.types'
import type { PfUploadFileItem } from '@/components/pf/pf-upload'
import PfFormItemDatetime from './PfFormItemDatetime.vue'
import PfFormItemText from './PfFormItemText.vue'
import PfFormItemOptions from './PfFormItemOptions.vue'

const props = defineProps<{
  config: PfFormConfigItem
  modelValue?: any
  error?: string
  touched?: boolean
  dirty?: boolean
  submitted?: boolean
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: any): void
  (e: 'blur'): void
}>()

const isErrorShaking = ref(false)
let shakeTimer: ReturnType<typeof setTimeout> | null = null

const handleChange = (value: any) => {
  emits('update:modelValue', value)
}

const handleBlur = () => {
  emits('blur')
}

const handleChangeAndBlur = (value: any) => {
  handleChange(value)
  handleBlur()
}

const displayError = computed(() => props.error)

watch(displayError, (next, prev) => {
  if (!next || next === prev) return

  if (shakeTimer) {
    clearTimeout(shakeTimer)
  }

  isErrorShaking.value = false
  requestAnimationFrame(() => {
    isErrorShaking.value = true
    shakeTimer = setTimeout(() => {
      isErrorShaking.value = false
      shakeTimer = null
    }, 420)
  })
})

onBeforeUnmount(() => {
  if (shakeTimer) {
    clearTimeout(shakeTimer)
    shakeTimer = null
  }
})

const maxLength = computed(() => {
  if (props.config.type !== 'text') return undefined
  const maxRule = props.config.rules?.max
  if (!maxRule) return undefined
  if (typeof maxRule === 'number') return maxRule
  if (typeof maxRule === 'object') return maxRule.value
  return undefined
})

const currentLength = computed(() => {
  if (typeof props.modelValue === 'string') return props.modelValue.length
  return 0
})

const showCount = computed(() => {
  return props.config.type === 'text' && !props.config.readonly && !!maxLength.value
})

const uploadModelValue = computed<PfUploadFileItem[]>(() => {
  if (!Array.isArray(props.modelValue)) return []
  return props.modelValue as PfUploadFileItem[]
})
</script>

<template>
  <div class="flex flex-col">
    <!-- type:text -->
    <template v-if="config.type === 'text'">
      <!-- read -->
      <template v-if="config.readonly">
        <pf-form-item-text>{{ props.modelValue }}</pf-form-item-text>
      </template>
      <!-- write -->
      <template v-else>
        <Input
          :passive="false"
          :model-value="props.modelValue"
          @blur="handleBlur"
          @update:model-value="handleChange"
        ></Input>
      </template>
    </template>

    <!-- type:datetime -->
    <template v-else-if="config.type === 'datetime'">
      <!-- read -->
      <template v-if="config.readonly">
        <pf-form-item-text>{{
          format(new Date(props.modelValue), 'yyyy-MM-dd HH:mm:ss')
        }}</pf-form-item-text>
      </template>
      <!-- write -->
      <template v-else>
        <pf-form-item-datetime
          :format="config.config?.format"
          :model-value="props.modelValue"
          @update:model-value="handleChangeAndBlur"
        ></pf-form-item-datetime>
      </template>
    </template>

    <!-- type:icon -->
    <template v-else-if="config.type === 'icon'">
      <!-- read -->
      <template v-if="config.readonly">
        <div class="i-tabler-icons text-lg text-primary"></div>
      </template>
      <!-- write -->
      <template v-else>
        <pf-icon-picker
          :model-value="props.modelValue"
          @update:model-value="handleChangeAndBlur"
        ></pf-icon-picker>
      </template>
    </template>

    <!-- type:toggle -->
    <template v-else-if="config.type === 'toggle'">
      <!-- read is disabled write -->
      <!-- write -->
      <div class="flex items-center gap-2">
        <pf-form-item-toggle
          class="h-10"
          :label="config.name"
          :model-value="props.modelValue"
          :type="config.config?.varient"
          :true-value="config.config?.trueValue"
          :false-value="config.config?.falseValue"
          @update:model-value="handleChangeAndBlur"
          :disabled="config.readonly"
        />
        <pf-text as="span">{{ config.name }}</pf-text>
      </div>
    </template>

    <!-- type:options -->
    <template v-else-if="config.type === 'options'">
      <PfFormItemOptions
        :model-value="props.modelValue"
        :multiple="config.config?.multiple"
        :variant="config.config?.variant"
        :options="config.config?.options"
        :options-fn="config.config?.optionsFn"
        :placeholder="config.config?.placeholder"
        :searchable="config.config?.searchable"
        :disabled="config.readonly || config.disabled"
        @update:model-value="handleChange"
        @blur="handleBlur"
      />
    </template>

    <!-- type:upload -->
    <template v-else-if="config.type === 'upload'">
      <template v-if="config.readonly">
        <pf-form-item-text>{{ uploadModelValue.length }} 个文件</pf-form-item-text>
      </template>
      <template v-else>
        <PfUpload
          :model-value="uploadModelValue"
          :trigger="config.config?.trigger"
          :list-type="config.config?.listType"
          :multiple="config.config?.multiple"
          :accept="config.config?.accept"
          :max-files="config.config?.maxFiles"
          :max-size="config.config?.maxSize"
          :show-toast="config.config?.showToast"
          :upload-handler="config.config?.uploadHandler"
          :disabled="config.readonly || config.disabled"
          @update:model-value="handleChange"
        />
      </template>
    </template>

    <div
      class="field-feedback-row mt-1 h-5 flex items-center justify-between gap-2 overflow-hidden"
    >
      <div class="min-w-0 flex-1 overflow-hidden">
        <Transition name="field-error">
          <pf-tooltip v-if="displayError" :content="displayError" placement="top">
            <FieldError :class="['block truncate', { 'field-error-shake': isErrorShaking }]">
              {{ displayError }}
            </FieldError>
          </pf-tooltip>
        </Transition>
      </div>

      <div
        v-if="showCount"
        class="shrink-0 text-xs"
        :class="currentLength > Number(maxLength) ? 'text-destructive' : 'text-muted-foreground'"
      >
        {{ currentLength }} / {{ maxLength }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.field-error-enter-active,
.field-error-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.field-error-enter-from,
.field-error-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.field-error-shake {
  animation: field-error-shake 0.38s ease-in-out;
}

@keyframes field-error-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  15% {
    transform: translateX(-4px);
  }
  30% {
    transform: translateX(4px);
  }
  45% {
    transform: translateX(-3px);
  }
  60% {
    transform: translateX(3px);
  }
  75% {
    transform: translateX(-2px);
  }
}
</style>
