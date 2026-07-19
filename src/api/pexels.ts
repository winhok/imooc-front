import type { PexelsListParams, PexelsListResponse } from '@/types/pexels'
import request from '@/utils/request'

/** Fetch one page of works for the home waterfall. */
export function getPexelsList(params: PexelsListParams, signal?: AbortSignal) {
  return request<PexelsListResponse>({
    url: '/pexels/list',
    method: 'GET',
    params,
    signal
  })
}
