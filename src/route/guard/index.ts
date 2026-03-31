import type { Router } from 'vue-router'
import loginGuard from './loginGuard'
import profileGuard from './profileGuard'
import permissionGuard from './permissionGuard'

const isPath = (result: boolean | string) => {
  return typeof result === 'string'
}

const routeGuard = async (router: Router) => {
  router.beforeEach(async (to, from, next) => {
    // 登录守卫
    const loginResult = await loginGuard(to)
    if (isPath(loginResult)) {
      return next(loginResult)
    }

    // 个人资料守卫
    const profileResult = await profileGuard(to)
    if (isPath(profileResult)) {
      return next(profileResult)
    }

    // 权限守卫
    const permissionResult = await permissionGuard(to)
    if (isPath(permissionResult)) {
      return next(permissionResult)
    }

    // 继续路由
    next()
  })
}

export default routeGuard
