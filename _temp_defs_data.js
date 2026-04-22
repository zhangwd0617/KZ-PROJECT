
// ========== 勇者职业定义 ==========
// id: 对应 talent ID (新增 211 战士, 212 魔法师)
// baseStats: 基础属性修正系数 (hp, mp, atk, def, spd)
// skills: [常规技能1, 常规技能2, 专属技能]
window.HERO_CLASS_DEFS = {
    211: {
        name: "战士",
        talentId: 211,
        desc: "以压倒性的力量粉碎敌人",
        baseStats: { hp: 1.3, mp: 0.8, atk: 1.25, def: 1.1, spd: 0.9 },
        skills: ["power_strike", "war_cry", "berserk"],
        ai: { aggressive: 0.7, defensive: 0.2, support: 0.1 }
    },
    212: {
        name: "魔法师",
        talentId: 212,
        desc: "操控元素之力的奥术大师",
        baseStats: { hp: 0.8, mp: 1.5, atk: 1.2, def: 0.8, spd: 1.0 },
        skills: ["fireball", "mana_shield", "meteor"],
        ai: { aggressive: 0.6, defensive: 0.2, support: 0.2 }
    },
    202: {
        name: "神官",
        talentId: 202,
        desc: "以神圣之光治愈与守护同伴",
        baseStats: { hp: 1.0, mp: 1.3, atk: 0.8, def: 1.1, spd: 0.9 },
        skills: ["heal", "holy_light", "mass_resurrect"],
        ai: { aggressive: 0.1, defensive: 0.4, support: 0.5 }
    },
    203: {
        name: "盗贼",
        talentId: 203,
        desc: "在阴影中收割生命的暗杀者",
        baseStats: { hp: 0.9, mp: 1.0, atk: 1.15, def: 0.8, spd: 1.3 },
        skills: ["backstab", "evasion", "assassinate"],
        ai: { aggressive: 0.6, defensive: 0.2, support: 0.2 }
    },
    204: {
        name: "骑士",
        talentId: 204,
        desc: "以钢铁意志守护同伴的壁垒",
        baseStats: { hp: 1.2, mp: 0.9, atk: 1.0, def: 1.3, spd: 0.8 },
        skills: ["shield_bash", "guard", "aegis"],
        ai: { aggressive: 0.3, defensive: 0.5, support: 0.2 }
    },
    205: {
        name: "炼金术士",
        talentId: 205,
        desc: "以科学与魔法调制毁灭之力",
        baseStats: { hp: 0.9, mp: 1.2, atk: 1.1, def: 0.9, spd: 1.0 },
        skills: ["throw_potion", "poison_mist", "big_bang"],
        ai: { aggressive: 0.5, defensive: 0.2, support: 0.3 }
    },
    206: {
        name: "游侠",
        talentId: 206,
        desc: "百步穿杨的荒野猎手",
        baseStats: { hp: 1.0, mp: 1.0, atk: 1.15, def: 0.9, spd: 1.15 },
        skills: ["rapid_shot", "trap", "arrow_rain"],
        ai: { aggressive: 0.5, defensive: 0.3, support: 0.2 }
    },
    207: {
        name: "舞者",
        talentId: 207,
        desc: "以魅惑之舞扰乱战场的妖精",
        baseStats: { hp: 0.9, mp: 1.1, atk: 1.0, def: 0.9, spd: 1.2 },
        skills: ["inspire", "slow_dance", "finale"],
        ai: { aggressive: 0.2, defensive: 0.3, support: 0.5 }
    },
    209: {
        name: "巫女",
        talentId: 209,
        desc: "沟通神明、净化污秽的祭祀者",
        baseStats: { hp: 0.9, mp: 1.3, atk: 0.9, def: 1.0, spd: 1.0 },
        skills: ["exorcism", "seal", "kagura"],
        ai: { aggressive: 0.2, defensive: 0.4, support: 0.4 }
    },
    210: {
        name: "枪兵",
        talentId: 210,
        desc: "以长枪贯穿一切防线的先锋",
        baseStats: { hp: 1.1, mp: 0.9, atk: 1.2, def: 1.0, spd: 1.0 },
        skills: ["pierce", "sweep", "dragon_lance"],
        ai: { aggressive: 0.6, defensive: 0.3, support: 0.1 }
    }
};

// 勇者职业随机池
window.HERO_CLASS_POOL = [211, 212, 202, 203, 204, 205, 206, 207, 209, 210];

// ========== 勇者技能定义 ==========
// effectType:
//   damage:    直接伤害 (power + level*scale)
//   heal:      治疗 (power + level*scale)
//   buff_atk:  攻击增益
//   buff_def:  防御增益
//   buff_spd:  速度增益
//   debuff_atk: 攻击减益
//   debuff_def: 防御减益
//   dot:       持续伤害
//   cleanse:   净化异常
//   stun:      眩晕(无法行动)
//   lifesteal: 吸血
//   counter:   反击
//   aoe:       范围攻击
window.HERO_SKILL_DEFS = {
    // === 战士 ===
    power_strike: {
        name: "猛击", type: "active", effectType: "damage",
        power: 50, scale: 2.0, cost: 10, target: "enemy",
        description: "用全力一击造成高额物理伤害"
    },
    war_cry: {
        name: "战吼", type: "active", effectType: "buff_atk",
        power: 20, scale: 0.5, cost: 15, target: "self", duration: 3,
        description: "怒吼提升自身攻击力"
    },
    berserk: {
        name: "狂暴", type: "active", effectType: "berserk",
        power: 40, scale: 1.0, cost: 25, target: "self", duration: 3,
        description: "【专属】以防御为代价大幅提升攻击力"
    },

    // === 魔法师 ===
    fireball: {
        name: "火球术", type: "active", effectType: "damage",
        power: 60, scale: 2.5, cost: 15, target: "enemy",
        description: "发射炽热火球，高威力魔法伤害"
    },
    mana_shield: {
        name: "魔力护盾", type: "active", effectType: "buff_def",
        power: 30, scale: 1.0, cost: 20, target: "self", duration: 3,
        description: "以魔力构筑护盾提升防御"
    },
    meteor: {
        name: "陨石术", type: "active", effectType: "aoe",
        power: 80, scale: 3.0, cost: 40, target: "all_enemies",
        description: "【专属】召唤陨石轰击全体敌人"
    },

    // === 神官 ===
    heal: {
        name: "治疗术", type: "active", effectType: "heal",
        power: 40, scale: 2.0, cost: 15, target: "ally",
        description: "以神圣之力恢复目标HP"
    },
    holy_light: {
        name: "神圣之光", type: "active", effectType: "damage",
        power: 35, scale: 1.5, cost: 15, target: "enemy",
        description: "以神圣光芒灼烧敌人"
    },
    mass_resurrect: {
        name: "群体复苏", type: "active", effectType: "mass_heal",
        power: 30, scale: 1.5, cost: 35, target: "all_allies",
        description: "【专属】以神力恢复全体同伴HP"
    },

    // === 盗贼 ===
    backstab: {
        name: "背刺", type: "active", effectType: "crit_damage",
        power: 40, scale: 2.0, cost: 10, target: "enemy",
        description: "从背后突袭，高概率暴击"
    },
    evasion: {
        name: "闪避", type: "active", effectType: "buff_spd",
        power: 25, scale: 0.8, cost: 10, target: "self", duration: 2,
        description: "提升闪避率与速度"
    },
    assassinate: {
        name: "暗杀", type: "active", effectType: "execute",
        power: 100, scale: 4.0, cost: 30, target: "enemy",
        description: "【专属】对低HP目标造成即死级伤害"
    },

    // === 骑士 ===
    shield_bash: {
        name: "盾击", type: "active", effectType: "damage",
        power: 30, scale: 1.5, cost: 10, target: "enemy",
        description: "以盾牌猛击敌人"
    },
    guard: {
        name: "守护", type: "active", effectType: "buff_def",
        power: 35, scale: 1.0, cost: 15, target: "self", duration: 3,
        description: "大幅强化自身防御"
    },
    aegis: {
        name: "圣盾", type: "active", effectType: "invincible",
        power: 0, scale: 0, cost: 30, target: "self", duration: 1,
        description: "【专属】一回合内免疫所有伤害"
    },

    // === 炼金术士 ===
    throw_potion: {
        name: "投掷药水", type: "active", effectType: "damage",
        power: 35, scale: 1.8, cost: 10, target: "enemy",
        description: "向敌人投掷爆炸性药水"
    },
    poison_mist: {
        name: "毒雾", type: "active", effectType: "dot",
        power: 15, scale: 0.5, cost: 15, target: "enemy", duration: 3,
        description: "释放毒雾使敌人中毒"
    },
    big_bang: {
        name: "大爆炸", type: "active", effectType: "aoe",
        power: 70, scale: 2.5, cost: 35, target: "all_enemies",
        description: "【专属】引发炼金爆炸攻击全体"
    },

    // === 游侠 ===
    rapid_shot: {
        name: "连射", type: "active", effectType: "multi_damage",
        power: 25, scale: 1.2, cost: 12, target: "enemy", hits: 2,
        description: "连续射出两箭"
    },
    trap: {
        name: "陷阱", type: "active", effectType: "debuff_spd",
        power: 20, scale: 0.5, cost: 10, target: "enemy", duration: 3,
        description: "布置陷阱降低敌人速度"
    },
    arrow_rain: {
        name: "箭雨", type: "active", effectType: "aoe",
        power: 45, scale: 1.8, cost: 25, target: "all_enemies",
        description: "【专属】向全体敌人射出箭雨"
    },

    // === 舞者 ===
    inspire: {
        name: "鼓舞", type: "active", effectType: "buff_atk",
        power: 15, scale: 0.5, cost: 12, target: "all_allies", duration: 3,
        description: "以舞蹈激励同伴提升攻击"
    },
    slow_dance: {
        name: "迟缓之舞", type: "active", effectType: "debuff_spd",
        power: 20, scale: 0.5, cost: 12, target: "enemy", duration: 3,
        description: "以舞蹈降低敌人速度"
    },
    finale: {
        name: "终焉之舞", type: "active", effectType: "debuff_all",
        power: 25, scale: 1.0, cost: 30, target: "all_enemies", duration: 2,
        description: "【专属】以禁忌之舞大幅降低全体敌人全属性"
    },

    // === 巫女 ===
    exorcism: {
        name: "驱邪", type: "active", effectType: "cleanse",
        power: 0, scale: 0, cost: 15, target: "ally",
        description: "净化目标的一个异常状态"
    },
    seal: {
        name: "封印", type: "active", effectType: "seal",
        power: 20, scale: 0.5, cost: 15, target: "enemy", duration: 2,
        description: "封印敌人技能"
    },
    kagura: {
        name: "神乐", type: "active", effectType: "buff_all",
        power: 20, scale: 0.8, cost: 30, target: "all_allies", duration: 3,
        description: "【专属】以神乐提升全体同伴全属性"
    },

    // === 枪兵 ===
    pierce: {
        name: "突刺", type: "active", effectType: "pierce",
        power: 45, scale: 2.0, cost: 12, target: "enemy",
        description: "贯穿防御的突刺攻击"
    },
    sweep: {
        name: "横扫", type: "active", effectType: "damage",
        power: 30, scale: 1.5, cost: 10, target: "enemy",
        description: "长枪横扫攻击"
    },
    dragon_lance: {
        name: "龙枪", type: "active", effectType: "execute_pierce",
        power: 90, scale: 3.5, cost: 30, target: "enemy",
        description: "【专属】召唤龙之力进行毁灭性突刺"
    }
};

// ========== 异常状态定义 ==========
// 使用 cflag[920] 作为位掩码存储异常状态
// 使用 cflag[921-930] 存储各状态的持续回合
window.STATUS_AILMENT_DEFS = {
    curse: {
        id: 0, name: "诅咒", bit: 1,
        desc: "被黑暗力量缠绕，全属性大幅下降。只能通过城镇神官或特殊道具解除。",
        effect: { atkMod: -0.20, defMod: -0.20, spdMod: -0.20 },
        dot: { type: "none" },
        actionBlock: 0,
        cureMethods: ["town_priest", "special_item"],
        cureChance: { camp: 0, healer_event: 0, ally_healer: 0 }
    },
    weak: {
        id: 1, name: "虚弱", bit: 2,
        desc: "体力透支，攻击力与防御力下降。",
        effect: { atkMod: -0.30, defMod: -0.30, spdMod: 0 },
        dot: { type: "none" },
        actionBlock: 0,
        cureMethods: ["town_rest", "healer_event", "ally_healer", "camp_rest"],
        cureChance: { camp: 0.5, healer_event: 0.8, ally_healer: 0.6 }
    },
    burn: {
        id: 2, name: "烧伤", bit: 4,
        desc: "身体被火焰灼烧，每回合损失HP。",
        effect: { atkMod: -0.10, defMod: 0, spdMod: 0 },
        dot: { type: "hp_percent", value: 0.05 },
        actionBlock: 0,
        cureMethods: ["town_rest", "healer_event", "ally_healer", "camp_rest"],
        cureChance: { camp: 0.4, healer_event: 0.7, ally_healer: 0.5 }
    },
    aphrodisiac: {
        id: 3, name: "春药中毒", bit: 8,
        desc: "体内充满媚药毒素，每回合损失MP，攻击变得无力。",
        effect: { atkMod: -0.15, defMod: 0, spdMod: -0.10 },
        dot: { type: "mp_percent", value: 0.10 },
        actionBlock: 0,
        cureMethods: ["town_rest", "healer_event", "ally_healer", "camp_rest"],
        cureChance: { camp: 0.3, healer_event: 0.6, ally_healer: 0.4 }
    },
    paralysis: {
        id: 4, name: "麻痹", bit: 16,
        desc: "身体被电流麻痹，有概率无法行动。",
        effect: { atkMod: -0.20, defMod: -0.10, spdMod: -0.30 },
        dot: { type: "none" },
        actionBlock: 0.50,
        cureMethods: ["town_rest", "healer_event", "ally_healer", "camp_rest"],
        cureChance: { camp: 0.3, healer_event: 0.7, ally_healer: 0.5 }
    },
    freeze: {
        id: 5, name: "冰冻", bit: 32,
        desc: "身体被寒冰冻结，速度大幅下降，有概率无法行动。",
        effect: { atkMod: -0.10, defMod: 0, spdMod: -0.50 },
        dot: { type: "none" },
        actionBlock: 0.30,
        cureMethods: ["town_rest", "healer_event", "ally_healer", "camp_rest"],
        cureChance: { camp: 0.4, healer_event: 0.8, ally_healer: 0.6 }
    },
    poison: {
        id: 6, name: "中毒", bit: 64,
        desc: "身中剧毒，每回合持续损失HP。",
        effect: { atkMod: -0.10, defMod: -0.10, spdMod: 0 },
        dot: { type: "hp_percent", value: 0.03 },
        actionBlock: 0,
        cureMethods: ["town_rest", "healer_event", "ally_healer", "camp_rest"],
        cureChance: { camp: 0.5, healer_event: 0.9, ally_healer: 0.7 }
    },
    fear: {
        id: 7, name: "恐惧", bit: 128,
        desc: "内心被恐惧吞噬，攻击力大幅下降，有概率逃跑。",
        effect: { atkMod: -0.40, defMod: -0.20, spdMod: 0 },
        dot: { type: "none" },
        actionBlock: 0.30,
        cureMethods: ["town_rest", "healer_event", "ally_healer", "camp_rest"],
        cureChance: { camp: 0.4, healer_event: 0.7, ally_healer: 0.5 }
    },
    confusion: {
        id: 8, name: "混乱", bit: 256,
        desc: "神智混乱，有概率攻击同伴。",
        effect: { atkMod: 0, defMod: -0.20, spdMod: 0 },
        dot: { type: "none" },
        actionBlock: 0.30,
        friendlyFire: 0.30,
        cureMethods: ["town_rest", "healer_event", "ally_healer", "camp_rest"],
        cureChance: { camp: 0.3, healer_event: 0.6, ally_healer: 0.5 }
    },
    charm: {
        id: 9, name: "魅惑", bit: 512,
        desc: "被魅惑之力控制，有概率为敌方治疗或攻击同伴。",
        effect: { atkMod: -0.20, defMod: -0.20, spdMod: 0 },
        dot: { type: "none" },
        actionBlock: 0.30,
        friendlyFire: 0.30,
        healEnemy: 0.30,
        cureMethods: ["town_rest", "healer_event", "ally_healer", "camp_rest"],
        cureChance: { camp: 0.2, healer_event: 0.5, ally_healer: 0.4 }
    }
};

// 异常状态位掩码 → ID 映射
window.STATUS_AILMENT_BITS = {};
for (const key in window.STATUS_AILMENT_DEFS) {
    const s = window.STATUS_AILMENT_DEFS[key];
    window.STATUS_AILMENT_BITS[s.bit] = key;
}

// 异常状态持续回合存储的 cflag 索引
window.STATUS_AILMENT_TURN_CFIDS = {
    curse: 921, weak: 922, burn: 923, aphrodisiac: 924,
    paralysis: 925, freeze: 926, poison: 927, fear: 928,
    confusion: 929, charm: 930
};

// 治疗职业列表（用于队伍中自动恢复异常状态）
window.HEALER_CLASS_IDS = [202, 209]; // 神官、巫女
