import { toast } from 'vue-sonner'
import { h } from 'vue'
import { LightbulbIcon, ShieldAlertIcon } from 'lucide-vue-next'
import type { ExternalToast } from 'vue-sonner'

type ToastTypes = 'success' | 'error' | 'info' | 'warning'
type ToastArgsResult = {
  message: unknown
  options?: ExternalToast
}

const normalizeToastArgs = (
  arg1: unknown,
  arg2?: unknown,
  arg3?: unknown,
): ToastArgsResult | null => {
  if (typeof arg1 === 'object' && arg1 !== null) {
    return { message: arg1 }
  }

  if (typeof arg1 === 'string' && arg2 === undefined) {
    return { message: arg1 }
  }

  if (typeof arg1 === 'string' && typeof arg2 === 'string' && arg3 === undefined) {
    return { message: arg1, options: { description: arg2 } }
  }

  if (typeof arg1 === 'string' && typeof arg2 === 'object' && arg2 !== null) {
    return { message: arg1, options: arg2 as ExternalToast }
  }

  if (
    typeof arg1 === 'string' &&
    typeof arg2 === 'string' &&
    typeof arg3 === 'object' &&
    arg3 !== null
  ) {
    return {
      message: arg1,
      options: { description: arg2, ...(arg3 as ExternalToast) },
    }
  }

  return null
}

const createToastHandler = (type: ToastTypes) => {
  return (arg1: unknown, arg2?: unknown, arg3?: unknown) => {
    // negative toast report
    if (type === 'error' || type === 'warning') {
      const logger = type === 'error' ? console.error : console.warn
      logger(`[PF-TOAST] ${type.toUpperCase()}`, arg1, arg2, arg3)
    }

    const normalized = normalizeToastArgs(arg1, arg2, arg3)
    if (!normalized) {
      console.warn('Invalid arguments for toast:', arg1, arg2, arg3)
      return
    }

    toast[type](normalized.message as never, normalized.options)
  }
}

const TIP_TOAST_OPTIONS: ExternalToast = {
  class: '!border-tip !bg-tip !text-tip-foreground',
  descriptionClass: '!text-tip-foreground/85',
  icon: h(LightbulbIcon, { class: 'size-4 !text-tip-foreground' }),
}

const RISK_TOAST_OPTIONS: ExternalToast = {
  class: '!border-risk !bg-risk !text-risk-foreground',
  descriptionClass: '!text-risk-foreground/85',
  icon: h(ShieldAlertIcon, { class: 'size-4 !text-risk-foreground' }),
}

const createCustomToastHandler = (variant: 'tip' | 'risk') => {
  return (arg1: unknown, arg2?: unknown, arg3?: unknown) => {
    const normalized = normalizeToastArgs(arg1, arg2, arg3)
    if (!normalized) {
      console.warn('Invalid arguments for toast:', arg1, arg2, arg3)
      return
    }

    const preset = variant === 'tip' ? TIP_TOAST_OPTIONS : RISK_TOAST_OPTIONS
    const options = {
      ...preset,
      ...(normalized.options || {}),
      class: [preset.class, normalized.options?.class].filter(Boolean).join(' '),
      descriptionClass: [preset.descriptionClass, normalized.options?.descriptionClass]
        .filter(Boolean)
        .join(' '),
      icon: normalized.options?.icon ?? preset.icon,
    }

    if (variant === 'risk') {
      console.warn('[PF-TOAST] RISK', arg1, arg2, arg3)
    }

    toast.message(normalized.message as never, options)
  }
}

export const pfToast = {
  success: createToastHandler('success'),
  error: createToastHandler('error'),
  info: createToastHandler('info'),
  warning: createToastHandler('warning'),
  tip: createCustomToastHandler('tip'),
  risk: createCustomToastHandler('risk'),
  toast, // 直接暴露原始的toast函数，供特殊需求使用
}
