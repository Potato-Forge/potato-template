import { getAllPermissions, permissionKeys, type Permission } from '@/api/permission/permission'
import { flatToTree } from '@/utils/tree'
import { useQuery } from '@tanstack/vue-query'
import type { PermissionTreeMethods } from './components/PermissionTree.types'

export function usePermissionManager(tree?: Readonly<ShallowRef<PermissionTreeMethods | null>>) {
  // all permissions tree data
  const {
    data: allPermissions,
    isLoading: isTreeLoading,
    isError: isTreeError,
    error: treeError,
  } = useQuery({
    queryKey: permissionKeys.all,
    queryFn: getAllPermissions,
  })

  const allPermissionTree = computed(() => {
    if (!allPermissions.value) return []

    return flatToTree(allPermissions.value)
  })

  // tree methods
  const getTreeData = () => {
    if (!tree || !tree.value) return []
    return tree.value.getTreeData()
  }

  // choosen permission
  const choosenId = ref<string | number | null>(null)
  const choosenPermission = computed(() => {
    if (!allPermissions.value || choosenId.value === null) return null

    return allPermissions.value.find((p) => p.id === choosenId.value) || null
  })

  const getChoosenPathNodes = (id: string | number | null) => {
    if (!allPermissions.value || id === null) return []

    const pathNodes: Permission[] = []
    let currentId: string | number | null = id

    while (currentId !== null) {
      const permission = allPermissions.value.find((p) => p.id === currentId)
      if (!permission) break

      pathNodes.unshift(permission)
      currentId = permission.parent_id
    }

    return pathNodes
  }

  const choosenPath = computed(() => getChoosenPathNodes(choosenId.value))

  return {
    allPermissionTree,
    choosenId,
    choosenPermission,
    isTreeLoading,
    isTreeError,
    treeError,
    choosenPath,
  }
}
