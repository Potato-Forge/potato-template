<script setup lang="ts">
  import PageLayoutSingle from '@/layouts/page-layout/PageLayoutSingle.vue'
  import PermissionTree from './components/PermissionTree.vue'
  import PermissionForm from './components/PermissionForm.vue'
  import { usePermissionManager } from './usePermissionManager'

  const treeRef = useTemplateRef('tree')

  const manager = usePermissionManager(treeRef)
  const { allPermissionTree, choosenId, choosenPath } = manager

  provide('permissionManager', manager)
</script>
<template>
  <PageLayoutSingle class="flex flex-row gap-4">
    <!-- all Permission tree -->
    <pf-card class="w-40% h-full min-h-0 flex flex-col overflow-hidden">
      <template #header>
        <div class="w-full flex items-center justify-between">
          <pf-text :prefix-line="true" as="h3">权限列表</pf-text>
          <pf-button size="sm" icon="i-tabler-plus">新建权限</pf-button>
        </div>
      </template>
      <div class="flex-1 min-h-0 overflow-y-auto">
        <permission-tree
          ref="tree"
          :tree-data="allPermissionTree"
          v-model:choosen="choosenId"
        ></permission-tree>
      </div>
    </pf-card>
    <!-- edit area -->
    <div class="flex-1 h-full">
      <permission-form></permission-form>
    </div>
  </PageLayoutSingle>
</template>

<style scoped></style>
