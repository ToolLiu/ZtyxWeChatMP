const express=require('express')
const app=express()

const path = require('path');
// 部署静态资源, 部署之后即可通过域名访问文件
app.use(express.static('public'))
//解析json数据的中间件
app.use(express.json())
//配置解析 application/x-www-form-urlencoded 格式数据的内置中间件
app.use(express.urlencoded({ extended: false }))

//封装res.send方法
app.use((req, res, next) => {
  res.cc = (err, status = 302) => {
      res.send({
          status,
          message: err instanceof Error ? err.message : err
      })
  }
  next()
})

//解析token的中间件
const expressJWT = require('express-jwt')
//引入全局配置文件
const config = require('./config')
// app.use(expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/api/] }))



//导入并使用用户路由模块
// const userRouter = require('./router/user')
// app.use('/api', userRouter)

//导入并使用提煤信息路由模块
const coal_msg = require('./router/coal_msg')
app.use('/coal_msg', coal_msg)

//错误中间件
const joi = require('joi')
app.use((err, req, res, next) => {
  if (err instanceof joi.ValidationError) return res.cc(err)
  if (err.name === 'UnauthorizedError') {
      // console.log(err);
      return res.cc('身份认证失败!')
  }
  res.cc(err)
})

app.listen(8121,'127.0.0.1', () => {
  console.log('server running at 127.0.0.1:8121')
})
