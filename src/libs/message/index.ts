import { h, reactive, render } from 'vue'

import MessageHost from './index.vue'
import type { MessageItem, MessageType } from './types'

const messages = reactive<MessageItem[]>([])
const dismissTimers = new Map<number, ReturnType<typeof setTimeout>>()

let nextId = 0
let hostContainer: HTMLDivElement | undefined

function dismiss(id: number) {
  const timer = dismissTimers.get(id)

  if (timer) {
    clearTimeout(timer)
    dismissTimers.delete(id)
  }

  const index = messages.findIndex((item) => item.id === id)

  if (index !== -1) {
    messages.splice(index, 1)
  }
}

function ensureHost() {
  if (hostContainer) {
    return
  }

  hostContainer = document.createElement('div')
  hostContainer.dataset.messageHost = ''
  document.body.appendChild(hostContainer)
  render(h(MessageHost, { messages, onDismiss: dismiss }), hostContainer)
}

function showMessage(type: MessageType, content: string, duration = 3000) {
  ensureHost()

  const id = ++nextId
  messages.push({ id, type, content })

  if (duration > 0) {
    dismissTimers.set(
      id,
      setTimeout(() => dismiss(id), duration)
    )
  }

  return () => dismiss(id)
}

type Message = typeof showMessage & {
  success: (content: string, duration?: number) => () => void
  warning: (content: string, duration?: number) => () => void
  error: (content: string, duration?: number) => () => void
  info: (content: string, duration?: number) => () => void
}

export const message = Object.assign(showMessage, {
  success: (content: string, duration?: number) => showMessage('success', content, duration),
  warning: (content: string, duration?: number) => showMessage('warning', content, duration),
  error: (content: string, duration?: number) => showMessage('error', content, duration),
  info: (content: string, duration?: number) => showMessage('info', content, duration)
}) as Message
