<script setup lang="ts">
  import type { TreeNode } from '@/utils/tree'
  import PermissionItem from './PermissionItem.vue'

  defineProps<{
    node: TreeNode[]
  }>()
</script>

<template>
  <div class="pl-4">
    <permission-item v-for="(nodeItem, nodeId) in node" :key="nodeItem.id" :node="nodeItem" />
  </div>
</template>
