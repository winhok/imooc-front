<script setup lang="ts">
import { shallowRef } from 'vue'

defineOptions({ name: 'HeaderSearch' })

const query = shallowRef('')
const suggestions = ['AI 绘画', '前端架构', 'Vue 3'] as const

function selectSuggestion(value: string, search: () => void) {
  query.value = value
  search()
}
</script>

<template>
  <div>
    <MSearch v-model="query" aria-label="搜索作品">
      <template #dropdown="{ query: currentQuery, close, search }">
        <div class="px-[6px] py-[4px]">
          <div v-if="currentQuery" role="option">
            <button
              type="button"
              class="flex w-full items-center gap-[10px] rounded-[8px] px-[10px] py-[9px] text-left text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
              @click="search"
            >
              <MSvgIcon name="search" :size="16" color="#71717a" />
              <span class="truncate">搜索“{{ currentQuery }}”</span>
            </button>
          </div>

          <div v-else>
            <div class="mb-[6px] flex items-center justify-between px-[10px]">
              <span class="text-xs font-medium text-zinc-400">热门搜索</span>
              <button
                type="button"
                class="text-xs text-zinc-400 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
                @click="close"
              >
                关闭
              </button>
            </div>
            <div class="flex flex-wrap gap-[8px] px-[10px] pb-[6px]">
              <button
                v-for="suggestion in suggestions"
                :key="suggestion"
                type="button"
                role="option"
                class="rounded-full bg-zinc-100 px-[12px] py-[7px] text-xs text-zinc-700 transition-colors hover:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
                @click="selectSuggestion(suggestion, search)"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </MSearch>
  </div>
</template>
