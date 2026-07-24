import { ApiContractError } from '@/utils/request'

export type UnknownRecord = Record<string, unknown>

export function expectRecord(value: unknown, path = 'data'): UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ApiContractError(`${path} 必须是对象`)
  }

  return value as UnknownRecord
}

export function expectArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new ApiContractError(`${path} 必须是数组`)
  }

  return value
}

export function expectString(value: unknown, path: string): string {
  if (typeof value !== 'string') {
    throw new ApiContractError(`${path} 必须是字符串`)
  }

  return value
}

export function expectNonEmptyString(value: unknown, path: string): string {
  const result = expectString(value, path).trim()

  if (!result) {
    throw new ApiContractError(`${path} 不能为空`)
  }

  return result
}

export function expectFiniteNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ApiContractError(`${path} 必须是有限数字`)
  }

  return value
}

export function expectBoolean(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') {
    throw new ApiContractError(`${path} 必须是布尔值`)
  }

  return value
}

export function optionalString(
  record: UnknownRecord,
  key: string,
  path = `data.${key}`
): string | undefined {
  const value = record[key]
  return value === undefined || value === null ? undefined : expectString(value, path)
}

export function optionalFiniteNumber(
  record: UnknownRecord,
  key: string,
  path = `data.${key}`
): number | undefined {
  const value = record[key]
  return value === undefined || value === null ? undefined : expectFiniteNumber(value, path)
}

export function optionalBoolean(
  record: UnknownRecord,
  key: string,
  path = `data.${key}`
): boolean | undefined {
  const value = record[key]
  return value === undefined || value === null ? undefined : expectBoolean(value, path)
}

export function optionalHttpUrl(
  record: UnknownRecord,
  key: string,
  path = `data.${key}`
): string | undefined {
  const value = optionalString(record, key, path)

  if (!value) {
    return undefined
  }

  let url: URL

  try {
    url = new URL(value)
  } catch {
    throw new ApiContractError(`${path} 必须是有效 URL`)
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new ApiContractError(`${path} 只允许 HTTP(S) URL`)
  }

  return value
}

export function decodeUnknown(value: unknown): unknown {
  return value
}

export function decodeVoid(): void {
  return undefined
}
