<script setup lang="ts">
  import type { PfButtonProps } from './index'

  const props = defineProps<PfButtonProps>()
</script>

<template>
  <Button v-bind="props">
    <slot name="default"></slot>
  </Button>
</template>
