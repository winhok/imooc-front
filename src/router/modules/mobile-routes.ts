import type { RouteRecordRaw } from 'vue-router'

export const mobileRoutes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/main/index.vue')
  }
] satisfies RouteRecordRaw[]
