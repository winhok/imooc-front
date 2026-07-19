<script setup lang="ts">
defineOptions({ name: 'HeaderMy' })

const menuItems = [
  { id: 'profile', title: '个人资料', icon: 'profile' },
  { id: 'member', title: '升级 VIP', icon: 'crown' },
  { id: 'logout', title: '退出登录', icon: 'logout' }
] as const
</script>

<template>
  <MPopover placement="bottom-right">
    <template #reference="{ isOpen }">
      <button
        type="button"
        class="flex items-center gap-[6px] rounded-[10px] p-[4px] pr-[8px] text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
        aria-label="查看用户菜单"
        :aria-expanded="isOpen"
      >
        <span
          class="relative grid size-[32px] place-items-center rounded-[8px] bg-zinc-900 text-xs font-bold text-white"
          aria-hidden="true"
        >
          M
          <MSvgIcon
            name="crown"
            :size="13"
            color="#fbbf24"
            class="absolute -right-[4px] -bottom-[3px]"
          />
        </span>
        <MSvgIcon name="chevron-down" :size="14" />
      </button>
    </template>

    <section class="w-[168px]" aria-label="用户菜单">
      <div class="border-b border-zinc-100 px-[10px] pt-[4px] pb-[10px]">
        <p class="text-sm font-semibold text-zinc-900">慕课用户</p>
        <p class="mt-[2px] text-xs text-zinc-400">演示账号</p>
      </div>
      <ul class="pt-[6px]">
        <li
          v-for="item in menuItems"
          :key="item.id"
          class="flex items-center gap-[10px] rounded-[8px] px-[10px] py-[9px] text-sm text-zinc-700"
        >
          <MSvgIcon :name="item.icon" :size="17" />
          <span>{{ item.title }}</span>
        </li>
      </ul>
    </section>
  </MPopover>
</template>
