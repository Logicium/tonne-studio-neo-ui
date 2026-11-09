import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { reveal } from './directives/reveal'
import { fitText } from './directives/fit'
import { installSeo } from './seo'
import { site as seoSite } from './seo.site'
import './assets/main.scss'

const app = createApp(App).use(router)
// the head follows the route table on every navigation; the build wrote the same tags per page
installSeo(router, seoSite)
app.directive('reveal', reveal).directive('fit', fitText).mount('#app')
