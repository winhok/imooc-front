<script setup lang="ts">
defineOptions({ name: 'DiscountBanner' })

defineProps<{
  time: number
}>()

defineEmits<{
  finish: []
}>()
</script>

<template>
  <div
    class="flex min-h-[34px] items-center justify-center gap-[7px] rounded-[10px] border border-orange-200 bg-orange-50 px-[12px] py-[7px] text-center text-xs font-semibold text-red-600 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300"
    role="status"
  >
    <MSvgIcon name="countdown" :size="15" />
    <span>
      限时特惠 · 距优惠结束
      <MCountDown :time="time" class="font-mono tabular-nums" @finish="$emit('finish')" />
    </span>
  </div>
</template>
