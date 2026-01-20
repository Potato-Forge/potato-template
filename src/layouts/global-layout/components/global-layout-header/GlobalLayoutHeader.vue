<script setup lang="ts">
  import { useSystemStore } from '@/store/systemStore'
  import SidebarHambergurButton from './components/SidebarHambergurButton.vue'
  const isLargeScreen = useMediaQuery('(min-width:1024px)')

  // menu sidebar state
  const systemStore = useSystemStore()
  const { isSidebarOpen } = storeToRefs(systemStore)
</script>

<template>
  <div class="w-full h-full flex justify-between items-center px-4">
    <!-- left -->
    <div class="h-full flex flex-col gap-2 justify-center">
      <SidebarHambergurButton class="text-lg text-primary" v-model="isSidebarOpen" />
    </div>
  </div>
</template>

<style scoped></style>
