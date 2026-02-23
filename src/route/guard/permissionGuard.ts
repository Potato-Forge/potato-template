import type { RouteLocationNormalized } from 'vue-router'
import usePermissionStore from '@/store/permissionStore'
import { pfToast } from '@/components/pf/pf-toast'

const permissionGuard = async (to: RouteLocationNormalized) => {
  // 获取用户权限菜单
  const permissionStore = usePermissionStore()

  if (!permissionStore.permissions.length) {
    // 如果没有权限数据，尝试获取权限
    try {
      await permissionStore.getUserPermission()
    } catch (error) {
      pfToast.error('Error', {
        description: 'Failed to fetch user permissions. Please try again.',
      })
      return '/login' // 如果获取权限失败，重定向到登录页
    }
  }

  return true
}

export default permissionGuard
