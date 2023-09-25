const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017"
const rdb = 'test'
const rcollection = 'user'

const connectDB = () => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        console.log("数据库已创建!");
        db.close();
    });
}

const createCollection = () => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        console.log('数据库已创建');
        var dbase = db.db(rdb);
        dbase.createCollection(rcollection, function (err, res) {
            if (err) throw err;
            console.log("创建集合!");
            db.close();
        });
    });
}

const insert = (myobj) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db(rdb);
        dbo.collection(rcollection).insertOne(myobj, function (err, res) {
            if (err) throw err;
            console.log("文档插入成功");
            db.close();
        });
    });
}

const findByUsername = (username, sendRes) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db(rdb);
        var whereStr = { "username": username };  // 查询条件
        dbo.collection(rcollection).find(whereStr).toArray(function (err, result) {
            if (err) throw err;
            // console.log(result);
            sendRes(result)
            db.close();
        });
    });
}


const changePwd = (myobj) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db(rdb);
        dbo.collection(rcollection).updateOne({
            username: myobj.username
        }, {
            $set: {password: myobj.newPassword}
        }, function (err, res) {
            if (err) throw err;
            console.log("文档更新成功");
            db.close();
        });
    });
}

module.exports = {
    createCollection,
    connectDB,
    insert,
    changePwd,
    findByUsername
}