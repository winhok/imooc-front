<script setup lang="ts">
import DesktopHeader from './components/header/index.vue'
import LayoutFloating from './components/floating/index.vue'
import LayoutMain from './components/main.vue'

defineOptions({ name: 'DesktopLayout' })
</script>

<template>
  <div
    class="grid h-dvh grid-rows-[60px_minmax(0,1fr)] bg-white transition-colors duration-300 motion-reduce:transition-none dark:bg-zinc-800"
  >
    <DesktopHeader />
    <LayoutMain />
    <LayoutFloating />
  </div>
</template>
