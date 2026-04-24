import { createApp } from 'vue'
import App from './App.vue'

import '@unocss/reset/tailwind-v4.css'
import 'virtual:uno.css'
import './assets/main.css'
import 'viewerjs/dist/viewer.css'
import router from '@/route'
import VueViewer from 'v-viewer'

import { createPinia } from 'pinia'

// pf components
import { pfTooltipPlugin } from '@/components/pf/pf-tooltip'
import { pfModalPlugin } from '@/components/pf/pf-modal'
import { pfToast } from '@/components/pf/pf-toast'

// tanstach/vue-query
import { MutationCache, QueryCache, QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return '请求失败，请稍后重试'
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      pfToast.error('数据加载失败', getErrorMessage(error))
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      // Mutation 自己声明了 onError 时，优先使用业务侧提示，避免重复 toast。
      if (mutation.options.onError) return

      pfToast.error('操作失败', getErrorMessage(error))
    },
  }),
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueViewer)
app.use(VueQueryPlugin, {
  queryClient,
})

pfTooltipPlugin(app)
pfModalPlugin(app)

app.mount('#app')
