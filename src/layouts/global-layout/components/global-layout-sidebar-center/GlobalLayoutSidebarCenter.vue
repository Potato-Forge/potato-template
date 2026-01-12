<script setup lang="ts">
  const menuItems = ref([
    { icon: 'i-carbon-home', label: 'Home', active: true },
    { icon: 'i-carbon-dashboard', label: 'Dashboard', active: false },
    { icon: 'i-carbon-layers', label: 'Components', active: false },
    { icon: 'i-carbon-settings', label: 'Settings', active: false },
  ])
</script>

<template>
  <div class="w-full h-full flex flex-col items-center gap-2">
    <div
      v-for="(app, appIndex) in menuItems"
      :key="appIndex"
      class="flex justify-center items-center w-80% aspect-square rounded-lg transition-all duration-200 hover:(bg-primary/15)"
      :class="[app.active ? 'bg-primary/10 text-primary' : 'text-foreground', 'active:scale-95']"
    >
      <div :class="app.icon" class="text-xl"></div>
    </div>
  </div>
</template>

<style scoped></style>
