import useUserStore from '@/store/userStore'

const profileGuard = async () => {
  const userStore = useUserStore()

  // 如果用户信息未加载，先加载用户信息
  if (!userStore.profile && !userStore.loading) {
    try {
      await userStore.fetchUser()
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      return '/login' // 如果获取用户信息失败，重定向到登录页
    }
  }

  // 继续路由
  return true
}

export default profileGuard
