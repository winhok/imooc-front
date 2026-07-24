import { onMounted, onScopeDispose, readonly, shallowRef } from 'vue'
import type { Router } from 'vue-router'

import {
  getWeChatLoginData,
  getWeChatLoginToken,
  getWeChatUserInfo,
  type OAuthIdentity
} from '@/api/auth'
import { useCommands } from '@/libs/command'
import type { useUserStore } from '@/stores'

import {
  listenForOAuthPopupMessage,
  OAUTH_POPUP_MESSAGE,
  sendOAuthPopupMessage,
  type OAuthPopupMessage
} from './oauth-popup'

type OAuthButtonProvider = 'qq' | 'wechat'

interface UseOAuthLoginOptions {
  router: Router
  userStore: ReturnType<typeof useUserStore>
  getReturnTo: () => string
}

const QQ_SDK_URL = 'https://connect.qq.com/qc_jssdk.js'
const QQ_APP_ID = '101998494'
const QQ_REDIRECT_URI = 'https://imooc-front.lgdsunday.club/login'
const QQ_POPUP_PREFIX = 'oauth2Login_10609'
const WECHAT_POPUP_PREFIX = 'weChatLogin'
let qqSdkPromise: Promise<void> | undefined

const providerNames: Record<OAuthButtonProvider, string> = {
  qq: 'QQ',
  wechat: '微信'
}

function getQQAccessToken() {
  return new URLSearchParams(window.location.hash.slice(1)).get('access_token') || ''
}

function getQQCallbackState() {
  return new URLSearchParams(window.location.hash.slice(1)).get('state') || ''
}

function createAttemptId() {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${crypto.getRandomValues(new Uint32Array(2)).join('-')}`
}

function getAttemptId(prefix: string) {
  return window.name.startsWith(`${prefix}:`) ? window.name.slice(prefix.length + 1) : ''
}

function buildQQLoginUrl(attemptId: string) {
  const params = new URLSearchParams({
    client_id: QQ_APP_ID,
    response_type: 'token',
    scope: 'all',
    redirect_uri: QQ_REDIRECT_URI,
    state: attemptId
  })

  return `https://graph.qq.com/oauth2.0/authorize?${params.toString()}`
}

function loadQQSdk() {
  if (typeof QC !== 'undefined') {
    return Promise.resolve()
  }

  if (qqSdkPromise) {
    return qqSdkPromise
  }

  qqSdkPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${QQ_SDK_URL}"]`)
    const script = existing ?? document.createElement('script')

    function cleanup() {
      script.removeEventListener('load', onLoad)
      script.removeEventListener('error', onError)
    }

    function onLoad() {
      cleanup()
      resolve()
    }

    function onError() {
      cleanup()
      qqSdkPromise = undefined
      reject(new Error('QQ 登录服务加载失败，请稍后重试'))
    }

    script.addEventListener('load', onLoad, { once: true })
    script.addEventListener('error', onError, { once: true })

    if (!existing) {
      script.src = QQ_SDK_URL
      script.async = true
      script.charset = 'utf-8'
      script.dataset.appid = QQ_APP_ID
      script.dataset.redirecturi = QQ_REDIRECT_URI
      document.head.appendChild(script)
    }
  })

  return qqSdkPromise
}

function buildWeChatLoginUrl(data: Awaited<ReturnType<typeof getWeChatLoginData>>) {
  const params = new URLSearchParams({
    appid: data.appId,
    redirect_uri: data.redirectUri,
    response_type: 'code',
    scope: data.scope,
    state: data.state
  })

  return `https://open.weixin.qq.com/connect/qrconnect?${params.toString()}#wechat_redirect`
}

function waitForPopup(
  popup: Window,
  attemptId: string,
  accepts: (message: OAuthPopupMessage) => boolean,
  signal: AbortSignal
) {
  return new Promise<OAuthPopupMessage>((resolve, reject) => {
    const closedTimer = window.setInterval(() => {
      if (popup.closed) {
        finish(() => reject(new Error('登录窗口已关闭')))
      }
    }, 500)
    const timeoutTimer = window.setTimeout(
      () => finish(() => reject(new Error('登录已超时，请重试'))),
      10 * 60 * 1000
    )

    const stopListening = listenForOAuthPopupMessage(attemptId, popup, (message) => {
      if (accepts(message)) {
        finish(() => resolve(message))
      }
    })

    function cleanup() {
      window.clearInterval(closedTimer)
      window.clearTimeout(timeoutTimer)
      stopListening()
      signal.removeEventListener('abort', onAbort)
    }

    function finish(action: () => void) {
      cleanup()
      action()
    }

    function onAbort() {
      finish(() => reject(signal.reason))
    }

    signal.addEventListener('abort', onAbort, { once: true })
  })
}

function closeCallbackWindow() {
  window.close()
  window.setTimeout(() => window.location.replace('/'), 300)
}

export function useOAuthLogin(options: UseOAuthLoginOptions) {
  const { message } = useCommands()
  const activeProvider = shallowRef<OAuthButtonProvider>()
  const errorMessage = shallowRef('')
  const controller = new AbortController()

  async function finishOAuthLogin(identity: OAuthIdentity) {
    const result = await options.userStore.loginWithOAuth(identity)

    if (result === 'registration_required') {
      message.success(`欢迎 ${identity.data.nickname}，请创建本地账号`)
      await options.router.push({
        name: 'register',
        query: { oauth: identity.provider, redirect: options.getReturnTo() }
      })
      return
    }

    message.success(`欢迎回来，${identity.data.nickname}`)
    await options.router.replace(options.getReturnTo())
  }

  async function initializeQQCallback() {
    const accessToken = getQQAccessToken()

    if (!accessToken) {
      return
    }

    const callbackState = getQQCallbackState()
    const attemptId = getAttemptId(QQ_POPUP_PREFIX)
    await loadQQSdk()
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)

    if (callbackState && attemptId && callbackState !== attemptId) {
      throw new Error('QQ 登录状态校验失败，请重试')
    }

    if (typeof QC === 'undefined') {
      return
    }

    QC.Login({ btnId: 'qqLoginButton' }, (data) => {
      QC.Login.signOut()

      const identity = {
        provider: 'QQ',
        data: {
          nickname: data.nickname,
          figureurl_qq_2: data.figureurl_qq_2,
          accessToken
        }
      } satisfies Extract<OAuthIdentity, { provider: 'QQ' }>

      if (attemptId) {
        const wasSent = sendOAuthPopupMessage({
          type: OAUTH_POPUP_MESSAGE,
          attemptId,
          messageId: createAttemptId(),
          provider: 'QQ',
          identity
        })

        if (wasSent) {
          closeCallbackWindow()
          return
        }
      }

      void finishOAuthLogin(identity)
    })
  }

  function initializeWeChatCallback() {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')

    if (!code || !state) {
      return
    }

    const attemptId = getAttemptId(WECHAT_POPUP_PREFIX)
    window.history.replaceState(null, '', window.location.pathname)

    if (attemptId) {
      const wasSent = sendOAuthPopupMessage({
        type: OAUTH_POPUP_MESSAGE,
        attemptId,
        messageId: createAttemptId(),
        provider: 'WX',
        code,
        state
      })

      if (wasSent) {
        closeCallbackWindow()
      }
    }
  }

  async function startQQLogin(attemptId: string) {
    const popup = window.open(
      buildQQLoginUrl(attemptId),
      `${QQ_POPUP_PREFIX}:${attemptId}`,
      'height=525,width=585,toolbar=no,menubar=no,scrollbars=no,status=no,location=yes,resizable=yes'
    )

    if (!popup) {
      throw new Error('浏览器阻止了登录窗口，请允许弹窗后重试')
    }

    try {
      const callback = await waitForPopup(
        popup,
        attemptId,
        (result) => result.provider === 'QQ',
        controller.signal
      )

      if (callback.provider === 'QQ') {
        await finishOAuthLogin(callback.identity)
      }
    } catch (error) {
      popup.close()
      throw error
    }
  }

  async function startWeChatLogin(attemptId: string) {
    const popup = window.open(
      'about:blank',
      `${WECHAT_POPUP_PREFIX}:${attemptId}`,
      'height=525,width=585,toolbar=no,menubar=no,scrollbars=no,status=no,location=yes,resizable=yes'
    )

    if (!popup) {
      throw new Error('浏览器阻止了登录窗口，请允许弹窗后重试')
    }

    try {
      const loginData = await getWeChatLoginData()
      const callbackPromise = waitForPopup(
        popup,
        attemptId,
        (result) => result.provider === 'WX' && result.state === loginData.state,
        controller.signal
      )

      popup.location.replace(buildWeChatLoginUrl(loginData))

      const callback = await callbackPromise

      if (callback.provider !== 'WX') {
        return
      }

      const tokenData = await getWeChatLoginToken(
        loginData.appId,
        loginData.appSecret,
        callback.code
      )
      const userData = await getWeChatUserInfo(tokenData.access_token, tokenData.openid)

      await finishOAuthLogin({
        provider: 'WX',
        data: {
          openid: tokenData.openid,
          nickname: userData.nickname,
          headimgurl: userData.headimgurl
        }
      })
    } catch (error) {
      popup.close()
      throw error
    }
  }

  async function startOAuthLogin(provider: OAuthButtonProvider) {
    if (activeProvider.value) {
      return
    }

    activeProvider.value = provider
    errorMessage.value = ''
    const attemptId = createAttemptId()

    try {
      if (provider === 'qq') {
        await startQQLogin(attemptId)
      } else {
        await startWeChatLogin(attemptId)
      }
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : `${providerNames[provider]}登录失败`
    } finally {
      activeProvider.value = undefined
    }
  }

  onMounted(() => {
    initializeWeChatCallback()
    void initializeQQCallback().catch((error) => {
      errorMessage.value = error instanceof Error ? error.message : 'QQ登录失败'
    })

    if (!getQQAccessToken()) {
      void loadQQSdk().catch(() => {
        // The provider button remains available; the next callback page load
        // retries the SDK without blocking the rest of the login form.
      })
    }
  })

  onScopeDispose(() => controller.abort(new Error('登录页面已离开')))

  return {
    activeProvider: readonly(activeProvider),
    errorMessage: readonly(errorMessage),
    startOAuthLogin
  }
}
