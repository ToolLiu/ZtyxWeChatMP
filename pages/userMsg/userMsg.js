Page({

  data: {
    coalOrders:'',
    coalOrderId: '',  // 煤炭订单ID
    imageType: '',    // 图片类型，可能是 'freightRateList' 或 'weighing_list'
    imageFilePath: '', // 图片文件路径
    address: '',
    showMap: false,
    myLat: '',
    myLng: '',
    position: '',
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
  // 完成订单
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

  position(e){
    let app = getApp();
    let that = this
    let position = e.currentTarget.dataset.coal_orders.position;
    let latLng = position.split(',');
    let coal_order_id = e.currentTarget.dataset.coal_orders.coal_order_id
    that.mapCtx.moveToLocation()
    that.setData({
      showMap: true,
      position: position,
      coalOrderId: coal_order_id,
      markers: [{
        latitude:latLng[0],
        longitude:latLng[1],
        iconPath:"../../static/icon/placeholder.png",
        width: 40,
        height: 40,
      }]
    })
  },
  closeMap(){
    let that = this;
    that.setData({
      showMap:false
    })
  },

  // 计算两个经纬度之间的距离
  distance(myLocation, location) {
    let myPositionArr = myLocation.split(',');
    let positionArr = location.split(',');
    var La1 = Number(myPositionArr[0]) * Math.PI / 180.0;
    var La2 = Number(positionArr[0]) * Math.PI / 180.0;
    var La3 = La1 - La2;
    var Lb3 = Number(myPositionArr[1]) * Math.PI / 180.0 - Number(positionArr[1]) * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
    s = s * 6378.137; //地球半径
    s = Math.round(s * 10000) / 10000;
    // console.log("计算结果",s)
    return s
  },

  checkIn(){
    let app = getApp();
    let that = this
    let position = that.data.position;
    that.mapCtx.getCenterLocation({
      success: function(res){
        that.setData({
          myLat: res.latitude.toFixed(6),
          myLng: res.longitude.toFixed(6),
        })
      },
      fail: (err) => { console.log(err); },
      complete: () => {
        let myLocation = this.data.myLat + ',' + this.data.myLng;
        let space = that.distance(myLocation, position);
        // console.log(space);  //  距离定位点的直线距离（KM）
        let message = '';
        let status = 0
        if (space <= 0.3) {
          message = "打卡成功"
          status = 1
        } else {
          message = "未在打卡范围，请更新位置后重试";
          status = 2
        }
        wx.request({
          method: 'POST',
          timeout:'5000',
          url: `${app.data.url}/coal/setIfCheckin`,
          data:{
            coal_order_id: that.data.coalOrderId,
            status: status
          },
          success:  (res)=> {
            that.setData({
              showMap:false
            })
          },
          fail:  (err)=> { message = "打卡发生错误，请检查网络环境：" + err; },
          complete: () => {
            wx.showModal({
              title: '提示',
              content: message,
              showCancel: false
            });
          }
        })
      }
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
  },
  
  onLoad(options) {
    this.loadData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.mapCtx = wx.createMapContext('checkInMap')
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