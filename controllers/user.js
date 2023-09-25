const fs = require("fs");
const path = require("path");

const { sendEmail, randomStr } = require('../tools/index');
const { decrypt } = require('../tools/index')
const {
    insert,
    findByUsername,
    changePwd
} = require("../database/user.js");

// 使用strarr来存储发送验证码的用户 并提供后续的比对
let strarr = []


const user_sendVcode = (req, res) => {
    const { id } = JSON.parse(Object.keys(req.body)[0]);
    console.log(id);
    let str = randomStr(6) //生成6位随机验证码
    /* 调用邮箱服务 发送邮件 */
    sendEmail(str,'851889398@qq.com')
    console.log('验证码为' + str);

    /* 先找有无重复,若重复则删除原来的数据 */
    strarr.map((item, index) => {
        if (item.id === id) {
            strarr.splice(index, 1)
        }
    })

    /* 存入数组中 */
    strarr.push({ id, str })
    setTimeout(() => {
        /* 验证码有效时间 隔一段时间以后删除该数据 */
        strarr = strarr.find((item) => item.id !== id)
    }, 1000 * 60 * 10)
    res.send('success')
};


const user_register = (req, res) => {
    let userdata = req.body
    /* 根据id验证vcode是否正确 */
    let aimstr = strarr.find(item => item.id === userdata.id)
    console.log(aimstr, userdata.vcode);
    if (!aimstr) {
        res.send({ code: 0 }) //未发送验证码
    } else {
        if (aimstr && aimstr.str === userdata.vcode) { //证明验证码正确
            /* 将密码解码 并处理数据*/
            userdata.password = (decrypt(userdata.password));
            /* 根据id判断是否管理员 */
            userdata.id === 'admin' ? userdata.root = true : userdata.root = false
            delete userdata.vcode
            delete userdata.id
            /* 写入数据库 */
            insert(userdata)
            console.log(userdata);
            /* 响应成功 完成注册*/
            res.send({ code: 1 })
        } else {/* 若不正确则返回错误信息 */
            res.send({ code: -1 }) //代表验证码错误
        }
    }
};


const user_change_password = (req, res) => {
    let userdata = req.body
    /* 根据id验证vcode是否正确 */
    let aimstr = strarr.find(item => item.id === userdata.username)
    console.log(aimstr, userdata.vcode);
    if (!aimstr) {
        res.send({ code: 0 }) //未发送验证码
    } else {
        if (aimstr && aimstr.str === userdata.vcode) { //证明验证码正确
            /* 将密码解码 并处理数据*/
            userdata.password = (decrypt(userdata.password));
            userdata.newPassword = (decrypt(userdata.newPassword));
            /* 根据id判断是否管理员 */
            userdata.id === 'admin' ? userdata.root = true : userdata.root = false
            delete userdata.vcode
            delete userdata.id
            findByUsername(userdata.username, (data) => {
                if(data.length<=0){
                    res.send({code:-1})
                }else if(data[0].password !== userdata.password){
                    res.send({code:-2})
                }else if(data[0].password === userdata.password){
                    // 原密码正确,修改密码
                    changePwd(userdata);
                    res.send({code:1})
                }
            })
        } else {/* 若不正确则返回错误信息 */
            res.send({ code: -1 }) //代表验证码错误
        }
    }
};

const user_login = (req, res) => {
    const checkpassword = function(data){
        if(data.length<=0){
            res.send({code:-1})
        }else if(data[0].password !== userdata.password){
            res.send({code:-2})
        }else if(data[0].password === userdata.password){
            res.send({code:1,token:data[0]._id,root:data[0].root})
        }
    }

    let userdata = req.body
    /* 解码密码 */
    userdata.password = (decrypt(userdata.password));
    /* 根据账户密码查找数据库 若正确则返回code 1 及 token */
    findByUsername(userdata.username,checkpassword)
    /* 若不正确则返回code -1 */
};



module.exports = {
    user_sendVcode,
    user_register,
    user_change_password,
    user_login
};