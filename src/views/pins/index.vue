<script setup lang="ts">
import { toRef } from 'vue'

import PinsDetail from './components/PinsDetail.vue'
import { usePinsTransition } from './usePinsTransition'

defineOptions({ name: 'PinsView' })

interface Props {
  id: string
}

const props = defineProps<Props>()
const { transitionStyle } = usePinsTransition(toRef(props, 'id'))
</script>

<template>
  <div
    class="fixed inset-0 z-50 h-dvh w-screen overflow-hidden bg-zinc-200 dark:bg-zinc-800"
    :style="transitionStyle"
  >
    <PinsDetail :id="id" />
  </div>
</template>
