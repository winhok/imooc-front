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
    class="relative mt-[20px] mr-[20px] flex w-[100px] shrink-0 flex-col items-center rounded-md border py-[30px] text-center transition-colors hover:border-orange-300 hover:bg-orange-50 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none xl:w-[150px] xl:py-[20px] dark:hover:bg-orange-50/10"
    :class="
      selected
        ? 'border-orange-300 bg-orange-50 dark:bg-orange-50/10'
        : 'border-zinc-300 bg-white dark:border-zinc-500 dark:bg-zinc-900'
    "
    :aria-pressed="selected"
    @click="$emit('select', plan)"
  >
    <span
      v-if="plan.isHot"
      class="absolute -top-[12px] -right-px h-[22px] w-[48px] rounded-tr-[10px] rounded-bl-[10px] bg-linear-to-r from-orange-300 to-orange-100 text-[12px] leading-[22px] text-yellow-700"
    >
      热销
    </span>
    <span
      class="text-base"
      :class="selected ? 'text-amber-800 dark:text-amber-300' : 'text-zinc-800 dark:text-zinc-200'"
    >
      {{ plan.title }}
    </span>
    <span
      class="flex items-baseline font-sans font-bold tracking-tighter"
      :class="selected ? 'text-amber-700 dark:text-amber-300' : 'text-zinc-900 dark:text-zinc-100'"
    >
      <span class="text-sm">¥</span>
      <span class="text-[32px] leading-none">{{ plan.price }}</span>
    </span>
    <span class="text-xs text-yellow-500 line-through"> ¥{{ plan.oldPrice }} </span>
  </button>
</template>
