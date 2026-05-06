import { supabase } from '@/api'
import { getVisibleAnnouncements, type VisibleAnnouncement } from '@/api/notification/announcement'
import { getMySystemMessageInbox, markSystemMessageRead } from '@/api/notification/message'
import { pfToast } from '@/components/pf/pf-toast/usePfToast'
import useUserStore from '@/store/userStore'
import { defineStore } from 'pinia'

const normalizeSystemMessageRelation = (value: unknown) => {
  const target = Array.isArray(value) ? value[0] : value
  if (!target || typeof target !== 'object') return null

  const raw = target as Record<string, unknown>

  return {
    id: String(raw.id || ''),
    title: String(raw.title || ''),
    summary: typeof raw.summary === 'string' ? raw.summary : null,
    content: String(raw.content || ''),
    message_type: String(raw.message_type || 'info'),
  }
}

export type NotificationInboxItem = {
  id: string
  message_id: string
  user_id: string
  delivery_status: string
  delivered_at: string | null
  read_at: string | null
  dismissed_at: string | null
  created_at: string
  updated_at: string
  system_messages: {
    id: string
    title: string
    summary: string | null
    content: string
    message_type: string
  } | null
}

export type NotificationAnnouncementItem = VisibleAnnouncement

export type NotificationFeedItem = {
  id: string
  kind: 'message' | 'announcement'
  title: string
  summary: string | null
  content: string
  created_at: string
  read_at: string | null
}

const useNotificationStore = defineStore('notification', {
  state: () => ({
    inbox: [] as NotificationInboxItem[],
    announcements: [] as NotificationAnnouncementItem[],
    loading: false,
    initialized: false,
    channelName: '' as string,
    channel: null as ReturnType<typeof supabase.channel> | null,
    announcementPollTimer: null as ReturnType<typeof setInterval> | null,
    seenAnnouncementIds: [] as string[],
  }),

  getters: {
    unreadCount: (state) =>
      state.inbox.filter((item) => !item.read_at && !item.dismissed_at).length,
    latestItems: (state): NotificationFeedItem[] => {
      const messageItems: NotificationFeedItem[] = state.inbox.map((item) => ({
        id: item.id,
        kind: 'message',
        title: item.system_messages?.title || '系统消息',
        summary: item.system_messages?.summary || item.system_messages?.content || null,
        content: item.system_messages?.content || '',
        created_at: item.created_at,
        read_at: item.read_at,
      }))

      const announcementItems: NotificationFeedItem[] = state.announcements.map((item) => ({
        id: item.id,
        kind: 'announcement',
        title: item.title,
        summary: item.summary || item.content,
        content: item.content,
        created_at: item.publish_at || item.created_at,
        read_at: null,
      }))

      return [...messageItems, ...announcementItems]
        .sort((left, right) => {
          return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
        })
        .slice(0, 5)
    },
  },

  actions: {
    async refreshInbox() {
      try {
        this.loading = true
        const data = await getMySystemMessageInbox()
        this.inbox = ((data ?? []) as Array<Record<string, any>>).map((item) => ({
          id: String(item.id),
          message_id: String(item.message_id),
          user_id: String(item.user_id),
          delivery_status: String(item.delivery_status || 'pending'),
          delivered_at: typeof item.delivered_at === 'string' ? item.delivered_at : null,
          read_at: typeof item.read_at === 'string' ? item.read_at : null,
          dismissed_at: typeof item.dismissed_at === 'string' ? item.dismissed_at : null,
          created_at: String(item.created_at),
          updated_at: String(item.updated_at),
          system_messages: normalizeSystemMessageRelation(item.system_messages),
        }))
      } finally {
        this.loading = false
      }
    },

    async refreshAnnouncements(options?: { silent?: boolean }) {
      const data = await getVisibleAnnouncements(20)
      const nextIds = data.map((item) => item.id)

      if (!options?.silent && this.initialized && this.seenAnnouncementIds.length > 0) {
        const newItems = data.filter((item) => !this.seenAnnouncementIds.includes(item.id))
        for (const item of newItems) {
          pfToast.info(item.title, {
            description: item.summary || '有新的公告已发布',
          })
        }
      }

      this.announcements = data
      this.seenAnnouncementIds = nextIds
    },

    async markAsRead(recipientId: string) {
      const updated = await markSystemMessageRead(recipientId)
      const target = this.inbox.find((item) => item.id === recipientId)
      if (target) {
        target.read_at = updated.read_at
        target.updated_at = updated.updated_at
      }
    },

    async ensureInitialized() {
      if (this.initialized) return

      const userStore = useUserStore()
      const userId = userStore.profile?.id
      if (!userId) return

      await this.refreshInbox()
      await this.refreshAnnouncements({ silent: true })
      this.subscribe(userId)
      this.startAnnouncementPolling()
      this.initialized = true
    },

    subscribe(userId: string) {
      const nextChannelName = `notifications:inbox:${userId}`
      if (this.channelName === nextChannelName) return

      this.channel?.unsubscribe()

      this.channelName = nextChannelName

      this.channel = supabase
        .channel(nextChannelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'system_message_recipients',
            filter: `user_id=eq.${userId}`,
          },
          async (payload) => {
            const isInsert = payload.eventType === 'INSERT'
            await this.refreshInbox()

            if (isInsert) {
              const nextItem = this.inbox.find((item) => item.id === payload.new.id)
              if (nextItem?.system_messages?.title) {
                pfToast.info(nextItem.system_messages.title, {
                  description: nextItem.system_messages.summary || '你收到了一条新的系统消息',
                })
              }
            }
          },
        )
        .subscribe()
    },

    startAnnouncementPolling() {
      if (this.announcementPollTimer) return

      this.announcementPollTimer = setInterval(() => {
        void this.refreshAnnouncements()
      }, 30_000)
    },

    reset() {
      this.channel?.unsubscribe()
      if (this.announcementPollTimer) {
        clearInterval(this.announcementPollTimer)
      }

      this.inbox = []
      this.announcements = []
      this.loading = false
      this.initialized = false
      this.channelName = ''
      this.channel = null
      this.announcementPollTimer = null
      this.seenAnnouncementIds = []
    },
  },
})

export default useNotificationStore
