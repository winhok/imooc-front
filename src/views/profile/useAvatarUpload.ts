import type OSS from 'ali-oss'

import { getOssCredentials } from '@/api/profile'
import { OSS_BUCKET, OSS_REGION } from '@/constants'

function toClientCredentials(response: Awaited<ReturnType<typeof getOssCredentials>>) {
  const credentials = response.Credentials

  return {
    accessKeyId: credentials.AccessKeyId,
    accessKeySecret: credentials.AccessKeySecret,
    stsToken: credentials.SecurityToken
  }
}

function getObjectExtension(type: string) {
  if (type === 'image/webp') return 'webp'
  if (type === 'image/png') return 'png'
  return 'jpg'
}

function normalizeObjectOwner(username: string) {
  return (
    username
      .normalize('NFKC')
      .replace(/[^\p{L}\p{N}._-]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64) || 'user'
  )
}

export function useAvatarUpload() {
  let client: OSS | undefined

  async function getClient() {
    if (client) {
      return client
    }

    const [{ default: OssClient }, response] = await Promise.all([
      import('ali-oss'),
      getOssCredentials()
    ])

    client = new OssClient({
      ...toClientCredentials(response),
      region: OSS_REGION,
      bucket: OSS_BUCKET,
      secure: true,
      authorizationV4: true,
      refreshSTSToken: async () => toClientCredentials(await getOssCredentials()),
      refreshSTSTokenInterval: 4 * 60 * 1000
    })

    return client
  }

  async function uploadAvatar(blob: Blob, username: string) {
    const ossClient = await getClient()
    const owner = normalizeObjectOwner(username)
    const extension = getObjectExtension(blob.type)
    const objectName = `images/${owner}/${crypto.randomUUID()}.${extension}`
    const result = await ossClient.put(objectName, blob, { mime: blob.type })

    return result.url.replace(/^http:/, 'https:')
  }

  return { uploadAvatar }
}
