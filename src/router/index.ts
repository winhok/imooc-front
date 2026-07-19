import { createRouter, createWebHistory } from 'vue-router'

import { isMobileTerminal } from '@/utils/flexible'

import { mobileRoutes } from './modules/mobile-routes'
import { pcRoutes } from './modules/pc-routes'
import { installRouteTaskStack, shouldResetScroll } from './route-task-stack'

const history = createWebHistory(import.meta.env.BASE_URL)
const router = createRouter({
  history,
  routes: isMobileTerminal.value ? mobileRoutes : pcRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    return shouldResetScroll(to, from) ? { left: 0, top: 0 } : false
  }
})

installRouteTaskStack(router, history)

export default router
