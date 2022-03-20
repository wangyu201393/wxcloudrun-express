const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const request = require('request');
const { init: initDB, Counter } = require("./db");

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

const bodyParser = require('body-parser')
const axios = require('axios')

const PORT = process.env.PORT || 80
const HOST = '0.0.0.0'

app.use(bodyParser.raw())
app.use(bodyParser.json({}))
app.use(bodyParser.urlencoded({ extended: true }))

const client = axios.default

app.post('/api/message', async (req, res) => {
    const headers = req.headers
    const token = headers['x-wx-cloudbase-access-token']
    const weixinAPI = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send`
    
    const payload = {
        cloudbase_access_token: token,
        touser: headers['x-wx-openid'],
        template_id: 'd7XQzPj4rx9b3McEVbuo_C7TPXuL6B5hDvGQwKIqrx8',
        page: 'pages/albumMaker/assetsManager/assetsManager',
        miniprogram_state: 'trial',
        data: {
            name2: {
                value: "义眼丁真"
            },
            thing3: {
                value: "1234567890"
            },
            phrase1: {
                value: "真"
            },
        }
    }
    // dispatch to wx server
    const result = await client.post(weixinAPI, payload)
    console.log('received request', req.body, result.data)
    res.send('success')

    /*
    return new Promise((resolve, reject) => {
        request({
            method: 'POST',
            url: 'https://api.weixin.qq.com/cgi-bin/message/custom/send',
            body: JSON.stringify(payload)
        }, function (error, response) {
            console.log('接口返回内容', response.body)
            resolve(JSON.parse(response.body))
        })
    })
    */
});
/*
app.listen(PORT, HOST)
console.log(`Running on http://${HOST}:${PORT}`)
*/

// 获取分享二维码
app.post("/api/getQR", async (req, res) => {
    const headers = req.headers
    // const token = headers['x-wx-cloudbase-access-token']
    const weixinAPI = 'https://api.weixin.qq.com/wxa/getwxacodeunlimit'
    const payload = {
        // cloudbase_access_token: token,
        // page: req.body.path,
        encoding: null,
        scene: req.body.query
    }
    console.log("payload: ");
    console.log(JSON.stringify(payload), null, 4);

    return new Promise((resolve, reject) => {
        request({
            method: 'POST',
            url: weixinAPI,
            body: JSON.stringify(payload)
        }, function (error, response) {
            // console.log('接口返回内容', response.body)
            // resolve(JSON.parse(response.body))
            // console.log(JSON.stringify(response, null, 4));
            console.log("------");
            // console.log(response.body);
            res.send(response.body.toString('base64'));
        })
    })
});

// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 更新计数
app.post("/api/count", async (req, res) => {
  const { action } = req.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }
  res.send({
    code: 0,
    data: '114514',
  });
});

// 获取计数
app.get("/api/count", async (req, res) => {
  const result = await Counter.count();
  res.send({
    code: 0,
    data: result,
  });
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.send(req.headers["x-wx-openid"]);
  }
});

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
