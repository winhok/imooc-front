import { WEIBO_APP_KEY, WEIBO_RELATED_UID } from '@/constants'

export interface ShareContent {
  title: string
  text: string
  url: string
  imageUrl?: string
}

export function createWeiboShareUrl(content: ShareContent) {
  const parameters = new URLSearchParams({
    url: content.url,
    title: `${content.title} ${content.text}`,
    language: 'zh_cn'
  })

  if (content.imageUrl) {
    parameters.set('pic', content.imageUrl)
  }

  if (WEIBO_APP_KEY) {
    parameters.set('appkey', WEIBO_APP_KEY)
  }

  if (WEIBO_RELATED_UID) {
    parameters.set('ralateUid', WEIBO_RELATED_UID)
  }

  return `https://service.weibo.com/share/share.php?${parameters.toString()}`
}

export function openShareWindow(url: string) {
  const width = 615
  const height = 505
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2)
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2)

  window.open(
    url,
    '_blank',
    `popup=yes,width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`
  )
}
