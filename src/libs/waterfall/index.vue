<script setup lang="ts" generic="T extends object">
import { useEventListener, useResizeObserver } from '@vueuse/core'
import { computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import type { CSSProperties, VNode } from 'vue'

defineOptions({ name: 'MWaterfall' })

interface Props<T> {
  items: readonly T[]
  columns?: number
  columnGap?: number
  rowGap?: number
  virtualize?: boolean
  overscan?: number
  getKey: (item: T, index: number) => PropertyKey
  getItemHeight: (item: T, width: number, index: number) => number
}

interface Placement<T> {
  item: T
  key: PropertyKey
  index: number
  top: number
  height: number
  style: CSSProperties
}

const props = withDefaults(defineProps<Props<T>>(), {
  columns: 2,
  columnGap: 16,
  rowGap: 16,
  virtualize: true,
  overscan: 800
})

defineSlots<{
  default(props: { item: T; width: number; index: number }): VNode[]
}>()

const container = useTemplateRef<HTMLElement>('container')
const containerWidth = shallowRef(0)
const scrollTarget = shallowRef<EventTarget | null>(null)
const viewportRange = shallowRef({ top: 0, bottom: Number.POSITIVE_INFINITY })

let animationFrameId: number | undefined

function findScrollTarget(element: HTMLElement): HTMLElement | Window {
  let parent = element.parentElement

  while (parent) {
    const { overflowY } = window.getComputedStyle(parent)

    if (/(auto|scroll|overlay)/u.test(overflowY)) {
      return parent
    }

    parent = parent.parentElement
  }

  return window
}

function updateViewportRange() {
  animationFrameId = undefined

  const element = container.value
  const target = scrollTarget.value

  if (!element || !target) {
    return
  }

  const containerRect = element.getBoundingClientRect()
  const viewportRect =
    target instanceof HTMLElement
      ? target.getBoundingClientRect()
      : { top: 0, bottom: window.innerHeight }
  const top = Math.max(0, viewportRect.top - containerRect.top)

  viewportRange.value = {
    top,
    bottom: Math.max(top, viewportRect.bottom - containerRect.top)
  }
}

function scheduleViewportMeasurement() {
  if (animationFrameId !== undefined) {
    return
  }

  animationFrameId = window.requestAnimationFrame(updateViewportRange)
}

useResizeObserver(container, ([entry]) => {
  containerWidth.value = entry?.contentRect.width ?? 0
  scheduleViewportMeasurement()
})

useEventListener(scrollTarget, 'scroll', scheduleViewportMeasurement, { passive: true })
useEventListener('resize', scheduleViewportMeasurement, { passive: true })

onMounted(() => {
  if (!container.value) {
    return
  }

  scrollTarget.value = findScrollTarget(container.value)
  scheduleViewportMeasurement()
})

onBeforeUnmount(() => {
  if (animationFrameId !== undefined) {
    window.cancelAnimationFrame(animationFrameId)
  }
})

const normalizedColumns = computed(() => Math.max(1, Math.floor(props.columns)))

const itemWidth = computed(() => {
  const gapWidth = (normalizedColumns.value - 1) * Math.max(0, props.columnGap)
  return Math.max(0, (containerWidth.value - gapWidth) / normalizedColumns.value)
})

const layout = computed(() => {
  if (itemWidth.value <= 0 || props.items.length === 0) {
    return { height: 0, placements: [] as Placement<T>[] }
  }

  const columnHeights = Array.from<number>({ length: normalizedColumns.value }).fill(0)
  const placements = props.items.map<Placement<T>>((item, index) => {
    let targetColumn = 0

    for (let column = 1; column < columnHeights.length; column += 1) {
      const targetHeight = columnHeights[targetColumn] ?? 0
      const candidateHeight = columnHeights[column] ?? 0

      if (candidateHeight < targetHeight) {
        targetColumn = column
      }
    }

    const top = columnHeights[targetColumn] ?? 0
    const requestedHeight = props.getItemHeight(item, itemWidth.value, index)
    const itemHeight = Number.isFinite(requestedHeight) ? Math.max(0, requestedHeight) : 0

    columnHeights[targetColumn] = top + itemHeight + Math.max(0, props.rowGap)

    return {
      item,
      index,
      key: props.getKey(item, index),
      top,
      height: itemHeight,
      style: {
        width: `${itemWidth.value}px`,
        height: `${itemHeight}px`,
        transform: `translate3d(${targetColumn * (itemWidth.value + props.columnGap)}px, ${top}px, 0)`
      }
    }
  })

  const tallestColumn = Math.max(...columnHeights)

  return {
    height: Math.max(0, tallestColumn - Math.max(0, props.rowGap)),
    placements
  }
})

const containerStyle = computed<CSSProperties>(() => ({
  height: `${layout.value.height}px`
}))

const visiblePlacements = computed(() => {
  if (!props.virtualize) {
    return layout.value.placements
  }

  const overscan = Math.max(0, props.overscan)
  const visibleTop = viewportRange.value.top - overscan
  const visibleBottom = viewportRange.value.bottom + overscan

  return layout.value.placements.filter(
    (placement) => placement.top + placement.height >= visibleTop && placement.top <= visibleBottom
  )
})

watch([containerWidth, () => props.items.length, normalizedColumns], scheduleViewportMeasurement, {
  flush: 'post'
})
</script>

<template>
  <div ref="container" class="relative w-full" :style="containerStyle">
    <div
      v-for="placement in visiblePlacements"
      :key="placement.key"
      class="absolute top-0 left-0 transition-transform duration-300 ease-out contain-layout motion-reduce:transition-none"
      :style="placement.style"
    >
      <slot :item="placement.item" :width="itemWidth" :index="placement.index" />
    </div>
  </div>
</template>
