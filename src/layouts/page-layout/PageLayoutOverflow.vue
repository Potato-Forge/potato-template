<script setup lang="ts">
import PageLayout from './PageLayout.vue'
</script>

<template>
  <PageLayout mode="flow" background="card" v-bind="$attrs">
    <slot name="default"></slot>
  </PageLayout>
</template>
