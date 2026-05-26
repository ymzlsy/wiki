import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import type { Theme } from 'vitepress'
import HarnessQA from './components/HarnessQA.vue'
import KaraithyWordmark from './components/KaraithyWordmark.vue'
import './custom.css'

const theme: Theme = {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'nav-bar-title-before': () => h(KaraithyWordmark, { compact: true }),
      'home-hero-info-before': () => h(KaraithyWordmark, { hero: true }),
      'layout-bottom': () => h(HarnessQA, { floating: true })
    })
  },
  enhanceApp({ app }) {
    app.component('HarnessQA', HarnessQA)
    app.component('KaraithyWordmark', KaraithyWordmark)
  }
}

export default theme
