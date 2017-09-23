<!--
* @Date: 2017/9/2  15:17
* @Author: leo
* http://xuebin.me/
* Created with JetBrains WebStorm.
-->
<template lang="pug">
    .page.page-current
        //-顶部导航
        mt-header(fixed,:title="username")
            router-link(to="/" slot="left")
                mt-button(icon="back") 返回

        //-消息列表
        main(ref="main",:style="{bottom:bottomGetter}")
            mt-loadmore(:top-method="loadTop", :bottom-method="loadBottom", :bottom-all-loaded="allLoaded", ref="loadmore")
                .list(ref="list")
                    .message(v-for="item in chatListGetter",:class="{self:item.style}")
                        .time
                            span {{item.time}}
                        .main(:class="item.style")
                            .user
                                span {{ item.username }}
                            img.avatar(:src="item.avatar")
                            .msg
                                template(v-if="item.msg.type == 'img' || item.msg.type == 'audio' || item.msg.type == 'video'")
                                    component(:is="'v-'+item.msg.type", :data="item.msg.data || item.msg.url")
                                template(v-else-if="item.msg.type == 'txt' || item.msg.type == 'emoji'")
                                    component(v-for="(item,index) in item.msg.data",:key="index",:is="'v-'+item.type", :data="item.data")
                                template(v-else)
                                    section(:class="item.msg.type",@click="toDetail(item.msg)")
                                        h3 {{item.msg.ext[item.msg.ext.extension+'_title']}}
                                        p {{item.msg.ext[item.msg.ext.extension+'_content']}}
        //-底部控制区
        .room_bar
            .form(title="文本框")
                input.f.news(v-if="true",v-model="inputMessage",@click="focus",@focus="focus")
                button.f.btn-recording(v-else,@mousedown="handleRecording",@mouseup="handleRecordingCancel") 按住 说话
                button.send_btn(@click="sendMessage") 发送
            //-按钮区
            .other_func
                .open_emoji(@click="openEmoji",title="发送表情")
                    img(src="../assets/images/Emoji.png",style="height:18px;")
                .send_image(title="发送图片")
                    img(src="../assets/images/iconImage@2x.png",style="height: 18px;")
                    input.uploader(type="file",@change="sendImage",ref="uploader")
                .custom_message(title="自定义消息",@click="openKnowledge") 知识库&nbsp;
                .custom_message(title="自定义消息",@click="openMdical") 病例&nbsp;
            //-表情包
            .emoji_item(:class="{showEmoji:show.emoji}",title="表情包")
                img(v-for="(item,index) in Emoji.map",:src="Emoji.path+item",:key="index",:data-emoji="index",@click="sendEmoji")
            //-知识库列表
            .emoji_item(:class="{showKnowledge:show.knowledge}",title="知识库列表",@click="openKnowledge")
                ul
                    li(v-for="item in knowledgeList",@click="sendCustomMessage('knowledge',item)") {{item.title}}
            //-病例列表
            .emoji_item(:class="{showMdical:show['medical_records']}",title="病例列表",@click="openMdical")
                ul
                    li(v-for="item in medicalList",@click="sendCustomMessage('medical_records',item)") {{item.name}}
</template>

<script>
    import axios from 'axios'
    import {Header, Loadmore, Button} from 'mint-ui'
    import WebIM from 'WebIM'
    import vTxt from '../components/chat/txt.vue'
    import vEmoji from '../components/chat/emoji.vue'
    import vImg from '../components/chat/img.vue'
    import vVideo from '../components/chat/video.vue'
    import vAudio from '../components/chat/audio.vue'
    import uri from '../utils/url'
    import {extensionTitle} from '../utils/enum'

    export default {
        components: {
            [Header.name]: Header,
            [Loadmore.name]: Loadmore,
            [Button.name]: Button,
            vTxt, vEmoji, vImg, vVideo, vAudio
        },
        data: () => ({
            hxUser: '',
            username: '',
            allLoaded: false,//底部数据全部获取完毕
            Emoji: WebIM.Emoji,
            chatMsg: [],
            show: {
                'emoji': false,
                'knowledge': false,
                'medical_records': false
            },
            userMessage: [],
            inputMessage: [],
            medicalList: [],
            knowledgeList: [],
        }),
        created() {
            this.hxUser = this.$route.query.hxUser || uri.getQueryString('hxUser')
//      let msg = JSON.parse(window.localStorage.getItem(this.hxUser)) || []
//      if (this.$$vm.chatMsg[this.hxUser]) {
//        this.$$vm.chatMsg[this.hxUser].forEach(item => {
//          msg.push(item)
//        })
//      }
//            this.$$vm.$set(this.$$vm.chatMsg, this.hxUser, msg)
        },
        mounted() {
            this.$nextTick(() => {
                this.username = this.$$vm.doctors[this.hxUser]['user_name'] || ''
                if (!this.$$vm.chatMsg.hasOwnProperty(this.hxUser)) this.$$vm.chatMsg[this.hxUser] = []
                this.$set(this, 'chatMsg', this.$$vm.chatMsg[this.hxUser])//历史消息
                this.$set(this, 'knowledgeList', this.$$vm.knowledgeList)//知识库
                this.init()
            })
        },
        watch: {
            chatMsg(val, oldVal) {
                this.chatListScrollBottom()
            }
        },
        computed: {
            chatListGetter() {
                return this.chatMsg.map(item => {
                    item.avatar = this.$$vm.doctors[this.hxUser]['avatar']
                    item.username = this.$$vm.doctors[this.hxUser]['user_name']

                    if (item.style === 'self') {
                        item.avatar = this.$$vm.user.photo
                        item.username = this.$$vm.user.name
                    }

                    if (!item.avatar) {
                        item.avatar = require('../assets/images/number.png')
                    }

                    return item
                })
            },
            bottomGetter() {
                if (this.show['emoji']
                    || this.show['knowledge']
                    || this.show['medical_records']) {
                    this.chatListScrollBottom()
                    return '216px'
                }
            }
        },
        methods: {
            init() {
                this.$refs.main.scrollTop = this.$refs.list.scrollHeight
                this.$$vm.$emit('readed', this.hxUser)
                this.$$vm.$watch(`chatMsg.${this.hxUser}`, (val, oldVal) => {
                    console.log('[Leo]chatMsg change=>', val)
                    this.$set(this, 'chatMsg', val)
                    this.$$vm.$emit('readed', this.hxUser)
//          window.localStorage.setItem(this.hxUser, JSON.stringify(this.$$vm.chatMsg[this.hxUser]))
                })
                this.getPatientBliFirstList()
            },
            /**
             * 获取患者自己的 原始病例列表
             * API：https://www.eolinker.com/#/home/project/inside/api/detail?groupID=35736&childGroupID=35739&apiID=160199&projectName=%E9%AB%98%E8%A1%80%E5%8E%8B&projectHashKey=6l5ybZRfffbfadb9e3c9dfe17b3171e968e4e19c3fbbcd2
             */
            getPatientBliFirstList() {
                axios.get(`${this.$$vm.host}/api/blianddoc/gaoBlianddoc/patientBliFirstList`, {
                    params: {
                        'user_id': this.$$vm.user.id,
                        pageNo: 1,
                        pageSize: 100
                    }
                }).then(res => {
                    let data = res.data
                    if (~~data.returnCode !== 0) {
                        console.log(data.messageInfo || '获取原始病历列表失败')
                        Toast(data.messageInfo || '获取原始病历列表失败')
                        return
                    }
                    console.log('原始病历 =>', data.data.list)
                    this.medicalList = data.data.list
                })
            },
            toDetail(msg) {
                switch (msg.ext.extension) {
                    case 'knowledge':
                        window.open(`${this.$$vm.host}/xxy/knowledge-detail.html?knowledge_id=${msg.ext[msg.ext.extension + '_id']}`)
                        window.location.href = `${this.$$vm.host}/xxy/knowledge-detail.html?knowledge_id=${msg.ext[msg.ext.extension + '_id']}`
                        break
                    case 'medical_records':
                        window.open(`${this.$$vm.host}/xxy/details.html?bingliId=${msg.ext[msg.ext.extension + '_id']}`)
                        window.location.href = `${this.$$vm.host}/xxy/details.html?bingliId=${msg.ext[msg.ext.extension + '_id']}`
                        break
                }
            },
            sendMessage() {
                if (!this.inputMessage.trim()) {
                    return;
                }
                this.$sendTxtMessage(this.inputMessage)

                this.userMessage = ''
                this.inputMessage = ''
                this.cancelEmoji()
            },
            sendCustomMessage(extension, item) {
                let ext = {extension}
                let msg = extensionTitle[extension]

                ext[`${extension}_id`] = item.id
                let title = '', content = '';
                switch (extension) {
                    case 'knowledge':
                        title = item.title
                        content = item.introduce
                        break
                    case 'medical_records':
                        title = item.name
                        break
                }
                ext[`${extension}_title`] = title
                ext[`${extension}_content`] = content

                this.$sendCustomMessage(msg, ext)
            },
            focus() {
                this.show['emoji'] = false
                this.show['knowledge'] = false
                this.show['medical_records'] = false
            },

            openEmoji() {
                this.show['emoji'] = true
                this.show['knowledge'] = false
                this.show['medical_records'] = false
            },
            openKnowledge() {
                this.show['emoji'] = false
                this.show['knowledge'] = true
                this.show['medical_records'] = false
            },
            openMdical() {
                this.show['emoji'] = false
                this.show['knowledge'] = false
                this.show['medical_records'] = true
            },
            cancelEmoji() {
                this.show['emoji'] = false
            },
            cancelKnowledge() {
                this.show['knowledge'] = false
            },
            cancelMdical() {
                this.show['medical_records'] = false
            },

            //region Emoji
            sendEmoji(event) {
                var that = this
                var emoji = event.target.dataset.emoji
                var msglen = that.userMessage.length - 1
                if (emoji && emoji != '[del]') {
                    var str = that.inputMessage + emoji
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
                that.userMessage = str
                that.inputMessage = str
            },
            //endregion
            //region 图片
            sendImage(e) {
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
                        to: this.hxUser,// 接收消息对象
                        roomType: false,
                        chatType: 'singleChat',
                        onFileUploadError: function (error) {
                            console.log('[Leo]onFileUploadError:图片上传失败=>', error);
                        },
                        onFileUploadComplete: function (data) {
                            console.log('[Leo]onFileUploadComplete:图片上传成功=>', data);
                            let url = ((location.protocol != 'https:' && WebIM.config.isHttpDNS) ? (this.$$vm.apiUrl + data.uri.substr(data.uri.indexOf("/", 9))) : data.uri) + '/' + data.entities[0].uuid;
                            that.$refs.uploader.value = null;
                            let time = WebIM.time()
                            console.log('[Leo]图片url=>', url)
                            var msgData = {
                                info: {
                                    from: that.$$vm.user.hxUser,
                                    to: that.hxUser,
                                },
                                username: that.$$vm.user.hxUser,
                                yourname: that.hxUser,
                                msg: {
                                    type: 'img',
                                    data: url
                                },
                                style: 'self',
                                time: time,
                                mid: 'img' + id,
                            }
                            that.$$vm.chatMsg[that.hxUser].push(msgData)
                        },
                        success: function () {// 消息发送成功
                            console.log('[Leo]图片发送成功');
                        },
                        flashUpload: WebIM.flashUpload
                    }
                    msg.set(option);
                    this.$$im.send(msg.body);
                }
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
            chatListScrollBottom() {
                this.$nextTick(() => {
                    this.$refs.main.scrollTop = this.$refs.list.scrollHeight
                })
            },
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
        /*overflow: hidden;*/
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
        /*display: flex;*/
        /*justify-content: space-around;*/
        /*flex-flow: wrap;*/
        margin-right: 20px;
        overflow: auto;
        height: 0;
    }

    .showEmoji, .showKnowledge, .showMdical {
        /*margin-top: 30px;*/
        width: 100%;
        height: 145px;
        background-color: #dddddd;
        padding-top: 10px;
        padding-left: 3%;
        display: block;
    }

    .emoji_item {
        &.showKnowledge {
            li {
                padding: 5px 10px;
            }
        }
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
