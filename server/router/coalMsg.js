const express = require("express");
//导入路由中间件
const router = express.Router();

const coal_msgHandler = require('../router_handler/coal_msg')
//配置路由
router.get("/get",coal_msgHandler.getCoalMsg)

router.get("/smile",function(req,res){
    res.json({code: 2, msg: "222222"});
})

//导出
module.exports = {
    router:router
}
