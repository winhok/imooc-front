import type { RouteRecordRaw } from 'vue-router'

import { authRoutes } from './auth-routes'

export const mobileRoutes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/main/index.vue'),
    children: [
      {
        path: 'pins/:id',
        name: 'pins',
        component: () => import('@/views/pins/index.vue'),
        props: true
      }
    ]
  },
  ...authRoutes
] satisfies RouteRecordRaw[]
