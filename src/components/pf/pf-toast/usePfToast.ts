import { toast } from 'vue-sonner'

export function usePfToast() {
  return {
    toast,
    success: (msg: string) => toast.success(msg),
    error: (msg: string) => toast.error(msg),
  }
}
