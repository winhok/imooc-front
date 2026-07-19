<script setup lang="ts">
import { shallowRef } from 'vue'
import { storeToRefs } from 'pinia'

import { useSearchStore } from '@/stores/search'
import type { PexelsTheme } from '@/types/pexels'

import SearchHint from './SearchHint.vue'
import SearchHistory from './SearchHistory.vue'
import SearchThemes from './SearchThemes.vue'

defineOptions({ name: 'HeaderSearch' })

const searchStore = useSearchStore()
const { searchText } = storeToRefs(searchStore)
const query = shallowRef(searchText.value)

function submitSearch(value: string) {
  const normalizedValue = value.trim()
  query.value = normalizedValue
  searchStore.submitSearch(normalizedValue)
}

function selectAndClose(value: string, close: () => void) {
  submitSearch(value)
  close()
}

function selectTheme(theme: PexelsTheme, close: () => void) {
  submitSearch(theme.title)
  close()
}
</script>

<template>
  <div>
    <MSearch v-model="query" aria-label="搜索作品" @search="submitSearch" @clear="submitSearch('')">
      <template #dropdown="{ query: currentQuery, close, search }">
        <div class="px-[6px] py-[4px]">
          <template v-if="currentQuery">
            <button
              type="button"
              class="flex w-full items-center gap-[10px] rounded-[8px] px-[10px] py-[9px] text-left text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:text-zinc-300 dark:hover:bg-zinc-800"
              role="option"
              @click="search"
            >
              <MSvgIcon name="search" :size="16" class="text-zinc-500 dark:text-zinc-400" />
              <span class="truncate">搜索“{{ currentQuery }}”</span>
            </button>

            <SearchHint :query="currentQuery" @select="(value) => selectAndClose(value, close)" />
          </template>

          <template v-else>
            <SearchHistory @select="(value) => selectAndClose(value, close)" />
            <SearchThemes @select="(theme) => selectTheme(theme, close)" />
          </template>
        </div>
      </template>
    </MSearch>
  </div>
</template>
