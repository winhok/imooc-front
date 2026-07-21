import { createApp } from 'vue'

import App from './App.vue'
import { createCommandController, createCommandPlugin } from './libs/command'
import { installPermissionGuard } from './permission'
import router from './router'
import { pinia, useUserStore } from './stores'
import './styles/tailwind.css'
import './styles/index.scss'

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
