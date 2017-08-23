<template lang="pug">
    .page-group
        .page
            mt-header(fixed,:title="title")
                //-mt-button(icon="more", slot="right",@click="addFriend")
            main
                mt-loadmore(:top-method="loadTop", :bottom-method="loadBottom", :bottom-all-loaded="allLoaded", ref="loadmore")
                    ul.list
                        li.list__item(v-for="(item,index) in friends", @click="toNextPage(item)")
                            mt-cell-swipe(:title="item.name", :right="[{content: '&nbsp;', style: {background: '#FFF'}}, {content: '已读', style: {background: 'lightgray', color: '#fff'}, handler: () => {return setReadStatus(item)}}]")
                                span.noread(v-if="item.noread") {{item.noread}}
        mt-popup(v-model="popupVisible", popup-transition="popup-fade")
            .pop-body
                input(v-model="friendName")
                a(@click="doAddFriend") 添加
        transition(:name="transitionName")
            router-view(class="child-view")
</template>

<script>
    import {Header, Button, Loadmore, CellSwipe, MessageBox, Popup} from 'mint-ui'
    import WebIM from 'WebIM'
    import {_vm} from "../utils/webim";
    import axios from 'axios'

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
            transitionName: 'slide',
            popupVisible: false,
            friendName: '',
            friends: [],
        }),
        mounted() {
            _vm.code = this.$route.query.code || _vm.code
            if (!_vm.code) {
                alert('授权失败')
                window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${_vm.appid}&redirect_uri=${window.location.href}&response_type=code&scope=snsapi_userinfo&state=1#wechat_redirect`
                return
            }
            this.init()
        },
        watch: {},
        computed: {},
        methods: {
            init() {
                try {
                    let _t = this

                    //获取登录用户授权信息
                    let userInfo = this.getUserInfo()

                    //登录环信
                    if (!_vm.user.name) _t.hxLogin(userInfo.hxUser, '123456')

                    //好友信息改变
                    _vm.$watch('friends', function (val, oldVal) {
                        console.log('好友列表改变 => ', val)
                        _t.$set(_t, 'friends', val)
                    })

                    //收到消息
                    _vm.$on('receiveMsg', ({msg, type}) => {
                        console.log('收到消息 => ', {msg, type})
                        this.receiveMessage(msg, type)
                    })

                    //清空未读标记
                    _vm.$on('readed', (username) => {
                        this.friends.forEach(item => {
                            if (item.name === username) {
                                item['noread'] = 0
                            }
                        })
                    })
                } catch (e) {
                    alert('获取授权失败')
                }
            },
            /**
             * 获取登录用户的信息
             * @returns {Promise.<void>}
             */
            async getUserInfo() {
                try {
                    let data = await axios.get(`${_vm.host}/api/sys/user/getUserId`, {CODE: this.$route.query.code})
                    if (data.returnCode == "03") {
                        alert("未获取到用户信息");
                        return
                    }
                    window.localStorage.setItem("gxyUserID", data.userId);

                    let userInfo = await axios.get(`${_vm.host}/api/gaouser/gaoUser/userdetail`, {userId: data.userId})
                    console.log('用户信息 => ', userInfo)

                    return userInfo.data
                } catch (e) {
                    console.error('获取用户信息失败 => ', e)
                    alert('服务器异常')
                }
            },
            /**
             * 环信登录
             * @param username
             * @param password
             */
            hxLogin(username, password) {
                ////token登录
                //_vm.IM.open({
                //    apiUrl: WebIM.config.apiURL,
                //    user: _vm.user.name,
                //    accessToken: this.token,
                //    appKey: WebIM.config.appkey
                //});
                //密码登录
                _vm.IM.open({
                    apiUrl: WebIM.config.apiURL,
                    user: username,
                    pwd: password,
                    appKey: WebIM.config.appkey,
                    success: function (data) {
                        console.log(`[Leo]登录成功 => `, data)
                        let token = data.access_token;
                        WebIM.utils.setCookie('webim_' + _vm.user.name, token, 1);
                        _vm.user.name = username
                        _vm.user.pwd = password
                    }
                })
                this.title = username
            },
            /**
             * 收到消息
             * @param msg
             * @param type
             */
            receiveMessage(msg, type) {
                let that = this
                if (msg.from == _vm.user.name || msg.to == _vm.user.name) {
                    if (type == 'txt') {
                        var value = WebIM.parseEmoji(msg.data.replace(/\n/mg, ''))
                    } else if (type == 'emoji') {
                        var value = msg.data
                    } else {
                        var value = msg.data
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
                            type: type,
                            data: value,
                            url: msg.url
                        },
                        style: '',
                        time: time,
                        mid: msg.type + msg.id
                    }
//                    if (msg.from == that.username) {
                    msgData.style = ''
                    msgData.username = msg.from
//                    } else {
//                        msgData.style = 'self'
//                        msgData.username = msg.to
//                    }

                    this.friends.forEach(item => {
                        if (item.name === msg.from) {
                            item['noread'] = ~~item['noread'] + 1
                        }
                    })

                    if (!_vm.chatMsg.hasOwnProperty(msg.from)) _vm.chatMsg[msg.from] = []
                    _vm.chatMsg[msg.from].push(msgData)
                }
            },
            addFriend() {
                this.popupVisible = true
            },
            doAddFriend() {
                console.log(`[Leo] => 加个好友呗`)
//                this.$store.state.IM.subscribe({
//                    to: this.friendName,
//                    message: '加个好友呗!'
//                });
            },
            /**
             * 标记已读
             * @param item
             * @returns {boolean}
             */
            setReadStatus(item) {
                console.log(`[Leo] => 已读`, item)
                this.friends.forEach(f => {
                    if (f.name === item.name) {
                        f['noread'] = 0
                    }
                })
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
                console.log('toNextPage')
                this.$router.push({path: '/chat', query: {name: item.name, code: _vm.code}})
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
