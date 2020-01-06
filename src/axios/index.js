import Vue from 'vue'
import axios from 'axios'

axios.defaults.baseURL = "https://www.zhengzhicheng.cn/api/public/v1/"

// 拦截器
axios.interceptors.request.use(function (config) {
  if (wx.getStorageSync('token')){
    config.headers.Authorization = wx.getStorageSync('token')
  }
  // 在发送请求之前做些什么
  return config
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
})

// 适配器 替换到底层发送网络请求的方式
axios.defaults.adapter = function (config) {
  return new Promise((resolve,reject) => {
    wx.showLoading({
      title: '正在加载中...', //提示的内容,
      mask: true, //显示透明蒙层，防止触摸穿透,
      success: res => {}
    })
    mpvue.request({
      url: config.url, //开发者服务器接口地址",
      data: config.data, //请求的参数",
      method: config.method,
      header:config.headers,// 请求头，注意最好看文档
      dataType: 'json', //如果设为json，会尝试对返回的数据做一次 JSON.parse
      success: res => {
        resolve(res)
      },
      fail: err => {
        reject(err)
      },
      complete: () => {
        wx.hideLoading()
      }
    });
  })
}

Vue.prototype.$axios = axios
