import { defineConfig, presetIcons, transformerVariantGroup, transformerDirectives } from 'unocss'
import presetWind4 from '@unocss/preset-wind4'
import presetAnimations from 'unocss-preset-animations'
import fs from 'node:fs'
import path from 'node:path'

export default defineConfig({
  presets: [
    presetWind4(),
    presetIcons({
      collections: {
        pf: {
          logo: () =>
            fs.readFileSync(path.resolve(__dirname, './src/assets/potato-forge.svg'), 'utf-8'),
        },
      },
      // 为图标设置默认样式：使用 currentColor 填充、统一尺寸与对齐['display:inline-block;width:1.5em;height:1.5em;vertical-align:middle;fill:currentColor;',]
      extraProperties: {
        display: 'inline-block',
        width: '1.5em',
        height: '1.5em',
        'vertical-align': 'middle',
        fill: 'currentColor',
      },
      // scale: 1 保持原始视窗尺寸，defaultClass 便于统一覆盖样式
      scale: 1,
    }),
    presetAnimations(), // custom icons
  ],
  content: {
    pipeline: {
      include: [
        // the default
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        // include js/ts files
        '(components|src)/**/*.{js,ts}',
      ],
    },
  },
  transformers: [transformerVariantGroup(), transformerDirectives()],

  // theme
  theme: {
    colors: {
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))',
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },
      popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popover-foreground))',
      },
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))',
      },
    },
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    },
  },
})
