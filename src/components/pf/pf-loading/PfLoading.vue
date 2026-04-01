<script setup lang="ts">
  const props = defineProps<{
    loading: boolean
  }>()
</script>

<template>
  <div class="w-full h-full">
    <!-- loading -->
    <div
      v-if="props.loading"
      class="w-full h-full absolute top-0 left-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col justify-center items-center gap-4"
    >
      <div
        class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"
      ></div>
      <pf-text class="text-primary">加载中...</pf-text>
    </div>
    <!-- content -->
    <slot></slot>
  </div>
</template>

<style scoped></style>
