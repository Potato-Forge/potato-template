import type { PfTreeNode } from '..'

/** 根节点是否允许作为拖拽目标的动态判断函数 */
export type RootDroppable = () => boolean

export type PfTreeProps = {
	/** 树数据（双向绑定） */
	modelValue: PfTreeNode[]
	/** 节点显示文本的字段名 */
	labelKey?: string
	/** 节点唯一键字段名 */
	valueKey?: string
	/** 子节点字段名 */
	childrenKey?: string
	/** 节点禁用状态字段名 */
	disabledKey?: string
	/** 是否允许节点选中（点击高亮） */
	chooseable?: boolean
	/** 是否允许节点勾选 */
	checkable?: boolean
	/** 是否允许拖拽排序 */
	draggable?: boolean
	/** 当前选中的节点键值 */
	choosen?: string | number | null
	/** 按节点控制是否可放置拖拽项 */
	eachDroppable?: (stat: any) => boolean | null
	/** 是否允许拖拽到根层级（或动态判定） */
	rootDroppable?: boolean | RootDroppable
	/** 拖拽悬停时是否自动展开节点 */
	dragOpen?: boolean
	/** 拖拽悬停自动展开延迟（毫秒） */
	dragOpenDelay?: number
}
