import {
  createPermission,
  getAllPermissions,
  permissionKeys,
  updatePermission,
  type Permission,
  type PermissionInsert,
  type PermissionUpdate,
} from '@/api/permission/permission'
import { flatToTree } from '@/utils/tree'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { usePfModal } from '@/components/pf/pf-modal'

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

  const getPermissionById = (id: string | number | null) => {
    if (id === null) return null
    return ensurePermissions().find((p) => String(p.id) === String(id)) || null
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
      sort: null,
      status: null,
      type: null,
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
    return {
      name: values.name || '',
      parent_id: values.parent_id ?? null,
      code: values.code || null,
      path: values.path || null,
      icon: values.icon || null,
      component: values.component || null,
      is_external: values.is_external ?? null,
      is_hidden: values.is_hidden ?? null,
      sort: values.sort ?? null,
      status: values.status ?? null,
      type: values.type || null,
    }
  }

  const sanitizeUpdatePayload = (values: Record<string, any>): PermissionUpdate => {
    return {
      name: values.name,
      parent_id: values.parent_id,
      code: values.code,
      path: values.path,
      icon: values.icon,
      component: values.component,
      is_external: values.is_external,
      is_hidden: values.is_hidden,
      sort: values.sort,
      status: values.status,
      type: values.type,
    }
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
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(permissionKeys.all, context.previous)
      }
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
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(permissionKeys.all, context.previous)
      }
    },
    onSuccess: (saved) => {
      queryClient.setQueryData<Permission[]>(permissionKeys.all, (old = []) =>
        old.map((item) => (item.id === saved.id ? saved : item)),
      )

      choosenId.value = saved.id
      isCreating.value = false
      isDirty.value = false
      setEditingSnapshot(saved)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: permissionKeys.all })
    },
  })

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
    saveCurrent,
    isSaving: computed(() => createMutation.isPending.value || updateMutation.isPending.value),
  }
}
