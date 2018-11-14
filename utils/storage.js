class Storage {
  getDataByKey (key, isError=false) {
    return new Promise((resolve, reject) => {
      wx.getStorage({
        key:key,
        success(res) {
          resolve(res)
        },
        fail(res) {
          if (isError) {
            reject(res)
            return
          }
          wx.showToast({
            title: '拉取缓存失败,请再次刷新',
            icon: 'none'
          })
        }
      }) 
    })
  }

  setDataByKey({key, data}){
    wx.setStorage({
      key: key,
      data: data
    })
  }
}

export { Storage }
