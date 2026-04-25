import type { HTMLAttributes } from 'vue'

export type PfUploadStatus = 'uploading' | 'success' | 'error'
export type PfUploadTriggerType = 'button' | 'drag' | 'gallery'
export type PfUploadListType = 'list' | 'gallery'

export interface PfUploadFileItem {
  id: string
  name: string
  size: number
  type: string
  status: PfUploadStatus
  progress: number
  error?: string
  file?: File
  previewUrl?: string
  remoteUrl?: string
  remotePath?: string
  isImage: boolean
  isObjectUrl?: boolean
}

export type PfUploadHandlerPayload = {
  file: File
  onProgress: (percent: number) => void
  signal: AbortSignal
}

export type PfUploadHandlerResult = {
  remoteUrl?: string
  remotePath?: string
}

export type PfUploadHandler = (
  payload: PfUploadHandlerPayload,
) => Promise<PfUploadHandlerResult | void>

export interface PfUploadProps {
  modelValue?: PfUploadFileItem[]
  trigger?: PfUploadTriggerType
  listType?: PfUploadListType
  multiple?: boolean
  accept?: string
  disabled?: boolean
  maxFiles?: number
  maxSize?: number
  failRate?: number
  showToast?: boolean
  uploadHandler?: PfUploadHandler
  class?: HTMLAttributes['class']
}
