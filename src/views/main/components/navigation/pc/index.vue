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
  <div
    class="sticky top-0 left-0 z-30 w-full bg-white transition-colors duration-300 motion-reduce:transition-none dark:bg-zinc-800"
  >
    <div class="relative mx-auto w-[800px]">
      <ul
        id="desktop-category-list"
        ref="categoryList"
        class="flex flex-wrap justify-center overflow-hidden px-[10px] py-[10px] pr-[48px] text-xs text-zinc-600 transition-[height] duration-300 motion-reduce:transition-none"
        :class="isExpanded ? 'h-[206px] overflow-y-auto' : 'h-[56px]'"
        role="tablist"
        aria-label="作品分类"
      >
        <li v-for="category in categories" :key="category.id" class="shrink-0">
          <button
            type="button"
            role="tab"
            class="mr-[10px] mb-[10px] h-[40px] cursor-pointer rounded px-[15px] text-base leading-[40px] font-bold whitespace-nowrap text-zinc-900 transition-colors duration-200 hover:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none motion-reduce:transition-none dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
            :class="
              selectedCategoryId === category.id
                ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-300'
                : ''
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
        class="absolute right-[10px] bottom-[10px] bg-white pl-[10px] dark:bg-zinc-800"
      >
        <button
          type="button"
          class="grid size-[40px] place-items-center rounded text-zinc-700 transition-colors hover:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:text-zinc-300 dark:hover:bg-zinc-900"
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
