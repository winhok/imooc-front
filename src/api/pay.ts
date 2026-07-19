import request from '@/utils/request'

export interface VipPayPlan {
  id: string | number
  title: string
  desc: string
  price: number
  oldPrice: number
  isHot?: boolean
}

export function getVipPayPlans(signal?: AbortSignal) {
  return request<VipPayPlan[]>({
    url: '/user/vip/pay/list',
    method: 'GET',
    signal
  })
}
