import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { fileURLToPath, URL } from 'node:url'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import UnoCSS from 'unocss/vite'

const getPath = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  envDir: getPath('./env'),

  plugins: [
    vue(),

    UnoCSS(),

    AutoImport({
      imports: ['vue'],
      dts: getPath('./src/types/auto-imports.d.ts'),
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
  ],
  resolve: {
    alias: {
      '@': getPath('./src'),
    },
  },
})
