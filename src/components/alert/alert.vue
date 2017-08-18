<!--
* @Date: 2016/11/1  0001  23:46
* @Author: lxbin
* Created with JetBrains WebStorm.
-->

<template>
    <transition name="l-alert-pop">
        <div v-show="visible">
            <div class="modal-overlay modal-overlay-visible"></div>

            <!--region 普通消息提示-->
            <div class="gj-modal modal-info modal-in" v-if="modal=='msg'">
                <div class="modal-body">{{message}}</div>
                <div class="modal-footer" @click="onClose"><a href="javascript:void(0)">知道了</a></div>
            </div>
            <!--endregion-->

            <!--region 保存成功/上报成功-->
            <div class="gj-modal modal-status modal-in" v-else-if="modal=='save' || modal=='report'" @click="onClose">
                <div class="modal-body">
                    <div class="status-img">
                        <img src="../../assets/img/icon-keep.png" v-if="modal=='save'"/>
                        <img src="../../assets/img/iocn-report.png" v-else-if="modal=='report'"/>
                    </div>
                    <div class="status-text" v-html="message || (modal == 'save' && '保存成功') || (modal == 'report' && '上报成功')"></div>
                </div>
            </div>
            <!--endregion-->
        </div>
    </transition>
</template>
<script>
    import {mapState, mapGetters, mapMutations, mapActions} from 'vuex'
    import * as types from '../../store/mutation-types'
    export default{
        name: 'alert',
        components: {},
        props: {
            modal: {
                type: String,
                default: 'msg' //'msg'|'save'|'report'
            },
            message: {
                type: String,
                default: ''
            },
            click: Function
        },
        data(){
            return {
                visible: false
            }
        },
        watch: {},
        computed: {
            ...mapState({}),
            ...mapGetters({})
        },
        methods: {
            onClose(){
                this.visible = false
                if (this.click && typeof this.click == 'function') {
                    this.click()
                }
            }
        },
        created(){
        },
        mounted(){
        }
    }
</script>
<style scoped lang="scss" rel="stylesheet/scss">
    /*弹出*/
    .modal-overlay {
        background: rgba(0, 0, 0, 0.5);
    }

    .gj-modal {
        width: 13.5rem;
        position: absolute;
        z-index: 11000;
        left: 50%;
        margin-left: -6.75rem;
        margin-top: 0;
        top: 50%;
        text-align: center;
        border-radius: 0.35rem;
        opacity: 0;
        -webkit-transform: translate(0, -50%) scale(1.185);
        transform: translate(0, -50%) scale(1.185);
        -webkit-transition-property: -webkit-transform, opacity;
        transition-property: transform, opacity;
        color: #3d4145;
        display: none;
        overflow: auto;
    }

    .gj-modal.modal-in {
        display: block;
        max-height: 90%;
        opacity: 1;
        -webkit-transition-duration: 400ms;
        transition-duration: 400ms;
        -webkit-transform: translate(0, -50%) scale(1);
        transform: translate(0, -50%) scale(1);
    }

    .gj-modal.modal-info {
        background: #fff;
    }

    .gj-modal.modal-info .modal-body {
        max-height: 100%;
        padding: 1.5rem 1rem;
        font-size: 0.75rem;
        line-height: 1.125rem;
        color: #444;
        text-align: left;
        word-break: break-word;
        overflow: hidden;
    }

    .gj-modal.modal-info .modal-footer {
        height: 2.2rem;
        line-height: 2.2rem;
        text-align: center;
        border-top: 1px #e5e5e5 solid;
        background-color: #FFF;
    }

    .gj-modal.modal-info .modal-footer a {
        color: #ff6350;
    }

    .gj-modal.modal-status {
        background: #fff;
        width: 11.5rem;
        margin-left: -5.75rem;
    }

    .gj-modal.modal-status .status-img {
        width: 3.875rem;
        margin: 0 auto;
        margin-top: 0.875rem;
        margin-bottom: 0.5rem;
    }

    .gj-modal.modal-status .status-img img {
        width: 100%;
        height: auto;
        display: block;
    }

    .gj-modal.modal-status .status-text {
        color: #444;
        font-size: 0.95rem;
        margin-bottom: 1.17rem;
    }

    /*l-alert*/
    .l-alert {
        &.mask {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 99999999999;
            background-color: rgba(0, 0, 0, .3);
        }
        &-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            min-width: 200px;
            min-height: 100px;
            display: flex;
            flex-flow: column;
            justify-content: center;
            background-color: #FFF;
            border-radius: 5px;
            & > div {
                position: relative;
                flex: 1;
                text-align: center;
            }
            p {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        }
        &-btns {
            display: flex;
            text-align: center;
            border-top: 1px solid #efefef;
            &__submit {
                flex: 1;
                line-height: 35px;
                text-decoration: none;
                color: #1192d4;
            }
        }
        &-pop-enter-active, &-pop-leave-active {
            transition: opacity .3s
        }
        &-pop-enter, &-pop-leave-active {
            opacity: 0;
        }
    }
</style>
<!--endregion-->
