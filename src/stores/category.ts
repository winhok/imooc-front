import { shallowRef } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'

import { getCategory } from '@/api/category'
import type { Category } from '@/api/category'
import {
  ALL_CATEGORY_ITEM,
  CATEGORY_FALLBACK_DATA,
  CATEGORY_LEGACY_STORAGE_KEY,
  CATEGORY_STORAGE_KEY
} from '@/constants'

const CATEGORY_CACHE_SCHEMA_VERSION = 1

interface CategoryCacheEnvelope {
  schemaVersion: typeof CATEGORY_CACHE_SCHEMA_VERSION
  updatedAt: number
  items: Category[]
}

function normalizeCategories(value: unknown): Category[] | undefined {
  if (!Array.isArray(value)) {
    return undefined
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

  if (value.length > 0 && uniqueCategories.size === 0) {
    return undefined
  }

  return [ALL_CATEGORY_ITEM, ...uniqueCategories.values()]
}

function persistCategories(items: Category[]) {
  const envelope: CategoryCacheEnvelope = {
    schemaVersion: CATEGORY_CACHE_SCHEMA_VERSION,
    updatedAt: Date.now(),
    items
  }

  try {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(envelope))
  } catch {
    // Category data remains usable in memory when storage is unavailable.
  }
}

function loadCategoriesFromStorage() {
  try {
    const currentRaw = localStorage.getItem(CATEGORY_STORAGE_KEY)

    if (currentRaw) {
      const value: unknown = JSON.parse(currentRaw)

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const envelope = value as Partial<CategoryCacheEnvelope>

        if (envelope.schemaVersion === CATEGORY_CACHE_SCHEMA_VERSION) {
          return normalizeCategories(envelope.items)
        }
      }
    }

    const legacyRaw = localStorage.getItem(CATEGORY_LEGACY_STORAGE_KEY)

    if (legacyRaw) {
      const migrated = normalizeCategories(JSON.parse(legacyRaw))

      if (migrated) {
        persistCategories(migrated)
        return migrated
      }
    }
  } catch {
    return undefined
  }

  return undefined
}

export const useCategoryStore = defineStore('category', () => {
  const categories = shallowRef<Category[]>(
    loadCategoriesFromStorage() ?? [...CATEGORY_FALLBACK_DATA]
  )
  const selectedCategoryId = shallowRef(ALL_CATEGORY_ITEM.id)
  const isLoading = shallowRef(false)
  const errorMessage = shallowRef('')

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
      const nextCategories = normalizeCategories(categorys)

      if (!nextCategories) {
        throw new Error('分类响应不包含有效数据')
      }

      categories.value = nextCategories
      persistCategories(nextCategories)

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
