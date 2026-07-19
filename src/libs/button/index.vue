<script setup lang="ts">
import { computed } from 'vue'
import type { ButtonHTMLAttributes, VNode } from 'vue'

defineOptions({
  name: 'MButton',
  inheritAttrs: false
})

type ButtonVariant = 'primary' | 'accent' | 'neutral'
type ButtonSize = 'default' | 'small'

interface Props {
  icon?: string
  iconColor?: string
  variant?: ButtonVariant
  size?: ButtonSize
  activeAnimation?: boolean
  loading?: boolean
  disabled?: boolean
  nativeType?: ButtonHTMLAttributes['type']
}

const props = withDefaults(defineProps<Props>(), {
  icon: undefined,
  iconColor: 'currentColor',
  variant: 'accent',
  size: 'default',
  activeAnimation: true,
  loading: false,
  disabled: false,
  nativeType: 'button'
})

defineSlots<{
  default(): VNode[]
}>()

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-zinc-900 text-white hover:bg-zinc-800',
  accent: 'bg-red-500 text-white hover:bg-red-600',
  neutral: 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
}

const textSizeClasses: Record<ButtonSize, string> = {
  default: 'h-[40px] min-w-[96px] px-[18px] text-sm',
  small: 'h-[32px] min-w-[72px] px-[14px] text-xs'
}

const iconSizeClasses: Record<ButtonSize, string> = {
  default: 'size-[40px]',
  small: 'size-[32px]'
}

const iconPixels: Record<ButtonSize, number> = {
  default: 18,
  small: 16
}

const buttonClasses = computed(() => [
  variantClasses[props.variant],
  props.icon ? iconSizeClasses[props.size] : textSizeClasses[props.size],
  props.activeAnimation && !props.disabled && !props.loading ? 'active:scale-95' : '',
  props.disabled || props.loading ? 'cursor-not-allowed opacity-60' : ''
])
</script>

<template>
  <button
    v-bind="$attrs"
    :type="nativeType"
    class="inline-flex shrink-0 items-center justify-center gap-[8px] rounded-[10px] font-medium transition-[color,background-color,transform,opacity] duration-150 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none"
    :class="buttonClasses"
    :disabled="disabled || loading"
    :aria-busy="loading"
  >
    <span
      v-if="loading"
      class="size-[16px] animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
      aria-hidden="true"
    />

    <MSvgIcon v-else-if="icon" :name="icon" :size="iconPixels[size]" :color="iconColor" />

    <span v-if="!icon" class="whitespace-nowrap">
      <slot />
    </span>
  </button>
</template>
