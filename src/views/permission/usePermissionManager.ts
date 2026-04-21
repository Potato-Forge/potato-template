import {
  createPermission,
  getAllPermissions,
  permissionKeys,
  reorderPermissions,
  updatePermission,
  type Permission,
  type PermissionInsert,
  type PermissionSortUpdate,
  type PermissionUpdate,
} from '@/api/permission/permission'
import { flatToTree } from '@/utils/tree'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { usePfModal } from '@/components/pf/pf-modal'
import { pfToast } from '@/components/pf/pf-toast'
import type { PfTreeNode } from '@/components/pf/pf-tree'

export function usePermissionManager() {
  const queryClient = useQueryClient()

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

  // choosen permission
  const choosenId = ref<string | number | null>(null)
  const choosenPermission = computed(() => {
    if (!allPermissions.value || choosenId.value === null) return null

    return allPermissions.value.find((p) => String(p.id) === String(choosenId.value)) || null
  })

  const getChoosenPathNodes = (id: string | number | null) => {
    if (!allPermissions.value || id === null) return []

    const pathNodes: Permission[] = []
    let currentId: string | number | null = id

    while (currentId !== null) {
      const permission = allPermissions.value.find((p) => String(p.id) === String(currentId))
      if (!permission) break

      pathNodes.unshift(permission)
      currentId = permission.parent_id
    }

    return pathNodes
  }

  const choosenPath = computed(() => getChoosenPathNodes(choosenId.value))

  // mode
  const isCreating = ref(false)
  const currentDraftId = ref<number | null>(null)
  const isDirty = ref(false)

  const ensurePermissions = () => queryClient.getQueryData<Permission[]>(permissionKeys.all) || []
  const compareValue = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

  const parsePermissionId = (id: unknown): number | null => {
    const parsed = Number.parseInt(String(id), 10)
    if (Number.isNaN(parsed) || parsed <= 0) return null
    return parsed
  }

  const normalizeSortValue = (value: unknown, fallback: number | null): number | null => {
    if (value === null || value === undefined || value === '') {
      return fallback
    }

    const parsed = Number.parseInt(String(value), 10)
    if (Number.isNaN(parsed) || parsed < 1) {
      return fallback
    }

    return parsed
  }

  const collectTreeSortUpdates = (
    nodes: PfTreeNode[],
    parentId: number | null,
    updates: PermissionSortUpdate[],
  ) => {
    let nextSort = 1

    nodes.forEach((node) => {
      const id = parsePermissionId(node.id)
      if (id !== null) {
        updates.push({
          id,
          parent_id: parentId,
          sort: nextSort,
        })
        nextSort += 1
      }

      const nextParentId = id === null ? parentId : id
      const children = Array.isArray(node.children) ? (node.children as PfTreeNode[]) : []
      if (children.length > 0) {
        collectTreeSortUpdates(children, nextParentId, updates)
      }
    })
  }

  const hasSortChanges = (updates: PermissionSortUpdate[]) => {
    if (updates.length === 0) return false

    const currentMap = new Map(
      ensurePermissions().map((item) => [item.id, { sort: item.sort, parent_id: item.parent_id }]),
    )

    return updates.some((item) => {
      const current = currentMap.get(item.id)
      if (!current) return false
      return current.sort !== item.sort || current.parent_id !== item.parent_id
    })
  }

  const applySortUpdatesToCache = (updates: PermissionSortUpdate[]) => {
    if (updates.length === 0) return

    const updatesMap = new Map(updates.map((item) => [item.id, item]))
    queryClient.setQueryData<Permission[]>(permissionKeys.all, (old = []) =>
      old.map((item) => {
        const next = updatesMap.get(item.id)
        if (!next) return item

        return {
          ...item,
          parent_id: next.parent_id,
          sort: next.sort,
        }
      }),
    )
  }

  const getPermissionById = (id: string | number | null) => {
    if (id === null) return null
    return ensurePermissions().find((p) => String(p.id) === String(id)) || null
  }

  const getCurrentDraftPermission = () => {
    if (currentDraftId.value === null) return null
    return ensurePermissions().find((item) => item.id === currentDraftId.value) || null
  }

  const editingSnapshot = ref<Record<string, any> | null>(null)

  const setEditingSnapshot = (permission: Permission | null) => {
    editingSnapshot.value = permission ? JSON.parse(JSON.stringify(permission)) : null
  }

  const resetEditingState = () => {
    isCreating.value = false
    currentDraftId.value = null
    isDirty.value = false
    editingSnapshot.value = null
  }

  const buildDraftPermission = (parentId: number | null): Permission => {
    const draftId = -Date.now()
    currentDraftId.value = draftId

    const siblings = ensurePermissions().filter((item) => item.parent_id === parentId)
    const maxSort = siblings.reduce((max, item) => {
      if (typeof item.sort !== 'number') return max
      return Math.max(max, item.sort)
    }, 0)

    return {
      id: draftId,
      name: '',
      code: null,
      component: null,
      created_at: new Date().toISOString(),
      icon: null,
      is_external: null,
      is_hidden: null,
      parent_id: parentId,
      path: null,
      sort: maxSort + 1,
      status: null,
      type: 'menu',
    }
  }

  const insertDraftPermission = (
    list: Permission[],
    draft: Permission,
    parentId: number | null,
  ) => {
    if (parentId === null) {
      return [draft, ...list]
    }

    const parentIndex = list.findIndex((item) => item.id === parentId)
    if (parentIndex === -1) {
      return [draft, ...list]
    }

    const next = [...list]
    next.splice(parentIndex + 1, 0, draft)
    return next
  }

  const removeCurrentDraftFromCache = () => {
    if (currentDraftId.value === null) return
    const draftId = currentDraftId.value
    queryClient.setQueryData<Permission[]>(permissionKeys.all, (old = []) =>
      old.filter((item) => item.id !== draftId),
    )
  }

  const confirmDiscardIfDirty = async () => {
    if (!isDirty.value) return true
    const modal = usePfModal()
    const confirmed = await modal.confirm({
      title: '当前有未保存的权限，是否放弃修改？',
    })
    return confirmed
  }

  const formMode = computed(() => {
    if (!choosenId.value) {
      return 'empty'
    }

    return isCreating.value ? 'create' : 'edit'
  })

  // create tree node

  const createDraftNode = async (parentId?: string | number) => {
    const canContinue = await confirmDiscardIfDirty()
    if (!canContinue) return false

    removeCurrentDraftFromCache()

    const normalizedParentId =
      parentId === undefined || parentId === null ? null : Number.parseInt(String(parentId), 10)
    const draft = buildDraftPermission(
      Number.isNaN(normalizedParentId as number) ? null : (normalizedParentId as number | null),
    )

    queryClient.setQueryData<Permission[]>(permissionKeys.all, (old = []) =>
      insertDraftPermission(old, draft, draft.parent_id),
    )

    isCreating.value = true
    choosenId.value = draft.id
    isDirty.value = false
    setEditingSnapshot(draft)

    return true
  }

  const selectNode = async (nextId: string | number | null) => {
    const normalizedId =
      nextId === null || nextId === undefined
        ? null
        : Number.isNaN(Number.parseInt(String(nextId), 10))
          ? nextId
          : Number.parseInt(String(nextId), 10)

    if (String(choosenId.value) === String(normalizedId)) {
      return true
    }

    const canContinue = await confirmDiscardIfDirty()
    if (!canContinue) {
      return false
    }

    if (isCreating.value) {
      removeCurrentDraftFromCache()
    }

    choosenId.value = normalizedId
    const selected = getPermissionById(normalizedId)
    isCreating.value = false
    currentDraftId.value = null
    isDirty.value = false
    setEditingSnapshot(selected)

    return true
  }

  const cancelEditing = async () => {
    const modal = usePfModal()
    const confirmed = await modal.confirm({
      title: '是否取消当前编辑？未保存的内容将被丢弃。',
    })
    if (!confirmed) return false

    if (isCreating.value) {
      removeCurrentDraftFromCache()
    }

    choosenId.value = null
    resetEditingState()

    return true
  }

  const markFormChanged = (values: Record<string, any>) => {
    if (formMode.value === 'empty') return

    if (formMode.value === 'create' && currentDraftId.value !== null) {
      queryClient.setQueryData<Permission[]>(permissionKeys.all, (old = []) =>
        old.map((item) =>
          item.id === currentDraftId.value
            ? {
                ...item,
                name: values.name ?? '',
              }
            : item,
        ),
      )
    }

    if (!editingSnapshot.value) {
      isDirty.value = true
      return
    }

    isDirty.value = !compareValue(values, editingSnapshot.value)
  }

  const sanitizeCreatePayload = (values: Record<string, any>): PermissionInsert => {
    const draft = getCurrentDraftPermission()
    const defaultSort = typeof draft?.sort === 'number' ? draft.sort : 1
    const defaultType = draft?.type || 'menu'
    const type = (values.type || defaultType) as 'menu' | 'button' | 'api'
    const isMenu = type === 'menu'
    const isApi = type === 'api'

    return {
      name: values.name || '',
      parent_id: values.parent_id ?? draft?.parent_id ?? null,
      code: values.code || null,
      path: isMenu ? values.path || null : null,
      icon: isApi ? null : values.icon || null,
      component: isMenu ? values.component || null : null,
      is_external: isMenu ? values.is_external || null : null,
      is_hidden: values.is_hidden ?? null,
      sort: normalizeSortValue(values.sort, defaultSort),
      status: values.status ?? null,
      type,
    }
  }

  const sanitizeUpdatePayload = (values: Record<string, any>): PermissionUpdate => {
    const type = (values.type || 'menu') as 'menu' | 'button' | 'api'
    const isMenu = type === 'menu'
    const isApi = type === 'api'

    return {
      name: values.name,
      parent_id: values.parent_id,
      code: values.code,
      path: isMenu ? values.path || null : null,
      icon: isApi ? null : values.icon || null,
      component: isMenu ? values.component || null : null,
      is_external: isMenu ? values.is_external || null : null,
      is_hidden: values.is_hidden,
      sort: normalizeSortValue(values.sort, null),
      status: values.status,
      type,
    }
  }

  const getErrorMessage = (error: unknown) => {
    if (error instanceof Error) {
      return error.message
    }

    return '请稍后重试'
  }

  const createMutation = useMutation({
    mutationFn: createPermission,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: permissionKeys.all })
      const previous = ensurePermissions()

      if (currentDraftId.value !== null) {
        const draftId = currentDraftId.value
        queryClient.setQueryData<Permission[]>(permissionKeys.all, (old = []) =>
          old.map((item) => (item.id === draftId ? { ...item, ...payload } : item)),
        )
      }

      return { previous }
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(permissionKeys.all, context.previous)
      }

      pfToast.error('新建权限失败', getErrorMessage(error))
    },
    onSuccess: (saved) => {
      const draftId = currentDraftId.value
      if (draftId !== null) {
        queryClient.setQueryData<Permission[]>(permissionKeys.all, (old = []) =>
          old.map((item) => (item.id === draftId ? saved : item)),
        )
      }

      choosenId.value = saved.id
      isCreating.value = false
      currentDraftId.value = null
      isDirty.value = false
      setEditingSnapshot(saved)
      pfToast.success('新建权限成功')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.all })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PermissionUpdate }) =>
      updatePermission(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: permissionKeys.all })
      const previous = ensurePermissions()

      queryClient.setQueryData<Permission[]>(permissionKeys.all, (old = []) =>
        old.map((item) => (item.id === id ? { ...item, ...payload } : item)),
      )

      return { previous }
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(permissionKeys.all, context.previous)
      }

      pfToast.error('更新权限失败', getErrorMessage(error))
    },
    onSuccess: (saved) => {
      queryClient.setQueryData<Permission[]>(permissionKeys.all, (old = []) =>
        old.map((item) => (item.id === saved.id ? saved : item)),
      )

      choosenId.value = saved.id
      isCreating.value = false
      isDirty.value = false
      setEditingSnapshot(saved)
      pfToast.success('更新权限成功')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.all })
    },
  })

  const pendingReorderUpdates = ref<PermissionSortUpdate[]>([])
  const isReorderQueued = ref(false)
  const reorderSnapshot = ref<Permission[] | null>(null)

  const reorderMutation = useMutation({
    mutationFn: reorderPermissions,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: permissionKeys.all })
    },
    onError: (error) => {
      if (reorderSnapshot.value) {
        queryClient.setQueryData(permissionKeys.all, reorderSnapshot.value)
      }

      pendingReorderUpdates.value = []
      isReorderQueued.value = false
      reorderSnapshot.value = null
      pfToast.error('权限排序更新失败', getErrorMessage(error))
    },
    onSuccess: () => {
      if (pendingReorderUpdates.value.length === 0) {
        reorderSnapshot.value = null
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.all })
    },
  })

  const commitPendingReorder = async () => {
    if (reorderMutation.isPending.value) return
    if (pendingReorderUpdates.value.length === 0) {
      isReorderQueued.value = false
      return
    }

    const updates = [...pendingReorderUpdates.value]
    pendingReorderUpdates.value = []
    isReorderQueued.value = false

    await reorderMutation.mutateAsync(updates)

    if (pendingReorderUpdates.value.length > 0) {
      await commitPendingReorder()
    }
  }

  const scheduleReorderCommit = useDebounceFn(() => {
    void commitPendingReorder()
  }, 600)

  const reorderTree = (treeData: PfTreeNode[]) => {
    if (isCreating.value) {
      queryClient.invalidateQueries({ queryKey: permissionKeys.all })
      pfToast.warning('请先保存或取消当前新建节点，再进行拖拽排序')
      return
    }

    const updates: PermissionSortUpdate[] = []
    collectTreeSortUpdates(treeData, null, updates)

    if (!hasSortChanges(updates)) return

    if (!reorderSnapshot.value) {
      reorderSnapshot.value = ensurePermissions().map((item) => ({ ...item }))
    }

    applySortUpdatesToCache(updates)
    pendingReorderUpdates.value = updates
    isReorderQueued.value = true
    scheduleReorderCommit()
  }

  const saveCurrent = async (values: Record<string, any>) => {
    if (formMode.value === 'create') {
      const payload = sanitizeCreatePayload(values)
      await createMutation.mutateAsync(payload)
      return
    }

    if (formMode.value === 'edit' && choosenId.value !== null) {
      const payload = sanitizeUpdatePayload(values)
      await updateMutation.mutateAsync({
        id: Number.parseInt(String(choosenId.value), 10),
        payload,
      })
    }
  }

  watch(
    choosenPermission,
    (permission) => {
      if (formMode.value === 'edit') {
        setEditingSnapshot(permission)
      }
    },
    { immediate: true },
  )

  return {
    allPermissionTree,
    choosenId,
    choosenPermission,
    isTreeLoading,
    isTreeError,
    treeError,
    choosenPath,
    formMode,
    isDirty,
    createDraftNode,
    selectNode,
    cancelEditing,
    markFormChanged,
    reorderTree,
    saveCurrent,
    canDragTree: computed(() => !isCreating.value && !createMutation.isPending.value),
    isReordering: computed(() => reorderMutation.isPending.value || isReorderQueued.value),
    isSaving: computed(() => createMutation.isPending.value || updateMutation.isPending.value),
  }
}
