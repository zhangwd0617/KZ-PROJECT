/**
 * GearSystem - 装备/武器/道具系统（含诅咒）
 */
class GearSystem {
    static RARITY_NAMES = ["", "普通", "精品", "大师", "传说", "神话"];
    static RARITY_COLORS = ["#888888", "#ffffff", "#44ff44", "#6688ff", "#cc66ff", "#ff8800"];
    static RARITY_MIN = [0, 0.01, 0.05, 0.08, 0.10, 0.20];
    static RARITY_MAX = [0, 0.05, 0.08, 0.10, 0.15, 0.20];
    static CURSE_CHANCE = 0.20;

    // V6.0: 装备品质百分比加成（基于角色基础属性）
    static GEAR_QUALITY_PCT = {
        0: { name: "", atkPct: 0.00, defPct: 0.00, hpPct: 0.00, mpPct: 0.00 },
        1: { name: "普通", atkPct: 0.05, defPct: 0.05, hpPct: 0.05, mpPct: 0.05 },
        2: { name: "精良", atkPct: 0.15, defPct: 0.15, hpPct: 0.15, mpPct: 0.15 },
        3: { name: "稀有", atkPct: 0.30, defPct: 0.30, hpPct: 0.30, mpPct: 0.30 },
        4: { name: "史诗", atkPct: 0.50, defPct: 0.50, hpPct: 0.50, mpPct: 0.50 },
        5: { name: "神话", atkPct: 0.80, defPct: 0.80, hpPct: 0.80, mpPct: 0.80 }
    };

    static SLOT_NAMES = {
        head: "头盔", body: "衣服", legs: "裤子", hands: "手套",
        neck: "项链", ring: "戒指", weapon: "武器"
    };

    static GEAR_NAMES = {
        head: {
            1: ["皮帽", "布兜帽", "木盔"],
            2: ["钢盔", "魔纹帽", "精灵头环"],
            3: ["秘银头盔", "龙鳞盔", "暗影面甲"],
            4: ["泰坦之颅", "凤凰羽冠", "深渊凝视"],
            5: ["诸神黄昏", "创世之光", "永恒王冠"]
        },
        body: {
            1: ["皮甲", "布袍", "链甲"],
            2: ["钢甲", "魔纹袍", "精灵轻甲"],
            3: ["秘银铠甲", "龙鳞甲", "暗影斗篷"],
            4: ["泰坦之躯", "凤凰羽衣", "深渊吞噬"],
            5: ["诸神黄昏", "创世之铠", "永恒圣衣"]
        },
        legs: {
            1: ["皮裤", "布裙", "链甲裙"],
            2: ["钢腿甲", "魔纹裤", "精灵轻裤"],
            3: ["秘银腿甲", "龙鳞裤", "暗影绑腿"],
            4: ["泰坦之胫", "凤凰羽裤", "深渊缠绕"],
            5: ["诸神黄昏", "创世之裤", "永恒护腿"]
        },
        hands: {
            1: ["皮手套", "布护手", "链甲手套"],
            2: ["钢护手", "魔纹手套", "精灵轻手套"],
            3: ["秘银护手", "龙鳞手套", "暗影指套"],
            4: ["泰坦之拳", "凤凰羽爪", "深渊触须"],
            5: ["诸神黄昏", "创世之手", "永恒护爪"]
        },
        neck: {
            1: ["皮绳", "铜项链", "木珠"],
            2: ["银链", "魔纹坠", "精灵泪"],
            3: ["秘银项链", "龙牙坠", "暗影符文"],
            4: ["泰坦之喉", "凤凰心血", "深渊呼唤"],
            5: ["诸神黄昏", "创世之链", "永恒羁绊"]
        },
        ring: {
            1: ["铜戒", "铁环", "木戒"],
            2: ["银戒", "魔纹戒", "精灵誓约"],
            3: ["秘银戒指", "龙眼戒", "暗影契约"],
            4: ["泰坦之环", "凤凰尾羽", "深渊指环"],
            5: ["诸神黄昏", "创世之戒", "永恒誓约"]
        },
        weapon: {
            1: ["铁剑", "短刀", "木杖", "匕首", "单手剑"],
            2: ["钢剑", "魔纹刀", "精灵弓", "战斧", "长枪"],
            3: ["秘银剑", "龙牙刃", "暗影弓", "雷霆锤", "冰霜矛"],
            4: ["泰坦之剑", "凤凰羽刃", "深渊之弓", "灭世锤", "龙王枪"],
            5: ["诸神黄昏", "创世之刃", "永恒之光", "魔神之杖", "圣龙枪"]
        }
    };

    static ITEM_NAMES = {
        heal: {
            1: ["小型治疗药水", "绷带"],
            2: ["中型治疗药水", "恢复药膏"],
            3: ["大型治疗药水", "生命精华"],
            4: ["圣光药剂", "凤凰之泪"],
            5: ["神之恩赐", "永恒生命"]
        },
        mana: {
            1: ["小型魔力药水", "魔力碎片"],
            2: ["中型魔力药水", "法力精华"],
            3: ["大型魔力药水", "奥术水晶"],
            4: ["星辰魔液", "月华精华"],
            5: ["神之智慧", "永恒魔力"]
        },
        cleanse: {
            1: ["解毒草"],
            2: ["清醒药剂"],
            3: ["万能药"],
            4: ["圣水"],
            5: ["神之宽恕"]
        },
        town_portal: {
            1: ["粗糙的回城卷轴"],
            2: ["普通的回城卷轴"],
            3: ["精良的回城卷轴"],
            4: ["稀有的回城卷轴"],
            5: ["传说回城卷轴"]
        }
    };

    static WEAPON_TYPES = ["sword", "axe", "spear", "bow", "staff", "dagger"];
    static WEAPON_HANDS = { sword: 1, axe: 1, spear: 2, bow: 2, staff: 2, dagger: 1 };

    static generateGear(slot, level, rarity) {
        if (rarity == null || rarity < 1) rarity = this._rollRarity();
        const names = this.GEAR_NAMES[slot] && this.GEAR_NAMES[slot][rarity];
        const name = names ? names[RAND(names.length)] : "未知装备";
        const isCursed = Math.random() < this.CURSE_CHANCE;
        const stats = this._generateStats(slot, rarity, level);
        const wtype = slot === "weapon" ? this.WEAPON_TYPES[RAND(this.WEAPON_TYPES.length)] : null;
        return {
            id: Date.now() + RAND(100000),
            name: name,
            slot: slot,
            rarity: rarity,
            level: level,
            cursed: isCursed,
            identified: false,
            type: slot === "weapon" ? "weapon" : "armor",
            stats: stats,
            wtype: wtype,
            hands: slot === "weapon" ? this.WEAPON_HANDS[wtype] : 0
        };
    }

    static generateWeapon(level, rarity) {
        return this.generateGear("weapon", level, rarity);
    }

    static generateItem(itemType, level, rarity) {
        if (rarity == null || rarity < 1) rarity = this._rollRarity();
        const names = this.ITEM_NAMES[itemType] && this.ITEM_NAMES[itemType][rarity];
        const name = names ? names[RAND(names.length)] : "未知道具";
        const isCursed = Math.random() < this.CURSE_CHANCE;
        const stats = this._generateItemStats(itemType, rarity, level);
        const item = {
            id: Date.now() + RAND(100000),
            name: name,
            type: "item",
            itemType: itemType,
            rarity: rarity,
            level: level,
            cursed: isCursed,
            identified: false,
            stats: stats
        };
        // V8.0: 回城卷轴根据品质增加使用次数，其他药水固定3次
        if (itemType === "town_portal") {
            item.charges = rarity; // 品质1~5 = 使用次数1~5
        } else {
            item.charges = 3; // 治疗/法力/异常恢复药水固定3次
        }
        return item;
    }

    // V8.0: 特殊物品已整合进常规装备/道具系统，此处保留向后兼容的空壳
    static generateSpecialItem(specialType, level, noCurse) {
        if (specialType === "supreme_ring") {
            const isCursed = noCurse ? false : (Math.random() < this.CURSE_CHANCE);
            const rarity = 4;
            const gear = this.generateGear("ring", level, rarity);
            gear.name = isCursed ? "诅咒至尊戒指" : "至尊戒指";
            gear.cursed = isCursed;
            gear.stats = { atk: Math.floor(level * 3), def: Math.floor(level * 2), hp: Math.floor(level * 5), mp: Math.floor(level * 2) };
            gear.special = "supreme_ring";
            return gear;
        }
        return null;
    }

    static _rollRarity() {
        const roll = Math.random();
        if (roll < 0.40) return 1;
        if (roll < 0.65) return 2;
        if (roll < 0.82) return 3;
        if (roll < 0.95) return 4;
        return 5;
    }

    static _rollRarityCapped(maxRarity, minRarity) {
        let r = this._rollRarity();
        if (r > maxRarity) r = maxRarity;
        if (r < minRarity) r = minRarity;
        return r;
    }

    static _generateStats(slot, rarity, level) {
        const q = this.GEAR_QUALITY_PCT[rarity] || this.GEAR_QUALITY_PCT[1];
        const stats = {};
        if (slot === "weapon") {
            stats.atkPct = q.atkPct;
            if (rarity >= 2 && Math.random() < 0.5) stats.hpPct = Math.round(q.hpPct * 0.3 * 100) / 100;
            if (rarity >= 3 && Math.random() < 0.3) stats.mpPct = Math.round(q.mpPct * 0.2 * 100) / 100;
        } else if (slot === "head") {
            stats.hpPct = Math.round(q.hpPct * 0.6 * 100) / 100;
            stats.mpPct = Math.round(q.mpPct * 0.4 * 100) / 100;
            if (rarity >= 3) stats.defPct = Math.round(q.defPct * 0.3 * 100) / 100;
        } else if (slot === "body") {
            stats.hpPct = q.hpPct;
            stats.defPct = Math.round(q.defPct * 0.75 * 100) / 100;
        } else if (slot === "legs") {
            stats.hpPct = Math.round(q.hpPct * 0.75 * 100) / 100;
            stats.defPct = Math.round(q.defPct * 0.5 * 100) / 100;
            if (rarity >= 2) stats.mpPct = Math.round(q.mpPct * 0.25 * 100) / 100;
        } else if (slot === "hands") {
            stats.atkPct = Math.round(q.atkPct * 0.6 * 100) / 100;
            stats.defPct = Math.round(q.defPct * 0.4 * 100) / 100;
        } else if (slot === "neck") {
            stats.mpPct = q.mpPct;
            if (rarity >= 2) stats.hpPct = Math.round(q.hpPct * 0.4 * 100) / 100;
        } else if (slot === "ring") {
            const types = ["atkPct", "defPct", "hpPct", "mpPct"];
            const type1 = types[RAND(types.length)];
            const val1 = type1 === "atkPct" ? q.atkPct : type1 === "defPct" ? q.defPct : type1 === "hpPct" ? q.hpPct : q.mpPct;
            stats[type1] = val1;
            if (rarity >= 3) {
                let type2 = types[RAND(types.length)];
                if (type2 !== type1) {
                    const val2 = type2 === "atkPct" ? q.atkPct : type2 === "defPct" ? q.defPct : type2 === "hpPct" ? q.hpPct : q.mpPct;
                    stats[type2] = Math.round(val2 * 0.6 * 100) / 100;
                }
            }
        }
        return stats;
    }

    static _generateItemStats(itemType, rarity, level) {
        const base = Math.max(10, level * 5);
        const pct = this.RARITY_MIN[rarity] + Math.random() * (this.RARITY_MAX[rarity] - this.RARITY_MIN[rarity]);
        const power = Math.max(1, Math.floor(base * pct));
        const stats = {};
        if (itemType === "heal") stats.hp = power * 5;
        else if (itemType === "mana") stats.mp = power * 5;
        else if (itemType === "cleanse") {
            stats.cleanse = true;
        } else if (itemType === "town_portal") {
            stats.town_portal = true;
        }
        return stats;
    }

    static getRarityColor(rarity) {
        return this.RARITY_COLORS[rarity] || "#ffffff";
    }

    static getRarityName(rarity) {
        return this.RARITY_NAMES[rarity] || "未知";
    }

    static getGearDesc(gear) {
        if (!gear) return "空";
        const rName = this.getRarityName(gear.rarity);
        const rColor = this.getRarityColor(gear.rarity);
        let curseMark = "";
        if (gear.identified && gear.cursed) curseMark = " [诅咒]";
        else if (!gear.identified) curseMark = " [未鉴定]";
        let statStr = "";
        for (const k in gear.stats || {}) {
            if (k === "duration" || k === "cleanse") continue;
            const v = gear.stats[k];
            const sign = (gear.cursed && gear.identified) ? "-" : "+";
            let label = k === "atk" ? "攻" : k === "def" ? "防" : k === "atkPct" ? "攻%" : k === "defPct" ? "防%" : k === "hpPct" ? "体%" : k === "mpPct" ? "气%" : k.toUpperCase();
            let valStr = k.endsWith('Pct') ? Math.round(v * 100) + "%" : v;
            statStr += " " + sign + valStr + label;
        }
        if (gear.type === "weapon" && gear.hands) {
            statStr += " " + (gear.hands === 2 ? "双手" : "单手");
        }
        return `[<span style="color:${rColor}">${rName}</span>]<span style="color:${rColor}">${gear.name}</span>${curseMark}${statStr}`;
    }

    static getGearDescPlain(gear) {
        if (!gear) return "空";
        const rName = this.getRarityName(gear.rarity);
        let curseMark = "";
        if (gear.identified && gear.cursed) curseMark = " [诅咒]";
        else if (!gear.identified) curseMark = " [未鉴定]";
        let statStr = "";
        for (const k in gear.stats || {}) {
            if (k === "duration" || k === "cleanse") continue;
            const v = gear.stats[k];
            const sign = (gear.cursed && gear.identified) ? "-" : "+";
            let label = k === "atk" ? "攻" : k === "def" ? "防" : k === "atkPct" ? "攻%" : k === "defPct" ? "防%" : k === "hpPct" ? "体%" : k === "mpPct" ? "气%" : k.toUpperCase();
            let valStr = k.endsWith('Pct') ? Math.round(v * 100) + "%" : v;
            statStr += " " + sign + valStr + label;
        }
        if (gear.type === "weapon" && gear.hands) {
            statStr += " " + (gear.hands === 2 ? "双手" : "单手");
        }
        return `[${rName}]${gear.name}${curseMark}${statStr}`;
    }

    static getGearNameHtml(gear) {
        if (!gear) return '<span style="color:var(--text-dim)">空</span>';
        const rColor = this.getRarityColor(gear.rarity);
        return `<span style="color:${rColor};font-weight:bold;">${gear.name}</span>`;
    }

    // V8.0: 获取装备实际生效属性（考虑未鉴定状态）
    static _getEffectiveStats(gear) {
        if (!gear) return {};
        // 诅咒装备或已鉴定装备：使用实际stats
        if (gear.cursed || gear.identified) return gear.stats || {};
        // 未鉴定非诅咒装备：百分比属性降为普通级(5%)
        const result = {};
        for (const k in gear.stats || {}) {
            if (k.endsWith('Pct')) {
                result[k] = 0.05; // 普通级固定5%
            } else {
                result[k] = gear.stats[k];
            }
        }
        return result;
    }

    // V12.0: 诅咒装备惩罚改为固定百分比（通过getTotalGearBonusPct在_recalcBaseStats中应用）
    // 本方法只返回非诅咒装备的绝对值加成
    static applyGearBonus(c, immuneToCurse) {
        if (!c.gear) return { atk: 0, def: 0, hp: 0, mp: 0 };
        const bonus = { atk: 0, def: 0, hp: 0, mp: 0 };
        const slots = ["head", "body", "legs", "hands", "neck", "ring"];
        for (const s of slots) {
            const g = c.gear[s];
            if (!g) continue;
            // V12.0: 诅咒装备跳过绝对值加成（其惩罚通过百分比实现）
            if (g.cursed && !immuneToCurse) continue;
            if (g.cursed && immuneToCurse) continue;
            const effStats = this._getEffectiveStats(g);
            for (const k in effStats) {
                if (bonus[k] != null) bonus[k] += (effStats[k] || 0);
            }
        }
        if (c.gear.weapons) {
            for (const w of c.gear.weapons) {
                if (!w) continue;
                // V12.0: 诅咒武器跳过绝对值加成（其惩罚通过百分比实现）
                if (w.cursed && !immuneToCurse) continue;
                if (w.cursed && immuneToCurse) continue;
                const effStats = this._getEffectiveStats(w);
                for (const k in effStats) {
                    if (bonus[k] != null) bonus[k] += (effStats[k] || 0);
                }
            }
        }
        return bonus;
    }

    // V12.0: 判断角色是否免疫诅咒效果（魔王军、俘虏、前勇者、洗脑角色）
    static _isImmuneToCurse(entity) {
        if (!entity) return false;
        // 魔军标记
        if (entity.cflag && entity.cflag[CFLAGS.IS_DEMON_ARMY]) return true;
        // 俘虏（在魔王城，诅咒无效）
        if (entity.cflag && entity.cflag[CFLAGS.CAPTURE_STATUS] === 1) return true;
        // 前勇者（已加入魔王军）
        if (entity.talent && entity.talent[200]) return true;
        // 洗脑角色
        if (entity.talent && entity.talent[296]) return true;
        return false;
    }

    // V12.0: 统计角色身上诅咒装备+武器的数量（不含道具）
    // 对魔王军免疫诅咒的角色返回0，多件叠加惩罚不生效
    static countCursedGear(entity) {
        if (!entity || !entity.gear) return 0;
        // 魔王军免疫诅咒，多件叠加惩罚不生效
        if (this._isImmuneToCurse(entity)) return 0;
        let count = 0;
        const slots = ['head', 'body', 'legs', 'hands', 'neck', 'ring'];
        for (const s of slots) {
            const g = entity.gear[s];
            if (g && g.cursed) count++;
        }
        for (const w of (entity.gear.weapons || [])) {
            if (w && w.cursed) count++;
        }
        return count;
    }

    // V6.0/V12.0: 计算装备百分比总加成（含诅咒惩罚）
    // 魔王军免疫诅咒：诅咒装备既不提供加成也不施加惩罚
    static getTotalGearBonusPct(entity) {
        if (!entity || !entity.gear) return { atkPct: 0, defPct: 0, hpPct: 0, mpPct: 0 };
        const immune = this._isImmuneToCurse(entity);
        const result = { atkPct: 0, defPct: 0, hpPct: 0, mpPct: 0 };
        const slots = ['head', 'body', 'legs', 'hands', 'neck', 'ring'];
        for (const slot of slots) {
            const gear = entity.gear[slot];
            // V12.0: 魔王军免疫诅咒，诅咒装备百分比属性也不生效
            if (gear && gear.cursed && immune) continue;
            const effStats = this._getEffectiveStats(gear);
            if (effStats) {
                for (const k in effStats) {
                    if (k.endsWith('Pct') && typeof effStats[k] === 'number') {
                        result[k] = (result[k] || 0) + effStats[k];
                    }
                }
            }
            // V12.0: 诅咒装备固定全属性-5%（只对非免疫角色）
            if (gear && gear.cursed && !immune) {
                result.atkPct = (result.atkPct || 0) - 0.05;
                result.defPct = (result.defPct || 0) - 0.05;
                result.hpPct = (result.hpPct || 0) - 0.05;
                result.mpPct = (result.mpPct || 0) - 0.05;
            }
        }
        for (const weapon of (entity.gear.weapons || [])) {
            // V12.0: 魔王军免疫诅咒，诅咒武器百分比属性也不生效
            if (weapon && weapon.cursed && immune) continue;
            const effStats = this._getEffectiveStats(weapon);
            if (effStats) {
                for (const k in effStats) {
                    if (k.endsWith('Pct') && typeof effStats[k] === 'number') {
                        result[k] = (result[k] || 0) + effStats[k];
                    }
                }
            }
            // V12.0: 诅咒武器：单手-5%，双手-10%（只对非免疫角色）
            if (weapon && weapon.cursed && !immune) {
                const penalty = weapon.hands === 2 ? 0.10 : 0.05;
                result.atkPct = (result.atkPct || 0) - penalty;
                result.defPct = (result.defPct || 0) - penalty;
                result.hpPct = (result.hpPct || 0) - penalty;
                result.mpPct = (result.mpPct || 0) - penalty;
            }
        }
        return result;
    }

    static equipItem(c, gear, forced) {
        if (!c.gear) c.gear = { head: null, body: null, legs: null, hands: null, neck: null, ring: null, weapons: [], items: [] };
        if (gear.type === "item") {
            if (c.gear.items.length >= 3) return { success: false, msg: "道具栏已满" };
            c.gear.items.push(gear);
            return { success: true, msg: "获得道具: " + this.getGearDescPlain(gear) };
        }
        if (gear.type === "weapon") {
            const handCount = c.gear.weapons.reduce((s, w) => s + (w ? w.hands : 0), 0);
            if (handCount + gear.hands > 2) return { success: false, msg: "武器槽位不足" };
            c.gear.weapons.push(gear);
            // V8.0: 装备时不再自动鉴定
            return { success: true, msg: "装备武器: " + this.getGearDescPlain(gear), curseTriggered: gear.cursed };
        }
        const slot = gear.slot;
        if (!slot || !c.gear.hasOwnProperty(slot)) return { success: false, msg: "无效装备槽" };
        const old = c.gear[slot];
        if (old && old.cursed && !forced) return { success: false, msg: old.name + " 被诅咒，无法脱下" };
        c.gear[slot] = gear;
        // V8.0: 装备时不再自动鉴定
        // 诅咒至尊戒指效果（触发条件改为已装备即可，因为诅咒立即生效）
        let brainwashed = false;
        if (gear.special === "supreme_ring" && gear.cursed) {
            c.talent[247] = (c.talent[247] || 0) + 1; // 洗脑特质
            if (!c.mark) c.mark = new Array(20).fill(0);
            c.mark[0] = 3; // 服从度max
            brainwashed = true;
        }
        // 诅咒装备日志
        if (gear.cursed && typeof G !== 'undefined' && G._addAdventureLog) {
            G._addAdventureLog(c, 'curse_equip', `佩戴了诅咒装备「${gear.name || this.getGearDescPlain(gear)}」，遭到诅咒`);
            // V12.0: 心声——佩戴诅咒装备
            const curseEquipVoices = [
                `这件${gear.name}...感觉不太对劲。戴上后身体开始发热...`,
                '糟了，是诅咒装备！但现在脱不下来了...',
                '力量在涌入...但同时有什么邪恶的东西也一起进入了身体...',
                `「${gear.name}」在对我低语...它在说什么？`
            ];
            G._addAdventureLog(c, 'voice', curseEquipVoices[RAND(curseEquipVoices.length)]);
        }
        return { success: true, msg: "装备" + this.SLOT_NAMES[slot] + ": " + this.getGearDescPlain(gear), curseTriggered: gear.cursed, brainwashed: brainwashed };
    }

    static unequipItem(c, slot, index, forced) {
        if (!c.gear) return { success: false, msg: "无装备" };
        if (slot === "weapon") {
            const w = c.gear.weapons[index];
            if (!w) return { success: false, msg: "该位置无武器" };
            if (w.cursed && !forced) return { success: false, msg: w.name + " 被诅咒，无法卸下" };
            const wasSupreme = w.special === "supreme_ring" && w.cursed;
            c.gear.weapons.splice(index, 1);
            return { success: true, gear: w, wasSupreme: wasSupreme };
        }
        const g = c.gear[slot];
        if (!g) return { success: false, msg: "该位置无装备" };
        if (g.cursed && !forced) return { success: false, msg: g.name + " 被诅咒，无法脱下" };
        const wasSupreme = g.special === "supreme_ring" && g.cursed;
        c.gear[slot] = null;
        return { success: true, gear: g, wasSupreme: wasSupreme };
    }

    static useItem(c, itemIndex, options = {}) {
        if (!c.gear || !c.gear.items || itemIndex >= c.gear.items.length) return { success: false, msg: "道具不存在" };
        const item = c.gear.items[itemIndex];
        if (!item) return { success: false, msg: "道具不存在" };
        if (!item.identified) item.identified = true;
        // V8.0: 道具诅咒效果不受鉴定状态影响
        const mult = item.cursed ? -1 : 1;
        let msg = "";
        let used = true;
        if (item.itemType === "heal") {
            const val = Math.abs(item.stats.hp || 0);
            if (item.cursed) {
                // V8.0: 诅咒治疗药水造成伤害
                c.hp = Math.max(1, c.hp - val);
                msg = `诅咒！受到 ${val} 伤害`;
            } else {
                c.hp = Math.min(c.maxHp, c.hp + val);
                msg = "恢复 " + val + " HP";
            }
        } else if (item.itemType === "mana") {
            const val = Math.abs(item.stats.mp || 0);
            if (item.cursed) {
                // V8.0: 诅咒MP药水造成伤害
                c.hp = Math.max(1, c.hp - val);
                msg = `诅咒！MP药水腐蚀了身体，受到 ${val} 伤害`;
            } else {
                c.mp = Math.min(c.maxMp, c.mp + val);
                msg = "恢复 " + val + " MP";
            }
        } else if (item.itemType === "cleanse") {
            if (item.cursed) {
                // V8.0: 诅咒异常恢复药水造成重伤
                if (typeof G !== 'undefined' && G._addStatusAilment) {
                    G._addStatusAilment(c, "severe_injury", 9999);
                    msg = "诅咒！身体遭到严重侵蚀，陷入重伤状态！";
                } else {
                    msg = "诅咒！身体遭到严重侵蚀！";
                }
            } else {
                // V8.0: 异常状态恢复药水
                if (typeof G !== 'undefined' && G._tryCureStatusAilment) {
                    const cured = G._tryCureStatusAilment(c, "item_cleanse");
                    msg = cured.length > 0 ? "解除了异常状态: " + cured.join(", ") : "没有异常状态需要解除";
                } else {
                    msg = "解除了异常状态";
                }
            }
        } else if (item.itemType === "town_portal") {
            // V8.0: 回城卷轴（战斗外使用）
            if (options.inCombat) {
                return { success: false, msg: "战斗中无法使用回城卷轴", consumed: false };
            }
            if (item.cursed) {
                // V8.0: 诅咒回城卷轴传送到第5层竞技场
                if (typeof G !== 'undefined') {
                    c.cflag[CFLAGS.HERO_FLOOR] = 5;
                    c.cflag[CFLAGS.HERO_PROGRESS] = 70; // 竞技场位置
                    msg = "诅咒！卷轴将勇者传送到了未知的危险之地（第5层竞技场）！";
                    if (G._addAdventureLog) {
                        G._addAdventureLog(c, 'curse_portal', '使用了诅咒回城卷轴，被传送到了第5层竞技场');
                    }
                } else {
                    msg = "诅咒！卷轴发出不祥的光芒...";
                }
            } else {
                if (typeof G !== 'undefined' && G._startReturnToTown) {
                    // V8.0: 回城卷轴小队共享效果
                    const squadId = c.cflag && c.cflag[CFLAGS.SQUAD_ID];
                    if (squadId && G.invaders) {
                        const squad = G.invaders.filter(h => h.cflag && h.cflag[CFLAGS.SQUAD_ID] === squadId);
                        for (const member of squad) {
                            G._startReturnToTown(member, '队友使用回城卷轴，全队返回城镇');
                        }
                        msg = squad.length > 1 
                            ? `使用回城卷轴，全队${squad.length}人准备返回城镇` 
                            : "使用回城卷轴，准备返回城镇";
                    } else {
                        G._startReturnToTown(c, '使用回城卷轴返回城镇');
                        msg = "使用回城卷轴，准备返回城镇";
                    }
                } else {
                    msg = "回城卷轴发出微光...";
                }
            }
            // 回城卷轴消耗次数而非直接删除
            item.charges = (item.charges || 1) - 1;
            if (item.charges > 0) {
                used = false; // 还有剩余次数，不移除
                msg += ` (剩余${item.charges}次)`;
            }
        } else {
            msg = "使用了未知道具";
        }
        // V8.0: 消耗次数，用完才移除
        if (used) {
            item.charges = (item.charges || 1) - 1;
            if (item.charges <= 0) {
                c.gear.items.splice(itemIndex, 1);
            } else {
                msg += ` (剩余${item.charges}次)`;
            }
        }
        return { success: true, msg: msg, cursed: item.cursed, consumed: used };
    }

    static hasCursedGear(c) {
        if (!c.gear) return false;
        const all = [c.gear.head, c.gear.body, c.gear.legs, c.gear.hands, c.gear.neck, c.gear.ring, ...c.gear.weapons];
        return all.some(g => g && g.cursed);
    }

    static countCursed(c) {
        if (!c.gear) return 0;
        const all = [c.gear.head, c.gear.body, c.gear.legs, c.gear.hands, c.gear.neck, c.gear.ring, ...c.gear.weapons];
        return all.filter(g => g && g.cursed).length;
    }

    // V8.0: 鉴定装备（揭示真实属性）
    static identifyGear(gear) {
        if (!gear) return { success: false, msg: "无装备" };
        if (gear.identified) return { success: false, msg: "已鉴定" };
        gear.identified = true;
        return { success: true, msg: `鉴定了 ${gear.name}，真实属性 revealed！`, wasCursed: gear.cursed };
    }

    // V12.0: 自动鉴定角色身上所有未鉴定装备（回到魔王城时触发）
    static identifyAllGear(entity) {
        if (!entity || !entity.gear) return 0;
        let count = 0;
        const slots = ['head', 'body', 'legs', 'hands', 'neck', 'ring'];
        for (const s of slots) {
            const g = entity.gear[s];
            if (g && !g.identified) {
                g.identified = true;
                count++;
            }
        }
        for (const w of (entity.gear.weapons || [])) {
            if (w && !w.identified) {
                w.identified = true;
                count++;
            }
        }
        for (const item of (entity.gear.items || [])) {
            if (item && !item.identified) {
                item.identified = true;
                count++;
            }
        }
        return count;
    }

    // V8.0: 获取解诅咒费用
    static getUncurseCost(rarity) {
        // 普通10g，每升一级+5g
        return 10 + (Math.max(1, rarity) - 1) * 5;
    }

    // V8.0: 解除诅咒
    static uncurseGear(gear) {
        if (!gear) return { success: false, msg: "无装备" };
        if (!gear.cursed) return { success: false, msg: "未受诅咒" };
        if (!gear.identified) return { success: false, msg: "需先鉴定" };
        gear.cursed = false;
        return { success: true, msg: `净化了 ${gear.name} 的诅咒`, cost: this.getUncurseCost(gear.rarity) };
    }

    // V12.0: 批量解除角色身上所有诅咒装备（城镇净化神殿）
    static uncurseAllGear(entity) {
        if (!entity || !entity.gear) return { count: 0, cost: 0, logs: [] };
        let count = 0;
        let totalCost = 0;
        const logs = [];
        const slots = ['head', 'body', 'legs', 'hands', 'neck', 'ring'];
        for (const s of slots) {
            const g = entity.gear[s];
            if (g && g.cursed && g.identified) {
                const cost = this.getUncurseCost(g.rarity);
                g.cursed = false;
                count++;
                totalCost += cost;
                logs.push(`净化了 ${g.name}`);
            }
        }
        for (const w of (entity.gear.weapons || [])) {
            if (w && w.cursed && w.identified) {
                const cost = this.getUncurseCost(w.rarity);
                w.cursed = false;
                count++;
                totalCost += cost;
                logs.push(`净化了 ${w.name}`);
            }
        }
        return { count, cost: totalCost, logs };
    }

    // V8.0: 评估装备评分（用于AI自动装备比较）
    static evaluateGearScore(gear, slot, hero) {
        if (!gear) return 0;
        let score = gear.rarity * 20; // 基础稀有度分

        // 主属性契合度加成
        const cls = hero.cflag && (hero.cflag[CFLAGS.HERO_CLASS] || hero.cflag[CFLAGS.CLASS_ID]);
        const role = (window.CLASS_DEFS && CLASS_DEFS[cls] && CLASS_DEFS[cls].role) ||
                     (window.HERO_CLASS_DEFS && HERO_CLASS_DEFS[cls] && HERO_CLASS_DEFS[cls].role) || '';

        const stats = this._getEffectiveStats(gear);
        if (role === 'tank' || role === 'holy_tank') {
            // 坦克：偏好HP、DEF
            score += (stats.hpPct || 0) * 200;
            score += (stats.defPct || 0) * 150;
            score += (stats.atkPct || 0) * 50;
        } else if (role === 'assassin' || role === 'ninja') {
            // 刺客：偏好ATK、SPD
            score += (stats.atkPct || 0) * 200;
            score += (stats.hpPct || 0) * 50;
        } else if (role === 'mage' || role === 'healer') {
            // 法师/治疗：偏好MP
            score += (stats.mpPct || 0) * 200;
            score += (stats.hpPct || 0) * 100;
        } else {
            // 其他（战士等）：平衡偏好ATK、HP
            score += (stats.atkPct || 0) * 150;
            score += (stats.hpPct || 0) * 100;
            score += (stats.defPct || 0) * 100;
        }

        // 诅咒装备大幅扣分（除非已装备也是诅咒）
        if (gear.cursed) score -= 50;

        // 固定值属性额外加分（至尊戒指等）
        if (stats.atk) score += stats.atk * 2;
        if (stats.def) score += stats.def * 2;
        if (stats.hp) score += stats.hp * 1;
        if (stats.mp) score += stats.mp * 1;

        return Math.max(0, Math.round(score));
    }

    // V8.0: 智能装备（比较后决定是否装备）
    static shouldEquip(newGear, slot, hero) {
        if (!hero.gear) hero.gear = { head: null, body: null, legs: null, hands: null, neck: null, ring: null, weapons: [], items: [] };

        let current = null;
        if (slot === 'weapon') {
            // 武器槽：找评分最低的已装备武器，或空槽
            const weapons = hero.gear.weapons || [];
            const handCount = weapons.reduce((s, w) => s + (w ? w.hands : 0), 0);
            if (handCount + (newGear.hands || 1) > 2) {
                // 槽位不足：比较是否比当前最差的武器好
                if (weapons.length === 0) return { should: false, reason: "武器槽位不足" };
                current = weapons.reduce((min, w) => {
                    if (!min) return w;
                    return this.evaluateGearScore(w, 'weapon', hero) < this.evaluateGearScore(min, 'weapon', hero) ? w : min;
                }, null);
            } else {
                // 有空位
                return { should: true, reason: "武器槽位充足" };
            }
        } else {
            current = hero.gear[slot];
            if (!current) return { should: true, reason: "槽位为空" };
        }

        const newScore = this.evaluateGearScore(newGear, slot, hero);
        const curScore = this.evaluateGearScore(current, slot, hero);

        // 新装备是诅咒且当前非诅咒：需评分优势≥2个稀有度等级（约40分）
        if (newGear.cursed && !current.cursed) {
            if (newScore < curScore + 40) {
                return { should: false, reason: "诅咒装备需明显优于当前装备才替换", newScore, curScore };
            }
        }

        // 新装备评分 > 当前装备评分 × 1.1 时才替换
        if (newScore > curScore * 1.1) {
            return { should: true, reason: `评分 ${newScore} > ${Math.round(curScore * 1.1)}`, newScore, curScore };
        }

        return { should: false, reason: `评分 ${newScore} <= ${Math.round(curScore * 1.1)}（当前 ${curScore}）`, newScore, curScore };
    }

    // 随机升级身上一件装备的品质（最高橙色）
    static randomUpgradeGear(c) {
        if (!c.gear) return null;
        const upgradable = [];
        const slots = ["head", "body", "legs", "hands", "neck", "ring"];
        for (const s of slots) {
            const g = c.gear[s];
            if (g && g.rarity < 5) upgradable.push({ slot: s, gear: g, isWeapon: false });
        }
        if (c.gear.weapons) {
            for (let i = 0; i < c.gear.weapons.length; i++) {
                const w = c.gear.weapons[i];
                if (w && w.rarity < 5) upgradable.push({ slot: "weapon", index: i, gear: w, isWeapon: true });
            }
        }
        if (upgradable.length === 0) return null;
        const target = upgradable[RAND(upgradable.length)];
        const oldRarity = target.gear.rarity;
        const newRarity = Math.min(5, oldRarity + 1);
        target.gear.rarity = newRarity;
        // 重新生成属性（保留原有装备结构）
        const newStats = this._generateStats(target.gear.slot || target.gear.wtype || "weapon", newRarity, target.gear.level);
        target.gear.stats = newStats;
        // 更新名称以匹配新品质
        const names = this.GEAR_NAMES[target.gear.slot] && this.GEAR_NAMES[target.gear.slot][newRarity];
        if (names) target.gear.name = names[RAND(names.length)];
        return target.gear;
    }
}

window.GearSystem = GearSystem;