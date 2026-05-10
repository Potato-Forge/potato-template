<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    shadow?: boolean
    border?: boolean
    class?: HTMLAttributes['class']
  }>(),
  {
    shadow: false,
    border: true,
    class: '',
  },
)

const cardClass = computed(() => {
  const baseClass = 'rounded-lg bg-card text-card-foreground flex flex-col'
  const shadowClass = props.shadow ? 'shadow' : ''
  const borderClass = props.border ? 'border border-border' : ''
  return cn(baseClass, shadowClass, borderClass, props.class)
})

const slots = useSlots()
const hasHeader = computed(() => !!(slots.header || slots['header-action']))
</script>

<template>
  <div :class="cardClass">
    <!-- header -->
    <div
      v-if="hasHeader"
      class="w-full flex items-center justify-between px-4 py-3 border-b border-border"
    >
      <slot name="header"> </slot>
      <!-- header action -->
      <div class="flex items-center gap-2">
        <slot name="header-action"> </slot>
      </div>
    </div>

    <!-- body -->
    <div class="w-full flex-1 min-h-0 flex flex-col">
      <slot name="default"> </slot>
    </div>

    <!-- footer -->
    <div class="w-full flex items-center">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
