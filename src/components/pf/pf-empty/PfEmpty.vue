<script setup lang="ts">
const props = defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="w-full h-full flex flex-col gap-6 justify-center items-center">
    <!-- Icon Slot -->
    <slot name="icon">
      <div class="i-tabler-box-seam text-primary text-4xl"></div>
    </slot>
    <pf-text as="h3" class="text-muted-foreground">{{ props.title }}</pf-text>
    <pf-text as="p" class="text-muted-foreground">{{ props.description }}</pf-text>

    <!-- action slot -->
    <div>
      <slot name="action"></slot>
    </div>
  </div>
</template>

<style scoped></style>
