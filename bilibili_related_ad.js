// bilibili_relates.js (深度净化版)
// 过滤视频播放页下方的广告、推广(小火箭)、商品带货、直播及乱七八糟的卡片
let body = JSON.parse($response.body);

if (body && body.data) {
  // 1. 抹除播放页顶部/插播广告组件及游戏挂件
  delete body.data.cms;
  delete body.data.cm_config;
  delete body.data.ad_info;
  delete body.data.game_pay_plugin;

  // 2. 深度过滤相关推荐列表 (relates)
  if (Array.isArray(body.data.relates)) {
    body.data.relates = body.data.relates.filter(item => {
      // --- A. 类型拦截 (goto 字段) ---
      // 剔除：广告(ad/cm)、直播(live)、商品(goods)、游戏(game)、专题(special)、卡片(card)
      const invalidGotos = ['ad', 'cm', 'live', 'goods', 'game', 'special', 'special_s', 'card'];
      if (invalidGotos.includes(item.goto)) return false;

      // --- B. 属性特征拦截 (直播间 ID、商品信息、广告标记) ---
      if (item.live_id || item.roomid) return false;      // 拦截直播
      if (item.goods_info) return false;                  // 拦截带货商品
      if (item.is_ad || item.ad_info || item.banner_item || item.is_ad_loc) return false; // 拦截常规广告

      // --- C. 角标/标签拦截 (清除右下角“小火箭”、推广、热推等) ---
      const badgeText = item.badge || (item.badge_info && item.badge_info.text) || '';
      const rcmdText = (item.rcmd_reason && item.rcmd_reason.content) || '';
      const forbiddenKeywords = ['广告', '推广', '热推', '赞助', '商品', '带货', '直播', '预约'];

      // 只要角标或推荐理由里包含以上关键词，一律剔除
      if (forbiddenKeywords.some(kw => badgeText.includes(kw) || rcmdText.includes(kw))) {
        return false;
      }

      return true;
    });
  }
}

$done({ body: JSON.stringify(body) });
