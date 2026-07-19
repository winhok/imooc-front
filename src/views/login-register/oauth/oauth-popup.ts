import type { OAuthIdentity } from '@/api/auth'

export const OAUTH_POPUP_MESSAGE = 'imooc-front:oauth-popup'

const OAUTH_POPUP_CHANNEL = 'imooc-front:oauth-popup-channel'
const OAUTH_POPUP_STORAGE_KEY = 'imooc-front:oauth-popup-message'

export type OAuthPopupMessage =
  | {
      type: typeof OAUTH_POPUP_MESSAGE
      provider: 'QQ'
      identity: Extract<OAuthIdentity, { provider: 'QQ' }>
    }
  | {
      type: typeof OAUTH_POPUP_MESSAGE
      provider: 'WX'
      code: string
      state: string
    }

export function sendOAuthPopupMessage(message: OAuthPopupMessage) {
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(OAUTH_POPUP_CHANNEL)
    channel.postMessage(message)
    channel.close()
    return true
  }

  try {
    localStorage.setItem(OAUTH_POPUP_STORAGE_KEY, JSON.stringify(message))
    localStorage.removeItem(OAUTH_POPUP_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

export function listenForOAuthPopupMessage(listener: (message: OAuthPopupMessage) => void) {
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(OAUTH_POPUP_CHANNEL)
    channel.onmessage = (event: MessageEvent<unknown>) => {
      if (isOAuthPopupMessage(event.data)) {
        listener(event.data)
      }
    }

    return () => channel.close()
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key !== OAUTH_POPUP_STORAGE_KEY || !event.newValue) {
      return
    }

    try {
      const message: unknown = JSON.parse(event.newValue)

      if (isOAuthPopupMessage(message)) {
        listener(message)
      }
    } catch {
      return
    }
  }

  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}

export function isOAuthPopupMessage(value: unknown): value is OAuthPopupMessage {
  if (!value || typeof value !== 'object') {
    return false
  }

  const message = value as Partial<OAuthPopupMessage>

  if (message.type !== OAUTH_POPUP_MESSAGE) {
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
