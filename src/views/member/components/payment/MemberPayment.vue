<script setup lang="ts">
import { computed, shallowRef } from 'vue'

import type { VipPayPlan } from '@/api/pay'
import { message } from '@/libs/message'
import { isMobileTerminal } from '@/utils/flexible'

import DesktopPayment from './DesktopPayment.vue'
import MobilePayment from './MobilePayment.vue'

defineOptions({ name: 'MemberPayment' })

defineProps<{
  plan: VipPayPlan
}>()

const discountActive = shallowRef(true)
const discountEndsAt = Date.now() + 52 * 60 * 1000
const discountTime = computed(() => {
  void isMobileTerminal.value
  return Math.max(0, discountEndsAt - Date.now())
})

function finishDiscount() {
  discountActive.value = false
}

function startPurchase() {
  message.info('支付服务将在后续章节接入')
}
</script>

<template>
  <div>
    <MobilePayment
      v-if="isMobileTerminal"
      :plan="plan"
      :discount-time="discountTime"
      :discount-active="discountActive"
      @discount-finish="finishDiscount"
      @purchase="startPurchase"
    />
    <DesktopPayment
      v-else
      :plan="plan"
      :discount-time="discountTime"
      :discount-active="discountActive"
      @discount-finish="finishDiscount"
      @purchase="startPurchase"
    />
  </div>
</template>
