// pages/home/home.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    showEmptyOrder:true,
    cipherVal:'',
    coalMsg: [
      {
        destination: "null", 
        coal_var:"null",
        requirement: 0, 
        cost: "0",
      }
    ],
    noticeText: `司机师傅们，进矿之前请核对自己的大架号和汇能系统注册的是否一致，差一个字母都是5万元罚款，由司机自己承担。\n本公司禁止排假号，假号勿扰。\n能接受运费涨、降、停的给开票。`,
  },

  placeOrder(res){
    const that = this
    const app = getApp()
    // 拿到点击区域的数据
    let coalmsg = res.currentTarget.dataset.coalmsg;
    // 将Object数据转换为字符串str
    let coalmsg_str = JSON.stringify(coalmsg);
    let coal_id = coalmsg.coal_id
    wx.request({
      method: 'post',
      timeout:'5000',
      url: `${app.data.url}/coal/checkRequirement`,
      data:{
        coal_id: coal_id
      },
      success:  (res)=> {
        if (res.data.length == 2) {
          let message = res.data[0][0].Message;
          wx.showModal({
            title: '提示',
            content: message,
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                that.loadData()
              }
            }
          });
        } else {
          if(app.globalData.openid && app.globalData.openid.length > 27){
            wx.navigateTo({
              // 用url传参
              url: `../checkInfo/checkInfo?coalorder=${coalmsg_str}`
            })
          } else {
            wx.showToast({
              title: 'openid识别失败，请重新进入小程序。',
              icon: 'none'
            });
          }
        }
      },
      fail: (res)=> {
        
      }
    })
  },

  cipherInput(e){
    this.setData({
      cipherVal: e.detail.value
    });
  },

  searchByCipher(){
    const that = this
    const app = getApp()
    let cipher = this.data.cipherVal;
    wx.request({
      method: 'GET',
      timeout:'5000',
      url: `${app.data.url}/coal/getCoalMsgByCipher?cipher=`+cipher,
      success:  (res)=> {
        if (res.data.message) {
          let message = res.data.message;
          wx.showModal({
            title: '提示',
            content: message,
            showCancel: false,
            success: (res) => {
            }
          });
        } else {
          let coalmsg = res.data[0];
          let coal_id = coalmsg.coal_id;
          let coalmsg_str = JSON.stringify(coalmsg);
          wx.request({
            method: 'post',
            timeout:'5000',
            url: `${app.data.url}/coal/checkRequirement`,
            data:{
              coal_id: coal_id
            },
            success:  (res)=> {
              if (res.data.length == 2) {
                let message = res.data[0][0].Message;
                wx.showModal({
                  title: '提示',
                  content: message,
                  showCancel: false,
                  success: (res) => {}
                });
              } else {
                if(app.globalData.openid && app.globalData.openid.length > 27){
                  wx.navigateTo({
                    url: `../checkInfo/checkInfo?coalorder=${coalmsg_str}`
                  })
                } else {
                  wx.showToast({
                    title: 'openid识别失败，请重新进入小程序。',
                    icon: 'none'
                  });
                }
              }
            },
            fail: (res)=> {}
          })
        }
      },
      fail: (res)=> {
        
      }
    })
  },

  loadData(){
    wx.showNavigationBarLoading();
    const that = this
    const app = getApp()
    wx.request({
      method: 'GET',
      timeout:'5000',
      url: `${app.data.url}/coal/getCoalMsg`,
      success:  (res)=> {
        if (res.data.length !== 0) {
          that.setData({
            showEmptyOrder: false
          })
        };
        that.setData({
          coalMsg:res.data,
        })
        wx.hideNavigationBarLoading(); 
        wx.stopPullDownRefresh();
      },
      fail: (res)=> {
        console.log("获取失败" + res.errMsg);
        wx.hideNavigationBarLoading(); 
        wx.stopPullDownRefresh();
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadData()
  },
  //  小程序全局只触发一次 触发时机为初始化后执行的生命周期函数，
  onLaunch(){
  },
  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})