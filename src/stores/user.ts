import { computed, shallowRef } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

import {
  getUserProfile,
  loginUser,
  registerUser,
  type LoginCredentials,
  type OAuthIdentity,
  type OAuthRegisterPayload,
  type UserProfile
} from '@/api/auth'
import { updateUserProfile } from '@/api/profile'
import {
  LOGIN_TYPE_OAUTH_NO_REGISTER_CODE,
  LOGIN_TYPE_USERNAME,
  USER_TOKEN_STORAGE_KEY
} from '@/constants'
import { encodeLegacyPassword } from '@/utils/legacy-password'

export const useUserStore = defineStore('user', () => {
  const token = useStorage(USER_TOKEN_STORAGE_KEY, '')
  const profile = shallowRef<UserProfile | null>(null)
  const pendingOAuthRegistration = shallowRef<OAuthIdentity | null>(null)
  const isProfileLoading = shallowRef(false)
  const hasInitialized = shallowRef(false)
  const sessionEpoch = shallowRef(0)
  let profileLoadPromise: Promise<UserProfile | null> | null = null

  const isAuthenticated = computed(() => token.value.length > 0 && profile.value !== null)

  function clearSession() {
    sessionEpoch.value += 1
    token.value = ''
    profile.value = null
    pendingOAuthRegistration.value = null
  }

  function commitSession(nextToken: string, nextProfile: UserProfile) {
    sessionEpoch.value += 1
    token.value = nextToken
    profile.value = nextProfile
    pendingOAuthRegistration.value = null
  }

  function loadProfile(signal?: AbortSignal): Promise<UserProfile | null> {
    if (!token.value) {
      return Promise.resolve(null)
    }

    if (profileLoadPromise) {
      return profileLoadPromise
    }

    const currentToken = token.value
    const currentEpoch = sessionEpoch.value
    isProfileLoading.value = true

    const request = getUserProfile(signal, currentToken)
      .then((data) => {
        if (sessionEpoch.value === currentEpoch && token.value === currentToken) {
          profile.value = data
        }

        return data
      })
      .finally(() => {
        if (profileLoadPromise === request) {
          profileLoadPromise = null
          isProfileLoading.value = false
        }
      })

    profileLoadPromise = request
    return request
  }

  async function login(credentials: LoginCredentials) {
    const username = credentials.username.trim()
    const data = await loginUser({
      username,
      password: encodeLegacyPassword(credentials.password),
      loginType: LOGIN_TYPE_USERNAME
    })

    if (!data.token) {
      throw new Error('登录接口未返回有效凭据')
    }

    const nextProfile = await getUserProfile(undefined, data.token)
    commitSession(data.token, nextProfile)
  }

  async function register(credentials: LoginCredentials) {
    const username = credentials.username.trim()

    await registerUser({
      username,
      password: encodeLegacyPassword(credentials.password)
    })

    await login({ username, password: credentials.password })
  }

  async function loginWithOAuth(identity: OAuthIdentity) {
    const data =
      identity.provider === 'QQ'
        ? await loginUser({ loginType: 'QQ', ...identity.data })
        : await loginUser({ loginType: 'WX', ...identity.data })

    if (data.code === LOGIN_TYPE_OAUTH_NO_REGISTER_CODE) {
      pendingOAuthRegistration.value = identity
      return 'registration_required' as const
    }

    if (!data.token) {
      throw new Error('登录接口未返回有效凭据')
    }

    const nextProfile = await getUserProfile(undefined, data.token)
    commitSession(data.token, nextProfile)

    return 'authenticated' as const
  }

  async function registerWithOAuth(identity: OAuthIdentity, credentials: LoginCredentials) {
    const payload = {
      username: credentials.username.trim(),
      password: encodeLegacyPassword(credentials.password),
      reqType: identity.provider,
      ...identity.data
    } as OAuthRegisterPayload

    await registerUser(payload)
    pendingOAuthRegistration.value = null
    await login(credentials)
  }

  async function initialize() {
    if (hasInitialized.value) {
      return
    }

    hasInitialized.value = true

    if (token.value) {
      await loadProfile()
    }
  }

  async function updateProfile(nextProfile: UserProfile) {
    const currentEpoch = sessionEpoch.value
    const currentToken = token.value
    await updateUserProfile(nextProfile)

    if (sessionEpoch.value === currentEpoch && token.value === currentToken) {
      profile.value = nextProfile
    }

    return nextProfile
  }

  return {
    token,
    profile,
    pendingOAuthRegistration,
    isProfileLoading,
    isAuthenticated,
    clearSession,
    loadProfile,
    login,
    register,
    loginWithOAuth,
    registerWithOAuth,
    updateProfile,
    initialize
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
