import type { App, Component, Plugin } from 'vue'

interface MaterialModule {
  default: Component
}

const materialModules = import.meta.glob<MaterialModule>(
  ['./*/index.vue', '!./confirm/index.vue'],
  {
    eager: true
  }
)

function toComponentName(path: string) {
  const directory = path.split('/')[1]

  if (!directory) {
    throw new Error(`Invalid material component path: ${path}`)
  }

  const pascalName = directory
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')

  return `M${pascalName}`
}

const materialLibrary: Plugin = {
  install(app: App) {
    for (const [path, module] of Object.entries(materialModules)) {
      app.component(toComponentName(path), module.default)
    }
  }
}

export default materialLibrary
