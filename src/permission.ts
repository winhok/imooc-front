import type { Router } from 'vue-router'

import type { CommandService } from '@/libs/command'
import { resetRouteTaskStack } from '@/router/route-task-stack'
import { pinia, useUserStore } from '@/stores'
import { setUnauthorizedHandler } from '@/utils/request'

const GUEST_ROUTE_NAMES = new Set(['login', 'register'])

export function installPermissionGuard(
  router: Router,
  { message }: Pick<CommandService, 'message'>
) {
  const userStore = useUserStore(pinia)
  let isHandlingUnauthorized = false

  router.beforeEach((to) => {
    if (to.meta.guestOnly && userStore.isAuthenticated) {
      return '/'
    }

    if (to.meta.requiresAuth && !userStore.isAuthenticated) {
      message.warning('请先登录后继续')
      return {
        name: 'login',
        query: { redirect: to.fullPath }
      }
    }
  })

  setUnauthorizedHandler(({ token }) => {
    if (isHandlingUnauthorized || !token || !userStore.token || userStore.token !== token) {
      return
    }

    isHandlingUnauthorized = true
    const redirect = GUEST_ROUTE_NAMES.has(String(router.currentRoute.value.name))
      ? undefined
      : router.currentRoute.value.fullPath

    userStore.clearSession()
    resetRouteTaskStack()
    message.warning('登录状态已过期，请重新登录')
    void router
      .replace({
        name: 'login',
        query: redirect ? { redirect } : undefined
      })
      .finally(() => {
        isHandlingUnauthorized = false
      })
  })
}
