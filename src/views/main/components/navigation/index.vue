<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'

import { getCategory } from '@/api/category'
import type { Category } from '@/api/category'
import { ALL_CATEGORY_ITEM } from '@/constants'
import { isMobileTerminal } from '@/utils/flexible'

import MobileNavigation from './mobile/index.vue'

defineOptions({ name: 'NavigationBar' })

const categories = shallowRef<readonly Category[]>([ALL_CATEGORY_ITEM])
const selectedCategoryId = shallowRef(ALL_CATEGORY_ITEM.id)
const isLoading = shallowRef(true)
const errorMessage = shallowRef('')
const requestController = new AbortController()

async function loadCategory() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const { categorys } = await getCategory(requestController.signal)
    categories.value = [
      ALL_CATEGORY_ITEM,
      ...categorys.filter((category) => category.id !== ALL_CATEGORY_ITEM.id)
    ]
  } catch (error) {
    if (!requestController.signal.aborted) {
      errorMessage.value = error instanceof Error ? error.message : '分类加载失败'
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadCategory()
})

onBeforeUnmount(() => {
  requestController.abort()
})
</script>

<template>
  <nav aria-label="作品分类">
    <MobileNavigation v-if="isMobileTerminal" v-model="selectedCategoryId" :data="categories" />

    <p v-if="isLoading" class="sr-only" aria-live="polite">正在加载分类…</p>
    <p
      v-else-if="errorMessage"
      class="bg-red-50 px-[12px] py-[8px] text-xs text-red-700"
      role="alert"
    >
      {{ errorMessage }}
    </p>
  </nav>
</template>
