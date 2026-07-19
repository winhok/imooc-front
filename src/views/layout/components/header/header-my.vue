<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import { confirm } from '@/libs/confirm'
import { message } from '@/libs/message'
import { useUserStore } from '@/stores'

defineOptions({ name: 'HeaderMy' })

const menuItems = [
  { id: 'profile', title: '个人资料', icon: 'profile' },
  { id: 'member', title: '升级 VIP', icon: 'crown' },
  { id: 'logout', title: '退出登录', icon: 'logout' }
] as const

type MenuItem = (typeof menuItems)[number]

const router = useRouter()
const userStore = useUserStore()
const { isAuthenticated, profile } = storeToRefs(userStore)
const isMenuOpen = shallowRef(false)

const displayName = computed(
  () => profile.value?.nickname || profile.value?.username || '已登录用户'
)
const userInitial = computed(() => displayName.value.trim().charAt(0).toUpperCase() || 'M')

function goToLogin() {
  void router.push({ name: 'login' })
}

async function onMenuClick(item: MenuItem) {
  isMenuOpen.value = false

  if (item.id !== 'logout') {
    message.info(item.id === 'profile' ? '个人资料将在下一章实现' : '会员升级功能暂未开放')
    return
  }

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
</script>

<template>
  <MPopover v-if="isAuthenticated" v-model="isMenuOpen" placement="bottom-right">
    <template #reference="{ isOpen }">
      <button
        type="button"
        class="flex items-center gap-[6px] rounded-[10px] p-[4px] pr-[8px] text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:text-zinc-300 dark:hover:bg-zinc-800"
        aria-label="查看用户菜单"
        :aria-expanded="isOpen"
      >
        <span
          class="relative grid size-[32px] place-items-center overflow-visible rounded-[8px] bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-100 dark:text-zinc-950"
        >
          <img
            v-if="profile?.avatar"
            :src="profile.avatar"
            :alt="`${displayName}的头像`"
            class="size-full rounded-[8px] object-cover"
          />
          <span v-else aria-hidden="true">{{ userInitial }}</span>
          <MSvgIcon
            v-if="profile?.vipLevel"
            name="crown"
            :size="13"
            color="#fbbf24"
            class="absolute -right-[4px] -bottom-[3px]"
          />
        </span>
        <MSvgIcon name="chevron-down" :size="14" />
      </button>
    </template>

    <section class="w-[180px]" aria-label="用户菜单">
      <div class="border-b border-zinc-100 px-[10px] pt-[4px] pb-[10px] dark:border-zinc-800">
        <p class="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {{ displayName }}
        </p>
        <p class="mt-[2px] text-xs text-zinc-400 dark:text-zinc-500">
          {{ profile?.vipLevel ? `VIP ${profile.vipLevel}` : '普通用户' }}
        </p>
      </div>
      <ul class="pt-[6px]">
        <li v-for="item in menuItems" :key="item.id">
          <button
            type="button"
            class="flex w-full items-center gap-[10px] rounded-[8px] px-[10px] py-[9px] text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none dark:text-zinc-300 dark:hover:bg-zinc-800"
            @click="onMenuClick(item)"
          >
            <MSvgIcon :name="item.icon" :size="17" />
            <span>{{ item.title }}</span>
          </button>
        </li>
      </ul>
    </section>
  </MPopover>

  <MButton
    v-else
    class="guide-my"
    icon="profile"
    icon-color="#fff"
    aria-label="登录账号"
    @click="goToLogin"
  />
</template>
