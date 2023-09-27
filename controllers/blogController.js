const fs = require("fs");
const path = require("path");

var oldpath_img = null;
var newpath_img = null;
var oldpath_video = null;
var newpath_video = null;

const {
  insert,
  findAll,
  findByUid,
  search,
  findAllIsAuditing,
  auditingByUid,
  deleteByUid,
  updateOne,
  findPaging,
} = require("../database/blog.js");

String.prototype.getUid = function () {
  return this.replace(/[^0-9]+/g, "");
};

//将零时的资源文件重命名 并移动到对应的文件夹下
const rename = (oldpath, newpath) => {
  fs.rename(oldpath, newpath, function (err) {
    if (err) throw err;
    fs.stat(newpath, function (err, stats) {
      if (err) throw err;
      console.log("文件移动成功" + JSON.stringify(stats));
    });
  });
};

// 获取所有的博客表单 包含审核以及未审核的内容
const blog_all = async (req, res) => {
  //返回所有的video信息
  const sendRes = (data) => {
    res.send(data);
  };
  findAll(sendRes); //使用回调函数的形式进行异步的数据发送
};

// 获取所有的博客表单 包含上架及未上架的内容
const blog_all_paging = async (req, res) => {
  //返回所有的video信息
  const { current, pageSize } = req.query;
  const sendRes = (data) => {
    res.send(data);
  };
  findPaging(sendRes, current, pageSize);
};

// 获取所有已经审核的博客
const blog_all_auditing = async (req, res) => {
  //返回所有的video信息
  let { auditing } = req.body;

  const sendRes = (data) => {
    res.send(data);
  };
  findAllIsAuditing(auditing, sendRes); //使用回调函数的形式进行异步的数据发送
};

// 博客 视频流服务
const blog_video_play = (req, res) => {
  const { id: videoId } = req.params;
  // console.log(req)
  var file = path.resolve(__dirname, `../resources/video/${videoId}.mp4`);
  console.log(file);
  // 判断文件是否存在 若不存在则不进行博客流的播放
  fs.access(file, function (err) {
    if (err) {
      res.send(err);
    } else {
      fs.stat(file, function (err, stats) {
        if (err) {
          res.end(err);
        }
        var positions = req.headers.range.replace(/bytes=/, "").split("-");
        var start = parseInt(positions[0], 10);
        var total = stats.size;
        var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
        var chunksize = end - start + 1;

        res.writeHead(206, {
          "Content-Range": "bytes " + start + "-" + end + "/" + total,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/mp4",
        });

        var stream = fs
          .createReadStream(file, {
            start: start,
            end: end,
          })
          .on("open", function () {
            stream.pipe(res);
          })
          .on("error", function (err) {
            res.end(err);
          });
      });
    }
  });
};

// 根据id来获取博客的详细信息
const blog_get_id = (req, res) => {
  const sendRes = (data) => {
    res.send(data);
  };
  let { id } = req.params;
  findByUid(id, sendRes);
};

// 获取博客的封面
const blog_cover = (req, res) => {
  const { id } = req.params;
  // 根据id查找数据库中图片对于的地址
  const getAvator = (data) => {
    // console.log(data);
    const file = data[0].imgUrl;
    // // 判断文件是否存在 若不存在则不进行博客流的播放
    // console.log(file);
    fs.access(file, function (err) {
      if (err) {
        res.send(err);
      } else {
        const cs = fs.createReadStream(file);
        cs.on("data", (chunk) => {
          res.write(chunk);
        });
        cs.on("end", () => {
          res.status(200);
          res.end();
        });
      }
    });
  };

  findByUid(id, getAvator);
};

// 根据uid下载博客中的视频
const blog_video_download = (req, res) => {
  const { id: videoId } = req.params;
  // console.log(req)
  var file = path.resolve(__dirname, `../resources/video/${videoId}.mp4`);
  res.writeHead(200, {
    "Content-Type": "application/force-download",
    "Content-Disposition": "attachment; filename=" + videoId + ".mp4",
  });
  // 判断文件是否存在 若不存在则不下载
  fs.access(file, function (err) {
    if (err) {
      res.send(err);
    } else {
      fs.stat(file, function (err, stats) {
        if (err) {
          res.end(err);
        } else {
          const rs = fs.createReadStream(file);
          rs.pipe(res);
        }
      });
    }
  });
};

// 根据id审核博客
const blog_auditing_id = (req, res) => {
  const { uid: videoId, auditing } = req.body;
  console.log(videoId, auditing);
  auditingByUid(videoId, JSON.parse(auditing));
  res.send("success");
};

// 根据id删除博客
const blog_delete_id = (req, res) => {
  const { id: videoId } = req.params;
  console.log(req.params);
  deleteByUid(videoId);
  res.send("success");
};

// 上传博客接口
const blog_video_upload = (req, res) => {
  res.send("upload success!");
  let { uid } = req.body;
  uid = uid.getUid();
  const suffix = req.files.file.name.split(".").pop(); //获取后缀
  oldpath_video = path.join(__dirname, "..", req.files.file.path);
  newpath_video = path.join(
    __dirname,
    "..",
    "resources/video",
    `${uid}.${suffix}`
  );
};

// 上传图片
const blog_video_upload_img = (req, res) => {
  res.send("upload success!");
  let { uid } = req.body;
  uid = uid.getUid(); //获取纯数字的uid
  const suffix = req.files.avatar.name.split(".").pop(); //获取后缀

  oldpath_img = path.join(__dirname, "..", req.files.avatar.path);
  newpath_img = path.join(__dirname, "..", "resources/img", `${uid}.${suffix}`);
};

// 上传博客表单信息
const blog_video_upload_data = (req, res) => {
  let data = req.body;

  // console.log("表单数据为" + data);
  // 上传条件判断 不可重复上传 不可重复录入数据库
  console.log(oldpath_img, newpath_img, oldpath_video, newpath_video);
  if (oldpath_img && newpath_img && oldpath_video && newpath_video) {
    res.send({
      status: true,
    });
    rename(oldpath_video, newpath_video);
    rename(oldpath_img, newpath_img);
    //将零时的资源文件重命名 并移动到对应的文件夹下
    // 保存url 与 uid
    data.imgUrl = newpath_img;
    data.videoUrl = newpath_video;
    data.imgUid = data.avata[0].uid.getUid();
    data.videoUid = data.video.uid.getUid();
    insert(data);
    // 处理数据
    ldpath_img = newpath_img = oldpath_video = newpath_video = null;
  } else {
    res.send({
      status: false,
    });
  }
};

// 修改博客信息
const blog_edit_data = (req, res) => {
  let data = req.body;
  console.log(data);
  // 上传条件判断 不可重复上传 不可重复录入数据库
  if (oldpath_img && newpath_img) {
    res.send({
      status: true,
    });
    rename(oldpath_img, newpath_img);
    //将零时的资源文件重命名 并移动到对应的文件夹下
    // 保存url 与 uid
    data.imgUrl = newpath_img;
    data.imgUid = data.avata[0].uid.getUid();
    data.videoUid = data.videoUid;
    console.log(Object.keys(data));

    updateOne(data.videoUid, data);
    // 处理数据
    ldpath_img = newpath_img = oldpath_video = newpath_video = null;
  } else {
    res.send({
      status: false,
    });
  }
};

// 搜索博客信息
const blog_search = (req, res) => {
  const sendRes = (data) => {
    res.send(data);
  };
  let { key } = req.params;
  search(key, sendRes);
};

module.exports = {
  blog_all,
  blog_all_paging,
  blog_video_play,
  blog_video_download,
  blog_video_upload,
  blog_video_upload_img,
  blog_video_upload_data,
  blog_get_id,
  blog_cover,
  blog_search,
  blog_auditing_id,
  blog_all_auditing,
  blog_delete_id,
  blog_edit_data,
};
