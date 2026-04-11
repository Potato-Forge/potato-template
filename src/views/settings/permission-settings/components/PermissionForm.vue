<script setup lang="ts">
import type { PfFormConfig } from '@/components/pf/pf-form/PfForm.types'
import type { usePermissionManager } from '../usePermissionManager'
import type { AllPermissionItem } from '@/api/permission/permission'

const manager = inject<ReturnType<typeof usePermissionManager>>('permissionManager')
if (!manager) {
  throw new Error('permissionManager is not provided')
}

const { choosenPath, choosenPermission, formMode } = manager

// form
const formRef = useTemplateRef('form')
const handleSubmit = () => {
  formRef.value?.submit()
}

// form data
const formData = ref<AllPermissionItem | null>(null)
watchEffect(() => {
  if (formMode.value === 'empty') {
    formData.value = null
    return
  }

  if (formMode.value === 'create') {
    formData.value = null
    return
  }

  if (choosenPermission.value) {
    formData.value = choosenPermission.value
  } else {
    formData.value = null
  }
})
// form config
const formConfig = ref<PfFormConfig<AllPermissionItem>>([
  {
    name: 'ID',
    key: 'id',
    type: 'text',
    readonly: true,
    create: false,
  },
  {
    name: '创建时间',
    key: 'created_at',
    type: 'datetime',
    readonly: true,
    create: false,
    config: {
      format: 'iso',
    },
  },
  {
    name: '权限名称',
    key: 'name',
    type: 'text',
    help: '权限的展示名称',
  },

  {
    name: '权限编码',
    key: 'code',
    type: 'text',
    help: '权限的唯一标识，建议使用英文和下划线',
  },
  {
    name: '权限路由',
    key: 'path',
    type: 'text',
    help: '前端权限对应的路由路径，自动衔接父级路径',
  },
  {
    name: '权限图标',
    key: 'icon',
    type: 'icon',
  },
  {
    name: 'view 组件',
    key: 'component',
    type: 'text',
    help: '前端权限对应的 view 组件路径，建议使用 kebab-case，默认从 views/ 下寻找',
  },
  {
    name: '是否显示',
    key: 'is_hidden',
    type: 'toggle',
    default: true,
    config: {
      varient: 'switch',
      trueValue: true,
      falseValue: false,
    },
  },
])

// form action
const handleReset = () => {
  formRef.value?.reset()
}
const handleCancel = async () => {
  await manager.cancelEditing()
}
const handleFormChange = (values: Record<string, any>) => {
  manager.markFormChanged(values)
}
const handlePermission = async (data: Record<string, any>) => {
  await manager.saveCurrent(data)
}
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <!-- Empty State -->
    <pf-empty
      v-if="formMode === 'empty'"
      class="flex-1"
      title="权限编辑"
      description="请在左侧选择或新建开始编辑"
    ></pf-empty>

    <!-- Edit Form -->
    <div v-else class="flex-1 flex flex-col gap-4">
      <!-- Form header -->
      <pf-card class="p-4 flex">
        <div class="flex items-center justify-between">
          <!-- title -->
          <div class="flex flex-col gap-2">
            <!-- permission breadcrumb -->
            <pf-breadcrumb :list="choosenPath" labelKey="name"></pf-breadcrumb>
            <!-- permission name -->
            <pf-text as="h2" size="2xl" weight="bold"
              >{{ formMode === 'edit' ? '编辑' : '新建'
              }}{{ choosenPath[choosenPath.length - 1]?.name || '权限详情' }}</pf-text
            >
          </div>

          <!-- actions -->
          <div class="flex items-center gap-2">
            <pf-button variant="ghost" @click="handleCancel">取消</pf-button>
            <pf-button variant="secondary" @click="handleReset">重置</pf-button>
            <pf-button type="primary" :loading="manager.isSaving.value" @click="handleSubmit"
              >保存</pf-button
            >
          </div>
        </div>
      </pf-card>

      <!-- Form Content -->
      <pf-card class="p-4 flex-1">
        <pf-form
          ref="form"
          :form-config="formConfig"
          :form-data="formData"
          :form-mode="formMode"
          :on-change="handleFormChange"
          :on-submit="handlePermission"
        ></pf-form>
      </pf-card>
    </div>
  </div>
</template>

<style scoped></style>
