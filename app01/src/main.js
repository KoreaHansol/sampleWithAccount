import Vue from 'vue'
import App from './App.vue'
import router from "./router/index";
import { Datetime } from 'vue-datetime'
import store from './store/index.js'

Vue.config.productionTip = false
Vue.use(Datetime)

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')