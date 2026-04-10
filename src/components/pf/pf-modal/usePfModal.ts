import type { PfModalOpenOptions } from './modal.store'
import { closeAllModals, openModal } from './modal.store'

export const usePfModal = () => {
  const open = (options: PfModalOpenOptions = {}) => {
    return openModal(options)
  }

  const confirm = (options: PfModalOpenOptions = {}) => {
    return open(options)
  }

  const closeAll = () => {
    closeAllModals()
  }

  return {
    open,
    confirm,
    closeAll,
  }
}
