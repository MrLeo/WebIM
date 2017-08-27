/**
 * @Date: 2017/8/27  15:40
 * @Author: leo
 * http://xuebin.me/
 * Created with JetBrains WebStorm.
 */
export default {
    //获取路径参数
    getQueryString: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
}