import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// layouts
import GlobalLayout from '@/layouts/global-layout/GlobalLayout.vue'

// routes
import adminRoutes from './routes/adminRoutes'
import commonRoutes from './routes/commonRoutes'

// guards
import loginGuard from './guard/LoginGuard'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: GlobalLayout,
    redirect: '/admin/dashboard',
    children: [...adminRoutes],
  },
  ...commonRoutes,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 注册路由守卫
loginGuard(router)

export default router
