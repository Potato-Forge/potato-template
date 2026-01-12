import type { RouteRecordRaw } from 'vue-router'
import AdminLayout from '@/layouts/admin-layout/index.vue'

const adminRoutes: RouteRecordRaw[] = [
  {
    path: 'admin',
    component: AdminLayout,
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
