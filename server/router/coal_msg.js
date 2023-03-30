const express = require('express')
const router = express.Router()

const coal_msgHandler = require('../router_handler/coal_msg')

router.get('/', coal_msgHandler.getCoalMsg)

module.exports = router