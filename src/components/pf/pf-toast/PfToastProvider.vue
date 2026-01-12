<script setup lang="ts">
  import { Toaster } from '@/components/ui/sonner'
  import 'vue-sonner/style.css'

  const toasterElement = useTemplateRef('toaster')
</script>

<template>
  <slot name="default"></slot>
  <Toaster
    position="top-center"
    :close-button="false"
    close-button-position="top-left"
    rich-colors
    theme="system"
    ref="toaster"
  />
</template>

<style scoped></style>
