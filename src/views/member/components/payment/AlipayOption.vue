<script setup lang="ts">
defineOptions({ name: 'AlipayOption' })

withDefaults(
  defineProps<{
    compact?: boolean
    loading?: boolean
  }>(),
  {
    compact: false,
    loading: false
  }
)

defineEmits<{
  select: []
}>()
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center rounded-sm border border-zinc-200 bg-white text-left transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
    :class="compact ? 'gap-[12px] px-[20px] py-[20px]' : 'h-[60px] gap-[10px] px-[20px]'"
    :disabled="loading"
    :aria-busy="loading"
    @click="$emit('select')"
  >
    <img
      src="https://imooc-front.lgdsunday.club/assets/alipay.e4ca2d5f.png"
      alt=""
      class="size-[40px] shrink-0"
    />
    <span class="min-w-0 flex-1">
      <span class="block text-xl text-zinc-800 dark:text-zinc-200">
        {{ loading ? '正在前往支付宝' : '支付宝' }}
      </span>
    </span>
    <MSvgIcon v-if="compact" name="chevron-down" :size="16" class="-rotate-90 text-zinc-400" />
  </button>
</template>
