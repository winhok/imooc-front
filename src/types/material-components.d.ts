export {}

declare module 'vue' {
  export interface GlobalComponents {
    MButton: (typeof import('@/libs/button/index.vue'))['default']
    MDialog: (typeof import('@/libs/dialog/index.vue'))['default']
    MInfiniteScroll: (typeof import('@/libs/infinite-scroll/index.vue'))['default']
    MInput: (typeof import('@/libs/input/index.vue'))['default']
    MLazyImage: (typeof import('@/libs/lazy-image/index.vue'))['default']
    MNavbar: (typeof import('@/libs/navbar/index.vue'))['default']
    MPopup: (typeof import('@/libs/popup/index.vue'))['default']
    MPopover: (typeof import('@/libs/popover/index.vue'))['default']
    MSearch: (typeof import('@/libs/search/index.vue'))['default']
    MSvgIcon: (typeof import('@/libs/svg-icon/index.vue'))['default']
    MTransitionRouterView: (typeof import('@/libs/transition-router-view/index.vue'))['default']
    MTriggerMenu: (typeof import('@/libs/trigger-menu/index.vue'))['default']
    MTriggerMenuItem: (typeof import('@/libs/trigger-menu-item/index.vue'))['default']
    MWaterfall: (typeof import('@/libs/waterfall/index.vue'))['default']
  }
}
