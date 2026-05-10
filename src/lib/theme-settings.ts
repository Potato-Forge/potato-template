export type ThemeMode = 'light' | 'dark' | 'system'

type ThemePresetDefinition = {
  label: string
  color: string
  tokens?: ThemePresetTokens
}

const THEME_PRESET_DEFINITIONS = {
  default: {
    label: '湖芯青',
    color: '#58B19F',
    tokens: {
      light: {
        primary: '169 50% 32%',
        primaryForeground: '220 22% 92%',
        selected: '169 34% 85%',
        selectedForeground: '234 16% 35%',
      },
      dark: {
        primary: '169 50% 55%',
        primaryForeground: '231 23% 13%',
        selected: '169 24% 24%',
        selectedForeground: '227 70% 87%',
      },
    },
  },
  ocean: {
    label: '海岸蓝',
    color: '#1D78C1',
  },
  amber: {
    label: '琥珀金',
    color: '#D99314',
  },
  rose: {
    label: '暮光玫瑰',
    color: '#C43A74',
  },
  violet: {
    label: '狂歌紫',
    color: '#6E56CF',
  },
  sage: {
    label: '雾苔绿',
    color: '#5F8F6F',
  },
} satisfies Record<string, ThemePresetDefinition>

export type ThemePresetKey = keyof typeof THEME_PRESET_DEFINITIONS

export type ThemeColorSource = 'preset' | 'custom'

export type ThemeSettings = {
  mode: ThemeMode
  preset: ThemePresetKey
  colorSource: ThemeColorSource
  customColor: string
}

type ThemePresetTokens = {
  light: {
    primary: string
    primaryForeground: string
    selected: string
    selectedForeground: string
  }
  dark: {
    primary: string
    primaryForeground: string
    selected: string
    selectedForeground: string
  }
}

export const THEME_SETTINGS_STORAGE_KEY = 'potato_theme_settings'

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  mode: 'system',
  preset: 'default',
  colorSource: 'preset',
  customColor: '#58B19F',
}

const isThemeMode = (value: unknown): value is ThemeMode =>
  value === 'light' || value === 'dark' || value === 'system'

const isThemePresetKey = (value: unknown): value is ThemePresetKey =>
  typeof value === 'string' && value in THEME_PRESET_DEFINITIONS

const isThemeColorSource = (value: unknown): value is ThemeColorSource =>
  value === 'preset' || value === 'custom'

export const normalizeHexColor = (value: string | null | undefined) => {
  if (!value) return ''

  const cleaned = String(value).trim().replace(/^#/, '')

  if (cleaned.length === 3 && /^[\da-fA-F]{3}$/.test(cleaned)) {
    return `#${cleaned
      .split('')
      .map((item) => item + item)
      .join('')
      .toUpperCase()}`
  }

  if (cleaned.length === 6 && /^[\da-fA-F]{6}$/.test(cleaned)) {
    return `#${cleaned.toUpperCase()}`
  }

  return ''
}

type HslColor = {
  h: number
  s: number
  l: number
}

const hexToRgb = (hex: string) => {
  const normalized = normalizeHexColor(hex) || DEFAULT_THEME_SETTINGS.customColor
  const parts = normalized.slice(1)
  return {
    r: Number.parseInt(parts.slice(0, 2), 16),
    g: Number.parseInt(parts.slice(2, 4), 16),
    b: Number.parseInt(parts.slice(4, 6), 16),
  }
}

const rgbToHsl = (red: number, green: number, blue: number): HslColor => {
  const r = red / 255
  const g = green / 255
  const b = blue / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const lightness = (max + min) / 2

  let hue = 0
  let saturation = 0

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1))

    if (max === r) hue = 60 * (((g - b) / delta) % 6)
    else if (max === g) hue = 60 * ((b - r) / delta + 2)
    else hue = 60 * ((r - g) / delta + 4)
  }

  return {
    h: (hue + 360) % 360,
    s: saturation * 100,
    l: lightness * 100,
  }
}

const toHslString = (color: HslColor) => {
  const hue = Math.round(((color.h % 360) + 360) % 360)
  const saturation = Math.round(Math.min(Math.max(color.s, 0), 100) * 10) / 10
  const lightness = Math.round(Math.min(Math.max(color.l, 0), 100) * 10) / 10
  return `${hue} ${saturation}% ${lightness}%`
}

const adjustHsl = (
  color: HslColor,
  overrides: Partial<HslColor> & { sOffset?: number; lOffset?: number },
): HslColor => {
  return {
    h: overrides.h ?? color.h,
    s: Math.min(Math.max(overrides.s ?? color.s + (overrides.sOffset ?? 0), 0), 100),
    l: Math.min(Math.max(overrides.l ?? color.l + (overrides.lOffset ?? 0), 0), 100),
  }
}

const getTextContrastColor = (hex: string, lightText: string, darkText: string) => {
  const { r, g, b } = hexToRgb(hex)
  const toLinear = (channel: number) => {
    const normalized = channel / 255
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  }

  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  return luminance > 0.48 ? darkText : lightText
}

export const getCustomThemeTokens = (hex: string): ThemePresetTokens => {
  const normalizedHex = normalizeHexColor(hex) || DEFAULT_THEME_SETTINGS.customColor
  const { r, g, b } = hexToRgb(normalizedHex)
  const base = rgbToHsl(r, g, b)

  const lightPrimary = adjustHsl(base, {
    s: Math.max(base.s, 44),
    l: Math.min(Math.max(base.l, 34), 48),
  })
  const darkPrimary = adjustHsl(base, {
    s: Math.max(base.s, 48),
    l: Math.min(Math.max(base.l, 60), 72),
  })

  return {
    light: {
      primary: toHslString(lightPrimary),
      primaryForeground: getTextContrastColor(normalizedHex, '210 40% 98%', '222 47% 11%'),
      selected: toHslString(adjustHsl(lightPrimary, { sOffset: -18, l: 89 })),
      selectedForeground: '234 16% 35%',
    },
    dark: {
      primary: toHslString(darkPrimary),
      primaryForeground: '231 23% 13%',
      selected: toHslString(adjustHsl(darkPrimary, { sOffset: -24, l: 25 })),
      selectedForeground: '227 70% 87%',
    },
  }
}

export const THEME_PRESETS: Record<ThemePresetKey, { label: string; color: string; tokens: ThemePresetTokens }> =
  Object.fromEntries(
    Object.entries(THEME_PRESET_DEFINITIONS).map(([key, preset]) => [
      key,
      {
        label: preset.label,
        color: preset.color,
        tokens: preset.tokens ?? getCustomThemeTokens(preset.color),
      },
    ]),
  ) as Record<ThemePresetKey, { label: string; color: string; tokens: ThemePresetTokens }>

export const resolveThemePresetTokens = (settings: ThemeSettings) => {
  return settings.colorSource === 'custom'
    ? getCustomThemeTokens(settings.customColor)
    : THEME_PRESETS[settings.preset].tokens
}

export const getThemeDisplayLabel = (settings: ThemeSettings) => {
  return settings.colorSource === 'custom'
    ? `自定义 ${normalizeHexColor(settings.customColor) || DEFAULT_THEME_SETTINGS.customColor}`
    : THEME_PRESETS[settings.preset].label
}

export const resolveThemeSettings = (input: unknown): ThemeSettings => {
  if (!input || typeof input !== 'object') {
    return { ...DEFAULT_THEME_SETTINGS }
  }

  const nextInput = input as Partial<ThemeSettings>

  return {
    mode: isThemeMode(nextInput.mode) ? nextInput.mode : DEFAULT_THEME_SETTINGS.mode,
    preset: isThemePresetKey(nextInput.preset) ? nextInput.preset : DEFAULT_THEME_SETTINGS.preset,
    colorSource: isThemeColorSource(nextInput.colorSource)
      ? nextInput.colorSource
      : DEFAULT_THEME_SETTINGS.colorSource,
    customColor: normalizeHexColor(nextInput.customColor) || DEFAULT_THEME_SETTINGS.customColor,
  }
}

export const loadThemeSettings = (): ThemeSettings => {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_THEME_SETTINGS }
  }

  const rawValue = window.localStorage.getItem(THEME_SETTINGS_STORAGE_KEY)
  if (!rawValue) {
    return { ...DEFAULT_THEME_SETTINGS }
  }

  try {
    return resolveThemeSettings(JSON.parse(rawValue))
  } catch {
    return { ...DEFAULT_THEME_SETTINGS }
  }
}

export const persistThemeSettings = (settings: ThemeSettings) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(THEME_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

export const getResolvedThemeMode = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode !== 'system') {
    return mode
  }

  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const applyThemeSettings = (settings: ThemeSettings) => {
  if (typeof document === 'undefined') {
    return
  }

  const resolvedMode = getResolvedThemeMode(settings.mode)
  const root = document.documentElement
  const presetTokens = resolveThemePresetTokens(settings)[resolvedMode]

  root.classList.toggle('dark', resolvedMode === 'dark')
  root.style.setProperty('--primary', presetTokens.primary)
  root.style.setProperty('--primary-foreground', presetTokens.primaryForeground)
  root.style.setProperty('--ring', presetTokens.primary)
  root.style.setProperty('--selected', presetTokens.selected)
  root.style.setProperty('--selected-foreground', presetTokens.selectedForeground)
}
