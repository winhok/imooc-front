<script setup lang="ts">
import { computed, onBeforeUnmount, useTemplateRef } from 'vue'
import type { VNode } from 'vue'
import { onClickOutside } from '@vueuse/core'

defineOptions({ name: 'MPopover' })

type PopoverPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

interface Props {
  placement?: PopoverPlacement
  openDelay?: number
  closeDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'bottom-left',
  openDelay: 0,
  closeDelay: 120
})

defineSlots<{
  reference(props: { isOpen: boolean }): VNode[]
  default(props: { close: () => void }): VNode[]
}>()

const isOpen = defineModel<boolean>({ default: false })
const root = useTemplateRef<HTMLElement>('root')
let openTimer: ReturnType<typeof setTimeout> | undefined
let closeTimer: ReturnType<typeof setTimeout> | undefined

const placementClasses: Record<PopoverPlacement, string> = {
  'top-left': 'bottom-[calc(100%+8px)] left-0 origin-bottom-left',
  'top-right': 'right-0 bottom-[calc(100%+8px)] origin-bottom-right',
  'bottom-left': 'top-[calc(100%+8px)] left-0 origin-top-left',
  'bottom-right': 'top-[calc(100%+8px)] right-0 origin-top-right'
}

const contentClass = computed(() => placementClasses[props.placement])

function clearTimers() {
  if (openTimer) {
    clearTimeout(openTimer)
    openTimer = undefined
  }

  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = undefined
  }
}

function open() {
  clearTimers()
  openTimer = setTimeout(() => {
    isOpen.value = true
    openTimer = undefined
  }, props.openDelay)
}

function close() {
  clearTimers()
  closeTimer = setTimeout(() => {
    isOpen.value = false
    closeTimer = undefined
  }, props.closeDelay)
}

function closeImmediately() {
  clearTimers()
  isOpen.value = false
}

function toggle() {
  clearTimers()
  isOpen.value = !isOpen.value
}

function onFocusOut(event: FocusEvent) {
  const nextTarget = event.relatedTarget

  if (nextTarget instanceof Node && root.value?.contains(nextTarget)) {
    return
  }

  close()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeImmediately()
  }
}

onClickOutside(root, closeImmediately)
onBeforeUnmount(clearTimers)
</script>

<template>
  <div
    ref="root"
    class="relative"
    @mouseenter="open"
    @mouseleave="close"
    @focusin="open"
    @focusout="onFocusOut"
    @keydown="onKeydown"
  >
    <div class="contents" data-popover-reference @click="toggle">
      <slot name="reference" :is-open="isOpen" />
    </div>

    <Transition name="popover">
      <div
        v-if="isOpen"
        class="absolute z-40 rounded-[12px] border border-zinc-200 bg-white p-[8px] text-zinc-900 shadow-xl"
        :class="contentClass"
        data-popover-content
      >
        <slot :close="closeImmediately" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.popover-enter-active,
.popover-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.popover-enter-from,
.popover-leave-to {
  transform: translateY(6px) scale(0.98);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .popover-enter-active,
  .popover-leave-active {
    transition-duration: 1ms;
  }
}
</style>
