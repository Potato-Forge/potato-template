<script setup lang="ts">
  import PfAvatar from '@/layouts/modules/PfAvatar.vue'
  const isDark = useDark()
</script>

<template>
  <div class="w-full flex flex-col gap-2 justify-center items-center pb-4 gap-4">
    <!-- help btn -->
    <PfButton size="icon" class="rounded-full text-foreground/50" variant="ghost">
      <div class="i-tabler-help"></div>
    </PfButton>

    <!-- settings btn -->
    <PfButton size="icon" class="rounded-full text-foreground/50" variant="ghost">
      <div class="i-tabler-settings"></div>
    </PfButton>

    <!-- dark mode switch -->
    <FancyDarkModeSwitch class="w-50%" v-model="isDark"></FancyDarkModeSwitch>

    <!-- avatar -->
    <PfAvatar></PfAvatar>
  </div>
</template>

<style scoped></style>
