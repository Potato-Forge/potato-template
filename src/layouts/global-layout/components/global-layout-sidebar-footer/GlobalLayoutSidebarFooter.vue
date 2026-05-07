<script setup lang="ts">
import PfAvatar from '@/layouts/modules/PfAvatar.vue'
import { useSystemStore } from '@/store/systemStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const systemStore = useSystemStore()

const isDark = computed({
  get: () => systemStore.isDarkMode,
  set: (value: boolean) => {
    systemStore.setThemeMode(value ? 'dark' : 'light')
  },
})
</script>

<template>
  <div class="w-full flex flex-col gap-2 justify-center items-center pb-4 gap-4">
    <!-- help btn -->
    <PfButton
      size="icon"
      class="rounded-full text-foreground/50"
      variant="ghost"
      @click="router.push('/help/system')"
    >
      <div class="i-tabler-help"></div>
    </PfButton>

    <!-- settings btn -->
    <PfButton
      size="icon"
      class="rounded-full text-foreground/50"
      variant="ghost"
      @click="router.push('/system/theme-settings')"
    >
      <div class="i-tabler-settings"></div>
    </PfButton>

    <!-- dark mode switch -->
    <FancyDarkModeSwitch class="w-50%" v-model="isDark"></FancyDarkModeSwitch>

    <!-- avatar -->
    <PfAvatar></PfAvatar>
  </div>
</template>

<style scoped></style>
