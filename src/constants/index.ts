import type { Category } from '@/api/category'

export const PC_DEVICE_WIDTH = 1280

export const THEME_LIGHT = 'light'
export const THEME_DARK = 'dark'
export const THEME_SYSTEM = 'system'
export const THEME_STORAGE_KEY = 'imooc-front:theme'

export type ThemePreference = typeof THEME_LIGHT | typeof THEME_DARK | typeof THEME_SYSTEM

/** Local category used to represent the unfiltered feed. */
export const ALL_CATEGORY_ITEM = {
  id: 'all',
  name: '全部'
} satisfies Category

/**
 * Immediately available category data used before the remote list is refreshed.
 * It also acts as a resilient fallback when the category request is unavailable.
 */
export const CATEGORY_FALLBACK_DATA = [
  ALL_CATEGORY_ITEM,
  { id: 'web_app_icon', name: 'UI/UX' },
  { id: 'design', name: '平面' },
  { id: 'illustration', name: '插画/漫画' },
  { id: 'photography', name: '摄影' },
  { id: 'games', name: '游戏' },
  { id: 'anime', name: '动漫' },
  { id: 'industrial_design', name: '工业设计' },
  { id: 'architecture', name: '建筑设计' },
  { id: 'humanities', name: '人文艺术' },
  { id: 'home', name: '家居/家装' }
] satisfies readonly Category[]

export const CATEGORY_STORAGE_KEY = 'imooc-front:categories'

export const SEARCH_HISTORY_STORAGE_KEY = 'imooc-front:search-history'
export const SEARCH_HISTORY_LIMIT = 10

export const USER_TOKEN_STORAGE_KEY = 'imooc-front:user-token'
export const LOGIN_TYPE_USERNAME = 'username'
export const LOGIN_TYPE_OAUTH_NO_REGISTER_CODE = 204

export const OSS_REGION = import.meta.env.VITE_OSS_REGION || 'oss-cn-beijing'
export const OSS_BUCKET = import.meta.env.VITE_OSS_BUCKET || 'imooc-front'
export const AVATAR_MAX_FILE_SIZE = 5 * 1024 * 1024
export const AVATAR_OUTPUT_SIZE = 512
