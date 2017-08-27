<template lang="pug">
    .page.page-current
        //-顶部导航
        mt-header(fixed,:title="title")
            router-link(to="/" slot="left")
                mt-button(icon="back") 返回
        //-消息列表
        main
            mt-loadmore(:top-method="loadTop", :bottom-method="loadBottom", :bottom-all-loaded="allLoaded", ref="loadmore")
                .list
                    .message(v-for="item in chatMsg",:class="{self:item.style}")
                        .time
                            span {{item.time}}
                        .main(:class="item.style")
                            .user
                                span {{ item.username }}
                            img.avatar(src="../assets/images/number.png")
                            .msg
                                template(v-if="item.msg.type == 'img' || item.msg.type == 'audio' || item.msg.type == 'video'")
                                    component(:is="'v-'+item.msg.type", :data="item.msg.data || item.msg.url")
                                template(v-if="item.msg.type == 'txt' || item.msg.type == 'emoji'")
                                    component(v-for="(item,index) in item.msg.data",:key="index",:is="'v-'+item.type", :data="item.data")
        //-底部按钮
        .room_bar
            .form(title="文本框")
                input.f.news(v-if="true",v-model="inputMessage",@click="focus",@focus="focus")
                button.f.btn-recording(v-else,@mousedown="handleRecording",@mouseup="handleRecordingCancel") 按住 说话
                button.send_btn(@click="sendMessage") 发送
            //-按钮区
            .other_func
                .open_emoji(@click="openEmoji",title="发送表情")
                    img(src="../assets/images/Emoji.png")
                .send_image(title="发送图片")
                    img(src="../assets/images/iconImage@2x.png", style="height: 18px;")
                    input.uploader(type="file",@change="sendImage",ref="uploader")
            .emoji_item(:class="show",title="表情包")
                img(v-for="(item,index) in Emoji.map",:src="Emoji.path+item",:key="index",:data-emoji="index",@click="sendEmoji")
        //-语音消息：录音弹窗
        .modal.modal-record(v-if="recordStatus != RecordStatus.HIDE",@click="toggleRecordModal")
            .modal-body
                .desc {{RecordDesc[recordStatus]}}
                .dot(@touchstart="handleRecording",@touchmove="handleRecordingMove",@touchend="handleRecordingCancel")
                    img.icon-mic(src="../assets/images/mic@2x.png")
</template>

<script>
    import {Header, Loadmore, Button} from 'mint-ui'
    import WebIM from 'WebIM'
    import vTxt from '../components/chat/txt.vue'
    import vEmoji from '../components/chat/emoji.vue'
    import vImg from '../components/chat/img.vue'
    import vVideo from '../components/chat/video.vue'
    import vAudio from '../components/chat/audio.vue'

    export default {
        name: 'Chat',
        components: {
            [Header.name]: Header,
            [Loadmore.name]: Loadmore,
            [Button.name]: Button,
            vTxt, vEmoji, vImg, vVideo, vAudio
        },
        data: () => ({
            title: '',
            username: '',
            allLoaded: false,//底部数据全部获取完毕
            Emoji: WebIM.Emoji,
            chatMsg: [],
            show: 'emoji_list',
            RecordDesc: {
                0: '长按开始录音',
                2: '向上滑动取消',
                3: '松开手取消',
            },
            RecordStatus: {
                SHOW: 0,
                HIDE: 1,
                HOLD: 2,
                SWIPE: 3,
                RELEASE: 4
            },
            recordStatus: 1,
            changedTouches: null,
            userMessage: [],
            inputMessage: []
        }),
        created() {
            this.title = this.$route.query.name || ''
            this.username = this.$route.query.name || ''
            if (!this.$$vm.chatMsg.hasOwnProperty(this.$route.query.name)) this.$$vm.chatMsg[this.$route.query.name] = []
            this.$set(this, 'chatMsg', this.$$vm.chatMsg[this.$route.query.name])
        },
        mounted() {
            this.init()
        },
        watch: {},
        computed: {},
        methods: {
            init() {
                this.$$vm.$watch('chatMsg', (val, oldVal) => {
                    console.log('chatMsg change=>', val)
                    this.$set(this, 'chatMsg', val)
                })

                this.$$vm.$emit('readed', this.$route.query.name)
            },
            sendMessage() {
                if (!this.inputMessage.trim()) return;
                let that = this
                let id = this.$$im.getUniqueId();
                let message = new WebIM.message('txt', id);
                message.set({
                    msg: this.inputMessage,
                    to: this.$route.query.name,
                    roomType: false,
                    success: function (id, serverMsgId) {
                        //console.log('success')
                    }
                });
                // //console.log(msg)
                message.body.chatType = 'singleChat';
                this.$$im.send(message.body);
                if (message) {
                    let value = WebIM.parseEmoji(message.value.replace(/\n/mg, ''))
                    let time = WebIM.time()
                    let msgData = {
                        info: {
                            to: message.body.to
                        },
                        username: this.$$vm.user.name,
                        yourname: message.body.to,
                        msg: {
                            type: message.type,
                            data: value
                        },
                        style: 'self',
                        time: time,
                        mid: message.id
                    }
                    this.$$vm.chatMsg[this.$route.query.name].push(msgData)

                    that.userMessage = ''
                    that.inputMessage = ''
                    that.cancelEmoji()
                }
            },
            focus() {
                this.cancelEmoji()
            },
            //region Emoji
            openEmoji() {
                this.show = 'showEmoji'
            },
            cancelEmoji() {
                this.show = 'emoji_list'
            },
            sendEmoji(event) {
                var that = this
                var emoji = event.target.dataset.emoji
                var msglen = that.userMessage.length - 1
                if (emoji && emoji != '[del]') {
                    var str = that.userMessage + emoji
                } else if (emoji == '[del]') {
                    var start = that.userMessage.lastIndexOf('[')
                    var end = that.userMessage.lastIndexOf(']')
                    var len = end - start
                    if (end != -1 && end == msglen && len >= 3 && len <= 4) {
                        var str = that.userMessage.slice(0, start)
                    } else {
                        var str = that.userMessage.slice(0, msglen)
                    }
                }
                this.userMessage = str
                this.inputMessage = str
            },
            //endregion
            //region 图片
            sendImage(e) {
                console.log(e)
                var that = this
                this.cancelEmoji()
                let id = this.$$im.getUniqueId()// 生成本地消息id
                let msg = new WebIM.message('img', id)// 创建图片消息
                let file = WebIM.utils.getFileUrl(this.$refs.uploader)// 将图片转化为二进制文件

                if (!file.filename) {
                    this.$refs.uploader.value = null;
                    return false;
                }

                let allowType = {
                    'jpg': true,
                    'gif': true,
                    'png': true,
                    'bmp': true
                }

                if (file.filetype.toLowerCase() in allowType) {
                    let option = {
                        apiUrl: WebIM.config.apiURL,
                        file: file,
                        to: that.$route.query.name,// 接收消息对象
                        roomType: false,
                        chatType: 'singleChat',
                        onFileUploadError: function (error) {      // 消息上传失败
                            console.log('[onFileUploadError]图片上传失败=>', error);
                        },
                        onFileUploadComplete: function (data) {   // 消息上传成功
                            console.log('[onFileUploadComplete]图片上传成功=>', data);
                            let url = ((location.protocol != 'https:' && WebIM.config.isHttpDNS) ? (this.$$vm.apiUrl + data.uri.substr(data.uri.indexOf("/", 9))) : data.uri) + '/' + data.entities[0].uuid;
                            that.$refs.uploader.value = null;
                            let time = WebIM.time()
                            console.log('url=>', url)
                            var msgData = {
                                info: {
                                    from: that.$$vm.user.id,
                                    to: that.$route.query.name,
                                },
                                username: that.$$vm.user.id,
                                yourname: that.$route.query.name,
                                msg: {
                                    type: 'img',
                                    data: url
                                },
                                style: 'self',
                                time: time,
                                mid: 'img' + id,
                            }
//                            Demo.api.addToChatRecord(option, 'img');
//                            Demo.api.appendMsg(option, 'img');
                            that.$$vm.chatMsg[that.$route.query.name].push(msgData)
                        },
                        success: function () {// 消息发送成功
                            console.log('[Success]图片发送成功');
                        },
                        flashUpload: WebIM.flashUpload
                    }
                    msg.set(option);
                    this.$$im.send(msg.body);
                }
            },
            //endregion
            //region 语音消息
            toggleRecordModal() {
                this.recordStatus = this.recordStatus == this.RecordStatus.HIDE ? this.RecordStatus.SHOW : this.RecordStatus.HIDE
            },
            handleRecordingMove(e) {
                if (!this.changedTouches) {
                    return
                }
                let touch = e.touches[0]
                if (this.recordStatus == this.RecordStatus.SWIPE) {
                    if (this.changedTouches.pageY - touch.pageY < 20) {
                        this.recordStatus = this.RecordStatus.HOLD
                    }
                }
                if (this.recordStatus == this.RecordStatus.HOLD) {
                    if (this.changedTouches.pageY - touch.pageY > 20) {
                        this.recordStatus = this.RecordStatus.SWIPE
                    }
                }
            },
            handleRecording(e) {
                var self = this
                this.changedTouches = e.touches[0]
                this.recordStatus = this.RecordStatus.HOLD
                //TODO:录音
                setTimeout(() => {
                    //超时
                    this.handleRecordingCancel()
                }, 100000)
            },
            handleRecordingCancel(e) {
                // 向上滑动状态停止：取消录音发放
                if (this.recordStatus == this.RecordStatus.SWIPE) {
                    this.recordStatus = this.RecordStatus.RELEASE
                } else {
                    this.recordStatus = this.RecordStatus.HIDE
                }
                //wx.stopRecord()
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
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    $footerH: 75px;
    main {
        position: absolute;
        top: 40px;
        bottom: $footerH;
        right: 0;
        left: 0;
        overflow: auto;
    }

    .f {
        flex: 1;
    }

    .f-row {
        display: flex;
        flex-direction: row;
    }

    .message {
        width: 92%;
        height: auto;
        padding: 10px 15px;
    }

    .time {
        margin: 7px 0;
        text-align: center;
    }

    .time span {
        display: inline-block;
        padding: 3px 10px 0 10px;
        font-size: 12px;
        color: #fff;
        line-height: 14px;
        border-radius: 2px;
        background-color: #dcdcdc;
    }

    .user span {
        margin: auto auto 4px 0;
        font-size: 12px;
        color: #dcdcdc;
        display: block;
    }

    .avatar {
        width: 32px;
        height: 30px;
        margin: 0 10px 0 0;
        padding-top: 3px;
        border-radius: 3px;
        float: left;
    }

    .msg {
        //display: flex;
        //justify-content: center;
        display: inline-block;
        position: relative;
        padding: 5px 10px;
        max-width: calc(85% - 40px);
        /// min-height:(12 + 5 * 2) px;
        font-size: 12px;
        overflow: hidden;
        text-align: left;
        word-break: break-all;
        background-color: #EDEDED;
        border-radius: 4px;
    }

    .msg p {
        padding: 0;
        margin: 0;
    }

    .msg span {
        line-height: 1.5;
    }

    .msg :before {
        content: " ";
        position: absolute;
        top: 9px;
        right: 100%;
        border: 6px solid transparent;
        border-right-color: #EDEDED;
    }

    .self {
        text-align: right;
    }

    .self .avatar {
        float: right;
        margin: 0 0 0 10px;
    }

    .self .user {
        margin: auto 2px 4px auto;
        font-size: 12px;
        color: #dcdcdc;
    }

    .self .msg {
        background-color: #b2e281;
    }

    .self .msg :before {
        right: inherit;
        left: 100%;
        border-right-color: transparent;
        border-left-color: #b2e281;
    }

    .room_bar {
        width: 100%;
        height: auto;
        border-top: 1px solid #CFCFCF;
        position: fixed;
        bottom: 0;
        right: 0;
        z-index: 1;
        background-color: #FFFFFF;
    }

    .send_btn {
        width: 40px;
        height: 30px;
        line-height: 30px;
        font-size: 14px;
        color: #000;
        padding: 0;
        /*display: inline-block;*/
        /*float: right;*/
        margin: 4px 8px auto auto;
        background-color: #fff;
        border: 1px;
    }

    .audio {
        width: 4.5%;
        height: 40%;
        border: 1px solid rgb(135, 152, 164);
        border-radius: 50px;
        padding: 3px 4px;
        margin-left: 10px;
    }

    .room_bar .form {
        width: 100%;
        height: 40px;
        padding: 0;
        display: flex;
    }

    .news {
        width: 79%;
        height: 30px;
        border: 1px solid #CFCFCF;
        border-radius: 5px;
        font-size: 14px;
        padding-left: 4px;
        /*display: inline-block;*/
        /*float: left;*/
        margin: 4px 2px 4px 6px;
    }

    .emoj {
        width: 6.8%;
        height: 60%;
        margin-right: 10px;
    }

    .other_func {
        width: 100%;
        height: 30px;
        float: left;
        display: flex;
        align-items: center;
        justify-content: flex-start;

    }

    .other_func img {
        width: 21px;
        height: 20px;
    }

    .emoji_list {
        margin-top: 30px;
        width: 100%;
        height: 0;
        background-color: #dddddd;
        /*padding-top: 10px;*/
        padding-left: 3%;
        display: none;
    }

    .showEmoji {
        margin-top: 30px;
        width: 100%;
        height: 145px;
        background-color: #dddddd;
        padding-top: 10px;
        padding-left: 3%;
        display: block;
    }

    .emoji_list img, .showEmoji img {
        width: 26px;
        height: 26px;
        margin: 5px 2%;
    }

    .emoji {
        width: 26px;
        height: 26px;
        margin: 0 0;
    }

    .emoji_item {
        display: flex;
        justify-content: space-around;
        flex-flow: wrap;
        margin-right: 20px;
        overflow: auto;
    }

    .template {
        display: inline;
    }

    .open_emoji, .send_image, .open_camera, .v-record {
        position: relative;
        width: 40px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    }

    .v-record {
        margin-right: 15px;
    }

    .v-record .icon-record {
        width: 9px;
        height: 20px;
    }

    .icon-play {
        width: 25px;
        height: 25px;
        margin: 0 10px;
    }

    .icon-mic {
        width: 13px;
        height: 25px;
    }

    .modal {
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        z-index: 999;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .modal-record .modal-body {
        width: 164px;
        height: 164px;
        background-color: rgba(135, 152, 164, 0.8);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        border-radius: 3px;
    }

    .modal-record .desc {
        color: #fff;
        font-size: 13px;
        margin-bottom: 20px;
    }

    .modal-record .dot {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background-color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .uploader {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: 1;
        width: 100%;
        height: 100%;
        opacity: 0;
    }
</style>
