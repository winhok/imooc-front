<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { useFullscreen } from '@vueuse/core'
import { RouterLink } from 'vue-router'

import { usePexelsShare } from '@/composables/usePexelsShare'
import { message } from '@/libs/message'
import type { PexelsItem } from '@/types/pexels'
import { colorFromString } from '@/utils/color'

import { useImageDownload } from './useImageDownload'
import type { PinsTransitionOrigin } from '@/views/pins/usePinsTransition'

defineOptions({ name: 'PexelsCard' })

interface Props {
  item: PexelsItem
  imageHeight: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  openDetails: [payload: { item: PexelsItem; origin: PinsTransitionOrigin }]
}>()

const placeholderColor = computed(() => colorFromString(props.item.id))
const preview = useTemplateRef<HTMLElement>('preview')
const { isFullscreen, isSupported, enter, exit } = useFullscreen(preview, { autoExit: true })
const { isDownloading, downloadImage } = useImageDownload()
const { shareItemToWeibo } = usePexelsShare()

function openDetails(event: MouseEvent) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    !preview.value
  ) {
    return
  }

  event.preventDefault()
  const { left, top, width, height } = preview.value.getBoundingClientRect()
  emit('openDetails', {
    item: props.item,
    origin: { left, top, width, height }
  })
}

async function openFullscreen() {
  if (!isSupported.value) {
    message.warning('当前浏览器不支持全屏展示')
    return
  }

  try {
    await enter()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '无法进入全屏模式')
  }
}

async function closeFullscreen() {
  try {
    await exit()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '无法退出全屏模式')
  }
}
</script>

<template>
  <article
    class="h-full overflow-hidden rounded-[12px] bg-white shadow-sm ring-1 ring-black/5 transition-[background-color,box-shadow] duration-300 hover:shadow-md dark:bg-zinc-900 dark:ring-white/10 xl:dark:bg-zinc-900"
  >
    <div
      ref="preview"
      class="group relative grid w-full overflow-hidden rounded-t-[12px] bg-zinc-950"
      :class="isFullscreen ? 'h-dvh place-items-center rounded-none' : ''"
    >
      <MLazyImage
        :src="item.photo"
        :alt="item.title"
        :width="item.photoWidth"
        :height="item.photoHeight"
        :display-height="isFullscreen ? '100dvh' : imageHeight"
        :placeholder-color="isFullscreen ? '#09090b' : placeholderColor"
        :fit="isFullscreen ? 'contain' : 'cover'"
      />

      <RouterLink :to="{ name: 'pins', params: { id: item.id } }" custom v-slot="{ href }">
        <a
          :href="href"
          class="absolute inset-0 z-10 rounded-t-[12px] focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none focus-visible:ring-inset"
          :aria-label="`查看作品详情：${item.title}`"
          @click="openDetails"
        />
      </RouterLink>

      <div
        class="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-zinc-950/55 via-transparent to-transparent transition-opacity duration-200 motion-reduce:transition-none xl:opacity-0 xl:group-focus-within:opacity-100 xl:group-hover:opacity-100"
      >
        <div
          class="pointer-events-auto absolute right-[8px] bottom-[8px] flex items-center gap-[6px] xl:right-[10px] xl:bottom-[10px]"
        >
          <button
            type="button"
            class="grid size-[34px] place-items-center rounded-[9px] bg-white/90 text-zinc-900 shadow-sm transition-[background-color,transform] hover:bg-white focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none active:scale-95 motion-reduce:transition-none xl:size-[38px]"
            :aria-label="`下载图片：${item.title}`"
            :disabled="isDownloading"
            :aria-busy="isDownloading"
            @click="downloadImage(item)"
          >
            <span
              v-if="isDownloading"
              class="size-[16px] animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
              aria-hidden="true"
            />
            <MSvgIcon v-else name="download" :size="18" />
          </button>

          <button
            type="button"
            class="grid size-[34px] place-items-center rounded-[9px] bg-white/90 text-zinc-900 shadow-sm transition-[background-color,transform] hover:bg-white focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none active:scale-95 motion-reduce:transition-none xl:size-[38px]"
            :aria-label="`分享到微博：${item.title}`"
            @click="shareItemToWeibo(item)"
          >
            <MSvgIcon name="share" :size="18" />
          </button>

          <button
            type="button"
            class="grid size-[34px] place-items-center rounded-[9px] bg-white/90 text-zinc-900 shadow-sm transition-[background-color,transform] hover:bg-white focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none active:scale-95 motion-reduce:transition-none xl:size-[38px]"
            :aria-label="isFullscreen ? `退出全屏：${item.title}` : `全屏查看：${item.title}`"
            @click="isFullscreen ? closeFullscreen() : openFullscreen()"
          >
            <MSvgIcon :name="isFullscreen ? 'close' : 'fullscreen'" :size="18" />
          </button>
        </div>
      </div>
    </div>

    <div class="px-[12px] pt-[10px] pb-[12px]">
      <h2
        class="line-clamp-2 h-[40px] text-[14px] leading-[20px] font-semibold text-zinc-900 dark:text-zinc-100"
      >
        {{ item.title }}
      </h2>

      <div class="mt-[10px] flex h-[24px] items-center gap-[8px]">
        <img
          :src="item.avatar"
          alt=""
          class="size-[24px] rounded-full bg-zinc-200 object-cover dark:bg-zinc-700"
          loading="lazy"
          decoding="async"
        />
        <span class="truncate text-[13px] text-zinc-500 dark:text-zinc-400">
          {{ item.author }}
        </span>
      </div>
    </div>
  </article>
</template>
