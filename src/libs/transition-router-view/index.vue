<script setup lang="ts">
import { computed } from 'vue'
import { RouterView } from 'vue-router'

import {
  cachedRouteViewNames,
  getRootRouteKey,
  routeTransitionDirection
} from '@/router/route-task-stack'
import { isMobileTerminal } from '@/utils/flexible'

defineOptions({ name: 'MTransitionRouterView' })

const transitionName = computed(() => {
  if (!isMobileTerminal.value || routeTransitionDirection.value === 'none') {
    return undefined
  }

  return `mobile-route-${routeTransitionDirection.value}`
})

const includedViewNames = computed(() => (isMobileTerminal.value ? cachedRouteViewNames.value : []))
</script>

<template>
  <div class="relative min-h-dvh overflow-x-clip">
    <RouterView v-slot="{ Component, route }">
      <Transition :name="transitionName">
        <KeepAlive :include="includedViewNames" :max="6">
          <component :is="Component" :key="getRootRouteKey(route)" />
        </KeepAlive>
      </Transition>
    </RouterView>
  </div>
</template>

<style scoped>
:global(.mobile-route-push-enter-active),
:global(.mobile-route-push-leave-active),
:global(.mobile-route-back-enter-active),
:global(.mobile-route-back-leave-active) {
  position: absolute;
  inset: 0;
  width: 100%;
  min-height: 100dvh;
  overflow-x: hidden;
  will-change: transform, opacity;
  transition:
    transform 360ms cubic-bezier(0.32, 0.72, 0, 1),
    opacity 280ms ease;
}

:global(.mobile-route-push-enter-active),
:global(.mobile-route-back-leave-active) {
  z-index: 2;
}

:global(.mobile-route-push-leave-active),
:global(.mobile-route-back-enter-active) {
  z-index: 1;
}

:global(.mobile-route-push-enter-from),
:global(.mobile-route-back-leave-to) {
  transform: translate3d(100%, 0, 0);
}

:global(.mobile-route-push-leave-to),
:global(.mobile-route-back-enter-from) {
  opacity: 0.72;
  transform: translate3d(-24%, 0, 0);
}

@media (prefers-reduced-motion: reduce) {
  :global(.mobile-route-push-enter-active),
  :global(.mobile-route-push-leave-active),
  :global(.mobile-route-back-enter-active),
  :global(.mobile-route-back-leave-active) {
    transition-duration: 1ms;
  }
}
</style>
