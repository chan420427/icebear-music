import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import fastclick from 'fastclick'
// eslint-disable-next-line
import 'common/stylus/index.styl'

fastclick.attach(document.body)
// eslint-disable-next-line

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
