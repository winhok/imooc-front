import { createApp } from 'vue'

import App from './App.vue'
import materialLibrary from './libs'
import router from './router'
import { pinia } from './stores'
import './styles/tailwind.css'
import './styles/index.scss'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(materialLibrary)

app.mount('#app')
