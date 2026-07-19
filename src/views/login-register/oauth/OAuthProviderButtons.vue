<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useUserStore } from '@/stores'

import { useOAuthLogin } from './useOAuthLogin'

defineOptions({ name: 'OAuthProviderButtons' })

type OAuthProvider = 'qq' | 'wechat'

interface Props {
  returnTo: string
}

const props = defineProps<Props>()
const router = useRouter()
const userStore = useUserStore()
const { activeProvider, errorMessage, startOAuthLogin } = useOAuthLogin({
  router,
  userStore,
  getReturnTo: () => props.returnTo
})

const providers: readonly {
  id: OAuthProvider
  name: string
  icon: string
  iconClass: string
}[] = [
  { id: 'qq', name: 'QQ', icon: 'qq', iconClass: 'text-sky-500' },
  { id: 'wechat', name: '微信', icon: 'wechat', iconClass: 'text-emerald-500' }
]
</script>

<template>
  <section class="mt-[20px]" aria-labelledby="oauth-login-title">
    <span id="qqLoginButton" hidden />

    <div class="flex items-center gap-[12px]">
      <span class="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
      <h2 id="oauth-login-title" class="text-xs text-zinc-400 dark:text-zinc-500">其他登录方式</h2>
      <span class="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
    </div>

    <div class="mt-[14px] grid grid-cols-2 gap-[10px]">
      <button
        v-for="provider in providers"
        :key="provider.id"
        type="button"
        class="inline-flex h-[42px] items-center justify-center gap-[8px] rounded-[10px] border border-zinc-200 bg-white text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-55 motion-reduce:transition-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        :disabled="Boolean(activeProvider)"
        :aria-busy="activeProvider === provider.id"
        @click="startOAuthLogin(provider.id)"
      >
        <span
          v-if="activeProvider === provider.id"
          class="size-[16px] animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
          aria-hidden="true"
        />
        <MSvgIcon v-else :name="provider.icon" :size="19" :class="provider.iconClass" />
        {{ provider.name }}
      </button>
    </div>

    <p
      v-if="errorMessage"
      role="alert"
      class="mt-[10px] rounded-[9px] bg-red-50 px-[12px] py-[9px] text-xs text-red-600 dark:bg-red-950/40 dark:text-red-300"
    >
      {{ errorMessage }}
    </p>
  </section>
</template>
