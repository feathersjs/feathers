import googleAnalytics from 'vitepress-plugin-google-analytics'
import 'element-plus/theme-chalk/dark/css-vars.css'

import '../vite-env.d'
import Theme from 'vitepress/theme'
import { inBrowser } from 'vitepress'
import '../style/main.postcss'
import '../style/vars.postcss'
import 'uno.css'
import FeathersLayout from './FeathersLayout.vue'
import Tab from '../components/Tab.vue'
import Tabs from '../components/Tabs.vue'
import Select from '../components/Select.vue'
import Badges from '../components/Badges.vue'
import Logo from '../components/Logo.vue'
import BlockQuote from '../components/BlockQuote.vue'
import LanguageBlock from '../components/LanguageBlock.vue'
import DatabaseBlock from '../components/DatabaseBlock.vue'

import '../style/element-plus.scss'
// import 'element-plus/dist/index.css'

if (inBrowser) import('./pwa')

export default {
  ...Theme,
  Layout: FeathersLayout,
  enhanceApp({ app }) {
    googleAnalytics({
      id: 'G-XQ8CKCD9L6'
    }),
      // Globally register components so they don't have to be imported in the template.
      app.component('Tabs', Tabs)
    app.component('Tab', Tab)
    app.component('Select', Select)
    app.component('Badges', Badges)
    app.component('Logo', Logo)
    app.component('BlockQuote', BlockQuote)
    app.component('LanguageBlock', LanguageBlock)
    app.component('DatabaseBlock', DatabaseBlock)
  }
}
