import { createApp } from 'vue'

import App from './App.vue'
import materialLibrary from './libs'
import { installPermissionGuard } from './permission'
import router from './router'
import { pinia, useUserStore } from './stores'
import './styles/tailwind.css'
import './styles/index.scss'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(materialLibrary)

installPermissionGuard(router)

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
