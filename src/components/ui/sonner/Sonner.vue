<script lang="ts" setup>
import type { ToasterProps } from 'vue-sonner'
import { reactiveOmit } from '@vueuse/core'
import {
  BellIcon,
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  XIcon,
} from 'lucide-vue-next'
import { Toaster as Sonner } from 'vue-sonner'

const props = defineProps<ToasterProps>()
const delegatedProps = reactiveOmit(props, 'toastOptions')
</script>

<template>
  <Sonner
    class="toaster group"
    :toast-options="{
      classes: {
        toast: 'group toast group-[.toaster]:shadow-lg',
        default:
          'group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border',
        description: 'group-[.toast]:text-current opacity-85',
        actionButton:
          'group-[.toast]:bg-current group-[.toast]:text-background group-[.toast]:border-transparent',
        cancelButton:
          'group-[.toast]:bg-transparent group-[.toast]:text-current group-[.toast]:border-current/20 hover:group-[.toast]:bg-current/10',
        closeButton:
          'group-[.toast]:bg-transparent group-[.toast]:text-current group-[.toast]:border-transparent hover:group-[.toast]:bg-current/10',
        success:
          'group-[.toaster]:border-success group-[.toaster]:bg-success group-[.toaster]:text-success-foreground',
        info: 'group-[.toaster]:border-info group-[.toaster]:bg-info group-[.toaster]:text-info-foreground',
        warning:
          'group-[.toaster]:border-warning group-[.toaster]:bg-warning group-[.toaster]:text-warning-foreground',
        error:
          'group-[.toaster]:border-destructive group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground',
        icon: 'group-[.toast]:text-current',
      },
    }"
    v-bind="delegatedProps"
  >
    <template #success-icon>
      <CircleCheckIcon class="size-4" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-4" />
    </template>
    <template #warning-icon>
      <BellIcon class="size-4" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <Loader2Icon class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <XIcon class="size-4" />
    </template>
  </Sonner>
</template>
