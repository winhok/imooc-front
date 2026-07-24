import { computed, onScopeDispose, shallowReactive, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

const activeLayerIds = shallowReactive<number[]>([])
let nextLayerId = 0
let previousBodyOverflow = ''

function lockBodyScroll() {
  if (activeLayerIds.length !== 1 || typeof document === 'undefined') {
    return
  }

  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

function unlockBodyScroll() {
  if (activeLayerIds.length !== 0 || typeof document === 'undefined') {
    return
  }

  document.body.style.overflow = previousBodyOverflow
  previousBodyOverflow = ''
}

export function useModalLayer(isActive: MaybeRefOrGetter<boolean>) {
  const layerId = ++nextLayerId
  let registered = false

  function activate() {
    if (registered) {
      return
    }

    registered = true
    activeLayerIds.push(layerId)
    lockBodyScroll()
  }

  function deactivate() {
    if (!registered) {
      return
    }

    registered = false
    const index = activeLayerIds.indexOf(layerId)

    if (index !== -1) {
      activeLayerIds.splice(index, 1)
    }

    unlockBodyScroll()
  }

  watch(
    () => toValue(isActive),
    (active) => {
      if (active) {
        activate()
      } else {
        deactivate()
      }
    },
    { immediate: true }
  )

  onScopeDispose(deactivate)

  return {
    isTopLayer: computed(() => registered && activeLayerIds.at(-1) === layerId)
  }
}
