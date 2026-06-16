<script setup>
  import { computed, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { ElMessage } from "element-plus";
  import {
    ChatLineRound,
    DataAnalysis,
    Grid,
    Histogram,
    PriceTag,
    Promotion,
    TrendCharts,
    Warning,
  } from "@element-plus/icons-vue";
  import DockNav from "../components/DockNav.vue";
  import { dockItems } from "../config/dockItems";

  const route = useRoute();
  const router = useRouter();

  const activeDock = computed(() => route.meta.dockKey || "cofcoSocial");
  const activeModule = ref("monitor");
  const activeTopic = ref("健康早餐");
  const selectedTime = ref("近30天");
  const selectedCategory = ref("谷物早餐");
  const selectedPlatform = ref("全平台");

  const modules = [
    { key: "monitor", label: "监测看板", summary: "本品与品类社媒表现" },
    { key: "competitor", label: "竞品分析", summary: "本品 vs 竞品机会" },
    { key: "campaign", label: "活动评估", summary: "活动效果与复盘" },
    { key: "audience", label: "人群画像", summary: "识别人群与需求" },
    { key: "innovation", label: "产品创新", summary: "新品机会与概念验证" },
    { key: "ecommerce", label: "电商融合", summary: "种草到转化闭环" },
  ];

  const filters = {
    times: ["近7天", "近30天", "近90天"],
    categories: ["谷物早餐", "粮油米面", "乳品饮料", "休闲食品"],
    platforms: ["全平台", "抖音", "小红书", "微博"],
  };

  const monitorKpis = [
    { label: "曝光量", value: "3,280万", change: "+18.6%", tone: "primary" },
    { label: "声量", value: "8.64万", change: "+12.4%", tone: "green" },
    { label: "互动量", value: "72.8万", change: "+21.9%", tone: "warm" },
    { label: "正面率", value: "76%", change: "+4.2pp", tone: "blue" },
  ];

  const socialTrend = [
    { day: "06/01", value: 36 },
    { day: "06/05", value: 42 },
    { day: "06/09", value: 57 },
    { day: "06/13", value: 64 },
    { day: "06/17", value: 58 },
    { day: "06/21", value: 73 },
    { day: "06/25", value: 88 },
  ];

  const platformMix = [
    { name: "抖音", value: 46, meta: "曝光贡献最高", tone: "primary" },
    { name: "小红书", value: 34, meta: "正面口碑最高", tone: "warm" },
    { name: "微博", value: 20, meta: "热点扩散最快", tone: "green" },
  ];

  const topics = [
    { name: "健康早餐", heat: 94, sentiment: "82% 正面", brands: "中粮、桂格、王饱饱" },
    { name: "高纤维", heat: 78, sentiment: "76% 正面", brands: "中粮、欧扎克" },
    { name: "家庭囤货", heat: 71, sentiment: "73% 正面", brands: "中粮、金龙鱼" },
    { name: "低糖轻负担", heat: 65, sentiment: "79% 正面", brands: "中粮、西麦" },
    { name: "办公室代餐", heat: 58, sentiment: "68% 正面", brands: "中粮、好麦多" },
  ];

  const selectedTopicDetail = computed(
    () => topics.find((item) => item.name === activeTopic.value) || topics[0],
  );

  const hotContents = [
    {
      title: "7天早餐不重样：燕麦、坚果和牛奶的快手组合",
      platform: "小红书",
      metric: "8.6万互动",
      tag: "食谱种草",
    },
    {
      title: "家庭装粮油囤货清单，618前后价格对比",
      platform: "抖音",
      metric: "6.9万互动",
      tag: "家庭场景",
    },
    {
      title: "控糖人群如何挑早餐谷物？成分表避坑指南",
      platform: "微博",
      metric: "4.1万互动",
      tag: "健康科普",
    },
  ];

  const categorySignals = [
    { label: "消费场景", value: "早餐、健身、亲子、办公室", icon: Grid },
    { label: "关注因素", value: "口味、成分、价格、便携性", icon: PriceTag },
    { label: "负面聚类", value: "偏甜、价格贵、包装破损", icon: Warning },
  ];

  const sentimentMix = [
    { label: "正面", value: 76, tone: "primary", note: "健康、品质、方便" },
    { label: "中性", value: 17, tone: "green", note: "价格、规格询问" },
    { label: "负面", value: 7, tone: "warm", note: "偏甜、破损、等待售后" },
  ];

  const monitorAlerts = [
    { title: "负面评价上升", level: "中", detail: "小红书近 3 天集中提到“偏甜”，需回看产品口味反馈。" },
    { title: "竞品话题升温", level: "高", detail: "桂格“早餐代餐”内容互动连续 4 天高于本品。" },
    { title: "家庭囤货机会", level: "低", detail: "618 后家庭装讨论仍有长尾，适合补充货架与内容承接。" },
  ];

  const competitors = [
    { name: "中粮本品", exposure: 1280, buzz: 3.2, interaction: 18.6, positive: 76, kol: 126 },
    { name: "桂格", exposure: 1800, buzz: 4.5, interaction: 31.2, positive: 68, kol: 210 },
    { name: "西麦", exposure: 950, buzz: 2.1, interaction: 11.4, positive: 75, kol: 88 },
  ];

  const competitorTopics = [
    { name: "早餐代餐", own: 56, rival: 83 },
    { name: "高纤低糖", own: 74, rival: 69 },
    { name: "家庭装", own: 82, rival: 51 },
    { name: "达人测评", own: 48, rival: 78 },
  ];

  const competitorInsights = [
    "本品在小红书正面率较高，用户更认可健康、品质和家庭场景。",
    "桂格在抖音互动更强，主要来自达人短视频和测评内容密集发布。",
    "本品在“早餐代餐”话题弱于桂格，可作为下一轮内容运营方向。",
    "西麦负面集中在价格高，本品可强化家庭装和性价比表达。",
  ];

  const competitorContent = [
    { title: "桂格高纤燕麦测评", type: "达人测评", platform: "抖音", value: "12.8万互动" },
    { title: "西麦低糖早餐挑战", type: "生活方式", platform: "小红书", value: "7.4万收藏" },
    { title: "早餐代餐横评合集", type: "横向评测", platform: "微博", value: "2.6万转发" },
  ];

  const competitorSignals = [
    { label: "口碑差异", value: "本品强在品质与家庭场景，桂格强在代餐心智，西麦强在性价比认知。", icon: ChatLineRound },
    { label: "达人策略", value: "桂格头部达人声量更集中，本品腰部食谱达人转评收藏效率更稳。", icon: Promotion },
    { label: "投放观察", value: "疑似商业内容集中在测评、早餐挑战、控糖科普三类内容。", icon: DataAnalysis },
  ];

  const campaignKpis = [
    { label: "活动曝光量", value: "3,200万", change: "+42.5%", tone: "primary" },
    { label: "活动声量", value: "8.6万", change: "+36.8%", tone: "green" },
    { label: "活动互动量", value: "72.4万", change: "+51.2%", tone: "warm" },
    { label: "参与达人", value: "186位", change: "+24位", tone: "blue" },
  ];

  const campaignStages = [
    { name: "预热期", value: 38, text: "话题铺垫" },
    { name: "爆发期", value: 92, text: "达人集中发布" },
    { name: "长尾期", value: 57, text: "评论与收藏延续" },
  ];

  const campaignPlatformEffects = [
    { name: "抖音", value: 52, meta: "曝光主阵地", tone: "primary" },
    { name: "小红书", value: 31, meta: "口碑与收藏最佳", tone: "warm" },
    { name: "微博", value: 17, meta: "话题扩散补充", tone: "green" },
  ];

  const contentTypeMix = [
    { name: "食谱种草", value: 34 },
    { name: "达人测评", value: 27 },
    { name: "健康科普", value: 22 },
    { name: "直播切片", value: 17 },
  ];

  const campaignBeforeAfter = [
    { label: "品牌声量", before: "3.1万", after: "8.6万", lift: "+177%" },
    { label: "正面率", before: "69%", after: "76%", lift: "+7pp" },
    { label: "早餐场景占比", before: "22%", after: "39%", lift: "+17pp" },
  ];

  const commentSignals = [
    "用户更容易被“快手早餐组合”和“高纤维”表达触发收藏。",
    "价格敏感评论主要集中在抖音，建议搭配家庭装、组合装解释。",
    "包装便携性和控糖成分表是下一轮内容答疑重点。",
  ];

  const creatorRank = [
    { name: "营养师林可", type: "健康科普", score: 96, cpe: "0.42元" },
    { name: "早餐实验室", type: "食谱达人", score: 89, cpe: "0.51元" },
    { name: "家庭采购指南", type: "家庭消费", score: 84, cpe: "0.58元" },
  ];

  const campaignConclusions = [
    "小红书带来最高正面口碑，适合继续强化种草和食谱内容。",
    "抖音贡献最大曝光，但评论区价格敏感度更高。",
    "“健康早餐”“高纤维”“家庭囤货”是活动期间增长最快的话题。",
    "下一轮建议增加早餐场景达人和家庭消费场景内容。",
  ];

  const audienceKpis = [
    { label: "核心人群", value: "5类", change: "已建画像", tone: "primary" },
    { label: "人群声量", value: "5.8万", change: "+19.2%", tone: "green" },
    { label: "互动贡献", value: "61%", change: "+8.4pp", tone: "warm" },
    { label: "正面率", value: "78%", change: "+5.1pp", tone: "blue" },
  ];

  const audienceSegments = [
    {
      name: "年轻白领",
      size: "31%",
      platform: "小红书 / 抖音",
      scene: "快手早餐、办公室代餐",
      needs: ["便携", "低糖", "高纤"],
      sentiment: 82,
    },
    {
      name: "宝妈家庭",
      size: "24%",
      platform: "小红书 / 微博",
      scene: "儿童早餐、家庭囤货",
      needs: ["安全", "营养", "家庭装"],
      sentiment: 79,
    },
    {
      name: "健身控",
      size: "18%",
      platform: "抖音 / 小红书",
      scene: "运动后、控卡代餐",
      needs: ["高蛋白", "低脂", "饱腹"],
      sentiment: 74,
    },
    {
      name: "控糖人群",
      size: "16%",
      platform: "小红书 / 微博",
      scene: "低糖早餐、成分对比",
      needs: ["低 GI", "无添加", "低糖"],
      sentiment: 81,
    },
  ];

  const audienceTags = [
    { label: "基础标签", value: "年龄、性别、地域、平台活跃度" },
    { label: "兴趣标签", value: "健身、轻食、亲子、成分党、国货" },
    { label: "场景标签", value: "早餐、办公室、亲子、运动后、家庭囤货" },
    { label: "需求标签", value: "低糖、高纤、高蛋白、便携、性价比" },
  ];

  const audienceNeeds = [
    { name: "控糖低负担", young: 72, family: 46, fitness: 81 },
    { name: "营养安全", young: 54, family: 88, fitness: 62 },
    { name: "便携即食", young: 86, family: 51, fitness: 69 },
    { name: "高蛋白饱腹", young: 58, family: 42, fitness: 90 },
  ];

  const customAudienceRules = [
    "平台：小红书 + 抖音",
    "话题：低糖 / 控糖 / 健康早餐",
    "行为：收藏食谱、评论成分表、关注代餐测评",
    "输出：控糖早餐人群包，建议用于新品概念测试",
  ];

  const audienceInterestGraph = [
    { name: "低糖", value: 92, tone: "primary" },
    { name: "轻食", value: 84, tone: "green" },
    { name: "亲子早餐", value: 78, tone: "warm" },
    { name: "成分表", value: 74, tone: "blue" },
    { name: "高蛋白", value: 68, tone: "primary" },
    { name: "国货", value: 55, tone: "green" },
  ];

  const audiencePreferenceRows = [
    { audience: "年轻白领", brand: "中粮本品", content: "食谱种草 / 便利早餐", sentiment: "82%" },
    { audience: "宝妈家庭", brand: "中粮本品 / 西麦", content: "亲子营养 / 家庭囤货", sentiment: "79%" },
    { audience: "健身控", brand: "桂格 / 欧扎克", content: "达人测评 / 成分科普", sentiment: "74%" },
    { audience: "控糖人群", brand: "中粮本品 / 桂格", content: "低 GI / 成分对比", sentiment: "81%" },
  ];

  const audienceMigration = [
    { from: "低糖", to: "低 GI", value: 82 },
    { from: "代餐", to: "高蛋白饱腹", value: 74 },
    { from: "早餐", to: "办公室即食", value: 69 },
    { from: "家庭装", to: "亲子营养包", value: 63 },
  ];

  const innovationKpis = [
    { label: "上升趋势", value: "8个", change: "低 GI 领先", tone: "primary" },
    { label: "未满足需求", value: "12项", change: "+3项", tone: "green" },
    { label: "概念机会", value: "5个", change: "可进入验证", tone: "warm" },
    { label: "竞品空白", value: "4类", change: "家庭装突出", tone: "blue" },
  ];

  const innovationTrends = [
    { name: "低 GI", heat: 92, growth: "+36%", note: "控糖与轻负担讨论增长最快" },
    { name: "高蛋白", heat: 84, growth: "+28%", note: "健身控和白领代餐共同推动" },
    { name: "全谷物", heat: 78, growth: "+21%", note: "健康早餐内容中高频出现" },
    { name: "家庭装", heat: 73, growth: "+18%", note: "囤货和性价比场景带动" },
  ];

  const unmetNeeds = [
    { pain: "低糖产品口味单一", signal: "评论中“健康但不好吃”高频出现", action: "做低糖口味矩阵" },
    { pain: "早餐准备时间长", signal: "年轻白领偏好 3 分钟内完成", action: "开发即食杯装" },
    { pain: "儿童早餐成分焦虑", signal: "宝妈关注少糖、安全、配料表", action: "亲子营养谷物包" },
    { pain: "运动代餐饱腹不足", signal: "健身控关注蛋白与饱腹感", action: "高蛋白谷物棒" },
  ];

  const conceptCards = [
    { name: "低 GI 高纤燕麦杯", audience: "控糖人群 / 年轻白领", score: 91, risk: "口味接受度", scene: "办公室早餐" },
    { name: "亲子营养谷物包", audience: "宝妈家庭", score: 86, risk: "儿童口味偏甜", scene: "儿童早餐" },
    { name: "高蛋白运动谷物棒", audience: "健身控", score: 82, risk: "蛋白口感", scene: "运动后代餐" },
    { name: "银发轻负担粗粮粥", audience: "银发健康人群", score: 76, risk: "渠道教育", scene: "早餐 / 晚餐" },
  ];

  const opportunityMap = [
    { name: "低 GI 高纤燕麦杯", x: 84, y: 78, tone: "primary" },
    { name: "亲子营养谷物包", x: 72, y: 86, tone: "green" },
    { name: "高蛋白运动谷物棒", x: 79, y: 62, tone: "warm" },
    { name: "国潮节令礼盒", x: 58, y: 74, tone: "blue" },
  ];

  const innovationBrief = [
    { label: "目标人群", value: "控糖人群、年轻白领、轻食成分党" },
    { label: "核心场景", value: "办公室早餐、通勤代餐、健身后轻补给" },
    { label: "主卖点", value: "低 GI、高纤、低糖、即食便携" },
    { label: "验证建议", value: "先用小红书食谱种草 + 抖音达人测评验证口味接受度" },
  ];

  const sellingPoints = [
    { name: "低 GI", value: 92 },
    { name: "高纤维", value: 86 },
    { name: "高蛋白", value: 78 },
    { name: "无添加", value: 72 },
  ];

  const flavorFormulaInsights = [
    { label: "口味机会", value: "坚果可可、莓果酸奶、黑芝麻谷物的接受度更高。" },
    { label: "配方诉求", value: "控糖人群关注低 GI、膳食纤维、无蔗糖和配料表清洁。" },
    { label: "口碑风险", value: "低糖产品容易被评价“寡淡”，需用坚果和谷物香气补足风味。" },
  ];

  const packagingFeedback = [
    { label: "便携杯装", positive: 82, issue: "办公室早餐场景认可度高" },
    { label: "家庭大包装", positive: 74, issue: "价格友好，但担心开封后保存" },
    { label: "亲子小袋装", positive: 69, issue: "方便分餐，需强化安全感" },
  ];

  const innovationScenarios = [
    { name: "办公室早餐", heat: 88, fit: "即食杯 / 低 GI" },
    { name: "儿童早餐", heat: 76, fit: "亲子营养包" },
    { name: "运动后代餐", heat: 71, fit: "高蛋白谷物棒" },
    { name: "节庆送礼", heat: 58, fit: "国潮礼盒" },
  ];

  const competitorLaunches = [
    { brand: "桂格", product: "高纤即食燕麦杯", signal: "达人测评声量高，负面集中在价格。" },
    { brand: "西麦", product: "低糖燕麦片", signal: "性价比认知强，但年轻化内容弱。" },
    { brand: "欧扎克", product: "高蛋白麦片", signal: "健身人群讨论高，口感两极分化。" },
  ];

  const productOptimizations = [
    "现有早餐谷物可增加低 GI 与高纤维标识，降低控糖人群理解成本。",
    "包装规格建议补充办公室杯装和亲子小袋装，分别承接白领与家庭场景。",
    "内容表达从“健康早餐”细化到“3 分钟完成”“成分表干净”“饱腹到午餐”。",
  ];

  const ecommerceKpis = [
    { label: "电商销售额", value: "4,860万", change: "+28.4%", tone: "primary" },
    { label: "销量", value: "128万件", change: "+22.1%", tone: "green" },
    { label: "好评率", value: "94.6%", change: "+2.3pp", tone: "warm" },
    { label: "社媒带动销售", value: "1,120万", change: "估算贡献", tone: "blue" },
    { label: "转化率", value: "3.8%", change: "+0.7pp", tone: "primary" },
    { label: "评价数", value: "8.2万", change: "+18.9%", tone: "green" },
  ];

  const ecommerceSources = [
    { name: "天猫旗舰店", content: "销量、销售额、SKU、评价、价格", freq: "日更 / 评论实时", status: "已接入" },
    { name: "京东自营", content: "销量、评价、库存、价格", freq: "日更", status: "已接入" },
    { name: "抖音电商", content: "直播成交、短视频成交、达人带货", freq: "小时级", status: "已接入" },
    { name: "拼多多", content: "价格、销量、评价", freq: "日更", status: "待接入" },
    { name: "小红书店铺", content: "种草笔记、商品点击、购买转化", freq: "小时级", status: "规划中" },
  ];

  const commerceLinkTrend = [
    { day: "06/01", social: 34, sales: 28 },
    { day: "06/05", social: 58, sales: 47 },
    { day: "06/09", social: 63, sales: 52 },
    { day: "06/13", social: 70, sales: 66 },
    { day: "06/17", social: 76, sales: 73 },
    { day: "06/21", social: 88, sales: 91 },
  ];

  const skuRows = [
    { name: "低 GI 高纤燕麦杯", sales: "980万", volume: "26万件", rating: "96%", heat: 92, growth: "+38%", status: "爆品候选" },
    { name: "家庭装谷物麦片", sales: "860万", volume: "31万件", rating: "94%", heat: 78, growth: "+24%", status: "稳定主力" },
    { name: "亲子营养谷物包", sales: "620万", volume: "18万件", rating: "95%", heat: 84, growth: "+31%", status: "潜力新品" },
    { name: "高蛋白谷物棒", sales: "510万", volume: "15万件", rating: "91%", heat: 86, growth: "+42%", status: "需优化口感" },
    { name: "原味燕麦片", sales: "430万", volume: "22万件", rating: "89%", heat: 55, growth: "-6%", status: "需焕新表达" },
  ];

  const channelMix = [
    { name: "抖音电商", value: 38, meta: "即时转化最强", tone: "primary" },
    { name: "天猫", value: 31, meta: "搜索承接稳定", tone: "warm" },
    { name: "京东", value: 19, meta: "组合装表现好", tone: "green" },
    { name: "拼多多", value: 12, meta: "价格敏感渠道", tone: "blue" },
  ];

  const reviewClusters = [
    { type: "好评点", keywords: "饱腹、方便、低糖、口感自然", meaning: "核心卖点有效" },
    { type: "差评点", keywords: "偏贵、分量小、偏淡、包装压坏", meaning: "价格和包装需优化" },
    { type: "复购原因", keywords: "办公室、控糖、孩子愿意吃", meaning: "复购场景明确" },
    { type: "退货原因", keywords: "破损、临期、口味不适应", meaning: "履约与口味风险" },
  ];

  const conversionFunnel = [
    { stage: "社媒曝光", value: "3,280万", percent: 100 },
    { stage: "内容互动", value: "72.8万", percent: 76 },
    { stage: "商品访问", value: "186万", percent: 58 },
    { stage: "加购", value: "42万", percent: 36 },
    { stage: "购买", value: "128万件", percent: 24 },
    { stage: "评价", value: "8.2万", percent: 14 },
  ];

  const promotionEvents = [
    { date: "06/01", event: "天猫满 199-30", impact: "家庭装销量提升 22%" },
    { date: "06/05", event: "抖音达人直播券", impact: "高蛋白谷物棒销量提升 41%" },
    { date: "06/10", event: "京东组合装促销", impact: "低 GI 燕麦杯客单价提升 16%" },
    { date: "06/18", event: "大促峰值", impact: "总销量达到周期峰值" },
  ];

  const ecommerceCompetitors = [
    { metric: "均价", own: "39.9", quaker: "45.9", seamild: "32.9" },
    { metric: "月销量", own: "128万", quaker: "146万", seamild: "118万" },
    { metric: "好评率", own: "94.6%", quaker: "93.1%", seamild: "92.4%" },
    { metric: "差评集中点", own: "包装破损", quaker: "价格高", seamild: "口味单一" },
    { metric: "主卖点", own: "低糖高纤", quaker: "早餐代餐", seamild: "性价比" },
  ];

  const heroProducts = [
    { name: "低 GI 高纤燕麦杯", reason: "社媒热度 92，增长 38%，好评率 96%，控糖人群强匹配。" },
    { name: "亲子营养谷物包", reason: "宝妈家庭正面率高，家庭场景增长快，竞品表达不足。" },
    { name: "高蛋白谷物棒", reason: "增长最快，但口感差评偏高，需要配方优化。" },
  ];

  const salesWarnings = [
    { type: "差评集中", detail: "高蛋白谷物棒“口感硬”评论上升。", action: "回看配方和内容预期管理" },
    { type: "价格波动", detail: "西麦低价促销导致本品转化下滑。", action: "增加组合装或赠品策略" },
    { type: "库存风险", detail: "低 GI 燕麦杯抖音渠道库存低于 7 天。", action: "提前补货" },
    { type: "包装风险", detail: "家庭装谷物麦片破损评价上升。", action: "检查仓配与包装保护" },
  ];

  const ecommerceConclusions = [
    "社媒种草对低 GI、高纤、办公室早餐相关 SKU 的销量拉动最明显。",
    "抖音电商承担即时转化，小红书更适合种草和口碑沉淀。",
    "低 GI 高纤燕麦杯具备爆品潜力，建议加大达人测评和搜索承接。",
    "高蛋白谷物棒增长快，但口感差评风险较高，建议先优化配方和内容预期。",
  ];

  const selectDock = (key) => {
    const target = dockItems.find((item) => item.key === key);
    if (!target) return;
    router.push(target.path);
  };

  const exitWorkspace = () => {
    ElMessage.info("已退出当前空间");
  };

  const createTopic = () => {
    router.push("/home");
  };
</script>

<template>
  <main class="cofco-page">
    <DockNav
      :items="dockItems"
      :active-dock="activeDock"
      @create-topic="createTopic"
      @select-dock="selectDock"
      @exit="exitWorkspace"
    />

    <section class="cofco-shell">
      <header class="cofco-header">
        <div>
          <span>COFCO Social Intelligence Demo</span>
          <h1>中粮社媒监测与营销评估</h1>
        </div>
        <div class="global-filters">
          <el-select v-model="selectedTime" size="large">
            <el-option v-for="item in filters.times" :key="item" :label="item" :value="item" />
          </el-select>
          <el-select v-model="selectedCategory" size="large">
            <el-option v-for="item in filters.categories" :key="item" :label="item" :value="item" />
          </el-select>
          <el-select v-model="selectedPlatform" size="large">
            <el-option v-for="item in filters.platforms" :key="item" :label="item" :value="item" />
          </el-select>
        </div>
      </header>

      <nav class="module-tabs" aria-label="社媒监测模块">
        <button
          v-for="item in modules"
          :key="item.key"
          type="button"
          :class="{ active: activeModule === item.key }"
          @click="activeModule = item.key"
        >
          <strong>{{ item.label }}</strong>
          <span>{{ item.summary }}</span>
        </button>
      </nav>

      <Transition name="module" mode="out-in">
        <section v-if="activeModule === 'monitor'" key="monitor" class="demo-module">
          <section class="kpi-grid">
            <article v-for="item in monitorKpis" :key="item.label" class="kpi-card" :class="item.tone">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <em>{{ item.change }}</em>
            </article>
          </section>

          <section class="dashboard-grid">
            <article class="panel trend-panel">
              <div class="panel-title">
                <div>
                  <h2>社媒声量趋势</h2>
                  <span>{{ selectedTime }} · {{ selectedCategory }} · {{ selectedPlatform }}</span>
                </div>
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="line-chart">
                <div
                  v-for="point in socialTrend"
                  :key="point.day"
                  class="line-point"
                  :style="{ height: `${point.value}%` }"
                >
                  <i />
                  <span>{{ point.day }}</span>
                </div>
              </div>
            </article>

            <article class="panel">
              <div class="panel-title">
                <div>
                  <h2>平台贡献</h2>
                  <span>曝光 / 互动综合口径</span>
                </div>
                <el-icon><Histogram /></el-icon>
              </div>
              <div class="bar-list">
                <div v-for="item in platformMix" :key="item.name" class="bar-row">
                  <span>{{ item.name }}</span>
                  <div class="bar-track" :class="item.tone">
                    <i :style="{ width: `${item.value}%` }" />
                  </div>
                  <strong>{{ item.value }}%</strong>
                  <em>{{ item.meta }}</em>
                </div>
              </div>
            </article>

            <article class="panel topic-panel">
              <div class="panel-title">
                <div>
                  <h2>热门话题</h2>
                  <span>点击话题查看下钻解释</span>
                </div>
                <el-icon><ChatLineRound /></el-icon>
              </div>
              <div class="topic-cloud">
                <button
                  v-for="item in topics"
                  :key="item.name"
                  type="button"
                  :class="{ active: activeTopic === item.name }"
                  :style="{ '--heat': `${item.heat}%` }"
                  @click="activeTopic = item.name"
                >
                  {{ item.name }}
                </button>
              </div>
              <div class="topic-detail">
                <strong>{{ selectedTopicDetail.name }}</strong>
                <span>热度 {{ selectedTopicDetail.heat }} · {{ selectedTopicDetail.sentiment }}</span>
                <p>关联品牌：{{ selectedTopicDetail.brands }}</p>
              </div>
            </article>

            <article class="panel">
              <div class="panel-title">
                <div>
                  <h2>热门内容榜</h2>
                  <span>Top 内容与传播场景</span>
                </div>
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div class="content-list">
                <article v-for="item in hotContents" :key="item.title">
                  <b>{{ item.platform }}</b>
                  <div>
                    <strong>{{ item.title }}</strong>
                    <span>{{ item.tag }} · {{ item.metric }}</span>
                  </div>
                </article>
              </div>
            </article>
          </section>

          <section class="insight-strip">
            <article v-for="item in categorySignals" :key="item.label">
              <el-icon><component :is="item.icon" /></el-icon>
              <div>
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
            </article>
          </section>

          <section class="dashboard-grid supplemental-grid">
            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>情绪与口碑分布</h2>
                  <span>正面 / 中性 / 负面原因</span>
                </div>
                <el-icon><ChatLineRound /></el-icon>
              </div>
              <div class="sentiment-list">
                <div v-for="item in sentimentMix" :key="item.label" class="sentiment-row">
                  <span>{{ item.label }}</span>
                  <div class="bar-track" :class="item.tone">
                    <i :style="{ width: `${item.value}%` }" />
                  </div>
                  <strong>{{ item.value }}%</strong>
                  <em>{{ item.note }}</em>
                </div>
              </div>
            </article>

            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>监测预警</h2>
                  <span>异常声量、负面舆情、竞品升温</span>
                </div>
                <el-icon><Warning /></el-icon>
              </div>
              <div class="alert-list">
                <article v-for="item in monitorAlerts" :key="item.title">
                  <b>{{ item.level }}</b>
                  <div>
                    <strong>{{ item.title }}</strong>
                    <span>{{ item.detail }}</span>
                  </div>
                </article>
              </div>
            </article>
          </section>
        </section>

        <section v-else-if="activeModule === 'competitor'" key="competitor" class="demo-module">
          <section class="compare-layout">
            <article class="panel compare-table">
              <div class="panel-title">
                <div>
                  <h2>本品 vs 竞品总览</h2>
                  <span>曝光、声量、互动、口碑、达人参与</span>
                </div>
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div class="comparison-table">
                <div class="table-head">
                  <span>品牌</span>
                  <span>曝光量</span>
                  <span>声量</span>
                  <span>互动量</span>
                  <span>正面率</span>
                  <span>达人内容</span>
                </div>
                <div v-for="item in competitors" :key="item.name" class="table-row">
                  <strong>{{ item.name }}</strong>
                  <span>{{ item.exposure }}万</span>
                  <span>{{ item.buzz }}万</span>
                  <span>{{ item.interaction }}万</span>
                  <span>{{ item.positive }}%</span>
                  <span>{{ item.kol }}</span>
                </div>
              </div>
            </article>

            <article class="panel">
              <div class="panel-title">
                <div>
                  <h2>话题强弱对比</h2>
                  <span>中粮本品与桂格</span>
                </div>
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="topic-compare">
                <div v-for="item in competitorTopics" :key="item.name" class="topic-compare-row">
                  <span>{{ item.name }}</span>
                  <div>
                    <i class="own" :style="{ width: `${item.own}%` }" />
                    <i class="rival" :style="{ width: `${item.rival}%` }" />
                  </div>
                  <em>本品 {{ item.own }} / 桂格 {{ item.rival }}</em>
                </div>
              </div>
            </article>
          </section>

          <section class="dashboard-grid competitor-grid">
            <article class="panel insight-panel">
              <div class="panel-title">
                <div>
                  <h2>机会点提示</h2>
                  <span>把数据翻译成业务动作</span>
                </div>
                <el-icon><Promotion /></el-icon>
              </div>
              <ul class="insight-list">
                <li v-for="item in competitorInsights" :key="item">{{ item }}</li>
              </ul>
            </article>

            <article class="panel">
              <div class="panel-title">
                <div>
                  <h2>竞品内容洞察</h2>
                  <span>爆款内容、平台与卖点</span>
                </div>
                <el-icon><ChatLineRound /></el-icon>
              </div>
              <div class="content-list">
                <article v-for="item in competitorContent" :key="item.title">
                  <b>{{ item.platform }}</b>
                  <div>
                    <strong>{{ item.title }}</strong>
                    <span>{{ item.type }} · {{ item.value }}</span>
                  </div>
                </article>
              </div>
            </article>
          </section>

          <section class="insight-strip competitor-signals">
            <article v-for="item in competitorSignals" :key="item.label">
              <el-icon><component :is="item.icon" /></el-icon>
              <div>
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
            </article>
          </section>
        </section>

        <section v-else-if="activeModule === 'campaign'" key="campaign" class="demo-module">
          <section class="campaign-hero">
            <div>
              <span>活动项目</span>
              <h2>中粮健康早餐季社媒传播活动</h2>
              <p>周期：2026/05/18 - 2026/06/08 · 平台：抖音 / 小红书 / 微博 · 话题：#健康早餐季</p>
            </div>
            <strong>正面情绪 76%</strong>
          </section>

          <section class="kpi-grid">
            <article v-for="item in campaignKpis" :key="item.label" class="kpi-card" :class="item.tone">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <em>{{ item.change }}</em>
            </article>
          </section>

          <section class="dashboard-grid">
            <article class="panel">
              <div class="panel-title">
                <div>
                  <h2>活动阶段表现</h2>
                  <span>预热期 / 爆发期 / 长尾期</span>
                </div>
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="stage-list">
                <div v-for="item in campaignStages" :key="item.name" class="stage-row">
                  <span>{{ item.name }}</span>
                  <div class="bar-track">
                    <i :style="{ width: `${item.value}%` }" />
                  </div>
                  <strong>{{ item.text }}</strong>
                </div>
              </div>
            </article>

            <article class="panel">
              <div class="panel-title">
                <div>
                  <h2>达人效果排行</h2>
                  <span>传播效率与 CPE</span>
                </div>
                <el-icon><Promotion /></el-icon>
              </div>
              <div class="creator-list">
                <article v-for="item in creatorRank" :key="item.name">
                  <div>
                    <strong>{{ item.name }}</strong>
                    <span>{{ item.type }}</span>
                  </div>
                  <em>{{ item.cpe }}</em>
                  <b>{{ item.score }}</b>
                </article>
              </div>
            </article>

            <article class="panel insight-panel wide">
              <div class="panel-title">
                <div>
                  <h2>活动复盘结论</h2>
                  <span>自动沉淀亮点、问题与下一步建议</span>
                </div>
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <ul class="insight-list two-col">
                <li v-for="item in campaignConclusions" :key="item">{{ item }}</li>
              </ul>
            </article>
          </section>

          <section class="dashboard-grid supplemental-grid">
            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>平台效果对比</h2>
                  <span>曝光、口碑与扩散贡献</span>
                </div>
                <el-icon><Histogram /></el-icon>
              </div>
              <div class="bar-list">
                <div v-for="item in campaignPlatformEffects" :key="item.name" class="bar-row">
                  <span>{{ item.name }}</span>
                  <div class="bar-track" :class="item.tone">
                    <i :style="{ width: `${item.value}%` }" />
                  </div>
                  <strong>{{ item.value }}%</strong>
                  <em>{{ item.meta }}</em>
                </div>
              </div>
            </article>

            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>内容类型分析</h2>
                  <span>测评、种草、科普、直播切片</span>
                </div>
                <el-icon><Grid /></el-icon>
              </div>
              <div class="content-type-grid">
                <article v-for="item in contentTypeMix" :key="item.name">
                  <strong>{{ item.value }}%</strong>
                  <span>{{ item.name }}</span>
                  <div class="bar-track">
                    <i :style="{ width: `${item.value}%` }" />
                  </div>
                </article>
              </div>
            </article>

            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>活动前后对比</h2>
                  <span>品牌声量与认知变化</span>
                </div>
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="before-after-list">
                <article v-for="item in campaignBeforeAfter" :key="item.label">
                  <span>{{ item.label }}</span>
                  <strong>{{ item.before }} → {{ item.after }}</strong>
                  <em>{{ item.lift }}</em>
                </article>
              </div>
            </article>

            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>用户评论反馈</h2>
                  <span>评论区高频观点</span>
                </div>
                <el-icon><ChatLineRound /></el-icon>
              </div>
              <ul class="insight-list">
                <li v-for="item in commentSignals" :key="item">{{ item }}</li>
              </ul>
            </article>
          </section>
        </section>

        <section v-else-if="activeModule === 'audience'" key="audience" class="demo-module">
          <section class="kpi-grid">
            <article v-for="item in audienceKpis" :key="item.label" class="kpi-card" :class="item.tone">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <em>{{ item.change }}</em>
            </article>
          </section>

          <section class="dashboard-grid audience-layout">
            <article class="panel wide-panel">
              <div class="panel-title">
                <div>
                  <h2>核心人群总览</h2>
                  <span>人群规模、平台、场景、需求与正面率</span>
                </div>
                <el-icon><Grid /></el-icon>
              </div>
              <div class="persona-grid">
                <article v-for="item in audienceSegments" :key="item.name" class="persona-card">
                  <div>
                    <strong>{{ item.name }}</strong>
                    <span>{{ item.platform }}</span>
                  </div>
                  <b>{{ item.size }}</b>
                  <p>{{ item.scene }}</p>
                  <div class="tag-list">
                    <em v-for="tag in item.needs" :key="`${item.name}-${tag}`">{{ tag }}</em>
                  </div>
                  <div class="bar-track">
                    <i :style="{ width: `${item.sentiment}%` }" />
                  </div>
                  <small>正面率 {{ item.sentiment }}%</small>
                </article>
              </div>
            </article>

            <article class="panel">
              <div class="panel-title">
                <div>
                  <h2>标签体系</h2>
                  <span>自定义人群的标签基础</span>
                </div>
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div class="tag-system-list">
                <article v-for="item in audienceTags" :key="item.label">
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </article>
              </div>
            </article>
          </section>

          <section class="dashboard-grid supplemental-grid">
            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>人群需求对比</h2>
                  <span>年轻白领 / 宝妈家庭 / 健身控</span>
                </div>
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="audience-need-list">
                <div v-for="item in audienceNeeds" :key="item.name" class="audience-need-row">
                  <span>{{ item.name }}</span>
                  <div class="multi-bars">
                    <i class="primary" :style="{ width: `${item.young}%` }" />
                    <i class="green" :style="{ width: `${item.family}%` }" />
                    <i class="warm" :style="{ width: `${item.fitness}%` }" />
                  </div>
                  <em>白领 {{ item.young }} / 家庭 {{ item.family }} / 健身 {{ item.fitness }}</em>
                </div>
              </div>
            </article>

            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>自定义人群</h2>
                  <span>示例：控糖早餐人群</span>
                </div>
                <el-icon><Promotion /></el-icon>
              </div>
              <ul class="insight-list">
                <li v-for="item in customAudienceRules" :key="item">{{ item }}</li>
              </ul>
            </article>
          </section>

          <section class="dashboard-grid supplemental-grid">
            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>兴趣图谱</h2>
                  <span>目标人群关联话题与生活方式</span>
                </div>
                <el-icon><Grid /></el-icon>
              </div>
              <div class="interest-cloud">
                <span
                  v-for="item in audienceInterestGraph"
                  :key="item.name"
                  :class="item.tone"
                  :style="{ '--size': `${Math.max(item.value / 8, 8)}px` }"
                >
                  {{ item.name }}
                </span>
              </div>
            </article>

            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>品牌与内容偏好</h2>
                  <span>品牌偏好、内容形式、情绪反馈</span>
                </div>
                <el-icon><ChatLineRound /></el-icon>
              </div>
              <div class="preference-table">
                <article v-for="item in audiencePreferenceRows" :key="item.audience">
                  <strong>{{ item.audience }}</strong>
                  <span>{{ item.brand }}</span>
                  <em>{{ item.content }}</em>
                  <b>{{ item.sentiment }}</b>
                </article>
              </div>
            </article>

            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>人群迁移趋势</h2>
                  <span>关注点从泛话题向细分需求迁移</span>
                </div>
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="migration-list">
                <article v-for="item in audienceMigration" :key="`${item.from}-${item.to}`">
                  <span>{{ item.from }}</span>
                  <strong>{{ item.to }}</strong>
                  <div class="bar-track">
                    <i :style="{ width: `${item.value}%` }" />
                  </div>
                  <em>{{ item.value }}</em>
                </article>
              </div>
            </article>

            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>交叉分析结论</h2>
                  <span>人群 × 场景 × 需求</span>
                </div>
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <ul class="insight-list">
                <li>年轻白领 + 小红书 + 低糖早餐：适合验证低 GI 即食杯概念。</li>
                <li>宝妈家庭 + 家庭囤货 + 营养安全：适合验证亲子营养谷物包。</li>
                <li>健身控 + 抖音 + 高蛋白饱腹：适合验证运动后谷物棒。</li>
              </ul>
            </article>
          </section>
        </section>

        <section v-else-if="activeModule === 'innovation'" key="innovation" class="demo-module">
          <section class="kpi-grid">
            <article v-for="item in innovationKpis" :key="item.label" class="kpi-card" :class="item.tone">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <em>{{ item.change }}</em>
            </article>
          </section>

          <section class="dashboard-grid">
            <article class="panel">
              <div class="panel-title">
                <div>
                  <h2>创新趋势总览</h2>
                  <span>上升概念、热门卖点、增长话题</span>
                </div>
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="trend-card-list">
                <article v-for="item in innovationTrends" :key="item.name">
                  <div>
                    <strong>{{ item.name }}</strong>
                    <span>{{ item.note }}</span>
                  </div>
                  <b>{{ item.growth }}</b>
                  <div class="bar-track">
                    <i :style="{ width: `${item.heat}%` }" />
                  </div>
                </article>
              </div>
            </article>

            <article class="panel">
              <div class="panel-title">
                <div>
                  <h2>消费需求挖掘</h2>
                  <span>未满足需求与建议动作</span>
                </div>
                <el-icon><ChatLineRound /></el-icon>
              </div>
              <div class="unmet-list">
                <article v-for="item in unmetNeeds" :key="item.pain">
                  <strong>{{ item.pain }}</strong>
                  <span>{{ item.signal }}</span>
                  <em>{{ item.action }}</em>
                </article>
              </div>
            </article>
          </section>

          <section class="dashboard-grid supplemental-grid">
            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>新品机会地图</h2>
                  <span>市场热度 × 竞争空白</span>
                </div>
                <el-icon><Grid /></el-icon>
              </div>
              <div class="opportunity-map">
                <span class="axis x-axis">竞争空白</span>
                <span class="axis y-axis">市场热度</span>
                <button
                  v-for="item in opportunityMap"
                  :key="item.name"
                  type="button"
                  class="opportunity-dot"
                  :class="item.tone"
                  :style="{ left: `${item.x}%`, bottom: `${item.y}%` }"
                >
                  {{ item.name }}
                </button>
              </div>
            </article>

            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>概念热度验证</h2>
                  <span>热度评分、目标人群、口碑风险</span>
                </div>
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div class="concept-list">
                <article v-for="item in conceptCards" :key="item.name">
                  <b>{{ item.score }}</b>
                  <div>
                    <strong>{{ item.name }}</strong>
                    <span>{{ item.audience }} · {{ item.scene }}</span>
                    <em>风险：{{ item.risk }}</em>
                  </div>
                </article>
              </div>
            </article>

            <article class="panel insight-panel wide">
              <div class="panel-title">
                <div>
                  <h2>研发 Brief 输出</h2>
                  <span>从洞察沉淀到新品概念简报</span>
                </div>
                <el-icon><Promotion /></el-icon>
              </div>
              <div class="brief-grid">
                <article v-for="item in innovationBrief" :key="item.label">
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </article>
              </div>
            </article>
          </section>

          <section class="dashboard-grid supplemental-grid">
            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>热门卖点分析</h2>
                  <span>低糖、高纤、高蛋白、无添加</span>
                </div>
                <el-icon><PriceTag /></el-icon>
              </div>
              <div class="selling-point-list">
                <div v-for="item in sellingPoints" :key="item.name">
                  <span>{{ item.name }}</span>
                  <div class="bar-track">
                    <i :style="{ width: `${item.value}%` }" />
                  </div>
                  <strong>{{ item.value }}</strong>
                </div>
              </div>
            </article>

            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>口味与配方洞察</h2>
                  <span>风味、成分、营养属性</span>
                </div>
                <el-icon><ChatLineRound /></el-icon>
              </div>
              <div class="formula-list">
                <article v-for="item in flavorFormulaInsights" :key="item.label">
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </article>
              </div>
            </article>

            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>包装反馈分析</h2>
                  <span>便携性、规格、保存顾虑</span>
                </div>
                <el-icon><Grid /></el-icon>
              </div>
              <div class="packaging-list">
                <article v-for="item in packagingFeedback" :key="item.label">
                  <strong>{{ item.label }}</strong>
                  <span>{{ item.issue }}</span>
                  <div class="bar-track">
                    <i :style="{ width: `${item.positive}%` }" />
                  </div>
                  <em>正面 {{ item.positive }}%</em>
                </article>
              </div>
            </article>

            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>使用场景分析</h2>
                  <span>场景热度与适配产品</span>
                </div>
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="scenario-list">
                <article v-for="item in innovationScenarios" :key="item.name">
                  <strong>{{ item.name }}</strong>
                  <span>{{ item.fit }}</span>
                  <em>{{ item.heat }}</em>
                </article>
              </div>
            </article>

            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>竞品新品追踪</h2>
                  <span>竞品新品、用户反馈、机会空白</span>
                </div>
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div class="launch-list">
                <article v-for="item in competitorLaunches" :key="`${item.brand}-${item.product}`">
                  <b>{{ item.brand }}</b>
                  <div>
                    <strong>{{ item.product }}</strong>
                    <span>{{ item.signal }}</span>
                  </div>
                </article>
              </div>
            </article>

            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>产品优化建议</h2>
                  <span>现有产品包装、卖点、内容表达</span>
                </div>
                <el-icon><Promotion /></el-icon>
              </div>
              <ul class="insight-list">
                <li v-for="item in productOptimizations" :key="item">{{ item }}</li>
              </ul>
            </article>
          </section>
        </section>

        <section v-else key="ecommerce" class="demo-module">
          <section class="kpi-grid ecommerce-kpi-grid">
            <article v-for="item in ecommerceKpis" :key="item.label" class="kpi-card" :class="item.tone">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <em>{{ item.change }}</em>
            </article>
          </section>

          <section class="dashboard-grid ecommerce-layout">
            <article class="panel wide-panel">
              <div class="panel-title">
                <div>
                  <h2>社媒-电商联动</h2>
                  <span>声量、互动与销量趋势联动</span>
                </div>
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="commerce-trend">
                <div v-for="item in commerceLinkTrend" :key="item.day" class="commerce-trend-row">
                  <span>{{ item.day }}</span>
                  <div>
                    <i class="social" :style="{ width: `${item.social}%` }" />
                    <i class="sales" :style="{ width: `${item.sales}%` }" />
                  </div>
                  <em>声量 {{ item.social }} / 销量 {{ item.sales }}</em>
                </div>
              </div>
            </article>

            <article class="panel">
              <div class="panel-title">
                <div>
                  <h2>数据源接入</h2>
                  <span>渠道、SKU、评论、价格、促销</span>
                </div>
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div class="source-list">
                <article v-for="item in ecommerceSources" :key="item.name">
                  <div>
                    <strong>{{ item.name }}</strong>
                    <span>{{ item.content }}</span>
                  </div>
                  <em>{{ item.freq }}</em>
                  <b>{{ item.status }}</b>
                </article>
              </div>
            </article>
          </section>

          <section class="dashboard-grid supplemental-grid">
            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>SKU 表现分析</h2>
                  <span>销量、口碑、热度、增长与判断</span>
                </div>
                <el-icon><Grid /></el-icon>
              </div>
              <div class="sku-table">
                <div class="sku-head">
                  <span>SKU</span>
                  <span>销售额</span>
                  <span>好评</span>
                  <span>增长</span>
                  <span>判断</span>
                </div>
                <article v-for="item in skuRows" :key="item.name">
                  <strong>{{ item.name }}</strong>
                  <span>{{ item.sales }}</span>
                  <span>{{ item.rating }}</span>
                  <em>{{ item.growth }}</em>
                  <b>{{ item.status }}</b>
                </article>
              </div>
            </article>

            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>渠道表现分析</h2>
                  <span>天猫、京东、抖音电商、拼多多</span>
                </div>
                <el-icon><Histogram /></el-icon>
              </div>
              <div class="bar-list">
                <div v-for="item in channelMix" :key="item.name" class="bar-row">
                  <span>{{ item.name }}</span>
                  <div class="bar-track" :class="item.tone">
                    <i :style="{ width: `${item.value}%` }" />
                  </div>
                  <strong>{{ item.value }}%</strong>
                  <em>{{ item.meta }}</em>
                </div>
              </div>
            </article>

            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>商品评价分析</h2>
                  <span>好评、差评、复购、退货原因</span>
                </div>
                <el-icon><ChatLineRound /></el-icon>
              </div>
              <div class="review-cluster-list">
                <article v-for="item in reviewClusters" :key="item.type">
                  <b>{{ item.type }}</b>
                  <div>
                    <strong>{{ item.keywords }}</strong>
                    <span>{{ item.meaning }}</span>
                  </div>
                </article>
              </div>
            </article>

            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>转化漏斗分析</h2>
                  <span>曝光、互动、访问、加购、购买、评价</span>
                </div>
                <el-icon><Promotion /></el-icon>
              </div>
              <div class="funnel-list">
                <article v-for="item in conversionFunnel" :key="item.stage">
                  <span>{{ item.stage }}</span>
                  <div class="bar-track">
                    <i :style="{ width: `${item.percent}%` }" />
                  </div>
                  <strong>{{ item.value }}</strong>
                </article>
              </div>
            </article>
          </section>

          <section class="dashboard-grid supplemental-grid">
            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>价格与促销分析</h2>
                  <span>满减、直播券、组合装、大促峰值</span>
                </div>
                <el-icon><PriceTag /></el-icon>
              </div>
              <div class="promo-timeline">
                <article v-for="item in promotionEvents" :key="`${item.date}-${item.event}`">
                  <b>{{ item.date }}</b>
                  <div>
                    <strong>{{ item.event }}</strong>
                    <span>{{ item.impact }}</span>
                  </div>
                </article>
              </div>
            </article>

            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>竞品电商对比</h2>
                  <span>中粮本品 / 桂格 / 西麦</span>
                </div>
                <el-icon><DataAnalysis /></el-icon>
              </div>
              <div class="ecommerce-competitor-table">
                <article v-for="item in ecommerceCompetitors" :key="item.metric">
                  <strong>{{ item.metric }}</strong>
                  <span>{{ item.own }}</span>
                  <span>{{ item.quaker }}</span>
                  <span>{{ item.seamild }}</span>
                </article>
              </div>
            </article>

            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>爆品识别</h2>
                  <span>高热度、高增长、高好评、高转化</span>
                </div>
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="hero-product-list">
                <article v-for="item in heroProducts" :key="item.name">
                  <strong>{{ item.name }}</strong>
                  <span>{{ item.reason }}</span>
                </article>
              </div>
            </article>

            <article class="panel compact-panel">
              <div class="panel-title">
                <div>
                  <h2>销售预警</h2>
                  <span>差评、价格、库存、包装风险</span>
                </div>
                <el-icon><Warning /></el-icon>
              </div>
              <div class="sales-warning-list">
                <article v-for="item in salesWarnings" :key="item.type">
                  <b>{{ item.type }}</b>
                  <div>
                    <strong>{{ item.detail }}</strong>
                    <span>{{ item.action }}</span>
                  </div>
                </article>
              </div>
            </article>

            <article class="panel insight-panel wide">
              <div class="panel-title">
                <div>
                  <h2>电商融合结论</h2>
                  <span>社媒热度 → 商品访问 → SKU 销售 → 评论反馈</span>
                </div>
                <el-icon><Promotion /></el-icon>
              </div>
              <ul class="insight-list two-col">
                <li v-for="item in ecommerceConclusions" :key="item">{{ item }}</li>
              </ul>
            </article>
          </section>
        </section>
      </Transition>
    </section>
  </main>
</template>

<style scoped>
  .cofco-page {
    --text: #181322;
    --muted: #746b82;
    --soft: #f7f5fb;
    --line: #f0edf5;
    --primary: #5b3da7;
    --primary-deep: #4b2887;
    --primary-soft: #f0eef8;
    --warm: #d7b75f;
    --warm-soft: #fbf6e7;
    --blue: #7b75ad;
    --green: #7aa08f;
    display: flex;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background: #ffffff;
    color: var(--text);
  }

  .cofco-shell {
    flex: 1;
    min-width: 0;
    height: 100%;
    overflow: auto;
    padding: 24px 28px 32px;
    background: #ffffff;
  }

  .cofco-header,
  .module-tabs,
  .kpi-grid,
  .dashboard-grid,
  .compare-layout,
  .insight-strip {
    width: 100%;
  }

  .cofco-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 20px;
  }

  .cofco-header span,
  .panel-title span,
  .kpi-card span,
  .campaign-hero span {
    color: var(--muted);
    font-size: 12px;
    line-height: 1.4;
  }

  .cofco-header h1 {
    margin: 6px 0 0;
    color: var(--text);
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 0;
  }

  .global-filters {
    display: grid;
    grid-template-columns: repeat(3, 150px);
    gap: 10px;
  }

  .module-tabs {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 18px;
  }

  .module-tabs button {
    display: flex;
    min-height: 72px;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 15px 18px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: #ffffff;
    color: var(--text);
    cursor: pointer;
    outline: none;
    transition: border-color 180ms ease, background 180ms ease, transform 180ms ease;
  }

  .module-tabs button.active {
    border-color: rgba(91, 61, 167, 0.34);
    background: var(--primary-soft);
  }

  .module-tabs button:focus-visible {
    box-shadow: 0 0 0 3px rgba(91, 61, 167, 0.14);
  }

  .module-tabs button:hover {
    transform: translateY(-1px);
  }

  .module-tabs strong {
    margin-bottom: 6px;
    font-size: 16px;
  }

  .module-tabs span {
    color: var(--muted);
    font-size: 12px;
  }

  .demo-module {
    animation: module-in 260ms ease both;
  }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 14px;
  }

  .ecommerce-kpi-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .kpi-card,
  .panel,
  .campaign-hero,
  .insight-strip article {
    border: 1px solid var(--line);
    border-radius: 8px;
    background: #ffffff;
  }

  .kpi-card {
    min-height: 110px;
    padding: 16px;
    border-left: 4px solid var(--primary);
  }

  .kpi-card.green {
    border-left-color: var(--green);
  }

  .kpi-card.warm {
    border-left-color: var(--warm);
  }

  .kpi-card.blue {
    border-left-color: var(--blue);
  }

  .kpi-card strong {
    display: block;
    margin-top: 12px;
    font-size: 27px;
    line-height: 1;
  }

  .kpi-card em {
    display: inline-block;
    margin-top: 12px;
    padding: 4px 8px;
    border-radius: 999px;
    background: var(--soft);
    color: var(--primary);
    font-size: 12px;
    font-style: normal;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.9fr);
    gap: 14px;
  }

  .competitor-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    margin-top: 14px;
  }

  .supplemental-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 14px;
  }

  .audience-layout {
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.9fr);
  }

  .ecommerce-layout {
    grid-template-columns: minmax(0, 1.1fr) minmax(360px, 0.9fr);
  }

  .panel {
    min-height: 260px;
    padding: 18px;
    overflow: hidden;
  }

  .compact-panel {
    min-height: 220px;
  }

  .wide-panel {
    min-height: 320px;
  }

  .panel-title {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 18px;
  }

  .panel-title h2 {
    margin: 0 0 5px;
    font-size: 17px;
    letter-spacing: 0;
  }

  .panel-title .el-icon {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: var(--primary-soft);
    color: var(--primary);
  }

  .trend-panel {
    min-height: 315px;
  }

  .line-chart {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    align-items: end;
    gap: 14px;
    height: 220px;
    padding: 18px 8px 34px;
    border-bottom: 1px solid var(--line);
  }

  .line-point {
    position: relative;
    display: flex;
    min-height: 30px;
    align-items: flex-end;
    justify-content: center;
    border-radius: 8px 8px 0 0;
    background: linear-gradient(180deg, rgba(91, 61, 167, 0.78), rgba(91, 61, 167, 0.16));
  }

  .line-point i {
    position: absolute;
    top: -5px;
    width: 10px;
    height: 10px;
    border: 2px solid #ffffff;
    border-radius: 50%;
    background: var(--primary);
  }

  .line-point span {
    position: absolute;
    bottom: -25px;
    color: var(--muted);
    font-size: 11px;
  }

  .bar-list,
  .stage-list,
  .topic-compare,
  .creator-list,
  .sentiment-list,
  .alert-list,
  .before-after-list {
    display: grid;
    gap: 14px;
  }

  .bar-row {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr) 44px;
    align-items: center;
    gap: 10px;
  }

  .bar-row em {
    grid-column: 2 / 4;
    color: var(--muted);
    font-size: 12px;
    font-style: normal;
  }

  .sentiment-row {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) 48px;
    align-items: center;
    gap: 10px;
  }

  .sentiment-row em {
    grid-column: 2 / 4;
    color: var(--muted);
    font-size: 12px;
    font-style: normal;
  }

  .bar-track {
    height: 10px;
    overflow: hidden;
    border-radius: 999px;
    background: #edf2ee;
  }

  .bar-track i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--primary);
  }

  .bar-track.warm i {
    background: var(--warm);
  }

  .bar-track.green i {
    background: var(--green);
  }

  .topic-panel {
    min-height: 300px;
  }

  .topic-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 18px;
  }

  .topic-cloud button {
    padding: 9px 12px;
    border: 1px solid rgba(91, 61, 167, 0.16);
    border-radius: 999px;
    background: linear-gradient(90deg, var(--primary-soft) var(--heat), #ffffff var(--heat));
    color: var(--text);
    cursor: pointer;
  }

  .topic-cloud button.active {
    border-color: rgba(91, 61, 167, 0.54);
    color: var(--primary);
    font-weight: 700;
  }

  .topic-detail {
    padding: 14px;
    border-radius: 8px;
    background: var(--soft);
  }

  .topic-detail strong,
  .topic-detail span,
  .topic-detail p {
    display: block;
  }

  .topic-detail span,
  .topic-detail p {
    margin: 8px 0 0;
    color: var(--muted);
    font-size: 13px;
  }

  .content-list {
    display: grid;
    gap: 12px;
  }

  .content-list article {
    display: grid;
    grid-template-columns: 62px minmax(0, 1fr);
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    background: var(--soft);
  }

  .content-list b {
    align-self: start;
    padding: 5px 7px;
    border-radius: 6px;
    background: #ffffff;
    color: var(--primary);
    font-size: 12px;
    text-align: center;
  }

  .content-list strong,
  .content-list span {
    display: block;
  }

  .content-list strong {
    margin-bottom: 6px;
    font-size: 14px;
    line-height: 1.45;
  }

  .content-list span {
    color: var(--muted);
    font-size: 12px;
  }

  .insight-strip {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 14px;
  }

  .competitor-signals article {
    align-items: flex-start;
  }

  .insight-strip article {
    display: flex;
    gap: 14px;
    align-items: center;
    min-height: 88px;
    padding: 16px;
  }

  .insight-strip .el-icon {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: var(--warm-soft);
    color: var(--warm);
  }

  .insight-strip span,
  .insight-strip strong {
    display: block;
  }

  .insight-strip span {
    margin-bottom: 6px;
    color: var(--muted);
    font-size: 12px;
  }

  .compare-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.9fr);
    gap: 14px;
  }

  .comparison-table {
    display: grid;
    gap: 8px;
  }

  .table-head,
  .table-row {
    display: grid;
    grid-template-columns: 1.2fr repeat(5, minmax(58px, 1fr));
    gap: 8px;
    align-items: center;
  }

  .table-head {
    color: var(--muted);
    font-size: 12px;
  }

  .table-row {
    padding: 13px 0;
    border-bottom: 1px solid var(--line);
  }

  .compare-table {
    overflow-x: auto;
  }

  .alert-list article {
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr);
    gap: 12px;
    align-items: start;
    padding: 12px;
    border-radius: 8px;
    background: var(--soft);
  }

  .alert-list b {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: var(--warm-soft);
    color: var(--warm);
    font-size: 12px;
  }

  .alert-list strong,
  .alert-list span {
    display: block;
  }

  .alert-list strong {
    margin-bottom: 5px;
    font-size: 14px;
  }

  .alert-list span {
    color: var(--muted);
    font-size: 12px;
    line-height: 1.45;
  }

  .topic-compare-row {
    display: grid;
    gap: 8px;
  }

  .topic-compare-row > div {
    display: grid;
    gap: 6px;
    min-height: 32px;
    padding: 5px;
    border-radius: 8px;
    background: var(--warm-soft);
  }

  .topic-compare-row i {
    display: block;
    height: 10px;
    border-radius: inherit;
  }

  .topic-compare-row .own {
    background: rgba(91, 61, 167, 0.72);
  }

  .topic-compare-row .rival {
    background: rgba(122, 160, 143, 0.88);
  }

  .topic-compare-row em {
    color: var(--muted);
    font-size: 12px;
    font-style: normal;
  }

  .insight-panel {
    background: linear-gradient(180deg, #ffffff, #faf9fd);
  }

  .insight-list {
    display: grid;
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .insight-list.two-col {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .insight-list li {
    position: relative;
    padding: 13px 14px 13px 34px;
    border-radius: 8px;
    background: #ffffff;
    color: var(--text);
    line-height: 1.55;
  }

  .insight-list li::before {
    position: absolute;
    top: 18px;
    left: 15px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--primary);
    content: "";
  }

  .campaign-hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 14px;
    padding: 20px;
    background: linear-gradient(90deg, var(--primary-soft), #ffffff 72%);
  }

  .campaign-hero h2 {
    margin: 6px 0 8px;
    font-size: 22px;
  }

  .campaign-hero p {
    margin: 0;
    color: var(--muted);
  }

  .campaign-hero > strong {
    flex: 0 0 auto;
    padding: 12px 16px;
    border-radius: 8px;
    background: #ffffff;
    color: var(--primary);
  }

  .stage-row {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr) 104px;
    align-items: center;
    gap: 12px;
  }

  .creator-list article {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 64px 42px;
    align-items: center;
    gap: 12px;
    padding: 13px;
    border-radius: 8px;
    background: var(--soft);
  }

  .creator-list strong,
  .creator-list span {
    display: block;
  }

  .creator-list span {
    margin-top: 4px;
    color: var(--muted);
    font-size: 12px;
  }

  .creator-list em {
    color: var(--warm);
    font-style: normal;
  }

  .creator-list b {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 8px;
    background: #ffffff;
    color: var(--primary);
  }

  .content-type-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .content-type-grid article {
    padding: 13px;
    border-radius: 8px;
    background: var(--soft);
  }

  .content-type-grid strong,
  .content-type-grid span {
    display: block;
  }

  .content-type-grid strong {
    margin-bottom: 4px;
    color: var(--primary);
    font-size: 20px;
  }

  .content-type-grid span {
    margin-bottom: 12px;
    color: var(--muted);
    font-size: 12px;
  }

  .before-after-list article {
    display: grid;
    grid-template-columns: 96px minmax(0, 1fr) 64px;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border-radius: 8px;
    background: var(--soft);
  }

  .before-after-list span {
    color: var(--muted);
    font-size: 13px;
  }

  .before-after-list strong {
    font-size: 14px;
  }

  .before-after-list em {
    justify-self: end;
    color: var(--primary);
    font-style: normal;
    font-weight: 700;
  }

  .persona-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .persona-card,
  .tag-system-list article,
  .trend-card-list article,
  .unmet-list article,
  .concept-list article,
  .brief-grid article {
    border-radius: 8px;
    background: var(--soft);
  }

  .persona-card {
    display: grid;
    gap: 10px;
    padding: 14px;
  }

  .persona-card > div:first-child {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .persona-card strong,
  .persona-card span,
  .persona-card p,
  .persona-card small {
    display: block;
  }

  .persona-card b {
    width: max-content;
    padding: 5px 8px;
    border-radius: 999px;
    background: #ffffff;
    color: var(--primary);
    font-size: 12px;
  }

  .persona-card span,
  .persona-card p,
  .persona-card small {
    color: var(--muted);
    font-size: 12px;
    line-height: 1.45;
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .tag-list em {
    padding: 4px 7px;
    border-radius: 999px;
    background: #ffffff;
    color: var(--primary);
    font-size: 12px;
    font-style: normal;
  }

  .tag-system-list,
  .trend-card-list,
  .unmet-list,
  .concept-list,
  .brief-grid,
  .audience-need-list,
  .preference-table,
  .migration-list,
  .selling-point-list,
  .formula-list,
  .packaging-list,
  .scenario-list,
  .launch-list,
  .source-list,
  .review-cluster-list,
  .funnel-list,
  .promo-timeline,
  .ecommerce-competitor-table,
  .hero-product-list,
  .sales-warning-list {
    display: grid;
    gap: 12px;
  }

  .tag-system-list article {
    padding: 13px;
  }

  .tag-system-list span,
  .tag-system-list strong {
    display: block;
  }

  .tag-system-list span {
    margin-bottom: 6px;
    color: var(--muted);
    font-size: 12px;
  }

  .tag-system-list strong {
    font-size: 14px;
    line-height: 1.5;
  }

  .audience-need-row {
    display: grid;
    gap: 8px;
  }

  .audience-need-row > span {
    font-weight: 700;
  }

  .multi-bars {
    display: grid;
    gap: 5px;
    padding: 5px;
    border-radius: 8px;
    background: var(--warm-soft);
  }

  .multi-bars i {
    display: block;
    height: 8px;
    border-radius: 999px;
  }

  .multi-bars .primary {
    background: rgba(91, 61, 167, 0.76);
  }

  .multi-bars .green {
    background: rgba(122, 160, 143, 0.88);
  }

  .multi-bars .warm {
    background: rgba(215, 183, 95, 0.9);
  }

  .audience-need-row em {
    color: var(--muted);
    font-size: 12px;
    font-style: normal;
  }

  .interest-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-content: flex-start;
    min-height: 142px;
  }

  .interest-cloud span {
    display: grid;
    place-items: center;
    min-width: 72px;
    min-height: 38px;
    padding: 8px 12px;
    border-radius: 999px;
    background: var(--primary-soft);
    color: var(--primary);
    font-size: var(--size);
    font-weight: 700;
  }

  .interest-cloud .green {
    background: rgba(122, 160, 143, 0.18);
    color: #527466;
  }

  .interest-cloud .warm {
    background: var(--warm-soft);
    color: #7a6220;
  }

  .interest-cloud .blue {
    background: rgba(123, 117, 173, 0.16);
    color: var(--blue);
  }

  .preference-table article {
    display: grid;
    grid-template-columns: 86px minmax(0, 1fr) minmax(0, 1.1fr) 48px;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border-radius: 8px;
    background: var(--soft);
  }

  .preference-table span,
  .preference-table em,
  .migration-list span,
  .migration-list em {
    color: var(--muted);
    font-size: 12px;
    font-style: normal;
  }

  .preference-table b {
    justify-self: end;
    color: var(--primary);
  }

  .migration-list article {
    display: grid;
    grid-template-columns: 64px 110px minmax(0, 1fr) 34px;
    align-items: center;
    gap: 10px;
    padding: 11px 12px;
    border-radius: 8px;
    background: var(--soft);
  }

  .migration-list strong::before {
    margin-right: 6px;
    color: var(--warm);
    content: "→";
  }

  .trend-card-list article {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 64px;
    gap: 10px;
    align-items: center;
    padding: 13px;
  }

  .trend-card-list .bar-track {
    grid-column: 1 / -1;
  }

  .trend-card-list strong,
  .trend-card-list span,
  .unmet-list strong,
  .unmet-list span,
  .unmet-list em {
    display: block;
  }

  .trend-card-list span,
  .unmet-list span,
  .concept-list span,
  .concept-list em {
    color: var(--muted);
    font-size: 12px;
    line-height: 1.45;
  }

  .trend-card-list b {
    justify-self: end;
    color: var(--primary);
  }

  .unmet-list article {
    padding: 13px;
  }

  .unmet-list span {
    margin-top: 6px;
  }

  .unmet-list em {
    width: max-content;
    max-width: 100%;
    margin-top: 9px;
    padding: 5px 8px;
    border-radius: 999px;
    background: #ffffff;
    color: var(--primary);
    font-size: 12px;
    font-style: normal;
  }

  .opportunity-map {
    position: relative;
    height: 230px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background:
      linear-gradient(90deg, transparent 49%, rgba(91, 61, 167, 0.12) 49%, rgba(91, 61, 167, 0.12) 51%, transparent 51%),
      linear-gradient(0deg, transparent 49%, rgba(122, 160, 143, 0.14) 49%, rgba(122, 160, 143, 0.14) 51%, transparent 51%),
      var(--soft);
    overflow: hidden;
  }

  .opportunity-map .axis {
    position: absolute;
    color: var(--muted);
    font-size: 12px;
  }

  .x-axis {
    right: 12px;
    bottom: 10px;
  }

  .y-axis {
    top: 10px;
    left: 12px;
  }

  .opportunity-dot {
    position: absolute;
    max-width: 132px;
    padding: 7px 9px;
    border-radius: 999px;
    color: #ffffff;
    font-size: 12px;
    line-height: 1.25;
    text-align: left;
    transform: translate(-50%, 50%);
  }

  .opportunity-dot.primary {
    background: var(--primary);
  }

  .opportunity-dot.green {
    background: var(--green);
  }

  .opportunity-dot.warm {
    background: var(--warm);
    color: #3d3310;
  }

  .opportunity-dot.blue {
    background: var(--blue);
  }

  .concept-list article {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr);
    gap: 12px;
    align-items: start;
    padding: 13px;
  }

  .concept-list b {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #ffffff;
    color: var(--primary);
  }

  .concept-list strong,
  .concept-list span,
  .concept-list em {
    display: block;
  }

  .concept-list span,
  .concept-list em {
    margin-top: 5px;
    font-style: normal;
  }

  .brief-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .brief-grid article {
    padding: 14px;
  }

  .brief-grid span,
  .brief-grid strong {
    display: block;
  }

  .brief-grid span {
    margin-bottom: 8px;
    color: var(--muted);
    font-size: 12px;
  }

  .brief-grid strong {
    line-height: 1.55;
  }

  .selling-point-list > div {
    display: grid;
    grid-template-columns: 72px minmax(0, 1fr) 38px;
    align-items: center;
    gap: 10px;
  }

  .selling-point-list span {
    font-weight: 700;
  }

  .selling-point-list strong {
    justify-self: end;
    color: var(--primary);
  }

  .formula-list article,
  .packaging-list article {
    padding: 13px;
    border-radius: 8px;
    background: var(--soft);
  }

  .formula-list span,
  .formula-list strong,
  .packaging-list strong,
  .packaging-list span,
  .packaging-list em {
    display: block;
  }

  .formula-list span,
  .packaging-list span,
  .packaging-list em {
    color: var(--muted);
    font-size: 12px;
    line-height: 1.45;
  }

  .formula-list span {
    margin-bottom: 6px;
  }

  .packaging-list span {
    margin: 6px 0 10px;
  }

  .packaging-list em {
    margin-top: 6px;
    font-style: normal;
  }

  .scenario-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .scenario-list article {
    position: relative;
    min-height: 88px;
    padding: 13px;
    border-radius: 8px;
    background: var(--soft);
  }

  .scenario-list strong,
  .scenario-list span,
  .scenario-list em {
    display: block;
  }

  .scenario-list span {
    margin-top: 7px;
    color: var(--muted);
    font-size: 12px;
  }

  .scenario-list em {
    position: absolute;
    right: 12px;
    bottom: 10px;
    color: var(--primary);
    font-size: 22px;
    font-style: normal;
    font-weight: 700;
  }

  .launch-list article {
    display: grid;
    grid-template-columns: 54px minmax(0, 1fr);
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    background: var(--soft);
  }

  .launch-list b {
    align-self: start;
    padding: 5px 7px;
    border-radius: 6px;
    background: #ffffff;
    color: var(--primary);
    font-size: 12px;
    text-align: center;
  }

  .launch-list strong,
  .launch-list span {
    display: block;
  }

  .launch-list span {
    margin-top: 6px;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.45;
  }

  .commerce-trend {
    display: grid;
    gap: 14px;
  }

  .commerce-trend-row {
    display: grid;
    grid-template-columns: 58px minmax(0, 1fr) 118px;
    align-items: center;
    gap: 12px;
  }

  .commerce-trend-row > div {
    display: grid;
    gap: 6px;
    padding: 6px;
    border-radius: 8px;
    background: var(--warm-soft);
  }

  .commerce-trend-row i {
    display: block;
    height: 9px;
    border-radius: 999px;
  }

  .commerce-trend-row .social {
    background: rgba(91, 61, 167, 0.74);
  }

  .commerce-trend-row .sales {
    background: rgba(122, 160, 143, 0.88);
  }

  .commerce-trend-row em {
    color: var(--muted);
    font-size: 12px;
    font-style: normal;
  }

  .source-list article {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 92px 56px;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border-radius: 8px;
    background: var(--soft);
  }

  .source-list strong,
  .source-list span,
  .source-list em,
  .source-list b {
    display: block;
  }

  .source-list span,
  .source-list em {
    color: var(--muted);
    font-size: 12px;
    line-height: 1.4;
    font-style: normal;
  }

  .source-list b {
    justify-self: end;
    padding: 4px 7px;
    border-radius: 999px;
    background: #ffffff;
    color: var(--primary);
    font-size: 12px;
  }

  .sku-table {
    overflow-x: auto;
  }

  .sku-head,
  .sku-table article {
    display: grid;
    grid-template-columns: minmax(150px, 1.4fr) repeat(4, minmax(64px, 0.8fr));
    gap: 8px;
    align-items: center;
    min-width: 640px;
  }

  .sku-head {
    color: var(--muted);
    font-size: 12px;
  }

  .sku-table article {
    padding: 12px 0;
    border-bottom: 1px solid var(--line);
  }

  .sku-table em {
    color: var(--primary);
    font-style: normal;
    font-weight: 700;
  }

  .sku-table b {
    width: max-content;
    max-width: 100%;
    padding: 4px 7px;
    border-radius: 999px;
    background: var(--primary-soft);
    color: var(--primary);
    font-size: 12px;
  }

  .review-cluster-list article,
  .sales-warning-list article {
    display: grid;
    grid-template-columns: 64px minmax(0, 1fr);
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    background: var(--soft);
  }

  .review-cluster-list b,
  .sales-warning-list b {
    align-self: start;
    padding: 5px 7px;
    border-radius: 6px;
    background: #ffffff;
    color: var(--primary);
    font-size: 12px;
    text-align: center;
  }

  .review-cluster-list strong,
  .review-cluster-list span,
  .sales-warning-list strong,
  .sales-warning-list span {
    display: block;
  }

  .review-cluster-list span,
  .sales-warning-list span {
    margin-top: 6px;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.45;
  }

  .funnel-list article {
    display: grid;
    grid-template-columns: 72px minmax(0, 1fr) 78px;
    align-items: center;
    gap: 10px;
  }

  .funnel-list span {
    font-size: 12px;
    font-weight: 700;
  }

  .funnel-list strong {
    justify-self: end;
    color: var(--primary);
    font-size: 13px;
  }

  .promo-timeline article {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr);
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
    background: var(--soft);
  }

  .promo-timeline b {
    display: grid;
    place-items: center;
    width: 46px;
    height: 32px;
    border-radius: 8px;
    background: var(--warm-soft);
    color: #7a6220;
    font-size: 12px;
  }

  .promo-timeline strong,
  .promo-timeline span {
    display: block;
  }

  .promo-timeline span {
    margin-top: 5px;
    color: var(--muted);
    font-size: 12px;
  }

  .ecommerce-competitor-table article {
    display: grid;
    grid-template-columns: 86px repeat(3, minmax(0, 1fr));
    gap: 10px;
    align-items: center;
    padding: 11px 12px;
    border-radius: 8px;
    background: var(--soft);
  }

  .ecommerce-competitor-table span {
    color: var(--muted);
    font-size: 12px;
  }

  .hero-product-list article {
    padding: 13px;
    border-radius: 8px;
    background: var(--soft);
  }

  .hero-product-list strong,
  .hero-product-list span {
    display: block;
  }

  .hero-product-list span {
    margin-top: 6px;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.5;
  }

  .wide {
    grid-column: 1 / -1;
    min-height: auto;
  }

  .module-enter-active,
  .module-leave-active {
    transition: opacity 180ms ease, transform 180ms ease;
  }

  .module-enter-from,
  .module-leave-to {
    opacity: 0;
    transform: translateY(8px);
  }

  @keyframes module-in {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 1200px) {
    .cofco-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .global-filters,
    .kpi-grid,
    .ecommerce-kpi-grid,
    .dashboard-grid,
    .compare-layout,
    .insight-strip,
    .persona-grid,
    .brief-grid,
    .scenario-list,
    .insight-list.two-col {
      grid-template-columns: 1fr;
    }

    .module-tabs {
      grid-template-columns: 1fr;
    }
  }
</style>
