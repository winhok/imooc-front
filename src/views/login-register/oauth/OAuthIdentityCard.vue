<script setup lang="ts">
import { computed } from 'vue'

import type { OAuthIdentity } from '@/api/auth'

defineOptions({ name: 'OAuthIdentityCard' })

interface Props {
  identity: OAuthIdentity
}

const props = defineProps<Props>()
const providerName = computed(() => (props.identity.provider === 'QQ' ? 'QQ' : '微信'))
const nickname = computed(() => props.identity.data.nickname)
const avatar = computed(() =>
  props.identity.provider === 'QQ'
    ? props.identity.data.figureurl_qq_2
    : props.identity.data.headimgurl
)
const initial = computed(() => nickname.value.trim().slice(0, 1).toUpperCase() || 'M')
</script>

<template>
  <div
    class="mb-[18px] flex items-center gap-[12px] rounded-[12px] bg-zinc-50 p-[12px] dark:bg-zinc-800/70"
  >
    <img
      v-if="avatar"
      :src="avatar"
      :alt="`${nickname}的头像`"
      class="size-[42px] rounded-full object-cover"
      referrerpolicy="no-referrer"
    />
    <span
      v-else
      class="grid size-[42px] place-items-center rounded-full bg-red-500 text-sm font-semibold text-white"
      aria-hidden="true"
    >
      {{ initial }}
    </span>

    <div class="min-w-0">
      <p class="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {{ nickname }}
      </p>
      <p class="mt-[2px] text-xs text-zinc-500 dark:text-zinc-400">已通过{{ providerName }}认证</p>
    </div>
  </div>
</template>
