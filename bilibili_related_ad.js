// bilibili_relates.js (深度净化版)
// 过滤视频播放页下方的广告、推广(小火箭)、直播、商品带货、专题卡片等
let body;
try {
  body = JSON.parse($response.body);
} catch (e) {
  $done({}); // 解析失败，直接返回原数据
}

if (body && body.data) {
  // 1. 抹除播放页顶部/插播广告组件及游戏挂件
  delete body.data.cms;
  delete body.data.cm_config;
  delete body.data.ad_info;
  delete body.data.game_pay_plugin;
  delete body.data.play_ad_info;

  // 2. 深度过滤相关推荐列表 (relates)
  if (Array.isArray(body.data.relates)) {
    body.data.relates = body.data.relates.filter(item => {
      // --- A. 类型拦截 (goto 字段) ---
      // 剔除：广告(ad/cm)、直播(live)、商品(goods)、游戏(game)、专题(special)、卡片(card)、短视频(short_video_card)、横幅(banner)
      const invalidGotos = ['ad', 'cm', 'live', 'goods', 'game', 'special', 'special_s', 'card', 'short_video_card', 'banner'];
      if (invalidGotos.includes(item.goto)) return false;

      // --- B. 属性特征拦截 (直播间 ID、商品信息、广告标记) ---
      if (item.live_id || item.roomid) return false;      // 拦截直播
      if (item.goods_info) return false;                  // 拦截带货商品
      if (item.is_ad || item.ad_info || item.banner_item || item.is_ad_loc) return false; // 拦截常规广告

      // --- C. 角标/标签拦截 (清除右下角“小火箭”、推广、热推等) ---
      // 针对“小火箭”图标，它通常意味着“流量包推广”，文案可能在 item.badge 活 item.badge_info.text 中
      const badgeText = item.badge || (item.badge_info && item.badge_info.text) || '';
      const rcmdText = (item.rcmd_reason && item.rcmd_reason.content) || '';
      
      // 更完整的禁用关键词列表，专门包含针对“小火箭”推广的常见角标
      const forbiddenKeywords = ['广告', '推广', '热门推广', '赞助', '付费推广', '流量包', 'UP主热推', 'UP主推荐', '热推', '系统精选', '商品', '带货', '直播', '预约'];

      // 只要角标或推荐理由里包含以上任一关键词，一律剔除
      if (forbiddenKeywords.some(kw => badgeText.includes(kw) || rcmdText.includes(kw))) {
        return false;
      }

      return true;
    });
  }
}

$done({ body: JSON.stringify(body) });
