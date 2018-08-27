const app = getApp()
const globalData = app.globalData
Page({
  data: {
    //页面配置项目
    setting:{},
    keepscreenon:false,
    enableUpdate: true,
    SDKVersion:''
  },
  onShow: function () { 
    let _this = this
    this.setData({
      keepscreenon: globalData.keepscreenon,
    })
    this.isForceUpdate()
    this.getScreenBrightness()
    wx.getStorage({
      key: 'setting',
      success: function (res) {
        let setting = res.data
        _this.setData({
          setting,
        })
      },
      fail: function (res) {
        _this.setData({
          setting: {},
        })
      },
    })
  },
  handleChangeBcg(e){
    let _this = this
    wx.chooseImage({
      count: 1,
      success(res) {
        _this.handleClearBcgs(() => {
          wx.saveFile({
            tempFilePath: res.tempFilePaths[0],
            success: function () {
              wx.navigateBack({})
            }
          })
        })
      }
    })
  },
  handleRecoverBcg(e){
    this.handleClearBcgs(() => {
      wx.showToast({
        title: '恢复默认背景成功',
        icon:'none'
      })
      setTimeout(()=>{
        wx.navigateBack({})
      },1000)
    })
  },
  //处理本地缓存照片
  handleClearBcgs(callback){
    wx.getSavedFileList({
      success(res) {
        let files = res.fileList
        let len = files.length
        if (len && len != 0){
          //需要清除
          for (let i = 0; i < len; i++) {
            wx.removeSavedFile({
              filePath: files[i].filePath,
              complete() {
                if(i === len - 1){
                  callback()
                }
              }
            })
          }
        }else{
          //直接处理本次
          callback()
        }
      },
      fail: function () {
        wx.showToast({
          title: '出错了,请稍后再试',
          icon: 'none',
        })
      },
    })
  },
  handleSwitchChange(e){
    let flag = e.target.dataset.param
    let value = e.detail.value
    let setting = this.data.setting
    if (flag == "onScreen"){
      globalData.keepscreenon = !this.data.keepscreenon
      this.setKeepScreenOn(!this.data.keepscreenon)
    } else if (flag == "update"){
      if (this.data.enableUpdate){
        setting[flag] = value
      }else{
        setting[flag] = false
        wx.showToast({
          title: '基础库版本较低，无法使用该功能',
          icon: 'none',
          duration: 2000,
        })
      }
    }else{
      setting[flag] = !value
    }
    this.setData({
      setting,
    })
    wx.setStorage({
      key: 'setting',
      data: setting,
    })
  },
  handleGetHCEState(){
    console.log(111)
    wx.showLoading({
      title:'正在检测...'
    })
    wx.getHCEState({
      success: function () {
        wx.hideLoading()
        wx.showModal({
          title: '检测结果',
          content: '该设备支持NFC功能',
          showCancel: false,
          confirmText: '朕知道了',
          confirmColor: '#40a7e7',
        })
        
      },
      fail: function() {
        wx.hideLoading()
        wx.showModal({
          title: '检测结果',
          content: '该设备支持NFC功能',
          showCancel: false,
          confirmText: '朕知道了',
          confirmColor: '#40a7e7',
        })
      }
    })
  },
  screenBrightnessChanging(e){
    let val = e.detail.value
    let _this = this
    wx.setScreenBrightness({
      value: val / 100,
      success: function (res) {
        _this.setData({
          screenBrightness: val,
        })
      },
    })
  },
  isForceUpdate(){
    let SDKVersion = globalData.systeminfo.SDKVersion
    SDKVersion = SDKVersion.replace(/\./g, '')
    if (parseInt(SDKVersion) >= 190){
      this.setData({
        SDKVersion,
        enableUpdate: true,
      })
    }else{
      this.setData({
        SDKVersion,
        enableUpdate: false,
      })
    }
  },
  getScreenBrightness(){
    let that = this
    wx.getScreenBrightness({
      success: function (res) {
        that.setData({
          screenBrightness: Number(res.value * 100).toFixed(0),
        })
      },
      fail: function (res) {
        that.setData({
          screenBrightness: '获取失败',
        })
      },
    })
  },
  setKeepScreenOn(value) {
    let that = this
    wx.setKeepScreenOn({
      keepScreenOn: value,
      success() {
        that.setData({
          keepscreenon: value,
        })
      },
    })
  },
  handleGetsysteminfo() {
    wx.navigateTo({
      url: '/pages/systeminfo/systeminfo',
    })
  },
})
