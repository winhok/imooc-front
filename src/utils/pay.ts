import { createAlipayOrder, type VipPayPlan } from '@/api/pay'

function isMobilePaymentTerminal() {
  const userAgent = navigator.userAgent
  const isTouchMac = /Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1

  return (
    isTouchMac || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  )
}

function decodePaymentUrl(encodedUrl: string) {
  try {
    const decodedUrl = decodeURIComponent(encodedUrl)
    const paymentUrl = new URL(decodedUrl)
    const allowedDomains = ['alipay.com', 'alipaydev.com']
    const isAllowedHost = allowedDomains.some(
      (domain) => paymentUrl.hostname === domain || paymentUrl.hostname.endsWith(`.${domain}`)
    )

    if (paymentUrl.protocol !== 'https:' || !isAllowedHost) {
      throw new Error()
    }

    return paymentUrl.href
  } catch {
    throw new Error('支付服务返回了无效地址')
  }
}

export async function startAlipayPayment(plan: VipPayPlan) {
  const totalAmount = Number(plan.price)

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    throw new Error('当前套餐金额无效')
  }

  const { encodeURI } = await createAlipayOrder({
    subject: plan.title,
    totalAmount: totalAmount.toFixed(2),
    body: plan.desc,
    isMobile: isMobilePaymentTerminal()
  })

  if (!encodeURI) {
    throw new Error('支付服务未返回收银台地址')
  }

  window.location.assign(decodePaymentUrl(encodeURI))
}
