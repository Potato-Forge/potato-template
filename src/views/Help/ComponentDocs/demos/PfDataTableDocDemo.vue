<script setup lang="ts">
import type { PfDataTableItem } from '@/components/pf/pf-data-table'

const rows = [
  { id: 1, name: '系统公告', owner: '平台运营', status: '已发布' },
  { id: 2, name: '角色同步', owner: '系统管理', status: '草稿' },
]

const columns: PfDataTableItem[] = [
  {
    key: 'name',
    name: '名称',
    type: 'text',
    table: { show: true },
  },
  {
    key: 'owner',
    name: '负责人',
    type: 'text',
    table: { show: true },
  },
  {
    key: 'status',
    name: '状态',
    type: 'text',
    table: { show: true },
  },
]
</script>

<template>
  <PfDataTable :columns="columns" :table-data="rows" :hide-create="true" :hide-delete="true" />
</template>