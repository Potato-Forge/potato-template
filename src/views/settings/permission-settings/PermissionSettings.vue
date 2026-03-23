<script setup lang="ts">
  import { useQuery } from '@tanstack/vue-query'
  import { permissionKeys, getAllPermissions } from '@/api/permission/permission'
  import PageLayoutSingle from '@/layouts/page-layout/PageLayoutSingle.vue'
  import { flatToTree, type TreeNode } from '@/utils/tree'
  import PermissionTree from './components/PermissionTree.vue'
  import PermissionForm from './components/PermissionForm.vue'

  const {
    data: allPermissions,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: permissionKeys.all,
    queryFn: getAllPermissions,
  })

  const allPermissionTree = computed(() => {
    if (!allPermissions.value) return []

    return flatToTree(allPermissions.value)
  })

  // choosen nodes
  const choosenNodes = ref<TreeNode | null>(null)

  // inject data
  provide('allPermissionTree', allPermissionTree.value)
  provide('allPermissions', allPermissions.value)
</script>
<template>
  <PageLayoutSingle class="flex-row gap-2 min-h-0">
    <!-- all Menus -->
    <pf-card class="w-40% h-full min-h-0 flex flex-col p-2 overflow-hidden">
      <pf-text as="h3">权限列表</pf-text>
      <div class="flex-1 min-h-0 overflow-y-auto">
        <permission-tree
          :node="allPermissionTree"
          v-model:choosenNodes="choosenNodes"
        ></permission-tree>
      </div>
    </pf-card>
    <!-- edit area -->
    <pf-card class="flex-1 min-w-0 h-full min-h-0 flex flex-col overflow-hidden">
      <div class="flex-1 min-h-0 overflow-y-auto">
        <permission-form></permission-form>
      </div>
    </pf-card>
  </PageLayoutSingle>
</template>

<style scoped></style>
