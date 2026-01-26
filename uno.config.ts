import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import presetWind4 from '@unocss/preset-wind4'
import presetAnimations from 'unocss-preset-animations'
import fs from 'node:fs'
import path from 'node:path'

const themeData = {
  light: {
    background: '220 22% 92%',
    foreground: '234 16% 35%',
    muted: '223 16% 83%',
    'muted-foreground': '233 13% 53%',
    popover: '220 22% 92%',
    'popover-foreground': '234 16% 35%',
    card: '220 22% 92%',
    'card-foreground': '234 16% 35%',
    border: '223 16% 83%',
    input: '223 16% 83%',
    primary: '169 50% 32%',
    'primary-foreground': '220 22% 92%',
    secondary: '225 15% 88%',
    'secondary-foreground': '234 16% 35%',
    accent: '225 15% 88%',
    'accent-foreground': '234 16% 35%',
    success: '105.5 59.8% 43.3%',
    'success-foreground': '220 22% 92%',
    info: '220.3 91.4% 54.3%',
    'info-foreground': '220 22% 92%',
    warning: '34.5 78.7% 49.4%',
    'warning-foreground': '234 16% 35%',
    destructive: '0 78% 62%',
    'destructive-foreground': '220 22% 92%',
    ring: '169 50% 32%',
    radius: '0.5rem',
  },
  dark: {
    background: '231 23% 16%',
    foreground: '227 70% 87%',
    muted: '233 20% 27%',
    'muted-foreground': '228 15% 63%',
    popover: '231 23% 16%',
    'popover-foreground': '227 70% 87%',
    card: '231 23% 16%',
    'card-foreground': '227 70% 87%',
    border: '233 20% 27%',
    input: '233 20% 27%',
    primary: '169 50% 55%',
    'primary-foreground': '231 23% 16%',
    secondary: '232 20% 12%',
    'secondary-foreground': '227 70% 87%',
    accent: '232 20% 12%',
    'accent-foreground': '227 70% 87%',
    success: '105.2 48.1% 71.9%',
    'success-foreground': '231 23% 16%',
    info: '220.3 83.3% 75%',
    'info-foreground': '231 23% 16%',
    warning: '40 70.3% 77.8%',
    'warning-foreground': '231 23% 16%',
    destructive: '355 83% 76%',
    'destructive-foreground': '231 23% 16%',
    ring: '169 50% 55%',
  },
}

const colorKeys = Object.keys(themeData.light).filter((key) => key !== 'radius')
const sidebarColors = [
  'background',
  'foreground',
  'primary',
  'primary-foreground',
  'accent',
  'accent-foreground',
  'border',
  'ring',
]

const colors = colorKeys.reduce(
  (acc, key) => {
    acc[key] = `hsl(var(--${key}))`
    return acc
  },
  {} as Record<string, string>,
)

// 别名与 Sidebar 映射
colors['error'] = colors['destructive']
colors['error-foreground'] = colors['destructive-foreground']
sidebarColors.forEach((name) => {
  colors[`sidebar-${name}`] = `hsl(var(--sidebar-${name}))`
})

export default defineConfig({
  shortcuts: {
    'flex-center': 'flex justify-center items-center',
  },
  theme: {
    colors,
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    },
  },
  preflights: [
    {
      getCSS: () => {
        const generateVars = (obj: Record<string, string>) =>
          Object.entries(obj)
            .map(([k, v]) => `--${k}: ${v};`)
            .join('\n')
        const sidebarVars = sidebarColors
          .map((name) => `--sidebar-${name}: var(--${name});`)
          .join('\n')

        return `
          :root { ${generateVars(themeData.light)} ${sidebarVars} }
          .dark { ${generateVars(themeData.dark)} ${sidebarVars} }
        `
      },
    },
  ],
  presets: [
    presetWind4(),
    presetIcons({
      collections: {
        pf: {
          logo: () =>
            fs.readFileSync(path.resolve(__dirname, './src/assets/potato-forge.svg'), 'utf-8'),
        },
      },
      extraProperties: { display: 'inline-block', 'vertical-align': 'middle' },
      scale: 1.2,
    }),
    presetTypography(),
    presetWebFonts({}),
    presetAnimations(),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  content: {
    pipeline: {
      include: [
        // the default
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        // include js/ts files
        'src/**/*.{js,ts}',
      ],
    },
  },
})
