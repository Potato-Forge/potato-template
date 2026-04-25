import type { AnyFieldApi } from '@tanstack/vue-form'
import type { JSX } from 'vue/jsx-runtime'
import type { ZodType } from 'zod'
import type {
  PfUploadHandler,
  PfUploadListType,
  PfUploadTriggerType,
} from '@/components/pf/pf-upload'

export type PfFormFieldApi = AnyFieldApi

export type PfFormValidationErrors<T = Record<string, any>> = Partial<
  Record<keyof T & string, string | string[]>
>

export type PfFormValidationResult<T = Record<string, any>> =
  | void
  | null
  | undefined
  | string
  | PfFormValidationErrors<T>
  | {
      form?: string
      fields?: PfFormValidationErrors<T>
    }

export type PfFormRuleHandler<T = Record<string, any>> = (payload: {
  value: T
  stage: 'change' | 'blur' | 'submit'
  signal?: AbortSignal
}) => PfFormValidationResult<T> | Promise<PfFormValidationResult<T>>

type PfFormFieldRuleNumber = number | { value: number; message?: string }
type PfFormFieldRulePattern = RegExp | { value: RegExp; message?: string }

export type PfFormFieldRules = {
  required?: boolean | string
  min?: PfFormFieldRuleNumber
  max?: PfFormFieldRuleNumber
  pattern?: PfFormFieldRulePattern
  validateOn?: 'change' | 'blur' | 'both'
}

export type PfFormRules<T = Record<string, any>> = {
  /**
   * zod schema validation, usually used for submit-time strict checks.
   */
  schema?: ZodType<T>
  /**
   * Form-level custom validation triggered on blur.
   */
  onBlur?: PfFormRuleHandler<T>
  /**
   * Form-level custom validation triggered on submit.
   */
  onSubmit?: PfFormRuleHandler<T>
}

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
   * 是否参与查询表单渲染。
   * 该字段由 PfDataTable 等上层组件消费，PfForm 本身不直接处理。
   */
  query?:
    | boolean
    | {
        enable?: boolean
        name?: string
        type?: PfFormConfigItem<T>['type']
        default?: unknown
        help?: string | Component | (() => VNode | JSX.Element)
        rules?: PfFormFieldRules
        config?: Record<string, any>
      }
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
  /**
   * 字段级原子校验规则，仅处理当前字段值，不涉及跨字段逻辑
   */
  rules?: PfFormFieldRules
  /**
   * 条件可见性函数，当返回 false 时隐藏该表单项，该字段不会被验证和提交
   */
  visibleIf?: (formValues: Record<string, any>) => boolean
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

/**
 * 选择图标类型
 */
export type PfFormConfigItemIcon<
  T = Record<string, unknown>,
  K extends keyof T & string = keyof T & string,
> = PfFormConfigBase<T, K> & {
  type: 'icon'
  config?: {}
}

/**
 * 开关类型
 */
export type PfFormConfigItemToggle<
  T = Record<string, unknown>,
  K extends keyof T & string = keyof T & string,
> = PfFormConfigBase<T, K> & {
  type: 'toggle'
  config?: {
    varient?: 'switch' | 'checkbox'
    trueValue?: T[K]
    falseValue?: T[K]
  }
}

/**
 * 选项类型（下拉/复选框单选多选）
 */
export type PfFormSelectOption = {
  label: string
  value: any
  description?: string
  searchText?: string
  disabled?: boolean
}

export type PfFormConfigItemOptions<
  T = Record<string, unknown>,
  K extends keyof T & string = keyof T & string,
> = PfFormConfigBase<T, K> & {
  type: 'options'
  config: {
    /**
     * 是否允许多选
     * @default false
     */
    multiple?: boolean
    /**
     * UI 变体：combobox（下拉）或 checkbox（复选框组）
     * @default 'combobox'
     */
    variant?: 'combobox' | 'checkbox'
    /**
     * 静态选项列表
     */
    options?: PfFormSelectOption[]
    /**
     * 异步加载选项的函数，与 options 互斥，优先使用 optionsFn
     */
    optionsFn?: () => Promise<PfFormSelectOption[]>
    /**
     * Combobox 输入占位符
     */
    placeholder?: string
    /**
     * 是否支持搜索过滤（仅 combobox 变体有效）
     * @default false
     */
    searchable?: boolean
  }
}

/**
 * 上传类型
 */
export type PfFormConfigItemUpload<
  T = Record<string, unknown>,
  K extends keyof T & string = keyof T & string,
> = PfFormConfigBase<T, K> & {
  type: 'upload'
  config?: {
    trigger?: PfUploadTriggerType
    listType?: PfUploadListType
    multiple?: boolean
    accept?: string
    maxFiles?: number
    maxSize?: number
    showToast?: boolean
    uploadHandler?: PfUploadHandler
  }
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
  | PfFormConfigItemToggle<T>
  | PfFormConfigItemOptions<T>
  | PfFormConfigItemUpload<T>

/**
 * 表单配置数组
 */
export type PfFormConfig<T = any> = Array<PfFormConfigItem<T>>
