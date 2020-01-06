<template>
  <div>
    <view class="empty-car" v-if="isEmpty">
      <image src="/static/img/kong.png"/>
      <text class="empty-car-tips ">购物车还是空的</text>
      <text class="empty-car-tips extra">快去逛逛吧</text>
    </view>
    <view v-else>
      <!-- 头部 -->
      <view class="shop-head">
        <view class="shop-head-info">
          <i class="iconfont icon-shop flex-center icon-dianpu"/>
          <text class="shop-name">品优购生活馆</text>
        </view>
      </view>
      <!-- 内容区域 -->
      <view class="goods-item" v-for="item in goodsList" :key="item.goods_id">
        <!-- 左边的选中 & 非选中状态 -->
        <view @click="toggleSelect(item)" :class="['pubIcon',item.isSelect ? 'trueIcon' : 'falseIcon']"></view>
        <!-- 中间的图片 -->
        <view class="goods-item-pic">
          <image :src="item.goods_small_logo" />
        </view>
        <!-- 右边的商品信息 -->
        <view class="goods-item-info">
          <text class="goods-item-info-title">{{item.goods_name}}</text>
          <text class="goods-item-info-price">￥{{item.goods_price}}</text>
          <view class="goods-item-info-edit">
            <view class="outer">
              <view :style="{'color':item.goods_number == 1 ? '#ccc' : 'black'}" @click="substrict(item)">-</view>
              <view class="value">
                <input
                  style="font-size:12px;color:#999;"
                  v-model="item.goods_number"
                  @input="changeValue(item)"
                  type="number"
                /></view>
              <view @click="add(item)" class="add">+</view>
            </view>
            <text @click="deleteGoods(item.goods_id)">| 删除</text>
          </view>
        </view>
      </view>
      <!-- 底部工具条 -->
      <view class="fixed-bar">
        <view @click="toggleAllSelect" class="allselect">
          <view :class="['pubIcon',isAllSelect ? 'trueIcon':'falseIcon']"></view><text>全选</text>
        </view>
        <view class="statistics">
          <view>
            <text>合计：</text>
            <text style="color:red;font-size:15px;">￥{{getTotalPrice}}</text>
          </view>
          <text>包含运费</text>
        </view>
        <view @click="goToPay" :class="['jiesuan',getTotalCount === 0 ? 'disabled':'']">
          <text>去结算({{getTotalCount}})</text>
        </view>
      </view>
    </view>
  </div>
</template>

<script>
import {getLocalGoods,updateGoods,deleteGoods} from '../common/shopcartStorage'
export default {
  data(){
    return {
      goodsList:[], // 商品列表
      isEmpty:true, // 是否为空
      isAllSelect:true // 是否全选
    }
  },
  onShow(){
    this.getShopCartData()
  },
  computed: {
    // 获取总数量
    getTotalCount(){
      let totalCount = 0
      this.goodsList.forEach(item => {
        if (item.isSelect) {
          totalCount += item.goods_number
        }
      })

      return totalCount
    },
    // 获取总价格
    getTotalPrice(){
      let totalPrice = 0
      this.goodsList.forEach(item => {
        if (item.isSelect) {
          totalPrice += item.goods_number * item.goods_price
        }
      })

      return totalPrice
    },
  },
  methods:{
    async getShopCartData(){
      //1、获取本地存储的商品
      const localGoods = getLocalGoods()

      //2、把本地存储商品的id获取出来
      const ids = Object.keys(localGoods)
      if (ids.length === 0){
        this.isEmpty = true
        return
      }

      this.isEmpty = false

      //3、发送网络请求
      const res = await this.$axios.get(`goods/goodslist?goods_ids=${ids.join(',')}`)

      res.data.message.forEach(item => {
        item.goods_number = localGoods[item.goods_id]
        item.isSelect = true
      })

      this.goodsList = res.data.message
    },
    // 全选 和 反选
    toggleAllSelect(){
      this.isAllSelect = !this.isAllSelect

      this.goodsList.forEach(item => {
        item.isSelect = this.isAllSelect
      })
    },
    // 具体某一行的选中 & 非选中
    toggleSelect(item){
      // 自身取反
      item.isSelect = !item.isSelect

      // 假设他都是选中的
      let allSelect = true
      this.goodsList.some(item => {
        if (!item.isSelect) {
          allSelect = false

          // 代表结束当前渲染
          return true
        }
      })
      this.isAllSelect = allSelect
    },
    substrict(item){
      item.goods_number--

      updateGoods({
        goods_id:item.goods_id,
        goods_number:item.goods_number
      })
    },
    add(item){
      item.goods_number++

      updateGoods({
        goods_id:item.goods_id,
        goods_number:item.goods_number
      })
    },
    deleteGoods(goods_id){
      wx.showModal({
        title: '提示', //提示的标题,
        content: '确定删除吗？', //提示的内容,
        showCancel: true, //是否显示取消按钮,
        cancelText: '取消', //取消按钮的文字，默认为取消，最多 4 个字符,
        cancelColor: '#000000', //取消按钮的文字颜色,
        confirmText: '确定', //确定按钮的文字，默认为取消，最多 4 个字符,
        confirmColor: '#ff2d4a', //确定按钮的文字颜色,
        success: res => {
          if (res.confirm) {
            // 1、删除本地
            deleteGoods(goods_id)

            // 2、删除列表中的内容
            const deleteIndex = this.goodsList.findIndex(item => item.goods_id === goods_id )
            this.goodsList.splice(deleteIndex,1)

            // 3、判断是否为空，如果为空，则显示提示
            this.isEmpty = this.goodsList.length === 0
          } else if (res.cancel) {
          }
        }
      });
    },
    goToPay(){
      const ids = []
      this.goodsList.forEach(item => {
        if (item.isSelect) {
          ids.push(item.goods_id)
        }
      })

      if (ids.length === 0){
        wx.showToast({
          title: '请选择商品结算', //提示的内容,
          icon: 'none', //图标,
          duration: 2000, //延迟时间,
          mask: true, //显示透明蒙层，防止触摸穿透,
          success: res => {}
        });
        return
      }

      // 编程式导航跳转过去
      wx.navigateTo({ url: `/pages/pay/main?ids=${ids.join(',')}` });
    }
  }
}
</script>

<style lang="less" scoped>
@PADDING-LEFT: 20rpx;
.empty-car {
  display: flex;
  flex-direction: column;
  height: 500rpx;
  justify-content: center;
  align-items: center;
  image {
    width: 125rpx;
    height: 124rpx;
  }
  &-tips {
    margin-top: 30rpx;
    font-size: 28rpx;
    color: #666;
  }
}
.extra {
  font-size: 24rpx;
  color: #999;
}
.shop-head {
  background-color: #fff;
  height: 88rpx;
  display: flex;
  align-items: center;
  padding: 0 @PADDING-LEFT;
  border-bottom: 1px solid #ddd;
  &-info {
    display: flex;
    align-items: center;
    .shop-name {
      margin-left: 10rpx;
      color:#333;
    }
  }
}
.goods-item {
  height: 220rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding-left: @PADDING-LEFT;
  border-bottom: 1px solid #eee;
  &-pic {
    width: 160rpx;
    height: 160rpx;
    margin-left: 10rpx;
    border: 1px solid #ddd;
    padding: 10rpx;
    border-radius: 5rpx;
    image {
      width: 100%;
      height: 100%;
    }
  }
  &-info {
    flex: 1;
    height: 180rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0rpx @PADDING-LEFT;
    &-title {
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
    &-price {
      color: #ff2d4a;
      font-size: 30rpx;
    }
    &-edit {
      display: flex;
      justify-content: space-between;
      .outer {
        border: 1px solid #ddd;
        display: flex;
        align-items: center;
        border-radius: 5rpx;
        view {
          height: 50rpx;
          width: 50rpx;
          line-height: 50rpx;
          text-align: center;
        }
        .value {
          width: 65rpx;
          border-left: 1px solid #ddd;
        }
        .add {
          border-left: 1px solid #ddd;
        }
      }
    }
  }
}
.pubIcon {
  background: url(https://mcart.jiuxian.com/statics/images/cart/catIcon.png)
    no-repeat 0 0;
  background-size: 300rpx 300rpx;
  width: 55rpx;
  height: 55rpx;
}
.trueIcon {
  background-position: 0 -225rpx;
}
.falseIcon {
  background-position: -50rpx -225rpx;
}
.fixed-bar {
  display: flex;
  height: 98rpx;
  width: 750rpx;
  background-color: #fff;
  position: fixed;
  left: 0;
  bottom: 0;
  .allselect {
    padding-left: @PADDING-LEFT;
    width: 200rpx;
    height: 98rpx;
    display: flex;
    align-items: center;
  }
  .statistics {
    flex: 1;
    display: flex;
    // align-items: center;
    justify-content: center;
    flex-direction: column;
  }
  .jiesuan {
    width: 200rpx;
    height: 98rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ff2d4a;
    text {
      color: #fff;
    }
  }

  .disabled {
    background-color: #ddd;
  }
}
</style>
