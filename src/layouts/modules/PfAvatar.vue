<script setup lang="ts">
import { supabase } from '@/api'
import { resolveAvatarPublicUrl } from '@/api/user/user'
import useUserStore from '@/store/userStore'

const router = useRouter()
const userStore = useUserStore()

const avatarSrc = computed(() => resolveAvatarPublicUrl(userStore.profile?.avatar_url))
const avatarFallback = computed(() => {
  const username = userStore.profile?.username || userStore.profile?.full_name
  if (!username) return 'U'
  return username.slice(0, 1).toUpperCase()
})

const handleSignOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error.message)
  } else {
    router.push('/login')
  }
}
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
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
