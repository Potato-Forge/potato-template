<script setup lang="ts">
import PfLogo from '@/layouts/modules/PfLogo.vue'
import GlobalLayoutSidebarCenter from '../global-layout-sidebar-center/GlobalLayoutSidebarCenter.vue'
import GlobalLayoutSidebarFooter from '../global-layout-sidebar-footer/GlobalLayoutSidebarFooter.vue'

interface AppMenuItem {
  path: string
  title: string
  icon: string
  firstChildPath: string
}

defineProps<{
  items: AppMenuItem[]
  activePath: string
}>()
</script>

<template>
  <div
    class="w-16 h-full fixed top-0 left-0 bg-app-shell text-app-shell-foreground flex flex-col justify-between items-center select-none"
  >
    <div class="w-full aspect-ratio-square flex justify-center items-center px-4">
      <PfLogo
        animate
        is-hover
        gradient-from="#58B19F"
        gradient-to="#58B19F"
        class="text-primary"
      ></PfLogo>
    </div>
    <div class="flex-1 w-full">
      <GlobalLayoutSidebarCenter
        :items="items"
        :active-path="activePath"
      ></GlobalLayoutSidebarCenter>
    </div>
    <div class="w-full">
      <GlobalLayoutSidebarFooter></GlobalLayoutSidebarFooter>
    </div>
  </div>
</template>

<style scoped></style>
