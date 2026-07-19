<script setup lang="ts">
import type { Category } from '@/api/category'

defineOptions({ name: 'CategoryMenu' })

defineProps<{
  categories: readonly Category[]
  selectedId: string
}>()

const emit = defineEmits<{
  select: [category: Category]
  close: []
}>()
</script>

<template>
  <div class="flex h-[80dvh] flex-col pb-[max(16px,env(safe-area-inset-bottom))]">
    <header class="flex items-center justify-between border-b border-zinc-100 px-[20px] py-[16px]">
      <div>
        <p class="mb-[2px] text-xs font-medium tracking-[0.12em] text-zinc-400">CATEGORY</p>
        <h2 id="category-menu-title" class="text-xl font-bold text-zinc-950">所有分类</h2>
      </div>

      <button
        type="button"
        class="grid size-[38px] place-items-center rounded-full bg-zinc-100 text-zinc-700 transition-colors active:bg-zinc-200"
        aria-label="关闭分类菜单"
        @click="emit('close')"
      >
        <MSvgIcon name="close" :size="20" />
      </button>
    </header>

    <ul class="grid flex-1 grid-cols-2 gap-[8px] overflow-y-auto px-[16px] py-[14px]">
      <li v-for="category in categories" :key="category.id">
        <button
          type="button"
          class="flex min-h-[48px] w-full items-center rounded-[12px] px-[14px] text-left text-sm font-medium transition-colors"
          :class="
            selectedId === category.id
              ? 'bg-zinc-950 text-white'
              : 'bg-zinc-100 text-zinc-700 active:bg-zinc-200'
          "
          :aria-current="selectedId === category.id ? 'true' : undefined"
          @click="emit('select', category)"
        >
          {{ category.name }}
        </button>
      </li>
    </ul>
  </div>
</template>
