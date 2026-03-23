<script setup lang="ts">
  import { useQuery } from '@tanstack/vue-query'
  import { permissionKeys, getAllPermissions } from '@/api/permission/permission'
  import PageLayoutSingle from '@/layouts/page-layout/PageLayoutSingle.vue'
  import { flatToTree, type TreeNode } from '@/utils/tree'
  import PermissionTree from './components/PermissionTree.vue'

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
  <PageLayoutSingle class="flex-row gap-2">
    <!-- all Menus -->
    <pf-card class="w-40% h-full p-2">
      <pf-text as="h3">权限列表</pf-text>
      <permission-tree
        :node="allPermissionTree"
        v-model:choosenNodes="choosenNodes"
      ></permission-tree>
    </pf-card>
    <!-- edit area -->
    <pf-card class="flex-1 w-fullh-full"></pf-card>
  </PageLayoutSingle>
</template>

<style scoped></style>
