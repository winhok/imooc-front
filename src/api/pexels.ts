import type {
  PexelsHintResponse,
  PexelsListParams,
  PexelsListResponse,
  PexelsThemesResponse
} from '@/types/pexels'
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

/** Fetch debounced autocomplete suggestions for the current search draft. */
export function getPexelsHints(query: string, signal?: AbortSignal) {
  return request<PexelsHintResponse>({
    url: '/pexels/hint',
    method: 'GET',
    params: { q: query },
    signal
  })
}

/** Fetch curated topics shown when the search draft is empty. */
export function getPexelsThemes(signal?: AbortSignal) {
  return request<PexelsThemesResponse>({
    url: '/pexels/themes',
    method: 'GET',
    signal
  })
}
