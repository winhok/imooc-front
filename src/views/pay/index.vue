<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useCommands } from '@/libs/command'
import { useUserStore } from '@/stores/user'

import PaymentResultCard from './components/PaymentResultCard.vue'
import { usePaymentResult } from './usePaymentResult'

defineOptions({ name: 'PayResultView' })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { message } = useCommands()
const isConfirming = shallowRef(false)
let profileSyncPromise: Promise<boolean> | null = null
const outTradeNo = computed(() => {
  const value = route.query.out_trade_no
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? ''
})
const { status, errorMessage } = usePaymentResult(outTradeNo)

function synchronizeProfile() {
  if (!profileSyncPromise) {
    profileSyncPromise = userStore
      .loadProfile()
      .then((profile) => profile !== null)
      .catch(() => false)
      .finally(() => {
        profileSyncPromise = null
      })
  }

  return profileSyncPromise
}

watch(status, (nextStatus) => {
  if (nextStatus === 'success') {
    void synchronizeProfile()
  }
})

async function confirm() {
  if (isConfirming.value || status.value === 'checking') {
    return
  }

  isConfirming.value = true

  try {
    if (status.value === 'success' && !(await synchronizeProfile())) {
      message.error('会员状态同步失败，请稍后重试')
      return
    }

    await router.replace('/')
  } finally {
    isConfirming.value = false
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
