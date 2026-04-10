<script setup lang="ts">
  import { format } from 'date-fns'
  import type { PfFormConfigItem, PfFormFieldApi } from '../PfForm.types'
  import PfFormItemDatetime from './PfFormItemDatetime.vue'
  import PfFormItemText from './PfFormItemText.vue'

  const props = defineProps<{
    config: PfFormConfigItem
    field: PfFormFieldApi // tanstack field api
    modelValue?: any
  }>()

  const emits = defineEmits<{
    (e: 'update:modelValue', payload: any): void
  }>()

  const handleChange = (value: any) => {
    emits('update:modelValue', value)
  }
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
          @update:model-value="handleChange"
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
          @update:model-value="handleChange"
        ></pf-icon-picker>
      </template>
    </template>

    <!-- info -->
    <pf-text></pf-text>
  </div>
</template>

<style scoped></style>
