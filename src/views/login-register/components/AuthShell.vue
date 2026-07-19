<script setup lang="ts">
import { useId } from 'vue'
import type { VNode } from 'vue'

defineOptions({ name: 'AuthShell' })

interface Props {
  title: string
  description: string
}

defineProps<Props>()

const titleId = useId()

defineSlots<{
  default(): VNode[]
  footer(): VNode[]
}>()
</script>

<template>
  <main
    class="relative grid min-h-[100dvh] place-items-center overflow-hidden bg-zinc-100 px-[16px] py-[32px] dark:bg-zinc-950"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(239,68,68,0.12),transparent_34%),radial-gradient(circle_at_85%_80%,rgba(244,63,94,0.1),transparent_30%)]"
      aria-hidden="true"
    />

    <section class="relative w-full max-w-[420px]" :aria-labelledby="titleId">
      <RouterLink
        to="/"
        class="mx-auto mb-[24px] flex w-fit items-center gap-[9px] rounded-[10px] px-[8px] py-[5px] text-zinc-900 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:text-white"
        aria-label="返回首页"
      >
        <span
          class="grid size-[36px] place-items-center rounded-[10px] bg-red-500 text-sm font-bold text-white"
          >M</span
        >
        <span class="text-base font-bold tracking-[0.04em]">MATERIAL</span>
      </RouterLink>

      <div
        class="rounded-[18px] border border-white/70 bg-white/95 p-[22px] shadow-[0_20px_70px_rgba(24,24,27,0.12)] backdrop-blur md:p-[30px] dark:border-zinc-800 dark:bg-zinc-900/95 dark:shadow-black/30"
      >
        <header class="mb-[24px] text-center">
          <h1 :id="titleId" class="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            {{ title }}
          </h1>
          <p class="mt-[7px] text-sm text-zinc-500 dark:text-zinc-400">
            {{ description }}
          </p>
        </header>

        <slot />

        <footer
          class="mt-[20px] border-t border-zinc-100 pt-[18px] text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
        >
          <slot name="footer" />
        </footer>
      </div>
    </section>
  </main>
</template>
