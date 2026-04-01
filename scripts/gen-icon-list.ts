import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

export function iconListPlugin(): Plugin {
  return {
    name: 'generate-icon-list',
    // buildStart 钩子在开发服务器启动和构建开始时都会触发
    buildStart() {
      const pkgPath = resolve(process.cwd(), 'node_modules/@iconify/json/json/tabler.json')

      if (!existsSync(pkgPath)) {
        console.warn('⚠️ [iconListPlugin] Tabler icons package not found. Skipping indexing.')
        return
      }

      try {
        const rawData = JSON.parse(readFileSync(pkgPath, 'utf-8'))
        const iconNames = Object.keys(rawData.icons)

        const publicDir = resolve(process.cwd(), 'public')
        if (!existsSync(publicDir)) mkdirSync(publicDir)

        const outputPath = resolve(publicDir, 'tabler-index.json')
        writeFileSync(outputPath, JSON.stringify(iconNames))

        console.log(
          '\x1b[32m%s\x1b[0m',
          `✨ [Potato Forge] Icon index generated: ${iconNames.length} icons.`,
        )
      } catch (e) {
        console.error('❌ [iconListPlugin] Failed to generate icon list:', e)
      }
    },
  }
}
