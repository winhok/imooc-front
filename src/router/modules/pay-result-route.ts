import type { RouteRecordRaw } from 'vue-router'

export const payResultRoute = {
  path: '/pay/result',
  name: 'pay-result',
  component: () => import('@/views/pay/index.vue'),
  meta: { requiresAuth: true }
} satisfies RouteRecordRaw
