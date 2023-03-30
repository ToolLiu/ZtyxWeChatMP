// pages/home/home.js
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    info: '您好，首次使用请注册！',
    msg:'欢迎使用本系统',
    coalMessage: [
      
      // {
      //   destination: "新华太", 
      //   requirement: 20, 
      //   cost: "45补100",
      // },
      // {
      //   destination: "新华太", 
      //   requirement: 15, 
      //   cost: "50",
      // },
      // {
      //   destination: "A煤矿", 
      //   requirement: 6, 
      //   cost: "40补100",
      // }
    
    ],
  },
  btnTapHandler(e) {
    
    // wx.login({
    //   success: (res) => {
    //     console.log(res);
    //   },
    // })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.request({
      method: 'GET',
      timeout:'5000',
      url: 'http://127.0.0.1:8121/coal_msg',
      // data: {
      //   "username": "adminUpdate"
      // },
      success:  (res)=> {
        console.log(res.data);
        this.setData({
          coalMessage:res.data,
        })
        console.log(res.data);
      },
      fail: (res)=> {
        console.log("获取失败" + res.errMsg);
      }
    })
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