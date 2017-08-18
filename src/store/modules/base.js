import Vue from 'vue'
import * as types from '../mutation-types'
import api from '../api'
import WebIM from 'WebIM'

const state = {
    version: '',
    token: null,
    IM: null,
    user: {
        id: '',
        name: '',
        pwd: '',
        photo: '',
    },
    friends: []
}

const getters = {}

const actions = {
    initIm({state, dispatch, commit, rootState}) {
        commit(types.BASE_INIT_IM)
        dispatch('listen')
    },
    listen({state, dispatch, commit, rootState}) {
        state.IM.listen({
            /**
             * 连接成功回调
             * 如果isAutoLogin设置为false，那么必须手动设置上线，否则无法收消息
             * 手动上线指的是调用conn.setPresence(); 如果conn初始化时已将isAutoLogin设置为true
             * 则无需调用conn.setPresence();
             * @param message
             */
            onOpened: function (message) {
                console.log('[onOpened]连接成功回调 =>', message)
                dispatch('handleOpened', message)
            },
            /**
             * 连接关闭回调
             * @param message
             */
            onClosed: function (message) {
                console.log('[onClosed]连接关闭回调 =>', message)
            },
            /**
             * 收到文本消息
             * @param message
             */
            onTextMessage: function (message) {
                console.log('[onTextMessage]收到文本消息 =>', message)
            },
            /**
             * 收到表情消息
             * @param message
             */
            onEmojiMessage: function (message) {
                console.log('[onEmojiMessage]收到表情消息 =>', message)
            },
            /**
             * 收到图片消息
             * @param message
             */
            onPictureMessage: function (message) {
                console.log('[onPictureMessage]收到图片消息 =>', message)
            },
            /**
             * 收到命令消息
             * @param message
             */
            onCmdMessage: function (message) {
                console.log('[onCmdMessage]收到命令消息 =>', message)
            },
            /**
             * 收到音频消息
             * @param message
             */
            onAudioMessage: function (message) {
                console.log('[onAudioMessage]收到音频消息 =>', message)
            },
            /**
             * 收到位置消息
             * @param message
             */
            onLocationMessage: function (message) {
                console.log('[onLocationMessage]收到位置消息 =>', message)
            },
            /**
             * 收到文件消息
             * @param message
             */
            onFileMessage: function (message) {
                console.log('[onFileMessage]收到文件消息 =>', message)
            },
            /**
             * 收到视频消息
             * @param message
             */
            onVideoMessage: function (message) {
                console.log('[onVideoMessage]收到视频消息 =>', message)
                var node = document.getElementById('privateVideo');
                var option = {
                    url: message.url,
                    headers: {
                        'Accept': 'audio/mp4'
                    },
                    onFileDownloadComplete: function (response) {
                        var objectURL = WebIM.utils.parseDownloadResponse.call(conn, response);
                        node.src = objectURL;
                    },
                    onFileDownloadError: function () {
                        console.log('File down load error.')
                    }
                };
                WebIM.utils.download.call(conn, option);
            },
            /**
             * 处理“广播”或“发布-订阅”消息，如联系人订阅请求、处理群组、聊天室被踢解散等消息
             * @param message
             */
            onPresence: function (message) {
                console.log('[onPresence]处理“广播”或“发布-订阅”消息 =>', message)
                dispatch('handlePresence', message)
            },
            /**
             * 处理好友申请
             * @param message
             */
            onRoster: function (message) {
                console.log('[onRoster]处理好友申请 =>', message)
            },
            /**
             * 处理群组邀请
             * @param message
             */
            onInviteMessage: function (message) {
                console.log('[onInviteMessage]处理群组邀请 =>', message)
            },
            /**
             * 本机网络连接成功
             */
            onOnline: function () {
                console.log('[onOnline] => 本机网络连接成功')
            },
            /**
             * 本机网络掉线
             */
            onOffline: function () {
                console.log('[onOffline] => 本机网络掉线')
            },
            /**
             * 失败回调
             * @param message
             */
            onError: function (message) {
                console.log(`[onError]回调失败 => ${message.data.data && JSON.parse(message.data.data)['error_description']}`, message)
                dispatch('handleError', message)
            },
            /**
             * 黑名单变动
             * 查询黑名单，将好友拉黑，将好友从黑名单移除都会回调这个函数，list则是黑名单现有的所有好友信息
             * @param list
             */
            onBlacklistUpdate: function (list) {
                console.log('[onBlacklistUpdate]黑名单变动 =>', list);
            },
            /**
             * 收到消息送达客户端回执
             * @param message
             */
            onReceivedMessage: function (message) {
                console.log('[onReceivedMessage]收到消息送达客户端回执 =>', message)
            },
            /**
             * 收到消息送达服务器回执
             * @param message
             */
            onDeliveredMessage: function (message) {
                console.log('[onDeliveredMessage]收到消息送达服务器回执 =>', message)
            },
            /**
             * 收到消息已读回执
             * @param message
             */
            onReadMessage: function (message) {
                console.log('[onReadMessage]收到消息已读回执 =>', message)
            },
            /**
             * 创建群组成功回执（需调用createGroupNew）
             * @param message
             */
            onCreateGroup: function (message) {
                console.log('[onCreateGroup]创建群组成功回执 =>', message)
            },
            /**
             * 如果用户在A群组被禁言，在A群发消息会走这个回调并且消息不会传递给群其它成员
             * @param message
             */
            onMutedMessage: function (message) {
                console.log('[onMutedMessage]禁言 =>', message)
            }
        })
    },
    handleError({state, dispatch, commit, rootState}, message) {
        //用户不存在
        if (message
            && message.data
            && message.data.data) {
            if (JSON.parse(message.data.data)['error_description'] === 'user not found') {
                state.IM.registerUser({
                    username: state.user.name,
                    password: state.user.pwd,
                    nickname: state.user.name,
                    appKey: WebIM.config.appkey,
                    success: function () {
                        console.log(`[Leo] => 注册成功，自动登录`)
                        dispatch('login')
                    },
                    error: function () {
                        console.log(`[Leo] => 注册失败`)
                    },
                    apiUrl: WebIM.config.apiURL
                })
            }
        }
    },
    handleOpened({state, dispatch, commit, rootState}, message) {
        state.IM.getRoster({
            success: function (roster) {
                console.log('获取好友信息', roster)
                //获取好友列表，并进行好友列表渲染，roster格式为：
                // [
                //     {
                //         jid:'asemoemo#chatdemoui_test1@easemob.com',
                //         name:'test1',
                //         subscription: 'both'
                //     }
                // ]
                for (var i = 0, l = roster.length; i < l; i++) {
                    var ros = roster[i];
                    //ros.subscription值为both/to为要显示的联系人，此处与APP需保持一致，才能保证两个客户端登录后的好友列表一致
                    if (ros.subscription === 'both' || ros.subscription === 'to') {
                        console.log('ros.subscription => ', ros.subscription)
                        state.friends.push(ros)
                    }
                }
            },
        })
    },
    handlePresence({state, dispatch, commit, rootState}, e) {
        //（发送者希望订阅接收者的出席信息），即别人申请加你为好友
        if (e.type === 'subscribe') {
            //若e.status中含有[resp:true],则表示为对方同意好友后反向添加自己为好友的消息，demo中发现此类消息，默认同意操作，完成双方互为好友；如果不含有[resp:true]，则表示为正常的对方请求添加自己为好友的申请消息。
            /*同意添加好友操作的实现方法*/
            state.IM.subscribed({
                to: state.user.name,
                message: '[resp:true]'
            });
            state.IM.subscribe({//需要反向添加对方好友
                to: e.from,
                message: '[resp:true]'
            });
        }

        //(发送者允许接收者接收他们的出席信息)，即别人同意你加他为好友
        if (e.type === 'subscribed') {

        }

        //（发送者取消订阅另一个实体的出席信息）,即删除现有好友
        if (e.type === 'unsubscribe') {

        }

        //（订阅者的请求被拒绝或以前的订阅被取消），即对方单向的删除了好友
        if (e.type === 'unsubscribed') {

        }
    },
    login({state, dispatch, commit, rootState}, {name, pwd}) {
        commit(types.BASE_SET_USERINFO, {
            name,
            pwd,
        })
        return new Promise((resolve, reject) => {
            state.IM.open({
                apiUrl: WebIM.config.apiURL,
                user: name,
                pwd: pwd,
                appKey: WebIM.config.appkey,
                success: function (data) {
                    console.log(`[Leo]登录成功 => `, data)
                    let token = data.access_token
                    WebIM.utils.setCookie('webim_' + state.user.name, token, 1)
                    resolve(data)
                },
            })
        })
    },
}

const mutations = {
    [types.BASE_INIT_IM](state) {
        state.IM = new WebIM.connection({
            https: WebIM.config.https,
            url: WebIM.config.xmppURL,
            isAutoLogin: WebIM.config.isAutoLogin,
            isMultiLoginSessions: WebIM.config.isMultiLoginSessions
        })
    },
    [types.BASE_SET_VERSION](state, version) {
        state.version = version
    },
    [types.BASE_SET_USERINFO](state, userInfo) {
        userInfo.id && (state.user.id = userInfo.id)
        userInfo.name && (state.user.name = userInfo.name)
        userInfo.pwd && (state.user.pwd = userInfo.pwd)
        userInfo.photo && (state.user.photo = userInfo.photo)
    },
    [types.BASE_SET_FRIENDS](state, friends) {
        state.friends.push(...friends)
    }
}

export default {
    state,
    mutations,
    actions,
    getters
}
