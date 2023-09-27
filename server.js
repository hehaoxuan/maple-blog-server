const express = require("express");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const { connectDB } = require("./database/blog.js");
const bodyParser = require("body-parser");
const app = express();

// /[a-zA-Z]+\/[a-zA-Z]+/
app.all(/[a-zA-Z]+\/[a-zA-Z]+/, (req, res, next) => {
  // google需要配置，否则报错cors error
  res.setHeader("Access-Control-Allow-Credentials", "true");
  // 允许的地址,http://127.0.0.1:9000这样的格式
  res.setHeader("Access-Control-Allow-Origin", req.get("Origin"));
  // 允许跨域请求的方法
  res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  // 允许跨域请求header携带哪些东西
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, If-Modified-Since"
  );
  next();
});
app.use(express.urlencoded());
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use("/user", userRoute);
app.use("/blog", blogRoute);

connectDB();
const server = app.listen(8081, function () {
  let host = server.address().address || "localhost";
  host === "::" ? "localhost" : host;
  let port = server.address().port;

  console.log(`应用实例，访问地址为 http://localhost:${port}`);
});
