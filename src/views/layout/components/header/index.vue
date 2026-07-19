<script setup lang="ts">
import { RouterLink } from 'vue-router'

import HeaderMy from './header-my.vue'
import HeaderSearch from './header-search/index.vue'
import HeaderTheme from './header-theme.vue'

defineOptions({ name: 'DesktopHeader' })
</script>

<template>
  <header class="relative z-40 border-b border-zinc-200 bg-white px-[24px]">
    <div class="mx-auto flex h-full max-w-[1600px] items-center gap-[16px]">
      <RouterLink
        to="/"
        class="flex shrink-0 items-center gap-[10px] rounded-[8px] text-zinc-950 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-label="返回首页"
      >
        <span
          class="grid size-[38px] place-items-center rounded-[10px] bg-red-500 text-sm font-black text-white"
          aria-hidden="true"
        >
          M
        </span>
        <span class="text-base font-bold tracking-tight">慕课甄选</span>
      </RouterLink>

      <HeaderSearch class="mx-auto max-w-[720px] flex-1" />
      <HeaderTheme />
      <HeaderMy />
    </div>
  </header>
</template>
