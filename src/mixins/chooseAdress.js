export default {
  data() {
    return {
      address: null // 地址信息
    };
  },
  methods: {
    // 选择收货地址
    chooseAddress() {
      wx.chooseAddress({
        // 用户点击了同意，并且选择了地址
        success: res => {
          res.detailAddress = `${res.provinceName}${res.cityName}${
            res.countyName
          }${res.detailInfo}`;
          // 给 address 赋值
          this.address = res;

          // 保存到本地
          wx.setStorageSync("address", res);
        },
        // 用户拒绝，用户同意了，但是没有选择地址
        fail: ({ errMsg }) => {
          if (errMsg === "chooseAddress:fail auth deny") {
            wx.showModal({
              title: "提示", //提示的标题,
              content: "请去我的页面打开授权选择收货地址", //提示的内容,
              showCancel: false, //是否显示取消按钮,
              confirmText: "确定", //确定按钮的文字，默认为取消，最多 4 个字符,
              confirmColor: "#3CC51F", //确定按钮的文字颜色,
              success: res => {
                if (res.confirm) {
                  wx.switchTab({ url: "/pages/my/main" });
                }
              }
            });
          }
        }
      });
    }
  }
};
