import type { RouteLocationNormalized } from 'vue-router'
import { supabase } from '@/api'

/**
 * 登录守卫
 * @param to 目标路由对象
 */
const loginGuard = async (to: RouteLocationNormalized) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (to.path === '/login') {
    // 如果已经登录，访问登录页则重定向到主页
    if (session) {
      return '/'
    }
  } else {
    // 如果未登录，访问其他页则重定向到登录页
    if (!session) {
      return '/login'
    }
  }
  return true
}

export default loginGuard
