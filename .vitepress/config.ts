import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Harness Engineering 完全教程',
  description: '为AI产品经理量身定制 · 从零到一 · 理论+实践+手搓框架',
  lang: 'zh-CN',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '开始学习', link: '/guide/module-0' },
      { text: '附录', link: '/guide/appendix' }
    ],
    sidebar: [
      {
        text: '教程模块',
        items: [
          { text: 'Module 0: 什么是Harness Engineering', link: '/guide/module-0' },
          { text: 'Module 1: Context Engineering', link: '/guide/module-1' },
          { text: 'Module 2: Architectural Constraints', link: '/guide/module-2' },
          { text: 'Module 3: Entropy Management', link: '/guide/module-3' },
          { text: 'Module 4: AI Factory 七层架构', link: '/guide/module-4' },
          { text: 'Module 5: 实战案例与VibeCoding', link: '/guide/module-5' },
          { text: 'Module 6: 手搓Agent Harness框架', link: '/guide/module-6' },
          { text: 'Module 7: AI产品经理落地指南', link: '/guide/module-7' },
        ]
      },
      {
        text: '附录',
        items: [
          { text: '参考项目·文章·工具·金句', link: '/guide/appendix' }
        ]
      }
    ],
    outline: {
      level: [2, 3],
      label: '本页目录'
    },
    search: {
      provider: 'local'
    },
    footer: {
      message: 'Harness Engineering 完全教程 v3',
      copyright: '用确定性包裹概率性 · Structure In, Structure Out'
    },
    docFooter: {
      prev: '上一模块',
      next: '下一模块'
    }
  }
})
