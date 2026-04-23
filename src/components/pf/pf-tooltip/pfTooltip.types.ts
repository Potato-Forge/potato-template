export interface PfTooltipProps {
  content?: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: [number, number]
  /**
   * 是否允许 tooltip 内部交互（例如点击链接、按钮等）。开启后 tooltip 不会在鼠标移入时自动隐藏。
   */
  interactive?: boolean
  trigger?: string
}
