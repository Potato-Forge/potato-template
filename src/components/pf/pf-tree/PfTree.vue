<script setup lang="ts">
import { Draggable } from '@he-tree/vue'
import PfTreeCheckbox from './PfTreeCheckbox.vue'
import type { PfTreeNode } from '.'
import type { PfTreeProps } from './types/PfTreeProps.types'
import { Icon } from '@iconify/vue'

// props
const props = withDefaults(defineProps<PfTreeProps>(), {
  labelKey: 'name',
  valueKey: 'id',
  childrenKey: 'children',
  disabledKey: 'disabled',
  chooseable: true,
  checkable: true,
  draggable: false,
  rootDroppable: true,
  dragOpen: true,
  dragOpenDelay: 120,
})

// Tree Instance
const treeRef = useTemplateRef('tree')
// Tree methods
const getTreeData = () => {
  return treeRef.value ? treeRef.value.getData() : []
}

const getCheckedKeys = (): (string | number)[] => {
  if (!treeRef.value) return []
  return treeRef.value.getChecked().map((stat: any) => stat.data[props.valueKey])
}

const setCheckedByKeys = (keys: (string | number)[]) => {
  if (!treeRef.value) return
  const keySet = new Set(keys.map(String))
  for (const stat of treeRef.value.statsFlat) {
    const key = String((stat.data as Record<string, unknown>)[props.valueKey])
    stat.checked = keySet.has(key)
  }
}

// emits
const emit = defineEmits<{
  (event: 'update:modelValue', value: PfTreeNode[]): void
  (event: 'update:choosen', value: string | number | null): void
}>()

// data
const data = computed({
  get() {
    return props.modelValue
  },
  set(v) {
    emit('update:modelValue', v)
  },
})

// Node Class
const nodeClass = (stat: any) => {
  return [
    // node choose
    props.chooseable ? 'cursor-pointer' : '',
    isNodeChoosen(stat) ? 'bg-selected text-primary ring-2 ring-inset ring-primary' : '',
  ]
}

// Check
const checkedNodes = ref<any[]>([])
const onCheckNode = () => {
  if (treeRef.value) {
    checkedNodes.value = treeRef.value.getChecked()
  }
}

// choose
const choosen = computed({
  get() {
    return props.choosen
  },
  set(v) {
    if (v) {
      emit('update:choosen', v)
    } else {
      emit('update:choosen', null)
    }
  },
})

const onChooseNode = (stat: any) => {
  if (!props.chooseable) return
  const key = stat.data[props.valueKey]
  choosen.value = choosen.value === key ? null : key
}

const isNodeChoosen = (stat: any) => {
  return choosen.value != null && choosen.value === stat.data[props.valueKey]
}

// expose
defineExpose({
  getTreeData,
  getCheckedKeys,
  setCheckedByKeys,
})
</script>

<template>
  <Draggable
    ref="tree"
    v-model="data"
    :indent="16"
    :treeLine="true"
    class="pf-tree"
    :key-field="props.valueKey"
    :nodeKey="(stat) => stat.data[props.valueKey]"
    :disable-drag="!props.draggable"
    :each-droppable="props.eachDroppable"
    :root-droppable="props.rootDroppable"
    :drag-open="props.dragOpen"
    :drag-open-delay="props.dragOpenDelay"
    @check:node="onCheckNode"
  >
    <template #placeholder>
      <div class="pf-tree-drop-indicator" aria-hidden="true">
        <div class="pf-tree-drop-indicator-v"></div>
        <div class="pf-tree-drop-indicator-h"></div>
      </div>
    </template>

    <template #default="{ node, stat }">
      <div
        class="relative w-full h-10 flex items-stretch pr-2 hover:(bg-secondary) transition-colors ease-in-out duration-200 rounded overflow-hidden"
        :class="nodeClass(stat)"
        @click="onChooseNode(stat)"
      >
        <!-- Checkbox  -->
        <div v-if="props.checkable" class="flex items-center mx-2">
          <pf-tree-checkbox v-model="stat.checked" class="mx-1" @click.stop />
        </div>

        <!-- Toggle Button -->
        <div v-show="node.children && node.children.length" class="flex items-center">
          <div
            :class="[
              stat.open ? 'rotate-90' : 'rotate-0',
              'transition-transform duration-200 ease-out cursor-pointer',
            ]"
            @click="stat.open = !stat.open"
          >
            <div class="i-tabler-chevron-right text-primary text-4"></div>
          </div>
        </div>

        <!-- Node Text -->
        <div class="flex-grow flex items-center whitespace-nowrap mx-2">
          <!-- Node Icon -->
          <slot name="icon" :node="node" :stat="stat">
            <Icon v-if="node.icon" :icon="`tabler:${node.icon}`" class="text-lg mr-1" />
          </slot>
          <slot
            name="text"
            :node="node"
            :stat="stat"
            :class="isNodeChoosen(stat) ? 'text-selected-foreground' : 'text-foreground'"
            >{{ node.name || node.text }}</slot
          >
        </div>

        <!-- Node SubText -->
        <div class="flex items-center">
          <slot name="subText" :node="node" :stat="stat"></slot>
        </div>

        <!-- Node Actions -->
        <div class="flex items-center" @click.stop.prevent @mousedown.stop>
          <slot name="actions" :node="node" :stat="stat"></slot>
        </div>

        <!-- Node choosen -->
        <div
          :class="isNodeChoosen(stat) ? 'scale-x-100' : 'scale-x-0'"
          class="absolute inset-y-0 right-0 w-2 origin-right rounded-r bg-primary pointer-events-none transition-transform duration-150 ease"
        ></div>
      </div>
    </template>
  </Draggable>
</template>

<style>
.pf-tree .tree-node {
  position: relative;
}

/* he-tree 的线条基础样式 */
.pf-tree .tree-line {
  position: absolute;
  background-color: hsl(var(--border));
}

/* 竖线 */
.pf-tree .tree-vline {
  inline-size: 1px;
  inset-block-start: 0;
  inset-block-end: 0;
}

/* 横线 */
.tree-hline {
  block-size: 2px;
  inset-inline-start: 0;
  inset-inline-end: 0;
  inset-block-start: 50%;
}

.pf-tree .tree-line {
  background: hsl(var(--border));
}

.pf-tree .tree-vline {
  background: hsl(var(--border));
  inline-size: 1px;
}

.pf-tree .tree-hline {
  background: hsl(var(--border));
  block-size: 1px;
  inline-size: 10px;
}

.pf-tree .tree-node-inner {
  animation: tree-row-in 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.pf-tree .drag-placeholder-wrapper .he-tree-drag-placeholder {
  height: 0;
  min-height: 0;
  border: 0;
  background: transparent;
}

.pf-tree-drop-indicator {
  position: relative;
  height: 0;
  width: 100%;
}

.pf-tree-drop-indicator-h {
  position: absolute;
  left: 0;
  right: 0;
  top: -1px;
  border-top: 2px solid hsl(var(--primary));
}

.pf-tree-drop-indicator-v {
  position: absolute;
  left: 0;
  top: -9px;
  height: 10px;
  border-left: 2px solid hsl(var(--primary));
}

@keyframes tree-row-in {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
    filter: blur(2px); /* 增加一点模糊感，更显高级 */
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}
</style>
