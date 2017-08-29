//https://github.com/vuejs/vuex/tree/dev/examples/shopping-cart/store

import Vue from "vue";
import Vuex from "vuex";
import getters from './getters'
import actions from './actions'
import mutations from './mutations'

import base from './modules/base'

const debug = process.env.NODE_ENV !== 'production' //发布品种时需要用 Webpack 的 DefinePlugin 来转换 process.env.NODE_ENV !== 'production' 的值为 false

Vue.use(Vuex)

export default new Vuex.Store({
    getters,
    actions,
    mutations,
    modules: {
        base,
    },
    strict: debug,//开发阶段使用
})

