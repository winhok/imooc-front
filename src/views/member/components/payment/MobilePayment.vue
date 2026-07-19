<script setup lang="ts">
import { computed, shallowRef } from 'vue'

import type { VipPayPlan } from '@/api/pay'

import AlipayOption from './AlipayOption.vue'
import DiscountBanner from './DiscountBanner.vue'

defineOptions({ name: 'MobilePayment' })

const props = defineProps<{
  plan: VipPayPlan
  discountTime: number
  discountActive: boolean
}>()

const emit = defineEmits<{
  discountFinish: []
  purchase: []
}>()

const isPaymentSheetOpen = shallowRef(false)
const savings = computed(() => Math.max(0, Number(props.plan.oldPrice) - Number(props.plan.price)))

function chooseAlipay() {
  isPaymentSheetOpen.value = false
  emit('purchase')
}
</script>

<template>
  <section
    class="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/96 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_36px_rgb(24_24_27/0.1)] backdrop-blur-xl xl:hidden dark:border-zinc-700 dark:bg-zinc-900/96"
    aria-label="会员支付"
  >
    <DiscountBanner
      v-if="discountActive"
      :time="discountTime"
      class="rounded-none border-x-0 border-b-0"
      @finish="$emit('discountFinish')"
    />
    <div class="flex items-center justify-between gap-[12px] px-[14px] py-[10px]">
      <div class="min-w-0">
        <p class="text-xs text-zinc-600 dark:text-zinc-300">
          券后合计
          <span class="ml-[3px] font-sans text-base font-semibold text-red-600 dark:text-red-400">
            ¥{{ plan.price }}
          </span>
        </p>
        <p v-if="savings > 0" class="mt-[2px] truncate text-xs text-red-500 dark:text-red-400">
          限时立减 ¥{{ savings }}
        </p>
      </div>
      <MButton class="w-[124px]" :active-animation="false" @click="isPaymentSheetOpen = true">
        立即开通
      </MButton>
    </div>
  </section>

  <MPopup v-model="isPaymentSheetOpen">
    <div class="max-h-[80dvh] px-[18px] pt-[18px] pb-[calc(24px+env(safe-area-inset-bottom))]">
      <div class="mx-auto mb-[16px] h-[4px] w-[42px] rounded-full bg-zinc-200 dark:bg-zinc-700" />
      <div class="mb-[18px] flex items-center justify-between gap-[16px]">
        <div>
          <h2 class="text-base font-semibold text-zinc-950 dark:text-zinc-50">选择支付方式</h2>
          <p class="mt-[4px] text-xs text-zinc-500 dark:text-zinc-400">待支付 ¥{{ plan.price }}</p>
        </div>
        <button
          type="button"
          class="grid size-[36px] place-items-center rounded-[10px] text-zinc-500 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:hover:bg-zinc-800"
          aria-label="关闭支付方式"
          @click="isPaymentSheetOpen = false"
        >
          <MSvgIcon name="close" :size="16" />
        </button>
      </div>
      <AlipayOption compact @select="chooseAlipay" />
    </div>
  </MPopup>
</template>
