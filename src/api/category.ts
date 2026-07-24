import request from '@/utils/request'
import { ApiContractError } from '@/utils/request'
import {
  expectArray,
  expectNonEmptyString,
  expectRecord,
  optionalFiniteNumber,
  optionalString
} from '@/utils/decode'

export interface Category {
  id: string
  name: string
  col?: number
  urlname?: string
}

interface CategoryPayload {
  categorys: Category[]
}

function decodeCategory(value: unknown, index: number): Category {
  const path = `data.categorys[${index}]`
  const record = expectRecord(value, path)

  return {
    id: expectNonEmptyString(record.id, `${path}.id`),
    name: expectNonEmptyString(record.name, `${path}.name`),
    col: optionalFiniteNumber(record, 'col', `${path}.col`),
    urlname: optionalString(record, 'urlname', `${path}.urlname`)
  }
}

function decodeCategoryPayload(value: unknown): CategoryPayload {
  const record = expectRecord(value)
  const source = expectArray(record.categorys, 'data.categorys')
  const categories = new Map<string, Category>()
  let invalidCount = 0

  source.forEach((candidate, index) => {
    try {
      const category = decodeCategory(candidate, index)
      categories.set(category.id, category)
    } catch {
      invalidCount += 1
    }
  })

  if (source.length > 0 && categories.size === 0) {
    throw new ApiContractError('分类响应不包含有效分类')
  }

  if (invalidCount > 0) {
    console.warn(`[category] 已忽略 ${invalidCount} 条无效分类数据`)
  }

  return {
    categorys: [...categories.values()]
  }
}

export function getCategory(signal?: AbortSignal) {
  return request(
    {
      url: '/category',
      method: 'GET',
      signal
    },
    decodeCategoryPayload
  )
}
