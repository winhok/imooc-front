<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

import { isMobileTerminal } from '@/utils/flexible'
import { message } from '@/libs/message'
import { startAlipayPayment } from '@/utils/pay'
import type { VipPayPlan } from '@/api/pay'

import VipPlanCard from './components/VipPlanCard.vue'
import MemberPayment from './components/payment/MemberPayment.vue'
import { useVipPlans } from './useVipPlans'

defineOptions({ name: 'MemberView' })

const router = useRouter()
const { plans, selectedPlan, isLoading, errorMessage, loadPlans, selectPlan } = useVipPlans()
const isPaying = shallowRef(false)

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    void router.replace('/')
  }
}

async function purchase(plan: VipPayPlan) {
  if (isPaying.value) {
    return
  }

  isPaying.value = true

  try {
    await startAlipayPayment(plan)
  } catch (error) {
    isPaying.value = false
    message.error(error instanceof Error ? error.message : '创建支付订单失败')
  }
}

onMounted(loadPlans)
</script>

<template>
  <main
    class="app-scrollbar h-full overflow-auto bg-zinc-200 pb-[116px] transition-colors duration-300 motion-reduce:transition-none xl:pt-[10px] xl:pb-0 dark:bg-zinc-800"
  >
    <MNavbar v-if="isMobileTerminal" sticky @left-click="goBack">精选会员</MNavbar>

    <div class="mx-auto w-full xl:max-w-[1024px]">
      <section
        class="min-h-full bg-white transition-colors xl:rounded-sm xl:border xl:border-zinc-200 xl:px-[40px] dark:bg-zinc-900 xl:dark:border-zinc-600"
        aria-labelledby="member-title"
      >
        <div class="px-[10px] py-[20px] text-center">
          <h2 id="member-title" class="text-[34px] font-bold tracking-widest text-yellow-600">
            精选 VIP
          </h2>
          <p class="text-lg text-yellow-500">升级精选 VIP，畅享全部内容</p>
        </div>

        <div class="px-[10px] pb-[20px]">
          <div
            v-if="isLoading"
            class="grid grid-cols-3 gap-[10px] xl:grid-cols-4"
            aria-live="polite"
          >
            <span
              v-for="index in 4"
              :key="index"
              class="h-[142px] animate-pulse rounded-[16px] bg-zinc-100 motion-reduce:animate-none dark:bg-zinc-800"
            />
            <span class="sr-only">正在加载会员套餐</span>
          </div>

          <div
            v-else-if="errorMessage"
            class="flex min-h-[220px] flex-col items-center justify-center rounded-[16px] border border-dashed border-zinc-300 px-[20px] text-center dark:border-zinc-700"
            role="alert"
          >
            <p class="text-sm font-medium text-zinc-800 dark:text-zinc-200">套餐加载失败</p>
            <p class="mt-[6px] text-xs text-zinc-500 dark:text-zinc-400">{{ errorMessage }}</p>
            <MButton class="mt-[18px]" size="small" variant="neutral" @click="loadPlans">
              重新加载
            </MButton>
          </div>

          <template v-else-if="selectedPlan">
            <div
              class="app-scrollbar mt-[50px] flex justify-between overflow-x-auto pb-[20px]"
              aria-label="会员套餐"
            >
              <VipPlanCard
                v-for="plan in plans"
                :key="plan.id"
                :plan="plan"
                :selected="plan.id === selectedPlan.id"
                @select="selectPlan"
              />
            </div>
            <p class="mt-[10px] min-h-[20px] text-sm text-zinc-500 dark:text-zinc-400">
              {{ selectedPlan.desc }}
            </p>
            <MemberPayment
              class="mt-[40px]"
              :plan="selectedPlan"
              :processing="isPaying"
              @purchase="purchase"
            />
          </template>

          <div
            v-else
            class="grid min-h-[220px] place-items-center rounded-[16px] border border-dashed border-zinc-300 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
          >
            暂无可用会员套餐
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
