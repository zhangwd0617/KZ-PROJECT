/**
 * HeroGenerator — extracted from Game.js
 */
Game.prototype.generateHero = function() {
        const cfg = HERO_INVASION_CONFIG;
        const femaleRatio = this.flag[500] || 90;
        const isFemale = RAND(100) < femaleRatio;
        const template = isFemale ? cfg.heroTemplates.female : cfg.heroTemplates.male;
        // V11.0: 预生成种族（考虑势力投降状态调整概率）
        let preRace = this._rollHeroRace();


        // V3.0 基于种族的姓名生成（日式西幻动漫风格：名·姓，5%贵族有独姓，45%平民有姓，50%只有名）
        const pools = template.namePools;
        let raceKey = "human";
        if (preRace === 2) raceKey = "elf";
        else if (preRace === 3) raceKey = "orc";
        else if (preRace === 4) raceKey = "dwarf";
        const pool = pools[raceKey] || pools["human"];
        const isNoble = RAND(100) < 5;
        const hasSurname = isNoble || RAND(100) < 45;
        let family = '';
        if (isNoble) {
            const noblePool = pool.nobleFamily || pools.human.nobleFamily;
            family = noblePool[RAND(noblePool.length)];
        } else if (hasSurname) {
            family = pool.family[RAND(pool.family.length)];
        }
        const given = pool.given[RAND(pool.given.length)];
        const name = family ? (given + '·' + family) : given;
        // === V11.0: 声望 + 势力状态影响等级 ===
        const fame = this.flag[503] || 0;
        let power;
        if (this.day <= 30) {
            // 前期：Lv5-Lv15浮动，Lv10以上偏多（60%）
            if (RAND(100) < 60) {
                power = 10 + RAND(6); // 10-15
            } else {
                power = 5 + RAND(5); // 5-9
            }
        } else {
            // 后期：原有成长公式
            power = Math.floor(5 + this.day * cfg.powerScale + fame * 0.15);
            power += RAND_RANGE(-2, 3); // 等级浮动
            if (power < 5) power = 5;
        }
        if (power > 200) power = 200; // 等级上限200

        // V11.0: 应用势力投降状态和士气影响
        const factionKey = RACE_TO_FACTION[preRace];
        if (factionKey && this.factionStates) {
            const surrenderLevel = this.getFactionSurrenderLevel(factionKey);
            const factionMorale = this.getFactionMorale(factionKey);
            const moraleFactor = 0.85 + (factionMorale / 200) * 0.3; // [0.85, 1.15]

            if (surrenderLevel >= 1) {
                power = Math.floor(power * 0.9); // 城镇沦陷：-10%
            }
            if (surrenderLevel >= 3) {
                power = Math.floor(power * 0.8); // 主城沦陷（累计）：-20%
                // 特殊背景文字
                const backstories = [
                    '故国沦陷的复仇者',
                    '失去家园的流亡骑士',
                    '最后的守护者',
                    '誓死复仇的遗民'
                ];
                // 背景文字在 hero 创建后设置
            }
            power = Math.floor(power * moraleFactor);
            power = Math.max(5, Math.min(200, power));
        }
        const hero = new Character(-2);
        hero.talent[314] = preRace; // 预设种族
        if (isNoble) hero.talent[295] = 1; // 贵族特质
        hero.name = name;
        hero.callname = given;
        hero.level = power;
        hero.cflag[CFLAGS.BASE_HP] = power;
        // 勇者初始金币（新平衡）
        hero.gold = Math.floor(power * power + RAND(power * 10));

        // === V5.0 统一职业分配 ===
        const raceId = hero.talent[314] || 1;
        // V12.0: 50天后10%概率直接生成高级职业
        let classId;
        if (this.day >= 50 && RAND(100) < 10) {
            classId = this._rollAdvancedClass(raceId);
        } else {
            classId = this._rollBasicClass(raceId);
        }
        const clsDef = window.CLASS_DEFS ? window.CLASS_DEFS[classId] : null;
        if (clsDef) {
            // 存储职业ID（新系统用 CLASS_ID，旧系统保留 HERO_CLASS 兼容）
            hero.cflag[CFLAGS.CLASS_ID] = classId;
            hero.cflag[CFLAGS.HERO_CLASS] = classId;
            // 初始化技能列表
            hero.cstr[355] = JSON.stringify(clsDef.skills);
        }
        // V6.0 统一属性公式
        this._recalcBaseStats(hero);
        hero.base[0] = hero.maxbase[0];
        hero.base[1] = hero.maxbase[1];
        hero.base[2] = hero.maxbase[2]; // 初始化体力
        hero.hp = hero.maxHp;
        hero.mp = hero.maxMp;
        if (!isFemale) {
            hero.talent[122] = 1; // 男性
            hero.talent[1] = 1;   // 童贞
        }
        // 随机勇者性格
        const personalities = [10, 11, 12, 13, 14, 15, 16, 17, 18];
        hero.talent[personalities[RAND(personalities.length)]] = 1;

        // === 勇者基础素质随机分配 (参考原游戏CHARA_MAKE) ===
        if (typeof CharaTemplates !== 'undefined') {
            // personality2
            if (RAND(4) === 0) hero.talent[CharaTemplates.PERSONALITY2_POOL[RAND(CharaTemplates.PERSONALITY2_POOL.length)]] = 1;
            // 兴趣
            if (RAND(2) === 0) hero.talent[CharaTemplates.INTEREST_POOL[RAND(CharaTemplates.INTEREST_POOL.length)]] = 1;
            // 处女心
            for (const g of CharaTemplates.MAIDEN_POOL) if (RAND(3) === 0) hero.talent[g[RAND(g.length)]] = 1;
            // 体质
            for (const g of CharaTemplates.BODY_POOL) if (RAND(3) === 0) hero.talent[g[RAND(g.length)]] = 1;
            if (RAND(12) === 0) hero.talent[48] = 1;
            // 技术
            for (const g of CharaTemplates.TECH_POOL) if (RAND(4) === 0) hero.talent[g[RAND(g.length)]] = 1;
            // 57抄袭者已移除（无实际效果）
            // 忠诚
            for (const g of CharaTemplates.DEVOTION_POOL) if (RAND(4) === 0) hero.talent[g[RAND(g.length)]] = 1;
            // 诚实/性癖
            for (const g of CharaTemplates.HONESTY_POOL) if (RAND(6) === 0) hero.talent[g[RAND(g.length)]] = 1;
            // 体型
            if (RAND(6) === 0) hero.talent[CharaTemplates.PHYSIQUE_POOL[RAND(CharaTemplates.PHYSIQUE_POOL.length)]] = 1;
            for (const p of CharaTemplates.SENSE_POOLS) if (RAND(6) === 0) hero.talent[p[RAND(p.length)]] = 1;
            // 胸部 (女性/扶她)
            if (!hero.talent[122]) {
                hero.talent[CharaTemplates.BREAST_POOL[RAND(CharaTemplates.BREAST_POOL.length)]] = 1;
            }
            if (RAND(12) === 0) hero.talent[111 + RAND(3)] = 1;
            // 魅力
            if (RAND(20) === 0) hero.talent[91] = 1;
            if (RAND(20) === 0) hero.talent[92] = 1;
            if (RAND(20) === 0) hero.talent[93] = 1;
            // 特殊
            // 140-143亲族关系、290妖怪、275-279元素能力已移除（无实际效果）
            if (RAND(30) === 0) hero.talent[152] = 1;
            if (RAND(20) === 0) hero.talent[79] = 1;
            // 扶她 (极低概率)
            if (RAND(60) === 0) {
                hero.talent[121] = 1;
                hero.talent[1] = 1; // 扶她也算有阴茎，有童贞
            }
            // 元素能力 (极低概率)
            if (RAND(20) === 0) {
                const elements = [275, 276, 277, 278, 279];
                hero.talent[elements[RAND(elements.length)]] = 1;
            }
        }
        // === 勇者攻略目标 ===
        const goalIds = Object.keys(HERO_GOAL_DEFS);
        const goalId = goalIds[RAND(goalIds.length)];
        hero.cflag[CFLAGS.HERO_LEVEL] = goalId; // 存储目标ID
        // === V8.0: 稀有度固定为N ===
        hero.cflag[CFLAGS.HERO_RARITY] = 'N';

        // V10.0: 堕落种族自然生成（伪装成正常种族）
        const fallenRaceMap = { 1: 11, 2: 13, 3: 14, 4: 12, 5: 11, 6: 15, 7: 14, 8: 13, 9: 15, 10: 11 };
        const fallenChanceMap = { 1: 3, 2: 2, 3: 2, 4: 2, 5: 1, 6: 1, 7: 1, 8: 2, 9: 1, 10: 1 };
        const fChance = fallenChanceMap[preRace] || 1;
        if (RAND(100) < fChance) {
            hero.cflag[CFLAGS.FALLEN_RACE_ID] = fallenRaceMap[preRace] || 11;
        }

        // V8.0: 给新勇者初始装备
        if (!hero.gear) hero.gear = { head: null, body: null, legs: null, hands: null, neck: null, ring: null, weapons: [], items: [] };
        // 1件普通防具
        const slotTypes = ['head', 'body', 'legs', 'hands', 'neck'];
        const startSlot = slotTypes[RAND(slotTypes.length)];
        const startGear = GearSystem.generateGear(startSlot, hero.level, 1);
        GearSystem.equipItem(hero, startGear);
        // 1件普通武器
        const startWeapon = GearSystem.generateGear('weapon', hero.level, 1);
        GearSystem.equipItem(hero, startWeapon);
        // 1个治疗药水
        const startPotion = GearSystem.generateItem('heal', hero.level, 1);
        GearSystem.equipItem(hero, startPotion);

        // === 角色定位（前排/中排/后排）===
        const roleMap = { front_dps: 1, tank: 1, front_burst: 1, holy_tank: 1, mounted_pierce: 1, combo_burst: 1,
                          brawler: 1, pierce: 1,
                          magic_dps: 3, healer: 3, healer_buff: 3, healer_dot: 3, bard: 3, battle_command: 3,
                          extreme_heal: 3, holy_seal: 3, healer_core: 3, magic_aoe: 3, battle_control: 3,
                          battle_charm: 3,
                          assassin: 2, ninja: 2, dot_aoe: 2, ranged: 2, dodge_assassin: 2, mobile_ranged: 2,
                          master_ninja: 2, soul_reaper: 2, dancer: 2 };
        const curClsDef = window.CLASS_DEFS ? window.CLASS_DEFS[hero.cflag[CFLAGS.CLASS_ID]] : null;
        const role = curClsDef ? curClsDef.role : '';
        hero.cflag[CFLAGS.HERO_PARTY_ROLE] = roleMap[role] || 2;
        // === 勇者冒险口号（已取消）===
        // const mottoPool = HERO_MOTTO_POOLS[goalId] || HERO_MOTTO_POOLS.defeat_master;
        // hero.cstr[CSTRS.NAME] = mottoPool[RAND(mottoPool.length)];

        // === 统一外观与背景生成 ===
        if (typeof CharaTemplates !== 'undefined') {
            CharaTemplates.applyRandomAppearance(hero);
            CharaTemplates.applyRandomBackstory(hero);
            CharaTemplates.generateAppearanceDesc(hero);
            // V5.0: 职业已通过 CLASS_DEFS 统一分配，无需额外的 JOB_TABLE 职业标记
        }

        // === 生成初始任务 ===
        this.generateHeroTask(hero);

        // === 生成相性值 ===
        hero.affinity = this.generateAffinity(hero);

        // P1+: init personality & genital config
        if (typeof generatePersonality === 'function') {
            hero.personality = generatePersonality(hero);
        }
        const isMale = hero.talent[122];
        const isFuta = hero.talent[121];
        hero.genitalConfig = {
            hasVagina: !isMale || isFuta,
            hasWomb: (!isMale || isFuta) && !hero.talent[123],
            penises: isMale || isFuta ? [{ id: 0, name: "\u8089\u68d2", ejaculationGauge: 0, sensitivity: 1.0, linkedParts: ["V", "A", "O"] }] : [],
            orgasmSystem: "standard"
        };

        if (!hero.gear) hero.gear = { head: null, body: null, legs: null, hands: null, neck: null, ring: null, weapons: [], items: [] };

        // V7.0: generate sexual history for heroes too
        if (typeof Game !== 'undefined' && Game.initSexualRecords) Game.initSexualRecords(hero);

        // V11.0: 设置个人声望（受势力士气影响）
        const factionKey2 = RACE_TO_FACTION[preRace];
        if (factionKey2 && this.factionStates && this.factionStates[factionKey2]) {
            const factionMorale2 = this.getFactionMorale(factionKey2);
            const moraleFactor2 = 0.85 + (factionMorale2 / 200) * 0.3;
            hero.fame = Math.floor(hero.level * moraleFactor2 * (0.8 + Math.random() * 0.4));
        } else {
            hero.fame = hero.level;
        }

        // V11.0: 势力投降后的特殊背景
        if (factionKey2 && this.factionStates) {
            const surrenderLevel = this.getFactionSurrenderLevel(factionKey2);
            if (surrenderLevel >= 3) {
                const backstories = [
                    '故国沦陷的复仇者',
                    '失去家园的流亡骑士',
                    '最后的守护者',
                    '誓死复仇的遗民'
                ];
                const extraBackstory = backstories[RAND(backstories.length)];
                const currentBackstory = hero.cstr[CSTRS.HERO_BACKSTORY] || '';
                hero.cstr[CSTRS.HERO_BACKSTORY] = currentBackstory + (currentBackstory ? '\n' : '') + '【' + extraBackstory + '】';
            }
        }

        // V12.0: 勇者态度分类（80%讨伐型 / 15%中立型 / 5%倾向魔王）
        const attitudeRoll = Math.random();
        if (attitudeRoll < 0.8) {
            hero.cflag[CFLAGS.HERO_ATTITUDE] = 1; // holy 讨伐型
            hero.cstr[CSTRS.ATTITUDE] = '讨伐型';
        } else if (attitudeRoll < 0.95) {
            hero.cflag[CFLAGS.HERO_ATTITUDE] = 2; // neutral 中立型
            hero.cstr[CSTRS.ATTITUDE] = '中立型';
            // 中立型初始金币+50%（用于城镇消费）
            hero.gold = Math.floor(hero.gold * 1.5);
        } else {
            hero.cflag[CFLAGS.HERO_ATTITUDE] = 3; // pro_demon 倾向魔王
            hero.cstr[CSTRS.ATTITUDE] = '倾向魔王';
            hero.cflag[CFLAGS.IS_LONE_WOLF] = 1;  // 独行侠
        }

        return hero;
    }

    // ========== 勋章系统 ==========

Game.prototype.getMedalCount = function(character) {
        return character ? (character.cflag[CFLAGS.MEDAL_COUNT] || 0) : 0;
    }

Game.prototype.getMedalBonus = function(character) {
        const count = this.getMedalCount(character);
        return 1 + count * 0.01; // 每枚勋章+1%
    }

Game.prototype.addMedal = function(character, amount = 1) {
        if (!character || amount <= 0) return;
        const oldCount = this.getMedalCount(character);
        const newCount = oldCount + amount;
        character.cflag[CFLAGS.MEDAL_COUNT] = newCount;
        // 勋章经验 = 数量 × 5
        character.cflag[CFLAGS.MEDAL_EXP] = newCount * 5;
    }

Game.prototype.addBrainwashExp = function(character, amount = 1) {
        if (!character || amount <= 0) return;
        character.exp[81] = (character.exp[81] || 0) + amount;
    }

    // ========== 奴隶任务系统 ==========

Game.prototype.generateAffinity = function(entity) {
        const race = entity.talent[314] || 1;
        const jobClass = entity.cflag[CFLAGS.HERO_CLASS] || 200;
        const personality = entity.getPersonality() || 10;

        const raceVal = (typeof RACE_AFFINITY !== 'undefined' ? RACE_AFFINITY[race] : null) || 50;
        const jobVal = (typeof JOB_AFFINITY !== 'undefined' ? JOB_AFFINITY[jobClass] : null) || 50;
        const persVal = (typeof PERSONALITY_AFFINITY !== 'undefined' ? PERSONALITY_AFFINITY[personality] : null) || 50;

        // 加权平均 + 随机偏移(-5~+5)，让相同配置也有细微差异
        let value = Math.floor(raceVal * 0.35 + jobVal * 0.35 + persVal * 0.3 + RAND_RANGE(-5, 6));
        return Math.min(100, Math.max(0, value));
    }

    // 生成随机小队名


// ========== V5.0 种族特长与职业系统辅助函数 ==========

/**
 * 根据种族偏好随机抽取基础职业
 */
Game.prototype._rollBasicClass = function(raceId) {
    const defs = window.CLASS_DEFS || {};
    let basicIds = Object.keys(defs).filter(id => defs[id].tier === 'basic' && !defs[id].playerOnly).map(Number);
    if (basicIds.length === 0) return 200;

    // 应用种族职业限制
    const restrictions = window.RACE_CLASS_RESTRICTIONS ? (window.RACE_CLASS_RESTRICTIONS[raceId] || []) : [];
    basicIds = basicIds.filter(id => !restrictions.includes(id));
    if (basicIds.length === 0) return 200; // 兜底

    const pref = window.RACE_CLASS_PREFERENCE ? (window.RACE_CLASS_PREFERENCE[raceId] || {}) : {};
    const favored = pref.favored || [];
    const disfavored = pref.disfavored || [];

    // 构建权重池
    const weights = basicIds.map(id => {
        if (favored.includes(id)) return 2.0;
        if (disfavored.includes(id)) return 0.5;
        return 1.0;
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * totalWeight;
    for (let i = 0; i < basicIds.length; i++) {
        roll -= weights[i];
        if (roll <= 0) return basicIds[i];
    }
    return basicIds[0];
};

/**
 * V12.0: 根据种族偏好随机抽取高级职业（50天后小概率触发）
 */
Game.prototype._rollAdvancedClass = function(raceId) {
    const defs = window.CLASS_DEFS || {};
    let advIds = Object.keys(defs).filter(id => defs[id].tier === 'advanced' && !defs[id].playerOnly).map(Number);
    if (advIds.length === 0) return 300;

    // 应用种族职业限制（限制通常只针对基础职业，但高级职业也做过滤）
    const restrictions = window.RACE_CLASS_RESTRICTIONS ? (window.RACE_CLASS_RESTRICTIONS[raceId] || []) : [];
    advIds = advIds.filter(id => !restrictions.includes(id));
    if (advIds.length === 0) return 300; // 兜底

    const pref = window.RACE_CLASS_PREFERENCE ? (window.RACE_CLASS_PREFERENCE[raceId] || {}) : {};
    const favored = pref.favored || [];
    const disfavored = pref.disfavored || [];

    // 构建权重池（基于对应的基础职业偏好）
    const weights = advIds.map(id => {
        const baseId = defs[id].baseClassId;
        if (baseId && favored.includes(baseId)) return 2.0;
        if (baseId && disfavored.includes(baseId)) return 0.5;
        return 1.0;
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * totalWeight;
    for (let i = 0; i < advIds.length; i++) {
        roll -= weights[i];
        if (roll <= 0) return advIds[i];
    }
    return advIds[0];
};

/**
 * 应用种族属性修正
 */
Game.prototype._applyRaceStats = function(entity, raceId) {
    const traits = window.RACE_TRAITS ? window.RACE_TRAITS[raceId] : null;
    if (!traits || !traits.stats) {
        entity.cflag[CFLAGS.RACE_PASSIVE] = raceId;
        return;
    }
    // V6.0: use unified formula instead of manual multipliers
    this._recalcBaseStats(entity);
    entity.base[0] = entity.maxbase[0];
    entity.base[1] = entity.maxbase[1];
    entity.hp = entity.maxHp;
    entity.mp = entity.maxMp;
    // 记录种族被动
    entity.cflag[CFLAGS.RACE_PASSIVE] = raceId;
};

/**
 * 应用种族×职业额外加成
 */
Game.prototype._applyRaceClassBonus = function(entity, raceId, classId) {
    const pref = window.RACE_CLASS_PREFERENCE ? (window.RACE_CLASS_PREFERENCE[raceId] || {}) : {};
    const bonus = pref.bonus ? (pref.bonus[String(classId)] || {}) : {};
    if (!bonus.hp && !bonus.mp && !bonus.atk && !bonus.def && !bonus.spd) return;
    // V6.0: ensure unified base before applying bonus
    this._recalcBaseStats(entity);
    if (bonus.hp) { entity.maxbase[0] = Math.floor(entity.maxbase[0] * bonus.hp); entity.base[0] = entity.maxbase[0]; }
    if (bonus.mp) { entity.maxbase[1] = Math.floor(entity.maxbase[1] * bonus.mp); entity.base[1] = entity.maxbase[1]; }
    if (bonus.atk) entity.cflag[CFLAGS.ATK] = Math.floor(entity.cflag[CFLAGS.ATK] * bonus.atk);
    if (bonus.def) entity.cflag[CFLAGS.DEF] = Math.floor(entity.cflag[CFLAGS.DEF] * bonus.def);
    if (bonus.spd) entity.cflag[CFLAGS.SPD] = Math.floor(entity.cflag[CFLAGS.SPD] * bonus.spd);
    entity.hp = entity.maxHp;
    entity.mp = entity.maxMp;
};


// ============================================
// V8.0: 勇者稀有度固定为N（后续通过个人声望晋升）
// ============================================
Game.prototype._rollHeroRarityByDay = function() {
    return 'N';
};

// ============================================
// V8.0: 应用稀有度属性加成
// 注：_recalcBaseStats 已内置稀有度加成，此处仅确保属性同步
// ============================================
Game.prototype._applyRarityBonus = function(entity) {
    const rarity = entity.cflag ? (entity.cflag[CFLAGS.HERO_RARITY] || 'N') : 'N';
    const rarityBonus = { N: 1.0, R: 1.1, SR: 1.2, SSR: 1.35, UR: 1.5 };
    const rb = rarityBonus[rarity] || 1.0;
    if (rb > 1.0) {
        // _recalcBaseStats 已自动应用稀有度加成，只需同步HP/MP
        entity.hp = entity.maxHp;
        entity.mp = entity.maxMp;
    }
};

// ============================================
// V11.0: 考虑势力投降状态的种族Roll
// ============================================
Game.prototype._rollHeroRace = function() {
    // 基础权重
    const weights = { 1: 35, 2: 20, 3: 20, 4: 20, 6: 3, 5: 1 };
    const otherWeight = 1; // 其他种族

    // 应用投降惩罚
    for (const [raceId, factionId] of Object.entries(RACE_TO_FACTION)) {
        const id = parseInt(raceId);
        if (!weights[id]) continue;
        const surrenderLevel = this.getFactionSurrenderLevel(factionId);
        if (surrenderLevel >= 2) {
            weights[id] = Math.max(5, Math.floor(weights[id] * 0.5));
        }
        if (surrenderLevel >= 3) {
            weights[id] = Math.max(5, Math.floor(weights[id] * 0.5));
        }
    }

    // 计算总权重
    let total = otherWeight;
    for (const w of Object.values(weights)) total += w;

    const roll = RAND(total);
    let cumulative = 0;

    // 人类
    cumulative += weights[1];
    if (roll < cumulative) return 1;
    // 精灵
    cumulative += weights[2];
    if (roll < cumulative) return 2;
    // 兽人
    cumulative += weights[3];
    if (roll < cumulative) return 3;
    // 矮人
    cumulative += weights[4];
    if (roll < cumulative) return 4;
    // 天使
    cumulative += weights[6];
    if (roll < cumulative) return 6;
    // 魔族
    cumulative += weights[5];
    if (roll < cumulative) return 5;
    // 其他
    return 7 + RAND(4);
};
