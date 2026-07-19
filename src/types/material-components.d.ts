export {}

declare module 'vue' {
  export interface GlobalComponents {
    MPopup: (typeof import('@/libs/popup/index.vue'))['default']
    MSvgIcon: (typeof import('@/libs/svg-icon/index.vue'))['default']
  }
}
