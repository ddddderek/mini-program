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
    this.handleInitSwiper()
  },
  //动态计算高度
  setSwiperHeight(res) {
    //以375为标准动态设置容器高度
    this.setData({
      swiperHeight: `${(res.windowWidth || res.screenWidth) / 375 * 200}px`
    })
  },
  //初始化swiper
  handleInitSwiper() {
    let _this = this
    let systeminfo = globalData.systeminfo
    let len = Object.keys(systeminfo).length
    if (!len || len == 0) {
      wx.getSystemInfo({
        success: function (res) {
          _this.setSwiperHeight(res)
        },
      })
    } else {
      _this.setSwiperHeight(systeminfo)
    }
  },
  //查看照片大图
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
  //赋值联系信息函数
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