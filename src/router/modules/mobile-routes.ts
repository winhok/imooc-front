import type { RouteRecordRaw } from 'vue-router'

import { authRoutes } from './auth-routes'
import { profileRoute } from './profile-route'

export const mobileRoutes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/main/index.vue'),
    meta: { keepAlive: true, taskRoot: true, taskViewName: 'MainView' },
    children: [
      {
        path: 'pins/:id',
        name: 'pins',
        component: () => import('@/views/pins/index.vue'),
        props: true
      }
    ]
  },
  profileRoute,
  ...authRoutes
] satisfies RouteRecordRaw[]
