<script setup lang="ts">
import type { VipPayPlan } from '@/api/pay'

defineOptions({ name: 'VipPlanCard' })

defineProps<{
  plan: VipPayPlan
  selected: boolean
}>()

defineEmits<{
  select: [plan: VipPayPlan]
}>()
</script>

<template>
  <button
    type="button"
    class="relative flex w-[124px] shrink-0 flex-col items-center rounded-[16px] border px-[12px] py-[18px] text-center transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-[2px] focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none motion-reduce:transform-none motion-reduce:transition-none xl:w-full"
    :class="
      selected
        ? 'border-amber-400 bg-amber-50 shadow-[0_12px_30px_rgb(245_158_11/0.12)] dark:border-amber-500 dark:bg-amber-500/10'
        : 'border-zinc-200 bg-white hover:border-amber-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-amber-600'
    "
    :aria-pressed="selected"
    @click="$emit('select', plan)"
  >
    <span
      v-if="plan.isHot"
      class="absolute -top-[10px] right-[8px] rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-[9px] py-[3px] text-[11px] leading-none font-semibold text-white shadow-sm"
    >
      热销
    </span>
    <span
      class="text-sm font-semibold"
      :class="selected ? 'text-amber-800 dark:text-amber-300' : 'text-zinc-800 dark:text-zinc-200'"
    >
      {{ plan.title }}
    </span>
    <span
      class="mt-[10px] flex items-baseline font-sans font-bold tracking-tight"
      :class="selected ? 'text-amber-700 dark:text-amber-300' : 'text-zinc-900 dark:text-zinc-100'"
    >
      <span class="text-sm">¥</span>
      <span class="text-[32px] leading-none">{{ plan.price }}</span>
    </span>
    <span class="mt-[7px] text-xs text-zinc-400 line-through dark:text-zinc-500">
      ¥{{ plan.oldPrice }}
    </span>
  </button>
</template>
