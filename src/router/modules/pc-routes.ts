import type { RouteRecordRaw } from 'vue-router'

import { authRoutes } from './auth-routes'
import { memberRoute } from './member-route'
import { profileRoute } from './profile-route'

export const pcRoutes = [
  {
    path: '/',
    component: () => import('@/views/layout/index.vue'),
    children: [
      {
        path: '',
        name: 'desktop-home',
        component: () => import('@/views/main/index.vue'),
        children: [
          {
            path: 'pins/:id',
            name: 'pins',
            component: () => import('@/views/pins/index.vue'),
            props: true
          }
        ]
      }
    ]
  },
  memberRoute,
  profileRoute,
  ...authRoutes
] satisfies RouteRecordRaw[]
