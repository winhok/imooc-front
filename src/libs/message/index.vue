<script setup lang="ts">
import { computed } from 'vue'

import SvgIcon from '@/libs/svg-icon/index.vue'

import type { MessageItem, MessageType } from './types'

defineOptions({ name: 'MessageHost' })

const props = defineProps<{
  messages: readonly MessageItem[]
}>()

const emit = defineEmits<{
  dismiss: [id: number]
}>()

const toneClasses: Record<MessageType, string> = {
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  warning:
    'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
  error:
    'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
  info: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200'
}

const visibleMessages = computed(() => props.messages)
</script>

<template>
  <div
    class="pointer-events-none fixed top-[20px] left-1/2 z-[1000000010] flex w-[min(calc(100vw-32px),440px)] -translate-x-1/2 flex-col gap-[10px]"
    aria-live="polite"
    aria-relevant="additions"
  >
    <TransitionGroup name="message-list">
      <div
        v-for="item in visibleMessages"
        :key="item.id"
        class="pointer-events-auto flex min-h-[48px] items-center gap-[10px] rounded-[12px] border px-[14px] py-[10px] text-sm shadow-lg backdrop-blur-sm"
        :class="toneClasses[item.type]"
        :role="item.type === 'error' ? 'alert' : 'status'"
      >
        <span class="size-[8px] shrink-0 rounded-full bg-current opacity-70" aria-hidden="true" />
        <p class="min-w-0 flex-1 leading-relaxed">{{ item.content }}</p>
        <button
          type="button"
          class="grid size-[28px] shrink-0 place-items-center rounded-[8px] opacity-70 transition-colors hover:bg-black/5 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none motion-reduce:transition-none dark:hover:bg-white/10"
          :aria-label="`关闭消息：${item.content}`"
          @click="emit('dismiss', item.id)"
        >
          <SvgIcon name="close" :size="14" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.message-list-enter-active,
.message-list-leave-active,
.message-list-move {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.message-list-enter-from,
.message-list-leave-to {
  transform: translateY(-16px) scale(0.98);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .message-list-enter-active,
  .message-list-leave-active,
  .message-list-move {
    transition-duration: 1ms;
  }
}
</style>
