import type { RouteLocationNormalized } from 'vue-router'
import { supabase } from '@/api'

const loginGuard = async (to: RouteLocationNormalized) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session && to.path !== '/login') {
    return '/login'
  }

  if (session && to.path === '/login') {
    return '/'
  }

  return true
}

export default loginGuard
