<script setup lang="ts">
import { computed, shallowRef, useId, useTemplateRef } from 'vue'
import type { VNode } from 'vue'

defineOptions({ name: 'MSearch' })

interface Props {
  placeholder?: string
  ariaLabel?: string
  clearable?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜索',
  ariaLabel: '搜索',
  clearable: true,
  disabled: false
})

const emit = defineEmits<{
  clear: []
  input: [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  search: [value: string]
}>()

const slots = defineSlots<{
  dropdown(props: { query: string; close: () => void; search: () => void }): VNode[]
}>()

const query = defineModel<string>({ default: '' })
const isFocused = shallowRef(false)
const root = useTemplateRef<HTMLElement>('root')
const input = useTemplateRef<HTMLInputElement>('input')
const dropdownId = `search-dropdown-${useId()}`
const hasDropdown = computed(() => Boolean(slots.dropdown))
const isDropdownOpen = computed(() => isFocused.value && hasDropdown.value)

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  query.value = value
  emit('input', value)
}

function onFocus(event: FocusEvent) {
  isFocused.value = true
  emit('focus', event)
}

function onFocusOut(event: FocusEvent) {
  const nextTarget = event.relatedTarget

  if (nextTarget instanceof Node && root.value?.contains(nextTarget)) {
    return
  }

  isFocused.value = false
  emit('blur', event)
}

function closeDropdown() {
  isFocused.value = false
}

function clear() {
  query.value = ''
  emit('input', '')
  emit('clear')
  input.value?.focus()
}

function search() {
  emit('search', query.value.trim())
  closeDropdown()
}
</script>

<template>
  <div
    ref="root"
    class="group relative rounded-[14px] border border-transparent p-[2px] transition-colors duration-300 focus-within:border-red-200 focus-within:bg-red-50/60 hover:border-red-100 hover:bg-red-50/60 dark:focus-within:border-red-900 dark:focus-within:bg-red-950/30 dark:hover:border-red-950 dark:hover:bg-red-950/30"
    @focusout="onFocusOut"
  >
    <div class="relative">
      <MSvgIcon
        name="search"
        :size="18"
        class="pointer-events-none absolute top-1/2 left-[16px] -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
      />

      <input
        ref="input"
        :value="query"
        type="search"
        class="block h-[44px] w-full appearance-none rounded-[11px] border border-zinc-100 bg-zinc-100 pr-[104px] pl-[46px] text-sm font-medium tracking-wide text-zinc-900 caret-red-500 transition-[background-color,border-color] duration-300 outline-none placeholder:font-normal placeholder:text-zinc-400 hover:border-zinc-200 hover:bg-white focus:border-red-300 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:focus:border-red-800 dark:focus:bg-zinc-800 [&::-webkit-search-cancel-button]:hidden"
        :placeholder="props.placeholder"
        :aria-label="props.ariaLabel"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="isDropdownOpen"
        :aria-controls="hasDropdown ? dropdownId : undefined"
        :disabled="props.disabled"
        @input="onInput"
        @focus="onFocus"
        @keydown.enter.prevent="search"
        @keydown.escape="closeDropdown"
      />

      <button
        v-if="props.clearable && query"
        type="button"
        class="absolute top-1/2 right-[58px] grid size-[30px] -translate-y-1/2 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:text-zinc-500 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
        aria-label="清空搜索内容"
        @click="clear"
      >
        <MSvgIcon name="close" :size="14" />
      </button>

      <span
        class="pointer-events-none absolute top-1/2 right-[51px] h-[18px] w-px -translate-y-1/2 bg-zinc-200 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 dark:bg-zinc-700"
        aria-hidden="true"
      />

      <MButton
        class="absolute top-1/2 right-[6px] -translate-y-1/2 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
        icon="search"
        size="small"
        aria-label="执行搜索"
        :disabled="props.disabled"
        @click="search"
      />
    </div>

    <Transition name="search-dropdown">
      <div
        v-if="isDropdownOpen"
        :id="dropdownId"
        class="absolute top-[54px] left-0 z-30 max-h-[368px] w-full overflow-auto rounded-[12px] border border-zinc-200 bg-white p-[8px] text-sm shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        role="listbox"
      >
        <slot name="dropdown" :query="query" :close="closeDropdown" :search="search" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.search-dropdown-enter-active,
.search-dropdown-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.search-dropdown-enter-from,
.search-dropdown-leave-to {
  transform: translateY(8px);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .search-dropdown-enter-active,
  .search-dropdown-leave-active {
    transition-duration: 1ms;
  }
}
</style>
