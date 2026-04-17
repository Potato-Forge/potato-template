<script setup lang="ts">
import { format } from 'date-fns'
import type { PfFormConfigItem } from '../PfForm.types'
import PfFormItemDatetime from './PfFormItemDatetime.vue'
import PfFormItemText from './PfFormItemText.vue'

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

const displayError = computed(() => {
  if (!props.error) return undefined
  if (props.touched || props.submitted) return props.error
  return undefined
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
</script>

<template>
  <div class="flex flex-col gap-2">
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

    <div
      v-if="showCount"
      class="self-end text-xs"
      :class="currentLength > Number(maxLength) ? 'text-destructive' : 'text-muted-foreground'"
    >
      {{ currentLength }} / {{ maxLength }}
    </div>

    <FieldError v-if="displayError">{{ displayError }}</FieldError>
  </div>
</template>

<style scoped></style>
