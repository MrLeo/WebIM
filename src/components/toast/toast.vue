/**
* @Date: 2016/10/31  0031  12:26
* @Author: lxbin
* Created with JetBrains WebStorm.
*/
<template>
    <transition name="mint-toast-pop">
        <div class="mint-toast" v-show="visible" :class="customClass"
             :style="{ 'padding': icon === '' ? '10px' : '20px' }">
            <!--<i class="mint-toast-icon" v-if="icon !== ''" :class="icon"></i>-->
            <div class="loading-effect" v-if="icon !== '' && icon === 'loading'">
                <template v-if="icon === 'loading'">
                    <span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                </template>
                <img class="mint-toast-icon" v-else :src="icon">
            </div>
            <span class="mint-toast-text" v-if="!!message"
                  :style="{ 'padding-top': icon === '' ? '0' : '10px' }">{{ message }}</span>
        </div>
    </transition>
</template>
<script>
    export default {
        props: {
            message: String,
            className: {
                type: String,
                default: ''
            },
            position: {
                type: String,
                default: 'middle'
            },
            icon: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                visible: false
            };
        },
        computed: {
            customClass() {
                var classes = [];
                switch (this.position) {
                    case 'top':
                        classes.push('is-placetop');
                        break;
                    case 'bottom':
                        classes.push('is-placebottom');
                        break;
                    default:
                        classes.push('is-placemiddle');
                }
                classes.push(this.className);
                return classes.join(' ');
            }
        }
    };
</script>
<style scoped lang="scss" rel="stylesheet/scss">
    .mint {
        &-toast {
            position: absolute;
            max-width: 80%;
            border-radius: 5px;
            background: rgba(0, 0, 0, 0.7);
            color: #fff;
            box-sizing: border-box;
            text-align: center;
            z-index: 10000;
            transition: opacity .3s linear;
            &-icon {
                width: 100%;
            }
            &-text {
                font-size: 14px;
                display: block;
                text-align: center;
            }
            &.is-placetop {
                top: 50px;
                left: 50%;
                transform: translate(-50%, 0);
            }
            &.is-placemiddle {
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }
            &.is-placebottom {
                bottom: 50px;
                left: 50%;
                transform: translate(-50%, 0);
            }
            &-pop-enter-active, &-pop-leave-active {
                transition: opacity .5s
            }
            &-pop-enter, &-pop-leave-active {
                opacity: 0;
            }
        }
    }

    .loading-effect {
        position: relative;
        left: 50%;
        -webkit-transform: translateX(-50%);
        -ms-transform: translateX(-50%);
        transform: translateX(-50%);
        width: 55px;
        height: 55px;
        /*margin: 0.9rem 0*/
    }

    .loading-effect span {
        position: absolute;
        display: inline-block;
        width: 15px;
        height: 5px;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
        background: #FFF;
        -webkit-animation: load 1.04s ease infinite;
        animation: load 1.04s ease infinite
    }

    .loading-effect span:nth-child(1) {
        left: 0;
        top: 50%;
        margin-top: -2.5px;
        -webkit-animation-delay: 0.13s;
        animation-delay: 0.13s
    }

    .loading-effect span:nth-child(2) {
        left: 5.5px;
        top: 10.5px;
        -webkit-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        transform: rotate(45deg);
        -webkit-animation-delay: 0.26s;
        animation-delay: 0.26s
    }

    .loading-effect span:nth-child(3) {
        left: 50%;
        top: 5px;
        margin-left: -7.5px;
        -webkit-transform: rotate(90deg);
        -ms-transform: rotate(90deg);
        transform: rotate(90deg);
        -webkit-animation-delay: 0.39s;
        animation-delay: 0.39s
    }

    .loading-effect span:nth-child(4) {
        top: 10.5px;
        right: 5.5px;
        -webkit-transform: rotate(135deg);
        -ms-transform: rotate(135deg);
        transform: rotate(135deg);
        -webkit-animation-delay: 0.52s;
        animation-delay: 0.52s
    }

    .loading-effect span:nth-child(5) {
        right: 0;
        top: 50%;
        margin-top: -2.5px;
        -webkit-transform: rotate(180deg);
        -ms-transform: rotate(180deg);
        transform: rotate(180deg);
        -webkit-animation-delay: 0.65s;
        animation-delay: 0.65s
    }

    .loading-effect span:nth-child(6) {
        right: 5.5px;
        bottom: 10.5px;
        -webkit-transform: rotate(225deg);
        -ms-transform: rotate(225deg);
        transform: rotate(225deg);
        -webkit-animation-delay: 0.78s;
        animation-delay: 0.78s
    }

    .loading-effect span:nth-child(7) {
        bottom: 5px;
        left: 50%;
        margin-left: -7.5px;
        -webkit-transform: rotate(270deg);
        -ms-transform: rotate(270deg);
        transform: rotate(270deg);
        -webkit-animation-delay: 0.91s;
        animation-delay: 0.91s
    }

    .loading-effect span:nth-child(8) {
        bottom: 10.5px;
        left: 5.5px;
        -webkit-transform: rotate(315deg);
        -ms-transform: rotate(315deg);
        transform: rotate(315deg);
        -webkit-animation-delay: 1.04s;
        animation-delay: 1.04s
    }

    @-webkit-keyframes load {
        0% {
            opacity: 1
        }
        100% {
            opacity: 0.2
        }
    }
</style>
