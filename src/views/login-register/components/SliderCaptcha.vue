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
import { useEventListener, useScrollLock } from '@vueuse/core'

import { verifyCaptcha } from '@/api/auth'

defineOptions({ name: 'SliderCaptcha' })

const emit = defineEmits<{
  close: []
  success: []
}>()

const dialog = useTemplateRef<HTMLElement>('dialog')
const track = useTemplateRef<HTMLElement>('track')
const titleId = useId()
const hintId = useId()
const progress = shallowRef(0)
const target = shallowRef(createTarget())
const status = shallowRef<'idle' | 'dragging' | 'verifying' | 'error'>('idle')
const errorMessage = shallowRef('')
const pointerId = shallowRef<number | null>(null)
const startY = shallowRef(0)
const behavior = shallowRef<number[]>([])
const lastKeyboardTime = shallowRef(0)
const abortController = shallowRef<AbortController>()
const resetTimer = shallowRef<number>()
const isScrollLocked = useScrollLock(document.body)
const previouslyFocusedElement =
  document.activeElement instanceof HTMLElement ? document.activeElement : undefined

const knobStyle = computed(() => ({ left: `calc(${progress.value}% - 18px)` }))
const pieceStyle = computed(() => ({ left: `calc(${progress.value}% - 22px)` }))
const targetStyle = computed(() => ({ left: `calc(${target.value}% - 22px)` }))
const progressStyle = computed(() => ({ width: `${progress.value}%` }))
const statusText = computed(() => {
  if (status.value === 'verifying') {
    return '正在验证行为轨迹…'
  }

  if (status.value === 'error') {
    return errorMessage.value
  }

  return '拖动滑块，让拼图块与缺口重合'
})

function createTarget() {
  const values = new Uint32Array(1)
  crypto.getRandomValues(values)
  return 58 + ((values[0] ?? 0) % 21)
}

function reset() {
  if (resetTimer.value) {
    window.clearTimeout(resetTimer.value)
    resetTimer.value = undefined
  }

  abortController.value?.abort()
  progress.value = 0
  target.value = createTarget()
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
  progress.value = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
}

function onPointerDown(event: PointerEvent) {
  if (status.value === 'verifying') {
    return
  }

  const element = track.value

  if (!element) {
    return
  }

  const rect = element.getBoundingClientRect()
  const knobCenter = rect.left + (progress.value / 100) * rect.width

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
  if (status.value === 'verifying') {
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
  if (Math.abs(progress.value - target.value) > 4) {
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
  abortController.value?.abort()
  abortController.value = controller
  status.value = 'verifying'

  try {
    const passed = await verifyCaptcha({ behavior: behavior.value }, controller.signal)

    if (!passed) {
      throw new Error('服务端未通过本次行为验证')
    }

    emit('success')
  } catch (error) {
    if (controller.signal.aborted) {
      return
    }

    status.value = 'error'
    errorMessage.value = error instanceof Error ? error.message : '验证失败，请重试'
  }
}

function onDocumentKeydown(event: KeyboardEvent) {
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
  isScrollLocked.value = true
  await nextTick()
  dialog.value?.focus()
})

onBeforeUnmount(() => {
  if (resetTimer.value) {
    window.clearTimeout(resetTimer.value)
  }

  abortController.value?.abort()
  isScrollLocked.value = false
  previouslyFocusedElement?.focus()
})

useEventListener(document, 'keydown', onDocumentKeydown)
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 grid place-items-center bg-black/55 px-[16px] backdrop-blur-[2px]"
      @click.self="emit('close')"
    >
      <section
        ref="dialog"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="hintId"
        tabindex="-1"
        class="w-full max-w-[360px] rounded-[16px] border border-zinc-200 bg-white p-[18px] shadow-2xl outline-none dark:border-zinc-700 dark:bg-zinc-900"
      >
        <header class="flex items-center justify-between gap-[12px]">
          <div>
            <h2 :id="titleId" class="text-base font-semibold text-zinc-950 dark:text-zinc-50">
              请完成安全验证
            </h2>
            <p :id="hintId" class="mt-[3px] text-xs text-zinc-500 dark:text-zinc-400">
              支持鼠标、触摸和键盘方向键
            </p>
          </div>
          <div class="flex gap-[6px]">
            <button
              type="button"
              class="grid size-[32px] place-items-center rounded-[8px] text-zinc-500 hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:hover:bg-zinc-800"
              aria-label="重置验证"
              @click="reset"
            >
              <span aria-hidden="true">↻</span>
            </button>
            <button
              type="button"
              class="grid size-[32px] place-items-center rounded-[8px] text-zinc-500 hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:hover:bg-zinc-800"
              aria-label="关闭验证"
              @click="emit('close')"
            >
              <MSvgIcon name="close" :size="15" />
            </button>
          </div>
        </header>

        <div
          class="relative mt-[16px] h-[142px] overflow-hidden rounded-[12px] bg-[linear-gradient(135deg,#fecdd3,#fda4af_36%,#a5b4fc_36%,#818cf8_70%,#67e8f9_70%)] dark:opacity-90"
        >
          <div
            class="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,.65),transparent_20%),radial-gradient(circle_at_80%_65%,rgba(255,255,255,.4),transparent_25%)]"
          />
          <div
            class="absolute top-[48px] size-[44px] rounded-[8px] border-2 border-dashed border-white/90 bg-black/10 shadow-inner"
            :style="targetStyle"
            aria-hidden="true"
          />
          <div
            class="absolute top-[48px] size-[44px] rounded-[8px] border-2 border-white/90 bg-white/35 shadow-lg backdrop-blur-[1px]"
            :style="pieceStyle"
            aria-hidden="true"
          />
        </div>

        <div
          ref="track"
          role="slider"
          tabindex="0"
          aria-label="拼图验证滑块"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="Math.round(progress)"
          :aria-busy="status === 'verifying'"
          class="relative mt-[14px] h-[40px] touch-none rounded-[10px] bg-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:bg-zinc-800"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerCancel"
          @keydown="onKeydown"
        >
          <div
            class="absolute inset-y-0 left-0 rounded-[10px] bg-red-100 dark:bg-red-950/60"
            :style="progressStyle"
          />
          <div
            class="absolute top-[2px] grid size-[36px] cursor-grab place-items-center rounded-[9px] bg-red-500 text-sm font-bold text-white shadow-md active:cursor-grabbing"
            :style="knobStyle"
            aria-hidden="true"
          >
            →
          </div>
        </div>

        <p
          class="mt-[10px] min-h-[20px] text-center text-xs"
          :class="status === 'error' ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'"
          :role="status === 'error' ? 'alert' : 'status'"
        >
          {{ statusText }}
        </p>
      </section>
    </div>
  </Teleport>
</template>
