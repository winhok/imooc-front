<script setup lang="ts">
import { onMounted } from 'vue'

import { getCategory } from '@/api/category'
import { isMobileTerminal } from '@/utils/flexible'

import MobileNavigation from './mobile/index.vue'

defineOptions({ name: 'NavigationBar' })

async function loadCategory() {
  const response = await getCategory()
  console.log(response.data)
}

onMounted(() => {
  void loadCategory()
})
</script>

<template>
  <MobileNavigation v-if="isMobileTerminal" />
</template>
