<script setup lang="ts">
import DesktopHeader from './components/header/index.vue'
import LayoutFloating from './components/floating/index.vue'
import LayoutMain from './components/main.vue'

defineOptions({ name: 'DesktopLayout' })
</script>

<template>
  <div class="grid h-dvh grid-rows-[72px_minmax(0,1fr)] bg-zinc-50">
    <DesktopHeader />
    <LayoutMain />
    <LayoutFloating />
  </div>
</template>
