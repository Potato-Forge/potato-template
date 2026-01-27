import { supabase } from '@/api'
import type { Database } from '@/types/database.types'
import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'

const useMenuStore = defineStore('menu', {
  state: () => ({
    permissions: [] as Database['public']['Functions']['get_user_permissions']['Returns'],
    menus: [] as RouteRecordRaw[],
  }),
  actions: {
    async getUserPermission() {
      const { data, error } = await supabase.rpc('get_user_permissions')

      if (error) {
        throw error
      }

      this.permissions = data || []
    },
  },
})

export default useMenuStore
