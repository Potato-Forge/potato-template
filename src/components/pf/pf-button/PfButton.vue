<script setup lang="ts">
import type { PfButtonProps } from './index'

const props = defineProps<PfButtonProps>()
</script>

<template>
  <Button v-bind="props">
    <div class="flex items-center gap-2">
      <!-- icon -->
      <slot name="prefix">
        <div v-if="props.icon" :class="props.icon"></div>
      </slot>
      <!-- content -->
      <slot />
      <!-- suffix -->
      <slot name="suffix"></slot>
    </div>
  </Button>
</template>
