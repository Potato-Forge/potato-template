<script setup lang="ts">
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { PfTree } from '@/components/pf/pf-tree'
import type { PfTreeNode } from '@/components/pf/pf-tree'
import { getAllPermissions } from '@/api/permission/permission'
import { getRolePermissions, setRolePermissions } from '@/api/role/role'
import { flatToTree } from '@/utils/tree'
import { pfToast } from '@/components/pf/pf-toast'

const props = defineProps<{
  roleCode: string
  roleName: string
}>()

const open = defineModel<boolean>('open', { default: false })

const treeRef = useTemplateRef<InstanceType<typeof PfTree>>('treeRef')

const permissionTree = ref<PfTreeNode[]>([])
const isLoading = ref(false)
const isSaving = ref(false)

const loadData = async () => {
  isLoading.value = true
  try {
    const [allPerms, rolePermIds] = await Promise.all([
      getAllPermissions(),
      getRolePermissions(props.roleCode),
    ])
    permissionTree.value = flatToTree(allPerms)

    // Wait for tree to render before setting checked state
    await nextTick()
    treeRef.value?.setCheckedByKeys(rolePermIds)
  } catch (err) {
    pfToast.error('加载失败', err instanceof Error ? err.message : '获取权限数据失败')
  } finally {
    isLoading.value = false
  }
}

watch(open, (val) => {
  if (val) {
    loadData()
  } else {
    permissionTree.value = []
  }
})

const handleSave = async () => {
  if (isSaving.value) return
  isSaving.value = true
  try {
    const checkedKeys = (treeRef.value?.getCheckedKeys() ?? []).map(Number).filter(Boolean)
    await setRolePermissions(props.roleCode, checkedKeys)
    pfToast.success('保存成功')
    open.value = false
  } catch (err) {
    pfToast.error('保存失败', err instanceof Error ? err.message : '设置权限失败')
  } finally {
    isSaving.value = false
  }
}

const handleCancel = () => {
  open.value = false
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent side="right" class="w-full flex flex-col sm:max-w-lg">
      <SheetHeader class="shrink-0">
        <SheetTitle>角色权限配置 — {{ roleName }}</SheetTitle>
      </SheetHeader>

      <div class="min-h-0 flex-1 overflow-auto py-4">
        <pf-loading :loading="isLoading" text="加载权限数据...">
          <pf-tree
            ref="treeRef"
            v-model="permissionTree"
            :chooseable="false"
            :checkable="true"
            :draggable="false"
          />
          <pf-empty
            v-if="!isLoading && permissionTree.length === 0"
            title="暂无权限数据"
            description="系统中尚未配置任何权限"
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
