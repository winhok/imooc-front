<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, useTemplateRef, watch } from 'vue'

import { AVATAR_MAX_FILE_SIZE } from '@/constants'
import { message } from '@/libs/message'
import { isMobileTerminal } from '@/utils/flexible'

import AvatarCropper from './AvatarCropper.vue'

defineOptions({ name: 'ProfileAvatar' })

const props = defineProps<{
  avatar?: string
  displayName: string
  loading?: boolean
}>()

const emit = defineEmits<{
  cropped: [blob: Blob]
}>()

const input = useTemplateRef<HTMLInputElement>('input')
const isEditorOpen = shallowRef(false)
const objectUrl = shallowRef('')
const initial = computed(() => props.displayName.trim().charAt(0).toUpperCase() || 'M')
const acceptedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

function chooseFile() {
  if (!props.loading) {
    input.value?.click()
  }
}

function releaseObjectUrl() {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
    objectUrl.value = ''
  }
}

async function assertReadableImage(file: File) {
  if ('createImageBitmap' in window) {
    const bitmap = await createImageBitmap(file)
    bitmap.close()
    return
  }

  const source = URL.createObjectURL(file)

  try {
    await new Promise<void>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('无法读取图片'))
      image.src = source
    })
  } finally {
    URL.revokeObjectURL(source)
  }
}

async function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''

  if (!file) {
    return
  }

  if (!acceptedTypes.has(file.type)) {
    message.error('请选择 JPG、PNG 或 WebP 图片')
    return
  }

  if (file.size > AVATAR_MAX_FILE_SIZE) {
    message.error('图片大小不能超过 5 MiB')
    return
  }

  try {
    await assertReadableImage(file)
    releaseObjectUrl()
    objectUrl.value = URL.createObjectURL(file)
    isEditorOpen.value = true
  } catch {
    message.error('图片已损坏或浏览器无法读取')
  }
}

function closeEditor() {
  isEditorOpen.value = false
}

function onCropped(blob: Blob) {
  emit('cropped', blob)
  closeEditor()
}

watch(isEditorOpen, (open) => {
  if (!open) {
    releaseObjectUrl()
  }
})

onBeforeUnmount(releaseObjectUrl)
</script>

<template>
  <section class="flex flex-col items-center xl:block" aria-labelledby="avatar-title">
    <h2
      id="avatar-title"
      class="mb-[20px] inline-block w-[80px] text-sm font-bold text-zinc-900 xl:mx-auto xl:block dark:text-zinc-300"
    >
      我的头像
    </h2>
    <button
      type="button"
      class="group relative grid size-[80px] place-items-center overflow-hidden rounded-full bg-zinc-900 text-xl font-bold text-white focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:outline-none disabled:cursor-wait disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-950"
      :disabled="loading"
      aria-label="选择新头像"
      @click="chooseFile"
    >
      <img
        v-if="avatar"
        :src="avatar"
        :alt="`${displayName}的头像`"
        class="size-full object-cover"
      />
      <span v-else aria-hidden="true">{{ initial }}</span>
      <span
        class="absolute inset-0 hidden place-items-center bg-black/40 text-xs font-medium text-white group-hover:grid group-focus-visible:grid"
      >
        {{ loading ? '上传中…' : '更换头像' }}
      </span>
    </button>
    <p
      class="mt-[10px] max-w-[100px] text-center text-xs leading-relaxed text-zinc-500 dark:text-zinc-400"
    >
      支持 jpg、png、jpeg 格式大小 5M 以内的图片
    </p>
    <input
      ref="input"
      class="sr-only"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      @change="onFileChange"
    />
  </section>

  <MDialog
    v-if="!isMobileTerminal"
    v-model="isEditorOpen"
    title="裁剪头像"
    :close-on-backdrop="!loading"
    :close-on-escape="!loading"
  >
    <AvatarCropper
      v-if="objectUrl"
      :source="objectUrl"
      :loading="loading"
      @cancel="closeEditor"
      @confirm="onCropped"
    />
  </MDialog>

  <MPopup
    v-else
    v-model="isEditorOpen"
    class="max-h-dvh overflow-auto p-[16px]"
    :close-on-backdrop="!loading"
    :close-on-escape="!loading"
  >
    <header class="mb-[14px] flex items-center justify-between">
      <h2 class="text-base font-semibold text-zinc-950 dark:text-zinc-50">裁剪头像</h2>
      <button
        type="button"
        class="grid size-[36px] place-items-center rounded-[9px] text-zinc-500 hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:hover:bg-zinc-800"
        aria-label="关闭头像裁剪"
        :disabled="loading"
        @click="closeEditor"
      >
        <MSvgIcon name="close" :size="16" />
      </button>
    </header>
    <AvatarCropper
      v-if="objectUrl"
      :source="objectUrl"
      :loading="loading"
      @cancel="closeEditor"
      @confirm="onCropped"
    />
  </MPopup>
</template>
