<script setup lang="ts"></script>

<template>
  <div
    class="inline p-1 px-2 rounded-sm border border-dashed border-border bg-muted text-muted-foreground cursor-not-allowed"
  >
    <pf-text as="span">
      <slot></slot>
    </pf-text>
  </div>
</template>

<style scoped></style>
