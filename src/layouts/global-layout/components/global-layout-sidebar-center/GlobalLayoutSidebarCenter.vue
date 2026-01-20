<script setup lang="ts">
  const menuItems = ref([
    { icon: 'i-tabler-home', label: 'Home', active: true },
    { icon: 'i-tabler-dashboard', label: 'Dashboard', active: false },
    { icon: 'i-tabler-layers-intersect', label: 'Components', active: false },
    { icon: 'i-tabler-settings', label: 'Settings', active: false },
  ])

  const isMobile = () => window.innerWidth < 768

  const tooltipOptions = (content: string) => ({
    content: content,
    placement: 'right',
    theme: 'pf-tooltip-sidebar',
    touch: isMobile() ? ['hold', 300] : true,
    hideOnClick: isMobile() ? 'toggle' : true,
  })
</script>

<template>
  <div class="w-full h-full flex flex-col items-center gap-2">
    <div
      v-for="(app, appIndex) in menuItems"
      :key="appIndex"
      class="flex justify-center items-center w-80% aspect-square rounded-lg transition-all duration-200 hover:(bg-primary/15)"
      :class="[app.active ? 'bg-primary/10 text-primary' : 'text-foreground', 'active:scale-95']"
      v-pf-tooltip="tooltipOptions(app.label)"
    >
      <div :class="app.icon" class="text-xl"></div>
    </div>
  </div>
</template>

<style scoped></style>
