import type { DriveStep } from 'driver.js'

export const guideSteps: DriveStep[] = [
  {
    element: '[data-tour="home"]',
    popover: {
      title: '首页入口',
      description: '随时点击品牌标识返回首页。',
      side: 'bottom',
      align: 'start'
    }
  },
  {
    element: '[data-tour="search"]',
    popover: {
      title: '搜索作品',
      description: '输入关键词，快速筛选你感兴趣的图片。',
      side: 'bottom',
      align: 'center'
    }
  },
  {
    element: '[data-tour="theme"]',
    popover: {
      title: '主题模式',
      description: '在浅色、深色和跟随系统之间切换。',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="account"]',
    popover: {
      title: '账户菜单',
      description: '这里展示个人资料、会员与退出入口。',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="guide"]',
    popover: {
      title: '功能引导',
      description: '需要回顾时，可以从这里再次启动引导。',
      side: 'left',
      align: 'center'
    }
  },
  {
    element: '[data-tour="feedback"]',
    popover: {
      title: '意见反馈',
      description: '遇到问题或有改进建议时，可以从这里反馈。',
      side: 'left',
      align: 'end'
    }
  }
]
