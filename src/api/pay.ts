import request from '@/utils/request'
import {
  expectArray,
  expectBoolean,
  expectFiniteNumber,
  expectNonEmptyString,
  expectRecord,
  expectString,
  optionalBoolean
} from '@/utils/decode'

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

function decodeVipPayPlan(value: unknown, index: number): VipPayPlan {
  const path = `data[${index}]`
  const record = expectRecord(value, path)
  const id = record.id

  if (typeof id !== 'string' && (typeof id !== 'number' || !Number.isFinite(id))) {
    throw new TypeError(`${path}.id 必须是字符串或有限数字`)
  }

  return {
    id,
    title: expectNonEmptyString(record.title, `${path}.title`),
    desc: expectString(record.desc, `${path}.desc`),
    price: expectFiniteNumber(record.price, `${path}.price`),
    oldPrice: expectFiniteNumber(record.oldPrice, `${path}.oldPrice`),
    isHot: optionalBoolean(record, 'isHot', `${path}.isHot`)
  }
}

function decodeVipPayPlans(value: unknown): VipPayPlan[] {
  return expectArray(value, 'data').map(decodeVipPayPlan)
}

function decodeAlipayOrderResponse(value: unknown): AlipayOrderResponse {
  const record = expectRecord(value)
  return {
    encodeURI: expectNonEmptyString(record.encodeURI, 'data.encodeURI')
  }
}

export function getVipPayPlans(signal?: AbortSignal) {
  return request(
    {
      url: '/user/vip/pay/list',
      method: 'GET',
      signal
    },
    decodeVipPayPlans
  )
}

export function createAlipayOrder(payload: AlipayOrderRequest) {
  return request(
    {
      url: '/user/alipay',
      method: 'GET',
      params: payload
    },
    decodeAlipayOrderResponse
  )
}

export function getPayResult(outTradeNo: string, signal?: AbortSignal) {
  return request(
    {
      url: '/sys/pay/result',
      method: 'GET',
      params: { out_trade_no: outTradeNo },
      signal
    },
    (value) => expectBoolean(value, 'data')
  )
}
