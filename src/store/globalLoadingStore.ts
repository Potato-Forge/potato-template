import { defineStore } from 'pinia'

const useGlobalLoadingStore = defineStore('global-loading', {
  state: () => ({
    pendingCount: 0,
  }),
  getters: {
    isLoading: (state) => state.pendingCount > 0,
  },
  actions: {
    start() {
      this.pendingCount += 1
    },
    end() {
      this.pendingCount = Math.max(0, this.pendingCount - 1)
    },
    reset() {
      this.pendingCount = 0
    },
  },
})

export default useGlobalLoadingStore
