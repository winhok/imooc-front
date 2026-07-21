<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import type { GenericValidateFunction } from 'vee-validate'

import type { LoginCredentials, OAuthIdentity } from '@/api/auth'
import { useCommands } from '@/libs/command'
import { useUserStore } from '@/stores'

import AuthField from '../components/AuthField.vue'
import AuthShell from '../components/AuthShell.vue'
import OAuthIdentityCard from '../oauth/OAuthIdentityCard.vue'
import SliderCaptcha from '../components/SliderCaptcha.vue'
import { validateConfirmPassword, validatePassword, validateUsername } from '../validation'

defineOptions({ name: 'RegisterView' })

interface RegisterFormValues {
  username: string
  password: string
  confirmPassword: string
}

const route = useRoute()
const router = useRouter()
const { message } = useCommands()
const userStore = useUserStore()
const { pendingOAuthRegistration } = storeToRefs(userStore)
const isCaptchaVisible = shallowRef(false)
const isRegistering = shallowRef(false)
const pendingCredentials = shallowRef<LoginCredentials>()
const submitError = shallowRef('')
const validateConfirmation: GenericValidateFunction = (value, context) =>
  validateConfirmPassword(value, context.form.password)

const oauthProvider = computed<OAuthIdentity['provider'] | undefined>(() => {
  const provider = route.query.oauth

  return provider === 'QQ' || provider === 'WX' ? provider : undefined
})

const oauthRegistration = computed(() => {
  const pending = pendingOAuthRegistration.value

  return pending && pending.provider === oauthProvider.value ? pending : null
})

const pageDescription = computed(() =>
  oauthRegistration.value ? '创建本地账号以完成第三方登录' : '创建账号后将自动登录'
)

const redirectTarget = computed(() => {
  const redirect = route.query.redirect

  return typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
    ? redirect
    : '/'
})

const { defineField, errors, handleSubmit } = useForm<RegisterFormValues>({
  initialValues: {
    username: '',
    password: '',
    confirmPassword: ''
  },
  validationSchema: {
    username: validateUsername,
    password: validatePassword,
    confirmPassword: validateConfirmation
  }
})

const [username, usernameAttrs] = defineField('username')
const [password, passwordAttrs] = defineField('password')
const [confirmPassword, confirmPasswordAttrs] = defineField('confirmPassword')

const submit = handleSubmit((values) => {
  submitError.value = ''
  pendingCredentials.value = {
    username: values.username.trim(),
    password: values.password
  }
  isCaptchaVisible.value = true
})

async function onCaptchaSuccess() {
  const credentials = pendingCredentials.value

  isCaptchaVisible.value = false

  if (!credentials || isRegistering.value) {
    return
  }

  isRegistering.value = true
  submitError.value = ''

  try {
    if (oauthRegistration.value) {
      await userStore.registerWithOAuth(oauthRegistration.value, credentials)
    } else {
      await userStore.register(credentials)
    }
    message.success(`账号 ${credentials.username} 注册成功`)
    await router.replace(redirectTarget.value)
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : '注册失败，请稍后重试'
  } finally {
    isRegistering.value = false
    pendingCredentials.value = undefined
  }
}
</script>

<template>
  <AuthShell title="注册账号" :description="pageDescription">
    <OAuthIdentityCard v-if="oauthRegistration" :identity="oauthRegistration" />

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
          autocomplete="new-password"
          placeholder="请输入 6–12 位密码"
          :error="errors.password"
        />
        <AuthField
          v-model="confirmPassword"
          v-bind="confirmPasswordAttrs"
          name="confirmPassword"
          label="确认密码"
          type="password"
          autocomplete="new-password"
          placeholder="请再次输入密码"
          :error="errors.confirmPassword"
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
        <div class="mb-[20px]">
          <RouterLink
            to="/login"
            class="inline-block cursor-pointer p-[10px] text-sm text-zinc-400 duration-300 hover:text-zinc-600 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:text-zinc-600 dark:hover:text-zinc-400"
          >
            去登录
          </RouterLink>
        </div>
        <p class="text-center text-sm leading-normal text-zinc-400 dark:text-zinc-600">
          <a
            href="https://m.imooc.com/newfaq?id=89"
            target="_blank"
            rel="noreferrer"
            class="duration-300 hover:text-zinc-600 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:hover:text-zinc-400"
          >
            注册即同意《慕课网注册协议》
          </a>
        </p>
      </div>

      <MButton
        native-type="submit"
        class="w-full"
        :loading="isRegistering"
        :active-animation="false"
      >
        立即注册
      </MButton>
    </form>

    <SliderCaptcha
      v-if="isCaptchaVisible"
      @close="isCaptchaVisible = false"
      @success="onCaptchaSuccess"
    />
  </AuthShell>
</template>
