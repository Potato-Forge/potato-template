<script setup lang="ts">
import { Icon } from '@iconify/vue'
import useNotificationStore from '@/store/notificationStore'
import usePermissionStore from '@/store/permissionStore'

const router = useRouter()
const notificationStore = useNotificationStore()
const permissionStore = usePermissionStore()
const { latestItems, unreadCount, loading } = storeToRefs(notificationStore)

const canOpenMessagePage = computed(() =>
  permissionStore.hasPermission('manage:notification:message'),
)

const formatTime = (value: string | null | undefined) => {
  if (!value) return '--'
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const openMessageCenter = async () => {
  if (!canOpenMessagePage.value) return
  await router.push('/manage/notification/message')
}

const openAnnouncementCenter = async () => {
  await router.push('/manage/notification/announcement')
}

const handleSelectItem = async (item: (typeof latestItems.value)[number]) => {
  if (item.kind === 'announcement') {
    await openAnnouncementCenter()
    return
  }

  await notificationStore.markAsRead(item.id)
  await openMessageCenter()
}

onMounted(() => {
  void notificationStore.ensureInitialized()
})
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button
        type="button"
        class="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/45 bg-background/60 text-foreground transition hover:bg-accent hover:text-accent-foreground"
      >
        <Icon icon="tabler:bell-ringing" class="h-5 w-5" />
        <span
          v-if="unreadCount > 0"
          class="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-destructive-foreground"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </button>
    </DropdownMenuTrigger>

    <DropdownMenuContent class="w-90" align="end" side="bottom">
      <DropdownMenuLabel class="flex items-center justify-between gap-3">
        <span>通知中心</span>
        <span class="text-xs text-muted-foreground">
          {{ unreadCount > 0 ? `${unreadCount} 条未读` : '已全部读取' }}
        </span>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      <div v-if="loading" class="px-3 py-4 text-sm text-muted-foreground">正在加载消息...</div>

      <div v-else-if="!latestItems.length" class="px-3 py-4 text-sm text-muted-foreground">
        暂无通知
      </div>

      <template v-else>
        <DropdownMenuItem
          v-for="item in latestItems"
          :key="item.id"
          class="items-start gap-3 py-3"
          @select="handleSelectItem(item)"
        >
          <span
            class="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full"
            :class="item.kind === 'announcement' || !item.read_at ? 'bg-primary' : 'bg-muted'"
          ></span>
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-medium text-foreground">
              {{ item.title }}
            </div>
            <div class="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {{ item.summary || item.content || '暂无摘要' }}
            </div>
            <div class="mt-2 text-[11px] text-muted-foreground/80">
              {{ formatTime(item.created_at) }}
            </div>
          </div>
        </DropdownMenuItem>
      </template>

      <DropdownMenuSeparator />

      <DropdownMenuItem :disabled="!canOpenMessagePage" @select="openMessageCenter">
        查看更多消息
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<style scoped></style>
