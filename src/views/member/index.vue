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
    class="app-scrollbar h-dvh overflow-auto bg-zinc-100 pb-[116px] transition-colors duration-300 motion-reduce:transition-none xl:pb-[32px] dark:bg-zinc-950"
  >
    <MNavbar v-if="isMobileTerminal" sticky @left-click="goBack">精选会员</MNavbar>

    <header
      v-else
      class="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90"
    >
      <div class="mx-auto flex h-[72px] max-w-[1120px] items-center px-[28px]">
        <button
          type="button"
          class="grid size-[40px] place-items-center rounded-[10px] text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none dark:text-zinc-200 dark:hover:bg-zinc-800"
          aria-label="返回上一页"
          @click="goBack"
        >
          <MSvgIcon name="back" :size="20" />
        </button>
        <h1 class="ml-[14px] text-base font-semibold text-zinc-950 dark:text-zinc-50">精选会员</h1>
      </div>
    </header>

    <div class="mx-auto w-full max-w-[1040px] px-[12px] py-[18px] xl:px-[28px] xl:py-[32px]">
      <section
        class="overflow-hidden rounded-[22px] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        aria-labelledby="member-title"
      >
        <div
          class="border-b border-amber-100 bg-gradient-to-br from-amber-50 via-orange-50 to-white px-[18px] py-[28px] text-center xl:px-[36px] xl:py-[36px] dark:border-amber-500/15 dark:from-amber-500/10 dark:via-orange-500/5 dark:to-zinc-900"
        >
          <div
            class="mx-auto grid size-[46px] place-items-center rounded-[14px] bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20"
          >
            <MSvgIcon name="crown" :size="25" />
          </div>
          <h2
            id="member-title"
            class="mt-[14px] text-xl font-bold tracking-[0.08em] text-amber-800 dark:text-amber-300"
          >
            精选 VIP
          </h2>
          <p class="mt-[7px] text-sm text-amber-700/80 dark:text-amber-200/70">
            升级精选 VIP，畅享全部内容
          </p>
        </div>

        <div class="px-[14px] py-[20px] xl:px-[34px] xl:py-[30px]">
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
              class="app-scrollbar flex gap-[10px] overflow-x-auto pt-[10px] pb-[12px] xl:grid xl:grid-cols-4 xl:overflow-visible"
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
            <p class="mt-[4px] min-h-[20px] text-xs text-zinc-500 dark:text-zinc-400">
              {{ selectedPlan.desc }}
            </p>
            <MemberPayment
              class="mt-[22px]"
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
