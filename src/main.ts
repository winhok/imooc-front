import { createApp } from 'vue'

import App from './App.vue'
import { createCommandController, createCommandPlugin } from './libs/command'
import { installPermissionGuard } from './permission'
import router from './router'
import { pinia, useUserStore } from './stores'
import './styles/tailwind.css'
import './styles/index.scss'

const PRELOAD_RECOVERY_KEY = 'imooc-front:preload-recovery'
const PRELOAD_RECOVERY_WINDOW = 10_000

window.addEventListener('vite:preloadError', (event) => {
  let lastRecovery = 0

  try {
    lastRecovery = Number(sessionStorage.getItem(PRELOAD_RECOVERY_KEY)) || 0
  } catch {
    // Storage can be unavailable in hardened browsing modes.
  }

  if (Date.now() - lastRecovery < PRELOAD_RECOVERY_WINDOW) {
    return
  }

  event.preventDefault()

  try {
    sessionStorage.setItem(PRELOAD_RECOVERY_KEY, String(Date.now()))
  } catch {
    // Reload recovery still works without the loop guard in this tab.
  }

  window.location.reload()
})

const app = createApp(App)
const commandController = createCommandController()

app.use(pinia)
app.use(router)
app.use(createCommandPlugin(commandController))

installPermissionGuard(router, commandController.service)

async function bootstrap() {
  const userStore = useUserStore(pinia)

  try {
    await userStore.initialize()
  } catch {
    // The request layer handles an expired token. Other profile errors must not
    // prevent the public application from mounting.
  }

  await router.isReady()
  app.mount('#app')
}

void bootstrap()
