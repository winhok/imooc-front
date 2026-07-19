import request from '@/utils/request'

/** Fetch the category list. */
export function getCategory() {
  return request.get<unknown>('/category')
}
