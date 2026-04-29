<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'
import GlobalLayoutSidebar from './components/global-layout-sidebar/GlobalLayoutSidebar.vue'
import usePermissionStore from '@/store/permissionStore'

const permissionStore = usePermissionStore()

const route = useRoute()

interface AppMenuItem {
  path: string
  title: string
  icon: string
  firstChildPath: string
}

/**
 * 动态路由树来自 permissionStore，已按权限过滤（超级管理员直接获得全量路由）。
 * 无需在此层再次 filterByPermission。
 */
const appRouteChildren = computed(() => permissionStore.dynamicRoutes)

const appMenuItems = computed<AppMenuItem[]>(() => {
  return appRouteChildren.value.map((child: RouteRecordRaw) => {
    const parentPath = child.path.startsWith('/') ? child.path : `/${child.path}`
    const firstChild = child.children?.[0]
    const firstChildPath = firstChild ? `${parentPath}/${firstChild.path}` : parentPath
    return {
      path: parentPath,
      title: (child.meta?.title as string) || child.path,
      icon: (child.meta?.icon as string) || '',
      firstChildPath,
    }
  })
})

const activeAppPath = computed(() => {
  const path = route.path
  for (const item of appMenuItems.value) {
    if (path === item.path || path.startsWith(`${item.path}/`)) {
      return item.path
    }
  }
  return ''
})
</script>

<template>
  <div class="w-screen h-screen overflow-hidden bg-app-shell text-app-shell-foreground">
    <GlobalLayoutSidebar :items="appMenuItems" :active-path="activeAppPath" />

    <div class="h-full min-h-0 pl-[4.5rem] pr-3 py-3 bg-transparent">
      <div
        class="h-full min-h-0 rounded-[1.5rem] bg-app-frame-surface shadow-[inset_0_1px_0_hsl(var(--background)/0.54),inset_18px_0_36px_-36px_hsl(var(--foreground)/0.18)]"
      >
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
