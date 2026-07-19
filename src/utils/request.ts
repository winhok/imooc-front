import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'

interface ApiEnvelope<T> {
  success: boolean
  code: number
  data: T
  message: string
}

const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_API || '/api',
  timeout: 5000
})

service.interceptors.response.use(undefined, (error: AxiosError<ApiEnvelope<unknown>>) => {
  const message = error.response?.data.message || error.message || '网络请求失败'

  return Promise.reject(new Error(message, { cause: error }))
})

/**
 * Send a request and unwrap the application's standard response envelope.
 * API modules therefore receive business data directly instead of Axios metadata.
 */
async function request<T, D = unknown>(config: AxiosRequestConfig<D>): Promise<T> {
  const response = await service.request<ApiEnvelope<T>, { data: ApiEnvelope<T> }, D>(config)
  const { success, data, message } = response.data

  if (!success) {
    throw new Error(message || '请求处理失败')
  }

  return data
}

export default request
