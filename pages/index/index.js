var bmap = require('../../libs/bmap-wx.js'); 
var moment = require('../../libs/moment.js'); 
var util = require('../../utils/util.js'); 
import {
  HTTP
} from '../../utils/http.js'

import {
  Storage
} from '../../utils/storage.js'

import {
  themesList,
  icons
} from '../../theme/index.js'

const http = new HTTP()
const storage = new Storage()

//获取应用实例
const app = getApp()
const globalData = app.globalData
const geocoderUrl = app.geocoderUrl
Page({
  data: {
    /*************天气相关数据**************/
    weatherData: {},

    /***************页面配置****************/
    setting: {},

    /***************搜索区域****************/
    //是否显示
    isShowSearchArea: false,
    //当前搜索城市-input占位
    searchContext: '',

    /***************背景区域****************/
    //图片地址
    bcgUrl: '/img/1.jpg',
    //颜色
    bcgColor: '#2467ab',
    //选择主题标志位
    isChosedFlag: false,
    //主题列表
    themesList: [],

    /***************生活推荐****************/
    icons: [],

    /***************页面堆栈****************/
    //是否是从选择城市页面回来，
    isSelectCityBack: false,
    //选择城市页面选择的城市名称
    selectedCityName: '',

    /***************动画区域****************/
    //标志位
    hasStep:true,
    //动画对象
    animationMain: {},
    animationSettin: {},
    animationCity: {},
    animationSystem: {},

    /***************页面授权****************/
    localtionAuthorized: false
  },
  onShow () {
    //初始化tips,themeList
    this.setData({
      message: util.tips(),
      themesList,
      icons
    })
    this.locationAuthorized()
      .then(() => {
        //初始化页面构造
        this.handleInitSetting()
        //初始化主题
        this.handleSetBcgImg()
        //初始化天气数据
        !this.data.isSelectCityBack ? this.handleInitData({}) : this.handleCitySearch(this.data.selectedCityName)
      })
  },

  //下拉刷新钩子函数
  onPullDownRefresh () {
    storage.getDataByKey('location',true)
      .then(res=>{
        //如果缓存有数据,那么刷新缓存中地点的天气数据
        this.handleInitData({ location: res.data, refresh: true })
      }).catch(err=>{
        //如果缓存没有数据,那么刷新当前定位地点天气数据
        this.handleInitData({refresh: true })
      })
  },

  //页面分享函数
  onShareAppMessage (res) {
    return {
      title: 'derek Weather',
      success() {},
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

  //处理页面结构函数
  handleInitSetting () {
    storage.getDataByKey('setting',true)
      .then((res)=>{
        let setting = res.data
        this.setData({
          setting,
        })
      }).catch(err=>{
        this.setData({
          setting: {},
        })
      })
  },

  //设置导航栏背景色
  handleSetNavigationBarColor (color) {
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
  handleSetBcgImg (index) {
    if (!this.data.localtionAuthorized) {
      //没有进行授权
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#000'
      })
      return
    }
    if (index) {
      //选择主题
      this.setData({
        bcgImgIndex: index,
        bcgUrl: this.data.themesList[index].src,
        bcgColor: this.data.themesList[index].navbarColor,
      })
      this.handleSetNavigationBarColor()
      return
    }

    //初始化
    storage.getDataByKey('bcgImgIndex', true)
      .then((res)=>{
        let bcgImgIndex = res.data
        this.setData({
          bcgImgIndex,
          bcgUrl: this.data.themesList[bcgImgIndex].src,
          bcgColor: this.data.themesList[bcgImgIndex].navbarColor,
        })
        this.handleSetNavigationBarColor()
      }).catch(err=>{
        this.setData({
          bcgImgIndex: 0,
          bcgUrl: this.data.themesList[0].src,
          bcgColor: this.data.themesList[0].navbarColor,
        })
        this.handleSetNavigationBarColor()
      })
  },

  //切换主题按钮函数
  handleChooseBcg (e) {
    let data = e.currentTarget.dataset
    let src = data.src
    let index = data.index
    storage.setDataByKey({
      key: 'bcgImgIndex',
      data: index,
    })
    this.handleSetBcgImg(index)
  },

  //主题更换控制函数
  handleChangeBcgImgArea (e) {
    let flag = e.currentTarget.dataset.show
    this.setData({
      isChosedFlag: flag,
    })
  },

  //验证是否授权地理位置
  locationAuthorized () {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: data => {
          if (data.authSetting['scope.userLocation']) {
            this.setData({
              localtionAuthorized: true,
            })
          } else {
            this.setData({
              localtionAuthorized: false
            })
          }
          resolve()
        }
      })
    })
  },

  //处理天气数据函数
  handleInitData ({location, refresh = false}) {
    //停止下拉刷新
    wx.stopPullDownRefresh()
    //如果不是搜索、下拉刷新那么直接用缓存数据
    if (!refresh) {
      //如果不能取出来,那么是从非城市选择页面回退
      storage.getDataByKey('weatherData',true)
        .then(res=>{
          this.setData({
            weatherData: res.data
          })
        }).catch(err=>{
          //如果没有取出来,那么是第一次进入页面
          this.getWeather(location)
        })
    } else {
      this.getWeather(location)
    }
  },
  //刷新、获取天气数据
  getWeather (location) {
    let BMap = new bmap.BMapWX({
      ak: globalData.ak
    })

    BMap.weather({
      location: location,
      fail: (data) => {
        let errMsg = data.errMsg
        if (data.errMsg && data.errMsg.indexOf('auth deny') != -1) {
          this.localtionAuthorized = false
        } else {
          wx.showToast({
            title: '连接超时，请稍后再试',
            icon: 'none',
          })
        }
      },
      success: (data) => {
        //格式化天气数据
        let now = Date.now()
        data.now = moment(now).format('MM-DD hh:mm')
        data.curCity = data.currentWeather[0].currentCity
        data.curTemperature = data.currentWeather[0].date.substr(-4, 2)
        data.weatherDesc = data.currentWeather[0].weatherDesc
        data.pm25 = util.pm25Standard(data.currentWeather[0].pm25)
        this.setData({
          weatherData: data
        })

        //存入缓存
        storage.setDataByKey({
          key: 'weatherData',
          data: data,
        })

        if (location) {
          storage.setDataByKey({
            key: 'location',
            data: location,
          })
        }
      },
    })
  },

  //初始化是搜索区域参数和标志位
  initSearchVar () {
    //初始化
    //清空搜索数据
    //页面滚动到顶部
    this.setData({
      searchContext: '',
      isSelectCityBack: false,
      selectedCityName: '',
    })
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },

  //根据地名查询经纬度
  handleCitySearch (val) {
    if (val) {
      http.request({url: geocoderUrl(val)})
        .then((res)=>{
          let data = res.data
          if (data.status === 0) {
            this.handleInitData({location: `${data.result.location.lng},${data.result.location.lat}`,refresh:true})
            this.initSearchVar()
            //成功
          } else {
            this.showErr(data)
          }
        }).catch(err=>{
          this.showErr(err)
        })
    }
  },

  //搜索城市确认钩子函数
  handleCommit (ev) {
    let tarCityName = ev.detail.value.trim()
    this.handleCitySearch(tarCityName)
  },

  //菜单动画-展开
  handleAnimateOn () {
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

  //菜单动画-闭合
  handleAnimateOff () {
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
  
  //点击主菜单钩子函数
  handleMainMenu (e) {
    this.data.hasStep ? this.handleAnimateOn() : this.handleAnimateOff()
  },

  //点击子菜单钩子函数
  handleSecMenu (e) {
    let flag = e.target.dataset.param
    let url = flag === 1 ? '/pages/cities/cities' : (flag === 2 ? '/pages/setting/setting' :'/pages/about/about') 
      wx.navigateTo({
        url: url
      })
    //关闭动画
    this.handleAnimateOff()
  },

  //错误处理函数
  showErr(data) {
    wx.showToast({
      title: data.msg || '网络不给力，请稍后再试',
      icon: 'none',
    })
  },
})
