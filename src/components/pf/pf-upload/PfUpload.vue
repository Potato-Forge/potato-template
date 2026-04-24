<script setup lang="ts">
import {
  EyeIcon,
  FileArchiveIcon,
  FileAudioIcon,
  FileCodeIcon,
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  FileVideoIcon,
  Loader2Icon,
  RefreshCcwIcon,
  Trash2Icon,
  UploadCloudIcon,
} from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { pfToast } from '@/components/pf/pf-toast'
import type { PfUploadFileItem, PfUploadProps } from './PfUpload.types'
import PfUploadToast from './PfUploadToast.vue'

const props = withDefaults(defineProps<PfUploadProps>(), {
  modelValue: () => [],
  trigger: 'button',
  listType: 'list',
  multiple: true,
  accept: '',
  disabled: false,
  maxFiles: 12,
  maxSize: 20 * 1024 * 1024,
  failRate: 0.15,
  showToast: true,
  class: '',
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: PfUploadFileItem[]): void
  (event: 'change', value: PfUploadFileItem[]): void
  (event: 'remove', value: PfUploadFileItem): void
  (event: 'error', value: { file: File; message: string }): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const localFiles = ref<PfUploadFileItem[]>([])
const isDragging = ref(false)
const progressTimers = new Map<string, number>()

const syncToOutside = () => {
  const snapshot = localFiles.value.map((item) => ({ ...item }))
  emit('update:modelValue', snapshot)
  emit('change', snapshot)
}

watch(
  () => props.modelValue,
  (value) => {
    localFiles.value = [...value]
  },
  { immediate: true },
)

const openFileDialog = () => {
  if (props.disabled) {
    return
  }

  inputRef.value?.click()
}

const formatFileSize = (size: number) => {
  if (size <= 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const order = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1)
  const value = size / Math.pow(1024, order)
  return `${value.toFixed(order === 0 ? 0 : 1)} ${units[order]}`
}

const getFileIcon = (item: PfUploadFileItem) => {
  if (item.isImage) return FileImageIcon
  if (item.type.startsWith('video/')) return FileVideoIcon
  if (item.type.startsWith('audio/')) return FileAudioIcon
  if (item.type.includes('zip') || item.type.includes('rar')) return FileArchiveIcon
  if (item.type.includes('json') || item.type.includes('javascript')) return FileCodeIcon
  if (item.type.includes('text') || item.type.includes('word') || item.type.includes('pdf')) {
    return FileTextIcon
  }

  return FileIcon
}

const previewImages = computed(() =>
  localFiles.value
    .filter((item) => item.isImage && (item.previewUrl || item.remoteUrl))
    .map((item) => item.previewUrl || item.remoteUrl || ''),
)

const createUploadId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`

const isImageFile = (file: File) => file.type.startsWith('image/')

const isAcceptMatched = (file: File) => {
  if (!props.accept.trim()) return true

  const accepts = props.accept
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  if (!accepts.length) return true

  const fileType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()

  return accepts.some((rule) => {
    if (rule.startsWith('.')) {
      return fileName.endsWith(rule)
    }

    if (rule.endsWith('/*')) {
      const prefix = rule.slice(0, -1)
      return fileType.startsWith(prefix)
    }

    return fileType === rule
  })
}

const startFakeUpload = (id: string) => {
  const timer = window.setInterval(() => {
    const item = localFiles.value.find((entry) => entry.id === id)
    if (!item || item.status !== 'uploading') {
      window.clearInterval(timer)
      progressTimers.delete(id)
      return
    }

    const next = Math.min(item.progress + Math.random() * 14 + 6, 96)
    item.progress = next

    if (next >= 96) {
      window.clearInterval(timer)
      progressTimers.delete(id)

      window.setTimeout(() => {
        const latest = localFiles.value.find((entry) => entry.id === id)
        if (!latest) return

        const failed = Math.random() < props.failRate
        latest.progress = 100
        latest.status = failed ? 'error' : 'success'
        latest.error = failed ? '上传失败，请重试' : undefined

        syncToOutside()
      }, 380)
    }

    syncToOutside()
  }, 220)

  progressTimers.set(id, timer)
}

const addFiles = (files: File[]) => {
  if (!files.length) return

  const incoming = props.multiple ? files : files.slice(0, 1)

  const remain = props.maxFiles - localFiles.value.length
  if (remain <= 0) {
    pfToast.warning('文件数量已达到上限')
    return
  }

  const toAdd = incoming.slice(0, remain)
  if (incoming.length > toAdd.length) {
    pfToast.warning(`最多上传 ${props.maxFiles} 个文件`)
  }

  const next: PfUploadFileItem[] = []

  toAdd.forEach((file) => {
    if (file.size > props.maxSize) {
      const message = `${file.name} 超出大小限制`
      emit('error', { file, message })
      pfToast.error('文件校验失败', message)
      return
    }

    if (!isAcceptMatched(file)) {
      const message = `${file.name} 类型不支持`
      emit('error', { file, message })
      pfToast.error('文件校验失败', message)
      return
    }

    const image = isImageFile(file)
    const objectUrl = image ? URL.createObjectURL(file) : ''

    next.push({
      id: createUploadId(),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      previewUrl: objectUrl || undefined,
      isObjectUrl: Boolean(objectUrl),
      isImage: image,
      progress: 0,
      status: 'uploading',
    })
  })

  if (!next.length) {
    return
  }

  localFiles.value.push(...next)
  syncToOutside()
  next.forEach((item) => startFakeUpload(item.id))
}

const onInputChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const selected = target.files ? Array.from(target.files) : []
  addFiles(selected)
  target.value = ''
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (props.disabled) return

  if (event.dataTransfer?.types.includes('Files')) {
    event.dataTransfer.dropEffect = 'copy'
    isDragging.value = true
  }
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  if ((event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
    return
  }
  isDragging.value = false
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  if (props.disabled) return

  const selected = event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : []
  addFiles(selected)
}

const clearTimer = (id: string) => {
  const timer = progressTimers.get(id)
  if (timer) {
    window.clearInterval(timer)
    progressTimers.delete(id)
  }
}

const revokePreview = (item: PfUploadFileItem) => {
  if (item.isObjectUrl && item.previewUrl) {
    URL.revokeObjectURL(item.previewUrl)
  }
}

const removeFile = (id: string) => {
  const target = localFiles.value.find((item) => item.id === id)
  if (!target) return

  clearTimer(id)
  revokePreview(target)
  localFiles.value = localFiles.value.filter((item) => item.id !== id)
  emit('remove', target)
  syncToOutside()
}

const retryUpload = (id: string) => {
  const target = localFiles.value.find((item) => item.id === id)
  if (!target) return

  target.status = 'uploading'
  target.progress = 0
  target.error = undefined
  syncToOutside()
  startFakeUpload(id)
}

const clearAll = () => {
  localFiles.value.forEach((item) => {
    clearTimer(item.id)
    revokePreview(item)
  })
  localFiles.value = []
  syncToOutside()
}

const openImagePreview = (id: string) => {
  const target = document.querySelector<HTMLElement>(`[data-preview-id="pf-upload-preview-${id}"]`)
  target?.click()
}

const handleDropZoneKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    openFileDialog()
  }
}

const triggerClass = computed(() =>
  cn('w-full', props.trigger === 'gallery' ? 'max-w-[132px]' : '', props.class),
)

onBeforeUnmount(() => {
  localFiles.value.forEach((item) => {
    clearTimer(item.id)
    revokePreview(item)
  })
})
</script>

<template>
  <div class="w-full space-y-4">
    <input
      ref="inputRef"
      type="file"
      class="hidden"
      :multiple="props.multiple"
      :accept="props.accept || undefined"
      :disabled="props.disabled"
      @change="onInputChange"
    />

    <div v-if="props.trigger === 'button'" :class="triggerClass">
      <PfButton :disabled="props.disabled" icon="i-tabler-upload" @click="openFileDialog">
        选择文件
      </PfButton>
    </div>

    <button
      v-else-if="props.trigger === 'gallery'"
      type="button"
      :disabled="props.disabled"
      :class="
        cn(
          'h-32 w-32 rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground transition-colors',
          'inline-flex flex-col items-center justify-center gap-2 hover:bg-muted',
          props.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
          props.class,
        )
      "
      @click="openFileDialog"
    >
      <div class="i-tabler-plus text-2xl"></div>
      <span class="text-xs">上传文件</span>
    </button>

    <div
      v-else
      :class="
        cn(
          'w-full rounded-lg border border-dashed border-border bg-muted/25 p-6 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/8' : '',
          props.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
          props.class,
        )
      "
      @click="openFileDialog"
      role="button"
      tabindex="0"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @keydown="handleDropZoneKeydown"
    >
      <UploadCloudIcon class="mx-auto size-10" />
      <p class="mt-3 text-sm font-medium text-foreground">将文件拖拽到这里上传</p>
      <p class="mt-1 text-xs text-muted-foreground">或点击区域选择文件</p>
      <p class="mt-2 text-xs text-muted-foreground">
        最大 {{ props.maxFiles }} 个文件，单文件不超过 {{ formatFileSize(props.maxSize) }}
      </p>
    </div>

    <div v-if="localFiles.length" class="space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-foreground"
          >文件列表 ({{ localFiles.length }})</span
        >
        <PfButton size="tiny" variant="ghost" type="warning" @click="clearAll">清空</PfButton>
      </div>

      <div v-if="props.listType === 'list'" class="space-y-2">
        <div
          v-for="item in localFiles"
          :key="item.id"
          class="group flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
        >
          <div class="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
            <PfImg
              v-if="item.isImage"
              :data-preview-id="`pf-upload-preview-${item.id}`"
              :src="item.previewUrl || item.remoteUrl"
              :preview="true"
              :preview-src-list="previewImages"
              class="h-full w-full"
              img-class="h-full w-full"
              object-fit="cover"
              :rounded="false"
            />
            <component
              :is="getFileIcon(item)"
              v-else
              class="m-auto mt-3 block size-6 text-muted-foreground"
            />
          </div>

          <button
            v-if="item.isImage"
            type="button"
            class="hidden size-8 shrink-0 items-center justify-center rounded border border-border bg-background text-foreground hover:bg-muted group-hover:inline-flex"
            @click="openImagePreview(item.id)"
          >
            <EyeIcon class="size-4" />
          </button>

          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <p class="truncate text-sm text-foreground">{{ item.name }}</p>
              <span class="text-xs text-muted-foreground">{{ formatFileSize(item.size) }}</span>
            </div>

            <div class="mt-1 flex items-center gap-2 text-xs">
              <span
                v-if="item.status === 'uploading'"
                class="inline-flex items-center gap-1 text-info"
              >
                <Loader2Icon class="size-3 animate-spin" /> 上传中 {{ Math.floor(item.progress) }}%
              </span>
              <span v-else-if="item.status === 'success'" class="text-success">上传成功</span>
              <span v-else class="text-destructive">{{ item.error || '上传失败' }}</span>
            </div>

            <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                class="h-full rounded-full bg-primary transition-all duration-200"
                :style="{ width: `${item.progress}%` }"
              ></div>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <button
              v-if="item.status === 'error'"
              type="button"
              class="inline-flex size-8 items-center justify-center rounded hover:bg-muted"
              @click="retryUpload(item.id)"
            >
              <RefreshCcwIcon class="size-4 text-warning" />
            </button>

            <button
              type="button"
              class="inline-flex size-8 items-center justify-center rounded hover:bg-muted"
              @click="removeFile(item.id)"
            >
              <Trash2Icon class="size-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <div
          v-for="item in localFiles"
          :key="item.id"
          class="group relative overflow-hidden rounded-lg border border-border bg-card"
        >
          <div class="aspect-square">
            <PfImg
              v-if="item.isImage"
              :data-preview-id="`pf-upload-preview-${item.id}`"
              :src="item.previewUrl || item.remoteUrl"
              :preview="true"
              :preview-src-list="previewImages"
              class="h-full w-full"
              img-class="h-full w-full"
              object-fit="cover"
              :rounded="false"
            />
            <div v-else class="flex h-full w-full items-center justify-center bg-muted">
              <component :is="getFileIcon(item)" class="size-10 text-muted-foreground" />
            </div>
          </div>

          <button
            type="button"
            class="absolute right-1.5 top-1.5 hidden size-7 items-center justify-center rounded-full bg-background/85 text-foreground group-hover:inline-flex"
            @click="removeFile(item.id)"
          >
            <Trash2Icon class="size-4" />
          </button>

          <button
            v-if="item.isImage"
            type="button"
            class="absolute left-1.5 top-1.5 hidden size-7 items-center justify-center rounded-full bg-background/85 text-foreground group-hover:inline-flex"
            @click="openImagePreview(item.id)"
          >
            <EyeIcon class="size-4" />
          </button>

          <div
            class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-8"
          >
            <p class="truncate text-xs text-white">{{ item.name }}</p>
            <p class="text-[11px] text-white/85">
              <template v-if="item.status === 'uploading'"
                >{{ Math.floor(item.progress) }}%</template
              >
              <template v-else-if="item.status === 'success'">上传成功</template>
              <template v-else>上传失败</template>
            </p>
          </div>
        </div>
      </div>
    </div>

    <PfUploadToast
      v-if="props.showToast"
      :files="localFiles"
      @remove="removeFile"
      @clear="clearAll"
    />
  </div>
</template>
