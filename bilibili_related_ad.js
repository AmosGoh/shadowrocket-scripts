// bilibili_relates.js (深度净化增强版)
// 过滤视频播放页下方的广告、推广(小火箭)、直播、商品带货、专题卡片等

let body;
try {
  body = JSON.parse($response.body);
} catch (e) {
  $done({}); // 解析失败，直接返回原数据
}

if (body && body.data) {
  // 1. 抹除播放页顶部/插播广告组件、活动 Banner 及游戏挂件
  delete body.data.cms;
  delete body.data.cm_config;
  delete body.data.ad_info;
  delete body.data.game_pay_plugin;
  delete body.data.play_ad_info;
  delete body.data.relate_game;
  delete body.data.activity_banner;
  delete body.data.v_banner;

  // 2. 深度过滤相关推荐列表 (relates)
  if (Array.isArray(body.data.relates)) {
    body.data.relates = body.data.relates.filter(item => {
      // --- A. 类型拦截 (goto 字段) ---
      // 剔除：广告(ad/cm/ad_cm)、直播(live)、商品(goods)、游戏(game/game_card)、专题(special/special_s/sp)、卡片(card/short_video_card/vertical_large_cover)、横幅(banner)
      const invalidGotos = [
        'ad', 'cm', 'ad_cm', 'live', 'goods', 'game', 'game_card', 
        'special', 'special_s', 'sp', 'card', 'short_video_card', 
        'vertical_large_cover', 'banner'
      ];
      if (invalidGotos.includes(item.goto)) return false;

      // --- B. 属性特征拦截 (直播间 ID、商品信息、广告标记) ---
      if (item.live_id || item.roomid) return false;      // 拦截直播
      if (item.goods_info) return false;                  // 拦截带货商品
      if (item.is_ad || item.ad_info || item.banner_item || item.is_ad_loc) return false; // 拦截常规广告

      // --- C. 角标/标签拦截 (清除右下角“小火箭”、推广、热推等) ---
      // 针对“小火箭”图标及最新版结构，同时检查 text、text_new 以及全对象字符串提取
      const badgeText = item.badge || (item.badge_info && (item.badge_info.text || item.badge_info.text_new)) || '';
      const badgeInfoStr = item.badge_info ? JSON.stringify(item.badge_info) : '';
      const rcmdText = (item.rcmd_reason && item.rcmd_reason.content) || '';
      
      // 禁用关键词列表（包含“小火箭”推广的常见文案及标识）
      const forbiddenKeywords = [
        '广告', '推广', '热门推广', '赞助', '付费推广', '流量包', 
        'UP主热推', 'UP主推荐', '热推', '系统精选', '商品', '带货', 
        '直播', '预约', '游戏下载'
      ];

      // 判断角标、推荐理由或 badge_info 结构中是否包含禁用关键词
      if (forbiddenKeywords.some(kw => badgeText.includes(kw) || rcmdText.includes(kw) || badgeInfoStr.includes(kw))) {
        return false;
      }

      return true;
    });
  }
}

$done({ body: JSON.stringify(body) });
