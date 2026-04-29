import { supabase } from '@/api'
import { resolveAvatarPublicUrl } from '@/api/user/user'
import type { Database } from '@/types/database.types'
import { defineStore } from 'pinia'

export type Profile = Database['public']['Tables']['profiles']['Row']

const useUserStore = defineStore('user', {
  state: () => ({
    profile: null as Profile | null,
    loading: false,
  }),
  getters: {
    /** 已解析的头像完整 URL */
    avatarUrl: (state) => resolveAvatarPublicUrl(state.profile?.avatar_url),
    /** 用户展示名称：full_name → username → email → 'U' */
    displayName: (state) => {
      const p = state.profile
      if (!p) return 'U'
      return (p.full_name || p.username || p.email || 'U').slice(0, 1).toUpperCase()
    },
  },
  actions: {
    async fetchUser() {
      try {
        this.loading = true
        const { data, error } = await supabase.from('profiles').select('*').single()
        if (error) {
          throw error
        }
        this.profile = data
      } catch (err) {
        console.error('Failed to fetch user profile:', err)
      } finally {
        this.loading = false
      }
    },
    /** 清空用户状态（登出时调用） */
    clearUser() {
      this.profile = null
      this.loading = false
    },
  },
})

export default useUserStore
