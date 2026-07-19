import { shallowRef } from 'vue'
import { useStorage } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'

import { SEARCH_HISTORY_LIMIT, SEARCH_HISTORY_STORAGE_KEY } from '@/constants'

function normalizeHistory(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  const uniqueEntries = new Set<string>()

  for (const candidate of value) {
    if (typeof candidate !== 'string') {
      continue
    }

    const entry = candidate.trim()

    if (entry) {
      uniqueEntries.add(entry)
    }
  }

  return [...uniqueEntries].slice(0, SEARCH_HISTORY_LIMIT)
}

export const useSearchStore = defineStore('search', () => {
  const searchText = shallowRef('')
  const history = useStorage<string[]>(SEARCH_HISTORY_STORAGE_KEY, [])

  history.value = normalizeHistory(history.value)

  function submitSearch(value: string) {
    const normalizedValue = value.trim()
    searchText.value = normalizedValue

    if (!normalizedValue) {
      return
    }

    history.value = [
      normalizedValue,
      ...history.value.filter((entry) => entry !== normalizedValue)
    ].slice(0, SEARCH_HISTORY_LIMIT)
  }

  function removeHistory(entry: string) {
    history.value = history.value.filter((candidate) => candidate !== entry)
  }

  function clearHistory() {
    history.value = []
  }

  return {
    searchText,
    history,
    submitSearch,
    removeHistory,
    clearHistory
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSearchStore, import.meta.hot))
}
