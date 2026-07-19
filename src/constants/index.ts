import type { Category } from '@/api/category'

// PC device minimum width.
export const PC_DEVICE_WIDTH = 1280

/** Local category used to represent the unfiltered feed. */
export const ALL_CATEGORY_ITEM = {
  id: 'all',
  name: '全部'
} satisfies Category
