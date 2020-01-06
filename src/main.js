import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false
App.mpType = 'app'

// 导入axios/index.js
// 这里的目的，仅仅是为了将来webpack打包的时候，能够打包axios/index.js
import '@/axios'

const app = new Vue(App)
app.$mount()
