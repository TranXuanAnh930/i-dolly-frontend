import { createApp } from 'vue'

import AppLayout from './layout/index.vue'
import router from './router'
import pinia from './store/pinia'
import i18n from './i18n'

import { registerMixins } from './mixins'
import { registerPlugins } from './plugins'

import './scss/style.scss'

const app = createApp(AppLayout)

app.use(pinia)
app.use(router)
app.use(i18n)

registerMixins(app)
registerPlugins(app)

app.mount('#app')
