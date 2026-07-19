import { computed } from 'vue'
import { usePreferredDark, useStorage } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'

import { THEME_DARK, THEME_LIGHT, THEME_STORAGE_KEY, THEME_SYSTEM } from '@/constants'
import type { ThemePreference } from '@/constants'

function isThemePreference(value: unknown): value is ThemePreference {
  return value === THEME_LIGHT || value === THEME_DARK || value === THEME_SYSTEM
}

export const useThemeStore = defineStore('theme', () => {
  const themePreference = useStorage<ThemePreference>(THEME_STORAGE_KEY, THEME_SYSTEM)
  const systemPrefersDark = usePreferredDark()

  if (!isThemePreference(themePreference.value)) {
    themePreference.value = THEME_SYSTEM
  }

  const resolvedTheme = computed(() => {
    if (themePreference.value === THEME_SYSTEM) {
      return systemPrefersDark.value ? THEME_DARK : THEME_LIGHT
    }

    return themePreference.value
  })

  function setThemePreference(preference: ThemePreference) {
    themePreference.value = preference
  }

  return {
    themePreference,
    resolvedTheme,
    setThemePreference
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useThemeStore, import.meta.hot))
}
