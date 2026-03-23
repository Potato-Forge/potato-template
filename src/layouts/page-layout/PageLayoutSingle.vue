<script setup lang="ts">
  import { twMerge } from 'tailwind-merge'

  const attrs = useAttrs()

  const containerClass = computed(() => {
    return twMerge(
      'w-full h-full min-h-0 flex flex-col p-4 overflow-hidden',
      (attrs.class as string) || '',
    )
  })
</script>

<template>
  <div v-bind="{ ...attrs, class: containerClass }">
    <slot name="default"></slot>
  </div>
</template>

<style scoped></style>
