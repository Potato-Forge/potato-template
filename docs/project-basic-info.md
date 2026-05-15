# Potato Template 项目基本信息

## 项目定位

Potato Template 是一个面向中后台应用的 Vue 3 开发模板。当前项目已经具备登录、用户资料、权限菜单、角色、组织、通知、帮助文档、组件文档和基础布局等能力，目标是沉淀为可复用的业务系统脚手架，而不是单纯的 UI 示例项目。

## 技术栈

- 开发框架：Vue 3、TypeScript、Vite（使用 rolldown-vite 覆盖默认 Vite 包）。
- 路由与状态：vue-router、Pinia、@vueuse/core。
- 数据与请求：Supabase、alova、axios、@tanstack/vue-query。
- 表单与校验：@tanstack/vue-form、vee-validate、zod。
- UI 基础：shadcn-vue、reka-ui、radix-vue、Radix Icons、Tabler Icons、Iconify。
- 样式系统：UnoCSS、@unocss/reset、@unocss/preset-wind4、unocss-preset-animations、class-variance-authority、tailwind-merge。
- 业务组件：项目自研 Pf 系列组件，位于 `src/components/pf`。
- 数据表格与可视化：vxe-table、xe-utils、Unovis。
- 图片与交互：v-viewer、viewerjs、tippy.js、dnd-kit、three。
- 代码高亮与文档：Shiki、Monaspace Neon 字体。
- 代码质量：TypeScript、vue-tsc、oxfmt。

## 目录结构

- `src/api`：alova 实例、Supabase client，以及用户、权限、角色、组织、通知等业务 API。
- `src/assets`：全局 CSS 和品牌资源。
- `src/components/ui`：shadcn-vue/reka 风格的底层 UI 组件。
- `src/components/pf`：项目封装的业务组件，如按钮、表单、数据表、弹窗、上传、树、Toast、Tooltip 等。
- `src/components/common`：跨模块公共组件，目前包含暗色切换和文档展示组件。
- `src/directives`：全局指令，例如 `v-permission`。
- `src/layouts`：全局布局、管理后台布局、页面布局与布局模块。
- `src/route`：静态路由、公共路由与路由守卫。
- `src/store`：Pinia store，覆盖系统主题、用户、权限、通知、全局 loading。
- `src/types`：自动导入类型、组件类型、路由元信息和 Supabase 数据库类型。
- `src/utils`：通用工具函数。
- `src/views`：页面视图，包含登录、后台首页、管理模块、帮助页、设置页和错误页。
- `supabase`：Supabase 本地配置、迁移和种子数据。
- `env`：Vite 环境变量目录。
- `scripts`：项目脚本，包括 Supabase 类型生成和 Tabler 图标索引生成。
- `.ai`：项目开发规划、任务记录和协作上下文。

## 开发框架与运行机制

- 应用入口在 `src/main.ts`，统一注册 Pinia、router、Vue Query、v-viewer、Pf Tooltip、Pf Modal 和权限指令。
- `vite.config.ts` 配置 `@` 指向 `src`，并启用 Vue、UnoCSS、自动导入、组件自动注册、Iconify 图标、HTML 注入和图标索引插件。
- 环境变量统一放在 `env` 目录，通过 Vite 的 `envDir` 加载。
- 路由以 `GlobalLayout` 为根布局，静态路由和动态权限路由组合使用。
- 动态路由来源于 Supabase 权限数据，`permissionStore` 根据 `permissions` 表或 `get_user_permissions` RPC 构造菜单和路由。
- 页面组件通过 `import.meta.glob('/src/views/**/*.vue')` 解析，数据库中的 `component` 字段需要和 `src/views` 下的页面路径对应。
- 权限控制覆盖路由守卫和 `v-permission` 指令。
- 全局请求错误由 Vue Query 的 QueryCache / MutationCache 统一接入 Pf Toast。
- 主题 token 在 `uno.config.ts` 中维护，并通过 CSS 变量支持亮暗模式。

## 开发习惯

- 包管理器使用 pnpm，当前声明版本为 `pnpm@10.33.2`。
- 优先使用 TypeScript，Vue 单文件组件采用 Composition API。
- 组件命名分层明确：底层组件放 `components/ui`，业务封装组件统一使用 `Pf` 前缀并放在 `components/pf`。
- 图标规范以 Tabler 为主，优先使用 UnoCSS 图标类（如 `i-tabler-eye`），避免在业务组件中继续新增 Lucide 依赖。
- 样式优先使用 UnoCSS 原子类和项目主题 token，主题变量集中维护。
- 代码格式化使用 oxfmt，配置为 2 空格、单引号、无分号、100 字符宽度、尾随逗号。
- Supabase schema 变更通过 `supabase/migrations` 管理，前端数据库类型通过 `pnpm gen:types` 生成。
- 新业务菜单、权限和帮助页需要同步考虑 Supabase 权限迁移与动态路由组件路径。
- 项目规划和较大功能背景记录在 `.ai` 目录，便于后续持续开发。

## 当前能力

- 用户登录、资料读取与登出状态清理。
- 基于 Supabase 的角色、权限、菜单和动态路由。
- 组织管理、用户管理、角色管理、权限管理。
- 通知系统，包含公告、消息、日志和 realtime 相关迁移。
- Global Layout、Admin Layout、Page Layout 的基础布局体系。
- Pf 系列组件和组件文档体系。
- 系统帮助页和设计规范页面。
- 文件上传、图片预览和基础资源访问能力。

## 当前不足

- 缺少自动化测试脚本，当前质量门槛主要依赖类型检查、构建和格式化。
- 环境变量示例和生产部署说明还不完整。
- Supabase 初始化、迁移、种子数据和远端同步流程需要进一步文档化。
- 动态路由和权限系统已经可用，但模板化程度仍需提升，包括初始化脚本、默认角色策略和菜单配置说明。
- 组件文档体系刚开始形成，后续需要持续补齐 Pf 组件 API、示例和使用边界。
- 作为模板项目，还需要更清晰的新项目初始化流程、品牌替换流程和可选模块裁剪方式。

## 模板最终目标

项目最终应成为一个可快速启动中后台产品的开发模板，提供稳定的前端工程架构、可复用 UI/业务组件、Supabase 后端基础能力、权限与组织模型、通知系统、帮助文档体系、代码规范和项目初始化流程。使用者应能在较短时间内完成环境配置、数据库初始化、品牌替换、菜单权限配置和第一批业务页面开发。

