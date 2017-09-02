<!--
* @Date: 2017/9/2  15:16
* @Author: leo
* http://xuebin.me/
* Created with JetBrains WebStorm.
-->
<template lang="pug">
  .page
    mt-header(fixed,:title="title")
    main
      mt-loadmore(:top-method="loadTop", :bottom-method="loadBottom", :bottom-all-loaded="allLoaded", ref="loadmore")
        ul.list
          li.list__item(v-for="(value,key,index) in doctors",@click="toNextPage(value)")
            mt-cell(:title="value.user_name")
              span.noread(v-if="!!value.noread") {{value.noread}}
              img(slot="icon", :src="value.avatar || require('../assets/img/header.jpg')", width="24", height="24")
    transition(name="slide")
      router-view(class="child-view")
</template>

<script>
  import {Header, Button, Loadmore, Cell, MessageBox, Popup} from 'mint-ui'
  import WebIM from 'WebIM'
  import axios from 'axios'
  import uri from '../utils/url'

  export default {
    components: {
      [Header.name]: Header,
      [Loadmore.name]: Loadmore,
      [Cell.name]: Cell,
      [MessageBox.name]: MessageBox,
      [Button.name]: Button,
      [Popup.name]: Popup,
    },
    data: () => ({
      title: '',
      allLoaded: false,//底部数据全部获取完毕
      doctors: {}
    }),
    created() {
      this.$set(this, 'doctors', this.$$vm.doctors)
      this.title = this.$$vm.user.name

      this.$$vm.$watch('doctors', function (val, oldVal) {
        console.log('[Leo]医生列表改变=>', val)
        this.$set(this, 'doctors', val)
      })
    },
    mounted() {
    },
    watch: {},
    computed: {},
    methods: {

      toNextPage(item) {
        this.$router.push({
          path: '/chat',
          query: {'hxUser': item.hxUser, 'code': this.$$vm.code}
        })
      },
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
  @import "../assets/css/common";

  .list {
    display: flex;
    flex-flow: column;
    &__item {
      height: 50px;
      border-top: 1px solid #eee;
    }
  }

  .noread {
    display: block;
    width: 20px;
    height: 20px;
    background-color: #f00;
    border-radius: 50%;
    color: #FFF;
    text-align: center;
    line-height: 20px;
    font-size: 12px;
  }
</style>
