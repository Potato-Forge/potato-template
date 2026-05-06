<script setup lang="ts">
import type { PfFormRules } from '@/components/pf/pf-form/PfForm.types'
import type { PfDataTableItem } from './PfDataTable.types'

const props = withDefaults(
  defineProps<{
    title?: string
    mode: 'create' | 'edit'
    columns: PfDataTableItem[]
    formData?: Record<string, any> | null
    loading?: boolean
    formRules?: PfFormRules<Record<string, any>>
  }>(),
  {
    title: '',
    formData: null,
    loading: false,
    formRules: undefined,
  },
)

const emits = defineEmits<{
  (e: 'submit', payload: Record<string, any>): void
  (e: 'cancel'): void
}>()

const formRef = useTemplateRef('formRef')

const resolvedTitle = computed(() => {
  if (props.title) return props.title
  return props.mode === 'create' ? '新增' : '编辑'
})

const handleSubmit = (payload: Record<string, any>) => {
  emits('submit', payload)
}

const submit = () => {
  formRef.value?.submit()
}

defineExpose({
  submit,
})
</script>

<template>
  <div class="h-full flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <pf-text as="h3" class="text-lg font-semibold">{{ resolvedTitle }}</pf-text>
      <pf-text as="span" class="text-sm text-muted-foreground">
        {{ mode === 'create' ? '创建新数据' : '修改现有数据' }}
      </pf-text>
    </div>

    <div class="min-h-0 flex-1 overflow-auto px-1 pb-1">
      <pf-form
        ref="formRef"
        :form-config="columns"
        :form-data="formData"
        :form-mode="mode"
        :form-rules="formRules"
        :on-submit="handleSubmit"
      />
    </div>

    <div class="flex items-center justify-end gap-2 border-t border-border pt-4">
      <pf-button variant="outline" :disabled="loading" @click="emits('cancel')">取消</pf-button>
      <pf-button :disabled="loading" @click="submit">
        {{ loading ? '提交中...' : '提交' }}
      </pf-button>
    </div>
  </div>
</template>
