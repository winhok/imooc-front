<script setup lang="ts">
import { computed, useId } from 'vue'

defineOptions({
  name: 'AuthField',
  inheritAttrs: false
})

interface Props {
  label: string
  name: string
  type?: 'text' | 'password'
  autocomplete?: string
  placeholder?: string
  error?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  autocomplete: undefined,
  placeholder: undefined,
  error: undefined
})

const model = defineModel<string>({ required: true })
const inputId = useId()
const errorId = computed(() => `${inputId}-error`)
</script>

<template>
  <div class="text-left">
    <label
      :for="inputId"
      class="mb-[7px] block text-sm font-medium text-zinc-700 dark:text-zinc-200"
    >
      {{ label }}
    </label>
    <input
      :id="inputId"
      v-model="model"
      v-bind="$attrs"
      :name="name"
      :type="type"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="error ? errorId : undefined"
      class="h-[44px] w-full rounded-[10px] border bg-white px-[13px] text-sm text-zinc-900 transition-[border-color,box-shadow,background-color] outline-none placeholder:text-zinc-400 focus:border-red-400 focus:ring-3 focus:ring-red-100 motion-reduce:transition-none dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:ring-red-950/60"
      :class="error ? 'border-red-400' : 'border-zinc-200 dark:border-zinc-700'"
    />
    <p
      :id="errorId"
      class="mt-[5px] min-h-[18px] text-xs leading-[18px] text-red-500"
      :aria-live="error ? 'polite' : undefined"
    >
      {{ error || '' }}
    </p>
  </div>
</template>
