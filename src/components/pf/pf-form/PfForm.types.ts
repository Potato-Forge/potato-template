import type { AnyFieldApi } from '@tanstack/vue-form'
import type { JSX } from 'vue/jsx-runtime'

export type PfFormFieldApi = AnyFieldApi

/**
 * 表单配置项的公共基础字段
 */
type PfFormConfigBase<
  T = Record<string, unknown>,
  K extends keyof T & string = keyof T & string,
> = {
  /**
   * 作为表单项的标签显示
   * @example "姓名" - 在表单中显示为 "名称"
   */
  name: string
  /**
   * 表单项的唯一标识符，用于表单数据的绑定和提交
   * @example "name" - 在表单数据中以 "name" 作为键
   */
  key: K | (string & {})
  /**
   * 表单项的默认值，在创建模式下会自动填充到表单中
   */
  default?: T[K]
  /**
   * 是否禁用该表单项
   * @default false
   */
  disabled?: boolean
  create?: boolean
  edit?: boolean
  /**
   * 表单项是否为只读状态，为 true 时会直接渲染 type 对应的渲染逻辑
   * @default false
   */
  readonly?: boolean
  /**
   * 表单项的帮助信息，可以是字符串、组件或一个返回 VNode/JSX 的函数，用于在表单项下方显示额外的说明信息
   *
   */
  help?: string | Component | (() => VNode | JSX.Element)
}

/**
 * 文本输入类型
 */
export type PfFormConfigItemText<
  T = Record<string, unknown>,
  K extends keyof T & string = keyof T & string,
> = PfFormConfigBase<T, K> & {
  type: 'text'
}

/**
 * 日期时间类型
 */
export type PfFormConfigItemDatetime<
  T = Record<string, unknown>,
  K extends keyof T & string = keyof T & string,
> = PfFormConfigBase<T, K> & {
  type: 'datetime'
  config?: {
    /**
     * 日期时间的格式，见[Vue Datepicker model-type](https://vue3datepicker.com/props/general-configuration/#model-type)
     * @default "YYYY-MM-DD HH:mm:ss"
     */
    format?: 'timestamp' | 'format' | 'iso' | string
    /**
     * 是否为日期范围选择
     * @default false
     */
    range?: boolean
    /**
     * 日期范围选择的键映射
     * @example ["startDate", "endDate"] - 在表单数据中以 "startDate" 和 "endDate" 作为键分别存储开始和结束日期
     */
    rangeTransform?: [keyof T & string, keyof T & string]
  }
}

/**
 * 日期类型
 */
export type PfFormConfigItemDate<
  T = Record<string, unknown>,
  K extends keyof T & string = keyof T & string,
> = PfFormConfigBase<T, K> & {
  type: 'date'
  config?: {
    /**
     * 指定日期使用和返回的格式，见[Vue Datepicker model-type](https://vue3datepicker.com/props/general-configuration/#model-type)
     * @default "YYYY-MM-DD"
     */
    format?: 'timestamp' | 'format' | 'iso' | string
    /**
     * 是否为日期范围选择
     * @default false
     */
    range?: boolean
    /**
     * 日期范围选择的键映射
     * @example ["startDate", "endDate"] - 在表单数据中以 "startDate" 和 "endDate" 作为键分别存储开始和结束日期
     */
    rangeTransform?: [keyof T & string, keyof T & string]
  }
}

/**
 * 时间类型
 */
export type PfFormConfigItemTime<
  T = Record<string, unknown>,
  K extends keyof T & string = keyof T & string,
> = PfFormConfigBase<T, K> & {
  type: 'time'
  config?: {
    /**
     * 时间的格式，见[Vue Datepicker model-type](https://vue3datepicker.com/props/general-configuration/#model-type)
     * @default "HH:mm:ss"
     */
    format?: 'timestamp' | 'format' | 'iso' | string
    /**
     * 是否为时间范围选择
     * @default false
     */
    range?: boolean
    /**
     * 时间范围选择的键映射
     * @example ["startTime", "endTime"] - 在表单数据中以 "startTime" 和 "endTime" 作为键分别存储开始和结束时间
     */
    rangeTransform?: [keyof T, keyof T]
  }
}

export type PfFormConfigItemIcon<
  T = Record<string, unknown>,
  K extends keyof T & string = keyof T & string,
> = PfFormConfigBase<T, K> & {
  type: 'icon'
  config?: {}
}

/**
 * 所有表单配置项类型的联合
 */
export type PfFormConfigItem<T = any> =
  | PfFormConfigItemText<T>
  | PfFormConfigItemDatetime<T>
  | PfFormConfigItemDate<T>
  | PfFormConfigItemTime<T>
  | PfFormConfigItemIcon<T>

/**
 * 表单配置数组
 */
export type PfFormConfig<T = any> = Array<PfFormConfigItem<T>>
