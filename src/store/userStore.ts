import { supabase } from '@/api'
import type { Database } from '@/types/database.types'
import { defineStore } from 'pinia'

export type Profile = Database['public']['Tables']['profiles']['Row']

const useUserStore = defineStore('user', {
  state: () => ({
    profile: null as Profile | null,
    loading: false,
  }),
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
  },
})

export default useUserStore
