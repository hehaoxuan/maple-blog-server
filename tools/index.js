const nodemailer = require('nodemailer');
const CryptoJS = require('crypto-js');

//发送邮件 
const sendEmail = (emailCode, userEmail) => {
    return new Promise((resolve, reject) => {
        // 创建可重用邮件传输器
        const transporter = nodemailer.createTransport({
            host: "smtp.163.com", // 网易的邮件地址
            port: 465, // 端口
            secureConnection: false, // use SSL
            auth: {
                "user": 'maplegov@163.com', // 邮箱账号
                "pass": 'JBLWCXCSGPVAGPDF' // 邮箱的授权码
            }
        });

        const send = (mailOptions) => {
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return console.log(error);
                }
                resolve(info.messageId)
                console.log('Message send: %s', info.messageId);
            });
        }
        let email = {
            title: '视频平台验证码',
            htmlBody: '<h1>欢迎注册!</h1><p style="font-size: 18px;color:#000;">在线的验证码为：<u style="font-size: 24px;color:#1890ff;">' +
                emailCode + '</u></p><p style="font-size: 14px;color:#666;">验证码10分钟内有效</p>'
        }
        let mailOptions = {
            from: 'maplegov@163.com', // 发件人地址
            to: userEmail, // 收件人地址，多个收件人可以使用逗号分隔
            subject: email.title, // 邮件标题
            html: email.htmlBody // 邮件内容
        };
        send(mailOptions)
    })
};

// 随机字符串
const randomStr = (length) => {
    var str = Math.random().toString(36).slice(-length);
    return str
}

// sha1加密
const encrypt = (word) => {
    var key = CryptoJS.enc.Utf8.parse("TGt3XDAteMdqZ64f");
    var srcs = CryptoJS.enc.Utf8.parse(word);
    var encrypted = CryptoJS.AES.encrypt(srcs, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

const decrypt = (word) => {
    var key = CryptoJS.enc.Utf8.parse("TGt3XDAteMdqZ64f");
    var decrypt = CryptoJS.AES.decrypt(word, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}



// sha1解密

module.exports = { sendEmail, randomStr,encrypt,decrypt}