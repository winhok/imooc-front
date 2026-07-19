import { computed, shallowRef, toValue } from 'vue'
import type { CSSProperties, MaybeRefOrGetter } from 'vue'

export interface PinsTransitionOrigin {
  left: number
  top: number
  width: number
  height: number
}

interface PinsTransitionSource {
  id: string
  origin: PinsTransitionOrigin
}

const source = shallowRef<PinsTransitionSource>()

export function setPinsTransitionSource(id: string, origin: PinsTransitionOrigin) {
  source.value = { id, origin }
}

export function usePinsTransition(id: MaybeRefOrGetter<string>) {
  const hasSource = computed(() => source.value?.id === toValue(id))

  const transitionStyle = computed<CSSProperties>(() => {
    if (!hasSource.value || !source.value) {
      return {
        '--pins-origin-x': '4vw',
        '--pins-origin-y': '4dvh',
        '--pins-origin-scale-x': '0.92',
        '--pins-origin-scale-y': '0.92'
      }
    }

    const { origin } = source.value
    const viewportWidth = Math.max(window.innerWidth, 1)
    const viewportHeight = Math.max(window.innerHeight, 1)

    return {
      '--pins-origin-x': `${origin.left}px`,
      '--pins-origin-y': `${origin.top}px`,
      '--pins-origin-scale-x': `${Math.max(origin.width / viewportWidth, 0.001)}`,
      '--pins-origin-scale-y': `${Math.max(origin.height / viewportHeight, 0.001)}`
    }
  })

  return {
    hasSource,
    transitionStyle
  }
}
