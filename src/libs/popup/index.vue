<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import type { VNode } from 'vue'
import { useScrollLock } from '@vueuse/core'

defineOptions({
  name: 'MPopup',
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
const scrollLockTarget = typeof document === 'undefined' ? null : document.body
const isScrollLocked = useScrollLock(scrollLockTarget)

watch(
  isOpen,
  (value) => {
    isScrollLocked.value = value
  },
  { immediate: true }
)

function close() {
  isOpen.value = false
}

function onBackdropClick() {
  if (props.closeOnBackdrop) {
    close()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (isOpen.value && props.closeOnEscape && event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  isScrollLocked.value = false
})
</script>

<template>
  <Teleport to="body">
    <Transition name="popup-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 bg-zinc-950/72 backdrop-blur-[2px]"
        aria-hidden="true"
        @click="onBackdropClick"
      />
    </Transition>

    <Transition name="popup-slide">
      <section
        v-if="isOpen"
        v-bind="$attrs"
        class="fixed inset-x-0 bottom-0 z-50 w-full rounded-t-[20px] bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <slot />
      </section>
    </Transition>
  </Teleport>
</template>

<style scoped>
.popup-fade-enter-active,
.popup-fade-leave-active,
.popup-slide-enter-active,
.popup-slide-leave-active {
  transition:
    transform 220ms ease,
    opacity 220ms ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}

.popup-slide-enter-from,
.popup-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .popup-fade-enter-active,
  .popup-fade-leave-active,
  .popup-slide-enter-active,
  .popup-slide-leave-active {
    transition-duration: 1ms;
  }
}
</style>
