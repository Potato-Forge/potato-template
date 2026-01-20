<script setup lang="ts">
  import type { PfButtonProps } from './index'

  const props = defineProps<PfButtonProps>()
</script>

<template>
  <Button class="text-foreground" v-bind="props">
    <slot name="default"></slot>
  </Button>
</template>
