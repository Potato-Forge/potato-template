<script setup lang="ts">
import type { JSX } from 'vue/jsx-runtime'
import { PfTooltip } from '../pf-tooltip'

const props = defineProps<{
  content?: string | Component | (() => VNode | JSX.Element)
  position?: 'top' | 'bottom' | 'left' | 'right'
}>()
</script>

<template>
  <PfTooltip :position="props.position || 'top'">
    <div
      class="i-tabler-help text-muted-foreground/50 cursor-help leading-none -translate-y-1px text-xs"
    ></div>

    <template #content>
      <slot name="content">
        <span v-if="typeof props.content === 'string'">{{ props.content }}</span>
        <component v-else :is="props.content" />
      </slot>
    </template>
  </PfTooltip>
</template>

<style scoped></style>
