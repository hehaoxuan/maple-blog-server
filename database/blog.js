const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";
const rdb = "test";
const rcollection = "blog";

const connectDB = () => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    console.log("数据库已创建!");
    db.close();
  });
};

const createCollection = () => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    console.log("数据库已创建");
    var dbase = db.db(rdb);
    dbase.createCollection(rcollection, function (err, res) {
      if (err) throw err;
      console.log("创建集合!");
      db.close();
    });
  });
};

const findAll = (sendRes) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(rdb);
    dbo
      .collection(rcollection)
      .find({})
      .sort({
        _id: -1,
      })
      .toArray(function (err, result) {
        // 返回集合中所有数据
        if (err) throw err;
        db.close();
        sendRes(result);
      });
  });
};

const findPaging = (sendRes, page, pageSize) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    const dbo = db.db(rdb);
    dbo.collection(rcollection).countDocuments({}, function (err, totalCount) {
      if (err) throw err;
      // 计算要跳过的文档数量
      const skipAmount = (page - 1) * pageSize;
      // 查询分页数据
      dbo
        .collection(rcollection)
        .find({})
        .sort({ _id: -1 })
        .skip(skipAmount)
        .limit(Number(pageSize))
        .toArray(function (err, result) {
          if (err) throw err;
          db.close();

          // 将分页数据和总数包含在响应中
          sendRes({
            data: result,
            success: true,
            total: totalCount,
          });
        });
    });
  });
};

const findAllIsAuditing = (isAuditing, sendRes) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(rdb);
    var whereStr = {
      auditing: isAuditing,
    }; // 查询条件
    dbo
      .collection(rcollection)
      .find(whereStr)
      .sort({
        _id: -1,
      })
      .toArray(function (err, result) {
        // 返回集合中所有数据
        if (err) throw err;
        db.close();
        sendRes(result);
      });
  });
};

// 根据Blog id审核blog
const auditingByUid = (uid, auditing) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(rdb);
    var whereStr = {
      blogId: uid,
    }; // 查询条件
    var updateStr = {
      $set: {
        auditing: auditing,
      },
    };

    dbo
      .collection(rcollection)
      .updateOne(whereStr, updateStr, function (err, res) {
        if (err) throw err;
        console.log("文档更新成功");
        console.log(res);
        db.close();
      });
  });
};

const findByUid = (uid, sendRes) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(rdb);
    var whereStr = {
      blogId: uid,
    }; // 查询条件
    dbo
      .collection(rcollection)
      .find(whereStr)
      .toArray(function (err, result) {
        if (err) throw err;
        sendRes(result);
        db.close();
      });
  });
};

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
};

const updateOne = (uid, str) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(rdb);
    var whereStr = {
      blogId: uid + "",
    }; // 查询条件
    var updateStr = {
      $set: {
        ...str,
      },
    };
    var options = { upsert: true };

    dbo
      .collection(rcollection)
      .updateOne(whereStr, updateStr, options, function (err, res) {
        if (err) throw err;
        console.log("文档更新成功");
        db.close();
      });
  });
};

const search = (keywords, sendRes) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(rdb);
    var whereStr = {
      $or: [
        {
          title: new RegExp(keywords),
        },
        {
          describe: new RegExp(keywords),
        },
      ],
    }; // 查询条件
    dbo
      .collection(rcollection)
      .find(whereStr)
      .toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
        sendRes(result);
        db.close();
      });
  });
};

const deleteByUid = (uid) => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db(rdb);
    var whereStr = {
      blogId: uid,
    }; // 查询条件
    dbo.collection(rcollection).deleteOne(whereStr, function (err, obj) {
      if (err) throw err;
      db.close();
    });
  });
};

module.exports = {
  createCollection,
  connectDB,
  insert,
  findAll,
  findByUid,
  search,
  findAllIsAuditing,
  auditingByUid,
  deleteByUid,
  updateOne,
  findPaging,
};
