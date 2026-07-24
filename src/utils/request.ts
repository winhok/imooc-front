import axios from 'axios'
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'

import { USER_TOKEN_STORAGE_KEY } from '@/constants'

interface ApiEnvelope {
  success: boolean
  code: number
  data: unknown
  message: string
}

export interface UnauthorizedContext {
  token: string
}

type UnauthorizedHandler = (context: UnauthorizedContext) => void
export type ResponseDecoder<T> = (value: unknown) => T

let unauthorizedHandler: UnauthorizedHandler | undefined

export class ApiError extends Error {
  readonly code?: number

  constructor(message: string, options: { code?: number; cause?: unknown } = {}) {
    super(message, { cause: options.cause })
    this.name = 'ApiError'
    this.code = options.code
  }
}

export class ApiContractError extends ApiError {
  constructor(message: string, options: { cause?: unknown } = {}) {
    super(message, { cause: options.cause })
    this.name = 'ApiContractError'
  }
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler
}

function getStoredToken() {
  try {
    return localStorage.getItem(USER_TOKEN_STORAGE_KEY)?.replace(/^"|"$/g, '') || ''
  } catch {
    return ''
  }
}

function readAuthorizationToken(headers: unknown) {
  if (typeof headers !== 'object' || headers === null) {
    return ''
  }

  const headerBag = headers as {
    get?: (name: string) => unknown
    Authorization?: unknown
    authorization?: unknown
  }
  const authorization =
    (typeof headerBag.get === 'function' ? headerBag.get('Authorization') : undefined) ??
    headerBag.Authorization ??
    headerBag.authorization

  if (typeof authorization !== 'string') {
    return ''
  }

  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? ''
}

function notifyUnauthorized(headers: unknown) {
  unauthorizedHandler?.({
    token: readAuthorizationToken(headers)
  })
}

const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API || '/api',
  timeout: 5000
})

service.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token && !readAuthorizationToken(config.headers)) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

function readErrorEnvelope(value: unknown) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {}
  }

  const record = value as Record<string, unknown>
  return {
    code: typeof record.code === 'number' ? record.code : undefined,
    message: typeof record.message === 'string' ? record.message : undefined
  }
}

function parseEnvelope(value: unknown): ApiEnvelope {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ApiContractError('接口响应格式无效')
  }

  const record = value as Record<string, unknown>

  if (typeof record.success !== 'boolean' || typeof record.code !== 'number') {
    throw new ApiContractError('接口响应信封缺少有效的 success 或 code')
  }

  if (
    record.message !== undefined &&
    record.message !== null &&
    typeof record.message !== 'string'
  ) {
    throw new ApiContractError('接口响应信封的 message 格式无效')
  }

  return {
    success: record.success,
    code: record.code,
    data: record.data,
    message: typeof record.message === 'string' ? record.message : ''
  }
}

service.interceptors.response.use(undefined, (error: AxiosError<unknown>) => {
  const envelope = readErrorEnvelope(error.response?.data)
  const code = envelope.code ?? error.response?.status
  const message = envelope.message || error.message || '网络请求失败'

  if (code === 401) {
    notifyUnauthorized(error.config?.headers)
  }

  return Promise.reject(new ApiError(message, { code, cause: error }))
})

/**
 * Send a request and unwrap the application's standard response envelope.
 * API modules therefore receive business data directly instead of Axios metadata.
 */
async function request<T, D = unknown>(
  config: AxiosRequestConfig<D>,
  decode: ResponseDecoder<T>
): Promise<T> {
  const response = await service.request<unknown, AxiosResponse<unknown>, D>(config)
  const { success, code, data, message } = parseEnvelope(response.data)

  if (!success) {
    if (code === 401) {
      notifyUnauthorized(response.config.headers)
    }

    throw new ApiError(message || '请求处理失败', { code })
  }

  try {
    return decode(data)
  } catch (error) {
    if (error instanceof ApiContractError) {
      throw error
    }

    throw new ApiContractError('接口业务数据格式无效', { cause: error })
  }
}

export default request
