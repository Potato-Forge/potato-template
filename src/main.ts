import { createApp } from 'vue'
import App from './App.vue'

import '@unocss/reset/tailwind-v4.css'
import 'virtual:uno.css'
import './assets/main.css'

import { createPinia } from 'pinia'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')
