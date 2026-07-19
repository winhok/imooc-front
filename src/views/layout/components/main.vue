<script setup lang="ts">
import { RouterView } from 'vue-router'

defineOptions({ name: 'LayoutMain' })
</script>

<template>
  <main class="app-scrollbar min-h-0 overflow-auto">
    <RouterView />
  </main>
</template>
