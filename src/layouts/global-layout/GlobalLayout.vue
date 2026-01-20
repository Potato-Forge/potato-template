<script setup lang="ts">
  import GlobalLayoutSidebar from './components/global-layout-sidebar/GlobalLayoutSidebar.vue'
  import GlobalLayoutHeader from './components/global-layout-header/GlobalLayoutHeader.vue'
  import { useSystemStore } from '@/store/systemStore'

  // menu sidebar state
  const systemStore = useSystemStore()

  const { isSidebarOpen } = storeToRefs(systemStore)
</script>

<template>
  <!-- 主布局容器 -->
  <div class="w-screen h-screen overflow-hidden bg-background">
    <!-- App sidebar fixed -->
    <GlobalLayoutSidebar />

    <!-- 2. 主体内容区域 -->
    <div class="h-full pl-16 flex bg-background flex">
      <!-- Menu sidebar -->
      <div
        :class="isSidebarOpen ? 'w-56 mr-2' : 'w-0 mr-0'"
        class="mt-2 mb-2 bg-secondary rounded-2xl transform-gpu transition-all duration-300 ease-out overflow-x-hidden"
      >
        <PfSliderbarProvider>
          <PfSidebar class="mr-2"></PfSidebar>
        </PfSliderbarProvider>
      </div>

      <!-- main content -->
      <div class="flex-1 my-3 mr-2 rounded-2xl bg-secondary flex flex-col">
        <header class="h-12 border-b-1px border-border mx-2">
          <GlobalLayoutHeader></GlobalLayoutHeader>
        </header>

        <main class="flex-1">
          <router-view></router-view>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
