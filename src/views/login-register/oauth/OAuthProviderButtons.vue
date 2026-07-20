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
  <section class="mt-[40px]" aria-labelledby="oauth-login-title">
    <span id="qqLoginButton" hidden />

    <h2 id="oauth-login-title" class="sr-only">其他登录方式</h2>

    <div class="flex justify-around">
      <button
        v-for="provider in providers"
        :key="provider.id"
        type="button"
        class="grid size-[40px] place-items-center rounded-full focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-55"
        :disabled="Boolean(activeProvider)"
        :aria-busy="activeProvider === provider.id"
        @click="startOAuthLogin(provider.id)"
      >
        <span
          v-if="activeProvider === provider.id"
          class="size-[16px] animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
          aria-hidden="true"
        />
        <MSvgIcon v-else :name="provider.icon" :size="40" :class="provider.iconClass" />
        <span class="sr-only">{{ provider.name }}</span>
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
