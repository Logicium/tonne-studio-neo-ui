import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { reveal } from './directives/reveal'
import { fitText } from './directives/fit'
import './assets/main.scss'

createApp(App).use(router).directive('reveal', reveal).directive('fit', fitText).mount('#app')
