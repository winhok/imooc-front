<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import type { EditableUserProfile } from '@/api/profile'
import { confirm } from '@/libs/confirm'
import { message } from '@/libs/message'
import { useUserStore } from '@/stores'
import { isMobileTerminal } from '@/utils/flexible'

import ProfileAvatar from './components/ProfileAvatar.vue'
import ProfileForm from './components/ProfileForm.vue'
import { useAvatarUpload } from './useAvatarUpload'

defineOptions({ name: 'ProfileView' })

const router = useRouter()
const userStore = useUserStore()
const { profile, isProfileLoading } = storeToRefs(userStore)
const { uploadAvatar } = useAvatarUpload()
const isSaving = shallowRef(false)
const isAvatarSaving = shallowRef(false)
const displayName = computed(() => profile.value?.nickname || profile.value?.username || '当前用户')

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    void router.replace('/')
  }
}

async function saveProfile(editableProfile: EditableUserProfile) {
  if (!profile.value || isSaving.value) {
    return
  }

  isSaving.value = true

  try {
    await userStore.updateProfile({ ...profile.value, ...editableProfile })
    message.success('个人资料已更新')
  } catch (error) {
    message.error(error instanceof Error ? error.message : '个人资料更新失败')
  } finally {
    isSaving.value = false
  }
}

async function saveAvatar(blob: Blob) {
  if (!profile.value || isAvatarSaving.value) {
    return
  }

  isAvatarSaving.value = true

  try {
    const avatar = await uploadAvatar(blob, profile.value.username)
    await userStore.updateProfile({ ...profile.value, avatar })
    message.success('头像已更新')
  } catch (error) {
    message.error(error instanceof Error ? error.message : '头像上传失败')
  } finally {
    isAvatarSaving.value = false
  }
}

async function logout() {
  const shouldLogout = await confirm({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    confirmText: '退出'
  })

  if (!shouldLogout) {
    return
  }

  userStore.clearSession()
  message.success('已安全退出登录')
  await router.replace('/')
}

onMounted(async () => {
  if (profile.value) {
    return
  }

  try {
    await userStore.loadProfile()
  } catch (error) {
    message.error(error instanceof Error ? error.message : '用户资料加载失败')
  }
})
</script>

<template>
  <main
    class="h-dvh overflow-auto bg-zinc-100 transition-colors duration-300 motion-reduce:transition-none dark:bg-zinc-950"
  >
    <MNavbar v-if="isMobileTerminal" sticky @left-click="goBack">个人资料</MNavbar>

    <header
      v-else
      class="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90"
    >
      <div class="mx-auto flex h-[72px] max-w-[1120px] items-center px-[28px]">
        <button
          type="button"
          class="grid size-[40px] place-items-center rounded-[10px] text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:text-zinc-200 dark:hover:bg-zinc-800"
          aria-label="返回上一页"
          @click="goBack"
        >
          <MSvgIcon name="back" :size="20" />
        </button>
        <h1 class="ml-[14px] text-base font-semibold text-zinc-950 dark:text-zinc-50">个人资料</h1>
      </div>
    </header>

    <div class="mx-auto w-full max-w-[1040px] px-[14px] py-[18px] xl:px-[28px] xl:py-[32px]">
      <div
        v-if="!profile"
        class="grid min-h-[360px] place-items-center rounded-[20px] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        aria-live="polite"
      >
        <div class="flex items-center gap-[10px] text-sm text-zinc-500 dark:text-zinc-400">
          <span
            class="size-[18px] animate-spin rounded-full border-2 border-current border-r-transparent"
          />
          {{ isProfileLoading ? '正在加载个人资料…' : '暂无个人资料' }}
        </div>
      </div>

      <article
        v-else
        class="grid gap-[28px] rounded-[20px] border border-zinc-200 bg-white p-[20px] shadow-sm transition-colors xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-[44px] xl:p-[36px] dark:border-zinc-800 dark:bg-zinc-900"
      >
        <aside
          class="border-b border-zinc-100 pb-[26px] xl:border-r xl:border-b-0 xl:pr-[36px] xl:pb-0 dark:border-zinc-800"
        >
          <ProfileAvatar
            :avatar="profile.avatar"
            :display-name="displayName"
            :loading="isAvatarSaving"
            @cropped="saveAvatar"
          />
          <div class="mt-[24px] text-center">
            <p class="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {{ displayName }}
            </p>
            <p class="mt-[4px] truncate text-xs text-zinc-500 dark:text-zinc-400">
              @{{ profile.username }}
            </p>
          </div>
        </aside>

        <section aria-labelledby="profile-form-title">
          <div class="mb-[22px]">
            <h2
              id="profile-form-title"
              class="text-base font-semibold text-zinc-950 dark:text-zinc-50"
            >
              基本资料
            </h2>
            <p class="mt-[5px] text-xs text-zinc-500 dark:text-zinc-400">
              修改内容只会在保存成功后同步到当前账号
            </p>
          </div>
          <ProfileForm :profile="profile" :loading="isSaving" @save="saveProfile" />
          <MButton
            v-if="isMobileTerminal"
            class="mt-[14px] w-full"
            variant="neutral"
            @click="logout"
          >
            退出登录
          </MButton>
        </section>
      </article>
    </div>
  </main>
</template>
