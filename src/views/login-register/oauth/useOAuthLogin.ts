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

const QQ_LOGIN_URL =
  'https://graph.qq.com/oauth2.0/authorize?client_id=101998494&response_type=token&scope=all&redirect_uri=https%3A%2F%2Fimooc-front.lgdsunday.club%2Flogin'

const providerNames: Record<OAuthButtonProvider, string> = {
  qq: 'QQ',
  wechat: '微信'
}

function getQQAccessToken() {
  return new URLSearchParams(window.location.hash.slice(1)).get('access_token') || ''
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

    const stopListening = listenForOAuthPopupMessage((message) => {
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

  function initializeQQCallback() {
    if (typeof QC === 'undefined') {
      return
    }

    QC.Login({ btnId: 'qqLoginButton' }, (data) => {
      const accessToken = getQQAccessToken()

      if (!accessToken) {
        return
      }

      QC.Login.signOut()

      const identity = {
        provider: 'QQ',
        data: {
          nickname: data.nickname,
          figureurl_qq_2: data.figureurl_qq_2,
          accessToken
        }
      } satisfies Extract<OAuthIdentity, { provider: 'QQ' }>

      const wasSent = sendOAuthPopupMessage({
        type: OAUTH_POPUP_MESSAGE,
        provider: 'QQ',
        identity
      })

      if (wasSent && window.name === 'oauth2Login_10609') {
        closeCallbackWindow()
        return
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

    const wasSent = sendOAuthPopupMessage({
      type: OAUTH_POPUP_MESSAGE,
      provider: 'WX',
      code,
      state
    })

    if (wasSent && window.name === 'weChatLogin') {
      closeCallbackWindow()
    }
  }

  async function startQQLogin() {
    if (typeof QC === 'undefined') {
      throw new Error('QQ 登录服务加载失败，请刷新页面后重试')
    }

    const popup = window.open(
      QQ_LOGIN_URL,
      'oauth2Login_10609',
      'height=525,width=585,toolbar=no,menubar=no,scrollbars=no,status=no,location=yes,resizable=yes'
    )

    if (!popup) {
      throw new Error('浏览器阻止了登录窗口，请允许弹窗后重试')
    }

    const callback = await waitForPopup(
      popup,
      (result) => result.provider === 'QQ',
      controller.signal
    )

    if (callback.provider === 'QQ') {
      await finishOAuthLogin(callback.identity)
    }
  }

  async function startWeChatLogin() {
    const popup = window.open(
      'about:blank',
      'weChatLogin',
      'height=525,width=585,toolbar=no,menubar=no,scrollbars=no,status=no,location=yes,resizable=yes'
    )

    if (!popup) {
      throw new Error('浏览器阻止了登录窗口，请允许弹窗后重试')
    }

    try {
      const loginData = await getWeChatLoginData()
      const callbackPromise = waitForPopup(
        popup,
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

    try {
      if (provider === 'qq') {
        await startQQLogin()
      } else {
        await startWeChatLogin()
      }
    } catch (error) {
      errorMessage.value =
        error instanceof Error ? error.message : `${providerNames[provider]}登录失败`
    } finally {
      activeProvider.value = undefined
    }
  }

  onMounted(() => {
    initializeQQCallback()
    initializeWeChatCallback()
  })

  onScopeDispose(() => controller.abort(new Error('登录页面已离开')))

  return {
    activeProvider: readonly(activeProvider),
    errorMessage: readonly(errorMessage),
    startOAuthLogin
  }
}
