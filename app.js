App({
  onLaunch: function () {
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.systeminfo = res
      },
    })
  },
  globalData: {
    ak: '8PuWvIhNE1yYxKzcIwBuTTRfqiNvlQVG',
    systeminfo:{},
    // 是否保持常亮，离开小程序失效
    keepscreenon: false,
  },
  geocoderUrl(address) {
    return `https://api.map.baidu.com/geocoder/v2/?address=${address}&output=json&ak=${this.globalData.ak}`
  },
})