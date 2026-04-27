<script setup lang="ts">
import type { PfFormSelectOption } from '@/components/pf/pf-form/PfForm.types'
import PfFormItemOptions from '@/components/pf/pf-form/components/PfFormItemOptions.vue'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { getRoleUserIds, setRoleUsers } from '@/api/role/role'
import { getUsers, resolveAvatarPublicUrl, type UserProfile } from '@/api/user/user'
import { pfToast } from '@/components/pf/pf-toast'

const props = defineProps<{
  roleCode: string
  roleName: string
}>()

const open = defineModel<boolean>('open', { default: false })

const allUsers = ref<UserProfile[]>([])
const userOptions = ref<PfFormSelectOption[]>([])
const selectedUserIds = ref<string[]>([])
const isLoading = ref(false)
const isSaving = ref(false)

const selectedUsers = computed(() => {
  const selectedSet = new Set(selectedUserIds.value)
  return allUsers.value.filter((user) => selectedSet.has(user.id))
})

const toUserOption = (user: UserProfile): PfFormSelectOption => {
  const displayName = user.username || user.full_name || user.email || user.id
  const descriptionParts = [user.full_name, user.email].filter(Boolean)

  return {
    label: displayName,
    value: user.id,
    description: descriptionParts.length > 0 ? descriptionParts.join(' | ') : `ID: ${user.id}`,
    searchText: `${displayName} ${descriptionParts.join(' ')} ${user.id}`,
  }
}

const loadData = async () => {
  if (!props.roleCode) return

  isLoading.value = true
  try {
    const [users, userIds] = await Promise.all([getUsers(), getRoleUserIds(props.roleCode)])

    allUsers.value = users
    userOptions.value = users.map((user) => toUserOption(user))
    selectedUserIds.value = userIds
  } catch (error) {
    pfToast.error('加载失败', error instanceof Error ? error.message : '加载用户列表失败')
  } finally {
    isLoading.value = false
  }
}

watch(open, (val) => {
  if (val) {
    loadData()
    return
  }

  allUsers.value = []
  userOptions.value = []
  selectedUserIds.value = []
})

const handleSave = async () => {
  if (!props.roleCode || isSaving.value) return

  isSaving.value = true
  try {
    await setRoleUsers(props.roleCode, selectedUserIds.value)
    pfToast.success('保存成功', `已更新角色 ${props.roleName} 的用户列表`)
    open.value = false
  } catch (error) {
    pfToast.error('保存失败', error instanceof Error ? error.message : '保存角色用户失败')
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
        <SheetTitle>角色用户管理 - {{ roleName }}</SheetTitle>
      </SheetHeader>

      <div class="min-h-0 flex-1 overflow-auto py-4 space-y-4">
        <div
          class="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground"
        >
          已选择 {{ selectedUserIds.length }} 位用户，可按用户名、姓名、邮箱搜索。
        </div>

        <pf-loading :loading="isLoading" text="加载用户中...">
          <pf-empty
            v-if="!isLoading && userOptions.length === 0"
            title="暂无用户"
            description="当前系统中还没有可绑定的用户"
          />

          <PfFormItemOptions
            v-else
            v-model="selectedUserIds"
            :multiple="true"
            variant="combobox"
            :searchable="true"
            placeholder="请选择用户"
            :options="userOptions"
            :disabled="isSaving"
          />
        </pf-loading>

        <div class="rounded-md border border-border">
          <div class="border-b border-border px-3 py-2 text-sm font-medium">当前角色用户</div>
          <div class="max-h-72 overflow-auto p-3">
            <pf-empty
              v-if="!isLoading && selectedUsers.length === 0"
              title="尚未绑定用户"
              description="请在上方选择用户后保存"
            />

            <div v-else class="space-y-2">
              <div
                v-for="user in selectedUsers"
                :key="user.id"
                class="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2"
              >
                <div class="flex min-w-0 items-center gap-2">
                  <span
                    class="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold text-muted-foreground"
                  >
                    <img
                      v-if="resolveAvatarPublicUrl(user.avatar_url)"
                      :src="resolveAvatarPublicUrl(user.avatar_url) || ''"
                      alt="avatar"
                      class="h-full w-full object-cover"
                    />
                    <span v-else>{{
                      (user.username || user.full_name || 'U').slice(0, 1).toUpperCase()
                    }}</span>
                  </span>
                  <div class="min-w-0">
                    <div class="truncate text-sm font-medium">
                      {{ user.username || user.full_name || user.id }}
                    </div>
                    <div class="truncate text-xs text-muted-foreground">
                      {{ user.email || user.full_name || user.id }}
                    </div>
                  </div>
                </div>
                <pf-button
                  size="sm"
                  variant="ghost"
                  :disabled="isSaving"
                  @click="selectedUserIds = selectedUserIds.filter((id) => id !== user.id)"
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
