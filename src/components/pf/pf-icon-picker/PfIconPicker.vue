<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Icon } from '@iconify/vue'

// ── Props & Emits ──────────────────────────────────────────────
const props = withDefaults(
  defineProps<{
    modelValue?: string | null
  }>(),
  { modelValue: null },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

/**
 * 本地持有选中值，避免受控模式下 prop 回流时序导致选中态/预览回退
 */
const internalValue = ref<string | null>(props.modelValue ?? null)

watch(
  () => props.modelValue,
  (val) => {
    internalValue.value = val ?? null
  },
)

// ── Search state ───────────────────────────────────────────────
type SearchMode = 'contains' | 'startsWith'
const searchText = ref('')
const searchMode = ref<SearchMode>('contains')

// ── Icon list loading ──────────────────────────────────────────
const iconList = ref<string[]>([])
const iconListLoading = ref(false)
const iconListError = ref(false)

const fetchIcons = async (): Promise<string[]> => {
  const response = await fetch('/tabler-index.json', { cache: 'force-cache' })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

onMounted(async () => {
  iconListLoading.value = true
  iconListError.value = false
  try {
    iconList.value = await fetchIcons()
  } catch {
    iconListError.value = true
  } finally {
    iconListLoading.value = false
  }
})

// ── Filtered list (search + mode) ─────────────────────────────
const filteredList = computed(() => {
  const q = searchText.value.trim().toLowerCase()
  if (!q) return iconList.value
  return iconList.value.filter((name) =>
    searchMode.value === 'startsWith'
      ? name.toLowerCase().startsWith(q)
      : name.toLowerCase().includes(q),
  )
})

// ── Pagination ─────────────────────────────────────────────────
const PAGE_SIZE = 12
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredList.value.length / PAGE_SIZE)))

// 搜索变化时回到第 1 页
watch([searchText, searchMode], () => {
  currentPage.value = 1
})

// 越界保护
watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})

const currentPageItems = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredList.value.slice(start, start + PAGE_SIZE)
})

// ── Selection ──────────────────────────────────────────────────
const selectIcon = (name: string) => {
  internalValue.value = name
  emit('update:modelValue', name)
  // 不关闭面板，方便连续浏览
}

// ── Preview icon name (with tabler: prefix for Iconify) ────────
const previewIcon = computed(() =>
  internalValue.value ? `tabler:${internalValue.value}` : 'tabler:icons',
)
</script>

<template>
  <dropdown-menu>
    <dropdown-menu-trigger as-child>
      <slot name="trigger">
        <div
          class="w-36 h-24 bg-accent text-accent-foreground rounded-lg border border-dashed border-border flex flex-col justify-center items-center gap-4 cursor-pointer hover:bg-accent/80 transition-colors"
        >
          <!-- icon preview -->
          <Icon
            :icon="previewIcon"
            class="text-2xl"
            :class="internalValue ? 'text-primary' : 'text-muted-foreground'"
          />
          <pf-text as="span" class="text-muted-foreground text-xs">
            {{ internalValue ?? '选择图标' }}
          </pf-text>
        </div>
      </slot>
    </dropdown-menu-trigger>

    <dropdown-menu-portal>
      <dropdown-menu-content align="start" side="right" :side-offset="8" class="p-0">
        <div class="w-72 flex flex-col" @pointerdown.stop @click.stop>
          <pf-loading :loading="iconListLoading">
            <!-- search bar -->
            <div class="flex items-center gap-1 p-2 border-b border-border">
              <div class="i-tabler-search text-muted-foreground shrink-0"></div>
              <Input
                v-model="searchText"
                placeholder="搜索图标"
                class="border-none shadow-none focus-visible:ring-0 h-7 px-1"
              />
              <!-- search mode toggle -->
              <button
                class="shrink-0 text-xs px-1.5 py-0.5 rounded border border-border text-muted-foreground hover:bg-accent cursor-pointer"
                :title="searchMode === 'contains' ? '当前：包含匹配' : '当前：前缀匹配'"
                @click.stop="searchMode = searchMode === 'contains' ? 'startsWith' : 'contains'"
              >
                {{ searchMode === 'contains' ? '包含' : '前缀' }}
              </button>
            </div>

            <!-- icon grid -->
            <template v-if="iconListError">
              <pf-empty class="py-6">加载失败，请刷新重试</pf-empty>
            </template>
            <template v-else-if="filteredList.length === 0">
              <pf-empty class="py-6">未找到匹配图标</pf-empty>
            </template>
            <template v-else>
              <div class="grid grid-cols-6 gap-1 p-2">
                <button
                  v-for="name in currentPageItems"
                  :key="name"
                  class="aspect-square rounded flex items-center justify-center cursor-pointer hover:bg-accent transition-colors"
                  :class="{
                    'bg-primary/10 ring-1 ring-primary': internalValue === name,
                  }"
                  :title="name"
                  @click.stop="selectIcon(name)"
                >
                  <Icon :icon="`tabler:${name}`" class="text-lg" />
                </button>
              </div>

              <!-- pagination -->
              <div
                v-if="totalPages > 1"
                class="flex items-center justify-between px-2 py-1 border-t border-border"
              >
                <button
                  class="p-0.5 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                  :disabled="currentPage <= 1"
                  @click.stop="currentPage--"
                >
                  <div class="i-tabler-chevron-left text-sm"></div>
                </button>
                <span class="text-xs text-muted-foreground">
                  {{ currentPage }} / {{ totalPages }}
                </span>
                <button
                  class="p-0.5 rounded hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
                  :disabled="currentPage >= totalPages"
                  @click.stop="currentPage++"
                >
                  <div class="i-tabler-chevron-right text-sm"></div>
                </button>
              </div>
              <!-- page info -->
              <div class="px-3 py-1 text-xs text-muted-foreground text-right">
                第 {{ currentPage }} / {{ totalPages }} 页 · {{ filteredList.length }} 个图标
              </div>
            </template>
          </pf-loading>
        </div>
      </dropdown-menu-content>
    </dropdown-menu-portal>
  </dropdown-menu>
</template>

<style scoped></style>
