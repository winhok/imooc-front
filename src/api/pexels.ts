import type {
  PexelsHintResponse,
  PexelsItem,
  PexelsListParams,
  PexelsListResponse,
  PexelsThemesResponse
} from '@/types/pexels'
import request from '@/utils/request'
import { ApiContractError } from '@/utils/request'
import {
  expectArray,
  expectFiniteNumber,
  expectNonEmptyString,
  expectRecord,
  optionalFiniteNumber,
  optionalHttpUrl,
  optionalString
} from '@/utils/decode'

function expectHttpUrl(value: unknown, path: string): string {
  const record = { value }
  const result = optionalHttpUrl(record, 'value', path)

  if (!result) {
    throw new ApiContractError(`${path} 不能为空`)
  }

  return result
}

function decodeStringArray(value: unknown, path: string): string[] {
  return expectArray(value, path).map((item, index) =>
    expectNonEmptyString(item, `${path}[${index}]`)
  )
}

export function decodePexelsItem(value: unknown, path = 'data'): PexelsItem {
  const record = expectRecord(value, path)
  const tags = record.tags

  return {
    id: expectNonEmptyString(record.id, `${path}.id`),
    title: expectNonEmptyString(record.title, `${path}.title`),
    photo: expectHttpUrl(record.photo, `${path}.photo`),
    photoLink: optionalHttpUrl(record, 'photoLink', `${path}.photoLink`),
    photoDownLink: optionalHttpUrl(record, 'photoDownLink', `${path}.photoDownLink`),
    photoWidth: expectFiniteNumber(record.photoWidth, `${path}.photoWidth`),
    photoHeight: expectFiniteNumber(record.photoHeight, `${path}.photoHeight`),
    photoType: optionalString(record, 'photoType', `${path}.photoType`),
    author: expectNonEmptyString(record.author, `${path}.author`),
    authorLike: optionalHttpUrl(record, 'authorLike', `${path}.authorLike`),
    avatar: expectHttpUrl(record.avatar, `${path}.avatar`),
    tags: tags === undefined || tags === null ? undefined : decodeStringArray(tags, `${path}.tags`)
  }
}

function decodePexelsListPayload(value: unknown): PexelsListResponse {
  const payload = expectRecord(value)
  const sourceList = expectArray(payload.list, 'data.list')
  const list: PexelsItem[] = []

  sourceList.forEach((candidate, index) => {
    try {
      list.push(decodePexelsItem(candidate, `data.list[${index}]`))
    } catch {
      // The public feed is fail-soft: one malformed card must not hide the
      // remaining valid cards. Single-item detail responses remain strict.
    }
  })

  if (sourceList.length > 0 && list.length === 0) {
    throw new ApiContractError('图片列表响应不包含有效数据')
  }

  return {
    list,
    total: optionalFiniteNumber(payload, 'total', 'data.total'),
    sourceLength: sourceList.length
  }
}

function decodePexelsHints(value: unknown): PexelsHintResponse {
  const record = expectRecord(value)
  return {
    total: expectFiniteNumber(record.total, 'data.total'),
    result: decodeStringArray(record.result, 'data.result')
  }
}

function decodePexelsThemes(value: unknown): PexelsThemesResponse {
  const record = expectRecord(value)
  return {
    themes: expectArray(record.themes, 'data.themes').map((candidate, index) => {
      const path = `data.themes[${index}]`
      const theme = expectRecord(candidate, path)
      return {
        id: expectNonEmptyString(theme.id, `${path}.id`),
        title: expectNonEmptyString(theme.title, `${path}.title`),
        photo: expectHttpUrl(theme.photo, `${path}.photo`)
      }
    })
  }
}

export async function getPexelsList(
  params: PexelsListParams,
  signal?: AbortSignal
): Promise<PexelsListResponse> {
  return request(
    {
      url: '/pexels/list',
      method: 'GET',
      params,
      signal
    },
    decodePexelsListPayload
  )
}

export function getPexelsHints(query: string, signal?: AbortSignal) {
  return request(
    {
      url: '/pexels/hint',
      method: 'GET',
      params: { q: query },
      signal
    },
    decodePexelsHints
  )
}

export function getPexelsThemes(signal?: AbortSignal) {
  return request(
    {
      url: '/pexels/themes',
      method: 'GET',
      signal
    },
    decodePexelsThemes
  )
}

export function getPexelsById(id: string, signal?: AbortSignal) {
  return request(
    {
      url: `/pexels/${encodeURIComponent(id)}`,
      method: 'GET',
      signal
    },
    decodePexelsItem
  )
}
