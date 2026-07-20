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
    class="flex min-h-[34px] items-center justify-center gap-[7px] border-t border-orange-300 bg-orange-100 px-[12px] py-[5px] text-center text-xs font-bold text-red-600 xl:rounded-sm xl:border dark:text-red-500"
    role="status"
  >
    <MSvgIcon name="countdown" :size="15" />
    <span>
      限时特惠 | 距离优惠结束仅剩
      <span class="font-mono tabular-nums">
        <MCountDown :time="time" @finish="$emit('finish')" />
      </span>
    </span>
  </div>
</template>
