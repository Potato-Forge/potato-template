import type { PfTreeNode } from '@/components/pf/pf-tree'

export type FlatData = {
  [key: string]: any
}

export type TreeOptions = {
  idKey?: string
  parentKey?: string
  childrenKey?: string
}

export type TreeNode = PfTreeNode

const sortTreeSiblings = (nodes: TreeNode[]) => {
  nodes.sort((a, b) => {
    const sortA = typeof a.sort === 'number' ? a.sort : Number.MAX_SAFE_INTEGER
    const sortB = typeof b.sort === 'number' ? b.sort : Number.MAX_SAFE_INTEGER

    if (sortA !== sortB) return sortA - sortB

    const createdAtA = typeof a.created_at === 'string' ? Date.parse(a.created_at) : Number.NaN
    const createdAtB = typeof b.created_at === 'string' ? Date.parse(b.created_at) : Number.NaN
    if (!Number.isNaN(createdAtA) && !Number.isNaN(createdAtB) && createdAtA !== createdAtB) {
      return createdAtA - createdAtB
    }

    const idA = Number(a.id)
    const idB = Number(b.id)
    if (!Number.isNaN(idA) && !Number.isNaN(idB) && idA !== idB) {
      return idA - idB
    }

    return 0
  })

  nodes.forEach((node) => {
    if (Array.isArray(node.children) && node.children.length > 0) {
      sortTreeSiblings(node.children as TreeNode[])
    }
  })
}

/*
 * @description 将扁平化数据转换为树形结构
 * @param flatData 扁平化数据数组
 * @param options{idKey, parentKey, childrenKey} 可选项，指定 id、parent_id 和 children 的键名
 * @returns 树形结构数据数组
 */
export const flatToTree = (flatData: FlatData[], options?: TreeOptions): TreeNode[] => {
  const idKey = options?.idKey || 'id'
  const parentKey = options?.parentKey || 'parent_id'
  const childrenKey = options?.childrenKey || 'children'

  const map: { [key: string]: TreeNode } = {}

  flatData.forEach((item) => {
    map[item[idKey]] = {
      ...item,
      [childrenKey]: [],
    } as TreeNode
  })

  const tree: TreeNode[] = []

  flatData.forEach((item) => {
    const id = item[idKey]
    const parentId = item[parentKey]
    const currentNode = map[id]

    // 如果没有父节点，说明它是根节点
    if (parentId === null || parentId === undefined || parentId === '' || !map[parentId]) {
      currentNode && tree.push(currentNode)
    } else {
      // 如果有父节点，把它推入父节点的 children 数组中
      map[parentId][childrenKey].push(currentNode)
    }
  })

  sortTreeSiblings(tree)

  return tree
}
