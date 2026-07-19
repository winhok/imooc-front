<script setup lang="ts">
import type { VNode } from 'vue'

defineOptions({ name: 'MNavbar' })

interface Props {
  sticky?: boolean
  leftLabel?: string
  rightLabel?: string
}

withDefaults(defineProps<Props>(), {
  sticky: false,
  leftLabel: '返回',
  rightLabel: '更多操作'
})

defineEmits<{
  leftClick: []
  rightClick: []
}>()

defineSlots<{
  left(): VNode[]
  default(): VNode[]
  right(): VNode[]
}>()
</script>

<template>
  <header
    class="z-20 grid h-[56px] w-full grid-cols-[56px_minmax(0,1fr)_56px] items-center border-b border-zinc-200 bg-white/95 px-[4px] backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/95"
    :class="sticky ? 'sticky top-0' : 'relative'"
  >
    <button
      type="button"
      class="grid size-[44px] place-items-center rounded-[10px] text-zinc-800 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:text-zinc-100 dark:hover:bg-zinc-800"
      :aria-label="leftLabel"
      @click="$emit('leftClick')"
    >
      <slot name="left">
        <MSvgIcon name="back" :size="22" />
      </slot>
    </button>

    <div
      class="truncate px-[8px] text-center text-sm font-semibold text-zinc-900 dark:text-zinc-100"
    >
      <slot />
    </div>

    <button
      type="button"
      class="grid size-[44px] place-items-center rounded-[10px] text-zinc-800 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-0 dark:text-zinc-100 dark:hover:bg-zinc-800"
      :aria-label="rightLabel"
      :disabled="!$slots.right"
      @click="$emit('rightClick')"
    >
      <slot name="right" />
    </button>
  </header>
</template>
