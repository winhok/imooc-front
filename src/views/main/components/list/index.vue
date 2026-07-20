<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import type { PexelsItem } from '@/types/pexels'
import { isMobileTerminal } from '@/utils/flexible'
import { setPinsTransitionSource } from '@/views/pins/usePinsTransition'
import type { PinsTransitionOrigin } from '@/views/pins/usePinsTransition'

import PexelsCard from './PexelsCard.vue'
import { usePexelsList } from './usePexelsList'

defineOptions({ name: 'PexelsList' })

const CARD_CONTENT_HEIGHT = 78
const FALLBACK_ASPECT_RATIO = 4 / 3

const { items, isLoading, isFinished, errorMessage, loadNextPage, retry } = usePexelsList()
const router = useRouter()

const columns = computed(() => (isMobileTerminal.value ? 2 : 5))
const columnGap = computed(() => (isMobileTerminal.value ? 10 : 20))
const rowGap = computed(() => (isMobileTerminal.value ? 10 : 20))

function getAspectRatio(item: PexelsItem) {
  if (item.photoWidth <= 0 || item.photoHeight <= 0) {
    return FALLBACK_ASPECT_RATIO
  }

  return item.photoWidth / item.photoHeight
}

function getImageHeight(item: PexelsItem, width: number) {
  return width / getAspectRatio(item)
}

function getCardHeight(item: PexelsItem, width: number) {
  return getImageHeight(item, width) + CARD_CONTENT_HEIGHT
}

function getItemKey(item: PexelsItem) {
  return item.id
}

function openDetails(payload: { item: PexelsItem; origin: PinsTransitionOrigin }) {
  setPinsTransitionSource(payload.item.id, payload.origin)
  void router.push({ name: 'pins', params: { id: payload.item.id } })
}
</script>

<template>
  <section aria-label="作品瀑布流">
    <div
      v-if="errorMessage"
      class="mx-auto mb-[20px] flex max-w-[720px] items-center justify-between gap-[16px] rounded-[12px] border border-red-200 bg-red-50 px-[16px] py-[12px] text-[14px] text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-300"
      role="alert"
    >
      <span>{{ errorMessage }}</span>
      <MButton size="small" variant="accent" :loading="isLoading" @click="retry">重试</MButton>
    </div>

    <MInfiniteScroll
      v-model:loading="isLoading"
      :finished="isFinished"
      :disabled="Boolean(errorMessage)"
      @load="loadNextPage"
    >
      <MWaterfall
        :items="items"
        :columns="columns"
        :column-gap="columnGap"
        :row-gap="rowGap"
        :get-key="getItemKey"
        :get-item-height="getCardHeight"
      >
        <template #default="{ item, width }">
          <PexelsCard
            :item="item"
            :image-height="getImageHeight(item, width)"
            @open-details="openDetails"
          />
        </template>
      </MWaterfall>
    </MInfiniteScroll>
  </section>
</template>
