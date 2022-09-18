import { h } from 'vue'
import Theme from 'vitepress/theme'
import { inBrowser } from 'vitepress'
import '../style/main.postcss'
import '../style/vars.postcss'

import 'uno.css'
import HomePage from '../components/HomePage.vue'
import FeathersLayout from './FeathersLayout.vue'
import Tab from '../components/Tab.vue'
import Tabs from '../components/Tabs.vue'
import LanguageSelect from '../components/LanguageSelect.vue'
import Badges from '../components/Badges.vue'
import Logo from '../components/Logo.vue'
import BlockQuote from '../components/BlockQuote.vue'
import LanguageBlock from '../components/LanguageBlock.vue'

import '../style/element-plus.scss'
import 'element-plus/theme-chalk/dark/css-vars.css'
// import 'element-plus/dist/index.css'

if (inBrowser) import('./pwa')

export default {
  ...Theme,
  Layout: FeathersLayout,
  enhanceApp({ app }) {
    // Globally register components so they don't have to be imported in the template.
    app.component('Tabs', Tabs)
    app.component('Tab', Tab)
    app.component('LanguageSelect', LanguageSelect)
    app.component('Badges', Badges)
    app.component('Logo', Logo)
    app.component('BlockQuote', BlockQuote)
    app.component('LanguageBlock', LanguageBlock)
  }
}
