/**
 * @Date: 2016/10/31  0031  12:27
 * @Author: lxbin
 *
 * Created with JetBrains WebStorm.
 */
import Vue from 'vue'
//引入组件
const ToastConstructor = Vue.extend(require('./toast.vue'))
let toastPool = []//组件池

/**
 * 获得组件实例
 * @returns {*} 组件实例
 */
let getAnInstance = () => {
    //优先从组件池中获取实例
    if (toastPool.length > 0) {
        let instance = toastPool[0]
        toastPool.splice(0, 1)
        return instance
    }
    //如果组件池中没有组件，则初始实例化挂载一个
    //return new ToastConstructor({
    //    el: document.createElement('div')
    //})
    return new ToastConstructor().$mount(document.createElement('div'))
}

//关闭组件的时候将组件缓存到组件池，减少下次渲染的负担
let returnAnInstance = instance => {
    if (instance) {
        toastPool.push(instance)
    }
}

/**
 * 销毁已渲染到页面中的组件
 * @param event
 */
let removeDom = event => {
    if (event.target.parentNode) {
        event.target.parentNode.removeChild(event.target)
    }
}

/**
 * 关闭/隐藏组件
 */
ToastConstructor.prototype.close = function () {
    this.visible = false
    //this.$el.addEventListener('transitionend', removeDom)
    this.closed = true
    returnAnInstance(this)
}

/**
 * 调用组件
 * @param {JSON} options 参数：{message:"消息内容",position:'bottom'}
 * @returns {*} 组件实例
 * @constructor
 */
let Toast = (options = {}) => {
    //定义自动隐藏时间
    let duration = options.time || 3000

    let instance = getAnInstance()//获取组件实例
    instance.closed = false//组件是否关闭
    clearTimeout(instance.timer)//清除组件自动关闭定时器

    //组件接收的参数
    instance.message = typeof options === 'string' ? options : options.message||''
    instance.position = options.position || 'middle'
    instance.className = options.className || ''
    instance.icon = options.icon || ''

    //将渲染的组件添加到
    document.body.appendChild(instance.$el)
    Vue.nextTick(function () {
        instance.visible = true//组件中visible默认false不显示，渲染之后显示出来
        //观察visible数据变化
        instance.$watch('visible', function (val) {
            //如果visible变成false则不显示，监听过渡动画结束执行回调
            if (!val) instance.$el.addEventListener('transitionend', removeDom)
        })
        //清除已有的过渡动画事件监听
        instance.$el.removeEventListener('transitionend', removeDom)
        //设置自动关闭定时器
        if (duration >= 0) {
            instance.timer = setTimeout(function () {
                if (instance.closed) return
                instance.close()
            }, duration)
        }
    })
    return instance
}

export default Toast