import type { RouteRecordRaw } from 'vue-router'

export const memberRoute = {
  path: '/member',
  name: 'member',
  component: () => import('@/views/member/index.vue'),
  meta: { requiresAuth: true }
} satisfies RouteRecordRaw
