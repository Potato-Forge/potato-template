<script setup lang="ts">
import { renderCodeToHtml } from '@/lib/shiki'
import { useSystemStore } from '@/store/systemStore'
import { storeToRefs } from 'pinia'

const props = withDefaults(
  defineProps<{
    code: string
    language?: string
    title?: string
    copyable?: boolean
  }>(),
  {
    language: 'vue',
    title: '',
    copyable: true,
  },
)

const systemStore = useSystemStore()
const { resolvedThemeMode } = storeToRefs(systemStore)

const highlightedHtml = ref('')
const renderFailed = ref(false)
const isRendering = ref(false)
const copied = ref(false)

let copiedTimer: number | undefined

const renderHighlight = async () => {
  isRendering.value = true
  renderFailed.value = false

  try {
    highlightedHtml.value = await renderCodeToHtml(
      props.code,
      props.language,
      resolvedThemeMode.value,
    )
  } catch {
    renderFailed.value = true
    highlightedHtml.value = ''
  } finally {
    isRendering.value = false
  }
}

watch(
  [() => props.code, () => props.language, resolvedThemeMode],
  () => {
    void renderHighlight()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (copiedTimer) {
    window.clearTimeout(copiedTimer)
  }
})

const copyCode = async () => {
  if (!props.copyable || !navigator?.clipboard) return

  await navigator.clipboard.writeText(props.code)
  copied.value = true

  if (copiedTimer) {
    window.clearTimeout(copiedTimer)
  }

  copiedTimer = window.setTimeout(() => {
    copied.value = false
  }, 1200)
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-border bg-card">
    <div class="flex items-center justify-between gap-3 border-b border-border/80 px-4 py-3">
      <div class="min-w-0">
        <pf-text as="p" class="mb-0 text-sm font-medium text-foreground">
          {{ title || '示例代码' }}
        </pf-text>
        <pf-text as="p" class="mb-0 text-xs text-muted-foreground">
          {{ language.toUpperCase() }} · {{ resolvedThemeMode === 'dark' ? 'Macchiato' : 'Latte' }}
        </pf-text>
      </div>

      <pf-button v-if="copyable" variant="outline" size="sm" @click="copyCode">
        {{ copied ? '已复制' : '复制代码' }}
      </pf-button>
    </div>

    <div class="bg-background/65 px-0 py-0">
      <div v-if="renderFailed" class="px-4 py-4">
        <pre class="pf-code-font overflow-x-auto text-sm leading-6 text-foreground"><code>{{ code }}</code></pre>
      </div>

      <div v-else-if="isRendering" class="px-4 py-4 text-sm text-muted-foreground">
        正在渲染代码高亮...
      </div>

      <div v-else class="doc-code-block" v-html="highlightedHtml"></div>
    </div>
  </div>
</template>

<style scoped>
.doc-code-block :deep(pre) {
  margin: 0;
  overflow-x: auto;
  padding: 1rem;
  font-family: var(--font-code);
  font-size: 0.875rem;
  line-height: 1.7;
}

.doc-code-block :deep(code) {
  font-family: var(--font-code);
}
</style>