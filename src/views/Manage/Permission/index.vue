<script setup lang="ts">
import PageLayout from '@/layouts/page-layout/PageLayout.vue'
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
  <PageLayout mode="single" background="transparent" class="flex flex-row gap-4">
    <!-- all Permission tree -->
    <pf-card
      class="w-40% h-full min-h-0 flex flex-col overflow-hidden border-border/45 bg-content-surface"
    >
      <template #header>
        <div class="w-full flex items-center justify-between">
          <pf-text :prefix-line="true" as="h3">权限列表</pf-text>
          <pf-button
            v-permission="'manage:permission:create'"
            variant="outline"
            size="sm"
            icon="i-tabler-plus"
            @click="manager.createDraftNode()"
            >新建权限</pf-button
          >
        </div>
      </template>
      <div class="flex-1 min-h-0 overflow-y-auto p-2">
        <permission-tree
          :tree-data="allPermissionTree"
          :choosen="choosenId"
          :draggable="manager.canDragTree.value"
          :reordering="manager.isReordering.value"
          :on-create-draft-node="manager.createDraftNode"
          :on-delete-node="manager.deleteNode"
          @update:choosen="handleChoose"
          @update:treeData="handleTreeDataChange"
        ></permission-tree>
      </div>
    </pf-card>
    <!-- edit area -->
    <div
      class="flex-1 h-full min-h-0 rounded-2xl border border-border/45 bg-content-surface p-4 shadow-[0_24px_48px_-32px_hsl(var(--foreground)/0.22)]"
    >
      <permission-form></permission-form>
    </div>
  </PageLayout>
</template>

<style scoped></style>
