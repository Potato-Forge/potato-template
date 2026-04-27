/**
 * v-permission 指令
 *
 * 用法：
 *   v-permission="'permission:edit'"
 *   v-permission="{ code: 'permission:delete', strategy: 'disable' }"
 *   v-permission="{ code: 'permission:delete', strategy: 'hide' }"
 *
 * strategy（可选，默认 'hide'）：
 *   'hide'    — 无权限时隐藏元素（display: none）
 *   'disable' — 无权限时禁用元素并添加提示（适合按钮）
 */

import type { Directive, DirectiveBinding } from 'vue'
import usePermissionStore from '@/store/permissionStore'

export type PermissionStrategy = 'hide' | 'disable'

export interface PermissionBinding {
  code: string
  strategy?: PermissionStrategy
  /** 禁用状态时的 title/aria-label 提示，默认"暂无权限" */
  disabledTitle?: string
}

type PermissionValue = string | PermissionBinding

function applyPermission(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
  const store = usePermissionStore()

  const value = binding.value
  const code = typeof value === 'string' ? value : value?.code
  const strategy: PermissionStrategy =
    typeof value === 'string' ? 'hide' : (value?.strategy ?? 'hide')
  const disabledTitle =
    typeof value === 'object' ? (value?.disabledTitle ?? '暂无权限') : '暂无权限'

  const hasPerm = store.hasPermission(code)

  if (hasPerm) {
    // 恢复显示 / 启用
    el.style.removeProperty('display')
    if (el instanceof HTMLButtonElement || el.hasAttribute('disabled')) {
      el.removeAttribute('disabled')
      el.removeAttribute('aria-disabled')
      el.removeAttribute('title')
      el.style.removeProperty('pointer-events')
      el.style.removeProperty('opacity')
      el.style.removeProperty('cursor')
    }
  } else {
    if (strategy === 'hide') {
      el.style.display = 'none'
    } else {
      // disable 策略：视觉禁用，保留在 DOM 中
      el.setAttribute('disabled', 'true')
      el.setAttribute('aria-disabled', 'true')
      el.setAttribute('title', disabledTitle)
      el.style.setProperty('pointer-events', 'none')
      el.style.setProperty('opacity', '0.4')
      el.style.setProperty('cursor', 'not-allowed')
    }
  }
}

export const vPermission: Directive<HTMLElement, PermissionValue> = {
  mounted(el, binding) {
    applyPermission(el, binding)
  },
  updated(el, binding) {
    applyPermission(el, binding)
  },
}

export default vPermission
