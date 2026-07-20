<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from 'vee-validate'

import type { LoginCredentials } from '@/api/auth'
import { message } from '@/libs/message'
import { useUserStore } from '@/stores'

import AuthField from '../components/AuthField.vue'
import AuthShell from '../components/AuthShell.vue'
import OAuthProviderButtons from '../oauth/OAuthProviderButtons.vue'
import SliderCaptcha from '../components/SliderCaptcha.vue'
import { validatePassword, validateUsername } from '../validation'

defineOptions({ name: 'LoginView' })

interface LoginFormValues {
  username: string
  password: string
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { profile } = storeToRefs(userStore)
const isCaptchaVisible = shallowRef(false)
const isLoggingIn = shallowRef(false)
const pendingCredentials = shallowRef<LoginCredentials>()
const submitError = shallowRef('')

const { defineField, errors, handleSubmit } = useForm<LoginFormValues>({
  initialValues: {
    username: '',
    password: ''
  },
  validationSchema: {
    username: validateUsername,
    password: validatePassword
  }
})

const [username, usernameAttrs] = defineField('username')
const [password, passwordAttrs] = defineField('password')

const submit = handleSubmit((values) => {
  submitError.value = ''
  pendingCredentials.value = {
    username: values.username.trim(),
    password: values.password
  }
  isCaptchaVisible.value = true
})

const redirectTarget = computed(() => {
  const redirect = route.query.redirect

  return typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
    ? redirect
    : '/'
})

async function onCaptchaSuccess() {
  const credentials = pendingCredentials.value

  isCaptchaVisible.value = false

  if (!credentials || isLoggingIn.value) {
    return
  }

  isLoggingIn.value = true
  submitError.value = ''

  try {
    await userStore.login(credentials)
    message.success(`欢迎回来，${profile.value?.nickname || credentials.username}`)
    await router.replace(redirectTarget.value)
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : '登录失败，请稍后重试'
  } finally {
    isLoggingIn.value = false
    pendingCredentials.value = undefined
  }
}
</script>

<template>
  <AuthShell title="账号登录" description="登录后即可同步你的个人资料与会员状态">
    <form novalidate @submit="submit">
      <div class="grid gap-[4px]">
        <AuthField
          v-model="username"
          v-bind="usernameAttrs"
          name="username"
          label="用户名"
          autocomplete="username"
          placeholder="请输入 3–12 位用户名"
          :error="errors.username"
        />
        <AuthField
          v-model="password"
          v-bind="passwordAttrs"
          name="password"
          label="密码"
          type="password"
          autocomplete="current-password"
          placeholder="请输入 6–12 位密码"
          :error="errors.password"
        />
      </div>

      <p
        v-if="submitError"
        role="alert"
        class="mb-[12px] rounded-[9px] bg-red-50 px-[12px] py-[9px] text-xs text-red-600 dark:bg-red-950/40 dark:text-red-300"
      >
        {{ submitError }}
      </p>

      <div class="pt-[10px] pb-[30px] text-right leading-none">
        <RouterLink
          to="/register"
          class="inline-block cursor-pointer p-[10px] text-sm text-zinc-400 duration-300 hover:text-zinc-600 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:text-zinc-600 dark:hover:text-zinc-400"
        >
          去注册
        </RouterLink>
      </div>

      <MButton native-type="submit" class="w-full" :loading="isLoggingIn" :active-animation="false">
        登录
      </MButton>
    </form>

    <OAuthProviderButtons :return-to="redirectTarget" />

    <SliderCaptcha
      v-if="isCaptchaVisible"
      @close="isCaptchaVisible = false"
      @success="onCaptchaSuccess"
    />
  </AuthShell>
</template>
