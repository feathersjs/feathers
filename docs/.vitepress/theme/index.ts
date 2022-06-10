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

if (inBrowser)
  import('./pwa')

export default {
  ...Theme,
  Layout: FeathersLayout,
  enhanceApp({ app }) {
    // Globally register components so they don't have to be imported in the template.
    app.component('Tabs', Tabs)
    app.component('Tab', Tab)
  }
}

