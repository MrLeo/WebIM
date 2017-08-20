<!--
* @Date: 2017/8/14  15:31
* @Author: leo
* http://xuebin.me/
* Created with JetBrains WebStorm.
-->
<template lang="pug">
    .page-group
        .page
            mt-header(fixed,:title="title")
                //-mt-button(icon="more", slot="right",@click="addFriend")
            main
                mt-loadmore(:top-method="loadTop", :bottom-method="loadBottom", :bottom-all-loaded="allLoaded", ref="loadmore")
                    ul.list
                        li.list__item(v-for="item in friends", @click="toNextPage(item)")
                            mt-cell-swipe( :title="item.name", :value="item", :right="[{content: '&nbsp;', style: {background: '#FFF'}}, {content: '已读', style: {background: 'lightgray', color: '#fff'}, handler: () => {return setReadStatus(item)}}, {content: '删除', style: {background: 'red', color: '#fff'}, handler: () => {return deleteMsg(item)}}]")
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
            this.token = WebIM.utils.getCookie('webim_' + _vm.user.name)
            console.log('token=>', this.token)
            this.init()
        },
        watch: {},
        computed: {},
        methods: {
            init() {
                let _t = this
                this.login()
                _vm.$watch('friends', function (val, oldVal) {
                    _t.$set(_t, 'friends', val)
                })
            },
            login() {
//                //token登录
//                _vm.IM.open({
//                    apiUrl: WebIM.config.apiURL,
//                    user: _vm.user.name,
//                    accessToken: this.token,
//                    appKey: WebIM.config.appkey
//                });

//                //密码登录
//                _vm.IM.open({
//                    apiUrl: WebIM.config.apiURL,
//                    user: _vm.user.name,
//                    pwd: _vm.user.pwd,
//                    appKey: WebIM.config.appkey,
//                    success: function (data) {
//                        console.log(`[Leo]登录成功 => `, data)
//                        let token = data.access_token;
//                        WebIM.utils.setCookie('webim_' + _vm.user.name, token, 1);
//                    },
//                    error: function (e) {
//                        console.log(`[Leo]登录失败`)
//                    }
//                })
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
            //region 标记已读
            setReadStatus(item) {
                console.log(`[Leo] => 已读`, item)
                return false
            },
            //endregion
            //region 删除列表项
            deleteMsg(item) {
                console.log(`[Leo] => 删除`, item)
                MessageBox({title: '提示', message: '确定执行此操作?', showCancelButton: true})
                return false
            },
            //endregion
            //region 跳转页面
            toNextPage(item) {
                console.log('toNextPage')
                this.$router.push({path: '/chat', query: {name: item.name}})
                return false
            },
            //endregion
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
