<script setup lang="ts">
const enabled = ref(true)
</script>

<template>
  <label class="inline-flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
    <PfSwitch v-model="enabled" />
    <span class="text-sm text-foreground">{{ enabled ? '当前已启用' : '当前已停用' }}</span>
  </label>
</template>