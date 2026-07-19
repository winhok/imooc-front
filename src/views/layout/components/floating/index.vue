<script setup lang="ts">
defineOptions({ name: 'LayoutFloating' })
</script>

<template>
  <aside class="pointer-events-none fixed right-[24px] bottom-[24px] z-30" aria-label="悬浮操作区">
    <slot />
  </aside>
</template>
