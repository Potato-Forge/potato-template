import type { RouteLocationNormalized } from 'vue-router'
import { supabase } from '@/api'

/** 默认 token 过期时间 2 小时 (ms) */
const DEFAULT_SESSION_MAX_AGE = 2 * 60 * 60 * 1000
const LOGIN_AT_STORAGE_KEY = 'potato_login_at'

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

    // 「记住我」检查：未勾选记住我时，若会话超过 2 小时则强制登出
    const rememberMe = localStorage.getItem('potato_remember_me') === '1'
    const loginAt = localStorage.getItem(LOGIN_AT_STORAGE_KEY)
    if (!rememberMe && loginAt) {
      const sessionAge = Date.now() - Number(loginAt)
      if (sessionAge > DEFAULT_SESSION_MAX_AGE) {
        await supabase.auth.signOut()
        localStorage.removeItem('potato_remember_me')
        localStorage.removeItem(LOGIN_AT_STORAGE_KEY)
        return '/login'
      }
    } else if (!rememberMe && !loginAt) {
      localStorage.setItem(LOGIN_AT_STORAGE_KEY, String(Date.now()))
    }
  }
  return true
}

export default loginGuard
