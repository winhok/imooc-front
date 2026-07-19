import type { RouteRecordRaw } from 'vue-router'

export const authRoutes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login-register/login/index.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/login-register/register/index.vue'),
    meta: { guestOnly: true }
  }
] satisfies RouteRecordRaw[]
