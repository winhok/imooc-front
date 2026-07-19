<script setup lang="ts">
import { onScopeDispose, shallowRef } from 'vue'
import { watchDebounced } from '@vueuse/core'

import { getPexelsHints } from '@/api/pexels'

defineOptions({ name: 'SearchHint' })

interface Props {
  query: string
}

interface TextSegment {
  key: string
  text: string
  highlighted: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [value: string]
}>()

const suggestions = shallowRef<string[]>([])
const isLoading = shallowRef(false)
const errorMessage = shallowRef('')

let activeController: AbortController | undefined

function splitHighlightedText(text: string): TextSegment[] {
  const query = props.query.trim()

  if (!query) {
    return [{ key: '0', text, highlighted: false }]
  }

  const normalizedText = text.toLocaleLowerCase()
  const normalizedQuery = query.toLocaleLowerCase()
  const segments: TextSegment[] = []
  let cursor = 0
  let matchIndex = normalizedText.indexOf(normalizedQuery)

  while (matchIndex !== -1) {
    if (matchIndex > cursor) {
      segments.push({
        key: `${cursor}-${matchIndex}`,
        text: text.slice(cursor, matchIndex),
        highlighted: false
      })
    }

    const matchEnd = matchIndex + query.length
    segments.push({
      key: `${matchIndex}-${matchEnd}`,
      text: text.slice(matchIndex, matchEnd),
      highlighted: true
    })
    cursor = matchEnd
    matchIndex = normalizedText.indexOf(normalizedQuery, cursor)
  }

  if (cursor < text.length) {
    segments.push({
      key: `${cursor}-${text.length}`,
      text: text.slice(cursor),
      highlighted: false
    })
  }

  return segments.length ? segments : [{ key: '0', text, highlighted: false }]
}

watchDebounced(
  () => props.query.trim(),
  async (query, _previousQuery, onCleanup) => {
    activeController?.abort()
    activeController = undefined
    errorMessage.value = ''

    if (!query) {
      suggestions.value = []
      isLoading.value = false
      return
    }

    const controller = new AbortController()
    activeController = controller
    isLoading.value = true
    onCleanup(() => controller.abort())

    try {
      const { result } = await getPexelsHints(query, controller.signal)

      if (activeController === controller) {
        suggestions.value = result
      }
    } catch (error) {
      if (!controller.signal.aborted && activeController === controller) {
        suggestions.value = []
        errorMessage.value = error instanceof Error ? error.message : '搜索提示加载失败'
      }
    } finally {
      if (activeController === controller) {
        activeController = undefined
        isLoading.value = false
      }
    }
  },
  { debounce: 300, maxWait: 1000, immediate: true }
)

onScopeDispose(() => {
  activeController?.abort()
})
</script>

<template>
  <div :aria-busy="isLoading">
    <p v-if="isLoading" class="px-[10px] py-[8px] text-xs text-zinc-400" aria-live="polite">
      正在获取搜索建议…
    </p>

    <p v-else-if="errorMessage" class="px-[10px] py-[8px] text-xs text-red-500" role="alert">
      {{ errorMessage }}
    </p>

    <template v-else>
      <button
        v-for="suggestion in suggestions"
        :key="suggestion"
        type="button"
        role="option"
        class="flex w-full items-center gap-[10px] rounded-[8px] px-[10px] py-[9px] text-left text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none motion-reduce:transition-none dark:text-zinc-300 dark:hover:bg-zinc-800"
        @click="emit('select', suggestion)"
      >
        <MSvgIcon name="search" :size="15" class="shrink-0 text-zinc-400" />
        <span class="truncate">
          <template v-for="segment in splitHighlightedText(suggestion)" :key="segment.key">
            <mark
              v-if="segment.highlighted"
              class="bg-transparent font-semibold text-zinc-950 dark:text-zinc-50"
            >
              {{ segment.text }}
            </mark>
            <span v-else>{{ segment.text }}</span>
          </template>
        </span>
      </button>
    </template>
  </div>
</template>
