import request from '@/utils/request'

export interface CaptchaVerifyPayload {
  behavior: readonly number[]
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface UsernameLoginPayload extends LoginCredentials {
  loginType: 'username'
}

export interface LoginResponse {
  token?: string
  code?: number
}

export interface QQOAuthData {
  nickname: string
  figureurl_qq_2: string
  accessToken: string
}

export interface WeChatOAuthData {
  openid: string
  nickname: string
  headimgurl: string
}

export type OAuthIdentity =
  | {
      provider: 'QQ'
      data: QQOAuthData
    }
  | {
      provider: 'WX'
      data: WeChatOAuthData
    }

export type OAuthLoginPayload =
  ({ loginType: 'QQ' } & QQOAuthData) | ({ loginType: 'WX' } & WeChatOAuthData)

export type LoginPayload = UsernameLoginPayload | OAuthLoginPayload

export type OAuthRegisterPayload =
  | (LoginCredentials & { reqType: 'QQ' } & QQOAuthData)
  | (LoginCredentials & { reqType: 'WX' } & WeChatOAuthData)

export type RegisterPayload = LoginCredentials | OAuthRegisterPayload

export interface WeChatLoginData {
  appId: string
  appSecret: string
  redirectUri: string
  scope: string
  state: string
}

export interface WeChatTokenData {
  access_token: string
  openid: string
}

export interface WeChatUserData {
  nickname: string
  headimgurl: string
}

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

export function getWeChatLoginData() {
  return request<WeChatLoginData>({
    url: '/sys/wxlogin/data',
    method: 'GET'
  })
}

export function getWeChatLoginToken(appId: string, appSecret: string, code: string) {
  return request<WeChatTokenData>({
    url: '/sys/wxlogin/access_token',
    method: 'GET',
    params: {
      appid: appId,
      secret: appSecret,
      code
    }
  })
}

export function getWeChatUserInfo(accessToken: string, openid: string) {
  return request<WeChatUserData>({
    url: '/sys/wxlogin/userinfo',
    method: 'GET',
    params: {
      accessToken,
      openid
    }
  })
}

export function getUserProfile(signal?: AbortSignal) {
  return request<UserProfile>({
    url: '/user/profile',
    method: 'GET',
    signal
  })
}
