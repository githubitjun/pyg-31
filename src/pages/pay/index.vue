<template>
  <div>
    <!-- 1.收获地址选择 -->
    <view @click="chooseAddress" class="address">
      <view v-if="address" class="address-info">
        <view class="address-info-name-phone">
          <view>
            <text style="font-size:12px;">收货人：{{address.userName}}</text>
          </view>
          <view style="display:flex;align-items: center;">
            <text style="margin-right:36rpx;font-size:12px;">{{address.telNumber}}</text>
            <view class="iconfont-tap icon-jiantouyou"></view>
          </view>
        </view>
        <view class="address-info-detail-info">
          <text style="font-size:12px;">收货地址：{{address.detailAddress}}</text>
        </view>
      </view>
      <view v-else class="address-add">
        <text style="font-size:12px;">+ 新增地址</text>
      </view>
      <view class="address-pic">
        <image src="/static/img/cart_border@2x.png" />
      </view>
    </view>
    <!-- 2.0 购买的商品列表 -->
    <view class="order-list">
      <block v-for="item in goodsList" :key="item.goods_id">
        <view class="product-item">
          <navigator class="product-left">
            <image :src="item.goods_small_logo" />
          </navigator>
          <view class="product-right">
            <navigator class="product-name">{{item.goods_name}}</navigator>
            <view class="product-right-price">
              <text class="product-right-price-symbol">￥</text>
              <text class="product-right-price-integer">{{item.goods_price}}</text>
              <text class="product-right-price-decimal">.00</text>
            </view>
            <view class="product-right-num">x{{item.goods_number}}</view>
          </view>
        </view>
      </block>
    </view>
     <!-- 3.0 金额统计 -->
    <view class="order-total">
      <view class="order-total-item">
        <text>商品金额</text>
        <text class="order-total-item-price">￥{{totalAmount}}</text>
      </view>
      <view class="order-total-item">
        <text>运 费</text>
        <text class="order-total-item-price">￥+0.00</text>
      </view>
      <block v-if="token">
        <view @click="goToOrder" class="wxPay">微信支付</view>
      </block>
      <block v-else>
        <button @getuserinfo="wxLogin" open-type="getUserInfo" class="wxLogin">登录后下单支付</button>
      </block>
    </view>
  </div>
</template>

<script>
import { getLocalGoods } from "../common/shopcartStorage";
import chooseAddress from '../../mixins/chooseAdress'
export default {
  mixins:[chooseAddress],
  data() {
    return {
      goodsList: [],
      token:null, // 登录之后获取到的token值
      totalAmount:0
    };
  },
  onLoad(options) {
    this.getGoodsListData(options.ids)

    if (wx.getStorageSync('address')){
      this.address = wx.getStorageSync('address')
    }

    // 去本地查找之前是否登录过
    if (wx.getStorageSync('token')){
      this.token = wx.getStorageSync('token')
    }

    // 提前进行 wx.login  避免刷新登录态
    wx.login({
      success: res => {}
    })
  },
  methods: {
    async getGoodsListData(ids) {
      // 去本地获取商品
      const localGoods = getLocalGoods();

      const res = await this.$axios.get(`goods/goodslist?goods_ids=${ids}`);

      res.data.message.forEach(item => {
        item.goods_number = localGoods[item.goods_id];
         this.totalAmount += item.goods_number * item.goods_price
      });

      // 先处理好数据，再赋值
      this.goodsList = res.data.message;
    },
    // 微信登录
    wxLogin(e){
      // 如果用户拒绝了，就没有必要再往下走了
      if (e.mp.detail.errMsg === 'getUserInfo:fail auth deny') return

      // 把用户信息存起来，我的页面中要使用到
      wx.setStorageSync('userInfo',e.mp.detail.userInfo)

      // 判断用户的登录态是否还有效
      /**
      const res = await new Promise((resolve,reject) => {
        wx.checkSession({
          success: res => {
            resolve(res)
          },
          fail: err => {
            reject(err)
          },
          complete: () => {}
        })
      })

      // 获取code的值
      const res1 = await new Promise((resolve,reject) => {
        wx.login({
          success: function(res){
            resolve(res)
          },
          fail: function(err) {
            reject(err)
          }
        })
      })
      */

      wx.login({
        success: async res => {
          // 获取的用户信息
          const {encryptedData,iv,rawData,signature} = e.mp.detail
          // 进行微信登录
          const res2 = await this.$axios.post('users/wxlogin',{
            code:res.code,
            encryptedData,
            iv,
            rawData,
            signature
          })

          // 登录成功之后
          if (res2.statusCode === 200){
            // 赋值token给模型
            this.token = res2.data.message.token

            // 保存起来
            wx.setStorageSync('token',res2.data.message.token)
          }
        }
      })
    },
    // 下单
    async goToOrder(){
      if (!this.address) {
        wx.showToast({
          title: '请选择收货地址', //提示的内容,
          icon: 'none', //图标,
          duration: 2000, //延迟时间
        });
        return
      }

      // 准备后台需要的参数，放在请求体中
      const params = {
        order_price:this.totalAmount, // 总价格
        consignee_addr:`${this.address.detailAddress} ${this.address.userName} ${this.address.telNumber}`, // 收货地址
        goods:this.goodsList.map(item => {
          return {
            goods_id:item.goods_id,
            goods_price:item.goods_price,
            goods_number:item.goods_number
          }
        })
      }

      // const res = await this.$axios.post('my/orders/create',params)
      // console.log(res.data)

      this.pay("HMDD20190624000000001102")
    },
    // 支付
    async pay(order_number){
      const res = await this.$axios.post('my/orders/req_unifiedorder',{
        order_number
      })

      // 唤起微信支付
      wx.requestPayment({
        timeStamp: res.data.message.pay.timeStamp,
        nonceStr: res.data.message.pay.nonceStr,
        package: res.data.message.pay.package,
        signType: res.data.message.pay.signType,
        paySign: res.data.message.pay.paySign,
        success: async res => {
          // success
          // 调用后台的接口，更改订单状态为已支付
          const res2 = await this.$axios.post('my/orders/chkOrder',{
            order_number
          })

          // 跳转到订单列表页面，type = 3
          if (res2.data.meta.status === 200){
            // 支付成功之后的提示
            wx.showToast({
                title: '支付成功', //提示的内容,
                icon: 'none', //图标,
                image:'/static/img/duigou.png',
                duration: 2000, //延迟时间,
                mask: true, //显示透明蒙层，防止触摸穿透,
                success: res => {}
            })

            setTimeout(() => {
              wx.navigateTo({ url: '/pages/orders/main?type=3' })
            }, 2000)
          }
        },
        fail: ({errMsg}) => {
          // fail
          if (errMsg === 'requestPayment:fail cancel'){
            wx.showToast({
              title: '您取消了支付', //提示的内容,
              icon: 'none', //图标,
              image:'/static/img/error2.png',
              duration: 2000, //延迟时间,
              mask: true, //显示透明蒙层，防止触摸穿透,
              success: res => {}
            })

            setTimeout(() => {
              wx.navigateTo({ url: '/pages/orders/main?type=2' })
            }, 2000)
          }
        },
        complete: function() {
          // complete
        }
      })
    }
  }
};
</script>

<style scoped lang="less">
.address {
  height: 222rpx;
  background-color: #fff;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  &-info {
    display: flex;
    height: 160rpx;
    flex: 1;
    flex-direction: column;
    justify-content: space-around;
    &-name-phone {
      display: flex;
      justify-content: space-between;
      padding: 0rpx 30rpx;
    }
    &-detail-info {
      padding: 0rpx 30rpx;
    }
  }
  &-add {
    width: 360rpx;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    margin: 100px auto;
    color: #999;
    background-color: #f4f4f4;
  }
  &-pic {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 750rpx;
    height: 15rpx;
    image {
      width: 100%;
      height: 100%;
    }
  }
}
.iconfont-tap {
  font-family: "iconfont" !important;
  font-size: 32rpx;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  min-width: 88rpx;
  min-height: 88rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
.icon-jiantouyou {
  position: absolute;
  top: 32rpx;
  right: 0;
}
.icon-jiantouyou:before {
  font-size: 24rpx;
  color: #999;
  line-height: 1;
  width: 15rpx;
  height: 25rpx;
}
.order-list {
  background-color: #fff;
}
.product-item {
  display: flex;
  padding: 30rpx 20rpx;
  position: relative;
  &::after {
    content: "";
    position: absolute;
    left: 20rpx;
    right: 0;
    bottom: 0;
    border-bottom: 1rpx solid #ddd;
  }
  .product-left {
    width: 200rpx;
    height: 200rpx;
    background-color: #eee;
    margin-right: 26rpx;
    image {
      width: 100%;
      height: 100%;
    }
  }
  .product-right {
    width: 480rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    .product-name {
      height: 84rpx;
      font-size: 30rpx;
      line-height: 1.4;
      /* 多行文字隐藏省略号 */
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
    &-price {
      text {
        color: #ff2d4a;
      }
      &-symbol,
      &-decimal {
        font-size: 28rpx;
      }
      &-integer {
        font-size: 44rpx;
      }
    }
    &-num {
      position: absolute;
      right: 0;
      bottom: 0;
      letter-spacing: 2rpx;
      color: #999;
    }
  }
}
.order-total {
  background-color: #fff;
  margin-top: 20rpx;
  height: 300rpx;
  &-item {
    height: 80rpx;
    display: flex;
    align-items: center;
    padding: 0rpx 30rpx;
    justify-content: space-between;
    &-price {
      color: #ff2d4a;
    }
  }
}
.wxLogin {
  margin-top: 10rpx;
  width: 720rpx;
}
.wxPay {
  margin-top: 10rpx;
  margin-left: 15rpx;
  width: 720rpx;
  background-color: #00c000;
  display: flex;
  height: 80rpx;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 32rpx;
  border-radius: 5rpx;
}
</style>

