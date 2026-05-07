<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'
import GlobalLayoutSidebar from './components/global-layout-sidebar/GlobalLayoutSidebar.vue'
import usePermissionStore from '@/store/permissionStore'

const permissionStore = usePermissionStore()

const route = useRoute()
const router = useRouter()

interface AppMenuItem {
  path: string
  title: string
  icon: string
  firstChildPath: string
}

const joinRoutePath = (basePath: string, nextPath: string) => {
  if (!nextPath) return basePath
  if (nextPath.startsWith('/')) return nextPath
  const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath
  return `${normalizedBase}/${nextPath.replace(/^\//, '')}`
}

const resolveFirstReachablePath = (
  record: RouteRecordRaw | undefined,
  fallbackPath: string,
): string => {
  if (!record) return fallbackPath

  if (record.redirect) {
    if (typeof record.redirect === 'string') {
      return record.redirect.startsWith('/')
        ? record.redirect
        : joinRoutePath(fallbackPath, record.redirect)
    }

    if (typeof record.redirect === 'object') {
      return router.resolve(record.redirect).path
    }
  }

  if (record.name) {
    return router.resolve({ name: record.name as string }).path
  }

  if (record.children?.length) {
    const firstChild = record.children[0]
    return resolveFirstReachablePath(
      firstChild,
      joinRoutePath(fallbackPath, String(firstChild.path || '')),
    )
  }

  return fallbackPath
}

/**
 * 动态路由树来自 permissionStore，已按权限过滤（超级管理员直接获得全量路由）。
 * 无需在此层再次 filterByPermission。
 */
const allAppRoutes = computed(() => permissionStore.appRoutes)

const appRouteChildren = computed(() =>
  allAppRoutes.value.filter((child: RouteRecordRaw) => !child.meta?.is_hidden),
)

const appMenuItems = computed<AppMenuItem[]>(() => {
  return appRouteChildren.value.map((child: RouteRecordRaw) => {
    const parentPath = child.path.startsWith('/') ? child.path : `/${child.path}`
    const firstChildPath = resolveFirstReachablePath(child, parentPath)
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
  for (const item of allAppRoutes.value) {
    const itemPath = item.path.startsWith('/') ? item.path : `/${item.path}`
    if (path === itemPath || path.startsWith(`${itemPath}/`)) {
      return itemPath
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
