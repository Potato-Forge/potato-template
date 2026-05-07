import type { RouteRecordRaw } from 'vue-router'

const systemRoutes: RouteRecordRaw[] = [
  {
    path: 'system',
    name: 'system-app',
    component: () => import('@/layouts/admin-layout/index.vue'),
    redirect: '/system/theme-settings',
    meta: {
      title: '设置中心',
      icon: 'settings',
      is_hidden: true,
      layout: 'admin',
    },
    children: [
      {
        path: 'theme-settings',
        name: 'system-theme-settings',
        component: () => import('@/views/Settings/index.vue'),
        meta: {
          title: '主题设置',
          icon: 'palette',
          layout: 'admin',
        },
      },
    ],
  },
]

export default systemRoutes