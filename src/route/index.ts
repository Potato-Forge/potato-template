import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// layouts
import GlobalLayout from '@/layouts/global-layout/GlobalLayout.vue'

// routes
import commonRoutes from './routes/commonRoutes'

// guards
import routeGuard from './guard'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    component: GlobalLayout,
    redirect: '/admin/dashboard',
    // Dynamic app routes are registered via router.addRoute() in permissionGuard
    // after the user's permissions are loaded.
    children: [],
  },
  ...commonRoutes,
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

routeGuard(router)

export default router
