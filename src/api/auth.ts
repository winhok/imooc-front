import request from '@/utils/request'

export interface CaptchaVerifyPayload {
  behavior: readonly number[]
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginPayload extends LoginCredentials {
  loginType: 'username'
}

export interface LoginResponse {
  token: string
}

export type RegisterPayload = LoginCredentials

export interface UserProfile {
  id?: string
  username: string
  nickname: string
  avatar?: string
  vipLevel?: number
  title?: string
  company?: string
  homePage?: string
  introduction?: string
}

export function verifyCaptcha(data: CaptchaVerifyPayload, signal?: AbortSignal) {
  return request<boolean, CaptchaVerifyPayload>({
    url: '/sys/captcha',
    method: 'POST',
    data,
    signal
  })
}

export function loginUser(data: LoginPayload) {
  return request<LoginResponse, LoginPayload>({
    url: '/sys/login',
    method: 'POST',
    data
  })
}

export function registerUser(data: RegisterPayload) {
  return request<unknown, RegisterPayload>({
    url: '/sys/register',
    method: 'POST',
    data
  })
}

export function getUserProfile(signal?: AbortSignal) {
  return request<UserProfile>({
    url: '/user/profile',
    method: 'GET',
    signal
  })
}
