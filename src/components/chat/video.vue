<!--
* @Date: 2017/8/17  10:00
* @Author: leo
* http://xuebin.me/
* Created with JetBrains WebStorm.
-->
<template lang="pug">
    video(:src="data", controls, autoplay)
</template>

<script>
    export default {
        props:['data']
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
</style>
