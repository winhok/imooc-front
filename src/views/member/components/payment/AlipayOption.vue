<script setup lang="ts">
defineOptions({ name: 'AlipayOption' })

withDefaults(
  defineProps<{
    compact?: boolean
  }>(),
  {
    compact: false
  }
)

defineEmits<{
  select: []
}>()
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center rounded-[14px] border border-zinc-200 bg-white text-left transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-600 dark:hover:bg-blue-500/10"
    :class="
      compact ? 'gap-[12px] px-[14px] py-[14px]' : 'max-w-[280px] gap-[14px] px-[18px] py-[16px]'
    "
    @click="$emit('select')"
  >
    <span
      class="grid size-[38px] shrink-0 place-items-center rounded-[10px] bg-blue-500 text-base font-bold text-white"
      aria-hidden="true"
    >
      支
    </span>
    <span class="min-w-0 flex-1">
      <span class="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">支付宝</span>
      <span class="mt-[2px] block text-xs text-zinc-500 dark:text-zinc-400"
        >安全便捷，即时到账</span
      >
    </span>
    <MSvgIcon v-if="compact" name="chevron-down" :size="16" class="-rotate-90 text-zinc-400" />
  </button>
</template>
