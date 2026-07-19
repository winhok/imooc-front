<script setup lang="ts">
import NavigationBar from './components/navigation/index.vue'
import PexelsList from './components/list/index.vue'

defineOptions({ name: 'MainView' })
</script>

<template>
  <div
    class="min-h-full bg-zinc-50 transition-colors duration-300 motion-reduce:transition-none dark:bg-zinc-950"
  >
    <NavigationBar />
    <div class="mx-auto w-full max-w-[1600px] px-[12px] pt-[12px] xl:px-[32px] xl:pt-[24px]">
      <PexelsList />
    </div>
  </div>
</template>
