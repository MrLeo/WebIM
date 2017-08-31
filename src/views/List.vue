<template lang="pug">
    .page-group
        .page
            mt-header(fixed,:title="title")
            main
                mt-loadmore(:top-method="loadTop", :bottom-method="loadBottom", :bottom-all-loaded="allLoaded", ref="loadmore")
                    ul.list
                        li.list__item(v-for="(value,key,index) in doctors", @click="toNextPage(value)")
                            mt-cell-swipe(:title="value.user_name", :right="[{content: '&nbsp;', style: {background: '#FFF'}}, {content: '已读', style: {background: 'lightgray', color: '#fff'}, handler: () => {return setReadStatus(value)}}]")
                                span.noread(v-if="!!value.noread") {{value.noread}}
                                img(slot="icon", :src="value.avatar || require('../assets/img/header.jpg')", width="24", height="24")
        transition(name="slide")
            router-view(class="child-view")
</template>

<script>
    import {Header, Button, Loadmore, CellSwipe, MessageBox, Popup} from 'mint-ui'
    import WebIM from 'WebIM'
    import axios from 'axios'
    import uri from '../utils/url'

    export default {
        name: 'List',
        components: {
            [Header.name]: Header,
            [Loadmore.name]: Loadmore,
            [CellSwipe.name]: CellSwipe,
            [MessageBox.name]: MessageBox,
            [Button.name]: Button,
            [Popup.name]: Popup,
        },
        data: () => ({
            token: '',
            title: '',
            allLoaded: false,//底部数据全部获取完毕
            popupVisible: false,
            friendName: '',
            doctors: {}
        }),
        mounted() {
            this.$$vm.code = uri.getQueryString('code') || this.$$vm.code
            if (process.env.NODE_ENV != 'development') {
                if (!this.$$vm.code) {
                    console.log('[Leo] => 无授权code')
                    window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?response_type=code&scope=snsapi_userinfo&state=1&appid=' + this.$$vm.appid + '&redirect_uri=' + window.location.href + '#wechat_redirect'
                    return
                }
            }
            this.$$vm.currDoc = {}
            this.init()
        },
        watch: {},
        computed: {},
        methods: {
            init() {
                try {
                    let _t = this

                    //获取登录用户授权信息
                    this.getUserId().then(userId => {
                        this.getDocList(userId)
                        return this.getUserInfo(userId)
                    }).then(userInfo => {
                        console.log('[Leo] => 正在登陆环信')
                        _t.hxLogin()
                    }).catch(e => {
                        alert('出错了 => ' + e.message)
                    })

                    //收到消息
                    this.$$vm.$on('receiveMsg', ({msg, type}) => {
                        console.log('[Leo]收到消息 => ', {msg, type})
                        this.receiveMessage(msg, type)
                    })

                    //清空未读标记
                    this.$$vm.$on('readed', (hxUser) => {
                        this.doctors[hxUser]['noread'] = 0
                    })
                } catch (e) {
                    alert('获取授权失败')
                }
            },
            /**
             * 根据微信CODE获取用户ID
             * @returns {Promise.<void>}
             */
            getUserId() {
                if (process.env.NODE_ENV === 'development') {
                    return Promise.resolve('7888bf9cf5cf41de8953538b4546870e')
                }
                return axios.get(`${this.$$vm.host}/api/sys/user/getUserId`, {params: {CODE: this.$$vm.code}}).then(res => {
                    if (res.data.returnCode == "03") throw new Error('未获取到用户信息');
                    return res.data.userId
                }).catch(e => {
                    alert('出错了 ：' + e.message)
                })
            },
            /**
             * 获取登录用户的信息
             * @returns {Promise.<void>}
             */
            getUserInfo(userId) {
                return axios.get(`${this.$$vm.host}/api/gaouser/gaoUser/userdetail`, {params: {'user_id': userId}}).then(userInfo => {
                    console.log('[Leo]用户信息 => ', userInfo)
                    if (!userInfo.data.data) throw new Error('获取用户信息失败')

                    this.$$vm.user.id = userInfo.data.data.id
                    this.title = this.$$vm.user.name = userInfo.data.data.name
                    this.$$vm.user.hxUser = userInfo.data.data.hxUser
                    this.$$vm.user.photo = userInfo.data.data.photo

                    return userInfo.data.data
                }).catch(e => {
                    alert('出错了 ：' + e.message)
                })
            },
            /**
             * 医生列表
             */
            getDocList(userId) {
                return axios.get(`${this.$$vm.host}/api/hzanddoc/gaoHzanddoc/DocList`, {params: {'user_id': userId}}).then(res => {
                    console.log('[Leo]Doc List =>', res.data.data)
                    res.data.data.forEach(item => {
                        item.noread = 0
                        this.$set(this.doctors, item.hxUser, item)
                    })
                })
            },
            /**
             * 环信登录
             */
            hxLogin() {
                try {
                    var _t = this
                    if (this.$$vm.user.hxUser) {
                        this.$$im.open({
                            apiUrl: WebIM.config.apiURL,
                            user: this.$$vm.user.hxUser,
                            pwd: this.$$vm.user.pwd,
                            appKey: WebIM.config.appkey,
                            success: function (data) {
                                console.log(`[Leo]登录成功 => `, data)
                                let token = data.access_token;
                                WebIM.utils.setCookie('webim_' + _t.$$vm.user.hxUser, token, 1);
                            }
                        })
                    } else {
                        throw new Error('无法登录IM')
                    }
                } catch (e) {
                    alert(e.message)
                }
            },
            /**
             * 收到消息
             * @param msg
             * @param type
             */
            receiveMessage(msg, type) {
                if (msg.from == this.$$vm.user.hxUser || msg.to == this.$$vm.user.hxUser) {
                    var value = msg.data
                    if (type == 'txt') {
                        value = WebIM.parseEmoji(msg.data.replace(/\n/mg, ''))
                    }

                    if (msg.ext['extension']) {
                        type = msg.ext['extension']
                        value = `<h3>${msg.ext[`${msg.ext['extension']}_title`]}</h3><p>${msg.ext[`${msg.ext['extension']}_content`]}</p>`
                    }

                    let time = WebIM.time()
                    let msgData = {
                        info: {
                            from: msg.from,
                            to: msg.to
                        },
                        username: '',
                        yourname: msg.from,
                        msg: {
                            type: type || 'txt',
                            data: value,
                            url: msg.url,
                            ext: msg.ext
                        },
                        style: '',
                        time: time,
                        mid: msg.type + msg.id
                    }
                    // if (msg.from == that.username) {
                    msgData.style = ''
                    msgData.username = msg.from
                    // } else {
                    //     msgData.style = 'self'
                    //     msgData.username = msg.to
                    // }

                    this.doctors[msg.from]['noread'] = ~~this.doctors[msg.from]['noread'] + 1 //设置未读消息数

                    if (!this.$$vm.chatMsg.hasOwnProperty(msg.from)) this.$$vm.chatMsg[msg.from] = []
                    this.$$vm.chatMsg[msg.from].push(msgData)
                }
            },
            /**
             * 标记已读
             * @param item
             * @returns {boolean}
             */
            setReadStatus(item) {
                console.log(`[Leo] => 已读`, item)
                this.doctors[msg.hxUser]['noread'] = 0
                return false
            },
            /**
             * 删除列表项
             * @param item
             * @returns {boolean}
             */
            deleteMsg(item) {
                console.log(`[Leo] => 删除`, item)
                MessageBox({title: '提示', message: '确定执行此操作?', showCancelButton: true})
                return false
            },
            /**
             * 跳转页面
             * @param item
             * @returns {boolean}
             */
            toNextPage(item) {
                this.$$vm.currDoc = item
                this.$router.push({
                    path: '/chat',
                    query: {code: this.$$vm.code}
                })
                return false
            },
            //region 列表顶部的下拉刷新
            loadTop() {
                //TODO:加载数据
                this.$refs.loadmore.onTopLoaded();
            },
            //endregion
            //region 列表底部的上拉刷新
            loadBottom() {
                //TODO:加载更多数据
                this.allLoaded = true;// 若数据已全部获取完毕
                this.$refs.loadmore.onBottomLoaded();
            },
            //endregion
        },
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    @import "../assets/css/common";

    .list {
        display: flex;
        flex-flow: column;
        &__item {
            height: 50px;
            border-top: 1px solid #eee;
        }
    }

    .noread {
        display: block;
        width: 20px;
        height: 20px;
        background-color: #f00;
        border-radius: 50%;
        color: #FFF;
        text-align: center;
        line-height: 20px;
        font-size: 12px;
    }
</style>
