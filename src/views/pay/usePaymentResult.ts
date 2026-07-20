import { onScopeDispose, shallowRef } from 'vue'

import { getPayResult } from '@/api/pay'

export type PaymentResultStatus = 'checking' | 'success' | 'failure' | 'error'

const MAX_ATTEMPTS = 5
const RETRY_DELAY = 1200

function delay(duration: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason)
      return
    }

    const abort = () => {
      window.clearTimeout(timer)
      reject(signal.reason)
    }
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    }, duration)

    signal.addEventListener('abort', abort, { once: true })
  })
}

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
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        if (await getPayResult(outTradeNo, nextController.signal)) {
          status.value = 'success'
          return
        }

        if (attempt < MAX_ATTEMPTS - 1) {
          await delay(RETRY_DELAY, nextController.signal)
        }
      }

      status.value = 'failure'
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
