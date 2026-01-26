import 'vue-router'
import { Database } from './database.types'

type MenuRow = Database['public']['Tables']['menu']['Row']

declare module 'vue-router' {
  interface RouteMeta {
    /* 标题 */
    title: string
    /* 权限 */
    code?: MenuRow['code']

    // 数据库字段
    component?: MenuRow['component']
    icon?: MenuRow['icon']
    is_hidden?: MenuRow['is_hidden']
    is_external?: MenuRow['is_external']
    sort?: MenuRow['sort']
  }
}
