<script setup lang="ts">
import { reactive, shallowRef } from 'vue'

import type { UserProfile } from '@/api/auth'
import type { EditableUserProfile } from '@/api/profile'

defineOptions({ name: 'ProfileForm' })

const props = defineProps<{
  profile: UserProfile
  loading?: boolean
}>()

const emit = defineEmits<{
  save: [profile: EditableUserProfile]
}>()

const draft = reactive<EditableUserProfile>({
  nickname: props.profile.nickname,
  title: props.profile.title ?? '',
  company: props.profile.company ?? '',
  homePage: props.profile.homePage ?? '',
  introduction: props.profile.introduction ?? ''
})
const nicknameError = shallowRef('')

function submit() {
  if (!draft.nickname.trim()) {
    nicknameError.value = '昵称不能为空'
    return
  }

  nicknameError.value = ''
  emit('save', {
    nickname: draft.nickname.trim(),
    title: draft.title?.trim(),
    company: draft.company?.trim(),
    homePage: draft.homePage?.trim(),
    introduction: draft.introduction?.trim()
  })
}
</script>

<template>
  <form class="space-y-[20px]" @submit.prevent="submit">
    <div class="xl:flex xl:items-center">
      <label
        for="profile-nickname"
        class="mb-[10px] block w-[80px] text-sm font-bold text-zinc-800 xl:mb-0 dark:text-zinc-300"
      >
        用户名
      </label>
      <MInput
        id="profile-nickname"
        v-model="draft.nickname"
        :max="20"
        required
        :aria-invalid="Boolean(nicknameError)"
        :aria-describedby="nicknameError ? 'profile-nickname-error' : undefined"
        autocomplete="nickname"
        placeholder="请输入昵称"
        :disabled="loading"
      />
      <p
        v-if="nicknameError"
        id="profile-nickname-error"
        class="mt-[6px] text-xs text-red-500"
        role="alert"
      >
        {{ nicknameError }}
      </p>
    </div>

    <div class="space-y-[20px]">
      <div class="xl:flex xl:items-center">
        <label
          for="profile-title"
          class="mb-[10px] block w-[80px] text-sm font-bold text-zinc-800 xl:mb-0 dark:text-zinc-300"
        >
          职位
        </label>
        <MInput
          id="profile-title"
          v-model="draft.title"
          :max="40"
          autocomplete="organization-title"
          placeholder="例如：前端工程师"
          :disabled="loading"
        />
      </div>
      <div class="xl:flex xl:items-center">
        <label
          for="profile-company"
          class="mb-[10px] block w-[80px] text-sm font-bold text-zinc-800 xl:mb-0 dark:text-zinc-300"
        >
          公司
        </label>
        <MInput
          id="profile-company"
          v-model="draft.company"
          :max="40"
          autocomplete="organization"
          placeholder="请输入公司名称"
          :disabled="loading"
        />
      </div>
    </div>

    <div class="xl:flex xl:items-center">
      <label
        for="profile-home-page"
        class="mb-[10px] block w-[80px] text-sm font-bold text-zinc-800 xl:mb-0 dark:text-zinc-300"
      >
        个人主页
      </label>
      <MInput
        id="profile-home-page"
        v-model="draft.homePage"
        type="url"
        :max="200"
        autocomplete="url"
        placeholder="https://example.com"
        :disabled="loading"
      />
    </div>

    <div class="xl:flex">
      <label
        for="profile-introduction"
        class="mb-[10px] block w-[80px] shrink-0 text-sm font-bold text-zinc-800 xl:mb-0 dark:text-zinc-300"
      >
        个人介绍
      </label>
      <MInput
        id="profile-introduction"
        v-model="draft.introduction"
        type="textarea"
        :max="100"
        :rows="5"
        placeholder="介绍一下自己"
        :disabled="loading"
      />
    </div>

    <div class="flex justify-center">
      <MButton class="w-full xl:w-[160px]" native-type="submit" :loading="loading">
        保存修改
      </MButton>
    </div>
  </form>
</template>
