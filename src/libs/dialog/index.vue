<script setup lang="ts">
import { nextTick, onBeforeUnmount, shallowRef, useId, useTemplateRef, watch } from 'vue'
import type { VNode } from 'vue'
import { useEventListener, useScrollLock } from '@vueuse/core'

defineOptions({ name: 'MDialog' })

const props = withDefaults(
  defineProps<{
    title?: string
    closeOnBackdrop?: boolean
    closeOnEscape?: boolean
  }>(),
  {
    title: '',
    closeOnBackdrop: true,
    closeOnEscape: true
  }
)

defineSlots<{
  default(): VNode[]
}>()

const isOpen = defineModel<boolean>({ required: true })
const panel = useTemplateRef<HTMLElement>('panel')
const titleId = `dialog-title-${useId()}`
const isBodyLocked = useScrollLock(document.body)
const previouslyFocused = shallowRef<HTMLElement>()

function close() {
  isOpen.value = false
}

function onBackdropClick() {
  if (props.closeOnBackdrop) {
    close()
  }
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (!isOpen.value) {
    return
  }

  if (event.key === 'Escape' && props.closeOnEscape) {
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
    isBodyLocked.value = open

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

useEventListener(document, 'keydown', onDocumentKeydown)

onBeforeUnmount(() => {
  isBodyLocked.value = false
})
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <button
        v-if="isOpen"
        type="button"
        class="fixed inset-0 z-40 size-full cursor-default bg-zinc-950/72 backdrop-blur-[2px]"
        aria-label="关闭对话框"
        @click="onBackdropClick"
      />
    </Transition>

    <Transition name="dialog-panel">
      <section
        v-if="isOpen"
        ref="panel"
        class="fixed top-1/2 left-1/2 z-50 max-h-[88dvh] w-[min(92vw,760px)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-[18px] border border-zinc-200 bg-white p-[20px] text-zinc-950 shadow-2xl outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? titleId : undefined"
        tabindex="-1"
      >
        <header v-if="title" class="mb-[16px] flex items-center justify-between gap-[16px]">
          <h2 :id="titleId" class="text-base font-semibold">{{ title }}</h2>
          <button
            type="button"
            class="grid size-[34px] place-items-center rounded-[9px] text-zinc-500 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:hover:bg-zinc-800"
            aria-label="关闭对话框"
            @click="close"
          >
            <MSvgIcon name="close" :size="16" />
          </button>
        </header>
        <slot />
      </section>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-fade-enter-active,
.dialog-fade-leave-active,
.dialog-panel-enter-active,
.dialog-panel-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to,
.dialog-panel-enter-from,
.dialog-panel-leave-to {
  opacity: 0;
}

.dialog-panel-enter-from,
.dialog-panel-leave-to {
  transform: translate(-50%, calc(-50% + 16px)) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .dialog-fade-enter-active,
  .dialog-fade-leave-active,
  .dialog-panel-enter-active,
  .dialog-panel-leave-active {
    transition-duration: 1ms;
  }
}
</style>
