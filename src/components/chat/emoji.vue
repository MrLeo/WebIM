<!--
* @Date: 2017/8/17  09:53
* @Author: leo
* http://xuebin.me/
* Created with JetBrains WebStorm.
-->
<template lang="pug">
    img(:src="'./static/images/faces/' + data")
</template>

<script>
    export default {
        props: ['data'],
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
</style>
