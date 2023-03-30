// index.js
const app = getApp()

Page({
  data: {
    phone: '', // 用户手机号
    nickName: '', // 用户微信名
  },
  login: function() {
    wx.login({
      success: (res) => {
        if (res.code) {
          wx.request({
            url: 'https://api.weixin.qq.com/sns/jscode2session',
            data: {
              appid: 'your_appid',
              secret: 'your_secret',
              js_code: res.code,
              grant_type: 'authorization_code'
            },
            success: (res) => {
              console.log(res.data)
              wx.getUserInfo({
                success: (res) => {
                  this.setData({
                    phone: res.userInfo.phoneNumber,
                    nickName: res.userInfo.nickName,
                  })
                }
              })
            }
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  }
})

