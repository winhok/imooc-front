import type { OAuthIdentity } from '@/api/auth'

export const OAUTH_POPUP_MESSAGE = 'imooc-front:oauth-popup'

const OAUTH_POPUP_CHANNEL_PREFIX = 'imooc-front:oauth-popup-channel'
const OAUTH_POPUP_STORAGE_PREFIX = 'imooc-front:oauth-popup-message'

export type OAuthPopupMessage =
  | {
      type: typeof OAUTH_POPUP_MESSAGE
      attemptId: string
      messageId: string
      provider: 'QQ'
      identity: Extract<OAuthIdentity, { provider: 'QQ' }>
    }
  | {
      type: typeof OAUTH_POPUP_MESSAGE
      attemptId: string
      messageId: string
      provider: 'WX'
      code: string
      state: string
    }

export function sendOAuthPopupMessage(message: OAuthPopupMessage) {
  if (window.opener && !window.opener.closed) {
    window.opener.postMessage(message, window.location.origin)
    return true
  }

  const channelName = `${OAUTH_POPUP_CHANNEL_PREFIX}:${message.attemptId}`
  const storageKey = `${OAUTH_POPUP_STORAGE_PREFIX}:${message.attemptId}`

  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(channelName)
    channel.postMessage(message)
    channel.close()
    return true
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(message))
    localStorage.removeItem(storageKey)
    return true
  } catch {
    return false
  }
}

export function listenForOAuthPopupMessage(
  attemptId: string,
  popup: Window,
  listener: (message: OAuthPopupMessage) => void
) {
  const consumedMessageIds = new Set<string>()
  const channelName = `${OAUTH_POPUP_CHANNEL_PREFIX}:${attemptId}`
  const storageKey = `${OAUTH_POPUP_STORAGE_PREFIX}:${attemptId}`
  let channel: BroadcastChannel | undefined

  function consume(value: unknown) {
    if (
      !isOAuthPopupMessage(value) ||
      value.attemptId !== attemptId ||
      consumedMessageIds.has(value.messageId)
    ) {
      return
    }

    consumedMessageIds.add(value.messageId)
    listener(value)
  }

  const onWindowMessage = (event: MessageEvent<unknown>) => {
    if (event.origin === window.location.origin && event.source === popup) {
      consume(event.data)
    }
  }
  window.addEventListener('message', onWindowMessage)

  if (typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel(channelName)
    channel.onmessage = (event: MessageEvent<unknown>) => {
      consume(event.data)
    }
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKey || !event.newValue) {
      return
    }

    try {
      consume(JSON.parse(event.newValue))
    } catch {
      return
    }
  }

  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener('message', onWindowMessage)
    window.removeEventListener('storage', onStorage)
    channel?.close()
  }
}

export function isOAuthPopupMessage(value: unknown): value is OAuthPopupMessage {
  if (!value || typeof value !== 'object') {
    return false
  }

  const message = value as Partial<OAuthPopupMessage>

  if (
    message.type !== OAUTH_POPUP_MESSAGE ||
    typeof message.attemptId !== 'string' ||
    !message.attemptId ||
    typeof message.messageId !== 'string' ||
    !message.messageId
  ) {
    return false
  }

  if (message.provider === 'WX') {
    return typeof message.code === 'string' && typeof message.state === 'string'
  }

  if (message.provider !== 'QQ' || !message.identity || typeof message.identity !== 'object') {
    return false
  }

  const identity = message.identity as Partial<Extract<OAuthIdentity, { provider: 'QQ' }>>

  return (
    identity.provider === 'QQ' &&
    Boolean(identity.data) &&
    typeof identity.data?.nickname === 'string' &&
    typeof identity.data.figureurl_qq_2 === 'string' &&
    typeof identity.data.accessToken === 'string'
  )
}
