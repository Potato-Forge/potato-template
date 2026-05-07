import {
  DEFAULT_THEME_SETTINGS,
  applyThemeSettings,
  getResolvedThemeMode,
  loadThemeSettings,
  persistThemeSettings,
  normalizeHexColor,
  type ThemeMode,
  type ThemeColorSource,
  type ThemePresetKey,
  type ThemeSettings,
} from '@/lib/theme-settings'
import { defineStore } from 'pinia'

let systemThemeMediaQuery: MediaQueryList | null = null
let systemThemeChangeHandler: ((event: MediaQueryListEvent) => void) | null = null

export const useSystemStore = defineStore('system', {
  state: () => ({
    isSidebarOpen: true,
    themeSettings: { ...DEFAULT_THEME_SETTINGS } as ThemeSettings,
    resolvedThemeMode: getResolvedThemeMode(DEFAULT_THEME_SETTINGS.mode) as 'light' | 'dark',
  }),
  getters: {
    isDarkMode: (state) => state.resolvedThemeMode === 'dark',
  },
  actions: {
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen
    },
    initializeTheme() {
      this.themeSettings = loadThemeSettings()
      this.applyTheme()
      this.bindSystemThemeListener()
    },
    setThemeMode(mode: ThemeMode) {
      this.themeSettings = {
        ...this.themeSettings,
        mode,
      }
      persistThemeSettings(this.themeSettings)
      this.applyTheme()
      this.bindSystemThemeListener()
    },
    setThemePreset(preset: ThemePresetKey) {
      this.themeSettings = {
        ...this.themeSettings,
        preset,
        colorSource: 'preset',
      }
      persistThemeSettings(this.themeSettings)
      this.applyTheme()
    },
    setThemeColorSource(colorSource: ThemeColorSource) {
      this.themeSettings = {
        ...this.themeSettings,
        colorSource,
      }
      persistThemeSettings(this.themeSettings)
      this.applyTheme()
    },
    setCustomThemeColor(customColor: string) {
      const normalized = normalizeHexColor(customColor)
      if (!normalized) {
        return
      }

      this.themeSettings = {
        ...this.themeSettings,
        colorSource: 'custom',
        customColor: normalized,
      }
      persistThemeSettings(this.themeSettings)
      this.applyTheme()
    },
    applyTheme() {
      this.resolvedThemeMode = getResolvedThemeMode(this.themeSettings.mode)
      applyThemeSettings(this.themeSettings)
    },
    bindSystemThemeListener() {
      if (typeof window === 'undefined') {
        return
      }

      if (systemThemeMediaQuery && systemThemeChangeHandler) {
        systemThemeMediaQuery.removeEventListener('change', systemThemeChangeHandler)
      }

      systemThemeMediaQuery = null
      systemThemeChangeHandler = null

      if (this.themeSettings.mode !== 'system') {
        return
      }

      systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      systemThemeChangeHandler = () => {
        this.applyTheme()
      }
      systemThemeMediaQuery.addEventListener('change', systemThemeChangeHandler)
    },
  },
})
