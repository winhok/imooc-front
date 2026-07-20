<script setup lang="ts">
import { computed, shallowRef, toRef } from 'vue'
import { onKeyStroke } from '@vueuse/core'
import { useRouter } from 'vue-router'

import { usePexelsShare } from '@/composables/usePexelsShare'
import { isMobileTerminal } from '@/utils/flexible'

import { usePexelsDetail } from '../usePexelsDetail'

defineOptions({ name: 'PinsDetail' })

interface Props {
  id: string
}

const props = defineProps<Props>()
const router = useRouter()
const isLiked = shallowRef(false)
const { detail, isLoading, errorMessage, retry } = usePexelsDetail(toRef(props, 'id'))
const { shareItem } = usePexelsShare()

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

function share() {
  if (!detail.value) {
    return
  }

  void shareItem(detail.value)
}

onKeyStroke('Escape', close)
</script>

<template>
  <section
    class="h-full overflow-y-auto bg-white pb-[20px] text-zinc-900 backdrop-blur-3xl xl:bg-transparent xl:p-[20px] dark:bg-zinc-800 dark:text-zinc-100"
    role="dialog"
    aria-modal="true"
    :aria-label="detail ? `作品详情：${detail.title}` : '作品详情'"
  >
    <MNavbar v-if="isMobileTerminal" sticky @left-click="close" @right-click="share">
      {{ detail?.title || '作品详情' }}
      <template #right>
        <MSvgIcon name="share" :size="21" />
      </template>
    </MNavbar>

    <button
      v-else
      type="button"
      class="absolute top-[20px] right-[20px] z-20 grid size-[30px] place-items-center rounded text-zinc-400 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:hover:bg-zinc-900"
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

    <div v-else-if="detail" class="mx-auto min-h-full w-full xl:flex xl:h-full xl:min-h-0 xl:w-4/5">
      <article
        class="w-full bg-white xl:flex xl:h-full xl:overflow-hidden xl:rounded-lg dark:bg-zinc-900"
      >
        <div class="w-full xl:h-full xl:w-3/5">
          <img
            :src="detail.photo"
            :alt="detail.title"
            :width="detail.photoWidth"
            :height="detail.photoHeight"
            class="mb-[20px] w-screen xl:mb-0 xl:h-full xl:w-full xl:rounded-l-lg"
            :style="{ aspectRatio: imageAspectRatio }"
            decoding="async"
          />
        </div>

        <div
          class="flex min-h-[220px] flex-col px-[10px] xl:h-full xl:min-h-0 xl:w-2/5 xl:overflow-y-auto xl:rounded-r-lg xl:p-[30px]"
        >
          <div class="mb-[20px] hidden items-center justify-between xl:flex">
            <button
              type="button"
              class="grid size-[40px] place-items-center rounded p-[10px] text-zinc-700 transition-colors hover:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label="分享作品"
              @click="share"
            >
              <MSvgIcon name="share" :size="21" />
            </button>

            <button
              type="button"
              class="grid size-[40px] place-items-center rounded transition-colors focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
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

          <h1 class="ml-[10px] text-base font-bold text-balance xl:mb-[50px] xl:text-xl">
            {{ detail.title }}
          </h1>

          <a
            :href="detail.authorLike"
            class="mt-[10px] flex w-fit items-center rounded focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-4 focus-visible:outline-none dark:focus-visible:ring-offset-zinc-900"
            :target="detail.authorLike ? '_blank' : undefined"
            :rel="detail.authorLike ? 'noreferrer' : undefined"
            @click="!detail.authorLike && $event.preventDefault()"
          >
            <img
              :src="detail.avatar"
              alt=""
              class="size-[30px] rounded-full bg-zinc-200 object-cover dark:bg-zinc-700"
              width="30"
              height="30"
            />
            <span class="ml-[10px] text-base">{{ detail.author }}</span>
          </a>
        </div>
      </article>
    </div>
  </section>
</template>
