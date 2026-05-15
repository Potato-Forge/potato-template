<script setup lang="ts">
import type { PfFormConfigItem } from '@/components/pf/pf-form/PfForm.types'

const formValue = ref<Record<string, any>>({
  name: '产品后台',
  enabled: true,
  level: 'standard',
})

const formConfig: PfFormConfigItem[] = [
  {
    key: 'name',
    name: '名称',
    type: 'text',
    rules: { required: '请填写名称' },
    help: '这里适合展示必填文本、说明文案和字段默认值。',
  },
  {
    key: 'enabled',
    name: '启用状态',
    type: 'toggle',
    help: '开关字段建议与明确的业务语义绑定，不要只写“状态”。',
  },
  {
    key: 'level',
    name: '权限等级',
    type: 'options',
    default: 'standard',
    config: {
      options: [
        { label: '标准权限', value: 'standard' },
        { label: '高级权限', value: 'advanced' },
      ],
    },
    help: '选项型字段应把候选项限制在当前上下文，而不是塞入过长列表。',
  },
]
</script>

<template>
  <div class="space-y-4">
    <PfForm :form-config="formConfig" :form-data="formValue" :columns-per-row="2" />

    <div class="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
      当前表单值用于展示表单配置效果，不在这里演示提交链路。
    </div>
  </div>
</template>