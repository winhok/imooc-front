<script setup lang="ts">
import { computed } from 'vue'

import type { PaymentResultStatus } from '../usePaymentResult'

const props = defineProps<{
  status: PaymentResultStatus
  errorMessage: string
  confirming: boolean
}>()

defineEmits<{
  confirm: []
}>()

const content = computed(() => {
  if (props.status === 'success') {
    return {
      icon: 'check-circle',
      iconClass: 'text-emerald-500',
      title: '支付成功',
      description: ''
    }
  }

  if (props.status === 'failure') {
    return {
      icon: 'alert-circle',
      iconClass: 'text-amber-500',
      title: '支付失败',
      description: ''
    }
  }

  if (props.status === 'error') {
    return {
      icon: 'alert-circle',
      iconClass: 'text-red-500',
      title: '支付失败',
      description: props.errorMessage
    }
  }

  return {
    icon: 'countdown',
    iconClass: 'animate-spin text-blue-500 motion-reduce:animate-none',
    title: '正在确认支付结果',
    description: '请勿关闭当前页面'
  }
})
</script>

<template>
  <section
    class="mx-auto h-full bg-white px-[10px] pt-[50%] text-center transition-colors xl:h-[360px] xl:max-w-[1024px] xl:rounded-sm xl:border xl:border-zinc-200 xl:px-[40px] xl:py-[100px] dark:bg-zinc-900 xl:dark:border-zinc-600"
    aria-live="polite"
  >
    <div v-if="status !== 'checking'" class="flex items-center justify-center">
      <MSvgIcon :name="content.icon" :size="80" class="mr-[40px]" :class="content.iconClass" />
      <h1 class="text-lg text-zinc-900 dark:text-zinc-200">
        {{ content.title }}
      </h1>
    </div>
    <div class="mt-[80px] flex justify-center">
      <MButton class="w-full xl:w-[120px]" :loading="confirming" @click="$emit('confirm')">
        确定
      </MButton>
    </div>
  </section>
</template>
