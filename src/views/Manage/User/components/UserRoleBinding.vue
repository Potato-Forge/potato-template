<script setup lang="ts">
import type { PfFormSelectOption } from '@/components/pf/pf-form/PfForm.types'
import PfFormItemOptions from '@/components/pf/pf-form/components/PfFormItemOptions.vue'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { getRoles } from '@/api/role/role'
import { getUserRoleCodes, setUserRoles } from '@/api/user/user'
import { pfToast } from '@/components/pf/pf-toast'

const props = defineProps<{
  userId: string
  username: string
}>()

const open = defineModel<boolean>('open', { default: false })

const roleOptions = ref<PfFormSelectOption[]>([])
const selectedRoleCodes = ref<string[]>([])
const isLoading = ref(false)
const isSaving = ref(false)

const selectedCount = computed(() => selectedRoleCodes.value.length)

const loadData = async () => {
  if (!props.userId) return

  isLoading.value = true
  try {
    const [roles, roleCodes] = await Promise.all([getRoles(), getUserRoleCodes(props.userId)])

    roleOptions.value = roles.map((role) => ({
      label: role.name,
      value: role.code,
      description: role.description || `角色编码: ${role.code}`,
      searchText: `${role.name} ${role.code} ${role.description || ''}`,
    }))
    selectedRoleCodes.value = roleCodes
  } catch (error) {
    pfToast.error('加载失败', error instanceof Error ? error.message : '加载角色列表失败')
  } finally {
    isLoading.value = false
  }
}

watch(open, (val) => {
  if (val) {
    loadData()
    return
  }

  roleOptions.value = []
  selectedRoleCodes.value = []
})

const handleSave = async () => {
  if (!props.userId || isSaving.value) return

  isSaving.value = true
  try {
    await setUserRoles(props.userId, selectedRoleCodes.value)
    pfToast.success('保存成功', `已更新 ${props.username} 的角色列表`)
    open.value = false
  } catch (error) {
    pfToast.error('保存失败', error instanceof Error ? error.message : '保存角色列表失败')
  } finally {
    isSaving.value = false
  }
}

const handleCancel = () => {
  if (isSaving.value) return
  open.value = false
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent side="right" class="w-full flex flex-col sm:max-w-xl">
      <SheetHeader class="shrink-0">
        <SheetTitle>用户角色管理 - {{ username }}</SheetTitle>
      </SheetHeader>

      <div class="min-h-0 flex-1 overflow-auto py-4 space-y-3">
        <div
          class="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
        >
          当前已选 {{ selectedCount }} 个角色，支持搜索和多选。
        </div>

        <pf-loading :loading="isLoading" text="加载角色中...">
          <pf-empty
            v-if="!isLoading && roleOptions.length === 0"
            title="暂无可分配角色"
            description="请先在角色管理中创建角色"
          />

          <PfFormItemOptions
            v-else
            v-model="selectedRoleCodes"
            :multiple="true"
            variant="combobox"
            :searchable="true"
            placeholder="请选择角色"
            :options="roleOptions"
            :disabled="isSaving"
          />
        </pf-loading>
      </div>

      <SheetFooter class="shrink-0 flex gap-2 pt-4 border-t border-border">
        <pf-button variant="ghost" :disabled="isSaving" @click="handleCancel">取消</pf-button>
        <pf-button :disabled="isLoading || isSaving" @click="handleSave">
          {{ isSaving ? '保存中...' : '保存' }}
        </pf-button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
