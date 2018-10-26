class HTTP {
  request ({url, data= {}, method='GET'}) {
    return new Promise((resolve,reject) => {
      this._request(url,resolve,reject,data,method)
    })
  }

  _request(url, resolve, reject, data, method) {
    wx.request({
      url,
      data,
      success: (res) => {
        resolve(res)
      },
      fail: (err) => {
        reject(err)
      }
    })
    
  }
}

export {HTTP}
