import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    base: '/',//应用的基路径
    mode: 'hash', //"hash" (URL hash 模式) | "history"(HTML5 History 模式) | "abstract" (Node.js 环境)
    scrollBehavior(to, from, savedPosition) {//路由切换的滚动行为，只在 HTML5 history 模式下可用
        if (savedPosition) {
            return savedPosition
        } else {
            return {x: 0, y: 0}
        }
    },
    beforeEach(to, from, next) {
        // //是否有用户信息，并且用户ID是否存在
        // if (window.localStorage.getItem("loginInfo") && JSON.stringify(window.localStorage.getItem("loginInfo")).userId) {
        //     next({path: '/login'})//重定向到登录页面
        // } else {
        //     next()//正常跳转
        // }
    },
    routes: [
        {
            path: '/login',
            name: 'IM.Login',
            component: resolve => require(['../views/Login'], resolve)
        },
        {
            path: '/',
            name: 'IM.List',
            component: resolve => require(['../views/List'], resolve),
            children: [{
                path: '/chat',
                name: 'IM.List.Chat',
                component: resolve => require(['../views/chat'], resolve)
            }]
        }
    ]
})
