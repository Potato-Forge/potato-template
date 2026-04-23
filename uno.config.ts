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
    background: '220 14% 94%',
    foreground: '234 16% 35%',
    muted: '220 12% 95%',
    'muted-foreground': '233 13% 53%',
    popover: '0 0% 100%',
    'popover-foreground': '234 16% 35%',
    card: '0 0% 100%',
    'card-foreground': '234 16% 35%',
    border: '220 13% 88%',
    input: '220 13% 88%',
    primary: '169 50% 32%',
    'primary-foreground': '220 22% 92%',
    selected: '169 34% 85%',
    'selected-foreground': '234 16% 35%',
    secondary: '220 12% 97%',
    'secondary-foreground': '234 16% 35%',
    accent: '220 12% 97%',
    'accent-foreground': '234 16% 35%',
    success: '109.2 57.6% 39.8%',
    'success-foreground': '220 22% 92%',
    info: '219.9 91.5% 53.9%',
    'info-foreground': '220 22% 92%',
    tip: '197.1 96.6% 45.7%',
    'tip-foreground': '220 22% 92%',
    risk: '22 99.2% 52%',
    'risk-foreground': '234 16% 35%',
    warning: '34.9 77% 49.4%',
    'warning-foreground': '234 16% 35%',
    destructive: '347.1 86.7% 44.1%',
    'destructive-foreground': '220 22% 92%',
    ring: '169 50% 32%',
    radius: '0.5rem',
  },
  dark: {
    background: '231 23% 13%',
    foreground: '227 70% 87%',
    muted: '231 18% 23%',
    'muted-foreground': '228 15% 63%',
    popover: '231 20% 22%',
    'popover-foreground': '227 70% 87%',
    card: '231 20% 22%',
    'card-foreground': '227 70% 87%',
    border: '231 18% 28%',
    input: '231 18% 28%',
    primary: '169 50% 55%',
    'primary-foreground': '231 23% 13%',
    selected: '169 24% 24%',
    'selected-foreground': '227 70% 87%',
    secondary: '232 20% 18%',
    'secondary-foreground': '227 70% 87%',
    accent: '232 20% 18%',
    'accent-foreground': '227 70% 87%',
    success: '115.5 54.1% 76.1%',
    'success-foreground': '231 23% 16%',
    info: '217.2 91.9% 75.9%',
    'info-foreground': '231 23% 16%',
    tip: '189.2 71% 72.9%',
    'tip-foreground': '231 23% 16%',
    risk: '23 92% 75.5%',
    'risk-foreground': '231 23% 16%',
    warning: '41.4 86% 83.1%',
    'warning-foreground': '231 23% 16%',
    destructive: '343.3 81.2% 74.9%',
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
        cdn: 'https://esm.sh/',
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
