/**
 * HeroGenerator — extracted from Game.js
 */
Game.prototype.generateHero = function() {
        const cfg = HERO_INVASION_CONFIG;
        const femaleRatio = this.flag[500] || 90;
        const isFemale = RAND(100) < femaleRatio;
        const template = isFemale ? cfg.heroTemplates.female : cfg.heroTemplates.male;
        // V3.0 预生成种族（用于姓名和属性）
        const raceRoll = RAND(100);
        let preRace = 1;
        if (raceRoll < 35) preRace = 1;      // 人类 35%
        else if (raceRoll < 55) preRace = 2; // 精灵 20%
        else if (raceRoll < 75) preRace = 3; // 兽人 20%
        else if (raceRoll < 95) preRace = 4; // 矮人 20%
        else if (raceRoll < 98) preRace = 6; // 天使 3%
        else if (raceRoll < 99) preRace = 5; // 魔族 1%
        else preRace = 7 + RAND(4);          // 其他 1%

        // V3.0 基于种族的姓名生成
        const pools = template.namePools;
        let raceKey = "human";
        if (preRace === 2) raceKey = "elf";
        else if (preRace === 3) raceKey = "orc";
        else if (preRace === 4) raceKey = "dwarf";
        const pool = pools[raceKey] || pools["human"];
        const family = pool.family[RAND(pool.family.length)];
        const given = pool.given[RAND(pool.given.length)];
        const name = template.namePrefix + family + given;
        // === 声望影响等级 ===
        const fame = this.flag[503] || 0;
        let power = Math.floor(5 + this.day * cfg.powerScale + fame * 0.15);
        power += RAND_RANGE(-2, 3); // 等级浮动
        if (power < 5) power = 5;
        if (power > 200) power = 200; // 等级上限200
        const hero = new Character(-2);
        hero.talent[314] = preRace; // 预设种族
        hero.name = name;
        hero.callname = name;
        hero.base[0] = 1000 + power * 200 + RAND(power * 100);
        hero.maxbase[0] = hero.base[0];
        hero.hp = hero.base[0];
        hero.base[1] = 500 + power * 100;
        hero.maxbase[1] = hero.base[1];
        hero.mp = hero.base[1];
        hero.level = power;
        hero.cflag[CFLAGS.BASE_HP] = power;
        hero.cflag[CFLAGS.ATK] = 20 + power * 5;  // 攻击
        hero.cflag[CFLAGS.DEF] = 15 + power * 4;  // 防御
        hero.cflag[CFLAGS.SPD] = 10 + power * 3;  // 敏捷(速度)
        // 勇者初始金币（新平衡）
        hero.gold = Math.floor(power * power + RAND(power * 10));

        // === 勇者职业分配 ===
        if (typeof HERO_CLASS_POOL !== 'undefined') {
            const classId = HERO_CLASS_POOL[RAND(HERO_CLASS_POOL.length)];
            const cls = HERO_CLASS_DEFS[classId];
            if (cls) {
                hero.cflag[CFLAGS.HERO_CLASS] = classId; // 存储职业ID
                hero.talent[cls.talentId] = 1;
                // 应用职业属性修正
                const s = cls.baseStats;
                hero.base[0] = Math.floor(hero.base[0] * s.hp);
                hero.maxbase[0] = hero.base[0];
                hero.hp = hero.base[0];
                hero.base[1] = Math.floor(hero.base[1] * s.mp);
                hero.maxbase[1] = hero.base[1];
                hero.mp = hero.base[1];
                hero.cflag[CFLAGS.ATK] = Math.floor(hero.cflag[CFLAGS.ATK] * s.atk);
                hero.cflag[CFLAGS.DEF] = Math.floor(hero.cflag[CFLAGS.DEF] * s.def);
                hero.cflag[CFLAGS.SPD] = Math.floor(hero.cflag[CFLAGS.SPD] * s.spd);
            }
        }
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
            if (RAND(50) === 0) hero.talent[57] = 1;
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
            if (RAND(25) === 0) hero.talent[CharaTemplates.FAMILY_POOL[RAND(CharaTemplates.FAMILY_POOL.length)]] = 1;
            if (RAND(30) === 0) hero.talent[152] = 1;
            if (hero.talent[37] && RAND(4) === 0) hero.talent[290] = 1;
            else if (RAND(12) === 0) hero.talent[290] = 1;
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
        // === 稀有度判定 (N/R/SR/SSR/UR) ===
        const rarity = typeof rollHeroRarity === 'function' ? rollHeroRarity() : 'N';
        hero.cflag[CFLAGS.HERO_RARITY] = rarity;
        const rarityBonus = { N: 1.0, R: 1.1, SR: 1.2, SSR: 1.35, UR: 1.5 };
        const rb = rarityBonus[rarity] || 1.0;
        if (rb > 1.0) {
            hero.base[0] = Math.floor(hero.base[0] * rb);
            hero.maxbase[0] = hero.base[0];
            hero.hp = hero.base[0];
            hero.cflag[CFLAGS.ATK] = Math.floor(hero.cflag[CFLAGS.ATK] * rb);
            hero.cflag[CFLAGS.DEF] = Math.floor(hero.cflag[CFLAGS.DEF] * rb);
            hero.cflag[CFLAGS.SPD] = Math.floor(hero.cflag[CFLAGS.SPD] * rb);
        }
        if (rarity === 'UR') {
            hero.cstr[CSTRS.RELATION_LOG] = '【UR】传说中的勇者';
            hero.gold = Math.floor(hero.gold * 3);
        } else if (rarity === 'SSR') {
            hero.cstr[CSTRS.RELATION_LOG] = '【SSR】英雄级勇者';
        } else if (rarity === 'SR') {
            hero.cstr[CSTRS.RELATION_LOG] = '【SR】精英勇者';
        }

        // === 角色定位（前排/中排/后排）===
        const classId = hero.cflag[CFLAGS.HERO_CLASS] || 0;
        const backClasses = [202, 209];
        const frontClasses = [204, 211];
        if (backClasses.includes(classId)) {
            hero.cflag[CFLAGS.HERO_PARTY_ROLE] = 3;
        } else if (frontClasses.includes(classId)) {
            hero.cflag[CFLAGS.HERO_PARTY_ROLE] = 1;
        } else {
            hero.cflag[CFLAGS.HERO_PARTY_ROLE] = 2;
        }
        // === 勇者冒险口号 ===
        const mottoPool = HERO_MOTTO_POOLS[goalId] || HERO_MOTTO_POOLS.defeat_master;
        hero.cstr[CSTRS.NAME] = mottoPool[RAND(mottoPool.length)];

        // === 统一外观与背景生成 ===
        if (typeof CharaTemplates !== 'undefined') {
            CharaTemplates.applyRandomAppearance(hero);
            CharaTemplates.applyRandomBackstory(hero);
            CharaTemplates.generateAppearanceDesc(hero);
            // 赋予勇者一个 JOB_TABLE 职业（用于信息显示）
            if (typeof CharaTemplates.JOB_TABLE !== 'undefined') {
                const job = CharaTemplates.JOB_TABLE[RAND(CharaTemplates.JOB_TABLE.length)];
                hero.talent[job.id] = 1;
            }
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
