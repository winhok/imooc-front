<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { nextTick, shallowRef, useTemplateRef, watch } from 'vue'

defineOptions({ name: 'MInfiniteScroll' })

interface Props {
  finished?: boolean
  disabled?: boolean
  rootMargin?: string
}

const props = withDefaults(defineProps<Props>(), {
  finished: false,
  disabled: false,
  rootMargin: '480px 0px'
})

const emit = defineEmits<{
  load: []
}>()

const loading = defineModel<boolean>('loading', { required: true })
const sentinel = useTemplateRef<HTMLElement>('sentinel')
const isIntersecting = shallowRef(false)

function requestNextPage() {
  if (!isIntersecting.value || loading.value || props.finished || props.disabled) {
    return
  }

  loading.value = true
  emit('load')
}

useIntersectionObserver(
  sentinel,
  ([entry]) => {
    isIntersecting.value = entry?.isIntersecting ?? false
    requestNextPage()
  },
  { rootMargin: () => props.rootMargin }
)

watch(
  [loading, () => props.finished, () => props.disabled],
  async () => {
    await nextTick()
    requestNextPage()
  },
  { flush: 'post' }
)
</script>

<template>
  <div>
    <slot />

    <div ref="sentinel" class="flex min-h-[88px] items-center justify-center px-[16px] py-[24px]">
      <div
        v-if="loading"
        class="size-[28px] animate-spin rounded-full border-2 border-zinc-300 border-r-red-500 motion-reduce:animate-none dark:border-zinc-700 dark:border-r-red-400"
        role="status"
        aria-label="正在加载更多作品"
      />
      <p v-else-if="finished" class="text-[14px] text-zinc-500 dark:text-zinc-400">
        已经到底了，没有更多作品
      </p>
      <p v-else-if="disabled" class="sr-only" role="status">自动加载已暂停</p>
    </div>
  </div>
</template>
