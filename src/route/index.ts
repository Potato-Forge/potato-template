import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// layouts
import GlobalLayout from '@/layouts/global-layout/GlobalLayout.vue'

// routes
import adminRoutes from './routes/adminRoutes'
import commonRoutes from './routes/commonRoutes'

// guards
import routeGuard from './guard'
import helpRoutes from './routes/helpRoutes'
import manageRoutes from './routes/manageRoutes'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: GlobalLayout,
    redirect: '/admin/dashboard',
    children: [...adminRoutes, ...manageRoutes, ...helpRoutes],
  },
  ...commonRoutes,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 注册路由守卫
routeGuard(router)

export default router
