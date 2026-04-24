// ============================================
// ERA Maou EX — 势力与政治体系数据 V3.0
// ============================================

window.WORLD_FACTIONS = {
  heaven: {
    name: "天界",
    desc: "最高意志的居所，神王通过神谕控制地面世界",
    leader: { name: "神王", title: "最高存在", desc: "下达神谕，制定大方向" },
    duty: "提供天使军团和神力支援"
  },
  surfaceCouncil: {
    name: "地面议会",
    desc: "教廷中枢，解释神谕并制定地面政策",
    members: [
      { name: "四天王", role: "天使总督", desc: "各管一域，管理天使军团" },
      { name: "教廷大主教", role: "行政总管", desc: "管理教廷日常事务，协调四天王" }
    ],
    duty: "向神王汇报，维持地面秩序",
    power: "解释神谕，制定地面政策"
  },
  raceKingdoms: {
    name: "四大种族王国",
    desc: "地面世界的自治领地，保留各自的政治体系",
    members: [
      { race: 1, name: "圣光联邦", polity: "贵族议会制", leader: "联邦大统领" },
      { race: 4, name: "霜铁议会", polity: "锻造家族制", leader: "议会长" },
      { race: 2, name: "翡翠之冠", polity: "王族制", leader: "精灵女王" },
      { race: 3, name: "赤潮联盟", polity: "酋长制", leader: "大酋长" }
    ]
  },
  kingTerritories: {
    name: "天王自治领",
    desc: "依附于主城旁的天使要塞",
    members: [
      { king: "raphael", name: "圣天王领", location: "圣光城北侧·纯白要塞" },
      { king: "thor", name: "铁天王领", location: "深炉城东侧·钢铁圣殿" },
      { king: "olivia", name: "翠天王领", location: "世界树外围·翡翠高塔" },
      { king: "caesar", name: "赤天王领", location: "赤潮要塞西侧·战争神殿" }
    ]
  }
};

// ============================================
// 四天王真身数据
// ============================================
window.HEAVENLY_KINGS = {
  raphael: {
    title: "圣天王",
    divineName: "拉斐尔",
    gender: "男",
    rank: "炽天使",
    base: "纯白要塞",
    legionSize: 3000,
    legionType: "天使骑士",
    legionComposition: {
      archangel: { pct: 1, role: "军团长", power: "极高（SSR勇者级）" },
      angel: { pct: 10, role: "中层军官", power: "高（SR勇者级）" },
      subAngel: { pct: 30, role: "基层士兵", power: "中（R勇者级）" },
      trainee: { pct: 59, role: "后勤/传令/巡逻", power: "低（N级）" }
    },
    psyche: "长期统治的倦怠，暗中挑事",
    intrigue: {
      method: "宗教挑拨",
      effect: "人类指责兽人不洁，引发清洗",
      targetRaces: [1, 3]
    },
    attitudeToDevil: "魔王苏醒后兴奋，竞争谁的勇者先杀死魔王"
  },
  thor: {
    title: "铁天王",
    divineName: "托尔",
    gender: "女",
    rank: "能天使",
    base: "钢铁圣殿",
    legionSize: 2500,
    legionType: "天使工匠",
    legionComposition: {
      archangel: { pct: 1, role: "军团长", power: "极高（SSR勇者级）" },
      angel: { pct: 10, role: "中层军官", power: "高（SR勇者级）" },
      subAngel: { pct: 30, role: "基层士兵", power: "中（R勇者级）" },
      trainee: { pct: 59, role: "后勤/传令/巡逻", power: "低（N级）" }
    },
    psyche: "长期统治的倦怠，暗中挑事",
    intrigue: {
      method: "操纵矿石价格",
      effect: "矮人与精灵因贸易纠纷交恶",
      targetRaces: [4, 2]
    },
    attitudeToDevil: "魔王苏醒后兴奋，竞争捕获的魔族更多"
  },
  olivia: {
    title: "翠天王",
    divineName: "奥莉薇亚",
    gender: "女",
    rank: "主天使",
    base: "翡翠高塔",
    legionSize: 2000,
    legionType: "天使法师",
    legionComposition: {
      archangel: { pct: 1, role: "军团长", power: "极高（SSR勇者级）" },
      angel: { pct: 10, role: "中层军官", power: "高（SR勇者级）" },
      subAngel: { pct: 30, role: "基层士兵", power: "中（R勇者级）" },
      trainee: { pct: 59, role: "后勤/传令/巡逻", power: "低（N级）" }
    },
    psyche: "长期统治的倦怠，暗中挑事",
    intrigue: {
      method: "散布谣言",
      effect: "精灵指责人类砍伐森林",
      targetRaces: [2, 1]
    },
    attitudeToDevil: "魔王苏醒后兴奋，低调但暗中竞争"
  },
  caesar: {
    title: "赤天王",
    divineName: "凯撒",
    gender: "男",
    rank: "力天使",
    base: "战争神殿",
    legionSize: 4000,
    legionType: "天使战士",
    legionComposition: {
      archangel: { pct: 1, role: "军团长", power: "极高（SSR勇者级）" },
      angel: { pct: 10, role: "中层军官", power: "高（SR勇者级）" },
      subAngel: { pct: 30, role: "基层士兵", power: "中（R勇者级）" },
      trainee: { pct: 59, role: "后勤/传令/巡逻", power: "低（N级）" }
    },
    psyche: "长期统治的倦怠，暗中挑事",
    intrigue: {
      method: "伪造边境冲突",
      effect: "兽人与人类爆发小规模战争",
      targetRaces: [3, 1]
    },
    attitudeToDevil: "魔王苏醒后兴奋，渴望真正的敌人"
  }
};

// ============================================
// 四大种族政治体系
// ============================================
window.RACE_POLITICS = {
  1: {
    raceName: "人类",
    kingdom: "圣光联邦",
    capital: "圣光城",
    polity: "贵族议会制",
    powerStructure: [
      { title: "联邦大统领", desc: "名义最高领袖，由贵族议会选举" },
      { title: "贵族议会", desc: "7大公爵家族，掌握实权" },
      { title: "地方领主", desc: "伯爵/子爵/男爵，管理领地" },
      { title: "平民", desc: "农民/工匠/商人，纳税服役" }
    ],
    churchRelation: [
      "教廷独立于联邦政府",
      "联邦大统领需要教廷祝福才能就职",
      "贵族议会中有教廷代表（无投票权，有否决权）",
      "教廷税收（什一税）与联邦税收分开征收"
    ],
    internalConflicts: [
      "大统领派 vs 贵族议会派（权力斗争）",
      "北方贵族 vs 南方贵族（贸易路线争端）",
      "教会骑士团 vs 联邦军（军费分配）"
    ],
    attitudeToDevil: {
      official: "绝对的恐惧与仇恨（教廷洗脑）",
      noble: "部分知道真相（家族秘密），但不敢反抗",
      commoner: "真心仇恨魔王（被洗脑）",
      rebel: "同情魔王，秘密传播真相"
    }
  },
  4: {
    raceName: "矮人",
    kingdom: "霜铁议会",
    capital: "深炉城",
    polity: "锻造家族议会制",
    powerStructure: [
      { title: "议会长", desc: "七大锻造家族轮流担任，任期10年" },
      { title: "七大锻造家族", desc: "掌握锻造产业和政治权力" },
      { title: "独立工匠", desc: "有技术但无政治地位" },
      { title: "矿工阶层", desc: "被压榨，数量最多" }
    ],
    churchRelation: [
      "教廷控制矮人的武器出口许可证",
      "没有许可证，矮人无法向其他种族出售武器",
      "教廷以防止魔王复苏为由，限制矮人研发古代锻造技术",
      "铁天王直接监视记忆之锤组织"
    ],
    internalConflicts: [
      "传统派 vs 革新派（是否恢复古代技术）",
      "大家族 vs 小家族（资源分配）",
      "地上矮人 vs 地下矮人（深炉城地下还有一层，地下矮人更古老）"
    ],
    attitudeToDevil: {
      official: "服从教廷（被迫）",
      forgeFamily: "怀念魔王时代的自由（当时矮人可以自由交易）",
      miner: "不知道真相，但生活艰苦，对教廷不满",
      rebel: "记忆之锤：积极寻找魔王，希望恢复同盟"
    }
  },
  2: {
    raceName: "精灵",
    kingdom: "翡翠之冠",
    capital: "世界树·伊格德拉希尔的树冠城市",
    polity: "古老王族制",
    powerStructure: [
      { title: "精灵女王", desc: "统治800年，名义最高领袖" },
      { title: "王族议会", desc: "女王的亲属和顾问" },
      { title: "森林守护者", desc: "管理各片森林的精灵长老" },
      { title: "普通精灵", desc: "平民，寿命500年，生活悠闲" }
    ],
    churchRelation: [
      "教廷以保护世界树为由，在世界树外围建立翡翠高塔",
      "翠天王以顾问身份参与王族议会（有否决权）",
      "精灵魔法研究需要教廷批准（防止研究古代魔法）",
      "回归派被定义为堕落者，遭到清洗"
    ],
    internalConflicts: [
      "保守派 vs 回归派（是否恢复与魔王的联系）",
      "年轻精灵 vs 古老精灵（对教廷的态度不同）",
      "树冠精灵 vs 树根精灵（树根精灵更古老，知道更多真相）"
    ],
    attitudeToDevil: {
      official: "警惕但中立（精灵被教廷视为容易堕落）",
      conservative: "敌视魔王（被洗脑）",
      returner: "同情魔王，认为堕落=回归真实",
      queen: "表面服从，实际上是回归派（但不敢公开）"
    }
  },
  3: {
    raceName: "兽人",
    kingdom: "赤潮联盟",
    capital: "赤潮要塞（军事据点）",
    polity: "部落联盟制",
    powerStructure: [
      { title: "大酋长", desc: "最强战士担任，通过决斗产生" },
      { title: "部落酋长", desc: "各部落首领，组成酋长议会" },
      { title: "萨满", desc: "精神领袖，传承古老知识" },
      { title: "战士阶层", desc: "兽人社会核心" },
      { title: "平民", desc: "农民/牧民，地位较低" }
    ],
    churchRelation: [
      "教廷以文明化为由，在赤潮要塞西侧建立战争神殿",
      "赤天王以军事顾问身份参与酋长议会",
      "兽人战士被强迫参加勇者队伍（作为炮灰）",
      "兽人的荣耀法则被扭曲为服从教廷=荣耀"
    ],
    internalConflicts: [
      "主战派 vs 主和派（是否继续服从教廷）",
      "年轻战士 vs 老萨满（对古老血誓的态度）",
      "草原部落 vs 森林部落（领地争端）"
    ],
    attitudeToDevil: {
      official: "被迫服从（被镇压）",
      warrior: "部分被洗脑，部分本能不愿讨伐（血统记忆）",
      shaman: "保留古老知识，知道血誓的存在",
      rebel: "血誓兄弟会：秘密效忠魔王，等待归来"
    }
  }
};

// ============================================
// 种族恩怨矩阵
// ============================================
window.RACE_GRUDGES = {
  "1_3": {
    name: "人类 vs 兽人",
    origin: "圣天王散布兽人不洁言论，引发人类对兽人的清洗。人类边境村庄被不明势力袭击，教廷宣称是兽人干的（实际上是赤天王伪造）。人类发起净化战争，屠杀兽人平民。",
    current: [
      "边境地区仍有小规模冲突",
      "人类商人不敢进入兽人领地",
      "兽人战士遇到人类勇者时，攻击欲望+30%"
    ],
    partyPenalty: -15,
    combatEffect: "若入侵勇者小队中有互相敌视的种族，他们可能内斗"
  },
  "2_4": {
    name: "矮人 vs 精灵",
    origin: "铁天王操纵矿石价格，引发贸易纠纷。矮人提高精灵所需的秘银价格，精灵指责矮人贪婪，矮人反击称精灵傲慢，双方断绝贸易关系。",
    current: [
      "精灵无法获得优质金属，武器质量下降",
      "矮人失去精灵的魔法附魔服务",
      "双方互相鄙视，称对方堕落种族"
    ],
    partyPenalty: -15,
    combatEffect: "若入侵勇者小队中有互相敌视的种族，他们可能内斗"
  },
  "1_2": {
    name: "精灵 vs 人类",
    origin: "翠天王散布人类砍伐森林谣言。人类扩张农田确实砍伐了部分森林，教廷夸大其词宣称人类要毁灭自然，精灵派出森林守护者袭击人类村庄。",
    current: [
      "人类与精灵边境紧张",
      "人类商人被精灵拒绝入境",
      "精灵对人类的工业污染极度敏感"
    ],
    partyPenalty: -10,
    combatEffect: "若入侵勇者小队中有互相敌视的种族，他们可能内斗"
  },
  "3_4": {
    name: "兽人 vs 矮人",
    origin: "赤天王伪造矮人偷猎兽人圣兽事件。兽人圣兽被猎杀，现场留下矮人锻造的箭头，兽人向矮人宣战，矮人否认但兽人不信。",
    current: [
      "兽人拒绝使用矮人武器（即使通过黑市）",
      "矮人拒绝为兽人锻造",
      "双方互相称对方野蛮/狡猾"
    ],
    partyPenalty: -10,
    combatEffect: "若入侵勇者小队中有互相敌视的种族，他们可能内斗"
  }
};

// ============================================
// 勇者小队配置
// ============================================
window.HERO_PARTY_ROLES = {
  front: {
    name: "前排",
    desc: "坦克/战士，承受伤害",
    raceClasses: {
      1: { className: "人类骑士", classId: 204, desc: "装备精良，意志薄弱" },
      4: { className: "矮人重装", classId: 204, desc: "重装，高HP低MP" },
      3: { className: "兽人狂战士", classId: 211, desc: "高HP，野性，SM系敏感" }
    }
  },
  middle: {
    name: "中排",
    desc: "输出/控制",
    raceClasses: {
      1: { className: "人类法师", classId: 205, desc: "均衡的魔法输出" },
      2: { className: "精灵弓手", classId: 206, desc: "高MP，慢热，技巧精湛" },
      4: { className: "矮人工程师", classId: 205, desc: "炼金与机械结合" }
    }
  },
  back: {
    name: "后排",
    desc: "辅助/治疗",
    raceClasses: {
      1: { className: "人类牧师", classId: 202, desc: "信仰驱动的治疗者" },
      2: { className: "精灵德鲁伊", classId: 209, desc: "自然魔法与治疗" },
      3: { className: "兽人萨满", classId: 209, desc: "传承古老知识的精神领袖" }
    }
  }
};

window.HERO_RARITY_DEFS = {
  N:  { name: "N",  label: "普通",     prob: 60, desc: "普通冒险者，基础属性" },
  R:  { name: "R",  label: "精英",     prob: 25, desc: "精英，某属性突出" },
  SR: { name: "SR", label: "英雄",     prob: 10, desc: "英雄，特殊技能" },
  SSR:{ name: "SSR",label: "传说",     prob: 4,  desc: "高全属性" },
  UR: { name: "UR", label: "唯一",     prob: 1,  desc: "专属剧情角色" }
};

window.HERO_RACE_SOURCES = {
  1: {
    raceName: "人类",
    sources: ["教会骑士团", "贵族子弟", "平民志愿者"],
    motives: ["信仰", "镀金", "赏金"],
    traits: "装备精良，意志薄弱"
  },
  4: {
    raceName: "矮人",
    sources: ["锻造家族战士", "矿工义勇军"],
    motives: ["契约", "复仇", "荣耀"],
    traits: "重装，高HP，低MP"
  },
  2: {
    raceName: "精灵",
    sources: ["森林守护者", "王族卫队", "回归派卧底"],
    motives: ["使命", "好奇", "卧底"],
    traits: "高MP，慢热，技巧精湛"
  },
  3: {
    raceName: "兽人",
    sources: ["部落战士", "萨满学徒", "血誓兄弟会成员"],
    motives: ["荣耀", "命令", "卧底"],
    traits: "高HP，野性，SM系敏感"
  }
};

// ============================================
// UR勇者预设数据
// ============================================
window.UR_HERO_DEFS = {
  elysia: {
    race: 1,
    name: "艾莉希雅",
    title: "圣女",
    classId: 202,
    desc: "教廷门面，私下质疑教义",
    backstory: "作为教廷选出的圣女，艾莉希雅拥有极高的圣光亲和力，但她最近开始质疑教廷的某些教义..."
  },
  muradin: {
    race: 4,
    name: "穆拉丁",
    title: "锻造大师",
    classId: 204,
    desc: "记忆之锤成员，知道真相",
    backstory: "七大锻造家族之一的继承人，在地下遗迹中发现了古代契约的碎片，知道了魔王曾是盟友..."
  },
  serena: {
    race: 2,
    name: "瑟琳娜",
    title: "精灵公主",
    classId: 206,
    desc: "回归派，实际上是卧底",
    backstory: "精灵女王的侄女，表面上是王族卫队的精英，实际上是回归派派来接触魔王的卧底..."
  },
  graka: {
    race: 3,
    name: "格拉卡",
    title: "大酋长之女",
    classId: 211,
    desc: "血誓兄弟会，来投奔",
    backstory: "现任大酋长的独生女，身上流着古老的血誓之血，她不是为了讨伐魔王而来，而是为了投奔..."
  }
};

// ============================================
// World Map Data
// ============================================
window.WORLD_MAP_DATA = {
  // 势力区域：多边形坐标（基于1920x1080参考分辨率）
  territories: [
    {
      id: "human", name: "圣光联邦", race: "人类", pop: "5,800万", ratio: "45%",
      color: "rgba(220,50,50,0.35)", border: "rgba(220,50,50,0.8)",
      desc: "贵族议会制，七层城墙，农耕文明，教会骑士团与联邦军对立",
      path: [[720,80],[1050,60],[1250,150],[1400,280],[1350,420],[1100,480],[950,450],[800,380],[700,250],[680,150]]
    },
    {
      id: "elf", name: "翡翠之冠", race: "精灵", pop: "1,300万", ratio: "10%",
      color: "rgba(50,150,50,0.35)", border: "rgba(50,150,50,0.8)",
      desc: "古老王族制，世界树伊格德拉希尔，500年寿命，回归派潜伏",
      path: [[180,80],[450,60],[550,150],[520,280],[400,320],[250,280],[150,200],[120,120]]
    },
    {
      id: "dwarf", name: "霜铁议会", race: "矮人", pop: "2,000万", ratio: "15%",
      color: "rgba(180,120,50,0.35)", border: "rgba(180,120,50,0.8)",
      desc: "锻造家族议会制，地下七层深炉城，矿脉即权力，记忆之锤秘密活动",
      path: [[600,300],[750,280],[800,380],[750,480],[650,500],[550,450],[520,350]]
    },
    {
      id: "orc", name: "赤潮联盟", race: "兽人", pop: "3,200万", ratio: "25%",
      color: "rgba(200,100,30,0.35)", border: "rgba(200,100,30,0.8)",
      desc: "部落联盟制，决斗产生大酋长，萨满传承，血誓兄弟会潜伏",
      path: [[450,520],[650,500],[750,480],[850,550],[900,700],[800,850],[600,900],[400,850],[350,700],[400,600]]
    },
    {
      id: "church", name: "教廷直属地", race: "教廷", pop: "200万", ratio: "1.5%",
      color: "rgba(255,215,0,0.35)", border: "rgba(255,215,0,0.8)",
      desc: "地面议会总部，神谕接收处，异端审判所",
      path: [[1400,280],[1550,250],[1650,350],[1600,500],[1450,480],[1350,420]]
    },
    {
      id: "frontier", name: "边缘地带", race: "混血/流放", pop: "650万", ratio: "5%",
      color: "rgba(100,100,120,0.35)", border: "rgba(100,100,120,0.8)",
      desc: "三不管地带，堕落者地下网络，走私者与古代魔族残部",
      path: [[1550,250],[1750,200],[1850,350],[1800,600],[1600,650],[1600,500],[1650,350]]
    },
    {
      id: "desert", name: "奥莱恩沙漠", race: "无人区", pop: "<10万", ratio: "0%",
      color: "rgba(200,180,100,0.2)", border: "rgba(200,180,100,0.5)",
      desc: "古代战场遗迹，探险者与盗墓贼",
      path: [[800,380],[950,450],[1100,480],[1050,600],[900,700],[850,550],[750,480]]
    }
  ],

  // 城市数据
  cities: [
    // 人类城市
    { name: "圣光城", type: "capital", race: "human", x: 950, y: 220, pop: "120万", feature: "联邦大统领驻地·贵族议会·大圣堂·勇者总部" },
    { name: "金穗城", type: "major", race: "human", x: 1150, y: 380, pop: "45万", feature: "联邦粮仓·南方贵族派大本营·粮食交易所" },
    { name: "灰堡", type: "major", race: "human", x: 1250, y: 180, pop: "38万", feature: "北方要塞·教会骑士团总部·边境军事" },
    { name: "麦香镇", type: "town", race: "human", x: 1050, y: 300, pop: "8万", feature: "小麦主产区" },
    { name: "铁砧镇", type: "town", race: "human", x: 850, y: 320, pop: "6万", feature: "矮人贸易桥头堡（已萎缩）" },
    { name: "渡口镇", type: "town", race: "human", x: 1200, y: 450, pop: "7万", feature: "河港·漕运枢纽" },
    { name: "银滩镇", type: "town", race: "human", x: 1350, y: 350, pop: "5万", feature: "盐业·渔业·海军预备港" },
    { name: "荆棘镇", type: "town", race: "human", x: 780, y: 200, pop: "4万", feature: "背教者地下网络据点·军费重地" },
    { name: "琉璃镇", type: "town", race: "human", x: 750, y: 150, pop: "6万", feature: "平民富商崛起地·奢侈品工坊" },
    { name: "高塔镇", type: "town", race: "human", x: 880, y: 120, pop: "5万", feature: "法师塔聚集地（教廷监视）·背教者隐藏点" },
    { name: "凯旋镇", type: "town", race: "human", x: 1100, y: 420, pop: "6万", feature: "勇者训练营·新兵入伍处" },

    // 矮人城市
    { name: "深炉城", type: "capital", race: "dwarf", x: 650, y: 380, pop: "60万", feature: "议会长驻地·熔心锻造厂·记忆之锤据点（地下七层）" },
    { name: "秘银厅", type: "major", race: "dwarf", x: 550, y: 320, pop: "22万", feature: "最大秘银矿脉·古代契约碎片发现地" },
    { name: "龙息炉", type: "major", race: "dwarf", x: 720, y: 420, pop: "18万", feature: "巨型熔炉·武器出口·钢铁圣殿东侧3里" },
    { name: "黑钻镇", type: "town", race: "dwarf", x: 600, y: 300, pop: "4万", feature: "钻石宝石开采" },
    { name: "熔岩镇", type: "town", race: "dwarf", x: 680, y: 450, pop: "3万", feature: "温泉·锻造冷却池·矿工疗养" },
    { name: "砧板镇", type: "town", race: "dwarf", x: 620, y: 420, pop: "5万", feature: "小家族作坊·革新派温床" },
    { name: "竖井镇", type: "town", race: "dwarf", x: 660, y: 350, pop: "6万", feature: "升降机枢纽·人口流动中转" },
    { name: "硫磺镇", type: "town", race: "dwarf", x: 580, y: 400, pop: "2万", feature: "火药炼金材料·教廷限制研发区" },
    { name: "陨铁镇", type: "town", race: "dwarf", x: 500, y: 350, pop: "3万", feature: "古代金属研究·铁天王重点监视" },

    // 精灵城市
    { name: "世界树·伊格德拉希尔", type: "capital", race: "elf", x: 320, y: 180, pop: "35万", feature: "女王宫殿·世界树神殿·翡翠高塔外围5里" },
    { name: "晨露城", type: "major", race: "elf", x: 420, y: 250, pop: "12万", feature: "与人类贸易关口（已萧条）·回归派秘密通道" },
    { name: "织星塔", type: "major", race: "elf", x: 280, y: 100, pop: "8万", feature: "占星魔法学院·古代魔法禁书库" },
    { name: "叶影村", type: "town", race: "elf", x: 350, y: 220, pop: "3万", feature: "普通精灵聚居·树冠中层" },
    { name: "溪歌镇", type: "town", race: "elf", x: 380, y: 280, pop: "2万", feature: "吟游诗人·历史学家·口头史诗传承" },
    { name: "根须营地", type: "town", race: "elf", x: 300, y: 250, pop: "4万", feature: "树根精灵圣地·回归派核心" },
    { name: "苔藓居", type: "town", race: "elf", x: 250, y: 200, pop: "1.5万", feature: "草药师·德鲁伊聚集地" },
    { name: "风语谷", type: "town", race: "elf", x: 200, y: 150, pop: "2万", feature: "风系魔法修炼·年轻精灵叛逆期聚集地" },
    { name: "花绽镇", type: "town", race: "elf", x: 400, y: 150, pop: "2.5万", feature: "纺织染料·与矮人旧丝绸贸易点" },
    { name: "银弦镇", type: "town", race: "elf", x: 360, y: 80, pop: "3万", feature: "精灵弓手训练场·森林守护者营地" },

    // 兽人城市
    { name: "赤潮要塞", type: "capital", race: "orc", x: 600, y: 700, pop: "50万", feature: "大酋长驻地·决斗广场·十二部落帐篷城·战争神殿西侧2里" },
    { name: "裂颅大营", type: "major", race: "orc", x: 750, y: 650, pop: "28万", feature: "最大部落联盟营地·萨满祭坛·血誓兄弟会核心据点" },
    { name: "霜狼原", type: "major", race: "orc", x: 500, y: 800, pop: "20万", feature: "冬季牧场·霜狼部落发源地·游牧文化中心" },
    { name: "血蹄营地", type: "town", race: "orc", x: 650, y: 600, pop: "8万", feature: "血蹄部落驻地·主要骑兵产地" },
    { name: "黑牙哨站", type: "town", race: "orc", x: 800, y: 580, pop: "3万", feature: "监视人类（灰堡）与精灵（晨露城）前哨" },
    { name: "钢鬃牧场", type: "town", race: "orc", x: 550, y: 750, pop: "10万", feature: "主要粮食产地·教廷征收比例最高" },
    { name: "毒矛集市", type: "town", race: "orc", x: 700, y: 780, pop: "4万", feature: "与矮人黑市旧交易点·主战派聚集地" },
    { name: "雷图腾谷", type: "town", race: "orc", x: 850, y: 700, pop: "2万", feature: "萨满传承地·古老知识保存处" },
    { name: "火颅营地", type: "town", race: "orc", x: 500, y: 650, pop: "5万", feature: "对抗教廷文明化镇压前哨·冲突最频繁" },

    // 教廷圣地
    { name: "圣座城", type: "church", race: "church", x: 1500, y: 350, pop: "15万", feature: "地面议会总部·神谕接收处·大主教驻地" },
    { name: "裁决城", type: "church", race: "church", x: 1450, y: 450, pop: "8万", feature: "异端审判所总部·禁书焚毁中心" },

    // 边缘地带
    { name: "西尔索", type: "town", race: "frontier", x: 100, y: 300, pop: "30万", feature: "名义独立·教廷傀儡·各族混血聚集地" },
    { name: "埃雷克西亚", type: "town", race: "frontier", x: 1700, y: 500, pop: "25万", feature: "争议地带·教廷控制力薄弱·流放者节点" }
  ],

  // 四天王要塞
  forts: [
    { name: "纯白要塞", king: "圣天王·拉斐尔", race: "angel", x: 950, y: 140, garrison: "3000天使骑士", target: "圣光城", direction: "北侧10里", desc: "监视人类贵族与背教者" },
    { name: "钢铁圣殿", king: "铁天王·托尔", race: "angel", x: 780, y: 420, garrison: "2500天使工匠", target: "深炉城", direction: "东侧3里", desc: "监视矮人锻造家族与记忆之锤" },
    { name: "翡翠高塔", king: "翠天王·奥莉薇亚", race: "angel", x: 420, y: 180, garrison: "2000天使法师", target: "世界树", direction: "外围5里", desc: "监视精灵王族与回归派" },
    { name: "战争神殿", king: "赤天王·凯撒", race: "angel", x: 520, y: 700, garrison: "4000天使战士", target: "赤潮要塞", direction: "西侧2里", desc: "监视兽人大酋长与血誓兄弟会" }
  ],

  // 恩怨连接线（用于显示种族摩擦）
  grudges: [
    { from: "圣光城", to: "赤潮要塞", label: "净化战争", color: "#ff4444", desc: "人类发起净化战争，兽人铭记仇恨" },
    { from: "深炉城", to: "世界树·伊格德拉希尔", label: "贸易断绝", color: "#ff8844", desc: "秘银价格操纵，矮人精灵互相鄙视" },
    { from: "灰堡", to: "晨露城", label: "森林争端", color: "#44ff44", desc: "人类砍伐森林，精灵袭击村庄" },
    { from: "裂颅大营", to: "秘银厅", label: "圣兽猎杀", color: "#ffaa44", desc: "伪造矮人偷猎兽人圣兽事件" }
  ]
};
