import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid({
  title: 'Karaithy Wiki',
  description: '个人知识库 · 教程 · 学习手册',
  lang: 'zh-CN',
  mermaid: {},
  mermaidPlugin: {
    class: 'mermaid my-class'
  },
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      {
        text: '教程',
        items: [
          { text: 'Harness Engineering', link: '/harness/module-0' },
          { text: '飞书 CLI 完全指南', link: '/lark-cli/' },
        ]
      },
    ],
    sidebar: {
      '/harness/': [
        {
          text: 'Harness Engineering 完全教程',
          items: [
            { text: 'Module 0: 什么是Harness Engineering', link: '/harness/module-0' },
            { text: 'Module 1: Context Engineering', link: '/harness/module-1' },
            { text: 'Module 2: Architectural Constraints', link: '/harness/module-2' },
            { text: 'Module 3: Entropy Management', link: '/harness/module-3' },
            { text: 'Module 4: AI Factory 七层架构', link: '/harness/module-4' },
            { text: 'Module 5: 实战案例与VibeCoding', link: '/harness/module-5' },
            { text: 'Module 6: 手搓Agent Harness框架', link: '/harness/module-6' },
            { text: 'Module 7: AI产品经理落地指南', link: '/harness/module-7' },
            { text: 'Module 8: 给已有项目布Harness实操', link: '/harness/module-8' },
          ]
        },
        {
          text: '附录',
          items: [
            { text: '参考项目·文章·工具·金句', link: '/harness/appendix' }
          ]
        }
      ],
      '/lark-cli/': [
        {
          text: '飞书 CLI（lark-cli）完全指南',
          items: [
            { text: '完整教程（单页）', link: '/lark-cli/' },
          ]
        }
      ],
    },
    outline: {
      level: [2, 3],
      label: '本页目录'
    },
    search: {
      provider: 'local'
    },
    footer: {
      message: 'Karaithy Wiki · 个人知识库',
      copyright: '© karaithy.com'
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    }
  }
})
