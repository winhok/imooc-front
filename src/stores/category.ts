import { shallowRef } from 'vue'
import { useStorage } from '@vueuse/core'
import { acceptHMRUpdate, defineStore } from 'pinia'

import { getCategory } from '@/api/category'
import type { Category } from '@/api/category'
import { ALL_CATEGORY_ITEM, CATEGORY_FALLBACK_DATA, CATEGORY_STORAGE_KEY } from '@/constants'

function normalizeCategories(value: unknown): Category[] {
  if (!Array.isArray(value)) {
    return [...CATEGORY_FALLBACK_DATA]
  }

  const uniqueCategories = new Map<string, Category>()

  for (const candidate of value) {
    if (
      typeof candidate !== 'object' ||
      candidate === null ||
      !('id' in candidate) ||
      !('name' in candidate) ||
      typeof candidate.id !== 'string' ||
      typeof candidate.name !== 'string' ||
      candidate.id === ALL_CATEGORY_ITEM.id
    ) {
      continue
    }

    uniqueCategories.set(candidate.id, candidate as Category)
  }

  return [ALL_CATEGORY_ITEM, ...uniqueCategories.values()]
}

export const useCategoryStore = defineStore('category', () => {
  const categories = useStorage<Category[]>(CATEGORY_STORAGE_KEY, [...CATEGORY_FALLBACK_DATA])
  const selectedCategoryId = shallowRef(ALL_CATEGORY_ITEM.id)
  const isLoading = shallowRef(false)
  const errorMessage = shallowRef('')

  categories.value = normalizeCategories(categories.value)

  function selectCategory(categoryId: string) {
    if (categories.value.some((category) => category.id === categoryId)) {
      selectedCategoryId.value = categoryId
    }
  }

  async function loadCategories(signal?: AbortSignal) {
    if (isLoading.value) {
      return
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      const { categorys } = await getCategory(signal)
      categories.value = normalizeCategories(categorys)

      if (!categories.value.some((category) => category.id === selectedCategoryId.value)) {
        selectedCategoryId.value = ALL_CATEGORY_ITEM.id
      }
    } catch (error) {
      if (!signal?.aborted) {
        errorMessage.value = error instanceof Error ? error.message : '分类加载失败'
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    categories,
    selectedCategoryId,
    isLoading,
    errorMessage,
    selectCategory,
    loadCategories
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCategoryStore, import.meta.hot))
}
