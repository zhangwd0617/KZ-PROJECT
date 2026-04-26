/**
 * FactionSystem — 势力声望与反向侵略城镇系统
 * 管理势力状态、声望计算、人口动态、城市防御、投降判定
 */

// ============================================
// 势力基础数据配置
// ============================================

const FACTION_CONFIG = {
    // 势力ID与种族映射
    FACTION_RACES: {
        human: { raceId: 1, basePop: 5800, baseReputation: 10000 },
        dwarf: { raceId: 4, basePop: 2000, baseReputation: 10000 },
        elf:   { raceId: 2, basePop: 1300, baseReputation: 10000 },
        orc:   { raceId: 3, basePop: 3200, baseReputation: 10000 },
        church:{ raceId: 0, basePop: 230,  baseReputation: 8000 }
    },
    // 城市类型基准等级
    CITY_BASE_LEVEL: {
        town: 50,
        major: 100,
        capital: 150,
        church: 100
    },
    // 人口自然增长率范围（每日）
    POP_GROWTH_MIN: 0.005,
    POP_GROWTH_MAX: 0.015,
    // 士气波动范围
    MORALE_FLUCTUATION: [-3, 4],
    // 城市防御耐久度恢复（每10天）
    DEFENSE_HEAL_PER_10_DAYS: 10,
    // 攻击胜利时防御耐久度减少
    DEFENSE_DAMAGE_MIN: 25,
    DEFENSE_DAMAGE_MAX: 40,
    // 声望转移系数（攻击胜利时）
    REPUTATION_TRANSFER_RATE: 0.15,
    // 城市陷落时魔王军声望增益系数
    CITY_FALL_FAME_RATE: 0.10,
    FACTION_FALL_FAME_RATE: 0.20,
    // 攻击城镇冷却天数（失败时）
    RAID_COOLDOWN_DAYS: 10,
    // 最低勇者生成概率（%）
    MIN_RACE_SPAWN_RATE: 5,
    // 四大天王
    KINGS: ['raphael', 'thor', 'olivia', 'caesar'],
    KING_RACE_MAP: { raphael: 'human', thor: 'dwarf', olivia: 'elf', caesar: 'orc' },
    KING_BASE_NAMES: { raphael: '纯白要塞', thor: '钢铁圣殿', olivia: '翡翠高塔', caesar: '战争神殿' }
};

// 种族到势力ID的反向映射
const RACE_TO_FACTION = { 1: 'human', 2: 'elf', 3: 'orc', 4: 'dwarf' };
const FACTION_TO_RACE = { human: 1, elf: 2, orc: 3, dwarf: 4 };

// ============================================
// 人口解析辅助函数
// ============================================

function parsePopString(popStr) {
    if (!popStr) return 0;
    const match = popStr.match(/([\d,.]+)/);
    if (!match) return 0;
    const num = parseFloat(match[1].replace(/,/g, ''));
    if (popStr.includes('万')) return num;
    if (popStr.includes('千')) return num * 0.1;
    return num;
}

function getWorldTotalPop() {
    let total = 0;
    if (window.WORLD_MAP_DATA && window.WORLD_MAP_DATA.cities) {
        for (const city of WORLD_MAP_DATA.cities) {
            total += parsePopString(city.pop);
        }
    }
    return total;
}

function getFactionCities(factionId) {
    if (!window.WORLD_MAP_DATA || !window.WORLD_MAP_DATA.cities) return [];
    return WORLD_MAP_DATA.cities.filter(c => c.race === factionId);
}

function getFactionTotalPop(factionId) {
    const cities = getFactionCities(factionId);
    return cities.reduce((sum, c) => sum + parsePopString(c.pop), 0);
}

function getCityByName(name) {
    if (!window.WORLD_MAP_DATA || !window.WORLD_MAP_DATA.cities) return null;
    return WORLD_MAP_DATA.cities.find(c => c.name === name) || null;
}

// ============================================
// Game 原型扩展：势力系统核心API
// ============================================

/**
 * 初始化势力状态（新档或旧档迁移）
 */
Game.prototype._initFactionStates = function() {
    this.factionStates = {};
    const cfg = FACTION_CONFIG.FACTION_RACES;
    for (const [factionId, data] of Object.entries(cfg)) {
        const cities = getFactionCities(factionId);
        const cityStates = {};
        for (const city of cities) {
            cityStates[city.name] = { defense: 100, status: 'intact' };
        }
        this.factionStates[factionId] = {
            baseReputation: data.baseReputation,
            morale: 100,
            popMultiplier: 1.0,
            cityStates: cityStates,
            debuffs: []
        };
    }
};

/**
 * 初始化四大天王自治领状态
 */
Game.prototype._initKingTerritoryStates = function() {
    this.kingTerritoryStates = {
        raphael: { progress: 0, defeated: false },
        thor:    { progress: 0, defeated: false },
        olivia:  { progress: 0, defeated: false },
        caesar:  { progress: 0, defeated: false }
    };
};

/**
 * 获取势力当前声望（动态计算）
 */
Game.prototype.getFactionReputation = function(factionId) {
    const state = this.factionStates && this.factionStates[factionId];
    if (!state) return 0;
    return Math.floor(state.baseReputation * state.popMultiplier * (state.morale / 100));
};

/**
 * 获取势力士气
 */
Game.prototype.getFactionMorale = function(factionId) {
    const state = this.factionStates && this.factionStates[factionId];
    return state ? state.morale : 100;
};

/**
 * 获取城市防御强度（绝对数值）
 */
Game.prototype.getCityDefenseStrength = function(cityName) {
    const city = getCityByName(cityName);
    if (!city) return 0;
    const factionId = city.race;
    const factionRep = this.getFactionReputation(factionId);
    const factionPop = getFactionTotalPop(factionId);
    const cityPop = parsePopString(city.pop);
    if (factionPop <= 0) return 0;
    return Math.floor(factionRep * (cityPop / factionPop));
};

/**
 * 获取城市防御耐久度（百分比）
 */
Game.prototype.getCityDefenseDurability = function(cityName) {
    const city = getCityByName(cityName);
    if (!city) return 0;
    const factionId = city.race;
    const state = this.factionStates && this.factionStates[factionId];
    if (!state || !state.cityStates[cityName]) return 0;
    return state.cityStates[cityName].defense;
};

/**
 * 攻击胜利：减少城市防御耐久度 + 声望转移
 */
Game.prototype._damageCityDefense = function(cityName, damagePct) {
    const city = getCityByName(cityName);
    if (!city) return { fameTransferred: 0, cityFallen: false };
    const factionId = city.race;
    const state = this.factionStates && this.factionStates[factionId];
    if (!state || !state.cityStates[cityName]) return { fameTransferred: 0, cityFallen: false };

    const cityState = state.cityStates[cityName];
    const oldDefense = cityState.defense;
    cityState.defense = Math.max(0, cityState.defense - damagePct);

    // 声望转移
    const defenseStrength = this.getCityDefenseStrength(cityName);
    const reputationDamage = Math.floor(defenseStrength * FACTION_CONFIG.REPUTATION_TRANSFER_RATE);
    state.baseReputation = Math.max(0, state.baseReputation - reputationDamage);
    this.addFame(reputationDamage);

    // 城市陷落判定
    let cityFallen = false;
    if (cityState.defense <= 0 && oldDefense > 0) {
        cityState.status = 'ruined';
        cityFallen = true;
        // 人口从原势力扣除
        const cityPop = parsePopString(city.pop);
        const factionPop = getFactionTotalPop(factionId);
        if (factionPop > 0) {
            const popLoss = cityPop / factionPop;
            state.popMultiplier = Math.max(0.1, state.popMultiplier - popLoss);
        }
        // 魔王军声望额外增加
        const worldPop = getWorldTotalPop();
        if (worldPop > 0) {
            const devilMorale = (this.devilMorale || 100) / 100;
            const fameGain = Math.floor((cityPop / worldPop) * 10000 * devilMorale * FACTION_CONFIG.CITY_FALL_FAME_RATE);
            this.addFame(fameGain);
        }
    }

    return { fameTransferred: reputationDamage, cityFallen: cityFallen };
};

/**
 * 恢复城市防御耐久度（每10天调用）
 */
Game.prototype._healCityDefense = function(cityName, amount) {
    const city = getCityByName(cityName);
    if (!city) return;
    const factionId = city.race;
    const state = this.factionStates && this.factionStates[factionId];
    if (!state || !state.cityStates[cityName]) return;
    const cityState = state.cityStates[cityName];
    if (cityState.status === 'ruined') return; // 已陷落不恢复
    cityState.defense = Math.min(100, cityState.defense + amount);
};

/**
 * 获取势力投降等级
 * 0=正常, 1=所有城镇沦陷, 2=所有副城沦陷, 3=投降(主城沦陷)
 */
Game.prototype.getFactionSurrenderLevel = function(factionId) {
    const cities = getFactionCities(factionId);
    const state = this.factionStates && this.factionStates[factionId];
    if (!state) return 0;

    const towns = cities.filter(c => c.type === 'town');
    const majors = cities.filter(c => c.type === 'major');
    const capitals = cities.filter(c => c.type === 'capital');

    const ruinedTowns = towns.filter(c => {
        const cs = state.cityStates[c.name];
        return cs && cs.defense <= 0;
    });
    const ruinedMajors = majors.filter(c => {
        const cs = state.cityStates[c.name];
        return cs && cs.defense <= 0;
    });
    const ruinedCapitals = capitals.filter(c => {
        const cs = state.cityStates[c.name];
        return cs && cs.defense <= 0;
    });

    if (ruinedCapitals.length >= capitals.length && capitals.length > 0) return 3;
    if (ruinedMajors.length >= majors.length && majors.length > 0) return 2;
    if (ruinedTowns.length >= towns.length && towns.length > 0) return 1;
    return 0;
};

/**
 * 每日人口与士气更新
 */
Game.prototype._updateFactionDaily = function() {
    for (const [factionId, state] of Object.entries(this.factionStates || {})) {
        // 人口自然增长
        const growthRate = FACTION_CONFIG.POP_GROWTH_MIN + (RAND(100) / 10000);
        state.popMultiplier += state.popMultiplier * growthRate;

        // 士气波动
        const moraleChange = FACTION_CONFIG.MORALE_FLUCTUATION[0] + RAND(
            FACTION_CONFIG.MORALE_FLUCTUATION[1] - FACTION_CONFIG.MORALE_FLUCTUATION[0] + 1
        );
        state.morale = Math.max(50, Math.min(200, state.morale + moraleChange));

        // debuff 递减
        if (state.debuffs) {
            for (const debuff of state.debuffs) {
                debuff.daysLeft--;
            }
            state.debuffs = state.debuffs.filter(d => d.daysLeft > 0);
        }
    }
};

/**
 * 每10天恢复所有城市防御耐久度
 */
Game.prototype._healAllCityDefenses = function() {
    for (const [factionId, state] of Object.entries(this.factionStates || {})) {
        for (const [cityName, cityState] of Object.entries(state.cityStates || {})) {
            if (cityState.status !== 'ruined') {
                this._healCityDefense(cityName, FACTION_CONFIG.DEFENSE_HEAL_PER_10_DAYS);
            }
        }
    }
};

/**
 * 给势力添加 debuff
 */
Game.prototype._addFactionDebuff = function(factionId, type, value, days) {
    const state = this.factionStates && this.factionStates[factionId];
    if (!state) return;
    if (!state.debuffs) state.debuffs = [];
    state.debuffs.push({ type, value, daysLeft: days });
};

/**
 * 获取可攻击的目标列表（城市 + 天王自治领 + 教廷）
 */
Game.prototype.getRaidableTargets = function() {
    const targets = [];

    // 1. 地面势力城市（按攻城优先级）
    const factionOrder = ['human', 'dwarf', 'elf', 'orc'];
    for (const factionId of factionOrder) {
        const surrenderLevel = this.getFactionSurrenderLevel(factionId);
        if (surrenderLevel >= 3) continue; // 已投降

        const cities = getFactionCities(factionId);
        const towns = cities.filter(c => c.type === 'town' && this.getCityDefenseDurability(c.name) > 0);
        const majors = cities.filter(c => c.type === 'major' && this.getCityDefenseDurability(c.name) > 0);
        const capitals = cities.filter(c => c.type === 'capital' && this.getCityDefenseDurability(c.name) > 0);

        if (towns.length > 0) {
            targets.push(...towns.map(c => ({ ...c, targetType: 'city', factionId })));
        } else if (majors.length > 0) {
            targets.push(...majors.map(c => ({ ...c, targetType: 'city', factionId })));
        } else if (capitals.length > 0) {
            targets.push(...capitals.map(c => ({ ...c, targetType: 'city', factionId })));
        }
    }

    // 2. 四大天王自治领（该种族主城攻破后解锁）
    const kingRaceMap = FACTION_CONFIG.KING_RACE_MAP;
    for (const [kingId, raceFaction] of Object.entries(kingRaceMap)) {
        const kt = this.kingTerritoryStates && this.kingTerritoryStates[kingId];
        if (!kt || kt.defeated) continue;
        // 检查对应种族的主城是否已攻破
        const raceCities = getFactionCities(raceFaction);
        const capitals = raceCities.filter(c => c.type === 'capital');
        const capitalRuined = capitals.every(c => {
            const fs = this.factionStates && this.factionStates[raceFaction];
            return fs && fs.cityStates[c.name] && fs.cityStates[c.name].defense <= 0;
        });
        if (capitalRuined) {
            const kingDef = window.HEAVENLY_KINGS && window.HEAVENLY_KINGS[kingId];
            const kingName = kingDef ? kingDef.base : FACTION_CONFIG.KING_BASE_NAMES[kingId];
            targets.push({
                name: kingName,
                type: 'king_territory',
                targetType: 'king_territory',
                kingId: kingId,
                x: 0, y: 0,
                pop: '0',
                feature: kingDef ? `${kingDef.title}·${kingDef.divineName}的自治领` : ''
            });
        }
    }

    // 3. 教廷（任意时间可攻击）
    if (this.churchState && !this.churchState.defeated) {
        targets.push({
            name: '教廷圣地',
            type: 'church',
            targetType: 'church',
            x: 0, y: 0,
            pop: '0',
            feature: '教廷直属地·防御值固定5000'
        });
    }

    return targets;
};

/**
 * 获取天王自治领当前阶段配置
 */
Game.prototype.getKingTerritoryStage = function(kingId) {
    const kt = this.kingTerritoryStates && this.kingTerritoryStates[kingId];
    if (!kt || kt.defeated) return null;
    const progress = kt.progress || 0;
    const stages = [
        { stage: 1, level: 150, rarity: 'SR',   equipment: 'epic' },
        { stage: 2, level: 180, rarity: 'SSR',  equipment: 'epic' },
        { stage: 3, level: 200, rarity: 'UR',   equipment: 'legendary', isKing: true }
    ];
    return stages[progress] || null;
};

/**
 * 四大天王击败后的连锁效果
 */
Game.prototype._applyKingDefeatEffects = function(kingId) {
    const kt = this.kingTerritoryStates && this.kingTerritoryStates[kingId];
    if (!kt) return;
    kt.defeated = true;

    // 魔王军基础士气+10
    this.devilBaseMorale = (this.devilBaseMorale || 0) + 10;

    // 计算已击败天王数量
    const defeatedCount = Object.values(this.kingTerritoryStates || {})
        .filter(k => k.defeated).length;

    // 对剩余天王的加成
    for (const [otherKingId, otherKt] of Object.entries(this.kingTerritoryStates || {})) {
        if (otherKingId !== kingId && !otherKt.defeated) {
            // 其他天王全属性+5%（每有一个被击败）
            otherKt.attrBonus = (otherKt.attrBonus || 1.0) + 0.05;
        }
    }

    // 对地面势力的惩罚：声望值上限-10%
    for (const [factionId, state] of Object.entries(this.factionStates || {})) {
        if (this.getFactionSurrenderLevel(factionId) < 3) {
            state.baseReputation = Math.floor(state.baseReputation * 0.9);
        }
    }
};

/**
 * 获取应用了debuff后的实际人口系数
 */
Game.prototype._getEffectivePopMultiplier = function(factionId) {
    const state = this.factionStates && this.factionStates[factionId];
    if (!state) return 1.0;
    let mult = state.popMultiplier;
    if (state.debuffs) {
        for (const d of state.debuffs) {
            if (d.type === 'pop_growth_negative') mult *= (1 - d.value);
            if (d.type === 'pop_growth_positive') mult *= (1 + d.value);
        }
    }
    return mult;
};

/**
 * 获取应用了debuff后的实际士气
 */
Game.prototype._getEffectiveMorale = function(factionId) {
    const state = this.factionStates && this.factionStates[factionId];
    if (!state) return 100;
    let morale = state.morale;
    if (state.debuffs) {
        for (const d of state.debuffs) {
            if (d.type === 'morale_negative') morale -= d.value;
            if (d.type === 'morale_positive') morale += d.value;
        }
    }
    return Math.max(50, Math.min(200, morale));
};

// ============================================
// 世界地图辅助函数
// ============================================

window.FACTION_CONFIG = FACTION_CONFIG;
window.parsePopString = parsePopString;
window.getWorldTotalPop = getWorldTotalPop;
window.getFactionCities = getFactionCities;
window.getFactionTotalPop = getFactionTotalPop;
window.getCityByName = getCityByName;
window.RACE_TO_FACTION = RACE_TO_FACTION;
window.FACTION_TO_RACE = FACTION_TO_RACE;
