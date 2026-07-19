import { onScopeDispose, readonly, shallowRef } from 'vue'

import { getVipPayPlans, type VipPayPlan } from '@/api/pay'

export function useVipPlans() {
  const plans = shallowRef<readonly VipPayPlan[]>([])
  const selectedPlan = shallowRef<VipPayPlan>()
  const isLoading = shallowRef(false)
  const errorMessage = shallowRef('')
  let controller: AbortController | undefined

  async function loadPlans() {
    controller?.abort()
    const requestController = new AbortController()
    controller = requestController
    isLoading.value = true
    errorMessage.value = ''

    try {
      const data = await getVipPayPlans(requestController.signal)
      plans.value = data
      selectedPlan.value = data[0]
    } catch (error) {
      if (requestController.signal.aborted) {
        return
      }

      plans.value = []
      selectedPlan.value = undefined
      errorMessage.value = error instanceof Error ? error.message : '会员套餐加载失败'
    } finally {
      if (controller === requestController && !requestController.signal.aborted) {
        isLoading.value = false
      }
    }
  }

  function selectPlan(plan: VipPayPlan) {
    selectedPlan.value = plan
  }

  onScopeDispose(() => controller?.abort())

  return {
    plans: readonly(plans),
    selectedPlan: readonly(selectedPlan),
    isLoading: readonly(isLoading),
    errorMessage: readonly(errorMessage),
    loadPlans,
    selectPlan
  }
}
