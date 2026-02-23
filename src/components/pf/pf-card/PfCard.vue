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
    const baseClass = 'rounded-lg bg-card text-card-foreground'
    const shadowClass = props.shadow ? 'shadow' : ''
    const borderClass = props.border ? 'border border-border' : ''
    return cn(baseClass, shadowClass, borderClass, props.class)
  })
</script>

<template>
  <div :class="cardClass">
    <slot />
  </div>
</template>
