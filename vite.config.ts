import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

import { fileURLToPath, URL } from 'node:url'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import UnoCSS from 'unocss/vite'
import { createHtmlPlugin } from 'vite-plugin-html'

const getPath = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const envDir = getPath('./env')
  const env = loadEnv(mode, envDir)

  return {
    envDir,

    plugins: [
      vue(),

      UnoCSS(),

      AutoImport({
        imports: [
          'vue',
          'vue-router',
          'pinia',
          '@vueuse/core',
          {
            'reka-ui': ['DropdownMenuPortal'], // 自定义导入
          },
          {
            'vee-validate': ['useForm', 'useField', 'Field', 'Form', 'ErrorMessage', 'FieldArray'],
          },
        ],
        dts: getPath('./src/types/auto-imports.d.ts'),
        dirs: [getPath('./src/components/pf/*/')],
      }),
      Components({
        dts: getPath('./src/types/components.d.ts'),
        dirs: [
          getPath('./src/components/ui'),
          getPath('./src/components/pf'),
          getPath('./src/components/common'),
        ],
        resolvers: [
          IconsResolver({
            prefix: 'i',
          }),
          {
            type: 'component',
            resolve: (name) => {
              // 1. 匹配 shadcn 组件
              // 定义组件前缀到目录名的映射
              const shadcnMap: Record<string, string> = {
                DropdownMenu: 'dropdown-menu',
                Avatar: 'avatar',
                Button: 'button',
                Input: 'input',
                Select: 'select',
                Dialog: 'dialog',
                AlertDialog: 'alert-dialog',
                Popover: 'popover',
                Sheet: 'sheet',
                Sidebar: 'sidebar',
                Table: 'table',
                Tabs: 'tabs',
                Toast: 'toast',
                Tooltip: 'tooltip',
              }

              for (const [prefix, path] of Object.entries(shadcnMap)) {
                if (name.startsWith(prefix)) {
                  return { name, from: `@/components/ui/${path}` }
                }
              }

              // 2. 匹配 pf 组件，比如 PfButton -> src/components/pf/pf-button/index.ts
              if (name.match(/^Pf[A-Z]/)) {
                const kebabCase = name
                  .replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`)
                  .replace(/^-/, '')
                return { name, from: `@/components/pf/${kebabCase}` }
              }
            },
          },
        ],
      }),
      Icons({
        compiler: 'vue3',
      }),

      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            title: env.VITE_APP_TITLE,
          },
        },
      }),
    ],
    resolve: {
      alias: {
        '@': getPath('./src'),
      },
    },
  }
})
