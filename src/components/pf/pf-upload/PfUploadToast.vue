<script setup lang="ts">
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
  (event: 'close'): void
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
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-220 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div
      v-if="props.files.length"
      class="fixed left-4 bottom-4 z-50 w-[320px] max-w-[calc(100vw-2rem)]"
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
              <div v-if="expanded" class="i-tabler-chevron-down text-base"></div>
              <div v-else class="i-tabler-chevron-up text-base"></div>
            </button>
            <button
              type="button"
              class="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
              @click="emit('close')"
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
              <div
                v-if="item.status === 'uploading'"
                class="i-tabler-loader-2 animate-spin text-base text-info"
              ></div>
              <div
                v-else-if="item.status === 'success'"
                class="i-tabler-circle-check text-base text-success"
              ></div>
              <div v-else class="i-tabler-circle-x text-base text-destructive"></div>

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
  </Transition>
</template>
