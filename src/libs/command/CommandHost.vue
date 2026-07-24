<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'

import ConfirmDialog from '@/libs/confirm/index.vue'
import MessageHost from '@/libs/message/index.vue'

import { useCommandHost } from './index'

defineOptions({ name: 'CommandHost' })

const controller = useCommandHost()
const currentConfirm = computed(() => controller.state.confirmQueue[0])

onMounted(() => {
  controller.setMessageHostReady(true)
})

onBeforeUnmount(() => {
  controller.setMessageHostReady(false)
})

function settleConfirm(value: boolean) {
  const request = currentConfirm.value

  if (request) {
    controller.settleConfirm(request.id, value)
  }
}

function finishConfirm() {
  const request = currentConfirm.value

  if (request) {
    controller.finishConfirm(request.id)
  }
}
</script>

<template>
  <Teleport to="#app-overlays">
    <ConfirmDialog
      v-if="currentConfirm"
      :key="currentConfirm.id"
      v-bind="currentConfirm.options"
      @confirm="settleConfirm(true)"
      @cancel="settleConfirm(false)"
      @closed="finishConfirm"
    />

    <MessageHost :messages="controller.state.messages" @dismiss="controller.dismissMessage" />
  </Teleport>
</template>
