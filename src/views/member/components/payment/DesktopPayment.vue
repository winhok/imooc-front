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
  processing: boolean
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
      class="mt-[10px] flex flex-col items-center justify-evenly rounded-md border border-zinc-200 py-[30px] dark:border-zinc-600"
    >
      <h2 id="desktop-payment-title" class="sr-only">选择支付方式</h2>
      <p class="flex items-baseline gap-[4px] font-sans text-orange-600 dark:text-orange-400">
        <span class="text-base text-zinc-900 dark:text-zinc-200">支付金额：</span>
        <span class="ml-[8px] text-lg">¥</span>
        <span class="text-[34px] leading-none font-semibold tabular-nums">{{ amount }}</span>
      </p>
      <div class="mt-[30px] w-[220px]">
        <AlipayOption :loading="processing" @select="$emit('purchase')" />
      </div>
    </div>
  </section>
</template>
