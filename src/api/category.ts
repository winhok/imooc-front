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

/** Fetch the category list and return unwrapped business data. */
export function getCategory(signal?: AbortSignal) {
  return request<CategoryPayload>({
    url: '/category',
    method: 'GET',
    signal
  })
}
