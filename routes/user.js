const {
    user_sendVcode,
    user_register,
    user_change_password,
    user_login
} = require('../controllers/user.js')
const bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const express = require('express') //调用构造函数 新建app
const router = express.Router(); //使用express的router

router.post('/vcode', urlencodedParser, user_sendVcode) // 发送验证码
router.post('/register', urlencodedParser, user_register) // 注册接口
router.post('/changePassword', urlencodedParser, user_change_password) // 注册接口
router.post('/login', user_login) // 登陆接口


module.exports = router