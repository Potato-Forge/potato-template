<script setup lang="ts">
  import PfTree from '@/components/pf/pf-tree/PfTree.vue'
  import type { TreeNode } from '@/utils/tree'

  // props
  const props = defineProps<{
    node: TreeNode[]
    choosenNodes: TreeNode | null
  }>()

  const emits = defineEmits(['update:choosenNodes'])

  const choosenNodes = computed({
    get() {
      return props.choosenNodes
    },
    set(v) {
      emits('update:choosenNodes', v)
    },
  })
</script>

<template>
  <PfTree :modelValue="props.node" :chooseable="true" v-model:choosenNodes="choosenNodes" />
</template>
