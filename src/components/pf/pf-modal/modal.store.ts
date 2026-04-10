import { reactive } from 'vue'

export interface PfModalOpenOptions {
  title?: string
  description?: string
  positiveText?: string
  negativeText?: string
  onPositive?: () => void | Promise<void>
  onNegative?: () => void | Promise<void>
}

export interface PfModalRecord extends PfModalOpenOptions {
  id: number
  open: boolean
  positiveLoading: boolean
  resolve: (value: boolean) => void
}

const modalState = reactive({
  modals: [] as PfModalRecord[],
  seed: 0,
})

const findModal = (id: number) => {
  return modalState.modals.find((item) => item.id === id)
}

export const openModal = (options: PfModalOpenOptions = {}) => {
  return new Promise<boolean>((resolve) => {
    const id = ++modalState.seed
    modalState.modals.push({
      id,
      open: true,
      positiveLoading: false,
      resolve,
      ...options,
    })
  })
}

export const setModalOpen = (id: number, open: boolean) => {
  const modal = findModal(id)
  if (!modal) {
    return
  }
  modal.open = open
}

export const resolveModal = (id: number, result: boolean) => {
  const modal = findModal(id)
  if (!modal) {
    return
  }

  modal.resolve(result)
  const index = modalState.modals.findIndex((item) => item.id === id)
  if (index !== -1) {
    modalState.modals.splice(index, 1)
  }
}

export const runModalPositive = async (id: number) => {
  const modal = findModal(id)
  if (!modal) {
    return
  }

  try {
    modal.positiveLoading = true
    await modal.onPositive?.()
    resolveModal(id, true)
  } finally {
    const latest = findModal(id)
    if (latest) {
      latest.positiveLoading = false
    }
  }
}

export const runModalNegative = async (id: number) => {
  const modal = findModal(id)
  if (!modal) {
    return
  }

  await modal.onNegative?.()
  resolveModal(id, false)
}

export const closeAllModals = () => {
  const closing = [...modalState.modals]
  modalState.modals = []
  closing.forEach((item) => item.resolve(false))
}

export const useModalState = () => {
  return modalState
}
