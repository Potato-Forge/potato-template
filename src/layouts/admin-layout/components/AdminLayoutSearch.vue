<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { RouteRecordRaw } from 'vue-router'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import usePermissionStore from '@/store/permissionStore'

interface SearchItem {
  key: string
  title: string
  path: string
  targetPath: string
  icon: string
  iconifyIcon: string
  breadcrumbs: string[]
  keywords: string
}

const router = useRouter()
const route = useRoute()
const permissionStore = usePermissionStore()

const open = ref(false)
const searchText = ref('')
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const resultRefs = ref<HTMLElement[]>([])

const isAppleDevice =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.platform)

const normalizeIconifyName = (icon?: string | null) => {
  if (!icon) return ''
  if (icon.includes(':')) return icon
  if (icon.startsWith('i-')) return ''
  return `tabler:${icon}`
}

const joinRoutePath = (basePath: string, nextPath: string) => {
  if (!nextPath) return basePath
  if (nextPath.startsWith('/')) return nextPath

  const normalizedBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath
  const normalizedNext = nextPath.replace(/^\//, '')
  return normalizedBase ? `${normalizedBase}/${normalizedNext}` : `/${normalizedNext}`
}

const resolveRedirectPath = (basePath: string, redirect: RouteRecordRaw['redirect']) => {
  if (!redirect) return basePath

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
  record: RouteRecordRaw | undefined,
  fallbackPath: string,
): string => {
  if (!record) return fallbackPath

  if (record.redirect) {
    return resolveRedirectPath(fallbackPath, record.redirect)
  }

  if (record.component || record.components) {
    return fallbackPath
  }

  const firstChild = record.children?.[0]
  if (!firstChild) {
    return fallbackPath
  }

  return resolveFirstReachablePath(
    firstChild,
    joinRoutePath(fallbackPath, String(firstChild.path ?? '')),
  )
}

const flattenRoutes = (
  routes: RouteRecordRaw[],
  parentPath = '',
  parentTitles: string[] = [],
): SearchItem[] => {
  return routes.flatMap((record) => {
    const currentPath = joinRoutePath(parentPath, String(record.path ?? ''))
    const title = typeof record.meta?.title === 'string' ? record.meta.title : ''
    const breadcrumbs = title ? [...parentTitles, title] : parentTitles
    const currentItem = title
      ? [
          {
            key: `${String(record.name ?? currentPath)}-${breadcrumbs.join('/')}`,
            title,
            path: currentPath,
            targetPath: resolveFirstReachablePath(record, currentPath),
            icon: typeof record.meta?.icon === 'string' ? record.meta.icon : '',
            iconifyIcon: normalizeIconifyName(
              typeof record.meta?.icon === 'string' ? record.meta.icon : '',
            ),
            breadcrumbs,
            keywords: [
              title,
              breadcrumbs.join(' '),
              currentPath,
              String(record.name ?? ''),
              String(record.meta?.code ?? ''),
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase(),
          } satisfies SearchItem,
        ]
      : []

    const childItems = record.children?.length
      ? flattenRoutes(record.children, currentPath, breadcrumbs)
      : []

    return [...currentItem, ...childItems]
  })
}

const allItems = computed(() => {
  const deduped = new Map<string, SearchItem>()
  for (const item of flattenRoutes(permissionStore.dynamicRoutes)) {
    const dedupeKey = `${item.title}-${item.targetPath}`
    if (!deduped.has(dedupeKey)) {
      deduped.set(dedupeKey, item)
    }
  }
  return Array.from(deduped.values())
})

const filteredItems = computed(() => {
  const query = searchText.value.trim().toLowerCase()
  const items = query
    ? allItems.value.filter((item) => item.keywords.includes(query))
    : allItems.value

  return [...items].sort((left, right) => {
    const leftExact = left.targetPath === route.path ? 1 : 0
    const rightExact = right.targetPath === route.path ? 1 : 0
    if (leftExact !== rightExact) {
      return rightExact - leftExact
    }

    const leftStartsWith = query && left.title.toLowerCase().startsWith(query) ? 1 : 0
    const rightStartsWith = query && right.title.toLowerCase().startsWith(query) ? 1 : 0
    if (leftStartsWith !== rightStartsWith) {
      return rightStartsWith - leftStartsWith
    }

    return left.breadcrumbs.join('/').localeCompare(right.breadcrumbs.join('/'), 'zh-CN')
  })
})

const activeItem = computed(() => filteredItems.value[activeIndex.value] ?? null)

const shortcutHint = computed(() => (isAppleDevice ? '⌘K' : 'Ctrl K'))

const syncActiveIndex = () => {
  if (!filteredItems.value.length) {
    activeIndex.value = 0
    return
  }

  const currentIndex = filteredItems.value.findIndex((item) => item.targetPath === route.path)
  activeIndex.value = currentIndex >= 0 ? currentIndex : 0
}

const scrollActiveItemIntoView = () => {
  const el = resultRefs.value[activeIndex.value]
  el?.scrollIntoView({ block: 'nearest' })
}

const focusSearchInput = async () => {
  await nextTick()
  inputRef.value?.focus()
  inputRef.value?.select()
  scrollActiveItemIntoView()
}

const openSearch = async () => {
  open.value = true
  await focusSearchInput()
}

const closeSearch = () => {
  open.value = false
}

const moveActive = (step: number) => {
  if (!filteredItems.value.length) return
  const total = filteredItems.value.length
  activeIndex.value = (activeIndex.value + step + total) % total
  nextTick(scrollActiveItemIntoView)
}

const selectItem = async (item = activeItem.value) => {
  if (!item) return
  closeSearch()
  if (item.targetPath !== route.path) {
    await router.push(item.targetPath)
  }
}

const setResultRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  if (!(el instanceof HTMLElement)) return
  resultRefs.value[index] = el
}

const handleInputKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveActive(1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveActive(-1)
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    void selectItem()
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closeSearch()
  }
}

const handleWindowKeydown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null
  const isEditableTarget =
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target?.isContentEditable

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    void openSearch()
    return
  }

  if (!open.value || isEditableTarget) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveActive(1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveActive(-1)
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    void selectItem()
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closeSearch()
  }
}

watch(open, (value) => {
  resultRefs.value = []

  if (value) {
    syncActiveIndex()
    void focusSearchInput()
    return
  }

  searchText.value = ''
  activeIndex.value = 0
})

watch(searchText, () => {
  activeIndex.value = 0
  nextTick(scrollActiveItemIntoView)
})

watch(
  () => route.fullPath,
  () => {
    if (open.value) {
      closeSearch()
    }
  },
)

onMounted(() => {
  window.addEventListener('keydown', handleWindowKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleWindowKeydown)
})
</script>

<template>
  <button
    type="button"
    class="inline-flex h-10 items-center gap-3 rounded-full border border-border/55 bg-content-surface/88 px-4 text-sm text-muted-foreground shadow-[inset_0_1px_0_hsl(var(--background)/0.75)] transition-colors hover:bg-content-surface"
    @click="openSearch"
  >
    <div class="i-tabler-search h-4 w-4"></div>
    <span>搜索菜单...</span>
    <span
      class="rounded-full border border-border/60 bg-background/90 px-2 py-0.5 text-[11px] text-foreground/70"
    >
      {{ shortcutHint }}
    </span>
  </button>

  <Dialog v-model:open="open">
    <DialogContent class="max-w-2xl gap-0 overflow-hidden border-border/60 bg-admin-surface p-0">
      <DialogHeader class="border-b border-border/50 px-5 py-4">
        <DialogTitle class="text-base font-semibold">搜索菜单</DialogTitle>
        <DialogDescription class="sr-only">
          输入菜单名称后可用上下方向键导航结果并按回车进入。
        </DialogDescription>
      </DialogHeader>

      <div class="border-b border-border/50 px-5 py-4">
        <label
          class="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/72 px-4 py-3 shadow-[inset_0_1px_0_hsl(var(--background)/0.75)]"
        >
          <div class="i-tabler-search h-4 w-4 shrink-0 text-muted-foreground"></div>
          <input
            ref="inputRef"
            v-model="searchText"
            type="text"
            placeholder="输入菜单名称、路径或权限码"
            class="h-6 w-full border-0 bg-transparent p-0 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            @keydown="handleInputKeydown"
          />
        </label>
      </div>

      <div class="max-h-[26rem] min-h-[16rem] overflow-y-auto px-2 py-2">
        <div
          v-if="!filteredItems.length"
          class="flex h-full min-h-[14rem] flex-col items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <div class="i-tabler-search-off h-8 w-8 text-foreground/30"></div>
          <p>没有匹配的菜单结果</p>
          <p class="text-xs text-muted-foreground/80">可以尝试标题、路径或权限码</p>
        </div>

        <div v-else class="flex flex-col gap-1">
          <button
            v-for="(item, index) in filteredItems"
            :key="item.key"
            :ref="(el) => setResultRef(el, index)"
            type="button"
            class="flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition-colors"
            :class="
              index === activeIndex
                ? 'bg-primary/10 text-foreground ring-1 ring-primary/20'
                : 'text-foreground/88 hover:bg-accent/70'
            "
            @mouseenter="activeIndex = index"
            @click="selectItem(item)"
          >
            <div
              class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary"
            >
              <Icon v-if="item.iconifyIcon" :icon="item.iconifyIcon" class="h-4.5 w-4.5" />
              <div v-else-if="item.icon" :class="item.icon" class="h-4.5 w-4.5"></div>
              <div v-else class="i-tabler-file-text h-4.5 w-4.5"></div>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-3">
                <p class="truncate text-sm font-medium">{{ item.title }}</p>
                <span
                  v-if="index === activeIndex"
                  class="shrink-0 rounded-full bg-primary/12 px-2 py-0.5 text-[11px] text-primary"
                >
                  回车进入
                </span>
              </div>

              <p class="mt-1 truncate text-xs text-muted-foreground">
                {{ item.breadcrumbs.join(' / ') }}
              </p>
              <p class="mt-1 truncate text-[11px] text-muted-foreground/80">
                {{ item.targetPath }}
              </p>
            </div>
          </button>
        </div>
      </div>

      <div
        class="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 px-5 py-3 text-xs text-muted-foreground"
      >
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-md border border-border/60 bg-background/80 px-2 py-1"
            >↑ ↓ 导航</span
          >
          <span class="rounded-md border border-border/60 bg-background/80 px-2 py-1"
            >Enter 确认</span
          >
          <span class="rounded-md border border-border/60 bg-background/80 px-2 py-1"
            >Esc 关闭</span
          >
          <span class="rounded-md border border-border/60 bg-background/80 px-2 py-1">
            {{ shortcutHint }} 打开
          </span>
        </div>

        <span>{{ filteredItems.length }} 个结果</span>
      </div>
    </DialogContent>
  </Dialog>
</template>
