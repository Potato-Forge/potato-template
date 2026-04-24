import type { HTMLAttributes } from 'vue'

export interface PfImgProps {
  src?: string | null
  alt?: string
  fallbackSrc?: string
  loadingText?: string
  errorText?: string
  preview?: boolean
  previewSrcList?: string[]
  previewOptions?: Record<string, unknown>
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  class?: HTMLAttributes['class']
  imgClass?: HTMLAttributes['class']
  aspectRatio?: number | `${number}/${number}`
  rounded?: boolean
}
