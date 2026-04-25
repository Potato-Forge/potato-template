import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// layouts
import GlobalLayout from '@/layouts/global-layout/GlobalLayout.vue'

// routes
import adminRoutes from './routes/adminRoutes'
import commonRoutes from './routes/commonRoutes'
import helpRoutes from './routes/helpRoutes'
import manageRoutes from './routes/manageRoutes'

// guards
import routeGuard from './guard'

const appRouteChildren = [...adminRoutes, ...manageRoutes, ...helpRoutes]

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: GlobalLayout,
    redirect: '/admin/dashboard',
    children: appRouteChildren,
  },
  ...commonRoutes,
]

export function resolveRouteChildren(currentPath: string): RouteRecordRaw[] {
  for (const parent of appRouteChildren) {
    const parentPath = parent.path.startsWith('/') ? parent.path : `/${parent.path}`
    if (currentPath === parentPath || currentPath.startsWith(`${parentPath}/`)) {
      return parent.children || []
    }
  }
  return []
}

const router = createRouter({
  history: createWebHistory(),
  routes,
})

routeGuard(router)

export default router
