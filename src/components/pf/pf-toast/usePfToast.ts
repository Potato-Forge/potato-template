import { toast } from 'vue-sonner'

type ToastTypes = 'success' | 'error' | 'info' | 'warning'

const createToastHandler = (type: ToastTypes) => {
  return (arg1: unknown, arg2?: unknown, arg3?: unknown) => {
    // negative toast report
    if (type === 'error' || type === 'warning') {
      const logger = type === 'error' ? console.error : console.warn
      logger(`[PF-TOAST] ${type.toUpperCase()}`, arg1, arg2, arg3)
    }

    // 根据参数类型和数量，智能地调用toast函数
    if (typeof arg1 === 'object' && arg1 !== null) {
      // 如果第一个参数是对象，直接传递给toast
      toast[type](arg1)
    } else if (typeof arg1 === 'string' && arg2 === undefined) {
      // 只有一个字符串参数
      toast[type](arg1)
    } else if (typeof arg1 === 'string' && typeof arg2 === 'string' && arg3 === undefined) {
      // 两个字符串：标题 + 描述
      toast[type](arg1, { description: arg2 })
    } else if (typeof arg1 === 'string' && typeof arg2 === 'object' && arg2 !== null) {
      // 如果第一个参数是字符串，第二个参数是对象，合并后传递给toast
      toast[type](arg1, arg2)
    } else if (
      typeof arg1 === 'string' &&
      typeof arg2 === 'string' &&
      typeof arg3 === 'object' &&
      arg3 !== null
    ) {
      // 两个字符串 + 额外选项：标题 + 描述 + 选项
      toast[type](arg1, { description: arg2, ...arg3 })
    } else {
      // 否则，打印警告
      console.warn('Invalid arguments for toast:', arg1, arg2, arg3)
    }
  }
}

export const pfToast = {
  success: createToastHandler('success'),
  error: createToastHandler('error'),
  info: createToastHandler('info'),
  warning: createToastHandler('warning'),
  toast, // 直接暴露原始的toast函数，供特殊需求使用
}
