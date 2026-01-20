<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      vertical?: boolean
    }>(),
    {
      vertical: false,
    },
  )
</script>

<template>
  <div :class="vertical ? 'h-full w-px bg-border' : 'w-full h-px bg-border'"></div>
</template>

<style scoped></style>
