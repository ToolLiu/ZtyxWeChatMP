// app.js小程序入口文件

App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        //发起网络请求
      wx.request({
        // url: 'https://example.com/onLogin',
        // data: {
        //   code: res.code
        // }
      })
    }, 
    fail: res => {
      console.log('登录失败！' + res.errMsg)
    }
    })
  },
  globalData: {
    userInfo: null
  }
})
