import { computed, shallowRef, toValue } from 'vue'
import type { CSSProperties, MaybeRefOrGetter } from 'vue'

export interface PinsTransitionOrigin {
  left: number
  top: number
  width: number
  height: number
}

interface PinsTransitionSource {
  attemptId: number
  id: string
  origin: PinsTransitionOrigin
  viewportWidth: number
  viewportHeight: number
}

const source = shallowRef<PinsTransitionSource>()
let nextAttemptId = 0

export function setPinsTransitionSource(id: string, origin: PinsTransitionOrigin) {
  const attemptId = ++nextAttemptId
  source.value = {
    attemptId,
    id,
    origin,
    viewportWidth: Math.max(window.innerWidth, 1),
    viewportHeight: Math.max(window.innerHeight, 1)
  }
  return attemptId
}

export function cancelPinsTransitionSource(attemptId: number) {
  if (source.value?.attemptId === attemptId) {
    source.value = undefined
  }
}

function consumePinsTransitionSource(id: string) {
  if (source.value?.id !== id) {
    return undefined
  }

  const consumed = source.value
  source.value = undefined
  return consumed
}

export function usePinsTransition(id: MaybeRefOrGetter<string>) {
  const transitionSource = consumePinsTransitionSource(toValue(id))
  const hasSource = computed(() => Boolean(transitionSource))

  const transitionStyle = computed<CSSProperties>(() => {
    if (!transitionSource) {
      return {
        '--pins-origin-x': '4vw',
        '--pins-origin-y': '4dvh',
        '--pins-origin-scale-x': '0.92',
        '--pins-origin-scale-y': '0.92'
      }
    }

    const { origin, viewportWidth, viewportHeight } = transitionSource

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
