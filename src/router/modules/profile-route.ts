import type { RouteRecordRaw } from 'vue-router'

export const profileRoute = {
  path: '/profile',
  name: 'profile',
  component: () => import('@/views/profile/index.vue'),
  meta: { requiresAuth: true }
} satisfies RouteRecordRaw
