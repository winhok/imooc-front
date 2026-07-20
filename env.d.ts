/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_API: string
  readonly VITE_PUBLIC_APP_URL?: string
  readonly VITE_WEIBO_APP_KEY?: string
  readonly VITE_WEIBO_RELATED_UID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
