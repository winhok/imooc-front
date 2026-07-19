<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { THEME_DARK, THEME_LIGHT, THEME_SYSTEM } from '@/constants'
import type { ThemePreference } from '@/constants'
import { useThemeStore } from '@/stores'

defineOptions({ name: 'HeaderTheme' })

interface ThemeOption {
  type: ThemePreference
  icon: string
  name: string
}

const themeOptionByPreference = {
  [THEME_LIGHT]: { type: THEME_LIGHT, icon: 'theme-light', name: '极简白' },
  [THEME_DARK]: { type: THEME_DARK, icon: 'theme-dark', name: '极夜黑' },
  [THEME_SYSTEM]: { type: THEME_SYSTEM, icon: 'theme-system', name: '跟随系统' }
} satisfies Record<ThemePreference, ThemeOption>

const themeOptions = Object.values(themeOptionByPreference)
const themeStore = useThemeStore()
const { themePreference } = storeToRefs(themeStore)
const activeThemeOption = computed(() => themeOptionByPreference[themePreference.value])

function selectTheme(preference: ThemePreference, close: () => void) {
  themeStore.setThemePreference(preference)
  close()
}
</script>

<template>
  <MPopover placement="bottom-right">
    <template #reference="{ isOpen }">
      <button
        type="button"
        class="grid size-[40px] place-items-center rounded-[10px] text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:text-zinc-300 dark:hover:bg-zinc-800"
        :aria-label="`当前主题：${activeThemeOption.name}，查看主题选项`"
        :aria-expanded="isOpen"
      >
        <MSvgIcon :name="activeThemeOption.icon" :size="20" />
      </button>
    </template>

    <template #default="{ close }">
      <section class="w-[168px]" aria-label="主题选项">
        <p class="px-[10px] pt-[4px] pb-[6px] text-xs font-medium text-zinc-400 dark:text-zinc-500">
          主题模式
        </p>
        <ul>
          <li v-for="item in themeOptions" :key="item.type">
            <button
              type="button"
              class="flex w-full items-center gap-[10px] rounded-[8px] px-[10px] py-[9px] text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
              :class="
                themePreference === item.type
                  ? 'bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50'
                  : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
              "
              :aria-pressed="themePreference === item.type"
              @click="selectTheme(item.type, close)"
            >
              <MSvgIcon :name="item.icon" :size="17" />
              <span>{{ item.name }}</span>
            </button>
          </li>
        </ul>
      </section>
    </template>
  </MPopover>
</template>
