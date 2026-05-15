<script setup lang="ts">
const checked = ref(true)
</script>

<template>
  <label class="inline-flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
    <PfCheckbox v-model="checked" />
    <span class="text-sm text-foreground">同步展示到帮助导航</span>
  </label>
</template>