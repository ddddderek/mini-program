//index.js
var bmap = require('../../libs/bmap-wx.js'); 
var moment = require('../../libs/moment.js'); 
var util = require('../../utils/util.js'); 

//获取应用实例
const app = getApp()
const globalData = app.globalData
const geocoderUrl = app.geocoderUrl
Page({
  data: {
    //页面配置
    setting:{},
    //背景
    //图片地址
    bcgUrl:'',
    //颜色
    bcgColor: '#40a7e7',

    //搜索区域
    //是否显示
    isShowSearchArea:false,
    //当前搜索城市-input占位
    searchContext:'',

    //生活推荐图片
    icons: ['/img/clothing.png', '/img/carwashing.png', '/img/pill.png', '/img/running.png', '/img/sun.png'],

    //是否是从选择城市页面回来，
    isSelectCityBack:false,
    //选择城市页面选择的城市名称
    selectedCityName:'',

    //天气相关数据
    weatherData:{},

    //动画
    //标志位
    hasStep:true,
    //动画对象
    animationMain:{},
    animationSettin:{},
    animationCity:{},
    animationSystem:{}
  },
  onShow: function () {
    this.initBcg()
    this.initSetting()

    if (!this.data.isSelectCityBack){
      this.initData()
    }else{
      //先搜索城市,初始化数据
      //清空标志位
      this.handleCitySearch(this.data.selectedCityName)
      this.setData({
        isSelectCityBack: false,
        selectedCityName: '',
      })
    }
    
  },
  onPullDownRefresh() {
    let _this = this
    wx.getStorage({
      key:'location',
      success: function (res) {
        let location = res.data
        _this.initData(location)
      },
      fail:function (res) {
          wx.showToast({
            title: '拉取缓存失败,请再次刷新',
            icon: 'none'
          })
      }
    }) 
  },
  initData(location){
    let _this = this

    let weatherSuccess = function(data) {
      wx.stopPullDownRefresh()

      let now = Date.now()
      data.now = moment(now).format('MM-DD hh:mm')
      data.curCity = data.currentWeather[0].currentCity
      data.curTemperature = data.currentWeather[0].date.substr(-4, 2)
      data.weatherDesc = data.currentWeather[0].weatherDesc
      data.pm25 = util.pm25Standard(data.currentWeather[0].pm25)
      _this.setData({
        weatherData: data
      })
      wx.setStorage({
        key: 'weatherData',
        data: data,
      })
      wx.setStorage({
        key: 'location',
        data: location,
      })
    }

    let weatherFail = function(data) {
      wx.stopPullDownRefresh()
      
      let errMsg = data.errMsg
      if (data.errMsg && data.errMsg.indexOf('auth deny') != -1){
        //此时说明是用户拒绝了授权
        //1.提示打开授权
        //2.点击后进入权限设置页面
        wx.showToast({
          title:'需要开启获取位置权限',
          icon:'none',
          success:function(){
            let timer = setTimeout(()=>{
              wx.openSetting()
            },1500) 
          }
        })
      }else{
        wx.showToast({
          title: '连接超时，请稍后再试',
          icon: 'none',
        })
      }
    }
    let BMap = new bmap.BMapWX({
      ak: globalData.ak
    })

    BMap.weather({
      location: location,
      fail: weatherFail,
      success:weatherSuccess,
    })
  },
  initBcg(){
    let _this = this
    wx.getSavedFileList({
      success: function (res) {
        if (res.fileList.length > 0) {
          _this.setData({
            bcgUrl: res.fileList[0].filePath
          })
        }else{
          _this.setData({
            bcgUrl: ''
          })
        }
      }
    })

  },
  initSetting(cb) {
    let that = this
    wx.getStorage({
      key: 'setting',
      success: function (res) {
        let setting = res.data
        that.setData({
          setting,
        })
        cb && cb(setting)
      },
      fail: function () {
        that.setData({
          setting: {},
        })
      },
    })
  },
  handleCommit(ev){
    let tarCityName = ev.detail.value.trim()
    this.handleCitySearch(tarCityName)
  },
  handleCitySearch(val){
    let _this = this
    if (val){
      wx.request({
        url: geocoderUrl(val),
        success: function (res){
          let data = res.data
          if (data.status === 0 ) {
            _this.initData(`${data.result.location.lng},${data.result.location.lat}`)
            //成功
          }else {
            wx.showToast({
              title: data.msg || '网络不给力，请稍后再试',
              icon: 'none',
            })
          }
        },
        fail: function (res){
          wx.showToast({
            title: data.msg || '网络不给力，请稍后再试',
            icon: 'none',
          })
        },
        complete:function(res){
          _this.setData({
            searchContext: '',
          })
          wx.pageScrollTo({
            scrollTop: 0,
            duration: 300
          })
        }
      })
    }
  },
  handleMainMenu(e){
    this.data.hasStep ? this.handleAnimateOn() : this.handleAnimateOff()
  },
  handleSecMenu(e){
    let flag = e.target.dataset.param
    let url = flag === 1 ? '/pages/cities/cities' : (flag === 2 ? '/pages/setting/setting' :'/pages/about/about') 
      wx.navigateTo({
        url: url
      })
    //关闭动画
    this.handleAnimateOff()
  },
  handleAnimateOn(){ 
    let animationMain = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in-out'
    })
    let animationSetting = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in-out'
    })
    let animationCity = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in-out'
    })
    let animationSystem = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in-out'
    })
    animationMain.rotateZ(180).step()
    animationSetting.translate(-90, 0).rotateZ(360).opacity(1).step()
    animationCity.translate(-50, -60).rotateZ(360).opacity(1).step()
    animationSystem.translate(-50, 60).rotateZ(360).opacity(1).step()
    this.setData({
      animationMain: animationMain.export(),
      animationSetting: animationSetting.export(),
      animationCity: animationCity.export(),
      animationSystem: animationSystem.export()
    })
    this.setData({
      hasStep: false
    })
  },
  handleAnimateOff() {
    let animationMain = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in-out'
    })
    let animationSetting = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in-out'
    })
    let animationCity = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in-out'
    })
    let animationSystem = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in-out'
    })
    animationMain.rotateZ(0).step()
    animationSetting.translate(0, 0).rotateZ(0).opacity(0).step()
    animationCity.translate(0, 0).rotateZ(0).opacity(0).step()
    animationSystem.translate(0, 0).rotateZ(0).opacity(0).step()
    this.setData({
      animationMain: animationMain.export(),
      animationSetting: animationSetting.export(),
      animationCity: animationCity.export(),
      animationSystem: animationSystem.export()
    })
    this.setData({
      hasStep: true
    })
  },
  handleMainMenuEnd(e) {
    let clientX = e.changedTouches[0].clientX
    if (clientX > (globalData.systeminfo.windowWidth-40)/2){
      clientX = globalData.systeminfo.windowWidth - 40
    }else{
      clientX = 0
    }
    this.setData({
      pos: { top: this.data.pos.top, left: clientX }
    })
  },
  onShareAppMessage(res){
    return {
      title: 'derek Weather',
      success(){},
      fail(err){
        let errMsg = e.errMsg
        let msg = errMsg.indexOf('cancel') !== -1 ? msg = '取消分享' : '分享失败'
        wx.showToast({
          title: msg,
          icon: 'none'
        })
      }
    }
  }
})
