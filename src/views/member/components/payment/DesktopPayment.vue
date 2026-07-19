<script setup lang="ts">
import { computed } from 'vue'

import type { VipPayPlan } from '@/api/pay'

import AlipayOption from './AlipayOption.vue'
import DiscountBanner from './DiscountBanner.vue'

defineOptions({ name: 'DesktopPayment' })

const props = defineProps<{
  plan: VipPayPlan
  discountTime: number
  discountActive: boolean
}>()

defineEmits<{
  discountFinish: []
  purchase: []
}>()

const amount = computed(() => Number(props.plan.price).toFixed(2))
</script>

<template>
  <section class="hidden xl:block" aria-labelledby="desktop-payment-title">
    <DiscountBanner v-if="discountActive" :time="discountTime" @finish="$emit('discountFinish')" />
    <div
      class="mt-[10px] flex flex-col items-center rounded-[18px] border border-zinc-200 bg-zinc-50/70 px-[28px] py-[28px] dark:border-zinc-700 dark:bg-zinc-950/35"
    >
      <h2 id="desktop-payment-title" class="sr-only">选择支付方式</h2>
      <p class="flex items-baseline gap-[4px] font-sans text-orange-600 dark:text-orange-400">
        <span class="text-sm text-zinc-600 dark:text-zinc-300">支付金额</span>
        <span class="ml-[8px] text-lg">¥</span>
        <span class="text-[34px] leading-none font-semibold tabular-nums">{{ amount }}</span>
      </p>
      <div class="mt-[24px] w-full max-w-[280px]">
        <AlipayOption @select="$emit('purchase')" />
      </div>
      <p class="mt-[14px] text-xs text-zinc-400 dark:text-zinc-500">
        点击支付方式后进入第三方支付流程
      </p>
    </div>
  </section>
</template>
