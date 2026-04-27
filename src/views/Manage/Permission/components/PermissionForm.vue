<script setup lang="ts">
import { z } from 'zod'
import type { PfFormConfig, PfFormRules } from '@/components/pf/pf-form/PfForm.types'
import type { usePermissionManager } from '../usePermissionManager'
import type { AllPermissionItem } from '@/api/permission/permission'

const manager = inject<ReturnType<typeof usePermissionManager>>('permissionManager')
if (!manager) {
  throw new Error('permissionManager is not provided')
}

const { choosenPath, choosenPermission, formMode } = manager
const menuOnlyKeys = ['path', 'component', 'is_external'] as const
const lastPermissionType = ref<'menu' | 'button' | 'api' | null>(null)

// form
const formRef = useTemplateRef('form')
const handleSubmit = () => {
  formRef.value?.submit()
}

// form data - 需要先声明，因为下面的 computed 会引用它
const formData = ref<AllPermissionItem | null>(null)

const permissionSchema = z
  .object({
    name: z.string().min(1, '权限名称不能为空').max(50, '权限名称长度不能超过 50 个字符'),
    code: z
      .string()
      .min(1, '权限编码不能为空')
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*(?::[a-zA-Z_][a-zA-Z0-9_]*)*$/, '权限编码格式不正确'),
    sort: z.coerce.number().int('排序必须为整数').min(1, '排序不能小于 1'),
    type: z.enum(['menu', 'button', 'api']),
    path: z.string().nullable().optional(),
    component: z.string().nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type !== 'menu') return

    const path = typeof value.path === 'string' ? value.path.trim() : ''
    const component = typeof value.component === 'string' ? value.component.trim() : ''

    if (!path) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['path'],
        message: '权限路由不能为空',
      })
    } else if (!/^\//.test(path)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['path'],
        message: '权限路由必须以 / 开头',
      })
    }

    if (component && !/^[a-z0-9-]+(?:\/[a-z0-9-]+)*(?:\.vue)?$/i.test(component)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['component'],
        message: 'view 组件路径格式不正确',
      })
    }
  })

const formRules = computed<PfFormRules<Record<string, any>>>(() => ({
  schema: permissionSchema,
}))

watchEffect(() => {
  if (formMode.value === 'empty') {
    formData.value = null
    lastPermissionType.value = null
    return
  }

  if (formMode.value === 'create') {
    formData.value = choosenPermission.value
    lastPermissionType.value = (formData.value?.type || 'menu') as 'menu' | 'button' | 'api'
    return
  }

  if (choosenPermission.value) {
    formData.value = choosenPermission.value
  } else {
    formData.value = null
  }

  const nextType = (formData.value?.type || 'menu') as 'menu' | 'button' | 'api'
  lastPermissionType.value = nextType
})

const isType = (type: 'menu' | 'button' | 'api', formValues: Record<string, any>) => {
  return (formValues.type || 'menu') === type
}

// form config
const formConfig = computed<PfFormConfig<AllPermissionItem>>(() => [
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
    name: '权限类型',
    key: 'type',
    type: 'options',
    config: {
      variant: 'combobox',
      options: [
        { label: '菜单', value: 'menu' },
        { label: '按钮', value: 'button' },
        { label: '接口', value: 'api' },
      ],
    },
    disabled: formMode.value === 'edit', // 编辑时禁用类型切换
    help: '权限类型：菜单（menu）、按钮（button）、接口（api）',
    rules: {
      required: true,
    },
  },
  {
    name: '权限名称',
    key: 'name',
    type: 'text',
    help: '权限的展示名称',
    rules: {
      required: true,
      max: 50,
    },
  },
  {
    name: '权限编码',
    key: 'code',
    type: 'text',
    help: '权限的唯一标识，建议使用英文，用:冒号分隔不同层级（如 user:create、user:update）',
    rules: {
      required: true,
      pattern: {
        value: /^[a-zA-Z_][a-zA-Z0-9_]*(?::[a-zA-Z_][a-zA-Z0-9_]*)*$/,
        message: '权限编码格式不正确',
      },
    },
  },
  {
    name: '排序',
    key: 'sort',
    type: 'text',
    default: 1,
    help: '同级节点排序值，从 1 开始，值越小越靠前',
    rules: {
      required: true,
      pattern: {
        value: /^[1-9]\d*$/,
        message: '排序必须是大于等于 1 的整数',
      },
    },
  },
  {
    name: '权限路由',
    key: 'path',
    type: 'text',
    visibleIf: (formValues) => isType('menu', formValues),
    help: '前端权限对应的路由路径，自动衔接父级路径',
    rules: {
      required: true,
      pattern: {
        value: /^\//,
        message: '权限路由必须以 / 开头',
      },
    },
  },
  {
    name: 'view 组件',
    key: 'component',
    type: 'text',
    visibleIf: (formValues) => isType('menu', formValues),
    help: '推荐填写目录路径（如 Manage/Permission），系统会自动命中 views/Manage/Permission/index.vue；也兼容旧格式',
    rules: {
      required: false,
      pattern: {
        value: /^[a-z0-9-]+(?:\/[a-z0-9-]+)*(?:\.vue)?$/i,
        message: 'view 组件路径格式不正确',
      },
    },
  },
  {
    name: '权限图标',
    key: 'icon',
    type: 'icon',
    visibleIf: (formValues) => {
      const type = formValues.type || 'menu'
      return type === 'menu' || type === 'button'
    },
  },
  {
    name: '外链地址',
    key: 'is_external',
    type: 'text',
    visibleIf: (formValues) => isType('menu', formValues),
    help: '填写外部链接地址（如 https://example.com）后，菜单点击将优先跳转至此 URL，而非路由路径',
  },
  {
    name: '是否隐藏',
    key: 'is_hidden',
    type: 'toggle',
    default: false,
    help: '开启后前端将隐藏此权限对应的菜单或按钮',
    config: {
      varient: 'switch',
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
  const currentType = (values.type || 'menu') as 'menu' | 'button' | 'api'
  const prevType = lastPermissionType.value
  let nextValues = values

  if (prevType === 'menu' && currentType !== 'menu') {
    nextValues = { ...values }
    let hasChanges = false

    menuOnlyKeys.forEach((key) => {
      if (nextValues[key] !== null && nextValues[key] !== undefined && nextValues[key] !== '') {
        hasChanges = true
      }
      nextValues[key] = null
    })

    if (currentType === 'api') {
      if (nextValues.icon !== null && nextValues.icon !== undefined && nextValues.icon !== '') {
        hasChanges = true
      }
      nextValues.icon = null
    }

    if (hasChanges) {
      const formApi = (formRef.value as any)?.form
      menuOnlyKeys.forEach((key) => {
        formApi?.setFieldValue?.(key, null)
      })
      if (currentType === 'api') {
        formApi?.setFieldValue?.('icon', null)
      }
    }
  }

  lastPermissionType.value = currentType
  manager.markFormChanged(nextValues)
}
const handlePermission = async (data: Record<string, any>) => {
  await manager.saveCurrent(data)
}
</script>

<template>
  <div class="w-full h-full min-h-0 flex flex-col">
    <!-- Empty State -->
    <pf-empty
      v-if="formMode === 'empty'"
      class="flex-1"
      title="权限编辑"
      description="请在左侧选择或新建开始编辑"
    ></pf-empty>

    <!-- Edit Form -->
    <div v-else class="flex-1 min-h-0 flex flex-col gap-4">
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
            <pf-button variant="ghost" :disabled="manager.isSaving.value" @click="handleCancel"
              >取消</pf-button
            >
            <pf-button variant="secondary" :disabled="manager.isSaving.value" @click="handleReset"
              >重置</pf-button
            >
            <pf-button
              type="primary"
              :disabled="manager.isSaving.value"
              :aria-busy="manager.isSaving.value"
              @click="handleSubmit"
            >
              <template #prefix>
                <div
                  v-if="manager.isSaving.value"
                  class="i-tabler-loader-2 h-4 w-4 animate-spin"
                ></div>
              </template>
              {{ manager.isSaving.value ? '保存中...' : '保存' }}
            </pf-button>
          </div>
        </div>
      </pf-card>

      <!-- Form Content -->
      <pf-card class="p-4 pr-2 flex-1 min-h-0 overflow-hidden">
        <div class="h-full min-h-0 overflow-y-auto px-4">
          <pf-form
            ref="form"
            :form-config="formConfig"
            :form-data="formData"
            :form-mode="formMode"
            :form-rules="formRules"
            :on-change="handleFormChange"
            :on-submit="handlePermission"
          ></pf-form>
        </div>
      </pf-card>
    </div>
  </div>
</template>

<style scoped></style>
