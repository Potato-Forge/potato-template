<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '.'
import { computed } from 'vue'
import { Primitive } from 'reka-ui'
import { cn } from '@/lib/utils'
import { buttonVariants } from '.'

type SemanticButtonType = NonNullable<ButtonVariants['type']>

export interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant']
  type?: SemanticButtonType | 'waring' | 'button' | 'submit' | 'reset'
  // Backward compatibility for previous color API.
  color?: SemanticButtonType | 'waring'
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
})

const semanticTypeSet = new Set(['primary', 'success', 'info', 'warning', 'error'])

const normalizeSemanticType = (value?: string): SemanticButtonType | undefined => {
  if (!value) return undefined
  if (value === 'waring') return 'warning'
  return semanticTypeSet.has(value) ? (value as SemanticButtonType) : undefined
}

const buttonVisualType = computed<SemanticButtonType | undefined>(
  () =>
    normalizeSemanticType(props.type as string | undefined) ?? normalizeSemanticType(props.color),
)

const nativeButtonType = computed<'button' | 'submit' | 'reset' | undefined>(() => {
  const rawType = props.type
  return rawType === 'button' || rawType === 'submit' || rawType === 'reset' ? rawType : undefined
})
</script>

<template>
  <Primitive
    data-slot="button"
    :as="as"
    :as-child="asChild"
    :type="nativeButtonType"
    :class="cn(buttonVariants({ variant, type: buttonVisualType, size }), props.class)"
  >
    <slot />
  </Primitive>
</template>
