<script setup lang="ts">
import { twMerge } from 'tailwind-merge'

const props = withDefaults(
  defineProps<{
    mode?: 'single' | 'flow'
    background?: 'card' | 'transparent'
  }>(),
  {
    mode: 'single',
    background: 'card',
  },
)

const attrs = useAttrs()

const containerClass = computed(() => {
  const modeClass = props.mode === 'flow' ? 'overflow-y-auto' : 'overflow-hidden'
  const backgroundClass =
    props.background === 'transparent'
      ? 'bg-transparent'
      : 'rounded-[1.5rem] border border-border/45 bg-content-surface p-4 text-content-surface-foreground shadow-[0_24px_48px_-32px_hsl(var(--foreground)/0.22)]'

  return twMerge(
    'h-full min-h-0 w-full flex flex-col',
    modeClass,
    backgroundClass,
    (attrs.class as string) || '',
  )
})
</script>

<template>
  <div v-bind="{ ...attrs, class: containerClass }">
    <slot></slot>
  </div>
</template>
