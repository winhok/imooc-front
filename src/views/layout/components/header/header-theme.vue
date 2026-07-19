<script setup lang="ts">
import { THEME_DARK, THEME_LIGHT, THEME_SYSTEM } from '@/constants'
import type { ThemePreference } from '@/constants'

defineOptions({ name: 'HeaderTheme' })

interface ThemeOption {
  type: ThemePreference
  icon: string
  name: string
}

const themeOptions = [
  { type: THEME_LIGHT, icon: 'theme-light', name: '极简白' },
  { type: THEME_DARK, icon: 'theme-dark', name: '极夜黑' },
  { type: THEME_SYSTEM, icon: 'theme-system', name: '跟随系统' }
] satisfies readonly ThemeOption[]
</script>

<template>
  <MPopover placement="bottom-right">
    <template #reference="{ isOpen }">
      <button
        type="button"
        class="grid size-[40px] place-items-center rounded-[10px] text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
        aria-label="查看主题选项"
        :aria-expanded="isOpen"
      >
        <MSvgIcon name="theme-light" :size="20" />
      </button>
    </template>

    <section class="w-[168px]" aria-label="主题选项">
      <p class="px-[10px] pt-[4px] pb-[6px] text-xs font-medium text-zinc-400">主题模式</p>
      <ul>
        <li
          v-for="item in themeOptions"
          :key="item.type"
          class="flex items-center gap-[10px] rounded-[8px] px-[10px] py-[9px] text-sm text-zinc-700"
        >
          <MSvgIcon :name="item.icon" :size="17" />
          <span>{{ item.name }}</span>
        </li>
      </ul>
      <p class="border-t border-zinc-100 px-[10px] pt-[8px] text-xs text-zinc-400">
        主题切换将在后续章节接入
      </p>
    </section>
  </MPopover>
</template>
