<script setup lang="ts">
import PageLayoutSingle from '@/layouts/page-layout/PageLayoutSingle.vue'
import PermissionTree from './components/PermissionTree.vue'
import PermissionForm from './components/PermissionForm.vue'
import { usePermissionManager } from './usePermissionManager'
import type { PfTreeNode } from '@/components/pf/pf-tree'

const manager = usePermissionManager()
const { allPermissionTree, choosenId } = manager

const handleChoose = async (nextId: string | number | null) => {
  await manager.selectNode(nextId)
}

const handleTreeDataChange = (treeData: PfTreeNode[]) => {
  manager.reorderTree(treeData)
}

provide('permissionManager', manager)
</script>
<template>
  <PageLayoutSingle class="flex flex-row gap-4">
    <!-- all Permission tree -->
    <pf-card class="w-40% h-full min-h-0 flex flex-col overflow-hidden">
      <template #header>
        <div class="w-full flex items-center justify-between">
          <pf-text :prefix-line="true" as="h3">权限列表</pf-text>
          <pf-button
            variant="outline"
            size="sm"
            icon="i-tabler-plus"
            @click="manager.createDraftNode()"
            >新建权限</pf-button
          >
        </div>
      </template>
      <div class="flex-1 min-h-0 overflow-y-auto">
        <permission-tree
          :tree-data="allPermissionTree"
          :choosen="choosenId"
          :draggable="manager.canDragTree.value"
          :reordering="manager.isReordering.value"
          :on-create-draft-node="manager.createDraftNode"
          @update:choosen="handleChoose"
          @update:treeData="handleTreeDataChange"
        ></permission-tree>
      </div>
    </pf-card>
    <!-- edit area -->
    <div class="flex-1 h-full min-h-0">
      <permission-form></permission-form>
    </div>
  </PageLayoutSingle>
</template>

<style scoped></style>
