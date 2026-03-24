<script setup lang="ts">
  import PfTree from '@/components/pf/pf-tree/PfTree.vue'
  import type { PfTreeNode } from '@/components/pf/pf-tree'

  // props
  const props = defineProps<{
    treeData: PfTreeNode[]
    choosen: number | string | null
  }>()

  const emits = defineEmits(['update:choosen'])

  const choosenNodes = computed({
    get() {
      return props.choosen || null
    },
    set(v) {
      emits('update:choosen', v)
    },
  })

  // tree methods
  const treeRef = useTemplateRef('tree')

  defineExpose({
    getTreeData: () => {
      return treeRef.value ? treeRef.value.getTreeData() : []
    },
  })
</script>

<template>
  <PfTree
    ref="tree"
    :modelValue="props.treeData"
    :chooseable="true"
    v-model:choosen="choosenNodes"
  />
</template>
