import { defineStore } from 'pinia'

export const useSystemStore = defineStore('system', {
  state: () => ({
    isSidebarOpen: true,
  }),
  actions: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen
    },
  },
})
