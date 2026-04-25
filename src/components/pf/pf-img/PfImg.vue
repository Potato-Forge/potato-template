<script setup lang="ts">
import { cn } from '@/lib/utils'
import type { PfImgProps } from './PfImg.types'

const props = withDefaults(defineProps<PfImgProps>(), {
  src: '',
  alt: 'image',
  fallbackSrc: '',
  loadingText: '图片加载中',
  errorText: '图片加载失败',
  preview: true,
  previewSrcList: () => [],
  previewOptions: () => ({}),
  objectFit: 'cover',
  class: '',
  imgClass: '',
  rounded: true,
})

const containerRef = ref<HTMLElement | null>(null)

const activeSrc = ref('')
const isLoading = ref(false)
const hasError = ref(false)
const fallbackTried = ref(false)
const usingFallback = ref(false)

const resetImageState = (nextSrc?: string | null) => {
  const normalized = typeof nextSrc === 'string' ? nextSrc : ''
  activeSrc.value = normalized
  hasError.value = !normalized
  isLoading.value = !!normalized
  fallbackTried.value = false
  usingFallback.value = false
}

watch(
  () => props.src,
  (value) => {
    resetImageState(value)
  },
  { immediate: true },
)

const previewImages = computed(() => {
  const provided = props.previewSrcList.filter((item) => Boolean(item))
  const source = activeSrc.value || props.src

  const raw = provided.length > 0 ? provided : source ? [source] : []

  const unique: string[] = []
  const memo = new Set<string>()
  raw.forEach((item) => {
    if (memo.has(item)) {
      return
    }
    memo.add(item)
    unique.push(item)
  })

  return unique
})

const currentPreviewSrc = computed(() => activeSrc.value || props.src || '')

const previewGalleryImages = computed(() => {
  if (!currentPreviewSrc.value) {
    return previewImages.value
  }

  return previewImages.value.filter((item) => item !== currentPreviewSrc.value)
})

const canPreview = computed(() => props.preview && previewImages.value.length > 0)

const blurFocusInsideViewer = () => {
  const active = document.activeElement as HTMLElement | null
  if (!active) {
    return
  }

  if (active.closest('.viewer-container')) {
    active.blur()
  }
}

const restoreTriggerFocus = () => {
  const el = containerRef.value
  if (!el) {
    return
  }

  // 关闭 viewer 后把焦点还给触发器，避免焦点落在被隐藏节点。
  el.focus({ preventScroll: true })
}

const viewerOptions = computed(() => {
  const singleImage = previewImages.value.length <= 1

  const defaults: Record<string, unknown> = {
    navbar: !singleImage,
    toolbar: singleImage
      ? {
          zoomIn: true,
          zoomOut: true,
          oneToOne: true,
          reset: true,
          prev: false,
          play: false,
          next: false,
          rotateLeft: true,
          rotateRight: true,
          flipHorizontal: true,
          flipVertical: true,
        }
      : true,
    hide: () => {
      blurFocusInsideViewer()
    },
    hidden: () => {
      restoreTriggerFocus()
    },
  }

  return {
    ...defaults,
    ...props.previewOptions,
  }
})

const previewStartIndex = computed(() => {
  if (!currentPreviewSrc.value) return 0
  const index = previewImages.value.findIndex((item) => item === currentPreviewSrc.value)
  return index >= 0 ? index : 0
})

const showPlaceholder = computed(() => isLoading.value && !hasError.value)

const showError = computed(() => hasError.value)

const imageStyle = computed(() => {
  if (!props.aspectRatio) {
    return undefined
  }

  const ratio =
    typeof props.aspectRatio === 'number' ? String(props.aspectRatio) : props.aspectRatio
  return {
    aspectRatio: ratio,
  }
})

const handleLoad = () => {
  isLoading.value = false
  hasError.value = false
  usingFallback.value = !!props.fallbackSrc && activeSrc.value === props.fallbackSrc
}

const handleError = () => {
  if (!fallbackTried.value && props.fallbackSrc && activeSrc.value !== props.fallbackSrc) {
    fallbackTried.value = true
    activeSrc.value = props.fallbackSrc
    isLoading.value = true
    hasError.value = false
    usingFallback.value = true
    return
  }

  isLoading.value = false
  hasError.value = true
}

const openPreview = () => {
  if (!canPreview.value || !containerRef.value) {
    return
  }

  const viewerHost = containerRef.value as HTMLElement & {
    $viewer?: {
      view: (index: number) => void
    }
  }

  if (!viewerHost.$viewer) {
    return
  }

  viewerHost.$viewer.view(previewStartIndex.value)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!canPreview.value) {
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    openPreview()
  }
}

const wrapperClass = computed(() =>
  cn(
    'group relative isolate overflow-hidden bg-muted text-muted-foreground',
    props.rounded ? 'rounded-md' : '',
    canPreview.value ? 'cursor-zoom-in' : '',
    props.class,
  ),
)

const imgClass = computed(() =>
  cn('h-full w-full select-none transition-opacity duration-200', props.imgClass),
)
</script>

<template>
  <div
    v-if="canPreview"
    ref="containerRef"
    v-viewer="viewerOptions"
    :class="wrapperClass"
    :style="imageStyle"
    role="button"
    tabindex="0"
    @click="openPreview"
    @keydown="handleKeydown"
  >
    <img
      v-if="activeSrc && !showError"
      :src="activeSrc"
      :alt="props.alt"
      :class="imgClass"
      :style="{ objectFit: props.objectFit }"
      decoding="async"
      @load="handleLoad"
      @error="handleError"
    />

    <div
      v-if="showPlaceholder"
      class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/65 backdrop-blur-sm"
    >
      <slot name="loading">
        <div
          class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
        ></div>
        <span class="text-xs text-muted-foreground">{{ props.loadingText }}</span>
      </slot>
    </div>

    <div
      v-if="showError"
      class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted"
    >
      <slot name="error">
        <div class="i-tabler-photo-off text-3xl text-muted-foreground/80"></div>
        <span class="text-xs text-muted-foreground">{{ props.errorText }}</span>
      </slot>
    </div>

    <div
      v-else-if="usingFallback"
      class="absolute left-2 top-2 rounded bg-background/85 px-2 py-1 text-[10px] text-muted-foreground"
    >
      已使用回退图
    </div>

    <div class="hidden">
      <img v-for="image in previewGalleryImages" :key="image" :src="image" alt="preview image" />
    </div>
  </div>

  <div v-else :class="wrapperClass" :style="imageStyle">
    <img
      v-if="activeSrc && !showError"
      :src="activeSrc"
      :alt="props.alt"
      :class="imgClass"
      :style="{ objectFit: props.objectFit }"
      decoding="async"
      @load="handleLoad"
      @error="handleError"
    />

    <div
      v-if="showPlaceholder"
      class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/65 backdrop-blur-sm"
    >
      <slot name="loading">
        <div
          class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
        ></div>
        <span class="text-xs text-muted-foreground">{{ props.loadingText }}</span>
      </slot>
    </div>

    <div
      v-if="showError"
      class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted"
    >
      <slot name="error">
        <div class="i-tabler-photo-off text-3xl text-muted-foreground/80"></div>
        <span class="text-xs text-muted-foreground">{{ props.errorText }}</span>
      </slot>
    </div>

    <div
      v-else-if="usingFallback"
      class="absolute left-2 top-2 rounded bg-background/85 px-2 py-1 text-[10px] text-muted-foreground"
    >
      已使用回退图
    </div>
  </div>
</template>
