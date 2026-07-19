<script setup lang="ts">
import { RouterView } from 'vue-router'

defineOptions({ name: 'LayoutMain' })
</script>

<template>
  <main class="min-h-0 overflow-auto">
    <RouterView />
  </main>
</template>
