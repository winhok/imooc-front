<script setup lang="ts">
import { computed, onMounted, shallowRef, toRef, useTemplateRef } from 'vue'
import { onKeyStroke } from '@vueuse/core'
import { useRouter } from 'vue-router'

import { message } from '@/libs/message'
import { isMobileTerminal } from '@/utils/flexible'

import { usePexelsDetail } from '../usePexelsDetail'

defineOptions({ name: 'PinsDetail' })

interface Props {
  id: string
}

const props = defineProps<Props>()
const router = useRouter()
const closeButton = useTemplateRef<HTMLButtonElement>('closeButton')
const isLiked = shallowRef(false)
const { detail, isLoading, errorMessage, retry } = usePexelsDetail(toRef(props, 'id'))

const imageAspectRatio = computed(() => {
  if (!detail.value || detail.value.photoWidth <= 0 || detail.value.photoHeight <= 0) {
    return undefined
  }

  return `${detail.value.photoWidth} / ${detail.value.photoHeight}`
})

function close() {
  const previousLocation = window.history.state?.back

  if (typeof previousLocation === 'string') {
    router.back()
    return
  }

  void router.replace('/')
}

async function share() {
  if (!detail.value) {
    return
  }

  const shareData = {
    title: detail.value.title,
    text: `来自 ${detail.value.author} 的作品`,
    url: window.location.href
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
      return
    }

    await navigator.clipboard.writeText(shareData.url)
    message.success('详情链接已复制')
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return
    }

    message.error('分享失败，请稍后重试')
  }
}

onKeyStroke('Escape', close)

onMounted(() => {
  if (!isMobileTerminal.value) {
    closeButton.value?.focus()
  }
})
</script>

<template>
  <section
    class="h-full overflow-y-auto overscroll-contain bg-zinc-100/95 text-zinc-900 backdrop-blur-2xl dark:bg-zinc-950/95 dark:text-zinc-100"
    role="dialog"
    aria-modal="true"
    :aria-label="detail ? `作品详情：${detail.title}` : '作品详情'"
  >
    <MNavbar
      v-if="isMobileTerminal"
      sticky
      right-label="分享作品"
      @left-click="close"
      @right-click="share"
    >
      {{ detail?.title || '作品详情' }}
      <template #right>
        <MSvgIcon name="share" :size="21" />
      </template>
    </MNavbar>

    <button
      v-else
      ref="closeButton"
      type="button"
      class="fixed top-[20px] right-[20px] z-20 grid size-[44px] place-items-center rounded-full border border-white/15 bg-zinc-950/70 text-white shadow-lg backdrop-blur-xl transition-[background-color,transform] hover:scale-105 hover:bg-zinc-900 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none motion-reduce:transition-none"
      aria-label="关闭作品详情"
      @click="close"
    >
      <MSvgIcon name="close" :size="20" />
    </button>

    <div
      v-if="isLoading"
      class="grid min-h-full place-items-center px-[20px] py-[48px]"
      role="status"
    >
      <div class="flex flex-col items-center gap-[14px] text-sm text-zinc-500 dark:text-zinc-400">
        <span
          class="size-[34px] animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
          aria-hidden="true"
        />
        <span>正在加载作品详情…</span>
      </div>
    </div>

    <div v-else-if="errorMessage" class="grid min-h-full place-items-center px-[20px] py-[48px]">
      <div
        class="max-w-[420px] rounded-[16px] bg-white p-[24px] text-center shadow-xl dark:bg-zinc-900"
      >
        <h1 class="text-base font-semibold">详情暂时无法显示</h1>
        <p class="mt-[10px] text-sm text-zinc-500 dark:text-zinc-400">{{ errorMessage }}</p>
        <div class="mt-[20px] flex justify-center gap-[10px]">
          <MButton variant="neutral" @click="close">返回</MButton>
          <MButton @click="retry">重试</MButton>
        </div>
      </div>
    </div>

    <div
      v-else-if="detail"
      class="mx-auto min-h-full w-full xl:flex xl:max-w-[1320px] xl:items-center xl:px-[48px] xl:py-[32px]"
    >
      <article
        class="overflow-hidden bg-white shadow-2xl xl:grid xl:max-h-[calc(100dvh-64px)] xl:w-full xl:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)] xl:rounded-[20px] dark:bg-zinc-900"
      >
        <div class="grid min-h-[45dvh] place-items-center bg-zinc-950 xl:min-h-0">
          <img
            :src="detail.photo"
            :alt="detail.title"
            :width="detail.photoWidth"
            :height="detail.photoHeight"
            class="max-h-[72dvh] w-full object-contain xl:h-[calc(100dvh-64px)] xl:max-h-[840px]"
            :style="{ aspectRatio: imageAspectRatio }"
            decoding="async"
          />
        </div>

        <div class="flex min-h-[260px] flex-col p-[20px] xl:min-h-0 xl:overflow-y-auto xl:p-[32px]">
          <div class="hidden items-center justify-between xl:flex">
            <button
              type="button"
              class="grid size-[42px] place-items-center rounded-[10px] text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label="分享作品"
              @click="share"
            >
              <MSvgIcon name="share" :size="21" />
            </button>

            <button
              type="button"
              class="grid size-[42px] place-items-center rounded-[10px] transition-colors focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
              :class="
                isLiked
                  ? 'bg-red-50 text-red-500 dark:bg-red-950/40 dark:text-red-400'
                  : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
              "
              :aria-label="isLiked ? '取消收藏' : '收藏作品'"
              :aria-pressed="isLiked"
              @click="isLiked = !isLiked"
            >
              <MSvgIcon name="heart" :size="22" />
            </button>
          </div>

          <h1 class="text-lg font-bold text-balance xl:mt-[36px] xl:text-xl">{{ detail.title }}</h1>

          <a
            :href="detail.authorLike"
            class="mt-[18px] flex w-fit items-center gap-[10px] rounded-[10px] focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-4 focus-visible:outline-none dark:focus-visible:ring-offset-zinc-900"
            :target="detail.authorLike ? '_blank' : undefined"
            :rel="detail.authorLike ? 'noreferrer' : undefined"
            @click="!detail.authorLike && $event.preventDefault()"
          >
            <img
              :src="detail.avatar"
              alt=""
              class="size-[42px] rounded-full bg-zinc-200 object-cover dark:bg-zinc-700"
              width="42"
              height="42"
            />
            <span class="text-sm font-medium">{{ detail.author }}</span>
          </a>

          <ul
            v-if="detail.tags?.length"
            class="mt-[24px] flex flex-wrap gap-[8px]"
            aria-label="作品标签"
          >
            <li
              v-for="tag in detail.tags"
              :key="tag"
              class="rounded-full bg-zinc-100 px-[12px] py-[6px] text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            >
              #{{ tag }}
            </li>
          </ul>

          <div class="mt-auto flex gap-[10px] pt-[32px] xl:hidden">
            <MButton
              class="flex-1"
              variant="neutral"
              icon="heart"
              :aria-label="isLiked ? '取消收藏' : '收藏作品'"
              :aria-pressed="isLiked"
              @click="isLiked = !isLiked"
            />
            <MButton class="flex-1" @click="share">分享作品</MButton>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
