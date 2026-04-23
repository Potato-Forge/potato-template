<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
</script>

<template>
  <slot name="default"></slot>
  <Toaster
    position="top-center"
    :close-button="false"
    close-button-position="top-left"
    :rich-colors="false"
    theme="system"
    ref="toaster"
  />
</template>

<style scoped></style>
