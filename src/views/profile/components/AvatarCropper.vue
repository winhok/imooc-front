<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef, useTemplateRef } from 'vue'
import Cropper from 'cropperjs'

import { AVATAR_OUTPUT_SIZE } from '@/constants'
import { message } from '@/libs/message'

defineOptions({ name: 'AvatarCropper' })

const props = defineProps<{
  source: string
  loading?: boolean
}>()

const emit = defineEmits<{
  cancel: []
  confirm: [blob: Blob]
}>()

const image = useTemplateRef<HTMLImageElement>('image')
const isRendering = shallowRef(false)
let cropper: Cropper | undefined

const cropperTemplate = `
  <cropper-canvas background>
    <cropper-image rotatable scalable translatable></cropper-image>
    <cropper-shade hidden></cropper-shade>
    <cropper-handle action="move" plain></cropper-handle>
    <cropper-selection initial-aspect-ratio="1" aspect-ratio="1" initial-coverage="0.82" movable resizable>
      <cropper-grid role="grid" bordered covered></cropper-grid>
      <cropper-crosshair centered></cropper-crosshair>
      <cropper-handle action="move" theme-color="rgba(255,255,255,.32)"></cropper-handle>
      <cropper-handle action="ne-resize"></cropper-handle>
      <cropper-handle action="nw-resize"></cropper-handle>
      <cropper-handle action="se-resize"></cropper-handle>
      <cropper-handle action="sw-resize"></cropper-handle>
    </cropper-selection>
  </cropper-canvas>
`

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))
}

function rotate() {
  cropper?.getCropperImage()?.$rotate('90deg')
}

function zoom(scale: number) {
  cropper?.getCropperImage()?.$zoom(scale)
}

function reset() {
  cropper?.getCropperImage()?.$resetTransform()
  cropper?.getCropperSelection()?.$reset()
}

async function confirmCrop() {
  const selection = cropper?.getCropperSelection()

  if (!selection || isRendering.value || props.loading) {
    return
  }

  isRendering.value = true

  try {
    const canvas = await selection.$toCanvas({
      width: AVATAR_OUTPUT_SIZE,
      height: AVATAR_OUTPUT_SIZE,
      beforeDraw(context) {
        context.imageSmoothingEnabled = true
        context.imageSmoothingQuality = 'high'
      }
    })
    const webp = await canvasToBlob(canvas, 'image/webp', 0.88)
    const blob = webp ?? (await canvasToBlob(canvas, 'image/jpeg', 0.9))

    if (!blob) {
      throw new Error('浏览器无法生成裁剪图片')
    }

    emit('confirm', blob)
  } catch (error) {
    message.error(error instanceof Error ? error.message : '图片裁剪失败')
  } finally {
    isRendering.value = false
  }
}

onMounted(() => {
  if (!image.value) {
    return
  }

  cropper = new Cropper(image.value, { template: cropperTemplate })
})

onBeforeUnmount(() => {
  cropper?.destroy()
})
</script>

<template>
  <div class="flex flex-col">
    <div
      class="cropper-stage h-[min(58dvh,520px)] min-h-[280px] overflow-hidden rounded-[14px] bg-zinc-950"
    >
      <img ref="image" :src="source" alt="待裁剪的头像" />
    </div>

    <div class="mt-[14px] flex flex-wrap items-center justify-between gap-[10px]">
      <div class="flex gap-[8px]" aria-label="裁剪工具">
        <button class="cropper-tool" type="button" aria-label="缩小图片" @click="zoom(-0.1)">
          −
        </button>
        <button class="cropper-tool" type="button" aria-label="放大图片" @click="zoom(0.1)">
          +
        </button>
        <button class="cropper-tool" type="button" @click="rotate">旋转</button>
        <button class="cropper-tool" type="button" @click="reset">重置</button>
      </div>

      <div class="ml-auto flex gap-[8px]">
        <MButton variant="neutral" :disabled="loading || isRendering" @click="emit('cancel')">
          取消
        </MButton>
        <MButton :loading="loading || isRendering" @click="confirmCrop">裁剪并上传</MButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cropper-stage :deep(cropper-canvas) {
  display: block;
  width: 100%;
  height: 100%;
}

.cropper-tool {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border-radius: 9px;
  background: #f4f4f5;
  color: #3f3f46;
  font-size: 13px;
  transition: background-color 150ms ease;
}

.cropper-tool:hover {
  background: #e4e4e7;
}

.cropper-tool:focus-visible {
  outline: 2px solid #f87171;
  outline-offset: 2px;
}

:global(.dark) .cropper-tool {
  background: #27272a;
  color: #f4f4f5;
}

:global(.dark) .cropper-tool:hover {
  background: #3f3f46;
}

@media (prefers-reduced-motion: reduce) {
  .cropper-tool {
    transition-duration: 1ms;
  }
}
</style>
