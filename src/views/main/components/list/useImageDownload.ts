import { onScopeDispose, readonly, shallowRef } from 'vue'
import { saveAs } from 'file-saver'

import { message } from '@/libs/message'
import type { PexelsItem } from '@/types/pexels'

function sanitizeFilename(value: string) {
  return Array.from(value)
    .filter((character) => character.charCodeAt(0) >= 32)
    .join('')
    .trim()
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .slice(0, 80)
}

function getFilename(item: PexelsItem) {
  const title = sanitizeFilename(item.title) || 'pexels-image'
  const extension = item.photoType?.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'jpg'

  return `${title}-${item.id}.${extension}`
}

export function useImageDownload() {
  const isDownloading = shallowRef(false)
  let activeController: AbortController | undefined

  async function downloadImage(item: PexelsItem) {
    if (isDownloading.value) {
      return
    }

    const controller = new AbortController()
    activeController = controller
    isDownloading.value = true
    const closePreparingMessage = message.info('正在准备图片…', 0)

    try {
      const candidates = [item.photoDownLink, item.photo].filter((url): url is string =>
        Boolean(url)
      )
      let imageBlob: Blob | undefined

      for (const url of candidates) {
        try {
          const response = await fetch(url, { signal: controller.signal })

          if (!response.ok) {
            continue
          }

          imageBlob = await response.blob()
          break
        } catch (error) {
          if (controller.signal.aborted) {
            throw error
          }
        }
      }

      closePreparingMessage()

      if (imageBlob) {
        saveAs(imageBlob, getFilename(item))
        message.success('图片下载已开始')
        return
      }

      saveAs(item.photo, getFilename(item))
      message.warning('原图地址无法直接读取，已尝试通过浏览器下载当前图片')
    } catch (error) {
      closePreparingMessage()

      if (!controller.signal.aborted) {
        message.error(error instanceof Error ? error.message : '图片下载失败，请稍后重试')
      }
    } finally {
      if (activeController === controller) {
        activeController = undefined
        isDownloading.value = false
      }
    }
  }

  onScopeDispose(() => activeController?.abort())

  return {
    isDownloading: readonly(isDownloading),
    downloadImage
  }
}
