import { createHighlighter } from 'shiki'

type SupportedLanguage =
  | 'ts'
  | 'tsx'
  | 'js'
  | 'jsx'
  | 'json'
  | 'vue'
  | 'html'
  | 'css'
  | 'scss'
  | 'sql'
  | 'bash'
  | 'md'

type ResolvedThemeMode = 'light' | 'dark'

const loadedLanguages: SupportedLanguage[] = [
  'ts',
  'tsx',
  'js',
  'jsx',
  'json',
  'vue',
  'html',
  'css',
  'scss',
  'sql',
  'bash',
  'md',
]

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null

const getHighlighter = () => {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['catppuccin-latte', 'catppuccin-macchiato'],
      langs: loadedLanguages,
    })
  }

  return highlighterPromise
}

const normalizeLanguage = (language: string | undefined): SupportedLanguage => {
  if (!language) return 'vue'

  const normalized = language.trim().toLowerCase()

  if (loadedLanguages.includes(normalized as SupportedLanguage)) {
    return normalized as SupportedLanguage
  }

  return 'vue'
}

const resolveTheme = (mode: ResolvedThemeMode) => {
  return mode === 'dark' ? 'catppuccin-macchiato' : 'catppuccin-latte'
}

export const renderCodeToHtml = async (
  code: string,
  language: string | undefined,
  mode: ResolvedThemeMode,
) => {
  const highlighter = await getHighlighter()

  return highlighter.codeToHtml(code, {
    lang: normalizeLanguage(language),
    theme: resolveTheme(mode),
  })
}