import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import dotenv from 'dotenv'

// 1. 获取命令行指定的 mode (如: pnpm gen --env=production)
// 如果没传，默认用 development
const args = process.argv.slice(2)
const mode = args.find((a) => a.startsWith('--env='))?.split('=')[1] || 'development'

const envDir = path.resolve(process.cwd(), 'env')

// 2. 模仿 Vite 的加载顺序 (优先级从低到高)
const envFiles = [
  `.env.${mode}`, // 比如 .env.development
  `.env.${mode}.local`, // 比如 .env.development.local (可选)
]

if (!envFiles.includes('.env.local')) {
  envFiles.push('.env.local')
}

console.log(`🛠️ 当前模式: [${mode}]`)

// 3. 循环加载并覆盖
envFiles.forEach((file) => {
  const filePath = path.join(envDir, file)
  if (fs.existsSync(filePath)) {
    console.log(`📖 加载配置: ${file}`)
    dotenv.config({ path: filePath, override: true })
  }
})

// 4. 读取变量
const projectId = process.env.VITE_SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID

if (!projectId) {
  console.error(`❌ 在指定环境 [${mode}] 及其 local 文件中找不到项目 ID`)
  process.exit(1)
}

console.log('🚀 项目 ID:', projectId)

try {
  execSync(
    `pnpm dlx supabase gen types typescript --project-id ${projectId} > src/types/database.types.ts`,
    {
      stdio: 'inherit',
    },
  )
  console.log('✅ 类型生成成功')
} catch (e) {
  console.error('💥 类型生成失败')
}
