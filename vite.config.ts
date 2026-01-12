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
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        dts: getPath('./src/types/auto-imports.d.ts'),
        dirs: [getPath('./src/components/pf')],
      }),
      Components({
        dts: getPath('./src/types/components.d.ts'),
        resolvers: [
          IconsResolver({
            prefix: 'i',
          }),
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
