import type { UserProfile } from '@/api/auth'
import request from '@/utils/request'

export type EditableUserProfile = Pick<
  UserProfile,
  'nickname' | 'title' | 'company' | 'homePage' | 'introduction'
>

export interface OssCredentialsResponse {
  Credentials: {
    AccessKeyId: string
    AccessKeySecret: string
    SecurityToken: string
    Expiration?: string
  }
}

export function updateUserProfile(data: UserProfile) {
  return request<unknown, UserProfile>({
    url: '/user/profile',
    method: 'PUT',
    data
  })
}

export function getOssCredentials() {
  return request<OssCredentialsResponse>({
    url: '/user/sts',
    method: 'GET'
  })
}
