import { createVNode, render, type App } from 'vue'
import PfModalProvider from './PfModalProvider.vue'

export { default as PfModal } from './PfModal.vue'
export { default as PfModalProvider } from './PfModalProvider.vue'
export { usePfModal } from './usePfModal'

let mounted = false

const mountProvider = () => {
  if (mounted || typeof document === 'undefined') {
    return
  }

  const el = document.createElement('div')
  el.id = 'pf-modal-provider-root'
  document.body.appendChild(el)

  const vnode = createVNode(PfModalProvider)
  render(vnode, el)
  mounted = true
}

export const pfModalPlugin = (app: App) => {
  app.component('PfModalProvider', PfModalProvider)
  mountProvider()
}
