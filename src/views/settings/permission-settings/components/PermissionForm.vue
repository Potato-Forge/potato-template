<script setup lang="ts">
  import type { PfFormConfig } from '@/components/pf/pf-form/PfForm.types'
  import type { usePermissionManager } from '../usePermissionManager'
  import type { AllPermissionItem } from '@/api/permission/permission'

  const manager = inject('permissionManager')
  const { choosenId, choosenPath, choosenPermission } = manager as ReturnType<
    typeof usePermissionManager
  >

  // form
  const formRef = useTemplateRef('form')
  const handleSubmit = () => {
    formRef.value?.submit()
  }

  // form mode
  const formMode = computed(() => {
    if (!choosenId.value) {
      return 'empty'
    }

    return 'edit'
  })

  // form data
  const formData = ref<AllPermissionItem | null>(null)
  watchEffect(() => {
    if (formMode.value === 'edit') {
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
    },
    {
      name: '创建时间',
      key: 'created_at',
      type: 'datetime',
      readonly: true,
      config: {
        format: 'iso',
      },
    },
    {
      name: '权限名称',
      key: 'name',
      type: 'text',
      create: true,
      edit: true,
      help: '权限的展示名称',
    },

    {
      name: '权限编码',
      key: 'code',
      type: 'text',
      create: true,
      edit: true,
      help: '权限的唯一标识，建议使用英文和下划线',
    },
    {
      name: '权限路径',
      key: 'path',
      type: 'text',
      create: true,
      edit: true,
    },
    {
      name: '权限图标',
      key: 'icon',
      type: 'icon',
      create: true,
      edit: true,
    },
  ])

  // form action
  const handleReset = () => {
    formRef.value?.reset()
  }
  const handleCancel = () => {
    // reset form and go back to empty state
    formRef.value?.reset()
    choosenId.value = null
  }
  const handlePermission = async (data: Record<string, any>) => {
    if (formMode.value === 'edit') {
      console.log(data)
    } else {
      // create mode, validate first then submit
      console.log(data)
    }
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
            <pf-button type="primary" @click="handleSubmit">保存</pf-button>
          </div>
        </div>
      </pf-card>

      <!-- Form Content -->
      <pf-card class="p-4 flex-1">
        <pf-form
          ref="form"
          :form-config="formConfig"
          :form-data="formData"
          :on-submit="handlePermission"
        ></pf-form>
      </pf-card>
    </div>
  </div>
</template>

<style scoped></style>
