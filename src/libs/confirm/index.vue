<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, shallowRef, useId, useTemplateRef } from 'vue'
import { useEventListener, useScrollLock } from '@vueuse/core'

defineOptions({ name: 'MConfirmDialog' })

interface Props {
  title?: string
  content: string
  cancelText?: string
  confirmText?: string
}

withDefaults(defineProps<Props>(), {
  title: '',
  cancelText: '取消',
  confirmText: '确定'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
  closed: []
}>()

const isVisible = shallowRef(false)
const panel = useTemplateRef<HTMLElement>('panel')
const confirmButton = useTemplateRef<HTMLButtonElement>('confirmButton')
const isBodyLocked = useScrollLock(document.body)
const previouslyFocusedElement = shallowRef<HTMLElement>()
const titleId = `confirm-title-${useId()}`
const contentId = `confirm-content-${useId()}`
let hasReleasedFocus = false

function close() {
  isVisible.value = false
}

function cancel() {
  emit('cancel')
  close()
}

function confirm() {
  emit('confirm')
  close()
}

useEventListener(document, 'keydown', (event) => {
  if (event.key === 'Escape' && isVisible.value) {
    cancel()
    return
  }

  if (event.key !== 'Tab' || !isVisible.value) {
    return
  }

  const focusableElements = panel.value?.querySelectorAll<HTMLElement>('button:not([disabled])')
  const firstElement = focusableElements?.item(0)
  const lastElement = focusableElements?.item((focusableElements?.length ?? 1) - 1)

  if (!firstElement || !lastElement) {
    return
  }

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
})

onMounted(async () => {
  previouslyFocusedElement.value =
    document.activeElement instanceof HTMLElement ? document.activeElement : undefined
  isBodyLocked.value = true
  isVisible.value = true
  await nextTick()
  confirmButton.value?.focus()
})

function releaseResources() {
  isBodyLocked.value = false

  if (!hasReleasedFocus) {
    hasReleasedFocus = true
    previouslyFocusedElement.value?.focus()
    previouslyFocusedElement.value = undefined
  }
}

function onAfterLeave() {
  releaseResources()
  emit('closed')
}

onBeforeUnmount(releaseResources)
</script>

<template>
  <div class="fixed inset-0 z-50" role="presentation">
    <Transition name="confirm-backdrop">
      <button
        v-if="isVisible"
        type="button"
        class="absolute inset-0 size-full cursor-default bg-zinc-950/70 backdrop-blur-[2px]"
        aria-label="取消并关闭确认框"
        @click="cancel"
      />
    </Transition>

    <Transition name="confirm-panel" @after-leave="onAfterLeave">
      <section
        v-if="isVisible"
        ref="panel"
        class="absolute top-1/2 left-1/2 w-[min(88vw,480px)] -translate-x-1/2 -translate-y-1/2 rounded-[18px] border border-zinc-200 bg-white p-[24px] text-zinc-950 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        role="alertdialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="contentId"
      >
        <h2 :id="titleId" class="text-base font-bold">
          {{ title || '请确认' }}
        </h2>
        <p
          :id="contentId"
          class="mt-[10px] text-sm leading-relaxed text-zinc-600 dark:text-zinc-300"
        >
          {{ content }}
        </p>

        <div class="mt-[24px] flex justify-end gap-[10px]">
          <button
            type="button"
            class="h-[38px] rounded-[10px] bg-zinc-100 px-[18px] text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none motion-reduce:transition-none dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            @click="cancel"
          >
            {{ cancelText }}
          </button>
          <button
            ref="confirmButton"
            type="button"
            class="h-[38px] rounded-[10px] bg-red-500 px-[18px] text-sm font-medium text-white transition-colors hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none dark:focus-visible:ring-offset-zinc-900"
            @click="confirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </section>
    </Transition>
  </div>
</template>

<style scoped>
.confirm-backdrop-enter-active,
.confirm-backdrop-leave-active,
.confirm-panel-enter-active,
.confirm-panel-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.confirm-backdrop-enter-from,
.confirm-backdrop-leave-to,
.confirm-panel-enter-from,
.confirm-panel-leave-to {
  opacity: 0;
}

.confirm-panel-enter-from,
.confirm-panel-leave-to {
  transform: translate(-50%, calc(-50% + 16px)) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .confirm-backdrop-enter-active,
  .confirm-backdrop-leave-active,
  .confirm-panel-enter-active,
  .confirm-panel-leave-active {
    transition-duration: 1ms;
  }
}
</style>
