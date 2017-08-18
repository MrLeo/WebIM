/**
 * @Date: 2016/11/1  0001  23:46
 * @Author: lxbin
 *
 * Created with JetBrains WebStorm.
 */
import Vue from 'vue'

//引入组件
const ToastConstructor = Vue.extend(require('./alert.vue'))
let toastPool = []

/**
 * 获得Vue实例
 * @returns {*}
 */
let getAnInstance = () => {
    if (toastPool.length > 0) {
        let instance = toastPool[0]
        toastPool.splice(0, 1)
        return instance
    }
    return new ToastConstructor().$mount(document.createElement('div'))
}

let returnAnInstance = instance => {
    if (instance) {
        toastPool.push(instance)
    }
}

let removeDom = event => {
    console.log('[Leo] => 销毁提示窗')
    if (event.target.parentNode) {
        event.target.parentNode.removeChild(event.target)
    }
}

ToastConstructor.prototype.close = function () {
    this.visible = false
    this.$el.addEventListener('transitionend', removeDom)
    this.closed = true
    returnAnInstance(this)
}

let Alert = (options = {}) => {
    let instance = getAnInstance()
    instance.closed = false
    clearTimeout(instance.timer)

    instance.modal = typeof options === 'string' ? 'msg' : (!!options.modal ? options.modal : 'msg')
    instance.message = typeof options === 'string' ? options : options.message
    instance.click = options.click

    document.body.appendChild(instance.$el)
    Vue.nextTick(function () {
            instance.visible = true
            instance.$el.removeEventListener('transitionend', removeDom)
            instance.$watch('visible', function (val) {
                if (!val)
                    instance.$el.addEventListener('transitionend', removeDom)
            })

            //let duration = !!options.time ? (options.time > 0 ? options.time : 5000) : (options.time == 0 ? 0 : 5000)

            if (!!options.time && options.time > 0) {
                instance.timer = setTimeout(function () {
                    if (instance.closed) return
                    //定时自动关闭提示框时如果没有做任何操作的，则自动执行预设的回掉方法
                    if (options.click && typeof options.click == 'function' && instance.visible) options.click()
                    instance.close()
                }, options.time)
            }
        }
    )
    return instance
}

export default Alert