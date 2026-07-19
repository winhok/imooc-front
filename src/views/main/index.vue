<script setup lang="ts">
import NavigationBar from './components/navigation/index.vue'

defineOptions({ name: 'MainView' })
</script>

<template>
  <div
    class="min-h-full bg-zinc-50 transition-colors duration-300 motion-reduce:transition-none dark:bg-zinc-950"
  >
    <NavigationBar />
  </div>
</template>
