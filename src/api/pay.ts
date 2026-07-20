import request from '@/utils/request'

export interface VipPayPlan {
  id: string | number
  title: string
  desc: string
  price: number
  oldPrice: number
  isHot?: boolean
}

export interface AlipayOrderRequest {
  subject: string
  totalAmount: string
  body: string
  isMobile: boolean
}

interface AlipayOrderResponse {
  encodeURI: string
}

export function getVipPayPlans(signal?: AbortSignal) {
  return request<VipPayPlan[]>({
    url: '/user/vip/pay/list',
    method: 'GET',
    signal
  })
}

export function createAlipayOrder(payload: AlipayOrderRequest) {
  return request<AlipayOrderResponse>({
    url: '/user/alipay',
    method: 'GET',
    params: payload
  })
}

export function getPayResult(outTradeNo: string, signal?: AbortSignal) {
  return request<boolean>({
    url: '/sys/pay/result',
    method: 'GET',
    params: { out_trade_no: outTradeNo },
    signal
  })
}
