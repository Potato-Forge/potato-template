<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import type { PfFormConfigItem } from './PfForm.types'
import PfHelp from '../pf-help/PfHelp.vue'

const props = defineProps<{
  formConfig: PfFormConfigItem[]
  formData?: Record<string, any> | null
  formMode?: 'create' | 'edit'
  onSubmit?: (data: Record<string, any>) => Promise<void> | void
  onChange?: (data: Record<string, any>) => void
}>()

const formModeConfig = computed(() => {
  if (props.formMode === 'create') {
    return props.formConfig.filter((config) => config.create !== false)
  }

  if (props.formMode === 'edit') {
    return props.formConfig.filter((config) => config.edit !== false)
  }

  return props.formConfig
})

// initial form data
const initialFormData = (val: Record<string, any> | null | undefined) => {
  const formData = {} as Record<string, any>
  formModeConfig.value.forEach((config) => {
    const hasValue = val && Object.prototype.hasOwnProperty.call(val, config.key)
    formData[config.key] = hasValue ? val?.[config.key] : (config.default ?? null)

    // handle datetime range transform
    if (config.type === 'datetime' && config.config?.range) {
      const [startKey, endKey] = config.config.rangeTransform || [
        `${String(config.key)}_start`,
        `${String(config.key)}_end`,
      ]
      const rangeValue = formData[config.key]
      formData[startKey] = rangeValue?.[0] ?? null
      formData[endKey] = rangeValue?.[1] ?? null
      // remove the virtual range keys from form data
      delete formData[config.key]
    }
  })
  return formData
}

const form = useForm({
  defaultValues: initialFormData(props.formData || {}),
  onSubmit: async ({ value }) => {
    if (props.onSubmit) {
      await props.onSubmit(value)
    }
  },
})

const handleFieldChange = (field: any, key: string, value: any) => {
  field.handleChange(value)
  if (!props.onChange) return
  props.onChange({
    ...form.state.values,
    [key]: value,
  })
}

// watch for formData changes to reset the form
watch(
  () => props.formData,
  (newVal) => {
    form.reset(initialFormData(newVal || {}))
  },
  { deep: true },
)

watch(
  formModeConfig,
  () => {
    form.reset(initialFormData(props.formData || {}))
  },
  { deep: true },
)

defineExpose({
  form,
  reset: () => {
    form.reset()
  },
  submit: () => {
    form.handleSubmit()
  },
})
</script>

<template>
  <form @submit.prevent.stop="form.handleSubmit">
    <div class="grid gap-4">
      <form.Field v-for="config in formModeConfig" :key="config.key" :name="String(config.key)">
        <template v-slot="{ field, state }">
          <div class="grid w-full items-center gap-2">
            <div class="flex items-center gap-1">
              <Label :for="String(config.key)">{{ config.name }}</Label>
              <pf-help v-if="config.help" :content="config.help"></pf-help>
            </div>
            <pf-form-item
              :config="config"
              :model-value="state.value"
              @update:model-value="handleFieldChange(field, String(config.key), $event)"
            ></pf-form-item>
          </div>
        </template>
      </form.Field>
    </div>
  </form>
</template>
