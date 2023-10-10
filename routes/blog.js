const {
  blog_all,
  blog_all_paging,
  blog_video_play,
  blog_video_download,
  blog_video_upload,
  blog_video_upload_img,
  blog_create_data,
  blog_get_id,
  blog_cover,
  blog_search,
  blog_all_auditing,
  blog_auditing_id,
  blog_delete_id,
  blog_edit_data,
} = require("../controllers/blogController");

var mutipart = require("connect-multiparty");
const bodyParser = require("body-parser");
// url解析
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var mutipartMiddeware = mutipart();
const express = require("express"); //调用构造函数 新建app
const router = express.Router(); //使用express的router

router.post("/allAuditing", mutipartMiddeware, blog_all_auditing); //包含上架/未上架文章
router.post("/auditing", mutipartMiddeware, blog_auditing_id); //包含审核/未审核博客
router.get("/all", blog_all); // 所有博客
router.get("/allPaging", blog_all_paging); // 所有博客 （分页）
router.get("/:id", blog_video_play); //根据id获取博客，并提供博客
router.get("/delete/:id", blog_delete_id); //根据id删除博客
router.get("/:id/download", blog_video_download); //根据id下载
router.get("/:id/cover", blog_cover); //封面头像
router.post("/detail/:id", blog_get_id); //博客详细信息
router.get("/search/:key", blog_search); //搜索信息
router.post("/add", urlencodedParser, blog_create_data); //上传表单
router.post("/editData", urlencodedParser, blog_edit_data); //上传表单
// 使用mutipart中间件 设置存储目录
router.use(mutipart({ uploadDir: "./resources" }));
router.post("/uploadVideo", mutipartMiddeware, blog_video_upload); //上传博客
router.post("/uploadImg", mutipartMiddeware, blog_video_upload_img); //上传图片

/* todo */
// router.get('/:id/recommon', blog_get_recommon)

module.exports = router;
