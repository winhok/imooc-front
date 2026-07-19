import { createPinia } from 'pinia'

export const pinia = createPinia()

export { useCategoryStore } from './category'
export { useSearchStore } from './search'
export { useThemeStore } from './theme'
export { useUserStore } from './user'
