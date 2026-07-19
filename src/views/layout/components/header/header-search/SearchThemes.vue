<script setup lang="ts">
import { onScopeDispose, shallowRef } from 'vue'

import { getPexelsThemes } from '@/api/pexels'
import type { PexelsTheme } from '@/types/pexels'
import { colorFromString } from '@/utils/color'

defineOptions({ name: 'SearchThemes' })

const emit = defineEmits<{
  select: [theme: PexelsTheme]
}>()

const themes = shallowRef<PexelsTheme[]>([])
const isLoading = shallowRef(false)
const errorMessage = shallowRef('')
const controller = new AbortController()

async function loadThemes() {
  isLoading.value = true

  try {
    const response = await getPexelsThemes(controller.signal)
    themes.value = response.themes.slice(0, 5)
  } catch (error) {
    if (!controller.signal.aborted) {
      errorMessage.value = error instanceof Error ? error.message : '热门精选加载失败'
    }
  } finally {
    isLoading.value = false
  }
}

void loadThemes()

onScopeDispose(() => {
  controller.abort()
})
</script>

<template>
  <section class="border-t border-zinc-100 px-[10px] pt-[12px] dark:border-zinc-800">
    <h2 class="mb-[8px] text-xs font-medium text-zinc-400 dark:text-zinc-500">热门精选</h2>

    <p v-if="isLoading" class="py-[16px] text-xs text-zinc-400" aria-live="polite">
      正在加载热门精选…
    </p>
    <p v-else-if="errorMessage" class="py-[8px] text-xs text-red-500" role="alert">
      {{ errorMessage }}
    </p>

    <div v-else class="grid grid-cols-2 gap-[8px]">
      <button
        v-for="(theme, index) in themes"
        :key="theme.id"
        type="button"
        class="group/theme relative overflow-hidden rounded-[10px] text-left focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
        :class="index === 0 ? 'col-span-2' : ''"
        @click="emit('select', theme)"
      >
        <MLazyImage
          :src="theme.photo"
          :alt="`${theme.title}主题图片`"
          :width="360"
          :height="250"
          :display-height="index === 0 ? 96 : 72"
          :placeholder-color="colorFromString(theme.id)"
          root-margin="160px 0px"
        />
        <span
          class="absolute inset-0 flex items-end bg-linear-to-t from-zinc-950/75 via-zinc-950/10 to-transparent px-[10px] py-[8px] text-xs font-semibold text-white transition-colors group-hover/theme:from-zinc-950/90 motion-reduce:transition-none"
        >
          # {{ theme.title }}
        </span>
      </button>
    </div>
  </section>
</template>
