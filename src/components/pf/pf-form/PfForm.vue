<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import type {
  PfFormFieldRules,
  PfFormConfigItem,
  PfFormRules,
  PfFormValidationErrors,
  PfFormValidationResult,
} from './PfForm.types'
import PfHelp from '../pf-help/PfHelp.vue'

const props = defineProps<{
  formConfig: PfFormConfigItem[]
  formData?: Record<string, any> | null
  formMode?: 'create' | 'edit'
  formRules?: PfFormRules<Record<string, any>>
  /**
   * @deprecated Use formRules instead.
   */
  rules?: PfFormRules<Record<string, any>>
  onSubmit?: (data: Record<string, any>) => Promise<void> | void
  onChange?: (data: Record<string, any>) => void
}>()

const resolvedFormRules = computed(() => props.formRules || props.rules)

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

const normalizeErrorValue = (error: unknown): string | undefined => {
  if (typeof error === 'string') return error
  if (!error || typeof error !== 'object') return undefined
  if ('message' in error && typeof error.message === 'string') return error.message
  return undefined
}

const normalizeValue = (value: unknown): unknown => {
  if (typeof value === 'string') return value.trim()
  if (Array.isArray(value)) return value.map((item) => normalizeValue(item))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        normalizeValue(item),
      ]),
    )
  }
  return value
}

const normalizeResult = (result: PfFormValidationResult<Record<string, any>>) => {
  if (!result) return undefined

  if (typeof result === 'string') {
    return { form: result, fields: {} }
  }

  const maybeEnvelope = result as {
    form?: unknown
    fields?: unknown
  }
  if (typeof maybeEnvelope.form === 'string' || maybeEnvelope.fields) {
    const fields =
      (maybeEnvelope.fields as PfFormValidationErrors<Record<string, any>> | undefined) || {}
    const form = typeof maybeEnvelope.form === 'string' ? maybeEnvelope.form : undefined
    return { form, fields }
  }

  return { fields: result as PfFormValidationErrors<Record<string, any>> }
}

const getNumberRule = (rule: PfFormFieldRules['min'] | PfFormFieldRules['max']) => {
  if (typeof rule === 'number') {
    return { value: rule, message: undefined }
  }

  if (rule && typeof rule === 'object') {
    return {
      value: rule.value,
      message: rule.message,
    }
  }

  return undefined
}

const getPatternRule = (rule: PfFormFieldRules['pattern']) => {
  if (rule instanceof RegExp) {
    return {
      value: rule,
      message: undefined,
    }
  }

  if (rule && typeof rule === 'object') {
    return {
      value: rule.value,
      message: rule.message,
    }
  }

  return undefined
}

const shouldRunFieldRules = (
  rules: PfFormFieldRules | undefined,
  stage: 'change' | 'blur' | 'submit',
) => {
  if (!rules) return false
  if (stage === 'submit') return true
  if (!rules.validateOn || rules.validateOn === 'both') return true
  return rules.validateOn === stage
}

const runFieldRules = (stage: 'change' | 'blur' | 'submit', value: Record<string, any>) => {
  const fields: Record<string, string> = {}

  formModeConfig.value.forEach((config) => {
    if (!config.rules || config.readonly || !shouldRunFieldRules(config.rules, stage)) return

    const fieldKey = String(config.key)
    const fieldValue = value[fieldKey]

    const isEmpty =
      fieldValue === null ||
      fieldValue === undefined ||
      (typeof fieldValue === 'string' && fieldValue.length === 0) ||
      (Array.isArray(fieldValue) && fieldValue.length === 0)

    if (config.rules.required && isEmpty) {
      fields[fieldKey] =
        typeof config.rules.required === 'string' ? config.rules.required : `${config.name}不能为空`
      return
    }

    if (isEmpty) return

    const minRule = getNumberRule(config.rules.min)
    if (minRule) {
      if (typeof fieldValue === 'string' && fieldValue.length < minRule.value) {
        fields[fieldKey] = minRule.message || `${config.name}至少 ${minRule.value} 个字符`
        return
      }
      if (typeof fieldValue === 'number' && fieldValue < minRule.value) {
        fields[fieldKey] = minRule.message || `${config.name}不能小于 ${minRule.value}`
        return
      }
    }

    const maxRule = getNumberRule(config.rules.max)
    if (maxRule) {
      if (typeof fieldValue === 'string' && fieldValue.length > maxRule.value) {
        fields[fieldKey] = maxRule.message || `${config.name}最多 ${maxRule.value} 个字符`
        return
      }
      if (typeof fieldValue === 'number' && fieldValue > maxRule.value) {
        fields[fieldKey] = maxRule.message || `${config.name}不能大于 ${maxRule.value}`
        return
      }
    }

    const patternRule = getPatternRule(config.rules.pattern)
    if (patternRule && typeof fieldValue === 'string' && !patternRule.value.test(fieldValue)) {
      fields[fieldKey] = patternRule.message || `${config.name}格式不正确`
    }
  })

  if (Object.keys(fields).length === 0) return undefined
  return fields
}

const schemaAdapter = zodValidator()
const schemaValidator = schemaAdapter()

const runSchemaRules = async (value: Record<string, any>) => {
  if (!resolvedFormRules.value?.schema) return undefined

  const schemaResult = await schemaValidator.validateAsync(
    {
      value,
      validationSource: 'form',
    },
    resolvedFormRules.value.schema,
  )

  return normalizeResult(schemaResult as PfFormValidationResult<Record<string, any>>)
}

const runRules = async (
  stage: 'change' | 'blur' | 'submit',
  value: Record<string, any>,
  signal?: AbortSignal,
) => {
  const normalizedValue = normalizeValue(value) as Record<string, any>
  const mergedFields: Record<string, string> = {}
  let formError: string | undefined

  const fieldRuleResult = runFieldRules(stage, normalizedValue)
  if (fieldRuleResult) {
    Object.assign(mergedFields, fieldRuleResult)
  }

  const customRule =
    stage === 'blur'
      ? resolvedFormRules.value?.onBlur
      : stage === 'submit'
        ? resolvedFormRules.value?.onSubmit
        : undefined
  if (customRule) {
    const customResult = normalizeResult(
      await customRule({
        value: normalizedValue,
        stage,
        signal,
      }),
    )

    if (customResult?.form) {
      formError = customResult.form
    }
    if (customResult?.fields) {
      Object.entries(customResult.fields).forEach(([key, message]) => {
        if (Array.isArray(message)) {
          const firstMessage = message.find((item) => typeof item === 'string')
          if (firstMessage) {
            mergedFields[key] = firstMessage
          }
          return
        }

        if (typeof message === 'string') {
          mergedFields[key] = message
        }
      })
    }
  }

  // Schema is merged last so it has the highest priority.
  if (stage !== 'change') {
    const schemaResult = await runSchemaRules(normalizedValue)
    if (schemaResult?.form) {
      formError = schemaResult.form
    }
    if (schemaResult?.fields) {
      Object.entries(schemaResult.fields).forEach(([key, message]) => {
        if (Array.isArray(message)) {
          const firstMessage = message.find((item) => typeof item === 'string')
          if (firstMessage) {
            mergedFields[key] = firstMessage
          }
          return
        }

        if (typeof message === 'string') {
          mergedFields[key] = message
        }
      })
    }
  }

  if (!formError && Object.keys(mergedFields).length === 0) {
    return undefined
  }

  return {
    form: formError,
    fields: mergedFields,
  }
}

const getFieldError = (errors: unknown[] | undefined) => {
  if (!errors || errors.length === 0) return undefined

  for (const error of errors) {
    const message = normalizeErrorValue(error)
    if (message) return message
  }

  return undefined
}

const form = useForm({
  defaultValues: initialFormData(props.formData || {}),
  validators: {
    onChangeAsync: async ({ value, signal }) => {
      return await runRules('change', value, signal)
    },
    onBlurAsync: async ({ value, signal }) => {
      return await runRules('blur', value, signal)
    },
    onSubmitAsync: async ({ value, signal }) => {
      return await runRules('submit', value, signal)
    },
  },
  onSubmit: async ({ value }) => {
    const normalizedValue = normalizeValue(value) as Record<string, any>
    if (props.onSubmit) {
      await props.onSubmit(normalizedValue)
    }
  },
})

const isFormSubmitted = computed(() => form.state.isSubmitted)

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
              <Label :for="String(config.key)">
                {{ config.name }}
                <span v-if="config.rules?.required" class="ml-0.5 text-destructive">*</span>
              </Label>
              <pf-help v-if="config.help" :content="config.help"></pf-help>
            </div>
            <pf-form-item
              :config="config"
              :model-value="state.value"
              :touched="state.meta.isTouched"
              :dirty="state.meta.isDirty"
              :submitted="isFormSubmitted"
              :error="getFieldError(state.meta.errors)"
              @blur="field.handleBlur"
              @update:model-value="handleFieldChange(field, String(config.key), $event)"
            ></pf-form-item>
          </div>
        </template>
      </form.Field>
    </div>
  </form>
</template>
