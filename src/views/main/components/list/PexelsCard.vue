<script setup lang="ts">
import { computed } from 'vue'

import type { PexelsItem } from '@/types/pexels'
import { colorFromString } from '@/utils/color'

defineOptions({ name: 'PexelsCard' })

interface Props {
  item: PexelsItem
  imageHeight: number
}

const props = defineProps<Props>()

const placeholderColor = computed(() => colorFromString(props.item.id))
</script>

<template>
  <article
    class="h-full overflow-hidden rounded-[12px] bg-white shadow-sm ring-1 ring-black/5 transition-[background-color,box-shadow] duration-300 hover:shadow-md dark:bg-zinc-900 dark:ring-white/10 xl:dark:bg-zinc-900"
  >
    <div class="group relative w-full cursor-zoom-in overflow-hidden rounded-t-[12px]">
      <MLazyImage
        :src="item.photo"
        :alt="item.title"
        :width="item.photoWidth"
        :height="item.photoHeight"
        :display-height="imageHeight"
        :placeholder-color="placeholderColor"
      />

      <div
        class="pointer-events-none absolute inset-0 hidden bg-zinc-950/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none xl:block"
        aria-hidden="true"
      >
        <span
          class="absolute top-[10px] left-[10px] rounded-[8px] bg-red-500 px-[12px] py-[7px] text-[12px] font-medium text-white"
        >
          分享
        </span>
        <span
          class="absolute right-[10px] bottom-[10px] rounded-[8px] bg-white/90 px-[10px] py-[7px] text-[12px] font-medium text-zinc-900"
        >
          查看大图
        </span>
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
