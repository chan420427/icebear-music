import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import fastclick from 'fastclick'
import VueLazyLoad from  'vue-lazyload'

// eslint-disable-next-line
import 'common/stylus/index.styl'

fastclick.attach(document.body)

Vue.use(VueLazyLoad,{
    loading: require('common/image/default.png')
})
// eslint-disable-next-line

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
    store,
  render: h => h(App)
})
