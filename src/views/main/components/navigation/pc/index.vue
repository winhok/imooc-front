<script setup lang="ts">
import { nextTick, shallowRef, useTemplateRef, watch } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { storeToRefs } from 'pinia'

import { useCategoryStore } from '@/stores/category'

defineOptions({ name: 'PcNavigation' })

const COLLAPSED_HEIGHT = 52

const categoryStore = useCategoryStore()
const { categories, selectedCategoryId } = storeToRefs(categoryStore)
const isExpanded = shallowRef(false)
const isExpandable = shallowRef(false)
const categoryList = useTemplateRef<HTMLElement>('categoryList')

function updateExpandableState() {
  isExpandable.value = (categoryList.value?.scrollHeight ?? 0) > COLLAPSED_HEIGHT

  if (!isExpandable.value) {
    isExpanded.value = false
  }
}

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

watch(
  categories,
  async () => {
    await nextTick()
    updateExpandableState()
  },
  { immediate: true }
)

useResizeObserver(categoryList, updateExpandableState)
</script>

<template>
  <div class="sticky top-0 left-0 z-30 border-b border-zinc-100 bg-white/95 backdrop-blur">
    <div class="relative mx-auto max-w-[1024px] px-[24px]">
      <ul
        id="desktop-category-list"
        ref="categoryList"
        class="flex flex-wrap content-start gap-x-[6px] gap-y-[8px] overflow-hidden py-[8px] pr-[48px] transition-[max-height] duration-300 ease-out motion-reduce:transition-none"
        :class="isExpanded ? 'max-h-[50dvh] overflow-y-auto' : 'max-h-[52px]'"
        role="tablist"
        aria-label="作品分类"
      >
        <li v-for="category in categories" :key="category.id" class="shrink-0">
          <button
            type="button"
            role="tab"
            class="h-[36px] rounded-[8px] px-[14px] text-sm font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
            :class="
              selectedCategoryId === category.id
                ? 'bg-zinc-950 text-white'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            "
            :aria-selected="selectedCategoryId === category.id"
            @click="categoryStore.selectCategory(category.id)"
          >
            {{ category.name }}
          </button>
        </li>
      </ul>

      <div
        v-if="isExpandable"
        class="absolute top-[8px] right-[24px] bg-linear-to-l from-white via-white to-white/70 pl-[10px]"
      >
        <button
          type="button"
          class="grid size-[36px] place-items-center rounded-[8px] text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:outline-none"
          aria-controls="desktop-category-list"
          :aria-expanded="isExpanded"
          :aria-label="isExpanded ? '收起分类' : '展开全部分类'"
          @click="toggleExpanded"
        >
          <MSvgIcon
            name="chevron-down"
            :size="20"
            class="transition-transform duration-300 motion-reduce:transition-none"
            :class="{ 'rotate-180': isExpanded }"
          />
        </button>
      </div>
    </div>
  </div>
</template>
