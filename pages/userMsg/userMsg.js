// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({

  data: {
    coalOrders:'',
    coalOrderId: '',  // 煤炭订单ID
    imageType: '',    // 图片类型，可能是 'freightRateList' 或 'weighing_list'
    imageFilePath: '', // 图片文件路径
    address: '',
    showMap: false,
  },

  uploadImage(e) {
    const that = this;
    let imgType = e.currentTarget.dataset.imagetype;
    let coalOrderId = e.currentTarget.dataset.coal_order_id;
    console.log(imgType,coalOrderId);
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success (res) {
        const tempFilePaths = res.tempFilePaths;
        that.setData({
          imageFilePath: tempFilePaths[0],
          imageType: imgType,
          coalOrderId:coalOrderId
        });

        that.submitImage();
      }
    });
  },
  submitImage() {
    const app = getApp()
    const that = this;
    if (!this.data.imageFilePath) {
      wx.showToast({
        title: '请先选择图片',
        icon: 'none'
      });
      return;
    }

    wx.uploadFile({
      url: `${app.data.url}/coal/uploadWeighingList`, // 你的后端服务器URL
      filePath: that.data.imageFilePath,
      name: 'file',
      formData: {
        'coal_order_id': that.data.coalOrderId,
        'imageType': that.data.imageType
      },
      success (res) {
        const data = JSON.parse(res.data);
        wx.showToast({
          title: data.message,
          icon: '上传成功',
          duration: 2000
        });
      },
      fail (error) {
        console.log('Error:', error);
        wx.showToast({
          title: '上传失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  formatDateTime(datetime) {  //  将订单信息的日期改为可读形式
    let date = new Date(datetime);
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    return `${month}-${day} ${hour}:${minute}`;
  },

  showQRCode(e){
    const app = getApp()
    let coal_id = e.target.dataset.coal_orders.coal_id
    let coal_order_id = e.target.dataset.coal_orders.coal_order_id
    wx.request({
      method: 'POST',
      timeout:'5000',
      url: `${app.data.url}/coal/showQRCode`,
      data:{
        coal_id:coal_id,
        coal_order_id:coal_order_id
      },
      success:  (res)=> {
        if(res.data.coal_QRCode){
          let imgUrl = 'https://www.crr11.cn/public/QRCode/'+res.data.coal_QRCode
          console.log(imgUrl);
          wx.previewImage({
            current: imgUrl,
            urls: [imgUrl]
          });
        } else {
          wx.showToast({
            title: '管理员未上传二维码',
            icon: 'none'
          });
        };
      },
      fail: (res)=> {
        wx.showToast({
          title: '获取二维码失败：'+res,
          icon: 'none'
        });
      }
    })
  },

  coalOrderComplete(e){
    const that = this
    const app = getApp()
    let coal_order_id = e.target.dataset.coal_orders.coal_order_id
    wx.request({
      method: 'POST',
      timeout:'5000',
      url: `${app.data.url}/coal/coalOrderComplete`,
      data:{
        coal_order_id:coal_order_id
      },
      success:  (res)=> {
        if (res.data.length == 2) {
          let message = res.data[0][0].Message;
          wx.showModal({
            title: '提示',
            content: message,
            showCancel: false
          });
        }else {
          wx.showModal({
            title: '提示',
            content: "订单已完成！",
            showCancel: false,
            success: (res) => {
              if (res.confirm) {
                that.loadData()
              }
            }
          });
        }
      },
      fail: (res)=> {
        wx.showToast({
          title: '完成订单失败：'+res,
          icon: 'none'
        });
      }
    })
  },

  position(){
    let that = this
    qqmapsdk.reverseGeocoder({
      success: function (res) {
          that.address = res.result.address;
          that.getCoordinate(that.address)
      },
      fail: function (res) {
          console.log(res);
      },
    });
  },
  getCoordinate(address){
    let that = this
    qqmapsdk.geocoder({
      address: address,
      success: function(res) {
        var res = res.result;
        var latitude = res.location.lat;
        var longitude = res.location.lng;
        that.setData({ // 获取返回结果，放到markers及poi中，并在地图展示
          markers: [{
            id: 0,
            title: res.title,
            latitude: latitude,
            longitude: longitude,
            iconPath: '../../static/icon/placeholder.png',
            width: 20,
            height: 20,
            callout: { //可根据需求是否展示经纬度
              content: "您的位置",
              color: '#000',
              bgColor: 'none',
              display: 'ALWAYS',
              textAlign: 'center'
            }
          }],
          circles: [{
            latitude: latitude,
            longitude: longitude,
            color: "#3FA1B0",
            fillColor: '#7cb5ec88',
            radius: 80
          }],
          poi: {
            latitude: latitude,
            longitude: longitude
          },
          showMap:true
        });
      },
      fail: function(error) {
        console.error(error);
      },
    })
  },
  closeMap(){
    let that = this;
    that.setData({
      showMap:false
    })
  },

  loadData(){
    wx.showNavigationBarLoading();
    const app = getApp()
    let openid = app.globalData.openid
    wx.request({
      method: 'POST',
      timeout:'5000',
      url: `${app.data.url}/coal/getMyCoalOrders`,
      data:{
        u_openid:openid
      },
      success:  (res)=> {
        // console.log(res.data[0]);
        res.data[0].map(obj => {
          // 在这里修改 obj.order_time，例如：
          obj.order_time = this.formatDateTime(obj.order_time);
          return obj;
        });
        this.setData({
          coalOrders:res.data[0],
        })
        wx.hideNavigationBarLoading(); 
        wx.stopPullDownRefresh();
      },
      fail: (res)=> {
        console.log("获取时间失败" + res.errMsg);
        wx.hideNavigationBarLoading(); 
        wx.stopPullDownRefresh();
      }
    })
    qqmapsdk = new QQMapWX({
        key: '4RXBZ-J72RU-6GOVE-GMNUS-5PS7S-NRFKB'
    });
  },
  
  onLoad(options) {
    this.loadData()
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