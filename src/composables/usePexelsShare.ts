import { useClipboard, useShare } from '@vueuse/core'
import { useRouter } from 'vue-router'

import { PUBLIC_APP_URL } from '@/constants'
import { message } from '@/libs/message'
import type { PexelsItem } from '@/types/pexels'
import { createWeiboShareUrl, openShareWindow } from '@/utils/share'
import type { ShareContent } from '@/utils/share'

type ShareablePexelsItem = Readonly<Pick<PexelsItem, 'id' | 'title' | 'photo' | 'author'>>

export function usePexelsShare() {
  const router = useRouter()
  const { isSupported: isNativeShareSupported, share } = useShare()
  const { copy, isSupported: isClipboardSupported } = useClipboard({ legacy: true })

  function createShareContent(item: ShareablePexelsItem): ShareContent {
    const route = router.resolve({ name: 'pins', params: { id: item.id } })
    const baseUrl = PUBLIC_APP_URL || window.location.origin

    return {
      title: item.title,
      text: `来自 ${item.author} 的作品`,
      url: new URL(route.href, baseUrl).href,
      imageUrl: item.photo
    }
  }

  async function shareItem(item: ShareablePexelsItem) {
    const content = createShareContent(item)

    try {
      if (isNativeShareSupported.value) {
        await share(content)
        return
      }

      if (!isClipboardSupported.value) {
        throw new Error('当前浏览器不支持系统分享或复制链接')
      }

      await copy(content.url)
      message.success('详情链接已复制')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      message.error(error instanceof Error ? error.message : '分享失败，请稍后重试')
    }
  }

  function shareItemToWeibo(item: ShareablePexelsItem) {
    openShareWindow(createWeiboShareUrl(createShareContent(item)))
  }

  return {
    shareItem,
    shareItemToWeibo
  }
}
