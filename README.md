# Potato Template

Potato Template 是一个面向中后台应用的 Vue 3 + Supabase 开发模板。它沉淀了登录、用户资料、动态权限菜单、角色、组织、通知、系统帮助、组件文档、基础布局和 Pf 业务组件等能力，目标是作为可复用的业务系统起点。

## 特性

- Vue 3、TypeScript、Vite、Pinia、vue-router 的前端工程基础。
- Supabase 驱动的认证、用户资料、权限、角色、组织、通知和迁移管理。
- 基于权限数据生成动态路由和菜单，支持路由守卫与 `v-permission` 指令。
- Global Layout、Admin Layout、Page Layout 组成的后台布局体系。
- shadcn-vue / reka-ui 风格的基础 UI，以及项目封装的 Pf 系列业务组件。
- UnoCSS 主题 token、亮暗模式、Tabler 图标体系和组件自动注册。
- alova、axios、@tanstack/vue-query 组合的数据请求与缓存处理。
- Shiki + Monaspace Neon 支持的组件文档与代码展示基础。

## 技术栈

| 类别 | 选型 |
| --- | --- |
| 核心框架 | Vue 3、TypeScript、Vite（rolldown-vite） |
| 路由与状态 | vue-router、Pinia、@vueuse/core |
| 数据请求 | Supabase、alova、axios、@tanstack/vue-query |
| 表单校验 | @tanstack/vue-form、vee-validate、zod |
| UI 与样式 | shadcn-vue、reka-ui、radix-vue、UnoCSS、Iconify、Tabler Icons |
| 组件能力 | vxe-table、Unovis、v-viewer、tippy.js、dnd-kit、three |
| 工程工具 | pnpm、vue-tsc、oxfmt、tsx、Supabase CLI |

## 目录结构

```text
.
├── env/                    # Vite 环境变量目录
├── scripts/                # 类型生成、图标索引等项目脚本
├── src/
│   ├── api/                # alova / Supabase 实例与业务 API
│   ├── assets/             # 全局样式和品牌资源
│   ├── components/
│   │   ├── ui/             # 底层 UI 组件
│   │   ├── pf/             # Pf 业务组件
│   │   └── common/         # 跨模块公共组件
│   ├── directives/         # 全局指令
│   ├── layouts/            # 全局、后台、页面布局
│   ├── route/              # 路由、静态路由、守卫
│   ├── store/              # Pinia stores
│   ├── types/              # 自动生成与项目类型
│   ├── utils/              # 通用工具
│   └── views/              # 页面视图
└── supabase/               # Supabase 配置、迁移和种子数据
```

## 快速开始

### 环境要求

- Node.js 版本建议与当前依赖生态保持一致。
- pnpm：项目声明版本为 `pnpm@10.33.2`。
- Supabase CLI：用于本地数据库、迁移和类型生成。

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

项目使用 `env` 目录作为 Vite 环境变量目录。至少需要确认以下变量：

```bash
VITE_APP_TITLE=Potato Template
VITE_API_BASE_URL=
VITE_API_TIMEOUT=5000
VITE_SUPABASE_URL=
VITE_SUPABASE_KEY=
VITE_SUPABASE_PROJECT_ID=
VITE_SUPABASE_ASSETS_PUBLIC_BASE_URL=
```

本地私有配置可放在 `env/.env.local`，不要提交真实密钥。

### 启动开发服务

```bash
pnpm dev
```

### 构建

```bash
pnpm build
```

### 预览构建产物

```bash
pnpm preview
```

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动 Vite 开发服务 |
| `pnpm build` | 执行 `vue-tsc` 类型检查并构建生产产物 |
| `pnpm preview` | 预览构建产物 |
| `pnpm ui` | 使用 shadcn-vue 添加 UI 组件 |
| `pnpm gen:types` | 根据 Supabase 项目生成数据库类型 |
| `pnpm fmt` | 使用 oxfmt 格式化代码 |
| `pnpm fmt:check` | 检查代码格式 |

## 开发约定

- 包管理器统一使用 pnpm。
- Vue 组件优先使用 Composition API 和 TypeScript。
- 底层 UI 放在 `src/components/ui`，项目业务组件使用 `Pf` 前缀并放在 `src/components/pf`。
- 图标库统一使用 Tabler，优先使用 UnoCSS 图标类，例如 `i-tabler-eye`。业务组件不再新增 Lucide 图标依赖。
- 样式优先使用 UnoCSS 原子类和 `uno.config.ts` 中的主题 token。
- 代码格式使用 oxfmt：2 空格、单引号、无分号、100 字符宽度。
- 数据库 schema 变更通过 `supabase/migrations` 管理。
- Supabase 类型变更后运行 `pnpm gen:types` 更新 `src/types/database.types.ts`。
- 数据库中的动态路由 `component` 字段需要对应 `src/views` 下真实页面路径。

## Supabase 与权限模型

项目通过 Supabase 承载认证、资料、权限、角色、组织和通知数据。权限系统以 `permissions` 数据和 `get_user_permissions` RPC 为核心，前端在 `permissionStore` 中把菜单权限转换为 `vue-router` 动态路由。

根路由使用 `GlobalLayout`，动态业务模块默认使用 `AdminLayout`。权限校验覆盖：

- 登录守卫；
- 用户资料守卫；
- 菜单和页面权限守卫；
- `v-permission` 按钮级权限指令；
- 超级管理员权限绕过逻辑。

## 当前进度

- 已完成前端工程基础、主题系统、布局框架和路由守卫。
- 已完成 Supabase 认证、资料、角色、权限、组织和通知相关基础能力。
- 已形成 Pf 组件体系，并开始建设组件文档页面。
- 已具备系统帮助、设计规范和上传示例等辅助页面。
- 已接入构建、类型检查、格式化和数据库类型生成脚本。

更完整的项目基本信息见 [docs/project-basic-info.md](./docs/project-basic-info.md)。

## 后续规划

作为开发模板，项目在达到稳定可复用之前还需要继续完成：

- 补齐 `.env.example`、Supabase 本地启动、迁移、种子数据和部署说明。
- 提供模板初始化流程，包括项目名、品牌 Logo、主题色、默认管理员、默认角色和初始菜单。
- 完善 Pf 组件文档，覆盖 API、示例、可访问性、使用边界和常见组合。
- 增加自动化测试能力，至少覆盖核心 store、权限路由构建、关键组件和主要页面流程。
- 收敛 Supabase 迁移历史，明确远端同步、占位迁移和数据初始化策略。
- 完善通知系统、组织角色绑定、文件上传和资源访问的生产级边界处理。
- 提供模块裁剪指南，让新项目可以选择性移除通知、组织、帮助文档等模块。
- 增加 CI 流程，统一执行格式检查、类型检查、构建和测试。
- 编写贡献指南、版本发布说明和模板升级策略。

## License

本项目基于 [MIT License](./LICENSE) 开源。
