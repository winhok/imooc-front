<script setup lang="ts">
import type { VNode } from 'vue'

defineOptions({ name: 'MobileQuickNav' })

defineSlots<{
  default(): VNode[]
}>()
</script>

<template>
  <nav aria-label="移动端快捷导航">
    <div
      class="flex min-w-[220px] items-center justify-around rounded-full border border-white/70 bg-white/92 px-[8px] py-[7px] shadow-[0_14px_40px_rgba(24,24,27,0.22)] backdrop-blur-xl dark:border-zinc-700/80 dark:bg-zinc-900/92"
    >
      <slot />
    </div>
  </nav>
</template>
