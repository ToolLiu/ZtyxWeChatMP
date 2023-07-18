Page({
  data: {
    coalorder: '',
    order_time: ''
  },

  validateUserInfo(userInfo) {
    const requiredFields = [{
        field: 'u_name',
        message: '姓名不能为空'
      },
      {
        field: 'u_license_plate',
        message: '车牌号不能为空'
      },
      {
        field: 'tel_num',
        message: '电话号码不能为空'
      }
    ];

    for (const {
        field,
        message
      } of requiredFields) {
      if (!userInfo[field]) {
        wx.showToast({
          title: message,
          icon: 'none'
        });
        return false;
      }
    }
    return true;
  },

  // 添加一个新的验证函数
  validateInput: function (userInfo) {
    // 验证姓名是否全是中文汉字
    const nameReg = /^[\u4e00-\u9fa5]+$/;
    if (!nameReg.test(userInfo.u_name)) {
      wx.showToast({
        title: '姓名必须为汉字',
        icon: 'none'
      });
      return false;
    }

    // 验证电话号必须是11位纯数字
    const phoneReg = /^[1][3-9][0-9]{9}$/;
    if (!phoneReg.test(userInfo.tel_num)) {
      wx.showToast({
        title: '电话号码格式错误',
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  addCoalOrders(event) {
    const app = getApp();
    const userInfo = event.detail.value;

    // 在提交表单之前，调用 validateInput 函数验证输入
    if (!this.validateInput(userInfo)) {
      return;
    }
    if (!this.validateUserInfo(userInfo)) {
      return;
    }

    this.setData({
      newCoalOrder: {
        ...userInfo,
        ...this.data.coalorder,
        ...app.globalData
      }
    });

    wx.showModal({
      title: '提示',
      content: '确认提交这条信息吗',
      complete: (res) => {
        if (res.confirm) {
          this.enterTheDatabase();
        }
      }
    });
  },

  enterTheDatabase() {  // 先入库
    const app = getApp();
    let now = new Date();
    let year = now.getFullYear(); // 获取完整的年份
    let month = (now.getMonth() + 1).toString().padStart(2, '0'); //  获取月份，并将其补齐为两位数
    let date = now.getDate().toString().padStart(2, '0');
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    let seconds = now.getSeconds().toString().padStart(2, '0');
    let dateTime = year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds;
    let mysqlDateTime = {
      order_time: dateTime
    };
    this.order_time = dateTime

    wx.request({
      method: 'POST',
      timeout: '5000',
      url: `${app.data.url}/coal/addCoalOrders`,
      data: {
        newCoalOrder: {
          ...this.data.newCoalOrder,
          ...mysqlDateTime
        }
      },
      success: (res) => {
        if(res.data.message) {  //  检查车牌号是否被拉黑
          let message = res.data.message
          wx.showModal({
            title: '警告',
            content: message,
            showCancel: false,
            success: (res) => {}
          });
        } else {
          this.userpay();
        }
      },
      fail: (res) => {
        wx.showModal({
          title: '提示',
          content: '下单失败，请检查网络或联系管理员-chekInfo_ERR：' + res.errMsg,
          complete: (res) => {
          }
        });
      }
    });
  },

  userpay() {
    const app = getApp();
    const openid = wx.getStorageSync("openid");
    const that = this;
    if (openid) {
      wx.request({
        method: 'POST',
        timeout: '5000',
        url: `${app.data.url}/userpay/userpay`,
        data: {
          u_openid: openid,
          // total: that.data.coalorder.cost
        },
        success: (res) => {
          that.handlePayment(res.data);
        },
        fail: (res) => {
          console.log('userpay错误：',res);
        }
      });
    }
  },

  handlePayment(paymentData) {
    const app = getApp();
    const that = this;
    wx.requestPayment({
      ...paymentData,
      success(res) {
        wx.request({
          method: 'POST',
          timeout: '5000',
          url: `${app.data.url}/userpay/checkOrderStatus`,
          data: {
            out_trade_no: paymentData.out_trade_no,
          },
          success: (res) => {
            if(res.statusCode === 200) {  // 查询到订单已支付则更改status
              that.showToastAndRedirect(app.globalData.openid,that.order_time)
            }
          },
          fail: (res) => {
            console.log('查询订单状态Failed：',res);
          }
        });
      },
      fail(res) {
        
      }
    });
  },

  showToastAndRedirect(u_openid,order_time) {
    const app = getApp();
    wx.request({
      method: 'POST',
      timeout: '5000',
      url: `${app.data.url}/user/updateOrderStatus`,
      data: {
        u_openid: u_openid,
        order_time: order_time
      },
      success: (res) => {
        console.log("订单状态更新完成");
      },
      fail: (res) => {
        console.log('更新订单Failed：',res);
      }
    });
    wx.showToast({
      title: '下单成功',
      icon: 'success',
      duration: 2000
    });

    setTimeout(() => {
      wx.switchTab({
        url: '/pages/userMsg/userMsg',
        success: () => {
          const targetPage = getCurrentPages().pop();
          if (targetPage) {
            targetPage.onLoad();
          }
        }
      });

      const homePage = getCurrentPages().find(page => page.route === "pages/home/home");
      if (homePage) {
        homePage.onLoad();
      }
    }, 2000);
  },

  onLoad(options) {
    // console.log(options);
    const coalorder = options && options.coalorder ? JSON.parse(options.coalorder) : null;
    if (!coalorder) {
      console.log("没有找到coal_order");
      return;
    }
    this.setData({
      coalorder: coalorder
    });
  },

  onReady() {},

  onShow() {},

  onHide() {},

  onUnload() {},

  onPullDownRefresh() {},

  onReachBottom() {},

  onShareAppMessage() {}
});