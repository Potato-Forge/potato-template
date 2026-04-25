import type { RouteRecordRaw } from 'vue-router'

const helpRoutes: RouteRecordRaw[] = [
  {
    path: 'help',
    name: 'help',
    meta: {
      title: '帮助',
      icon: 'tabler:help',
    },
    children: [
      {
        path: 'theme',
        name: 'help-theme',
        meta: {
          title: '主题帮助',
          icon: 'tabler:palette',
        },
        component: () => import('@/views/help/ColorNamingGuide.vue'),
      },
      {
        path: 'components',
        name: 'help-components',
        meta: {
          title: '组件演示',
          icon: 'tabler:components',
        },
        component: () => import('@/views/settings/ImgUploadComponentsDemo.vue'),
      },
    ],
  },
]

export default helpRoutes
