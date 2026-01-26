import { createAlova } from 'alova'
import VueHook from 'alova/vue'
import { axiosRequestAdapter } from '@alova/adapter-axios'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export const alovaInstance = createAlova({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  statesHook: VueHook,
  requestAdapter: axiosRequestAdapter(),
  timeout: import.meta.env.VITE_API_TIMEOUT,
})

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
)
