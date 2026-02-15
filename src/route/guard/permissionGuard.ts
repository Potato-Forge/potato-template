import type { RouteLocationNormalized } from 'vue-router'
import usePermissionStore from '@/store/permissionStore'

const permissionGuard = async (to: RouteLocationNormalized) => {
  // 获取用户权限菜单
  const permissionStore = usePermissionStore()

  if (!permissionStore.permissions.length) {
    try {
      await permissionStore.getUserPermission()
    } catch (error) {
      console.error('获取用户权限失败:', error)
      return '/login' // 如果获取权限失败，重定向到登录页
    }
  }

  return true
}

export default permissionGuard
