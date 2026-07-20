import { onScopeDispose, shallowRef } from 'vue'

import { getPayResult } from '@/api/pay'

export type PaymentResultStatus = 'checking' | 'success' | 'failure' | 'error'

export function usePaymentResult(outTradeNo: string) {
  const status = shallowRef<PaymentResultStatus>('checking')
  const errorMessage = shallowRef('')
  let activeController: AbortController | undefined

  async function check() {
    activeController?.abort()

    const nextController = new AbortController()
    activeController = nextController
    status.value = 'checking'
    errorMessage.value = ''

    if (!outTradeNo) {
      status.value = 'error'
      errorMessage.value = '支付回调缺少订单号'
      return
    }

    try {
      status.value = (await getPayResult(outTradeNo, nextController.signal)) ? 'success' : 'failure'
    } catch (error) {
      if (nextController.signal.aborted) {
        return
      }

      status.value = 'error'
      errorMessage.value = error instanceof Error ? error.message : '支付结果查询失败'
    }
  }

  void check()
  onScopeDispose(() => activeController?.abort())

  return {
    status,
    errorMessage,
    check
  }
}
