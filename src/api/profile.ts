import type { UserProfile } from '@/api/auth'
import request from '@/utils/request'
import { decodeVoid, expectNonEmptyString, expectRecord, optionalString } from '@/utils/decode'

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
  return request(
    {
      url: '/user/profile',
      method: 'PUT',
      data
    },
    decodeVoid
  )
}

export function getOssCredentials() {
  return request(
    {
      url: '/user/sts',
      method: 'GET'
    },
    (value): OssCredentialsResponse => {
      const record = expectRecord(value)
      const credentials = expectRecord(record.Credentials, 'data.Credentials')

      return {
        Credentials: {
          AccessKeyId: expectNonEmptyString(
            credentials.AccessKeyId,
            'data.Credentials.AccessKeyId'
          ),
          AccessKeySecret: expectNonEmptyString(
            credentials.AccessKeySecret,
            'data.Credentials.AccessKeySecret'
          ),
          SecurityToken: expectNonEmptyString(
            credentials.SecurityToken,
            'data.Credentials.SecurityToken'
          ),
          Expiration: optionalString(credentials, 'Expiration', 'data.Credentials.Expiration')
        }
      }
    }
  )
}
