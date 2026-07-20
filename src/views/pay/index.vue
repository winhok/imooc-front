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
const { status, errorMessage, check } = usePaymentResult(outTradeNo.value)

async function confirm() {
  if (isConfirming.value) {
    return
  }

  isConfirming.value = true

  try {
    if (status.value === 'success') {
      await userStore.loadProfile()
    }
  } finally {
    await router.replace('/')
  }
}
</script>

<template>
  <main
    class="grid min-h-dvh place-items-center bg-zinc-100 px-[16px] py-[32px] transition-colors duration-300 dark:bg-zinc-950"
  >
    <PaymentResultCard
      :status="status"
      :error-message="errorMessage"
      :confirming="isConfirming"
      @confirm="confirm"
      @retry="check"
    />
  </main>
</template>
