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
    class="app-scrollbar h-full overflow-auto bg-zinc-200 transition-colors duration-300 motion-reduce:transition-none xl:pt-[10px] dark:bg-zinc-800"
  >
    <MNavbar v-if="isMobileTerminal" sticky @left-click="goBack">个人资料</MNavbar>

    <div
      class="relative mx-auto w-full bg-white px-[10px] pb-[40px] text-sm transition-colors xl:max-w-[1024px] xl:rounded-sm xl:border xl:border-zinc-200 xl:px-[40px] xl:py-[20px] dark:bg-zinc-900 xl:dark:border-zinc-600"
    >
      <h1
        v-if="!isMobileTerminal"
        class="mb-[40px] text-center text-lg font-bold text-zinc-900 dark:text-zinc-300"
      >
        个人资料
      </h1>
      <div v-if="!profile" class="grid min-h-[360px] place-items-center" aria-live="polite">
        <div class="flex items-center gap-[10px] text-sm text-zinc-500 dark:text-zinc-400">
          <span
            class="size-[18px] animate-spin rounded-full border-2 border-current border-r-transparent"
          />
          {{ isProfileLoading ? '正在加载个人资料…' : '暂无个人资料' }}
        </div>
      </div>

      <article v-else class="relative">
        <aside class="py-[10px] xl:absolute xl:top-0 xl:right-[16%] xl:py-0 xl:text-center">
          <ProfileAvatar
            :avatar="profile.avatar"
            :display-name="displayName"
            :loading="isAvatarSaving"
            @cropped="saveAvatar"
          />
        </aside>

        <section class="w-full xl:w-2/3" aria-label="个人资料表单">
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
