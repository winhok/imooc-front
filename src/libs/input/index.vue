<script setup lang="ts">
import { computed, useAttrs, useId } from 'vue'

defineOptions({
  name: 'MInput',
  inheritAttrs: false
})

type InputType = 'text' | 'url' | 'textarea'

const props = withDefaults(
  defineProps<{
    type?: InputType
    max?: number
    rows?: number
  }>(),
  {
    type: 'text',
    max: undefined,
    rows: 5
  }
)

const model = defineModel<string>({ default: '' })
const attrs = useAttrs()
const counterId = `input-counter-${useId()}`
const currentLength = computed(() => model.value.length)
const isAtLimit = computed(() => props.max !== undefined && currentLength.value >= props.max)
const describedBy = computed(() =>
  [attrs['aria-describedby'], props.max === undefined ? undefined : counterId]
    .filter(Boolean)
    .join(' ')
)
</script>

<template>
  <div class="relative w-full">
    <textarea
      v-if="type === 'textarea'"
      v-bind="attrs"
      v-model="model"
      :rows="rows"
      :maxlength="max"
      :aria-describedby="describedBy || undefined"
      class="block w-full resize-y rounded-[10px] border border-zinc-200 bg-white px-[12px] py-[9px] pr-[58px] text-sm text-zinc-900 transition-colors outline-none placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-red-400 dark:focus:ring-red-950"
    />
    <input
      v-else
      v-bind="attrs"
      v-model="model"
      :type="type"
      :maxlength="max"
      :aria-describedby="describedBy || undefined"
      class="block h-[42px] w-full rounded-[10px] border border-zinc-200 bg-white px-[12px] pr-[58px] text-sm text-zinc-900 transition-colors outline-none placeholder:text-zinc-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-red-400 dark:focus:ring-red-950"
    />
    <span
      v-if="max !== undefined"
      :id="counterId"
      class="pointer-events-none absolute right-[10px] bottom-[8px] text-xs text-zinc-400"
      :class="isAtLimit ? 'text-red-500' : ''"
      aria-live="polite"
    >
      {{ currentLength }}/{{ max }}
    </span>
  </div>
</template>
