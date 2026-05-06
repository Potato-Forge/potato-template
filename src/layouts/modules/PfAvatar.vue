<script setup lang="ts">
import { supabase } from '@/api'
import useNotificationStore from '@/store/notificationStore'
import useUserStore from '@/store/userStore'
import usePermissionStore from '@/store/permissionStore'
import useGlobalLoadingStore from '@/store/globalLoadingStore'

const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()
const globalLoadingStore = useGlobalLoadingStore()
const notificationStore = useNotificationStore()

const avatarSrc = computed(() => userStore.avatarUrl)
const avatarFallback = computed(() => userStore.displayName)
const unreadCount = computed(() => notificationStore.unreadCount)
const canOpenMessagePage = computed(() =>
  permissionStore.hasPermission('manage:notification:message'),
)

const openMessageCenter = async () => {
  if (!canOpenMessagePage.value) return
  await router.push('/manage/notification/message')
}

const handleSignOut = async () => {
  // 1. 先移除动态路由（必须在 clearPermissions 之前，因为 clearPermissions 会清空 dynamicRoutes）
  const routeNames = permissionStore.dynamicRoutes.map((r) => r.name).filter(Boolean) as (
    | string
    | symbol
  )[]
  for (const name of routeNames) {
    router.removeRoute(name)
  }

  // 2. 清空所有内存状态
  permissionStore.clearPermissions()
  userStore.clearUser()
  globalLoadingStore.reset()
  notificationStore.reset()

  // 3. 清除记住我偏好
  localStorage.removeItem('potato_remember_me')

  // 4. 从 Supabase 登出
  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Error signing out:', error)
  }

  // 5. 导航到登录页
  router.push('/login')
}

onMounted(() => {
  void notificationStore.ensureInitialized()
})
</script>

<template>
  <DropdownMenu>
    <!-- avatar trigger -->
    <DropdownMenuTrigger as-child>
      <Avatar
        class="cursor-pointer transition transform duration-200 ease-in-out active:(scale-90)"
      >
        <AvatarImage :src="avatarSrc || ''" alt="avatar" />
        <AvatarFallback>{{ avatarFallback }}</AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>

    <!-- menu content -->
    <DropdownMenuContent class="w-56" side="right">
      <DropdownMenuLabel>我的账户</DropdownMenuLabel>
      <DropdownMenuGroup>
        <DropdownMenuItem>
          Profile
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Billing
          <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Settings
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Keyboard shortcuts
          <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem :disabled="!canOpenMessagePage" @select="openMessageCenter">
          查看更多消息
          <DropdownMenuShortcut>{{ unreadCount > 0 ? `${unreadCount}` : '' }}</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Email</DropdownMenuItem>
              <DropdownMenuItem>Message</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>More...</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuItem>
          New Team
          <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem>GitHub</DropdownMenuItem>
      <DropdownMenuItem>Support</DropdownMenuItem>
      <DropdownMenuItem disabled> API </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @select="handleSignOut">
        Log out
        <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<style scoped></style>
