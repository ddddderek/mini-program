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

    //搜索区域
    //是否显示
    isShowSearchArea: false,
    //当前搜索城市-input占位
    searchContext: '',

    //背景
    //图片地址
    bcgUrl:'/img/1.jpg',
    //颜色
    bcgColor: '#2467ab',
    //选择主题标志位
    isChosedFlag:false,
    //主题列表
    bcgImgList: [
      {
        src: '/img/1.jpg',
        navbarColor: '#2467ab'
      },
      {
        src: '/img/2.jpg',
        navbarColor: '#2445ae'
      },
      {
        src: '/img/3.jpg',
        navbarColor: '#505050'
      },
      {
        src: '/img/4.jpg',
        navbarColor: '#ce9168'
      },
      {
        src: '/img/5.jpg',
        navbarColor: '#826c42'
      },
      {
        src: '/img/6.jpg',
        navbarColor: '#9f6e71'
      },
      {
        src: '/img/7.jpg',
        navbarColor: '#383b6d'
      },
      {
        src: '/img/8.jpg',
        navbarColor: '#0e0c1a'
      },
      {
        src: '/img/9.jpg',
        navbarColor: '#f08b6a'
      }
    ],

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
    // this.initBcg()
    //初始化页面构造
    this.handleInitSetting()
    //初始化主题
    this.handleSetBcgImg()
    //初始化天气数据
    if (!this.data.isSelectCityBack){
      this.handleInitData()
    }else{
      //从选择城市页面返回
      //清空标志位
      this.handleCitySearch(this.data.selectedCityName)
      this.setData({
        isSelectCityBack: false,
        selectedCityName: '',
      })
    }
    //初始化tips
    this.setData({
      message: util.tips()
    })
  },
  //页面分享函数
  onShareAppMessage(res) {
    return {
      title: 'derek Weather',
      success() { },
      fail(err) {
        let errMsg = e.errMsg
        let msg = errMsg.indexOf('cancel') !== -1 ? msg = '取消分享' : '分享失败'
        wx.showToast({
          title: msg,
          icon: 'none'
        })
      }
    }
  },
  //下拉刷新钩子函数
  onPullDownRefresh() {
    let _this = this
    wx.getStorage({
      key:'location',
      success: function (res) {
        let location = res.data
        _this.handleInitData(location)
      },
      fail:function (res) {
          wx.showToast({
            title: '拉取缓存失败,请再次刷新',
            icon: 'none'
          })
      }
    }) 
  },
  //处理页面构造函数
  handleInitSetting(cb) {
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
  //设置导航栏背景色
  handleSetNavigationBarColor(color) {
    let bcgColor = color || this.data.bcgColor
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: bcgColor,
    })
    wx.setBackgroundColor({
      backgroundColor:bcgColor
    })
  },
  //处理主题函数
  handleSetBcgImg(index) {
    if (index) {
      this.setData({
        bcgImgIndex: index,
        bcgUrl: this.data.bcgImgList[index].src,
        bcgColor: this.data.bcgImgList[index].navbarColor,
      })
      this.handleSetNavigationBarColor()
      return
    }
    wx.getStorage({
      key: 'bcgImgIndex',
      success: (res) => {
        let bcgImgIndex = res.data
        this.setData({
          bcgImgIndex,
          bcgUrl: this.data.bcgImgList[bcgImgIndex].src,
          bcgColor: this.data.bcgImgList[bcgImgIndex].navbarColor,
        })
        this.handleSetNavigationBarColor()
      },
      fail: () => {
        this.setData({
          bcgImgIndex: 0,
          bcgUrl: this.data.bcgImgList[0].src,
          bcgColor: this.data.bcgImgList[0].navbarColor,
        })
        this.handleSetNavigationBarColor()
      },
    })
  },
  //切换注意按钮函数
  handleChooseBcg(e) {
    let data = e.currentTarget.dataset
    let src = data.src
    let index = data.index
    wx.setStorage({
      key: 'bcgImgIndex',
      data: index,
    })
    this.handleSetBcgImg(index)
  },
  //处理天气数据函数
  handleInitData(location){
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
  // initBcg(){
  //   let _this = this
  //   wx.getSavedFileList({
  //     success: function (res) {
  //       if (res.fileList.length > 0) {
  //         _this.setData({
  //           bcgUrl: res.fileList[0].filePath
  //         })
  //       }else{
  //         _this.setData({
  //           bcgUrl: ''
  //         })
  //       }
  //     }
  //   })
  // },
  //根据地名查询经纬度
  handleCitySearch(val) {
    let _this = this
    if (val) {
      wx.request({
        url: geocoderUrl(val),
        success: function (res) {
          let data = res.data
          if (data.status === 0) {
            _this.handleInitData(`${data.result.location.lng},${data.result.location.lat}`)
            //成功
          } else {
            wx.showToast({
              title: data.msg || '网络不给力，请稍后再试',
              icon: 'none',
            })
          }
        },
        fail: function (res) {
          wx.showToast({
            title: data.msg || '网络不给力，请稍后再试',
            icon: 'none',
          })
        },
        complete: function (res) {
          //初始化
          //清空搜索数据
          //页面滚动到顶部
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
  //搜索城市确认钩子函数
  handleCommit(ev){
    let tarCityName = ev.detail.value.trim()
    this.handleCitySearch(tarCityName)
  },
  handleAnimateOn() {
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

  //动画函数
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
  handleChangeBcgImgArea(e) {
    let flag = e.currentTarget.dataset.show
    this.setData({
      isChosedFlag: flag,
    })
  },
  //点击主菜单钩子函数
  handleMainMenu(e){
    this.data.hasStep ? this.handleAnimateOn() : this.handleAnimateOff()
  },
  //点击子菜单钩子函数
  handleSecMenu(e){
    let flag = e.target.dataset.param
    let url = flag === 1 ? '/pages/cities/cities' : (flag === 2 ? '/pages/setting/setting' :'/pages/about/about') 
      wx.navigateTo({
        url: url
      })
    //关闭动画
    this.handleAnimateOff()
  },
})
