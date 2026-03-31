<script setup lang="ts">
  import { useForm } from '@tanstack/vue-form'
  import type { PfFormConfigItem } from './PfForm.types'

  const props = defineProps<{
    formConfig: PfFormConfigItem[]
    formData?: Record<string, any> | null
  }>()

  // initial form data
  const initialFormData = (val: Record<string, any>) => {
    const formData = {} as Record<string, any>
    props.formConfig.forEach((config) => {
      formData[config.key] = val ? val[config.key] : null
      // handle datetime range transform
      if (config.type === 'datetime' && config.config?.range && val) {
        const [startKey, endKey] = config.config.rangeTransform || [
          `${String(config.key)}_start`,
          `${String(config.key)}_end`,
        ]
        formData[startKey] = val[config.key]?.[0] || null
        formData[endKey] = val[config.key]?.[1] || null
        // remove the virtual range keys from form data
        delete formData[config.key]
      }
    })
    return formData
  }

  const form = useForm({
    defaultValues: initialFormData(props.formData || {}),
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
    },
  })
</script>

<template>
  <form @submit.prevent.stop="form.handleSubmit">
    <div class="grid gap-4">
      <form.Field v-for="config in props.formConfig" :key="config.key" :name="String(config.key)">
        <template v-slot="{ field }">
          <!-- text -->
          <div class="grid w-full items-center gap-2">
            <Label :for="String(config.key)">{{ config.name }}</Label>
            <pf-form-item :config="config" :field="field"></pf-form-item>
          </div>
        </template>
      </form.Field>
    </div>
    <button type="submit">Submit</button>
  </form>
</template>
