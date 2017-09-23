<template>
    <div id="app" class="page-group">
        <router-view></router-view>
    </div>
</template>

<script>
    import {Header, Loadmore, Button, Toast} from 'mint-ui'
    import axios from 'axios'
    import uri from './utils/url'
    import {extensionTitle} from './utils/enum'

    export default {
        name: 'app',
        created() {
            this.$$vm.code = uri.getQueryString('code') || this.$$vm.code
            if (process.env.NODE_ENV != 'development') {
                if (!this.$$vm.code) {
                    console.log('[Leo] => 无授权code')
                    window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?response_type=code&scope=snsapi_userinfo&state=1&appid=' + this.$$vm.appid + '&redirect_uri=' + window.location.href + '#wechat_redirect'
                    return
                }
            }
            this.init()
        },
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

                    //获取知识库
                    this.getKnowledgeList()

                    //收到消息
                    this.$$vm.$on('receiveMsg', ({msg, type}) => {
                        console.log('[Leo]收到消息 => ', {msg, type})
                        this.receiveMessage(msg, type)
                    })

                    //清空未读标记
                    this.$$vm.$on('readed', (hxUser) => {
                        this.$$vm.doctors[hxUser] && (this.$$vm.doctors[hxUser]['noread'] = 0)
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
                if (process.env.NODE_ENV === 'development') {//测试用户ID
                    return Promise.resolve('af61458669764025bb7c682d88e8455d')
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
                    this.$$vm.user.name = userInfo.data.data.name
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
                    console.log('[Leo]获取医生列表 =>', res.data.data)
                    res.data.data.forEach(item => {
                        item['noread'] = 0
                        this.$set(this.$$vm.doctors, item.hxUser, item)
                    })
                    window.localStorage.setItem('docs', JSON.stringify(res.data.data))//将医生列表本地缓存，用户获取对应医生的消息历史
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
                    var value = msg.data//默认展示的消息value

                    if (type == 'txt') {//txt消息需要转Emoji图标
                        value = WebIM.parseEmoji(msg.data.replace(/\n/mg, ''))
                    }

                    if (msg.ext['extension']) {//如果消息带有扩展，则消息类型从扩展中取
                        type = msg.ext['extension']
                        value = extensionTitle[type]
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

                    this.$$vm.doctors[msg.from]['noread'] = ~~this.$$vm.doctors[msg.from]['noread'] + 1 //设置未读消息数

                    if (!this.$$vm.chatMsg.hasOwnProperty(msg.from)) this.$$vm.chatMsg[msg.from] = []

                    this.$$vm.chatMsg[msg.from].push(msgData)

                    //将收到的消息加入到历史消息缓存
                    let msgHistory = JSON.parse(window.localStorage.getItem(msg.from)) || []
                    msgHistory.push(msgData)
                    window.localStorage.setItem(msg.from, JSON.stringify(msgHistory))
                }
            },
            /**
             * 获取知识库列表
             * API：https://www.eolinker.com/#/home/project/inside/api/detail?groupID=35834&apiID=161612&projectName=%E9%AB%98%E8%A1%80%E5%8E%8B&projectHashKey=6l5ybZRfffbfadb9e3c9dfe17b3171e968e4e19c3fbbcd2
             */
            getKnowledgeList() {
                axios.get(`${this.$$vm.host}/api/gaorepository/gaoRepository/zhishiList`, {
                    params: {
                        search: '',
                        pageNo: 1,
                        pageSize: 100
                    }
                }).then(res => {
                    let data = res.data
                    if (~~data.returnCode !== 0) {
                        console.log(data.messageInfo || '获取知识库失败')
                        Toast(data.messageInfo || '获取知识库失败')
                        return
                    }
                    console.log('知识库 =>', data.data.list)
                    this.$$vm.knowledgeList = data.data.list
                })
            },
        }
    }
</script>

<style lang="scss" rel="stylesheet/scss">
    @import "assets/css/base";

    #app {
        @include fullpage;
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    .slide-enter, .slide-leave-to {
        -webkit-transform: translate(100%, 0);
        transform: translate(100%, 0);
    }

    .slide-enter-active, .slide-leave-active {
        transition: all .5s cubic-bezier(.55, 0, .1, 1);
    }

    .slide-enter-to, .slide-leave {
        -webkit-transform: translate(0, 0);
        transform: translate(0, 0);
    }
</style>
