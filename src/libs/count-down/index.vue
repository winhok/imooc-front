<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import type { VNode } from 'vue'
import { useIntervalFn } from '@vueuse/core'

import { formatDuration } from './format-duration'

defineOptions({ name: 'MCountDown' })

const props = withDefaults(
  defineProps<{
    time: number
    format?: string
  }>(),
  {
    format: 'HH:mm:ss'
  }
)

const emit = defineEmits<{
  change: [remaining: number]
  finish: []
}>()

defineSlots<{
  default(props: { formatted: string; remaining: number }): VNode[]
}>()

const remaining = shallowRef(0)
let endsAt = 0
let hasFinished = false

const formatted = computed(() => formatDuration(remaining.value, props.format))

function finish() {
  if (hasFinished) {
    return
  }

  hasFinished = true
  remaining.value = 0
  pause()
  emit('change', 0)
  emit('finish')
}

function tick() {
  const nextRemaining = Math.max(0, endsAt - Date.now())

  if (nextRemaining === 0) {
    finish()
    return
  }

  remaining.value = nextRemaining
  emit('change', nextRemaining)
}

const { pause, resume } = useIntervalFn(tick, 250, { immediate: false })

watch(
  () => props.time,
  (time) => {
    pause()
    hasFinished = false
    remaining.value = Math.max(0, time)

    if (remaining.value === 0) {
      finish()
      return
    }

    endsAt = Date.now() + remaining.value
    resume()
  },
  { immediate: true }
)

onBeforeUnmount(pause)
</script>

<template>
  <slot :formatted="formatted" :remaining="remaining">
    <span>{{ formatted }}</span>
  </slot>
</template>
