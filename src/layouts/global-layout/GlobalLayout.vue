<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'
import type { SidebarItem } from '@/components/pf/pf-sidebar'
import GlobalLayoutSidebar from './components/global-layout-sidebar/GlobalLayoutSidebar.vue'
import GlobalLayoutHeader from './components/global-layout-header/GlobalLayoutHeader.vue'
import { useSystemStore } from '@/store/systemStore'
import usePermissionStore from '@/store/permissionStore'

const systemStore = useSystemStore()
const { isSidebarOpen } = storeToRefs(systemStore)

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

const resolveRouteChildren = (currentPath: string): RouteRecordRaw[] => {
  for (const parent of appRouteChildren.value) {
    const parentPath = parent.path.startsWith('/') ? parent.path : `/${parent.path}`
    if (currentPath === parentPath || currentPath.startsWith(`${parentPath}/`)) {
      return parent.children || []
    }
  }
  return []
}

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

const sidebarItems = computed<SidebarItem[]>(() => {
  if (!activeAppPath.value) return []
  const children = resolveRouteChildren(route.path)
  const currentPath = route.path
  return children.map((child: RouteRecordRaw) => {
    const childPath = `${activeAppPath.value}/${child.path}`
    const grandChildren = child.children
    return {
      title: (child.meta?.title as string) || child.path,
      url: childPath,
      icon: (child.meta?.icon as string) || '',
      isActive: currentPath === childPath || currentPath.startsWith(`${childPath}/`),
      items: grandChildren
        ? grandChildren.map((gc: RouteRecordRaw) => {
            const gcPath = `${childPath}/${gc.path}`
            return {
              title: (gc.meta?.title as string) || gc.path,
              url: gcPath,
              icon: (gc.meta?.icon as string) || '',
              isActive: currentPath === gcPath || currentPath.startsWith(`${gcPath}/`),
            }
          })
        : undefined,
    }
  })
})
</script>

<template>
  <div class="w-screen h-screen overflow-hidden bg-background">
    <GlobalLayoutSidebar :items="appMenuItems" :active-path="activeAppPath" />

    <div class="h-full min-h-0 pl-16 flex bg-background">
      <div
        :class="isSidebarOpen ? 'w-56 mr-2' : 'w-0 mr-0'"
        class="mt-2 mb-2 bg-secondary rounded-2xl transform-gpu transition-all duration-300 ease-out overflow-x-hidden"
      >
        <PfSliderbarProvider>
          <PfSidebar class="mr-2" :items="sidebarItems"></PfSidebar>
        </PfSliderbarProvider>
      </div>

      <div
        class="flex-1 min-h-0 min-w-0 my-3 mr-2 rounded-2xl bg-secondary flex flex-col overflow-hidden"
      >
        <header class="h-12 border-b-1px border-border mx-2">
          <GlobalLayoutHeader></GlobalLayoutHeader>
        </header>

        <main class="flex-1 min-h-0 overflow-hidden">
          <router-view></router-view>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
