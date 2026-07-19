<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { driver } from 'driver.js'
import type { Driver } from 'driver.js'
import 'driver.js/dist/driver.css'

import { message } from '@/libs/message'

import { guideSteps } from './steps'

defineOptions({ name: 'LayoutFloating' })

const guide = shallowRef<Driver>()

function startGuide() {
  guide.value?.drive()
}

function openFeedback(close: () => void) {
  close()
  message.info('反馈通道正在准备中，感谢你的关注')
}

onMounted(() => {
  guide.value = driver({
    steps: guideSteps,
    animate: true,
    smoothScroll: true,
    overlayOpacity: 0.68,
    stagePadding: 8,
    stageRadius: 12,
    popoverClass: 'imooc-tour-popover',
    showProgress: true,
    progressText: '第 {{current}} / {{total}} 步',
    nextBtnText: '下一步',
    prevBtnText: '上一步',
    doneBtnText: '完成',
    allowKeyboardControl: true,
    disableActiveInteraction: true
  })
})

onBeforeUnmount(() => guide.value?.destroy())
</script>

<template>
  <aside
    class="pointer-events-none fixed right-[24px] bottom-[24px] z-30 flex flex-col items-end gap-[10px]"
    aria-label="悬浮操作区"
  >
    <slot />

    <button
      type="button"
      class="pointer-events-auto grid size-[44px] place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-lg transition-[color,background-color,transform,box-shadow] hover:-translate-y-[2px] hover:text-red-500 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-red-400 dark:focus-visible:ring-offset-zinc-950"
      aria-label="开始功能引导"
      data-tour="guide"
      @click="startGuide"
    >
      <MSvgIcon name="guide" :size="21" />
    </button>

    <MPopover class="pointer-events-auto" placement="top-right">
      <template #reference="{ isOpen }">
        <button
          type="button"
          class="grid size-[44px] place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-lg transition-[color,background-color,transform,box-shadow] hover:-translate-y-[2px] hover:text-red-500 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-red-400 dark:focus-visible:ring-offset-zinc-950"
          aria-label="打开意见反馈"
          :aria-expanded="isOpen"
          data-tour="feedback"
        >
          <MSvgIcon name="feedback" :size="20" />
        </button>
      </template>

      <template #default="{ close }">
        <section class="w-[180px]" aria-label="意见反馈">
          <p class="px-[10px] pt-[4px] pb-[8px] text-xs text-zinc-500 dark:text-zinc-400">
            你的建议会帮助我们做得更好
          </p>
          <button
            type="button"
            class="flex w-full items-center gap-[10px] rounded-[8px] px-[10px] py-[9px] text-left text-sm text-zinc-800 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:text-zinc-200 dark:hover:bg-zinc-800"
            @click="openFeedback(close)"
          >
            <MSvgIcon name="feedback" :size="17" />
            <span>立即反馈</span>
          </button>
        </section>
      </template>
    </MPopover>
  </aside>
</template>

<style scoped>
:global(.driver-popover.imooc-tour-popover) {
  border: 1px solid #e4e4e7;
  border-radius: 14px;
  font-family: inherit;
  box-shadow: 0 18px 50px rgb(0 0 0 / 0.24);
}

:global(.driver-popover.imooc-tour-popover .driver-popover-title) {
  font-size: 16px;
  color: #18181b;
}

:global(.driver-popover.imooc-tour-popover .driver-popover-description) {
  color: #52525b;
}

:global(.driver-popover.imooc-tour-popover .driver-popover-next-btn),
:global(.driver-popover.imooc-tour-popover .driver-popover-prev-btn) {
  border-radius: 8px;
  padding: 7px 11px;
  text-shadow: none;
}

:global(.driver-popover.imooc-tour-popover .driver-popover-next-btn) {
  border-color: #ef4444;
  background: #ef4444;
  color: white;
}

:global(.dark .driver-popover.imooc-tour-popover) {
  border-color: #3f3f46;
  background: #18181b;
  color: #f4f4f5;
}

:global(.dark .driver-popover.imooc-tour-popover .driver-popover-title),
:global(.dark .driver-popover.imooc-tour-popover .driver-popover-description),
:global(.dark .driver-popover.imooc-tour-popover .driver-popover-progress-text) {
  color: #f4f4f5;
}

:global(.dark .driver-popover.imooc-tour-popover .driver-popover-arrow-side-left) {
  border-left-color: #18181b;
}

:global(.dark .driver-popover.imooc-tour-popover .driver-popover-arrow-side-right) {
  border-right-color: #18181b;
}

:global(.dark .driver-popover.imooc-tour-popover .driver-popover-arrow-side-top) {
  border-top-color: #18181b;
}

:global(.dark .driver-popover.imooc-tour-popover .driver-popover-arrow-side-bottom) {
  border-bottom-color: #18181b;
}

:global(.dark .driver-popover.imooc-tour-popover .driver-popover-prev-btn) {
  border-color: #52525b;
  background: #27272a;
  color: #e4e4e7;
}

@media (prefers-reduced-motion: reduce) {
  :global(.driver-fade .driver-overlay),
  :global(.driver-fade .driver-popover) {
    animation-duration: 1ms;
  }
}
</style>
