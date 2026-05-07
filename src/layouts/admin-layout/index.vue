<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'
import type { SidebarItem } from '@/components/pf/pf-sidebar'
import usePermissionStore from '@/store/permissionStore'
import { useSystemStore } from '@/store/systemStore'
import AdminLayoutHeader from './components/AdminLayoutHeader.vue'

const route = useRoute()
const router = useRouter()
const permissionStore = usePermissionStore()
const systemStore = useSystemStore()
const { isSidebarOpen } = storeToRefs(systemStore)

const currentAppRecord = computed<RouteRecordRaw | undefined>(() => {
  const currentPath = route.path
  return permissionStore.appRoutes.find((record) => {
    const appPath = record.path.startsWith('/') ? record.path : `/${record.path}`
    return currentPath === appPath || currentPath.startsWith(`${appPath}/`)
  })
})

const activeAppPath = computed(() => {
  const path = currentAppRecord.value?.path || ''
  return path.startsWith('/') ? path : `/${path}`
})

const resolveRouteChildren = (): RouteRecordRaw[] => {
  return currentAppRecord.value?.children || []
}

const joinRoutePath = (basePath: string, nextPath: string) => {
  if (!nextPath) return basePath
  if (nextPath.startsWith('/')) return nextPath
  const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath
  return `${normalizedBase}/${nextPath.replace(/^\//, '')}`
}

const resolveRoutePath = (target: RouteRecordRaw, basePath: string) => {
  if (target.name) {
    return router.resolve({ name: target.name as string }).path
  }

  return joinRoutePath(basePath, String(target.path || ''))
}

const sidebarItems = computed<SidebarItem[]>(() => {
  if (!activeAppPath.value) return []

  const children = resolveRouteChildren()
  const currentPath = route.path

  return children.map((child: RouteRecordRaw) => {
    const childPath = resolveRoutePath(child, activeAppPath.value)
    const grandChildren = child.children
    return {
      title: (child.meta?.title as string) || child.path,
      url: childPath,
      icon: (child.meta?.icon as string) || '',
      isActive: currentPath === childPath || currentPath.startsWith(`${childPath}/`),
      items: grandChildren
        ? grandChildren.map((gc: RouteRecordRaw) => {
            const gcPath = resolveRoutePath(gc, childPath)
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
