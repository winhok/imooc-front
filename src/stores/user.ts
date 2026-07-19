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

  const isAuthenticated = computed(() => token.value.length > 0)

  function clearSession() {
    token.value = ''
    profile.value = null
    pendingOAuthRegistration.value = null
  }

  async function loadProfile(signal?: AbortSignal) {
    if (!token.value || isProfileLoading.value) {
      return profile.value
    }

    isProfileLoading.value = true

    try {
      const data = await getUserProfile(signal)
      profile.value = data
      return data
    } finally {
      isProfileLoading.value = false
    }
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

    token.value = data.token
    pendingOAuthRegistration.value = null
    await loadProfile()
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

    token.value = data.token
    pendingOAuthRegistration.value = null
    await loadProfile()

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
    await updateUserProfile(nextProfile)
    profile.value = nextProfile
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
