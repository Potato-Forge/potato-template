import { supabase } from '@/api'
import { staticAppRoutes } from '@/route/routes/appRoutes'
import AdminLayout from '@/layouts/admin-layout/index.vue'
import type { Database } from '@/types/database.types'
import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

export type PermissionItem =
  Database['public']['Functions']['get_user_permissions']['Returns'][number]
export type Permission = Database['public']['Functions']['get_user_permissions']['Returns']

/**
 * Vite glob: maps '/src/views/xxx/yyy.vue' → dynamic import factory.
 * Used to resolve route component strings stored in the permissions table.
 */
const pageModules = import.meta.glob('/src/views/**/*.vue')
const fallbackNotFoundModule = pageModules['/src/views/404/index.vue']

function resolveComponent(componentPath: string | null | undefined) {
  if (!componentPath) return undefined
  const normalized = componentPath.trim().replace(/^\//, '')

  const basePath = normalized.replace(/^views\//, '')
  const withoutExt = basePath.endsWith('.vue') ? basePath.slice(0, -4) : basePath
  const candidates = [
    `/src/views/${withoutExt}/index.vue`,
    `/src/views/${withoutExt}.vue`,
    `/src/${withoutExt}/index.vue`,
    `/src/${withoutExt}.vue`,
  ]

  for (const key of candidates) {
    const moduleLoader = pageModules[key]
    if (moduleLoader) {
      return markRaw(moduleLoader)
    }
  }

  // Last fallback: tolerate accidental case mismatch in DB values.
  const lowerCandidates = new Set(candidates.map((item) => item.toLowerCase()))
  const matchedKey = Object.keys(pageModules).find((key) => lowerCandidates.has(key.toLowerCase()))
  if (matchedKey) {
    const moduleLoader = pageModules[matchedKey]
    if (moduleLoader) {
      return markRaw(moduleLoader)
    }
  }

  return undefined
}

/** Grab the last URL segment as a relative route path ('admin/dashboard' → 'dashboard'). */
function lastSegment(path: string | null | undefined): string {
  if (!path) return ''
  return path.replace(/\/$/, '').split('/').filter(Boolean).pop() ?? ''
}

function resolveLayoutComponent(layout: string | null | undefined) {
  switch (layout ?? 'admin') {
    case 'admin':
      return markRaw(AdminLayout)
    default:
      return markRaw(AdminLayout)
  }
}

function markRouteRecordRaw(route: RouteRecordRaw): RouteRecordRaw {
  return markRaw({
    ...route,
    children: route.children?.map((child) => markRouteRecordRaw(child)),
  }) as RouteRecordRaw
}

function resolveRedirectTarget(route: RouteRecordRaw | undefined): RouteRecordRaw['redirect'] {
  if (!route) return undefined
  if (route.name) {
    return { name: route.name as string }
  }
  if (typeof route.path === 'string' && route.path) {
    return route.path.startsWith('/') ? route.path : `/${route.path.replace(/^\//, '')}`
  }
  return undefined
}

function resolveMenuComponent(componentPath: string | null | undefined) {
  return (
    resolveComponent(componentPath) ??
    (fallbackNotFoundModule ? markRaw(fallbackNotFoundModule) : markRaw(AdminLayout))
  )
}

/** Build a RouteRecordRaw tree from flat menu permissions. */
export function buildRoutesFromPermissions(permissions: PermissionItem[]): RouteRecordRaw[] {
  const menus = permissions.filter((p) => p.p_type === 'menu')
  const menuIdSet = new Set(menus.map((m) => m.p_id))

  function buildChildren(parentId: number | null): RouteRecordRaw[] {
    return menus
      .filter((m) => m.p_parent_id === parentId)
      .sort((a, b) => (a.p_sort ?? 0) - (b.p_sort ?? 0))
      .map((m) => {
        const children = buildChildren(m.p_id)
        const base = {
          path: lastSegment(m.p_path),
          name: m.p_code ?? undefined,
          meta: {
            title: m.p_name ?? '',
            icon: m.p_icon ?? '',
            code: m.p_code ?? undefined,
            layout: m.p_layout ?? 'admin',
          },
        }
        const route: RouteRecordRaw = children.length
          ? {
              ...base,
              redirect: resolveRedirectTarget(children[0]),
              children,
            }
          : {
              ...base,
              component: resolveMenuComponent(m.p_component),
            }
        return markRouteRecordRaw(route)
      })
  }

  // Root menus: those whose parent_id is null or whose parent is not in the menus list
  return menus
    .filter((m) => !m.p_parent_id || !menuIdSet.has(m.p_parent_id))
    .sort((a, b) => (a.p_sort ?? 0) - (b.p_sort ?? 0))
    .map((m) => {
      const children = buildChildren(m.p_id)
      const base = {
        path: lastSegment(m.p_path),
        name: m.p_code ?? undefined,
        meta: {
          title: m.p_name ?? '',
          icon: m.p_icon ?? '',
          code: m.p_code ?? undefined,
          layout: m.p_layout ?? 'admin',
        },
      }
      const route: RouteRecordRaw = children.length
        ? {
            ...base,
            component: resolveLayoutComponent(m.p_layout),
            redirect: resolveRedirectTarget(children[0]),
            children,
          }
        : {
            ...base,
            component: resolveMenuComponent(m.p_component),
          }
      return markRouteRecordRaw(route)
    })
}

const usePermissionStore = defineStore('permission', {
  state: () => ({
    /** 当前用户所有权限（含 menu / button / api 三类） */
    permissions: [] as Permission,
    /** 是否已完成首次权限加载 */
    loaded: false,
    /** 当前用户是否为超级管理员（跳过所有权限校验） */
    isSuperAdmin: false,
    /** 由权限数据生成的动态路由树（供 GlobalLayout 菜单使用） */
    dynamicRoutes: [] as RouteRecordRaw[],
    /** 动态路由是否已注册到 router */
    routesRegistered: false,
  }),

  getters: {
    appRoutes: (state): RouteRecordRaw[] => [...state.dynamicRoutes, ...staticAppRoutes],

    /** 所有菜单类权限 */
    menuPermissions: (state): Permission => state.permissions.filter((p) => p.p_type === 'menu'),

    /** 所有按钮类权限 */
    buttonPermissions: (state): Permission =>
      state.permissions.filter((p) => p.p_type === 'button'),

    /** 以 code 为 key 的权限快查 Map */
    permissionMap: (state): Map<string, PermissionItem> => {
      const map = new Map<string, PermissionItem>()
      for (const p of state.permissions) {
        if (p.p_code) map.set(p.p_code, p)
      }
      return map
    },
  },

  actions: {
    /**
     * 检查当前用户是否拥有指定权限 code。
     * - code 为空（公开路由）→ 视为有权限
     * - isSuperAdmin → 始终有权限
     */
    hasPermission(code: string | null | undefined): boolean {
      if (!code) return true
      if (this.isSuperAdmin) return true
      return this.permissionMap.has(code)
    },

    /** 检查当前用户是否拥有给定 code 列表中的任意一个权限。 */
    hasAnyPermission(codes: string[]): boolean {
      return codes.some((c) => this.hasPermission(c))
    },

    /** 获取用户权限（如已加载则跳过）。 */
    async ensurePermissionsLoaded() {
      if (this.loaded) return
      await this.getUserPermission()
    },

    /** 强制重新拉取用户权限（登录 / 角色变更后调用）。 */
    async getUserPermission() {
      // 1. 判断是否超级管理员
      const { data: adminRole } = await supabase
        .from('user_roles')
        .select('role_code')
        .eq('role_code', 'super_admin')
        .maybeSingle()
      this.isSuperAdmin = !!adminRole

      // 2. 超级管理员直接读全量权限；普通用户走 RPC（按角色过滤）
      if (this.isSuperAdmin) {
        const { data, error } = await supabase
          .from('permissions')
          .select('id, code, name, parent_id, type, path, component, icon, is_hidden, sort, layout')
          .eq('status', true)
          .order('sort', { ascending: true })
        if (error) throw error
        this.permissions = (data ?? []).map((p) => ({
          p_id: p.id,
          p_code: p.code ?? '',
          p_name: p.name ?? '',
          p_parent_id: p.parent_id ?? 0,
          p_type: p.type ?? '',
          p_path: p.path,
          p_component: p.component,
          p_icon: p.icon,
          p_is_hidden: (p.is_hidden as boolean | null) ?? false,
          p_sort: (p.sort as number | null) ?? 0,
          p_layout: p.layout,
        })) as Permission
      } else {
        const { data, error } = await supabase.rpc('get_user_permissions')
        if (error) throw error
        this.permissions = data || []
      }

      // 3. 从菜单权限构建动态路由树
      this.dynamicRoutes = buildRoutesFromPermissions(this.permissions)
      this.loaded = true
    },

    /** 清空权限数据（登出时调用）。 */
    clearPermissions() {
      this.permissions = []
      this.loaded = false
      this.isSuperAdmin = false
      this.dynamicRoutes = []
      this.routesRegistered = false
    },
  },
})

export default usePermissionStore
