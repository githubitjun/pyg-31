<template>
  <div class="categories">
    <scroll-view :style="{height:windowHeight+'px;'}" class="categories-left" scroll-y>
      <div @click="toggleSelect(index)" :class="['categories-left-item',selectIndex === index ? 'categories-left-active':'']" v-for="(item,index) in categories" :key="item.cat_id">
        <text>{{item.cat_name}}</text>
      </div>
    </scroll-view>
    <scroll-view :style="{height:windowHeight+'px;'}" class="categories-right" scroll-y>
      <div class="categories-right-item" v-for="item in secondLevelCategories" :key="item.cat_id">
        <!-- 二级分类的标题 -->
        <div class="categories-right-item-title">
          <text>{{item.cat_name}}</text>
        </div>
        <!-- 三级分类 -->
        <div class="categories-right-item-body">
          <div class="right-body-item" v-for="(subitem,index2) in item.children" :key="index2">
            <image :src="subitem.cat_icon"/>
            <span class="right-body-item-title">{{subitem.cat_name}}</span>
          </div>
        </div>
      </div>
    </scroll-view>
  </div>
</template>

<script>
export default {
  data(){
    return {
      categories:[],
      secondLevelCategories:[],// 二级分类
      selectIndex:0, // 大分类选中的索引
      windowHeight:0 // 可使用的高度，除去了window和tabBar
    }
  },
  onLoad(){
    this.getCatetoryData()

    const {windowHeight} = wx.getSystemInfoSync()
    this.windowHeight = windowHeight - 10
  },
  methods:{
    async getCatetoryData(){
      const res = await this.$axios.get('categories')

      this.categories = res.data.message

      // 给大家电的二级分类赋值
      this.secondLevelCategories = this.categories[0].children
    },
    // 切换选中的一级分类
    toggleSelect(index){
      this.selectIndex = index

      // 给选中的一级分类赋值二级分类
      this.secondLevelCategories = this.categories[index].children
    }
  }
}
</script>

<style lang="less" scoped>
.categories {
  display: flex;
  margin-top: 10px;
  &-left {
    width: 200rpx;
    display: flex;
    flex-direction: column;
    // justify-content: center;
    align-items: center;
    background-color: #f4f4f4;
    &-item {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 200rpx;
      height: 100rpx;
      position: relative;
      text{
        color:#999;
      }
    }
    &-active {
      background: #fff;
      text{
        color:#000;
      }
      &::before {
        position: absolute;
        content: '';
        background-color: #ff2d4a;
        left: 0;
        top: 10rpx;
        width: 5px;
        height: 80rpx;
      }
    }
  }
  &-right {
    flex: 1;
    background-color: #fff;
    &-item {
      &-title {
        display: flex;
        justify-content: center;
        align-items: center;
        color:#666;
        font-size: 14px;
        &::before {
          content: '/';
          color: #eeeeee;
          margin-right: 20rpx;
        }

        &::after {
          content: '/';
          color: #eeeeee;
          margin-left: 20rpx;
        }
      }
      &-body {
        display: flex;
        flex-wrap: wrap;
      }
    }
  }
}
image {
  width: 100rpx;
  height: 80rpx;
}
.right-body-item {
  height: 200rpx;
  width: 33.33333%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &-title{
    margin-top:5rpx;
    color:#666;
    font-size: 14px;
  }
}
</style>

