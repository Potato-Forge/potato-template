import { createAlova } from 'alova'
import VueHook from 'alova/vue'
import { axiosRequestAdapter } from '@alova/adapter-axios'

export const alovaInstance = createAlova({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  statesHook: VueHook,
  requestAdapter: axiosRequestAdapter(),
  timeout: import.meta.env.VITE_API_TIMEOUT,
})
