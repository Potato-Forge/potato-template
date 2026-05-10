<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'a' | 'div' | 'blockquote' | 'kbd' | 'code'
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'link' | 'code' | 'kbd'
  href?: string
  truncate?: boolean | number
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'
  dimmed?: boolean
  prefixLine?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  as: 'div',
})

const attrs = useAttrs()

const isExternal = computed(() => props.href?.startsWith('http'))
const isAnchor = computed(() => props.href?.startsWith('#'))

const variantClasses = {
  // Heading 1: Manrope ExtraBold / 3.5rem / Tracking-tight
  h1: 'font-headline text-4xl md:text-[3.5rem] font-extrabold leading-none tracking-tight text-foreground',
  // Heading 2: Manrope Bold / 2.5rem
  h2: 'font-headline text-3xl md:text-4xl font-bold leading-tight text-foreground',
  // Heading 3: Manrope Bold / 1.75rem
  h3: 'font-headline text-2xl md:text-[1.75rem] font-bold leading-tight text-foreground',
  // Heading 4: Manrope Bold / 1.25rem
  h4: 'font-headline text-xl md:text-[1.25rem] font-bold leading-tight text-foreground',
  // Body: Inter / 1rem / Leading-relaxed
  body: 'font-body text-base leading-relaxed text-foreground',
  // Caption: Inter / 0.75rem
  caption: 'font-body text-xs text-muted-foreground italic',
  // Link: Primary Color / Underline Offset
  link: 'text-primary font-medium underline underline-offset-4 decoration-2 hover:opacity-80 transition-opacity inline-flex items-center gap-1 cursor-pointer',
  // Code: Mono / Muted Surface
  code: 'font-mono text-sm bg-muted px-2 py-1 rounded-md text-primary',
  // Kbd: Keyboard Action Style
  kbd: 'px-2.5 py-1.5 rounded-lg bg-background border border-border shadow-sm text-xs font-bold text-foreground inline-block mx-0.5',
}

// 权重覆盖映射
const weightClasses = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
}

const inferredVariant = computed<NonNullable<Props['variant']>>(() => {
  if (props.as === 'h1') return 'h1'
  if (props.as === 'h2') return 'h2'
  if (props.as === 'h3') return 'h3'
  if (props.as === 'h4') return 'h4'
  if (props.as === 'a') return 'link'
  if (props.as === 'kbd') return 'kbd'
  if (props.as === 'code') return 'code'
  return 'body'
})

const resolvedVariant = computed(() => props.variant ?? inferredVariant.value)

const truncateClass = computed(() => {
  if (typeof props.truncate === 'number') return 'pf-text-clamp'
  return props.truncate ? 'truncate' : ''
})

const truncateStyle = computed(() => {
  if (typeof props.truncate === 'number') {
    return { '--pf-line-clamp': String(props.truncate) }
  }
  return undefined
})

const externalClass = computed(() => (attrs.class as string) || '')

const rootAttrs = computed(() => {
  const { class: _, ...rest } = attrs as Record<string, unknown>
  return rest
})
</script>

<template>
  <component
    :is="as"
    v-bind="rootAttrs"
    :href="as === 'a' ? href : undefined"
    :target="isExternal ? '_blank' : undefined"
    :rel="isExternal ? 'noopener noreferrer' : undefined"
    :style="truncateStyle"
    :class="
      cn(
        'pf-text-root antialiased flex items-stretch',
        variantClasses[resolvedVariant],
        props.weight && weightClasses[props.weight],
        props.dimmed && 'text-muted-foreground',
        truncateClass,
        externalClass,
      )
    "
  >
    <!-- prefix line -->
    <span v-if="props.prefixLine" class="w-2 bg-primary rounded-full mr-2"></span>

    <slot name="prefix" />

    <slot />

    <template v-if="as === 'a' || resolvedVariant === 'link'">
      <span v-if="isExternal" class="i-tabler-external-link text-[1em]">open_in_new</span>
      <span v-else-if="isAnchor" class="i-tabler-link text-[1em]">link</span>
    </template>
  </component>
</template>

<style scoped>
.pf-text-root {
  /* 优化大标题排版均衡 */
  text-wrap: balance;
  word-break: break-word;
}

/* 针对 Blockquote 的特殊处理 */
blockquote.pf-text-root {
  @apply rounded-r-lg border-l-4 border-primary/35 bg-muted/40 pl-6 py-2 italic;
}

.pf-text-clamp {
  display: -webkit-box;
  -webkit-line-clamp: var(--pf-line-clamp);
  line-clamp: var(--pf-line-clamp);
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
