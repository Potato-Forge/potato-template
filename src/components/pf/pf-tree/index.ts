export { default as PfTree } from './PfTree.vue'

export type PfTreeNode = {
  [key: string]: any
  id: string
  parent_id: string | null
  children?: PfTreeNode[]
}
