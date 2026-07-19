import request from '@/utils/request'

export interface Category {
  id: string
  name: string
  col?: number
  urlname?: string
}

interface CategoryPayload {
  categorys: Category[]
}

export function getCategory(signal?: AbortSignal) {
  return request<CategoryPayload>({
    url: '/category',
    method: 'GET',
    signal
  })
}
