<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { RouteRecordNormalized, RouteRecordRaw } from 'vue-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useSystemStore } from '@/store/systemStore'
import SidebarHambergurButton from '@/layouts/global-layout/components/global-layout-header/components/SidebarHambergurButton.vue'
import AdminLayoutSearch from './AdminLayoutSearch.vue'
import AdminLayoutNotificationMenu from './AdminLayoutNotificationMenu.vue'

const route = useRoute()
const router = useRouter()
const systemStore = useSystemStore()
const { isSidebarOpen } = storeToRefs(systemStore)

type ReachableRouteRecord = RouteRecordRaw | RouteRecordNormalized

const joinRoutePath = (basePath: string, nextPath: string) => {
  if (!nextPath) return basePath
  if (nextPath.startsWith('/')) return nextPath
  const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath
  return `${normalizedBase}/${nextPath.replace(/^\//, '')}`
}

const resolveRedirectPath = (basePath: string, redirect: ReachableRouteRecord['redirect']) => {
  if (!redirect) {
    return basePath
  }

  if (typeof redirect === 'string') {
    return joinRoutePath(basePath, redirect)
  }

  if (typeof redirect === 'function') {
    return basePath
  }

  if ('path' in redirect && typeof redirect.path === 'string') {
    return joinRoutePath(basePath, redirect.path)
  }

  if ('name' in redirect && redirect.name) {
    return router.resolve({ name: redirect.name, params: route.params }).path
  }

  return basePath
}

const resolveFirstReachablePath = (
  record: ReachableRouteRecord | undefined,
  fallbackPath: string,
): string => {
  if (!record) return fallbackPath

  if (record.redirect) {
    return resolveRedirectPath(record.path || fallbackPath, record.redirect)
  }

  if (
    ('components' in record && record.components && Object.keys(record.components).length > 0) ||
    ('component' in record && !!record.component)
  ) {
    return record.path || fallbackPath
  }

  const firstChild = record.children?.[0]
  if (!firstChild) {
    return record.path || fallbackPath
  }

  return resolveFirstReachablePath(
    firstChild,
    joinRoutePath(record.path || fallbackPath, firstChild.path),
  )
}

const resolveBreadcrumbHref = (path: string) => {
  const matchedRecord = router.getRoutes().find((item) => item.path === path)
  return resolveFirstReachablePath(matchedRecord, path)
}

const resolveIconName = (icon: unknown) => {
  if (!icon || typeof icon !== 'string') return ''
  if (icon.includes(':')) return icon
  if (icon.startsWith('i-')) return ''
  return `tabler:${icon}`
}

const breadcrumbItems = computed(() => {
  return route.matched
    .filter((item) => item.meta?.title)
    .map((item) => ({
      name: String(item.meta.title),
      href: resolveBreadcrumbHref(item.path),
      icon: typeof item.meta?.icon === 'string' ? item.meta.icon : '',
      iconifyIcon: resolveIconName(item.meta?.icon),
    }))
})

const routeIcon = computed(() => {
  return resolveIconName(route.meta?.icon)
})

const routeTitle = computed(() => String(route.meta?.title ?? ''))
</script>

<template>
  <header class="sticky top-0 z-10 shrink-0">
    <div
      class="flex h-17 items-center justify-between gap-4 rounded-[1.25rem] border border-border/45 bg-admin-surface px-5 text-header-surface-foreground"
    >
      <div class="flex min-w-0 items-center gap-4">
        <SidebarHambergurButton class="text-lg text-primary" v-model="isSidebarOpen" />

        <div class="min-w-0 flex items-center gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/12"
          >
            <Icon v-if="routeIcon" :icon="routeIcon" class="h-5 w-5 shrink-0 text-primary" />
            <span
              v-else-if="route.meta?.icon"
              :class="route.meta.icon"
              class="h-5 w-5 shrink-0"
            ></span>
          </div>

          <div class="min-w-0 flex flex-col justify-center gap-1.5">
            <Breadcrumb
              v-if="breadcrumbItems.length"
              class="min-w-0 text-[11px] leading-4 tracking-[0.08em] text-muted-foreground/90"
            >
              <BreadcrumbList class="flex-nowrap overflow-hidden">
                <template v-for="(item, index) in breadcrumbItems" :key="`${item.href}-${index}`">
                  <BreadcrumbItem class="min-w-0 shrink overflow-hidden">
                    <BreadcrumbLink
                      v-if="index < breadcrumbItems.length - 1"
                      as-child
                      class="inline-flex min-w-0 items-center gap-1.5 truncate"
                    >
                      <RouterLink
                        :to="item.href"
                        class="inline-flex min-w-0 items-center gap-1.5 truncate"
                      >
                        <Icon
                          v-if="item.iconifyIcon"
                          :icon="item.iconifyIcon"
                          class="h-3.5 w-3.5 shrink-0 text-muted-foreground/80"
                        />
                        <span
                          v-else-if="item.icon"
                          :class="item.icon"
                          class="h-3.5 w-3.5 shrink-0 text-muted-foreground/80"
                        ></span>
                        <span class="truncate">{{ item.name }}</span>
                      </RouterLink>
                    </BreadcrumbLink>

                    <BreadcrumbPage
                      v-else
                      class="inline-flex min-w-0 items-center gap-1.5 truncate"
                    >
                      <Icon
                        v-if="item.iconifyIcon"
                        :icon="item.iconifyIcon"
                        class="h-3.5 w-3.5 shrink-0 text-primary/85"
                      />
                      <span
                        v-else-if="item.icon"
                        :class="item.icon"
                        class="h-3.5 w-3.5 shrink-0 text-primary/85"
                      ></span>
                      <span class="truncate">{{ item.name }}</span>
                    </BreadcrumbPage>
                  </BreadcrumbItem>

                  <BreadcrumbSeparator v-if="index < breadcrumbItems.length - 1" />
                </template>
              </BreadcrumbList>
            </Breadcrumb>

            <h1
              class="truncate text-[1.3rem] leading-7 font-semibold tracking-[-0.02em] text-foreground"
            >
              {{ routeTitle }}
            </h1>
          </div>
        </div>
      </div>

      <div class="shrink-0 flex items-center gap-3">
        <AdminLayoutSearch></AdminLayoutSearch>
        <AdminLayoutNotificationMenu></AdminLayoutNotificationMenu>
      </div>
    </div>
  </header>
</template>
