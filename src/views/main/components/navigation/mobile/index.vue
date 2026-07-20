<script setup lang="ts">
import { computed, nextTick, shallowRef, useTemplateRef, watch } from 'vue'
import type { ComponentPublicInstance, CSSProperties } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { storeToRefs } from 'pinia'

import type { Category } from '@/api/category'
import { useCategoryStore } from '@/stores/category'

import CategoryMenu from '../../menu/index.vue'

defineOptions({ name: 'MobileNavigation' })

const categoryStore = useCategoryStore()
const { categories, selectedCategoryId } = storeToRefs(categoryStore)
const isPopupOpen = shallowRef(false)
const scroller = useTemplateRef<HTMLElement>('scroller')
const categoryElements = new Map<string, HTMLElement>()
const sliderMetrics = shallowRef({ left: 10, width: 52 })

const sliderStyle = computed<CSSProperties>(() => ({
  width: `${sliderMetrics.value.width}px`,
  transform: `translateX(${sliderMetrics.value.left}px)`
}))

function setCategoryRef(categoryId: string, element: Element | ComponentPublicInstance | null) {
  if (element instanceof HTMLElement) {
    categoryElements.set(categoryId, element)
  } else {
    categoryElements.delete(categoryId)
  }
}

function updateSlider() {
  const activeElement = categoryElements.get(selectedCategoryId.value)

  if (!activeElement) {
    return
  }

  sliderMetrics.value = {
    left: activeElement.offsetLeft,
    width: activeElement.offsetWidth
  }
}

async function scrollToSelectedCategory() {
  await nextTick()
  updateSlider()
  categoryElements.get(selectedCategoryId.value)?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center'
  })
}

function selectCategory(category: Category) {
  categoryStore.selectCategory(category.id)
  isPopupOpen.value = false
}

watch(
  [categories, selectedCategoryId],
  () => {
    void scrollToSelectedCategory()
  },
  { immediate: true }
)

useResizeObserver(scroller, updateSlider)
</script>

<template>
  <div
    class="sticky top-0 left-0 z-30 bg-white transition-colors duration-300 motion-reduce:transition-none dark:bg-zinc-900"
  >
    <div
      ref="scroller"
      class="[scrollbar-width:none] overflow-x-auto pr-[54px] [&::-webkit-scrollbar]:hidden"
    >
      <div
        class="relative flex min-w-max px-[10px] py-[10px] text-xs text-zinc-600"
        role="tablist"
        aria-label="作品分类"
      >
        <span
          class="pointer-events-none absolute top-[10px] left-0 h-[22px] rounded-lg bg-zinc-900 transition-[width,transform,background-color] duration-200 ease-out motion-reduce:transition-none dark:bg-zinc-800"
          :style="sliderStyle"
          aria-hidden="true"
        />

        <button
          v-for="category in categories"
          :key="category.id"
          :ref="(element) => setCategoryRef(category.id, element)"
          type="button"
          role="tab"
          class="relative z-10 h-[22px] shrink-0 px-[15px] py-[5px] leading-[12px] whitespace-nowrap transition-colors duration-200 last:mr-[40px]"
          :class="
            selectedCategoryId === category.id
              ? 'text-zinc-100'
              : 'text-zinc-600 dark:text-zinc-400'
          "
          :aria-selected="selectedCategoryId === category.id"
          @click="selectCategory(category)"
        >
          {{ category.name }}
        </button>
      </div>
    </div>

    <button
      type="button"
      class="absolute top-0 right-0 z-20 grid h-[40px] w-[54px] place-items-center bg-white text-zinc-900 shadow-left-white transition-colors active:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-100 dark:shadow-left-zinc dark:active:bg-zinc-800"
      aria-label="查看所有分类"
      aria-controls="category-menu-popup"
      :aria-expanded="isPopupOpen"
      @click="isPopupOpen = true"
    >
      <MSvgIcon name="hamburger" :size="22" />
    </button>
  </div>

  <MPopup id="category-menu-popup" v-model="isPopupOpen" aria-labelledby="category-menu-title">
    <CategoryMenu
      :categories="categories"
      :selected-id="selectedCategoryId"
      @select="selectCategory"
      @close="isPopupOpen = false"
    />
  </MPopup>
</template>
