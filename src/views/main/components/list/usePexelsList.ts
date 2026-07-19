import { onScopeDispose, shallowRef } from 'vue'

import { getPexelsList } from '@/api/pexels'
import type { PexelsItem } from '@/types/pexels'

const PAGE_SIZE = 20

export function usePexelsList() {
  const items = shallowRef<PexelsItem[]>([])
  const page = shallowRef(0)
  const isLoading = shallowRef(false)
  const isFinished = shallowRef(false)
  const errorMessage = shallowRef('')

  let activeController: AbortController | undefined

  async function loadNextPage() {
    if (activeController || isFinished.value) {
      return
    }

    const nextPage = page.value + 1
    const controller = new AbortController()
    activeController = controller
    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await getPexelsList({ page: nextPage, size: PAGE_SIZE }, controller.signal)
      const existingIds = new Set(items.value.map((item) => item.id))
      const newItems = response.list.filter((item) => !existingIds.has(item.id))

      items.value = [...items.value, ...newItems]
      page.value = nextPage
      isFinished.value =
        response.list.length === 0 ||
        response.list.length < PAGE_SIZE ||
        items.value.length >= response.total
    } catch (error) {
      if (!controller.signal.aborted) {
        errorMessage.value = error instanceof Error ? error.message : '作品加载失败'
      }
    } finally {
      if (activeController === controller) {
        activeController = undefined
      }

      isLoading.value = false
    }
  }

  function retry() {
    errorMessage.value = ''
    return loadNextPage()
  }

  onScopeDispose(() => {
    activeController?.abort()
  })

  return {
    items,
    isLoading,
    isFinished,
    errorMessage,
    loadNextPage,
    retry
  }
}
