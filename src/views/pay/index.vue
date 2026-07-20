<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useUserStore } from '@/stores/user'

import PaymentResultCard from './components/PaymentResultCard.vue'
import { usePaymentResult } from './usePaymentResult'

defineOptions({ name: 'PayResultView' })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isConfirming = shallowRef(false)
const outTradeNo = computed(() => {
  const value = route.query.out_trade_no
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? ''
})
const { status, errorMessage } = usePaymentResult(outTradeNo.value)

async function confirm() {
  if (isConfirming.value) {
    return
  }

  isConfirming.value = true

  try {
    await userStore.loadProfile()
  } finally {
    await router.replace('/')
  }
}
</script>

<template>
  <main class="h-full bg-zinc-200 transition-colors xl:pt-[10px] dark:bg-zinc-800">
    <PaymentResultCard
      :status="status"
      :error-message="errorMessage"
      :confirming="isConfirming"
      @confirm="confirm"
    />
  </main>
</template>
