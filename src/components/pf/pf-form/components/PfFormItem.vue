<script setup lang="ts">
  import { format } from 'date-fns'
  import type { PfFormConfigItem, PfFormFieldApi } from '../PfForm.types'
  import PfFormItemDatetime from './PfFormItemDatetime.vue'

  const props = defineProps<{
    config: PfFormConfigItem
    field: PfFormFieldApi // tanstack field api
  }>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- type:text -->
    <template v-if="config.type === 'text'">
      <!-- read -->
      <template v-if="config.readonly">
        <pf-text>{{ field.state.value }}</pf-text>
      </template>
      <!-- write -->
      <template v-else>
        <Input :model-value="field.state.value" @update:model-value="field.handleChange"></Input>
      </template>
    </template>

    <!-- type:datetime -->
    <template v-else-if="config.type === 'datetime'">
      <!-- read -->
      <template v-if="config.readonly">
        <pf-text>{{ format(new Date(field.state.value), 'yyyy-MM-dd HH:mm:ss') }}</pf-text>
      </template>
      <!-- write -->
      <template v-else>
        <pf-form-item-datetime
          :format="config.config?.format"
          :model-value="field.state.value"
          @update:model-value="field.handleChange"
        ></pf-form-item-datetime>
      </template>
    </template>

    <!-- info -->
    <pf-text></pf-text>
  </div>
</template>

<style scoped></style>
