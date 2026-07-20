<script setup lang="ts">
import { computed, shallowRef } from 'vue'

import type { VipPayPlan } from '@/api/pay'
import { isMobileTerminal } from '@/utils/flexible'

import DesktopPayment from './DesktopPayment.vue'
import MobilePayment from './MobilePayment.vue'

defineOptions({ name: 'MemberPayment' })

const props = defineProps<{
  plan: VipPayPlan
  processing: boolean
}>()

const emit = defineEmits<{
  purchase: [plan: VipPayPlan]
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
  emit('purchase', props.plan)
}
</script>

<template>
  <div>
    <MobilePayment
      v-if="isMobileTerminal"
      :plan="plan"
      :discount-time="discountTime"
      :discount-active="discountActive"
      :processing="processing"
      @discount-finish="finishDiscount"
      @purchase="startPurchase"
    />
    <DesktopPayment
      v-else
      :plan="plan"
      :discount-time="discountTime"
      :discount-active="discountActive"
      :processing="processing"
      @discount-finish="finishDiscount"
      @purchase="startPurchase"
    />
  </div>
</template>
