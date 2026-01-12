<script setup lang="ts">
  import GlobalLayoutSidebar from './components/global-layout-sidebar/GlobalLayoutSidebar.vue'
</script>

<template>
  <div class="w-screen h-screen overflow-hidden flex">
    <!-- left app sidebar -->
    <GlobalLayoutSidebar></GlobalLayoutSidebar>

    <!-- right content -->
    <div class="h-full flex-1 flex flex-col bg-green"></div>
  </div>
</template>

<style scoped></style>
