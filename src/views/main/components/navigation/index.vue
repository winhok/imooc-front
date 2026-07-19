<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import { useCategoryStore } from '@/stores/category'
import { isMobileTerminal } from '@/utils/flexible'

import MobileNavigation from './mobile/index.vue'
import PcNavigation from './pc/index.vue'

defineOptions({ name: 'NavigationBar' })

const categoryStore = useCategoryStore()
const { isLoading, errorMessage } = storeToRefs(categoryStore)
const requestController = new AbortController()

onMounted(() => {
  void categoryStore.loadCategories(requestController.signal)
})

onBeforeUnmount(() => {
  requestController.abort()
})
</script>

<template>
  <nav aria-label="作品分类">
    <MobileNavigation v-if="isMobileTerminal" />
    <PcNavigation v-else />

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
