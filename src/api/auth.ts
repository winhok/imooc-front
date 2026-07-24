import request from '@/utils/request'
import {
  decodeVoid,
  expectBoolean,
  expectNonEmptyString,
  expectRecord,
  optionalFiniteNumber,
  optionalString
} from '@/utils/decode'

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

function decodeLoginResponse(value: unknown): LoginResponse {
  const record = expectRecord(value)
  return {
    token: optionalString(record, 'token'),
    code: optionalFiniteNumber(record, 'code')
  }
}

function decodeWeChatLoginData(value: unknown): WeChatLoginData {
  const record = expectRecord(value)
  return {
    appId: expectNonEmptyString(record.appId, 'data.appId'),
    appSecret: expectNonEmptyString(record.appSecret, 'data.appSecret'),
    redirectUri: expectNonEmptyString(record.redirectUri, 'data.redirectUri'),
    scope: expectNonEmptyString(record.scope, 'data.scope'),
    state: expectNonEmptyString(record.state, 'data.state')
  }
}

function decodeWeChatTokenData(value: unknown): WeChatTokenData {
  const record = expectRecord(value)
  return {
    access_token: expectNonEmptyString(record.access_token, 'data.access_token'),
    openid: expectNonEmptyString(record.openid, 'data.openid')
  }
}

function decodeWeChatUserData(value: unknown): WeChatUserData {
  const record = expectRecord(value)
  return {
    nickname: expectNonEmptyString(record.nickname, 'data.nickname'),
    headimgurl: expectNonEmptyString(record.headimgurl, 'data.headimgurl')
  }
}

export function decodeUserProfile(value: unknown): UserProfile {
  const record = expectRecord(value)
  return {
    id: optionalString(record, 'id'),
    username: expectNonEmptyString(record.username, 'data.username'),
    nickname: expectNonEmptyString(record.nickname, 'data.nickname'),
    avatar: optionalString(record, 'avatar'),
    vipLevel: optionalFiniteNumber(record, 'vipLevel'),
    title: optionalString(record, 'title'),
    company: optionalString(record, 'company'),
    homePage: optionalString(record, 'homePage'),
    introduction: optionalString(record, 'introduction')
  }
}

export function verifyCaptcha(data: CaptchaVerifyPayload, signal?: AbortSignal) {
  return request(
    {
      url: '/sys/captcha',
      method: 'POST',
      data,
      signal
    },
    (value) => expectBoolean(value, 'data')
  )
}

export function loginUser(data: LoginPayload) {
  return request(
    {
      url: '/sys/login',
      method: 'POST',
      data
    },
    decodeLoginResponse
  )
}

export function registerUser(data: RegisterPayload) {
  return request(
    {
      url: '/sys/register',
      method: 'POST',
      data
    },
    decodeVoid
  )
}

export function getWeChatLoginData() {
  return request(
    {
      url: '/sys/wxlogin/data',
      method: 'GET'
    },
    decodeWeChatLoginData
  )
}

export function getWeChatLoginToken(appId: string, appSecret: string, code: string) {
  return request(
    {
      url: '/sys/wxlogin/access_token',
      method: 'GET',
      params: {
        appid: appId,
        secret: appSecret,
        code
      }
    },
    decodeWeChatTokenData
  )
}

export function getWeChatUserInfo(accessToken: string, openid: string) {
  return request(
    {
      url: '/sys/wxlogin/userinfo',
      method: 'GET',
      params: {
        accessToken,
        openid
      }
    },
    decodeWeChatUserData
  )
}

export function getUserProfile(signal?: AbortSignal, authToken?: string) {
  return request(
    {
      url: '/user/profile',
      method: 'GET',
      signal,
      headers: authToken
        ? {
            Authorization: `Bearer ${authToken}`
          }
        : undefined
    },
    decodeUserProfile
  )
}
