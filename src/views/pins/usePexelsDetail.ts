import { computed, readonly, shallowRef, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

import { getPexelsById } from '@/api/pexels'
import type { PexelsItem } from '@/types/pexels'

export function usePexelsDetail(id: MaybeRefOrGetter<string>) {
  const detail = shallowRef<PexelsItem>()
  const isLoading = shallowRef(false)
  const errorMessage = shallowRef('')
  const reloadToken = shallowRef(0)
  const resolvedId = computed(() => toValue(id))

  watch(
    [resolvedId, reloadToken],
    async ([currentId], _previous, onCleanup) => {
      const controller = new AbortController()
      onCleanup(() => controller.abort())

      detail.value = undefined
      isLoading.value = true
      errorMessage.value = ''

      try {
        detail.value = await getPexelsById(currentId, controller.signal)
      } catch (error) {
        if (!controller.signal.aborted) {
          errorMessage.value = error instanceof Error ? error.message : '作品详情加载失败'
        }
      } finally {
        if (!controller.signal.aborted) {
          isLoading.value = false
        }
      }
    },
    { immediate: true }
  )

  function retry() {
    reloadToken.value += 1
  }

  return {
    detail: readonly(detail),
    isLoading: readonly(isLoading),
    errorMessage: readonly(errorMessage),
    retry
  }
}
