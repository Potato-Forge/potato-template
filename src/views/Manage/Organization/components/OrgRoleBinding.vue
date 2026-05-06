<script setup lang="ts">
import type { PfFormSelectOption } from '@/components/pf/pf-form/PfForm.types'
import PfFormItemOptions from '@/components/pf/pf-form/components/PfFormItemOptions.vue'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { getOrgRoleCodes, setOrgRoles } from '@/api/organization/organization'
import { getRoles } from '@/api/role/role'
import { pfToast } from '@/components/pf/pf-toast'

const props = defineProps<{
  orgId: string
  orgName: string
}>()

const open = defineModel<boolean>('open', { default: false })

const allRoles = ref<{ id: string; code: string; name: string; description: string | null }[]>([])
const roleOptions = ref<PfFormSelectOption[]>([])
const selectedRoleCodes = ref<string[]>([])
const isLoading = ref(false)
const isSaving = ref(false)

const selectedRoles = computed(() => {
  const selectedSet = new Set(selectedRoleCodes.value)
  return allRoles.value.filter((role) => selectedSet.has(role.code))
})

const loadData = async () => {
  if (!props.orgId) return
  isLoading.value = true
  try {
    const [roles, orgRoleCodes] = await Promise.all([getRoles(), getOrgRoleCodes(props.orgId)])
    allRoles.value = roles
    roleOptions.value = roles.map((role) => ({
      label: role.name,
      value: role.code,
      description: role.description || role.code,
      searchText: `${role.name} ${role.code} ${role.description || ''}`,
    }))
    selectedRoleCodes.value = orgRoleCodes
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
  allRoles.value = []
  roleOptions.value = []
  selectedRoleCodes.value = []
})

const handleSave = async () => {
  if (!props.orgId || isSaving.value) return
  isSaving.value = true
  try {
    await setOrgRoles(props.orgId, selectedRoleCodes.value)
    pfToast.success('保存成功', `已更新组织 ${props.orgName} 的默认角色`)
    open.value = false
  } catch (error) {
    pfToast.error('保存失败', error instanceof Error ? error.message : '保存角色绑定失败')
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
    <SheetContent side="right" class="w-full flex flex-col sm:max-w-2xl">
      <SheetHeader class="shrink-0">
        <SheetTitle>角色绑定 - {{ orgName }}</SheetTitle>
      </SheetHeader>

      <div class="min-h-0 flex-1 overflow-auto py-4 space-y-4">
        <div
          class="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
        >
          组织绑定的角色为默认角色。成员加入组织后将自动继承这些角色的权限；离开组织后权限随之撤销。
        </div>

        <pf-loading :loading="isLoading" text="加载角色中...">
          <pf-empty
            v-if="!isLoading && roleOptions.length === 0"
            title="暂无角色"
            description="当前系统中还没有可绑定的角色"
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

        <div class="rounded-md border border-border">
          <div class="border-b border-border px-3 py-2 text-sm font-medium">当前绑定角色</div>
          <div class="max-h-72 overflow-auto p-3">
            <pf-empty
              v-if="!isLoading && selectedRoles.length === 0"
              title="尚未绑定角色"
              description="请在上方选择角色后保存"
            />

            <div v-else class="space-y-2">
              <div
                v-for="role in selectedRoles"
                :key="role.code"
                class="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2"
              >
                <div class="min-w-0">
                  <div class="truncate text-sm font-medium">{{ role.name }}</div>
                  <div class="truncate text-xs text-muted-foreground">
                    {{ role.description || role.code }}
                  </div>
                </div>
                <pf-button
                  size="sm"
                  variant="ghost"
                  :disabled="isSaving"
                  @click="
                    selectedRoleCodes = selectedRoleCodes.filter((code) => code !== role.code)
                  "
                >
                  移除
                </pf-button>
              </div>
            </div>
          </div>
        </div>
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
