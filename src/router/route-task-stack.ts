import { computed, readonly, shallowRef } from 'vue'
import {
  START_LOCATION,
  type RouteLocationNormalized,
  type RouteLocationNormalizedLoaded,
  type Router,
  type RouterHistory
} from 'vue-router'

export type RouteTransitionDirection = 'none' | 'push' | 'back'

interface RouteTask {
  key: string
  cacheName?: string
}

const direction = shallowRef<RouteTransitionDirection>('none')
const tasks = shallowRef<RouteTask[]>([])

export const routeTransitionDirection = readonly(direction)
export const cachedRouteViewNames = computed(() => [
  ...new Set(tasks.value.flatMap((task) => (task.cacheName ? [task.cacheName] : [])))
])

export function getRootRouteKey(route: RouteLocationNormalized) {
  return route.matched[0]?.path ?? route.path
}

function createTask(route: RouteLocationNormalized): RouteTask {
  const rootRecord = route.matched[0]

  return {
    key: getRootRouteKey(route),
    cacheName: rootRecord?.meta.keepAlive ? rootRecord.meta.taskViewName : undefined
  }
}

function findLastTaskIndex(key: string) {
  for (let index = tasks.value.length - 1; index >= 0; index -= 1) {
    if (tasks.value[index]?.key === key) {
      return index
    }
  }

  return -1
}

export function installRouteTaskStack(router: Router, history: RouterHistory) {
  let pendingHistoryDirection: RouteTransitionDirection | undefined

  history.listen((_to, _from, information) => {
    pendingHistoryDirection = information.direction === 'back' ? 'back' : 'push'
  })

  router.beforeEach((to, from) => {
    const changesRootView = getRootRouteKey(to) !== getRootRouteKey(from)

    if (from === START_LOCATION || !changesRootView) {
      direction.value = 'none'
      pendingHistoryDirection = undefined
      return
    }

    direction.value = pendingHistoryDirection ?? 'push'
    pendingHistoryDirection = undefined
  })

  router.afterEach((to, from, failure) => {
    if (failure) {
      return
    }

    const task = createTask(to)
    const changesRootView = getRootRouteKey(to) !== getRootRouteKey(from)

    if (from === START_LOCATION || tasks.value.length === 0) {
      tasks.value = [task]
      return
    }

    if (!changesRootView) {
      return
    }

    if (to.matched[0]?.meta.taskRoot) {
      tasks.value = [task]
      return
    }

    if (direction.value === 'back') {
      const targetIndex = findLastTaskIndex(task.key)
      tasks.value = targetIndex >= 0 ? tasks.value.slice(0, targetIndex + 1) : [task]
      return
    }

    tasks.value = [...tasks.value, task]
  })
}

export function shouldResetScroll(
  to: RouteLocationNormalized,
  from: RouteLocationNormalizedLoaded
) {
  return getRootRouteKey(to) !== getRootRouteKey(from)
}
