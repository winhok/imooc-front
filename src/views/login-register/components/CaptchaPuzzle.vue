<script setup lang="ts">
import { computed, shallowRef, useId, useTemplateRef } from 'vue'
import type { CSSProperties } from 'vue'
import { useResizeObserver } from '@vueuse/core'

defineOptions({ name: 'CaptchaPuzzle' })

const STAGE_HEIGHT = 150
const PIECE_SIZE = 52
const PUZZLE_PATH =
  'M0 0H19C19 6 23 9 26 9C29 9 33 6 33 0H52V19C46 19 43 23 43 26C43 29 46 33 52 33V52H33C33 46 29 43 26 43C23 43 19 46 19 52H0V33C6 33 9 29 9 26C9 23 6 19 0 19Z'

interface Props {
  imageUrl: string
  progress: number
  targetProgress: number
  targetY: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  error: []
  loaded: []
}>()

const stage = useTemplateRef<HTMLElement>('stage')
const stageWidth = shallowRef(0)
const clipPathId = `captcha-piece-${useId().replaceAll(':', '')}`

const travelWidth = computed(() => Math.max(0, stageWidth.value - PIECE_SIZE))
const targetOffset = computed(() => (props.targetProgress / 100) * travelWidth.value)
const pieceOffset = computed(() => (props.progress / 100) * travelWidth.value)
const targetStyle = computed<CSSProperties>(() => ({
  left: `${targetOffset.value}px`,
  top: `${props.targetY}px`
}))
const pieceStyle = computed<CSSProperties>(() => ({
  left: `${pieceOffset.value}px`,
  top: `${props.targetY}px`
}))

useResizeObserver(stage, ([entry]) => {
  stageWidth.value = entry?.contentRect.width ?? 0
})
</script>

<template>
  <div
    ref="stage"
    class="relative h-[150px] overflow-hidden bg-zinc-200 shadow-inner dark:bg-zinc-800"
    role="img"
    aria-label="随机风景拼图验证图片"
  >
    <img
      :src="imageUrl"
      alt=""
      class="size-full object-fill select-none"
      draggable="false"
      @load="emit('loaded')"
      @error="emit('error')"
    />

    <svg
      class="pointer-events-none absolute drop-shadow-sm"
      :style="targetStyle"
      :width="PIECE_SIZE"
      :height="PIECE_SIZE"
      :viewBox="`0 0 ${PIECE_SIZE} ${PIECE_SIZE}`"
      aria-hidden="true"
    >
      <path
        :d="PUZZLE_PATH"
        fill="rgb(15 23 42 / 45%)"
        stroke="rgb(255 255 255 / 88%)"
        stroke-dasharray="4 3"
        stroke-width="2"
      />
    </svg>

    <svg
      class="pointer-events-none absolute drop-shadow-[0_5px_7px_rgb(15_23_42/0.45)]"
      :style="pieceStyle"
      :width="PIECE_SIZE"
      :height="PIECE_SIZE"
      :viewBox="`0 0 ${PIECE_SIZE} ${PIECE_SIZE}`"
      aria-hidden="true"
    >
      <defs>
        <clipPath :id="clipPathId" clipPathUnits="userSpaceOnUse">
          <path :d="PUZZLE_PATH" />
        </clipPath>
      </defs>
      <image
        :href="imageUrl"
        :x="-targetOffset"
        :y="-targetY"
        :width="stageWidth"
        :height="STAGE_HEIGHT"
        preserveAspectRatio="none"
        :clip-path="`url(#${clipPathId})`"
      />
      <path :d="PUZZLE_PATH" fill="none" stroke="white" stroke-width="2" />
    </svg>
  </div>
</template>
