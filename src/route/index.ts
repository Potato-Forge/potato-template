import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// layouts
import GlobalLayout from '@/layouts/global-layout/GlobalLayout.vue'

// routes
import adminRoutes from './routes/adminRoutes'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: GlobalLayout,
    redirect: '/admin/dashboard',
    children: [...adminRoutes],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
