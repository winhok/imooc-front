import { createPinia } from 'pinia'

export const pinia = createPinia()

export { useCategoryStore } from './category'
export { useThemeStore } from './theme'
