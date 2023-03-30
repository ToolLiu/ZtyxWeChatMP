const db = require('../db/index')

//获取用户信息的处理函数
exports.getCoalMsg = (req, res) => {
  const sqlStr = 'select * from coal_msg'
  db.query(sqlStr, (err, results) => {
      if (err) console.log(err);
      res.json(results)
      console.log(results);
  })
}