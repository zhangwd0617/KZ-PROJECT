// ============================================
// ERA Maou EX — 全局常量与枚举
// 替代所有 magic numbers（cflag/cstr 索引）
// ============================================

// ---------- CFLAG 索引 ----------
export const CFLAGS = {
    // 基础状态
    CAPTURE_STATUS: 1,        // 俘虏状态
    MAX_STAMINA: 2,           // 最大体力
    SQUAD_ID: 900,            // 所属小队ID
    SQUAD_LEADER: 901,        // 是否队长
    SQUAD_MORALE: 903,        // 小队士气

    // 基础属性 (英雄生成时设置)
    BASE_HP: 9,               // 对应 base[0] 的等级系数
    BASE_MP: 10,              // 对应 base[1]
    ATK: 11,                  // 攻击
    DEF: 12,                  // 防御
    SPD: 13,                  // 敏捷/速度
    STAMINA: 16,              // 体力

    // 情感点数
    LOVE_POINTS: 600,         // 爱情点数
    OBEDIENCE_POINTS: 601,    // 服从点数

    // 堕落度
    FALLEN_DEPTH: 700,        // 堕落深度
    FALLEN_STAGE: 701,        // 堕落阶段
    CORRUPTION: 702,          // 腐蚀度
    SUBMISSION: 703,          // 屈服度
    DESIRE: 704,              // 欲望
    PLEASURE: 705,            // 快感
    DEPRAVITY: 706,           // 淫乱度

    // 妊娠
    PREGNANCY_DAYS: 800,      // 妊娠天数

    // 英雄地牢
    HERO_FLOOR: 501,          // 当前层
    HERO_PROGRESS: 502,       // 层进度%

    // 间谍/探索
    SPY_SENT: 910,            // 间谍已派遣
    SPY_TARGET: 911,          // 间谍目标
    SPY_DISGUISE: 912,        // 间谍伪装

    // 英雄属性扩展
    HERO_PREVIOUS: 920,       // 前勇者标记
    HERO_CLASS: 950,          // 职业ID
    HERO_LEVEL: 951,          // 英雄等级
    HERO_PARTY_ROLE: 952,     // 队伍角色（前/中/后）
    HERO_RARITY: 953,         // 稀有度 N/R/SR/SSR/UR
    SEXUAL_WEAKNESS: 954,     // 性弱点类型
    HERO_GOAL: 960,           // 英雄目标
    HERO_MOTTO: 961,          // 英雄座右铭
    HERO_PERSONALITY: 962,    // 英雄个性
    HERO_BACKSTORY: 970,      // 英雄背景故事
    HERO_APPEARANCE: 971,     // 英雄外观
    HERO_REASON: 981,         // 成为勇者理由
    HERO_ORIGIN: 982,         // 英雄出身
    HERO_FAMILY: 983,         // 英雄家族

    // 任务系统
    HERO_TASK_TYPE: 980,      // 英雄任务类型
    HERO_TASK_STATUS: 984,    // 任务完成标记
    SLAVE_TASK_STATUS: 984,   // 奴隶任务状态
    SLAVE_TASK_TYPE: 985,     // 奴隶任务类型
    SLAVE_TASK_FLOOR: 986,    // 奴隶任务出发层
    SLAVE_TASK_CURRENT_FLOOR: 987, // 奴隶任务当前层
    SLAVE_TASK_RESULT: 988,   // 奴隶任务结果
    SLAVE_TASK_PROGRESS: 990, // 奴隶任务移动进度

    // 魔王勋章
    MEDAL_COUNT: 988,         // 勋章数
    MEDAL_EXP: 989,           // 勋章经验

    // 调教过滤
    COMMAND_FILTER: 991,      // 命令过滤位掩码
};

// ---------- CSTR 索引 ----------
export const CSTRS = {
    NAME: 0,                  // 名字
    NAME_ALT: 1,              // 别名/小队名
    TITLE: 3,                 // 称号
    PREVIOUS_LIFE: 315,       // 勇者前生活
    REASON: 316,              // 成为勇者理由
    SEXUAL_WEAKNESS_DESC: 317,// 性弱点描述
    FACTION: 318,             // 所属势力
    ATTITUDE: 319,            // 对魔王态度
    FAMILY: 320,              // 家族构成
    HOMETOWN: 321,            // 家乡
    APPEARANCE: 330,          // 外观描述文本
    AGE: 331,                 // 年龄
    HEIGHT: 332,              // 身高
    WEIGHT: 333,              // 体重
    BODY_TYPE: 334,           // 体型
    BODY_FEATURES: 335,       // 身体特征
    TASK_DESC: 340,           // 任务描述
    TASK_RESULT: 341,         // 任务结果
    EVENT_LOG: 350,           // 事件日志
    DUNGEON_LOG: 351,         // 地牢日志
    COMBAT_LOG: 352,          // 战斗日志
    TRAIN_LOG: 353,           // 调教日志
    RELATION_LOG: 354,        // 关系日志
};

// ---------- 性弱点类型 ----------
export const WEAKNESS = {
    NONE: 0,
    SHAME: 1,       // 羞耻/暴露
    PAIN: 2,        // 痛苦/SM
    ORAL: 3,        // 口/服务
    ANAL: 4,        // 肛门
    BREAST: 5,      // 胸部
    VAGINAL: 6,     // 阴道/阴蒂
    TOOL: 7,        // 道具/机械
    VOYEUR: 8,      // 被视奸/言语羞辱
};

export const WEAKNESS_NAMES = {
    [WEAKNESS.NONE]: '无',
    [WEAKNESS.SHAME]: '羞耻暴露',
    [WEAKNESS.PAIN]: '痛苦SM',
    [WEAKNESS.ORAL]: '口腔服务',
    [WEAKNESS.ANAL]: '肛门刺激',
    [WEAKNESS.BREAST]: '胸部刺激',
    [WEAKNESS.VAGINAL]: '阴部刺激',
    [WEAKNESS.TOOL]: '道具机械',
    [WEAKNESS.VOYEUR]: '视奸言语',
};

// ---------- 稀有度 ----------
export const RARITY = {
    N: 1,
    R: 2,
    SR: 3,
    SSR: 4,
    UR: 5,
};

export const RARITY_NAMES = {
    [RARITY.N]: 'N',
    [RARITY.R]: 'R',
    [RARITY.SR]: 'SR',
    [RARITY.SSR]: 'SSR',
    [RARITY.UR]: 'UR',
};

// ---------- 队伍角色 ----------
export const ROLE = {
    FRONT: 1,   // 前排
    MIDDLE: 2,  // 中排
    BACK: 3,    // 后排
};

// ---------- 种族 ----------
export const RACE = {
    HUMAN: 1,
    ELF: 2,
    ORC: 3,
    DWARF: 4,
    DEMON: 5,
    ANGEL: 6,
    DRAGON: 7,
    SEA: 8,
    VAMPIRE: 9,
    HALF_DEMON: 10,
};

export const RACE_NAMES = {
    [RACE.HUMAN]: '人类',
    [RACE.ELF]: '精灵',
    [RACE.ORC]: '兽人',
    [RACE.DWARF]: '矮人',
    [RACE.DEMON]: '魔族',
    [RACE.ANGEL]: '天使',
    [RACE.DRAGON]: '龙人',
    [RACE.SEA]: '海族',
    [RACE.VAMPIRE]: '吸血鬼',
    [RACE.HALF_DEMON]: '恶魔混血',
};

// ---------- 游戏状态 ----------
export const GAME_STATE = {
    TITLE: 'TITLE',
    FIRST: 'FIRST',
    SHOP: 'SHOP',
    TRAIN: 'TRAIN',
    AFTERTRAIN: 'AFTERTRAIN',
    ABLUP: 'ABLUP',
    TURNEND: 'TURNEND',
    MAP: 'MAP',
};

// 为兼容全局脚本，挂载到 window
window.CFLAGS = CFLAGS;
window.CSTRS = CSTRS;
window.WEAKNESS = WEAKNESS;
window.WEAKNESS_NAMES = WEAKNESS_NAMES;
window.RARITY = RARITY;
window.RARITY_NAMES = RARITY_NAMES;
window.ROLE = ROLE;
window.RACE = RACE;
window.RACE_NAMES = RACE_NAMES;
window.GAME_STATE = GAME_STATE;
