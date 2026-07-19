<script setup lang="ts">
import { computed, nextTick, shallowRef, useTemplateRef, watch } from 'vue'
import type { ComponentPublicInstance, CSSProperties } from 'vue'
import { useResizeObserver } from '@vueuse/core'

import type { Category } from '@/api/category'

import CategoryMenu from '../../menu/index.vue'

defineOptions({ name: 'MobileNavigation' })

const props = defineProps<{
  data: readonly Category[]
}>()

const selectedCategoryId = defineModel<string>({ required: true })
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
  selectedCategoryId.value = category.id
  isPopupOpen.value = false
}

watch(
  [() => props.data, selectedCategoryId],
  () => {
    if (!props.data.some((category) => category.id === selectedCategoryId.value)) {
      selectedCategoryId.value = props.data[0]?.id ?? ''
    }

    void scrollToSelectedCategory()
  },
  { immediate: true }
)

useResizeObserver(scroller, updateSlider)
</script>

<template>
  <div class="sticky top-0 left-0 z-30 border-b border-zinc-100 bg-white/95 backdrop-blur">
    <div
      ref="scroller"
      class="[scrollbar-width:none] overflow-x-auto pr-[56px] [&::-webkit-scrollbar]:hidden"
    >
      <div
        class="relative flex min-w-max gap-[2px] px-[10px] py-[5px]"
        role="tablist"
        aria-label="作品分类"
      >
        <span
          class="pointer-events-none absolute top-[5px] left-0 h-[30px] rounded-full bg-zinc-950 transition-[width,transform] duration-200 ease-out motion-reduce:transition-none"
          :style="sliderStyle"
          aria-hidden="true"
        />

        <button
          v-for="category in data"
          :key="category.id"
          :ref="(element) => setCategoryRef(category.id, element)"
          type="button"
          role="tab"
          class="relative z-10 h-[30px] shrink-0 rounded-full px-[12px] text-xs font-medium whitespace-nowrap transition-colors duration-200"
          :class="
            selectedCategoryId === category.id ? 'text-white' : 'text-zinc-600 active:text-zinc-950'
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
      class="absolute top-0 right-0 grid h-[40px] w-[54px] place-items-center bg-white text-zinc-900 shadow-left-white active:bg-zinc-50"
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
      :categories="data"
      :selected-id="selectedCategoryId"
      @select="selectCategory"
      @close="isPopupOpen = false"
    />
  </MPopup>
</template>
