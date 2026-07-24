import { inject, readonly, shallowReactive } from 'vue'
import type { InjectionKey, Plugin } from 'vue'

import type { MessageItem, MessageType } from '@/libs/message/types'

export interface ConfirmOptions {
  title?: string
  content: string
  cancelText?: string
  confirmText?: string
}

export interface ConfirmService {
  (content: string): Promise<boolean>
  (options: ConfirmOptions): Promise<boolean>
}

export interface MessageService {
  (type: MessageType, content: string, duration?: number): () => void
  success: (content: string, duration?: number) => () => void
  warning: (content: string, duration?: number) => () => void
  error: (content: string, duration?: number) => () => void
  info: (content: string, duration?: number) => () => void
}

export interface CommandService {
  confirm: ConfirmService
  message: MessageService
}

interface ConfirmRequest {
  id: number
  options: ConfirmOptions
}

interface ConfirmResolution {
  resolve: (value: boolean) => void
  settled: boolean
}

interface CommandState {
  confirmQueue: readonly ConfirmRequest[]
  messages: readonly MessageItem[]
}

export interface CommandController {
  state: CommandState
  service: CommandService
  settleConfirm: (id: number, value: boolean) => void
  finishConfirm: (id: number) => void
  dismissMessage: (id: number) => void
  setMessageHostReady: (isReady: boolean) => void
  dispose: () => void
}

const commandControllerKey: InjectionKey<CommandController> = Symbol('command-controller')

export function createCommandController(): CommandController {
  const confirmQueue = shallowReactive<ConfirmRequest[]>([])
  const confirmResolutions = new Map<number, ConfirmResolution>()
  const messages = shallowReactive<MessageItem[]>([])
  const dismissTimers = new Map<number, ReturnType<typeof setTimeout>>()
  const messageDurations = new Map<number, number>()
  let nextConfirmId = 0
  let nextMessageId = 0
  let isMessageHostReady = false
  let disposed = false

  const confirm = ((optionsOrContent: ConfirmOptions | string) => {
    if (disposed) {
      return Promise.resolve(false)
    }

    const options =
      typeof optionsOrContent === 'string' ? { content: optionsOrContent } : optionsOrContent
    const id = ++nextConfirmId

    return new Promise<boolean>((resolve) => {
      confirmResolutions.set(id, { resolve, settled: false })
      confirmQueue.push({ id, options })
    })
  }) as ConfirmService

  function settleConfirm(id: number, value: boolean) {
    if (confirmQueue[0]?.id !== id) {
      return
    }

    const resolution = confirmResolutions.get(id)

    if (!resolution || resolution.settled) {
      return
    }

    resolution.settled = true
    resolution.resolve(value)
  }

  function finishConfirm(id: number) {
    if (confirmQueue[0]?.id !== id) {
      return
    }

    const resolution = confirmResolutions.get(id)

    if (resolution && !resolution.settled) {
      resolution.settled = true
      resolution.resolve(false)
    }

    confirmResolutions.delete(id)
    confirmQueue.shift()
  }

  function dismissMessage(id: number) {
    const timer = dismissTimers.get(id)

    if (timer) {
      clearTimeout(timer)
      dismissTimers.delete(id)
    }

    const index = messages.findIndex((item) => item.id === id)

    if (index !== -1) {
      messages.splice(index, 1)
    }

    messageDurations.delete(id)
  }

  function scheduleMessageDismiss(id: number) {
    const duration = messageDurations.get(id)

    if (!isMessageHostReady || duration === undefined || duration <= 0) {
      return
    }

    dismissTimers.set(
      id,
      setTimeout(() => dismissMessage(id), duration)
    )
  }

  function setMessageHostReady(isReady: boolean) {
    isMessageHostReady = isReady

    if (!isReady) {
      for (const timer of dismissTimers.values()) {
        clearTimeout(timer)
      }

      dismissTimers.clear()
      return
    }

    for (const item of messages) {
      if (!dismissTimers.has(item.id)) {
        scheduleMessageDismiss(item.id)
      }
    }
  }

  function showMessage(type: MessageType, content: string, duration = 3000) {
    if (disposed) {
      return () => undefined
    }

    const id = ++nextMessageId
    messages.push({ id, type, content })

    if (duration > 0) {
      messageDurations.set(id, duration)
      scheduleMessageDismiss(id)
    }

    return () => dismissMessage(id)
  }

  const message = Object.assign(showMessage, {
    success: (content: string, duration?: number) => showMessage('success', content, duration),
    warning: (content: string, duration?: number) => showMessage('warning', content, duration),
    error: (content: string, duration?: number) => showMessage('error', content, duration),
    info: (content: string, duration?: number) => showMessage('info', content, duration)
  }) as MessageService

  const service: CommandService = Object.freeze({ confirm, message })

  function dispose() {
    if (disposed) {
      return
    }

    disposed = true

    for (const timer of dismissTimers.values()) {
      clearTimeout(timer)
    }

    dismissTimers.clear()
    messageDurations.clear()
    messages.splice(0)

    for (const request of confirmQueue) {
      const resolution = confirmResolutions.get(request.id)

      if (resolution && !resolution.settled) {
        resolution.settled = true
        resolution.resolve(false)
      }
    }

    confirmResolutions.clear()
    confirmQueue.splice(0)
  }

  return {
    state: {
      confirmQueue: readonly(confirmQueue),
      messages: readonly(messages)
    },
    service,
    settleConfirm,
    finishConfirm,
    dismissMessage,
    setMessageHostReady,
    dispose
  }
}

export function createCommandPlugin(controller: CommandController): Plugin {
  return {
    install(app) {
      app.provide(commandControllerKey, controller)
      app.onUnmount(controller.dispose)
    }
  }
}

function useCommandController() {
  const controller = inject(commandControllerKey)

  if (!controller) {
    throw new Error('Command system is not installed for this Vue application')
  }

  return controller
}

export function useCommands() {
  return useCommandController().service
}

export function useCommandHost() {
  return useCommandController()
}
