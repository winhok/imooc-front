import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

import { PC_DEVICE_WIDTH } from '@/constants'

const { width } = useWindowSize()

/** Whether the current viewport should use the mobile layout. */
export const isMobileTerminal = computed(() => width.value < PC_DEVICE_WIDTH)
