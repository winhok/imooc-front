<script setup lang="ts">
import { watch } from 'vue'
import { RouterView } from 'vue-router'
import { storeToRefs } from 'pinia'

import { THEME_DARK } from '@/constants'
import { useThemeStore } from '@/stores'

const themeStore = useThemeStore()
const { resolvedTheme } = storeToRefs(themeStore)

watch(
  resolvedTheme,
  (theme) => {
    document.documentElement.classList.toggle(THEME_DARK, theme === THEME_DARK)
  },
  { immediate: true, flush: 'sync' }
)
</script>

<template>
  <RouterView />
</template>
