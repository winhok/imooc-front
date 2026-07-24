<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

defineOptions({ name: 'MobileQuickNavItem' })

interface Props {
  icon: string
  label: string
  to?: RouteLocationRaw
  active?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  to: undefined,
  active: false,
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const itemClass = computed(() => [
  'flex min-h-[48px] min-w-[56px] flex-col items-center justify-center gap-[2px] rounded-full px-[10px] text-xs font-medium transition-[color,background-color,transform] focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none active:scale-95 motion-reduce:transition-none',
  props.active
    ? 'bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950'
    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
  props.disabled ? 'pointer-events-none opacity-45' : ''
])

function navigateLink(
  event: MouseEvent,
  navigate: (event?: MouseEvent) => void | Promise<unknown>
) {
  if (props.disabled) {
    event.preventDefault()
    event.stopPropagation()
    return
  }

  void navigate(event)
}
</script>

<template>
  <RouterLink v-if="to" :to="to" custom v-slot="{ href, navigate }">
    <a
      :href="disabled ? undefined : href"
      :class="itemClass"
      :aria-current="active ? 'page' : undefined"
      :aria-disabled="disabled || undefined"
      :tabindex="disabled ? -1 : undefined"
      @click="navigateLink($event, navigate)"
    >
      <MSvgIcon :name="icon" :size="18" />
      <span>{{ label }}</span>
    </a>
  </RouterLink>

  <button
    v-else
    type="button"
    :class="itemClass"
    :disabled="disabled"
    @click="emit('click', $event)"
  >
    <MSvgIcon :name="icon" :size="18" />
    <span>{{ label }}</span>
  </button>
</template>
