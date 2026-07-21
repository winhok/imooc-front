<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useCommands } from '@/libs/command'
import { useSearchStore } from '@/stores/search'

defineOptions({ name: 'SearchHistory' })

const emit = defineEmits<{
  select: [value: string]
}>()

const searchStore = useSearchStore()
const { confirm } = useCommands()
const { history } = storeToRefs(searchStore)

async function clearAllHistory() {
  const shouldClear = await confirm({
    title: '清空搜索历史',
    content: '这会删除全部搜索记录，且无法撤销。',
    confirmText: '清空'
  })

  if (shouldClear) {
    searchStore.clearHistory()
  }
}
</script>

<template>
  <section v-if="history.length" aria-labelledby="search-history-title">
    <div class="mb-[8px] flex items-center justify-between px-[10px]">
      <h2 id="search-history-title" class="text-xs font-medium text-zinc-400 dark:text-zinc-500">
        最近搜索
      </h2>
      <button
        type="button"
        class="rounded-[6px] px-[6px] py-[3px] text-xs text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none motion-reduce:transition-none dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        @click="clearAllHistory"
      >
        清空
      </button>
    </div>

    <div class="flex flex-wrap gap-[8px] px-[10px] pb-[12px]">
      <div
        v-for="entry in history"
        :key="entry"
        class="flex max-w-full items-center rounded-full bg-zinc-100 text-xs text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        <button
          type="button"
          class="max-w-[180px] truncate py-[7px] pl-[12px] focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
          @click="emit('select', entry)"
        >
          {{ entry }}
        </button>
        <button
          type="button"
          class="grid size-[28px] shrink-0 place-items-center rounded-full text-zinc-400 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:text-zinc-500 dark:hover:text-zinc-200"
          :aria-label="`删除搜索记录：${entry}`"
          @click="searchStore.removeHistory(entry)"
        >
          <MSvgIcon name="close" :size="11" />
        </button>
      </div>
    </div>
  </section>
</template>
