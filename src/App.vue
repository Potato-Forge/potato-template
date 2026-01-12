<script setup lang="ts">
  import PfToastProvider from '@/components/pf/pf-toast/PfToastProvider.vue'
</script>
<template>
  <PfToastProvider>
    <router-view></router-view>
  </PfToastProvider>
</template>
<style scoped></style>
