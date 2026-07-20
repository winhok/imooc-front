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
  retry: []
}>()

const content = computed(() => {
  if (props.status === 'success') {
    return {
      icon: 'check-circle',
      iconClass: 'text-emerald-500',
      title: '支付成功',
      description: '会员权益已经到账'
    }
  }

  if (props.status === 'failure') {
    return {
      icon: 'alert-circle',
      iconClass: 'text-amber-500',
      title: '暂未确认到账',
      description: '如已完成扣款，请稍后重新查询'
    }
  }

  if (props.status === 'error') {
    return {
      icon: 'alert-circle',
      iconClass: 'text-red-500',
      title: '查询支付结果失败',
      description: props.errorMessage || '请检查网络后重新查询'
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
    class="w-full max-w-[440px] rounded-[24px] border border-zinc-200 bg-white px-[24px] py-[36px] text-center shadow-xl shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20"
    aria-live="polite"
  >
    <MSvgIcon :name="content.icon" :size="56" class="mx-auto" :class="content.iconClass" />
    <h1 class="mt-[20px] text-xl font-semibold text-zinc-950 dark:text-zinc-50">
      {{ content.title }}
    </h1>
    <p class="mt-[8px] text-sm text-zinc-500 dark:text-zinc-400">
      {{ content.description }}
    </p>
    <div class="mt-[28px] flex justify-center gap-[12px]">
      <MButton
        v-if="status === 'failure' || status === 'error'"
        variant="neutral"
        :disabled="confirming"
        @click="$emit('retry')"
      >
        重新查询
      </MButton>
      <MButton :loading="confirming" :disabled="status === 'checking'" @click="$emit('confirm')">
        返回首页
      </MButton>
    </div>
  </section>
</template>
