// app.js小程序入口文件
App({
  data: {
    // url:'https://www.crr11.cn/api',
    url: 'http://127.0.0.1:8121',
  },
  globalData:{
    openid:''
  },

  getOpenid(){
    let _this = this
    let openid = ''
    wx.login({	//先调用 wx.login() 获取 临时登录凭证code 
      success: res =>{
      const code = res.code
        wx.request({	//发送请求
          url: `${_this.data.url}/user/getOpenid?code=`+code,	//携带code
          success: (res) =>{	//返回node请求到的OpenID与session_key
            // console.log(res);
            openid = res.data.openid
              if (res.data.openid == undefined) {
                wx.showModal({
                  title: '提示', // 弹窗的标题
                  content: '获取用户openid失败，请重新进入小程序', // 弹窗的内容
                  showCancel: false, // 是否显示取消按钮，默认为 true
                  confirmText: '确定', // 确定按钮的文字，默认为"确定"
                  success(res) {
                    if (res.confirm) {
                      wx.reLaunch({
                        url: '/pages/coalMsg/coalMsg'
                      });
                    }
                  }
                })
              } else {
                // console.log('openid:',openid)
              }
            wx.setStorageSync("openid", openid)
            this.globalData.openid = openid
          },
          fail:(err)=>{
            wx.showModal({
              title: '提示', // 弹窗的标题
              content: 'openid获取失败，请与开发人员联系'+err.errMsg,
              showCancel: false,
              confirmText: '确定',
              success(res) {
                if (res.confirm) {
                  wx.reLaunch({
                    url: '/pages/coalMsg/coalMsg'  //这里应更改为你的首页路径
                  });
                }
              }
            })
          }
        })
      },
    })
  },

  onLaunch() {
    this.getOpenid()
  },

})
