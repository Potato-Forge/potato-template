import type { RouteLocationNormalized, Router } from 'vue-router'
import usePermissionStore from '@/store/permissionStore'
import { pfToast } from '@/components/pf/pf-toast'

/** 不需要权限校验的路径前缀白名单 */
const PUBLIC_PATHS = ['/login', '/redirect', '/403']

const isPublicPath = (path: string) =>
  PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + '/'))

const permissionGuard = async (to: RouteLocationNormalized, router: Router) => {
  // 白名单路由不校验权限
  if (isPublicPath(to.path)) return true

  const permissionStore = usePermissionStore()

  // 确保权限数据已加载（幂等，已加载则直接返回）
  if (!permissionStore.loaded) {
    try {
      await permissionStore.getUserPermission()
    } catch {
      pfToast.error('Error', {
        description: 'Failed to fetch user permissions. Please try again.',
      })
      return '/login'
    }
  }

  // 将动态路由注册到 router（只执行一次）
  if (!permissionStore.routesRegistered) {
    for (const route of permissionStore.dynamicRoutes) {
      router.addRoute('root', route)
    }
    permissionStore.routesRegistered = true
    // 重新触发当前导航，使新注册的路由生效
    return to.fullPath
  }

  // 超级管理员跳过权限校验
  if (permissionStore.isSuperAdmin) return true

  // 检查当前路由是否需要特定权限
  const code = to.meta?.code as string | undefined
  if (code && !permissionStore.hasPermission(code)) {
    return '/403'
  }

  return true
}

export default permissionGuard
