import type { RouteRecordRaw } from 'vue-router'

const helpRoutes: RouteRecordRaw[] = [
  {
    path: 'help/theme',
    name: 'help-theme',
    meta: {
      title: '主题帮助',
      icon: 'tabler:palette',
    },
    component: () => import('@/views/help/ColorNamingGuide.vue'),
  },
]

export default helpRoutes
