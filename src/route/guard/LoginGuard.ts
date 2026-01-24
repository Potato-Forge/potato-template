import type { Router } from 'vue-router'
import { supabase } from '@/api'

export default function loginGuard(router: Router) {
  router.beforeEach(async (to, from) => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // 如果没登录且不是去登录页，强行送去登录
    if (!session && to.path !== '/login') {
      return '/login'
    }

    // 如果已登录还想去登录页，强行送回主页
    if (session && to.path === '/login') {
      return '/'
    }
  })
}
