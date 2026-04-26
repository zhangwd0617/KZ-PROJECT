// ============================================
// ERA Maou EX — 堕落种族系统 V3.0
// ============================================

window.FALLEN_RACES = {
  heretic: {
    key: "heretic",
    prefix: "背教者",
    originRace: 1,
    originRaceName: "人类",
    formationCause: "质疑教廷教义，阅读禁书",
    desc: "思想上的背离教廷，被教廷定义为异端的人类。",
    traits: {
      obedienceBonus: 20,
      rejectRateMod: 0,
      pleasureMult: 1.0,
      stage3Bonus: true
    },
    marking: "拒绝佩戴教廷标志，身上有异端烙印",
    initialAttitude: "friendly",
    joinMethod: "主动投靠",
    combatMod: {
      partyWithOrthodox: -20,
      partyWithFallen: 10,
      partyWithDemon: 30
    },
    truthFragment: 1
  },
  ancientBond: {
    key: "ancientBond",
    prefix: "古契者",
    originRace: 4,
    originRaceName: "矮人",
    formationCause: "发现古代契约，知道魔王是盟友",
    desc: "发现了古代同盟契约的矮人，渴望恢复与魔王的古老同盟。",
    traits: {
      obedienceBonus: 0,
      rejectRateMod: 0,
      pleasureMult: 1.0,
      stage3Bonus: true,
      contractSensitive: true
    },
    marking: "携带古代契约碎片，锻造时有特殊符文",
    initialAttitude: "friendly",
    joinMethod: "主动投靠",
    combatMod: {
      partyWithOrthodox: -20,
      partyWithFallen: 10,
      partyWithDemon: 30
    },
    truthFragment: 2
  },
  returner: {
    key: "returner",
    prefix: "回归者",
    originRace: 2,
    originRaceName: "精灵",
    formationCause: "接触世界树记忆，知道堕落=真实",
    desc: "接触了世界树深层记忆的精灵，明白被教廷称为堕落的才是真正的真实。",
    traits: {
      obedienceBonus: 0,
      rejectRateMod: -10,
      pleasureMult: 1.5,
      stage3Bonus: true,
      slowStarter: true
    },
    marking: "眼睛颜色从绿变为紫（世界树记忆觉醒）",
    initialAttitude: "friendly",
    joinMethod: "主动投靠",
    combatMod: {
      partyWithOrthodox: -20,
      partyWithFallen: 10,
      partyWithDemon: 30
    },
    truthFragment: 2
  },
  bloodOath: {
    key: "bloodOath",
    prefix: "血誓者",
    originRace: 3,
    originRaceName: "兽人",
    formationCause: "传承古老血誓，知道魔王是盟友",
    desc: "身上流着古老血誓之血的兽人，本能地知道魔王才是他们真正的盟友。",
    traits: {
      obedienceBonus: 30,
      rejectRateMod: 0,
      pleasureMult: 1.0,
      stage3Bonus: true,
      strengthWorship: true
    },
    marking: "身上有古老血誓纹身，战斗时会发光",
    initialAttitude: "friendly",
    joinMethod: "主动投靠",
    combatMod: {
      partyWithOrthodox: -20,
      partyWithFallen: 10,
      partyWithDemon: 30
    },
    truthFragment: 1
  },
  fallenAngel: {
    key: "fallenAngel",
    prefix: "堕天使",
    originRace: 6,
    originRaceName: "天使",
    formationCause: "产生疑问，质疑神王",
    desc: "对神王的命令产生了疑问的天使，翅膀开始变黑，失去了圣光。",
    traits: {
      obedienceBonus: 10,
      rejectRateMod: 0,
      pleasureMult: 1.0,
      stage3Bonus: true,
      curiosity: true
    },
    marking: "翅膀从白变为灰/黑，失去圣光",
    initialAttitude: "curious",
    joinMethod: "主动投靠",
    combatMod: {
      partyWithOrthodox: -20,
      partyWithFallen: 10,
      partyWithDemon: 30
    },
    truthFragment: 3
  }
};

// ============================================
// 堕落者生成器
// ============================================
window.generateFallenCharacter = function(typeKey, options) {
  const def = window.FALLEN_RACES[typeKey];
  if (!def) return null;

  options = options || {};
  const c = new Character(options.templateId || -2);

  // 基础种族设定
  c.talent[314] = def.originRace;

  // 名称前缀
  const baseName = options.name || c.name || "无名者";
  c.name = def.prefix + "·" + baseName;
  c.callname = c.name;

  // 堕落标记（使用 cflag 范围 960-969）
  c.cflag[960] = 1; // 是堕落者
  c.cflag[CFLAGS.HERO_MOTTO] = def.originRace; // 原种族
  c.cstr[CSTRS.EVENT_LOG] = def.prefix; // 堕落前缀名
  c.cstr[CSTRS.DUNGEON_LOG] = def.marking; // 身体标记
  c.cstr[CSTRS.COMBAT_LOG] = def.formationCause; // 形成原因
  c.cstr[CSTRS.TRAIN_LOG] = def.desc; // 描述

  // 真相碎片
  c.cflag[CFLAGS.HERO_PERSONALITY] = def.truthFragment || 0;

  // 初始恭顺加成（影响 cflag[CFLAGS.HERO_BACKSTORY] 恭顺度基准）
  if (def.traits.obedienceBonus) {
    c.cflag[CFLAGS.HERO_BACKSTORY] = (c.cflag[CFLAGS.HERO_BACKSTORY] || 0) + def.traits.obedienceBonus;
  }

  // 堕落者不需要捕获，直接成为眷属
  c.cflag[CFLAGS.CAPTURE_STATUS] = 0; // 非俘虏
  c.cflag[2] = 1; // 已归属

  // 应用种族外观
  if (typeof CharaTemplates !== 'undefined') {
    CharaTemplates.applyRandomAppearance(c);
    // 强制种族为原种族
    c.talent[314] = def.originRace;
    CharaTemplates.generateAppearanceDesc(c);
  }

  // P1+ 初始化
  if (typeof generatePersonality === 'function') {
    c.personality = generatePersonality(c);
  }
  const isMale = c.talent[122];
  const isFuta = c.talent[121];
  c.genitalConfig = {
    hasVagina: !isMale || isFuta,
    hasWomb: (!isMale || isFuta) && !c.talent[123],
    penises: isMale || isFuta ? [{ id: 0, name: "肉棒", ejaculationGauge: 0, sensitivity: 1.0, linkedParts: ["V", "A", "O"] }] : [],
    orgasmSystem: "standard"
  };
  c.cflag[CFLAGS.HERO_RARITY] = 'N'; // 稀有度默认为N

  return c;
};

// ============================================
// 种族配合度计算（用于小队生成）
// ============================================
window.calculateRaceCompatibility = function(raceA, raceB, isFallenA, isFallenB) {
  // 同种族
  if (raceA === raceB) {
    if (isFallenA && isFallenB) return 10;
    if (!isFallenA && !isFallenB) return 20;
    return -10;
  }

  // 堕落者+魔族
  const isDemonA = (raceA === 5 || raceA === 10);
  const isDemonB = (raceB === 5 || raceB === 10);
  if ((isFallenA && isDemonB) || (isFallenB && isDemonA)) return 30;

  // 堕落者+正统
  if ((isFallenA && !isFallenB) || (!isFallenA && isFallenB)) return -20;

  // 恩怨矩阵
  const grudge = window.RACE_GRUDGES;
  let key = raceA + "_" + raceB;
  let entry = grudge ? grudge[key] : null;
  if (!entry) {
    key = raceB + "_" + raceA;
    entry = grudge ? grudge[key] : null;
  }
  if (entry) return entry.partyPenalty || 0;

  return 0;
};

// ============================================
// V8.0: 稀有度判定 - 固定为N，后续通过个人声望晋升
// ============================================
window.rollHeroRarity = function(day = 1) {
  return 'N';
};
