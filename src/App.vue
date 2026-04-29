<script setup lang="ts">
import PfToastProvider from '@/components/pf/pf-toast/PfToastProvider.vue'
import GlobalLoadingOverlay from '@/components/ui/loader/GlobalLoadingOverlay.vue'
</script>
<template>
  <PfToastProvider>
    <router-view></router-view>
    <GlobalLoadingOverlay></GlobalLoadingOverlay>
  </PfToastProvider>
</template>
<style scoped></style>
