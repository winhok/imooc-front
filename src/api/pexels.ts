import type {
  PexelsHintResponse,
  PexelsItem,
  PexelsListParams,
  PexelsListResponse,
  PexelsThemesResponse
} from '@/types/pexels'
import request from '@/utils/request'

export function getPexelsList(params: PexelsListParams, signal?: AbortSignal) {
  return request<PexelsListResponse>({
    url: '/pexels/list',
    method: 'GET',
    params,
    signal
  })
}

export function getPexelsHints(query: string, signal?: AbortSignal) {
  return request<PexelsHintResponse>({
    url: '/pexels/hint',
    method: 'GET',
    params: { q: query },
    signal
  })
}

export function getPexelsThemes(signal?: AbortSignal) {
  return request<PexelsThemesResponse>({
    url: '/pexels/themes',
    method: 'GET',
    signal
  })
}

export function getPexelsById(id: string, signal?: AbortSignal) {
  return request<PexelsItem>({
    url: `/pexels/${encodeURIComponent(id)}`,
    method: 'GET',
    signal
  })
}
