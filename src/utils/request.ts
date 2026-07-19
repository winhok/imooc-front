import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'

import { USER_TOKEN_STORAGE_KEY } from '@/constants'

interface ApiEnvelope<T> {
  success: boolean
  code: number
  data: T
  message: string
}

type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | undefined

export class ApiError extends Error {
  readonly code?: number

  constructor(message: string, options: { code?: number; cause?: unknown } = {}) {
    super(message, { cause: options.cause })
    this.name = 'ApiError'
    this.code = options.code
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

function notifyUnauthorized() {
  unauthorizedHandler?.()
}

const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API || '/api',
  timeout: 5000
})

service.interceptors.request.use((config) => {
  const token = getStoredToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

service.interceptors.response.use(undefined, (error: AxiosError<ApiEnvelope<unknown>>) => {
  const code = error.response?.data.code ?? error.response?.status
  const message = error.response?.data.message || error.message || '网络请求失败'

  if (code === 401) {
    notifyUnauthorized()
  }

  return Promise.reject(new ApiError(message, { code, cause: error }))
})

/**
 * Send a request and unwrap the application's standard response envelope.
 * API modules therefore receive business data directly instead of Axios metadata.
 */
async function request<T, D = unknown>(config: AxiosRequestConfig<D>): Promise<T> {
  const response = await service.request<ApiEnvelope<T>, { data: ApiEnvelope<T> }, D>(config)
  const { success, code, data, message } = response.data

  if (!success) {
    if (code === 401) {
      notifyUnauthorized()
    }

    throw new ApiError(message || '请求处理失败', { code })
  }

  return data
}

export default request
