<script setup lang="ts">
  import Button from '@/components/ui/button/Button.vue'
  const isDark = useDark()
  const toggleDark = useToggle(isDark)
</script>

<template>
  <div class="w-full flex flex-col gap-2">
    <Button @click="toggleDark()">
      <div :class="isDark ? 'i-carbon-moon' : 'i-carbon-sun'"></div>
    </Button>
  </div>
</template>

<style scoped></style>
