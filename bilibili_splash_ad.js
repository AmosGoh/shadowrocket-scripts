// bilibili_splash.js
// 返回合法的空响应 JSON，阻止 App 触发 5 秒本地兜底屏
$done({
    response: {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        "code": 0,
        "message": "0",
        "ttl": 1,
        "data": {
          "max_time": 0,
          "min_interval": 86400,
          "pull_interval": 86400,
          "list": [],
          "show": []
        }
      })
    }
  });
