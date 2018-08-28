//获取应用实例
const app = getApp()

//工具函数
var util = require('../../utils/util.js'); 

Page({
  data: {
    //搜索区域
    //绑定数据
    inputContext:'',
    //标志位
    inputFlag:true,
    //搜索结果

    //页面渲染数据
    cities:{}

  },
  onLoad: function () {
    this.handleInitCity()
  },
  //排序归类
  sortClassification(cities) {
    cities = cities.sort((a, b) => {
      return a.letter.charCodeAt(0) - b.letter.charCodeAt(0)
    })

    let obj = {}
    for (let i = 0; i < cities.length; i++) {
      if (!obj[cities[i]['letter']]) {
        obj[cities[i]['letter']] = []
      }
      obj[cities[i]['letter']].push(cities[i])
    }
    return obj
  },
  //过滤函数
  handleCommonFilter(val) {
    let data = JSON.parse(JSON.stringify(this.data.cities))
    let tarData = {}
    for (let i in data) {
      for (let j = 0; j < data[i].length; j++) {
        if (data[i][j]['name'].indexOf(val) !== -1) {
          if (Object.keys(tarData).includes(i)) {
            tarData[i].push(data[i][j])
          } else {
            tarData[i] = []
            tarData[i].push(data[i][j])
          }
        }
      }
    }
    let keys = Object.keys(tarData)
    if (keys.length && keys.length != 0) {
      this.setData({
        inputFlag: true,
        cities: tarData
      })
    } else {
      this.setData({
        inputFlag: false,
        cities: {}
      })
    }
  },
  //初始化城市
  handleInitCity(){
    let cities = this.sortClassification(util.cities)
    this.setData({
      cities: cities
    })
  },
  //模糊搜索确认函数
  handleInputConfirm(e){
    let param = e.detail.value
    this.handleCommonFilter(param)
  },
  //模糊搜索清空确认函数
  handleClear(e){
    this.setData({
      inputContext:'',
    })
    this.handleInitCity() 
  },
  //点击城市函数
  handleClickCity(ev){
    let tarCity = ev.target.dataset.name
    //获取当前的页面栈
    let curPage = getCurrentPages()
    let prePage = curPage[curPage.length - 2]
    prePage.setData({
      isSelectCityBack:true,
      selectedCityName: tarCity
    })
    wx.navigateBack({})
  },
})
