<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'
import type { SidebarItem } from '@/components/pf/pf-sidebar'
import usePermissionStore from '@/store/permissionStore'
import { useSystemStore } from '@/store/systemStore'
import AdminLayoutHeader from './components/AdminLayoutHeader.vue'

const route = useRoute()
const permissionStore = usePermissionStore()
const systemStore = useSystemStore()
const { isSidebarOpen } = storeToRefs(systemStore)

const appRouteChildren = computed(() => permissionStore.dynamicRoutes)

const activeAppPath = computed(() => {
  const path = route.path
  for (const item of appRouteChildren.value) {
    const itemPath = item.path.startsWith('/') ? item.path : `/${item.path}`
    if (path === itemPath || path.startsWith(`${itemPath}/`)) {
      return itemPath
    }
  }
  return ''
})

const resolveRouteChildren = (currentPath: string): RouteRecordRaw[] => {
  for (const parent of appRouteChildren.value) {
    const parentPath = parent.path.startsWith('/') ? parent.path : `/${parent.path}`
    if (currentPath === parentPath || currentPath.startsWith(`${parentPath}/`)) {
      return parent.children || []
    }
  }
  return []
}

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
  <div class="h-full min-h-0 flex gap-3 p-3 bg-transparent">
    <div
      :class="
        isSidebarOpen
          ? 'w-56 border-border/45 bg-admin-surface opacity-100'
          : 'w-0 border-transparent bg-transparent opacity-0'
      "
      class="h-full rounded-[1.25rem] border text-sidebar-surface-foreground transform-gpu transition-all duration-300 ease-out overflow-hidden"
    >
      <PfSliderbarProvider>
        <PfSidebar :items="sidebarItems"></PfSidebar>
      </PfSliderbarProvider>
    </div>

    <div class="flex-1 min-h-0 min-w-0 flex flex-col gap-3 overflow-hidden">
      <AdminLayoutHeader></AdminLayoutHeader>

      <main
        class="flex-1 min-h-0 overflow-hidden rounded-[1.25rem] border border-border/45 bg-admin-surface"
      >
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>
