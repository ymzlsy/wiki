import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import HarnessQA from './components/HarnessQA.vue'
import './custom.css'

const theme: Theme = {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HarnessQA', HarnessQA)
  }
}

export default theme
