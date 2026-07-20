<script setup lang="ts">
import { RouterLink } from 'vue-router'

import HeaderMy from './header-my.vue'
import HeaderSearch from './header-search/index.vue'
import HeaderTheme from './header-theme.vue'

defineOptions({ name: 'DesktopHeader' })
</script>

<template>
  <header
    class="relative z-40 w-full border-b border-zinc-200 bg-white px-[20px] py-[10px] transition-colors duration-300 motion-reduce:transition-none dark:border-zinc-700 dark:bg-zinc-800"
  >
    <div class="flex h-full items-center">
      <RouterLink
        to="/"
        class="mr-[20px] shrink-0 rounded focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
        aria-label="返回首页"
        data-tour="home"
      >
        <img
          src="https://res.lgdsunday.club/my-avatar.jpg"
          alt=""
          class="h-[40px] w-auto cursor-pointer object-contain"
        />
      </RouterLink>

      <HeaderSearch class="mr-[10px] flex-1" data-tour="search" />
      <HeaderTheme class="mr-[10px]" data-tour="theme" />
      <HeaderMy data-tour="account" />
    </div>
  </header>
</template>
