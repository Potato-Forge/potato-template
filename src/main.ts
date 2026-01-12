import { createApp } from 'vue'
import App from './App.vue'

import '@unocss/reset/tailwind-v4.css'
import 'virtual:uno.css'
import './assets/main.css'
import router from '@/route'

import { createPinia } from 'pinia'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
