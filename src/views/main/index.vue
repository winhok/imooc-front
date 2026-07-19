<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import NavigationBar from './components/navigation/index.vue'
import PexelsList from './components/list/index.vue'

defineOptions({ name: 'MainView' })

const route = useRoute()
const isPinsOpen = computed(() => route.name === 'pins')
</script>

<template>
  <div
    class="min-h-full bg-zinc-50 transition-colors duration-300 motion-reduce:transition-none dark:bg-zinc-950"
  >
    <div :inert="isPinsOpen || undefined" :aria-hidden="isPinsOpen || undefined">
      <NavigationBar />
      <div class="mx-auto w-full max-w-[1600px] px-[12px] pt-[12px] xl:px-[32px] xl:pt-[24px]">
        <PexelsList />
      </div>
    </div>

    <Teleport to="body">
      <RouterView v-slot="{ Component, route }">
        <Transition name="pins-route">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
    </Teleport>
  </div>
</template>

<style scoped>
:global(.pins-route-enter-active),
:global(.pins-route-leave-active) {
  overflow: hidden;
  transform-origin: top left;
  will-change: transform, opacity, border-radius;
  transition:
    transform 380ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 280ms ease,
    border-radius 380ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

:global(.pins-route-enter-from),
:global(.pins-route-leave-to) {
  border-radius: 12px;
  opacity: 0;
  transform: translate3d(var(--pins-origin-x), var(--pins-origin-y), 0)
    scale(var(--pins-origin-scale-x), var(--pins-origin-scale-y));
}

@media (prefers-reduced-motion: reduce) {
  :global(.pins-route-enter-active),
  :global(.pins-route-leave-active) {
    transition-duration: 1ms;
  }
}
</style>
