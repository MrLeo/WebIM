<template lang="pug">
    #app
        router-view
</template>

<script>
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
</style>
