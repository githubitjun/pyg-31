<template>
  <div v-if="goods_detail">
    <!-- 1.0 轮播图 -->
    <swiper indicator-dots autoplay circular>
        <block v-for="item in goods_detail.pics" :key="item.pics_id">
            <swiper-item>
                <image mode="aspectFill" @click="preview(item.pics_mid)" :src="item.pics_mid"></image>
            </swiper-item>
        </block>
    </swiper>
        <!-- 2.0 商品的基本信息 -->
    <view class="product-info">
      <view class="product-head">
        <text class="price">￥{{goods_detail.goods_price}}</text>
      </view>
      <view class="product-body">
        <view class="product-name">{{goods_detail.goods_name}}</view>
        <view class="product-like">
          <view class="iconfont icon-shoucang"></view>
          <view>
            <text>收藏</text>
          </view>
        </view>
      </view>
      <view class="product-foot">
        <text>快递：免运费</text>
      </view>
    </view>
    <!-- 3.0 促销信息 -->
    <view class="part">
      <view class="part-item part-line">
        <text class="note">促销
        </text>
        <text class="color-main description">满300减30元
        </text>
      </view>
      <view class="part-item">
        <text class="note">已选
        </text>
        <text class="description">黑色/S/1件
        </text>
      </view>
    </view>
    <!-- 4.0 收获地址 -->
    <view
      class="part"
      @click="chooseAddress"
    >
      <view class="part-item">
        <text class="note">送至</text>
        <view v-if="address">
            {{address.provinceName}} {{address.cityName}} {{address.countyName}}
        </view>
        <view v-else>
          <text>请选择收货地址</text>
        </view>
        <view
          style="float:right;"
          class="iconfont icon-jiantouyou"
        ></view>
      </view>
    </view>
    <!-- 5.0 图文介绍和规则参数 -->
    <view class="tabs">
      <view class="tabs-head">
        <view @click="toggleSelect(index)" :class="['tabs-item',tabIndex === index ? 'active':'']" v-for="(item,index) in tabs" :key="item">
          <text>{{item}}</text>
        </view>
      </view>
      <view class="tabs-body">
        <!-- 图文介绍 -->
        <view v-show="tabIndex === 0">
          <div v-html="goods_detail.goods_introduce"></div>
        </view>
        <!-- 规格参数 -->
        <view v-show="tabIndex === 1">
          <view v-for="(item,index) in goods_detail.attrs" :key="item .attr_id" class="param-item">
            <text :class="['note',index === goods_detail.attrs.length-1?'param-item-last':'']">{{item.attr_name}}</text>
            <text :class="['description',index === goods_detail.attrs.length-1?'param-item-last':'']">{{item.attr_vals}}</text>
          </view>
        </view>
      </view>
    </view>
    <!-- 6.0 底部菜单条 -->
    <view class="fixed-bar">
      <view class="item">
        <button class="contact-btn" open-type="contact"></button>
        <view class="iconfont icon-kefu"></view>
        <text class="note">联系客服</text>
      </view>
      <view @click="goToShopCart" class="item">
        <view class="iconfont icon-gouwuche"></view>
        <text class="note">购物车</text>
      </view>
      <view class="btn-group">
        <view @click="addToShopCart" class="btn yellow-btn">加入购物车</view>
        <view class="btn red-btn">立即购买</view>
      </view>
    </view>
  </div>
</template>

<script>
import {addGoods} from '../common/shopcartStorage'
import chooseAddress from '../../mixins/chooseAdress'
export default {
  mixins:[chooseAddress],
  data(){
    return {
      goods_detail:null, // 商品详情数据
      tabs:['图文介绍','规格参数'],
      tabIndex:0 // tab选中的索引
    }
  },
  onLoad(options){
    // 获取商品详情的数据
    this.getGoodsDetailData(options.goods_id)

    // 从本地加载address赋值
    if (wx.getStorageSync('address')){
      this.address = wx.getStorageSync('address')
    }
  },
  methods:{
    async getGoodsDetailData(goods_id){
      const res = await this.$axios.get(`goods/detail?goods_id=${goods_id}`)

      this.goods_detail = res.data.message
    },
    // 图片预览
    preview(current){
      wx.previewImage({
        urls: this.goods_detail.pics.map(item  => item.pics_mid), //需要预览的图片链接列表,
        current
      })
    },
    // 切换tab
    toggleSelect(index){
      this.tabIndex = index
    },
    // 跳转到购物车页面
    goToShopCart(){
      wx.switchTab({ url: '/pages/shopcart/main' });
    },
    // 加入购物车
    addToShopCart(){
      wx.showToast({
        title: '加入购物车成功', //提示的内容,
        icon: 'none', //图标,
        image:'/static/img/duigou.png',
        duration: 2000, //延迟时间,
        mask: true, //显示透明蒙层，防止触摸穿透,
        success: res => {}
      });
      addGoods({
        goods_id:this.goods_detail.goods_id,
        goods_number:1
      })
    }
  }
}
</script>

<style lang="less" scoped>
swiper{
  width:750rpx;
  height: 400rpx;
  image{
    width:750rpx;
    height: 400rpx;
  }
}
.product-info {
  display: flex;
  flex-direction: column;
  height: 300rpx;
  background-color: #fff;
  padding: 0 16rpx;
}

.product-head {
  height: 38rpx;
  padding: 40rpx 0;
}

.product-head .price {
  color: #ff2d4a;
  font-size: 50rpx;
  // margin-left: 10rpx;
}

.product-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-body .product-name {
  font-size: 34rpx;
  width: 546rpx;
  height: 88rpx;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.product-body .product-like {
  width: 50rpx;
  height: 78rpx;
  border-left: 1rpx solid #ddd;
  padding-left: 46rpx;
  margin-right: 30rpx;
  color: #999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.product-foot {
  font-size: 30rpx;
  color: #999;
  margin-top: 34rpx;
}

.part {
  background-color: #fff;
  margin: 20rpx 0;
  font-size: 32rpx;
  color: #999;
  &-line:after {
    content: '';
    height: 1rpx;
    width: 734rpx;
    background-color: #ddd;
    display: block;
    position: absolute;
    bottom: -1rpx;
  }
  &-item {
    display: flex;
    padding: 28rpx 16rpx;
    position: relative;
    align-items: center;
    // justify-content: space-between;
  }
}
.part .note {
  color: #333;
  margin-right: 40rpx;
}

.part .description {
  width: 490rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: normal;
}
.part .color-main {
  color: #ff2d4a;
}

.tabs {
  &-head {
    height: 100rpx;
    background-color: #fff;
    display: flex;
    .active {
      color: #ff2d4a;
      font-weight: 400;
      &:after {
        content: '';
        height: 12rpx;
        width: 100%;
        background-color: #ff2d4a;
        position: absolute;
        left: 0;
        bottom: 0;
      }
    }
  }
  &-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    position: relative;
  }
  &-body {
    background-color: #fff;
    padding: 16rpx;
    margin-bottom: 100rpx;
  }
}
.param-item {
  display: flex;
  height: 100rpx;
  line-height: 100rpx;
  border-top: 1px solid rgba(92, 92, 92, 0.3);
  border-right: 1px solid rgba(92, 92, 92, 0.3);
  border-left: 1px solid rgba(92, 92, 92, 0.3);
}
.param-item .note {
  padding-left: 30rpx;
  width: 300rpx;
  border-right: 1px solid rgba(92, 92, 92, 0.3);
}

.param-item-last {
  border-bottom: 1px solid rgba(92, 92, 92, 0.3);
}

.param-item .description {
  padding-left: 30rpx;
  width: 400rpx;
}
.fixed-bar {
  width: 750rpx;
  height: 98rpx;
  background-color: #fff;
  position: fixed;
  bottom: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .btn-group {
    display: flex;
  }
  .btn {
    width: 213rpx;
    height: 98rpx;
    line-height: 98rpx;
    text-align: center;
    font-size: 30rpx;
    color: #fff;
  }
  .yellow-btn {
    background-color: #ffb400;
  }
  .red-btn {
    background-color: #ff2d4a;
  }
  .item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    .contact-btn {
      opacity: 0;
      position: absolute;
      width: 100%;
      height: 100%;
    }
    .iconfont {
      width: 40rpx;
      height: 40rpx;
      font-size: 40rpx;
    }
    .note {
      margin-top: 10rpx;
      font-size: 22rpx;
      color: #666;
    }
  }
}
.iconfont .icon-shoucang {
  font-size: 50px;
  color: '#ff2d4a' !important;
}

.iconfont .icon-shoucang-fill {
  font-size: 50px;
  color: '#ff2d4a' !important;
}
</style>

