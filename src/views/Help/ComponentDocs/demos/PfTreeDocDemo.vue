<script setup lang="ts">
const treeData = ref([
  {
    id: '1',
    parent_id: null,
    name: '系统帮助',
    children: [
      { id: '1-1', parent_id: '1', name: '设计规范' },
      { id: '1-2', parent_id: '1', name: '组件文档' },
    ],
  },
])

const choosen = ref<string | number | null>('1-2')
</script>

<template>
  <div class="max-w-xl rounded-2xl border border-border bg-card px-3 py-3">
    <PfTree v-model="treeData" v-model:choosen="choosen" />
  </div>
</template>