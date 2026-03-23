<script setup lang="ts">
  import { Draggable } from '@he-tree/vue'
  import PfTreeCheckbox from './PfTreeCheckbox.vue'

  // props
  const props = withDefaults(
    defineProps<{
      modelValue: any[]
      labelKey?: string
      valueKey?: string
      childrenKey?: string
      disabledKey?: string
      chooseable?: boolean
      checkable?: boolean
      draggable?: boolean
      choosenNodes?: any
    }>(),
    {
      labelKey: 'name',
      valueKey: 'id',
      childrenKey: 'children',
      disabledKey: 'disabled',
      chooseable: true,
      checkable: true,
      draggable: false,
    },
  )

  // emits
  const emit = defineEmits(['update:modelValue', 'update:choosenNodes'])

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
      props.chooseable ? 'cursor-pointer' : '',
      isNodeChoosen(stat)
        ? 'bg-selected text-selected-foreground ring-2 ring-inset ring-primary'
        : '',
    ]
  }

  // Check
  const treeRef = useTemplateRef('tree')
  const checkedNodes = ref<any[]>([])
  const onCheckNode = () => {
    if (treeRef.value) {
      checkedNodes.value = treeRef.value.getChecked()
    }
  }

  // choose
  const choosenNodes = computed({
    get() {
      return props.choosenNodes
    },
    set(v) {
      emit('update:choosenNodes', v)
    },
  })
  const onChooseNode = (stats: any) => {
    if (props.chooseable) {
      if (getIndex(stats) === getIndex(choosenNodes.value)) {
        choosenNodes.value = null
      } else {
        choosenNodes.value = stats
      }
    }
  }
  const isNodeChoosen = (stats: any) => {
    return getIndex(choosenNodes.value) === getIndex(stats)
  }

  // node index
  const getIndex = (node: any) => {
    if (!node) return Symbol('invalid_node')

    const value = node[props.valueKey]

    if (value === null || value === '') {
      return Symbol('invalid_node_key')
    }

    return value
  }
</script>

<template>
  <Draggable
    ref="tree"
    v-model="data"
    :indent="16"
    :treeLine="true"
    class="pf-tree"
    :key-field="'text'"
    :nodeKey="(stat) => stat.data.text"
    :disable-drag="!props.draggable"
    @check:node="onCheckNode"
  >
    <template #default="{ node, stat }">
      <div
        class="relative w-full h-10 flex items-stretch hover:(bg-secondary) transition-colors ease-in-out duration-200 rounded overflow-hidden"
        :class="nodeClass(stat)"
        @click="onChooseNode(stat)"
      >
        <!-- Checkbox  -->
        <div class="flex items-center mx-2">
          <pf-tree-checkbox v-model="stat.checked" class="mx-1" />
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
        <div class="flex-grow flex items-center whitespace-nowrap">
          <!-- Node Icon -->
          <div :class="node.icon" class="text-primary"></div>
          <slot name="text">{{ node.name || node.text }}</slot>
        </div>

        <!-- Node SubText -->
        <div class="flex items-center">
          <slot name="subText"></slot>
        </div>

        <!-- Node Actions -->
        <div class="flex items-center">
          <slot name="actions"></slot>
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
