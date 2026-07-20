<script setup lang="ts">
import { useId } from 'vue'
import type { VNode } from 'vue'

defineOptions({ name: 'AuthShell' })

interface Props {
  title: string
  description: string
}

defineProps<Props>()

const titleId = useId()

defineSlots<{
  default(): VNode[]
}>()
</script>

<template>
  <main
    class="relative min-h-dvh overflow-hidden bg-white text-center xl:bg-zinc-200 dark:bg-zinc-800"
  >
    <div class="hidden h-[80px] pt-[10px] xl:block">
      <img src="https://res.lgdsunday.club/weixin.png" alt="" class="mx-auto h-full" />
    </div>

    <div class="relative h-[111px] xl:hidden">
      <img
        src="https://res.lgdsunday.club/login-bg.png"
        alt=""
        class="size-full object-fill dark:hidden"
      />
      <RouterLink to="/" aria-label="返回首页">
        <img
          src="https://res.lgdsunday.club/my-avatar.jpg"
          alt=""
          class="absolute top-[5%] left-1/2 h-[50px] -translate-x-1/2"
        />
      </RouterLink>
    </div>

    <section
      class="mt-[40px] block px-[30px] xl:mx-auto xl:mt-[80px] xl:w-[388px] xl:rounded-sm xl:bg-white xl:py-[40px] xl:shadow-lg dark:bg-zinc-800 xl:dark:bg-zinc-900"
      :aria-labelledby="titleId"
    >
      <div>
        <header class="mb-[20px] text-center">
          <h1
            :id="titleId"
            class="hidden text-base font-semibold text-red-500 xl:block dark:text-zinc-300"
          >
            {{ title }}
          </h1>
          <p class="sr-only">
            {{ description }}
          </p>
        </header>

        <slot />
      </div>
    </section>
  </main>
</template>
