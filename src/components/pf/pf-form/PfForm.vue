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
  columnsPerRow?: number
  formRules?: PfFormRules<Record<string, any>>
  /**
   * @deprecated Use formRules instead.
   */
  rules?: PfFormRules<Record<string, any>>
  onSubmit?: (data: Record<string, any>) => Promise<void> | void
  onChange?: (data: Record<string, any>) => void
}>()

const resolvedColumnsPerRow = computed(() => {
  const count = Number(props.columnsPerRow || 1)
  if (Number.isNaN(count) || count < 1) return 1
  return Math.floor(count)
})

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

const currentFormValues = ref<Record<string, any>>(initialFormData(props.formData || {}))

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

const isFieldVisible = (config: PfFormConfigItem, formValues: Record<string, any>) => {
  if (!config.visibleIf) return true

  try {
    return config.visibleIf(formValues)
  } catch {
    return true
  }
}

const runFieldRules = (stage: 'change' | 'blur' | 'submit', value: Record<string, any>) => {
  const fields: Record<string, string> = {}

  formModeConfig.value.forEach((config) => {
    if (!isFieldVisible(config, value)) return
    if (!config.rules || config.readonly || !shouldRunFieldRules(config.rules, stage)) return

    const fieldKey = String(config.key)
    const fieldValue = value[fieldKey]
    const normalizedStringValue = typeof fieldValue === 'string' ? fieldValue.trim() : fieldValue

    const isEmpty =
      normalizedStringValue === null ||
      normalizedStringValue === undefined ||
      (typeof normalizedStringValue === 'string' && normalizedStringValue.length === 0) ||
      (Array.isArray(normalizedStringValue) && normalizedStringValue.length === 0)

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
    if (
      patternRule &&
      typeof normalizedStringValue === 'string' &&
      !patternRule.value.test(normalizedStringValue)
    ) {
      fields[fieldKey] = patternRule.message || `${config.name}格式不正确`
    }
  })

  if (Object.keys(fields).length === 0) return undefined
  return fields
}

const schemaAdapter = zodValidator()
const schemaValidator = schemaAdapter()

const coerceValue = (val: unknown): unknown => {
  // Convert null/undefined to empty string for string schema validation
  if (val === null || val === undefined) return ''
  if (Array.isArray(val)) return val.map((item) => coerceValue(item))
  if (val && typeof val === 'object') {
    return Object.fromEntries(
      Object.entries(val as Record<string, unknown>).map(([key, item]) => [key, coerceValue(item)]),
    )
  }
  return val
}

const runSchemaRules = async (value: Record<string, any>) => {
  if (!resolvedFormRules.value?.schema) return undefined

  // Coerce null/undefined values to empty strings before schema validation
  // This prevents "expected string, received null" errors when fields haven't been touched
  const coercedValue = coerceValue(value) as Record<string, any>

  const schemaResult = await schemaValidator.validateAsync(
    {
      value: coercedValue,
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
  // Run on every stage to ensure blur-originated schema errors can be cleared while typing.
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

  if (!formError && Object.keys(mergedFields).length === 0) {
    return undefined
  }

  return {
    form: formError,
    fields: mergedFields,
  }
}

// ---------------------------------------------------------------------------
// Own error state — managed independently from TanStack to avoid the
// cross-source error-map merging issue: TanStack keeps onBlur errors alive
// even after onChange clears them, because each source's errorMap slot is
// only overwritten by a validator of the same source (onChange / onBlur).
// ---------------------------------------------------------------------------
const fieldErrors = ref<Record<string, string | undefined>>({})
const touchedFields = ref<Set<string>>(new Set())

const resetValidationState = () => {
  fieldErrors.value = {}
  touchedFields.value = new Set()
}

/**
 * Run validation and sync results into fieldErrors.
 * - 'change': only update fields already touched or already carrying an error
 *   (fresh, un-touched fields never receive premature errors).
 * - 'blur'  : always update the blurred field + other touched/errored fields.
 * - 'submit': update every visible field regardless of touch state.
 */
const syncErrors = async (
  stage: 'change' | 'blur' | 'submit',
  triggerKey?: string,
  signal?: AbortSignal,
) => {
  const result = await runRules(stage, currentFormValues.value, signal)
  const allErrors = result?.fields || {}

  if (stage === 'submit') {
    visibleFormModeConfig.value.forEach((config) => {
      const key = String(config.key)
      fieldErrors.value[key] = allErrors[key]
      if (allErrors[key]) touchedFields.value.add(key)
    })
    return result
  }

  visibleFormModeConfig.value.forEach((config) => {
    const key = String(config.key)
    const isBlurTarget = stage === 'blur' && key === triggerKey
    const isTouched = touchedFields.value.has(key)
    const hasCurrentError = fieldErrors.value[key] !== undefined

    if (isBlurTarget || isTouched || hasCurrentError) {
      fieldErrors.value[key] = allErrors[key]
    }
  })

  return result
}

const form = useForm({
  defaultValues: initialFormData(props.formData || {}),
  validators: {
    onSubmitAsync: async ({ signal }) => {
      return await syncErrors('submit', undefined, signal)
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
  // Update currentFormValues BEFORE calling field.handleChange so that any
  // synchronous or microtask-scheduled validator sees the latest value.
  currentFormValues.value = {
    ...currentFormValues.value,
    [key]: value,
  }
  field.handleChange(value)

  // Only run real-time validation for fields the user has already interacted
  // with (touched via blur) or that already carry an error.
  const isTouched = touchedFields.value.has(key)
  const hasError = fieldErrors.value[key] !== undefined
  if (isTouched || hasError) {
    syncErrors('change', key)
  }

  if (!props.onChange) return
  props.onChange({ ...currentFormValues.value })
}

const handleFieldBlur = async (field: any, key: string) => {
  touchedFields.value.add(key)
  field.handleBlur()
  await syncErrors('blur', key)
}

const visibleFormModeConfig = computed(() => {
  return formModeConfig.value.filter((config) => isFieldVisible(config, currentFormValues.value))
})

// watch for formData changes to reset the form
watch(
  () => props.formData,
  (newVal) => {
    const nextValues = initialFormData(newVal || {})
    currentFormValues.value = nextValues
    resetValidationState()
    form.reset(nextValues)
  },
  { deep: true },
)

watch(
  formModeConfig,
  () => {
    const nextValues = initialFormData(props.formData || {})
    currentFormValues.value = nextValues
    resetValidationState()
    form.reset(nextValues)
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
    <div
      class="grid gap-4"
      :style="{
        gridTemplateColumns: `repeat(${resolvedColumnsPerRow}, minmax(0, 1fr))`,
      }"
    >
      <form.Field
        v-for="config in visibleFormModeConfig"
        :key="config.key"
        :name="String(config.key)"
      >
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
              :error="fieldErrors[String(config.key)]"
              @blur="handleFieldBlur(field, String(config.key))"
              @update:model-value="handleFieldChange(field, String(config.key), $event)"
            ></pf-form-item>
          </div>
        </template>
      </form.Field>
    </div>
  </form>
</template>
