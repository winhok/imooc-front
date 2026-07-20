import type { RouteRecordRaw } from 'vue-router'

import { authRoutes } from './auth-routes'
import { memberRoute } from './member-route'
import { payResultRoute } from './pay-result-route'
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
      },
      profileRoute,
      memberRoute,
      payResultRoute
    ]
  },
  ...authRoutes,
  {
    path: '/404',
    name: 'not-found',
    component: () => import('@/views/error-page/NotFoundView.vue')
  },
  { path: '/:pathMatch(.*)*', redirect: '/404' }
] satisfies RouteRecordRaw[]
