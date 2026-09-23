// bilibili_relates.js
// 过滤视频播放页下方的推荐广告及横幅
let body = JSON.parse($response.body);

if (body && body.data) {
  // 1. 抹除播放页顶部/插播广告组件
  delete body.data.cms;
  delete body.data.cm_config;
  delete body.data.ad_info;
  
  // 2. 过滤推荐视频列表中的广告卡片
  if (Array.isArray(body.data.relates)) {
    body.data.relates = body.data.relates.filter(item => {
      // 匹配常见广告标识 (Ad, CM, 游戏推广等)
      if (item.is_ad || item.goto === 'ad' || item.goto === 'cm' || item.goto === 'game') return false;
      if (item.ad_info || item.banner_item || item.is_ad_loc) return false;
      return true;
    });
  }
}

$done({ body: JSON.stringify(body) });