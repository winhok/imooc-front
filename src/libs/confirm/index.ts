import { h, render } from 'vue'

import ConfirmDialog from './index.vue'

export interface ConfirmOptions {
  title?: string
  content: string
  cancelText?: string
  confirmText?: string
}

export function confirm(content: string): Promise<boolean>
export function confirm(options: ConfirmOptions): Promise<boolean>
export function confirm(optionsOrContent: ConfirmOptions | string) {
  const options =
    typeof optionsOrContent === 'string' ? { content: optionsOrContent } : optionsOrContent

  return new Promise<boolean>((resolve) => {
    const container = document.createElement('div')
    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : undefined
    let result: boolean | undefined

    function settle(value: boolean) {
      if (result === undefined) {
        result = value
        resolve(value)
      }
    }

    function cleanup() {
      render(null, container)
      container.remove()
      previouslyFocusedElement?.focus()
    }

    const vnode = h(ConfirmDialog, {
      ...options,
      onConfirm: () => settle(true),
      onCancel: () => settle(false),
      onClosed: cleanup
    })

    document.body.appendChild(container)
    render(vnode, container)
  })
}
