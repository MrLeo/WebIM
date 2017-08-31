<template lang="pug">
    #app
        router-view
</template>

<script>
    import {mapState, mapGetters, mapMutations, mapActions} from 'vuex'
    import * as types from './store/mutation-types'
    export default {
        name: 'app',
        mounted() {
//            this.$store.dispatch('initIm')
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
