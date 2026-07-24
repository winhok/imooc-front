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
  processing: boolean
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
    class="fixed inset-x-0 bottom-0 z-30 bg-white pb-[env(safe-area-inset-bottom)] text-center xl:hidden dark:bg-zinc-800"
    aria-label="会员支付"
  >
    <DiscountBanner
      v-if="discountActive"
      :time="discountTime"
      class="rounded-none border-x-0 border-b-0"
      @finish="$emit('discountFinish')"
    />
    <div class="flex items-center justify-between px-[10px] py-[5px] text-xs">
      <div class="min-w-0">
        <p class="text-left text-zinc-900 dark:text-zinc-200">
          券后合计
          <span class="ml-[3px] font-sans text-[22px] font-medium text-red-600 dark:text-red-400">
            ¥{{ plan.price }}
          </span>
        </p>
        <p v-if="savings > 0" class="mt-[2px] truncate text-left text-red-600">
          优惠券：限时立减 ¥{{ savings }}
        </p>
      </div>
      <MButton
        class="w-[120px]"
        :active-animation="false"
        :loading="processing"
        @click="isPaymentSheetOpen = true"
      >
        {{ processing ? '正在下单' : '立即开通' }}
      </MButton>
    </div>
  </section>

  <MBottomSheet v-model="isPaymentSheetOpen">
    <div
      class="flex h-[80dvh] max-h-[80dvh] flex-col py-[20px] pb-[calc(24px+env(safe-area-inset-bottom))]"
    >
      <div class="mb-[20px] flex items-center justify-between gap-[16px] px-[10px]">
        <div>
          <h2 class="text-xl font-bold text-zinc-950 dark:text-zinc-50">选择支付方式</h2>
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
      <AlipayOption compact :loading="processing" @select="chooseAlipay" />
    </div>
  </MBottomSheet>
</template>
