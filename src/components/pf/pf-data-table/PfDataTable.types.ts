import type { PfFormConfigItem, PfFormFieldRules } from '@/components/pf/pf-form/PfForm.types'
import type { VNodeChild } from 'vue'

export type PfDataTableQueryConfig<T = Record<string, any>> = {
  /**
   * Query 独立开关，false 时不在查询区显示。
   */
  enable?: boolean
  /**
   * 查询项标签，不填时沿用字段 name。
   */
  name?: string
  /**
   * 查询项类型，不填时沿用字段 type。
   */
  type?: PfFormConfigItem<T>['type']
  /**
   * 查询项默认值。
   */
  default?: unknown
  /**
   * 查询项帮助信息。
   */
  help?: PfFormConfigItem<T>['help']
  /**
   * 查询项校验规则。
   */
  rules?: PfFormFieldRules
  /**
   * 查询项底层配置（例如 options）。
   */
  config?: Record<string, any>
}

export type PfDataTableColumnConfig = {
  show?: boolean
  width?: number | string
  minWidth?: number | string
  maxWidth?: number | string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  /**
   * 文本展示策略：
   * - single-line: 强制单行（不截断）
   * - wrap: 自动换行
   * - ellipsis: 超长截断并可通过 tooltip 查看完整值
   */
  textDisplay?: 'single-line' | 'wrap' | 'ellipsis'
  /**
   * 当 textDisplay 为 ellipsis 时，是否显示 tooltip。
   */
  tooltip?: boolean
  /**
   * 自定义表格单元格渲染，仅在 table 场景生效，优先级高于顶层 render。
   */
  render?: (value: unknown, rowData: Record<string, any>) => VNodeChild
}

export type PfDataTableDetailConfig = {
  show?: boolean
}

export type PfDataTableItem<T = Record<string, any>> = PfFormConfigItem<T> & {
  query?: boolean | PfDataTableQueryConfig<T>
  table?: PfDataTableColumnConfig
  detail?: PfDataTableDetailConfig
  /**
   * 自定义预览渲染，优先级高于 type 默认渲染。
   */
  render?: (
    value: unknown,
    rowData: Record<string, any>,
    context: {
      scene: 'table' | 'detail'
      column: PfDataTableItem
    },
  ) => VNodeChild
}

export type PfDataTableContainerMode = 'drawer' | 'modal'
