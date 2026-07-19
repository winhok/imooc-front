import type { Category } from '@/api/category'

// PC device minimum width.
export const PC_DEVICE_WIDTH = 1280

export const THEME_LIGHT = 'light'
export const THEME_DARK = 'dark'
export const THEME_SYSTEM = 'system'

export type ThemePreference = typeof THEME_LIGHT | typeof THEME_DARK | typeof THEME_SYSTEM

/** Local category used to represent the unfiltered feed. */
export const ALL_CATEGORY_ITEM = {
  id: 'all',
  name: '全部'
} satisfies Category
