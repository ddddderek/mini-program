const app = getApp()
const globalData = app.globalData
// let utils = require('../../utils/utils')
Page({
  data: {
    github: 'https://github.com/ddddderek',
    email: '18842613507@163.com',
    qq: '13928244',
    autorName:'myvin',
    articleAdress:'https://juejin.im/post/5b39bbcc5188252ce018c745',
    swiperHeight: 'auto',
    bannerImgList: [
      'https://raw.githubusercontent.com/myvin/miniprogram/master/quietweather/images/logo.png',  'https://raw.githubusercontent.com/myvin/miniprogram/master/quietweather/images/miniqrcode.jpg',
    ],
  },
  onLoad () {
    this.initSwiper()
  },
  handlePreview (e) {
    let index = e.currentTarget.dataset.index || 0
    let urls = this.data.bannerImgList
    wx.previewImage({
      current: urls[index],
      urls,
      fail: function (res) {
        console.error('previewImage fail: ', res)
      }
    })
  },
  initSwiper () {
    let _this = this
    let systeminfo = globalData.systeminfo
    let len = Object.keys(systeminfo).length
    if (len && len != 0){
      wx.getSystemInfo({
        success: function (res) {
          _this.setSwiperHeight(res)
        },
      })
    }else{
      _this.setSwiperHeight(systeminfo)
    }
  },
  setSwiperHeight (res) {
    this.setData({
      swiperHeight: `${(res.windowWidth || res.screenWidth) / 375 * 200}px`
    })
  },
  handleCopyMessage(e) {
    let data = e.currentTarget.dataset
    let title = data.title || ''
    let content = data.content || ''
    wx.setClipboardData({
      data: content,
      success () {
        wx.showToast({
          title: `已复制${title}`,
          duration: 2000,
        })
      },
    })
  },
})