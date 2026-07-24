<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  useId,
  useTemplateRef
} from 'vue'
import { useEventListener, useResizeObserver } from '@vueuse/core'

import { verifyCaptcha } from '@/api/auth'
import { useModalLayer } from '@/composables/useModalLayer'

import CaptchaPuzzle from './CaptchaPuzzle.vue'
import { createCaptchaChallenge } from './captcha-challenge'

defineOptions({ name: 'SliderCaptcha' })

const KNOB_SIZE = 36
const KNOB_RADIUS = KNOB_SIZE / 2
const ALIGNMENT_TOLERANCE = 4

const emit = defineEmits<{
  close: []
  success: []
}>()

const dialog = useTemplateRef<HTMLElement>('dialog')
const track = useTemplateRef<HTMLElement>('track')
const titleId = useId()
const hintId = useId()
const progress = shallowRef(0)
const challenge = shallowRef(createCaptchaChallenge())
const status = shallowRef<'idle' | 'dragging' | 'verifying' | 'error'>('idle')
const errorMessage = shallowRef('')
const pointerId = shallowRef<number | null>(null)
const startY = shallowRef(0)
const behavior = shallowRef<number[]>([])
const lastKeyboardTime = shallowRef(0)
const trackWidth = shallowRef(0)
const isImageLoaded = shallowRef(false)
const abortController = shallowRef<AbortController>()
const resetTimer = shallowRef<number>()
let verificationGeneration = 0
const isLayerActive = shallowRef(true)
const { isTopLayer } = useModalLayer(isLayerActive)
const previouslyFocusedElement =
  document.activeElement instanceof HTMLElement ? document.activeElement : undefined

const knobOffset = computed(
  () => (progress.value / 100) * Math.max(0, trackWidth.value - KNOB_SIZE)
)
const knobStyle = computed(() => ({ left: `${knobOffset.value}px` }))
const progressStyle = computed(() => ({ width: `${knobOffset.value + KNOB_RADIUS}px` }))
const alignmentHint = computed(() => {
  const difference = progress.value - challenge.value.targetProgress

  if (Math.abs(difference) <= ALIGNMENT_TOLERANCE) {
    return '拼图块已与缺口对齐'
  }

  return difference < 0 ? '拼图块位于缺口左侧' : '拼图块位于缺口右侧'
})
const statusText = computed(() => {
  if (status.value === 'error') {
    return errorMessage.value
  }

  if (!isImageLoaded.value) {
    return '正在加载验证图片…'
  }

  if (status.value === 'verifying') {
    return '正在验证行为轨迹…'
  }

  return '拖动滑块，让拼图块与缺口重合'
})

function reset() {
  verificationGeneration += 1

  if (resetTimer.value) {
    window.clearTimeout(resetTimer.value)
    resetTimer.value = undefined
  }

  abortController.value?.abort()
  abortController.value = undefined
  progress.value = 0
  challenge.value = createCaptchaChallenge(challenge.value.imageUrl)
  isImageLoaded.value = false
  status.value = 'idle'
  errorMessage.value = ''
  pointerId.value = null
  behavior.value = []
  lastKeyboardTime.value = 0
}

function updateProgress(clientX: number) {
  const element = track.value

  if (!element) {
    return
  }

  const rect = element.getBoundingClientRect()
  const travelWidth = Math.max(1, rect.width - KNOB_SIZE)
  progress.value = Math.min(
    100,
    Math.max(0, ((clientX - rect.left - KNOB_RADIUS) / travelWidth) * 100)
  )
}

function onPointerDown(event: PointerEvent) {
  if (status.value === 'verifying' || !isImageLoaded.value) {
    return
  }

  const element = track.value

  if (!element) {
    return
  }

  const rect = element.getBoundingClientRect()
  const knobCenter = rect.left + knobOffset.value + KNOB_RADIUS

  if (Math.abs(event.clientX - knobCenter) > 26) {
    return
  }

  pointerId.value = event.pointerId
  startY.value = event.clientY
  behavior.value = [0]
  status.value = 'dragging'
  errorMessage.value = ''
  track.value?.setPointerCapture(event.pointerId)
  updateProgress(event.clientX)
}

function onPointerMove(event: PointerEvent) {
  if (pointerId.value !== event.pointerId || status.value !== 'dragging') {
    return
  }

  updateProgress(event.clientX)
  behavior.value = [...behavior.value, Math.round(event.clientY - startY.value)]
}

function onPointerUp(event: PointerEvent) {
  if (pointerId.value !== event.pointerId || status.value !== 'dragging') {
    return
  }

  track.value?.releasePointerCapture(event.pointerId)
  pointerId.value = null
  void completeChallenge()
}

function onPointerCancel(event: PointerEvent) {
  if (pointerId.value === event.pointerId) {
    reset()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (status.value === 'verifying' || !isImageLoaded.value) {
    return
  }

  if (event.key === 'ArrowLeft') {
    progress.value = Math.max(0, progress.value - 2)
  } else if (event.key === 'ArrowRight') {
    progress.value = Math.min(100, progress.value + 2)
  } else if (event.key === 'Home') {
    progress.value = 0
  } else if (event.key === 'End') {
    progress.value = 100
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    void completeChallenge()
    return
  } else {
    return
  }

  event.preventDefault()
  status.value = 'dragging'
  const currentTime = performance.now()
  const interval = lastKeyboardTime.value ? currentTime - lastKeyboardTime.value : 0
  lastKeyboardTime.value = currentTime
  behavior.value = [...behavior.value, Math.round(interval)]
}

async function completeChallenge() {
  if (!isImageLoaded.value) {
    return
  }

  if (Math.abs(progress.value - challenge.value.targetProgress) > ALIGNMENT_TOLERANCE) {
    status.value = 'error'
    errorMessage.value = '位置没有对齐，请重试'
    resetTimer.value = window.setTimeout(reset, 700)
    return
  }

  if (behavior.value.length < 3) {
    status.value = 'error'
    errorMessage.value = '拖动轨迹过短，请重试'
    resetTimer.value = window.setTimeout(reset, 700)
    return
  }

  const controller = new AbortController()
  const generation = ++verificationGeneration
  abortController.value?.abort()
  abortController.value = controller
  status.value = 'verifying'
  const behaviorSnapshot = [...behavior.value]

  try {
    const passed = await verifyCaptcha({ behavior: behaviorSnapshot }, controller.signal)

    if (
      controller.signal.aborted ||
      abortController.value !== controller ||
      generation !== verificationGeneration
    ) {
      return
    }

    if (!passed) {
      throw new Error('服务端未通过本次行为验证')
    }

    emit('success')
  } catch (error) {
    if (
      controller.signal.aborted ||
      abortController.value !== controller ||
      generation !== verificationGeneration
    ) {
      return
    }

    status.value = 'error'
    errorMessage.value = error instanceof Error ? error.message : '验证失败，请重试'
  }
}

function onImageLoaded() {
  isImageLoaded.value = true
}

function onImageError() {
  isImageLoaded.value = false
  status.value = 'error'
  errorMessage.value = '验证图片加载失败，请点击刷新重试'
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (!isTopLayer.value) {
    return
  }

  if (event.key === 'Escape') {
    emit('close')
    return
  }

  if (event.key !== 'Tab' || !dialog.value) {
    return
  }

  const focusableElements = Array.from(
    dialog.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    )
  )
  const firstElement = focusableElements[0]
  const lastElement = focusableElements.at(-1)

  if (!firstElement || !lastElement) {
    event.preventDefault()
    dialog.value.focus()
    return
  }

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

onMounted(async () => {
  await nextTick()
  dialog.value?.focus()
})

onBeforeUnmount(() => {
  verificationGeneration += 1

  if (resetTimer.value) {
    window.clearTimeout(resetTimer.value)
  }

  abortController.value?.abort()
  isLayerActive.value = false
  previouslyFocusedElement?.focus()
})

useEventListener(document, 'keydown', onDocumentKeydown)

useResizeObserver(track, ([entry]) => {
  trackWidth.value = entry?.contentRect.width ?? 0
})
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50" @click.self="emit('close')">
      <section
        ref="dialog"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="hintId"
        tabindex="-1"
        class="fixed top-[20%] left-1/2 h-[270px] w-[340px] -translate-x-1/2 rounded border border-zinc-200 bg-white p-[10px] text-sm shadow-2xl outline-none dark:border-zinc-900 dark:bg-zinc-800"
      >
        <header class="mb-[10px] flex h-[40px] items-center px-[10px] text-left">
          <div class="grow">
            <h2 :id="titleId" class="text-sm text-zinc-950 dark:text-zinc-50">请完成安全验证</h2>
            <p :id="hintId" class="sr-only">支持鼠标、触摸和键盘方向键</p>
          </div>
          <div class="flex gap-[6px]">
            <button
              type="button"
              class="grid size-[30px] place-items-center rounded-sm text-zinc-500 duration-300 hover:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:hover:bg-zinc-900"
              aria-label="重置验证"
              @click="reset"
            >
              <span aria-hidden="true">↻</span>
            </button>
            <button
              type="button"
              class="grid size-[30px] place-items-center rounded-sm text-zinc-500 duration-300 hover:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:hover:bg-zinc-900"
              aria-label="关闭验证"
              @click="emit('close')"
            >
              <MSvgIcon name="close" :size="15" />
            </button>
          </div>
        </header>

        <CaptchaPuzzle
          :key="challenge.imageUrl"
          :image-url="challenge.imageUrl"
          :progress="progress"
          :target-progress="challenge.targetProgress"
          :target-y="challenge.targetY"
          @loaded="onImageLoaded"
          @error="onImageError"
        />

        <div
          ref="track"
          role="slider"
          tabindex="0"
          aria-label="拼图验证滑块"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="Math.round(progress)"
          :aria-valuetext="alignmentHint"
          :aria-busy="status === 'verifying'"
          :aria-disabled="!isImageLoaded || status === 'verifying'"
          class="relative mt-[10px] h-[40px] touch-none bg-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:bg-zinc-900"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerCancel"
          @keydown="onKeydown"
        >
          <div
            class="absolute inset-y-0 left-0 bg-red-100 dark:bg-red-950/60"
            :style="progressStyle"
          />
          <div
            class="absolute top-[2px] grid size-[36px] cursor-grab place-items-center bg-red-500 text-sm font-bold text-white shadow-md active:cursor-grabbing"
            :style="knobStyle"
            aria-hidden="true"
          >
            →
          </div>
        </div>

        <p
          class="sr-only"
          :class="status === 'error' ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'"
          :role="status === 'error' ? 'alert' : 'status'"
        >
          {{ statusText }}
        </p>
      </section>
    </div>
  </Teleport>
</template>
