export {}

declare module 'vue' {
  export interface GlobalComponents {
    MButton: (typeof import('@/libs/button/index.vue'))['default']
    MPopup: (typeof import('@/libs/popup/index.vue'))['default']
    MPopover: (typeof import('@/libs/popover/index.vue'))['default']
    MSearch: (typeof import('@/libs/search/index.vue'))['default']
    MSvgIcon: (typeof import('@/libs/svg-icon/index.vue'))['default']
  }
}
