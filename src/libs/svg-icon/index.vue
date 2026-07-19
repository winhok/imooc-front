<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'

defineOptions({ name: 'MSvgIcon' })

interface Props {
  name: string
  size?: number | string
  color?: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: '1em',
  color: 'currentColor',
  label: undefined
})

const iconModules = import.meta.glob<string>('../../assets/icons/*.svg', {
  eager: true,
  import: 'default',
  query: '?url'
})

const iconUrls = Object.fromEntries(
  Object.entries(iconModules).map(([path, url]) => {
    const filename = path.split('/').at(-1) ?? ''
    return [filename.replace(/\.svg$/, ''), url]
  })
)

const iconUrl = computed(() => iconUrls[props.name])

const iconStyle = computed<CSSProperties>(() => {
  const size = typeof props.size === 'number' ? `${props.size}px` : props.size
  const maskImage = iconUrl.value ? `url("${iconUrl.value}")` : undefined

  return {
    width: size,
    height: size,
    backgroundColor: props.color,
    maskImage,
    WebkitMaskImage: maskImage
  }
})
</script>

<template>
  <span
    class="svg-icon"
    :style="iconStyle"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : true"
  />
</template>

<style scoped>
.svg-icon {
  display: inline-block;
  flex: none;
  background-repeat: no-repeat;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
  vertical-align: middle;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
}
</style>
