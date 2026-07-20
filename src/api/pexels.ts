import type {
  PexelsHintResponse,
  PexelsItem,
  PexelsListParams,
  PexelsListResponse,
  PexelsThemesResponse
} from '@/types/pexels'
import request from '@/utils/request'

interface PexelsListPayload {
  list?: unknown[]
  total?: number
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isPexelsItem(value: unknown): value is PexelsItem {
  if (!value || typeof value !== 'object') {
    return false
  }

  const item = value as Partial<PexelsItem>
  return (
    isNonEmptyString(item.id) &&
    isNonEmptyString(item.title) &&
    isNonEmptyString(item.photo) &&
    isFiniteNumber(item.photoWidth) &&
    isFiniteNumber(item.photoHeight) &&
    isNonEmptyString(item.author) &&
    isNonEmptyString(item.avatar)
  )
}

export async function getPexelsList(
  params: PexelsListParams,
  signal?: AbortSignal
): Promise<PexelsListResponse> {
  const payload = await request<PexelsListPayload>({
    url: '/pexels/list',
    method: 'GET',
    params,
    signal
  })

  const sourceList = Array.isArray(payload.list) ? payload.list : []
  return {
    list: sourceList.filter(isPexelsItem),
    total: payload.total,
    sourceLength: sourceList.length
  }
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
