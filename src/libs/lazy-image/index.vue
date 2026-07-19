<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { computed, shallowRef, useTemplateRef } from 'vue'
import type { CSSProperties } from 'vue'

defineOptions({ name: 'MLazyImage' })

interface Props {
  src: string
  alt: string
  width: number
  height: number
  displayHeight?: number | string
  placeholderColor?: string
  rootMargin?: string
  fit?: 'cover' | 'contain'
}

const props = withDefaults(defineProps<Props>(), {
  placeholderColor: '#e4e4e7',
  rootMargin: '320px 0px',
  fit: 'cover'
})

const wrapper = useTemplateRef<HTMLElement>('wrapper')
const shouldLoad = shallowRef(false)
const isLoaded = shallowRef(false)
const hasError = shallowRef(false)

const wrapperStyle = computed<CSSProperties>(() => ({
  width: '100%',
  height:
    typeof props.displayHeight === 'string'
      ? props.displayHeight
      : `${Math.max(0, props.displayHeight ?? props.height)}px`,
  backgroundColor: props.placeholderColor
}))

const imageFitClass = computed(() => (props.fit === 'contain' ? 'object-contain' : 'object-cover'))

const { stop } = useIntersectionObserver(
  wrapper,
  ([entry]) => {
    if (!entry?.isIntersecting) {
      return
    }

    shouldLoad.value = true
    stop()
  },
  { rootMargin: () => props.rootMargin }
)

function handleLoad() {
  isLoaded.value = true
}

function handleError() {
  hasError.value = true
}
</script>

<template>
  <div ref="wrapper" class="relative overflow-hidden" :style="wrapperStyle">
    <img
      v-if="shouldLoad && !hasError"
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      class="size-full opacity-0 transition-opacity duration-300 motion-reduce:transition-none"
      :class="[imageFitClass, isLoaded ? 'opacity-100' : '']"
      loading="lazy"
      decoding="async"
      @load="handleLoad"
      @error="handleError"
    />

    <div
      v-if="shouldLoad && !isLoaded && !hasError"
      class="absolute inset-0 animate-pulse bg-white/20 motion-reduce:animate-none"
      aria-hidden="true"
    />

    <div
      v-if="hasError"
      class="absolute inset-0 grid place-items-center bg-zinc-100 text-[13px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
      role="img"
      :aria-label="`${alt}加载失败`"
    >
      图片加载失败
    </div>
  </div>
</template>
