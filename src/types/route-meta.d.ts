import 'vue-router'
import { Database } from './database.types'

type PermissionRow = Database['public']['Tables']['permissions']['Row']

declare module 'vue-router' {
  interface RouteMeta {
    /* 标题 */
    title: string
    /* 权限 code，对应 permissions.code，用于路由授权判定 */
    code?: PermissionRow['code']

    // 数据库字段
    component?: PermissionRow['component']
    icon?: PermissionRow['icon']
    is_hidden?: PermissionRow['is_hidden']
    is_external?: PermissionRow['is_external']
    sort?: PermissionRow['sort']
  }
}
