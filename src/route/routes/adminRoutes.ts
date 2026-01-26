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
        component: () => import('@/views/dashboard/Dashboard.vue'),
      },
    ],
  },
]

export default adminRoutes
