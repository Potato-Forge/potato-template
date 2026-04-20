<script setup lang="ts">
import PfTree from '@/components/pf/pf-tree/PfTree.vue'
import type { PfTreeNode } from '@/components/pf/pf-tree'

// props
const props = defineProps<{
  treeData: PfTreeNode[]
  choosen: number | string | null
  draggable?: boolean
  reordering?: boolean
  onCreateDraftNode?: (parentId?: string | number) => Promise<boolean> | boolean
}>()

const emits = defineEmits(['update:choosen', 'update:treeData'])

const treeDataModel = computed({
  get() {
    return props.treeData
  },
  set(v: PfTreeNode[]) {
    emits('update:treeData', v)
  },
})

const choosenNodes = computed({
  get() {
    return props.choosen || null
  },
  set(v) {
    emits('update:choosen', v)
  },
})

const handleCreateChild = async (nodeId: string | number) => {
  if (!props.onCreateDraftNode) return
  await props.onCreateDraftNode(nodeId)
}

// tree methods
const treeRef = useTemplateRef('tree')

defineExpose({
  getTreeData: () => {
    return treeRef.value ? treeRef.value.getTreeData() : []
  },
})
</script>

<template>
  <div
    class="transition-all duration-200"
    :class="props.reordering ? 'opacity-75 saturate-60 pointer-events-none' : ''"
  >
    <PfTree
      ref="tree"
      v-model="treeDataModel"
      :chooseable="true"
      :draggable="props.draggable"
      v-model:choosen="choosenNodes"
    >
    <template #actions="{ node }">
      <div class="flex items-center">
        <pf-button
          v-pf-tooltip="{ content: '新建子节点' }"
          size="icon-sm"
          variant="ghost"
          icon="i-tabler-circle-plus"
          @click="handleCreateChild(node.id)"
        ></pf-button>
        <pf-button
          v-pf-tooltip="{ content: '删除节点' }"
          size="icon-sm"
          variant="ghost"
          icon="i-tabler-trash"
        ></pf-button>
      </div>
    </template>
    </PfTree>
  </div>
</template>
