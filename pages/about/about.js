const app = getApp()
const globalData = app.globalData
import {
  config
} from '../../config/index.js'
Page({
  data: {
    github: '',
    email: '',
    qq: '',
    authorName:'',
    articleAdress:'',
    swiperHeight: 'auto',
    bannerImgList: [],
  },
  onLoad () {
    //初始化变量
    this.setData({
      github: config.github,
      email: config.email,
      qq: config.qq,
      authorName: config.authorName,
      articleAdress: config.articleAdress,
      bannerImgList: config.bannerImgList,
    }) 
    console.log(this.data)
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