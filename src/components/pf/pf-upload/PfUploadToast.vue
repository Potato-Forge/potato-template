<script setup lang="ts">
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2Icon,
  XCircleIcon,
} from 'lucide-vue-next'
import type { PfUploadFileItem } from './PfUpload.types'

const props = withDefaults(
  defineProps<{
    files: PfUploadFileItem[]
  }>(),
  {
    files: () => [],
  },
)

const emit = defineEmits<{
  (event: 'remove', id: string): void
  (event: 'clear'): void
}>()

const expanded = ref(true)

const uploadingCount = computed(
  () => props.files.filter((item) => item.status === 'uploading').length,
)

const title = computed(() => {
  if (uploadingCount.value > 0) {
    return `上传中 (${uploadingCount.value})`
  }

  const hasError = props.files.some((item) => item.status === 'error')
  return hasError ? '上传已完成（含失败）' : '上传完成'
})
</script>

<template>
  <div
    v-if="props.files.length"
    class="fixed right-4 bottom-4 z-50 w-[320px] max-w-[calc(100vw-2rem)]"
  >
    <div class="rounded-lg border border-border bg-card text-card-foreground shadow-xl">
      <div class="flex items-center justify-between border-b border-border px-3 py-2">
        <span class="text-sm font-semibold">{{ title }}</span>
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
            @click="expanded = !expanded"
          >
            <ChevronDownIcon v-if="expanded" class="size-4" />
            <ChevronUpIcon v-else class="size-4" />
          </button>
          <button
            type="button"
            class="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
            @click="emit('clear')"
          >
            <div class="i-tabler-x text-base"></div>
          </button>
        </div>
      </div>

      <div v-if="expanded" class="max-h-72 overflow-y-auto">
        <div
          v-for="item in props.files"
          :key="item.id"
          class="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2 last:border-none"
        >
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm">{{ item.name }}</p>
            <p v-if="item.status === 'uploading'" class="text-xs text-muted-foreground">
              {{ Math.floor(item.progress) }}%
            </p>
            <p v-else-if="item.status === 'error'" class="text-xs text-destructive">
              {{ item.error || '上传失败' }}
            </p>
            <p v-else class="text-xs text-success">上传成功</p>
          </div>

          <div class="flex items-center gap-1">
            <Loader2Icon v-if="item.status === 'uploading'" class="size-4 animate-spin text-info" />
            <CheckCircle2Icon v-else-if="item.status === 'success'" class="size-4 text-success" />
            <XCircleIcon v-else class="size-4 text-destructive" />

            <button
              type="button"
              class="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
              @click="emit('remove', item.id)"
            >
              <div class="i-tabler-x text-base"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
