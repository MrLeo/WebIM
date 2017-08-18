<!--
* @Date: 2017/8/17  09:56
* @Author: leo
* http://xuebin.me/
* Created with JetBrains WebStorm.
-->
<template lang="pug">
    img(:src="data", :data-url="data", @click="previewImage")
</template>

<script>
    export default {
        props: ['data'],
        methods: {
            previewImage() {
                this.$emit('previewImage', this.data)
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
</style>
