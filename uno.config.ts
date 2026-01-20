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

// 定义需要映射的颜色名称列表
// 这里的名称必须与 main.css 中的 CSS 变量名对应
// 例如 'background' -> var(--background)
const colorNames = [
  'background',
  'foreground',
  'muted',
  'muted-foreground',
  'popover',
  'popover-foreground',
  'card',
  'card-foreground',
  'border',
  'input',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'ring',
  // 新增状态色
  'success',
  'success-foreground',
  'warning',
  'warning-foreground',
  'info',
  'info-foreground',
]

// 自动生成 theme.colors 配置
const colors = colorNames.reduce((acc, name) => {
  acc[name] = `hsl(var(--${name}))`
  return acc
}, {} as Record<string, string>)

// 添加 error 别名
colors['error'] = colors['destructive']
colors['error-foreground'] = colors['destructive-foreground']

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
  presets: [
    presetWind4(),
    presetIcons({
      collections: {
        pf: {
          logo: () =>
            fs.readFileSync(path.resolve(__dirname, './src/assets/potato-forge.svg'), 'utf-8'),
        },
      },
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
      scale: 1.2,
      warn: true,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
    presetAnimations(),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
})
