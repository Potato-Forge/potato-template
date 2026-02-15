import { supabase } from '@/api'
import type { Database } from '@/types/database.types'
import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'

export type Permission = Database['public']['Functions']['get_user_permissions']['Returns']

const usePermissionStore = defineStore('permission', {
  state: () => ({
    permissions: [] as Permission,
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

export default usePermissionStore
