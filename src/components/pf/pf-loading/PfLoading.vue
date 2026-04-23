<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    loading: boolean
    text?: string
    blockInteraction?: boolean
  }>(),
  {
    text: '加载中...',
    blockInteraction: true,
  },
)
</script>

<template>
  <div class="relative w-full h-full">
    <!-- loading -->
    <div
      v-if="props.loading"
      class="absolute inset-0 z-50 flex h-full w-full flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm"
      :class="props.blockInteraction ? 'pointer-events-auto' : 'pointer-events-none'"
    >
      <div
        class="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"
      ></div>
      <pf-text class="text-primary">{{ props.text }}</pf-text>
    </div>
    <!-- content -->
    <slot />
  </div>
</template>

<style scoped></style>
