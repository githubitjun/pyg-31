<template>
  <div>
    <!-- 1.0 轮播图 -->
    <swiper indicator-dots autoplay circular>
        <block v-for="item in swiperdata" :key="item.id">
          <navigator :url="item.navigator_url">
            <swiper-item>
                <image mode="aspectFill" :src="item.image_src"></image>
            </swiper-item>
          </navigator>
        </block>
    </swiper>
    <!-- 2.0 菜单 -->
    <div class="categories">
      <div v-for="item in catitems" :key="item.id" class="category-item ">
        <image :src="item.image_src"/>
      </div>
    </div>
    <!-- 3.0 楼层数据 -->
    <div>
      <div v-for="(item,index) in floordata" :key="index" class="floor">
        <!-- 头部 -->
        <div class="floor-head">
          <image :src="item.floor_title.image_src"/>
        </div>
        <!-- body -->
        <div class="floor-body">
          <!-- 左边 -->
          <div class="floor-body-left">
            <image :src="item.product_list[0].image_src"/>
          </div>
          <!-- 右边 -->
          <div class="floor-body-right">
            <div v-if="index2 > 0" :style="{width:subitem.image_width+'rpx'}" v-for="(subitem,index2) in item.product_list" :key="index2" class="floor-body-right-img">
              <image style="width:100%;height:100%;" :src="subitem.image_src"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 4.0 到底提示 -->
    <div class="end-tips">
      <i class="iconfont icon-xiao"/>
      <span class="bottomline">我是有底线的哦~</span>
    </div>
    <!-- 5.0 回到顶部 -->
    <div v-show="isShowGoToTop">
      <div @click="goToTop" class="to-top">
        <image src="/static/img/arrow_top@2x.png"/>
        <text>顶部</text>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data(){
    return {
      swiperdata:[], // 轮播图数据
      catitems:[], // 菜单数组
      floordata:[], // 楼层数据
      isShowGoToTop:false
    }
  },
  onLoad(){
    // 加载轮播图数据
    this.getSwiperdata()

    // 加载菜单数据
    this.getCatitems()

    // 加载楼层数据
    this.getFloordata()
  },
  onPageScroll({scrollTop}){
    if (scrollTop > 80) {
      if (this.isShowGoToTop) return
      this.isShowGoToTop = true
    } else {
      if (!this.isShowGoToTop) return
      this.isShowGoToTop = false
    }
  },
  methods:{
    async getSwiperdata(){
      const res = await this.$axios.get('home/swiperdata')

      this.swiperdata = res.data.message
    },
    async getCatitems(){
      const res = await this.$axios.get('home/catitems')

      this.catitems = res.data.message
    },
    async getFloordata(){
      const res = await this.$axios.get('home/floordata')

      this.floordata = res.data.message
    },
    // 回到顶部
    goToTop(){
      mpvue.pageScrollTo({
        scrollTop:0,
        duration:300
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
    width:100%;
    height: 100%;
  }
}
.categories {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: #ffffff;
  height: 150rpx;
  .category-item {
    width: 120rpx;
    height: 120rpx;
    image {
      width: 100%;
      height: 100%;
    }
  }
}
.floor {
  margin-top: 20rpx;
  background-color: white;
  &-head {
    width: 750rpx;
    height: 59rpx;
    image {
      margin: 10rpx 0rpx 0rpx 10rpx;
      width: 100%;
      height: 100%;
    }
  }
  &-body {
    display: flex;
    padding: 20rpx 16rpx 10rpx 16rpx;
    &-left {
      width: 232rpx;
      height: 386rpx;
      image {
        width: 100%;
        height: 100%;
      }
    }
    &-right {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      &-img {
        height: 188rpx;
        margin: 0 0 10rpx 10rpx;
      }
    }
  }
}
.end-tips {
  display: flex;
  height: 100rpx;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #888;
  .bottomline {
    margin-left: 5rpx;
  }
}
.to-top {
  width: 90rpx;
  height: 90rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  position: fixed;
  right: 40rpx;
  bottom: 50rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  image {
    width: 24rpx;
    height: 14rpx;
  }
  text {
    margin-top: 20rpx;
    color: #999;
  }
}
</style>

