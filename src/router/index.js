import Vue from 'vue'
import Router from 'vue-router'
import List from '@/views/List'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'List',
      component: List,
      children: [{
        path: '/chat',
        name: 'List.Chat',
        component: resolve => require(['../views/chat'], resolve)
      }]
    }
  ]
})
