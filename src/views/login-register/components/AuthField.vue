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
    <label :for="inputId" class="sr-only">
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
      class="h-[40px] w-full border-0 border-b bg-transparent px-[10px] pb-[10px] text-base text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-b-red-500 motion-reduce:transition-none dark:text-zinc-400 dark:placeholder:text-zinc-600 xl:dark:bg-zinc-900"
      :class="error ? 'border-b-red-500' : 'border-b-zinc-400'"
    />
    <p
      :id="errorId"
      class="mt-[5px] min-h-[18px] text-sm leading-[18px] text-red-600"
      :aria-live="error ? 'polite' : undefined"
    >
      {{ error || '' }}
    </p>
  </div>
</template>
