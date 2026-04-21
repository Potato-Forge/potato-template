import type { RouteRecordRaw } from 'vue-router'
import AdminLayout from '@/layouts/admin-layout/index.vue'

const adminRoutes: RouteRecordRaw[] = [
  {
    path: 'admin',
    component: AdminLayout,
    meta: {
      title: '管理员',
      icon: 'tabler:dashboard',
    },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        meta: {
          title: '仪表盘',
          icon: 'tabler:dashboard',
        },
        component: () => import('@/views/dashboard/Dashboard.vue'),
      },
      {
        path: 'help',
        name: 'help',
        meta: {
          title: '帮助',
          icon: 'tabler:help',
        },
        component: () => import('@/views/help/ColorNamingGuide.vue'),
      },
    ],
  },
]

export default adminRoutes
