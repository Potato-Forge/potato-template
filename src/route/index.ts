import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// layouts
import GlobalLayout from '@/layouts/global-layout/GlobalLayout.vue'

// routes
import commonRoutes from './routes/commonRoutes'
import { staticAppRoutes } from './routes/appRoutes'

// guards
import routeGuard from './guard'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    component: GlobalLayout,
    redirect: '/admin/dashboard',
    children: staticAppRoutes,
  },
  ...commonRoutes,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

routeGuard(router)

export default router
