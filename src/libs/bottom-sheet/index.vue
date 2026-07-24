<script setup lang="ts">
import { nextTick, onBeforeUnmount, shallowRef, useTemplateRef, watch } from 'vue'
import type { VNode } from 'vue'
import { useEventListener } from '@vueuse/core'

import { useModalLayer } from '@/composables/useModalLayer'

defineOptions({
  name: 'MBottomSheet',
  inheritAttrs: false
})

const props = withDefaults(
  defineProps<{
    closeOnBackdrop?: boolean
    closeOnEscape?: boolean
  }>(),
  {
    closeOnBackdrop: true,
    closeOnEscape: true
  }
)

defineSlots<{
  default(): VNode[]
}>()

const isOpen = defineModel<boolean>({ required: true })
const panel = useTemplateRef<HTMLElement>('panel')
const previouslyFocused = shallowRef<HTMLElement>()
const { isTopLayer } = useModalLayer(isOpen)

function close() {
  isOpen.value = false
}

function onBackdropClick() {
  if (props.closeOnBackdrop) {
    close()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (!isOpen.value || !isTopLayer.value) {
    return
  }

  if (props.closeOnEscape && event.key === 'Escape') {
    close()
    return
  }

  if (event.key !== 'Tab' || !panel.value) {
    return
  }

  const focusable = Array.from(
    panel.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    )
  )
  const first = focusable[0]
  const last = focusable.at(-1)

  if (!first || !last) {
    event.preventDefault()
    panel.value.focus()
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  isOpen,
  async (open) => {
    if (open) {
      previouslyFocused.value =
        document.activeElement instanceof HTMLElement ? document.activeElement : undefined
      await nextTick()
      panel.value?.focus()
    } else {
      previouslyFocused.value?.focus()
      previouslyFocused.value = undefined
    }
  },
  { immediate: true }
)

useEventListener(document, 'keydown', onKeydown)
onBeforeUnmount(() => previouslyFocused.value?.focus())
</script>

<template>
  <Teleport to="body">
    <Transition name="bottom-sheet-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 bg-zinc-950/72 backdrop-blur-[2px]"
        aria-hidden="true"
        @click="onBackdropClick"
      />
    </Transition>

    <Transition name="bottom-sheet-slide">
      <section
        v-if="isOpen"
        ref="panel"
        v-bind="$attrs"
        class="fixed inset-x-0 bottom-0 z-50 w-full rounded-t-[20px] bg-white shadow-2xl transition-colors dark:bg-zinc-900"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
      >
        <slot />
      </section>
    </Transition>
  </Teleport>
</template>

<style scoped>
.bottom-sheet-fade-enter-active,
.bottom-sheet-fade-leave-active,
.bottom-sheet-slide-enter-active,
.bottom-sheet-slide-leave-active {
  transition:
    transform 220ms ease,
    opacity 220ms ease;
}

.bottom-sheet-fade-enter-from,
.bottom-sheet-fade-leave-to {
  opacity: 0;
}

.bottom-sheet-slide-enter-from,
.bottom-sheet-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .bottom-sheet-fade-enter-active,
  .bottom-sheet-fade-leave-active,
  .bottom-sheet-slide-enter-active,
  .bottom-sheet-slide-leave-active {
    transition-duration: 1ms;
  }
}
</style>
