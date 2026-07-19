import { computed, shallowRef } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

import {
  getUserProfile,
  loginUser,
  registerUser,
  type LoginCredentials,
  type UserProfile
} from '@/api/auth'
import { LOGIN_TYPE_USERNAME, USER_TOKEN_STORAGE_KEY } from '@/constants'
import { encodeLegacyPassword } from '@/utils/legacy-password'

export const useUserStore = defineStore('user', () => {
  const token = useStorage(USER_TOKEN_STORAGE_KEY, '')
  const profile = shallowRef<UserProfile | null>(null)
  const isProfileLoading = shallowRef(false)
  const hasInitialized = shallowRef(false)

  const isAuthenticated = computed(() => token.value.length > 0)

  function clearSession() {
    token.value = ''
    profile.value = null
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

    token.value = data.token
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

  async function initialize() {
    if (hasInitialized.value) {
      return
    }

    hasInitialized.value = true

    if (token.value) {
      await loadProfile()
    }
  }

  return {
    token,
    profile,
    isProfileLoading,
    isAuthenticated,
    clearSession,
    loadProfile,
    login,
    register,
    initialize
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
