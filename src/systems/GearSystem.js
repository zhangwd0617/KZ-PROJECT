/**
 * GearSystem - 装备/武器/道具系统（含诅咒）
 */
class GearSystem {
    static RARITY_NAMES = ["垃圾", "普通", "精品", "大师", "传说", "神话"];
    static RARITY_COLORS = ["#888888", "#ffffff", "#44ff44", "#4444ff", "#aa44ff", "#ff8800"];
    static RARITY_MIN = [0, 0.01, 0.05, 0.08, 0.10, 0.20];
    static RARITY_MAX = [0, 0.05, 0.08, 0.10, 0.15, 0.20];
    static CURSE_CHANCE = 0.20;

    static SLOT_NAMES = {
        head: "头盔", body: "衣服", legs: "裤子", hands: "手套",
        neck: "项链", ring: "戒指", weapon: "武器"
    };

    static GEAR_NAMES = {
        head: {
            0: ["破布帽", "烂皮盔", "碎铁片"],
            1: ["皮帽", "布兜帽", "木盔"],
            2: ["钢盔", "魔纹帽", "精灵头环"],
            3: ["秘银头盔", "龙鳞盔", "暗影面甲"],
            4: ["泰坦之颅", "凤凰羽冠", "深渊凝视"],
            5: ["诸神黄昏", "创世之光", "永恒王冠"]
        },
        body: {
            0: ["破布衫", "烂皮甲", "朽木盾"],
            1: ["皮甲", "布袍", "链甲"],
            2: ["钢甲", "魔纹袍", "精灵轻甲"],
            3: ["秘银铠甲", "龙鳞甲", "暗影斗篷"],
            4: ["泰坦之躯", "凤凰羽衣", "深渊吞噬"],
            5: ["诸神黄昏", "创世之铠", "永恒圣衣"]
        },
        legs: {
            0: ["破布裤", "烂皮裙", "草绳绑腿"],
            1: ["皮裤", "布裙", "链甲裙"],
            2: ["钢腿甲", "魔纹裤", "精灵轻裤"],
            3: ["秘银腿甲", "龙鳞裤", "暗影绑腿"],
            4: ["泰坦之胫", "凤凰羽裤", "深渊缠绕"],
            5: ["诸神黄昏", "创世之裤", "永恒护腿"]
        },
        hands: {
            0: ["破布手套", "烂皮护手", "草绳缠手"],
            1: ["皮手套", "布护手", "链甲手套"],
            2: ["钢护手", "魔纹手套", "精灵轻手套"],
            3: ["秘银护手", "龙鳞手套", "暗影指套"],
            4: ["泰坦之拳", "凤凰羽爪", "深渊触须"],
            5: ["诸神黄昏", "创世之手", "永恒护爪"]
        },
        neck: {
            0: ["麻绳", "烂皮带", "朽木珠"],
            1: ["皮绳", "铜项链", "木珠"],
            2: ["银链", "魔纹坠", "精灵泪"],
            3: ["秘银项链", "龙牙坠", "暗影符文"],
            4: ["泰坦之喉", "凤凰心血", "深渊呼唤"],
            5: ["诸神黄昏", "创世之链", "永恒羁绊"]
        },
        ring: {
            0: ["铁丝", "烂皮圈", "草绳"],
            1: ["铜戒", "铁环", "木戒"],
            2: ["银戒", "魔纹戒", "精灵誓约"],
            3: ["秘银戒指", "龙眼戒", "暗影契约"],
            4: ["泰坦之环", "凤凰尾羽", "深渊指环"],
            5: ["诸神黄昏", "创世之戒", "永恒誓约"]
        },
        weapon: {
            0: ["断剑", "锈刀", "朽木棒"],
            1: ["铁剑", "短刀", "木杖", "匕首", "单手剑"],
            2: ["钢剑", "魔纹刀", "精灵弓", "战斧", "长枪"],
            3: ["秘银剑", "龙牙刃", "暗影弓", "雷霆锤", "冰霜矛"],
            4: ["泰坦之剑", "凤凰羽刃", "深渊之弓", "灭世锤", "龙王枪"],
            5: ["诸神黄昏", "创世之刃", "永恒之光", "魔神之杖", "圣龙枪"]
        }
    };

    static ITEM_NAMES = {
        heal: {
            0: ["浑浊的药水", "发霉的面包"],
            1: ["小型治疗药水", "绷带"],
            2: ["中型治疗药水", "恢复药膏"],
            3: ["大型治疗药水", "生命精华"],
            4: ["圣光药剂", "凤凰之泪"],
            5: ["神之恩赐", "永恒生命"]
        },
        mana: {
            0: ["浑浊的魔液", "漏气的水晶"],
            1: ["小型魔力药水", "魔力碎片"],
            2: ["中型魔力药水", "法力精华"],
            3: ["大型魔力药水", "奥术水晶"],
            4: ["星辰魔液", "月华精华"],
            5: ["神之智慧", "永恒魔力"]
        },
        buff: {
            0: ["破损的卷轴", "空白的纸片"],
            1: ["力量卷轴", "守护卷轴"],
            2: ["狂暴卷轴", "铁壁卷轴"],
            3: ["龙之卷轴", "圣盾卷轴"],
            4: ["泰坦之力", "凤凰祝福"],
            5: ["神之裁决", "创世祝福"]
        },
        cleanse: {
            1: ["净化卷轴"],
            2: ["圣水"],
            3: ["驱魔卷轴"],
            4: ["神圣净化"],
            5: ["神之宽恕"]
        }
    };

    static WEAPON_TYPES = ["sword", "axe", "spear", "bow", "staff", "dagger"];
    static WEAPON_HANDS = { sword: 1, axe: 1, spear: 2, bow: 2, staff: 2, dagger: 1 };

    static generateGear(slot, level, rarity) {
        if (rarity == null || rarity < 0) rarity = this._rollRarity();
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
        if (rarity == null || rarity < 0) rarity = this._rollRarity();
        const names = this.ITEM_NAMES[itemType] && this.ITEM_NAMES[itemType][rarity];
        const name = names ? names[RAND(names.length)] : "未知道具";
        const isCursed = Math.random() < this.CURSE_CHANCE;
        const stats = this._generateItemStats(itemType, rarity, level);
        return {
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
    }

    static generateSpecialItem(specialType, level, noCurse) {
        if (specialType === "cleanse_potion") {
            const isCursed = noCurse ? false : (Math.random() < this.CURSE_CHANCE);
            return {
                id: Date.now() + RAND(100000),
                name: isCursed ? "诅咒净化药水" : "净化药水",
                type: "item",
                itemType: "cleanse_potion",
                rarity: isCursed ? 4 : 3,
                level: level,
                cursed: isCursed,
                identified: false,
                stats: { cleanse: true, special: true }
            };
        } else if (specialType === "supreme_ring") {
            const isCursed = noCurse ? false : (Math.random() < this.CURSE_CHANCE);
            const rarity = isCursed ? 4 : 4; // 诅咒版也显示传说
            return {
                id: Date.now() + RAND(100000),
                name: isCursed ? "诅咒至尊戒指" : "至尊戒指",
                slot: "ring",
                type: "armor",
                rarity: rarity,
                level: level,
                cursed: isCursed,
                identified: false,
                stats: { atk: Math.floor(level * 3), def: Math.floor(level * 2), hp: Math.floor(level * 5), mp: Math.floor(level * 2) },
                special: "supreme_ring"
            };
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
        const base = Math.max(1, Math.floor(level * 2));
        const minPct = this.RARITY_MIN[rarity];
        const maxPct = this.RARITY_MAX[rarity];
        const rollPct = minPct + Math.random() * (maxPct - minPct);
        const value = Math.max(1, Math.floor(base * rollPct));
        const stats = {};
        if (slot === "weapon") {
            stats.atk = value * 2;
            if (rarity >= 2 && Math.random() < 0.5) stats.hp = Math.floor(value * 0.5);
            if (rarity >= 3 && Math.random() < 0.3) stats.mp = Math.floor(value * 0.3);
        } else if (slot === "head") {
            stats.hp = Math.floor(value * 1.2);
            stats.mp = Math.floor(value * 0.8);
            if (rarity >= 3) stats.def = Math.floor(value * 0.5);
        } else if (slot === "body") {
            stats.hp = value * 2;
            stats.def = Math.floor(value * 1.5);
        } else if (slot === "legs") {
            stats.hp = Math.floor(value * 1.5);
            stats.def = value;
            if (rarity >= 2) stats.mp = Math.floor(value * 0.5);
        } else if (slot === "hands") {
            stats.atk = Math.floor(value * 1.2);
            stats.def = Math.floor(value * 0.8);
        } else if (slot === "neck") {
            stats.mp = value * 2;
            if (rarity >= 2) stats.hp = Math.floor(value * 0.8);
        } else if (slot === "ring") {
            const types = ["atk", "def", "hp", "mp"];
            const type1 = types[RAND(types.length)];
            stats[type1] = value;
            if (rarity >= 3) {
                let type2 = types[RAND(types.length)];
                if (type2 !== type1) stats[type2] = Math.floor(value * 0.6);
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
        else if (itemType === "buff") {
            stats.atk = Math.floor(power * 0.5);
            stats.def = Math.floor(power * 0.5);
            stats.duration = 3 + rarity;
        } else if (itemType === "cleanse") {
            stats.cleanse = true;
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
            const label = k === "atk" ? "攻" : k === "def" ? "防" : k.toUpperCase();
            statStr += " " + sign + v + label;
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
            const label = k === "atk" ? "攻" : k === "def" ? "防" : k.toUpperCase();
            statStr += " " + sign + v + label;
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

    static applyGearBonus(c, immuneToCurse) {
        if (!c.gear) return { atk: 0, def: 0, hp: 0, mp: 0 };
        const bonus = { atk: 0, def: 0, hp: 0, mp: 0 };
        const slots = ["head", "body", "legs", "hands", "neck", "ring"];
        for (const s of slots) {
            const g = c.gear[s];
            if (!g) continue;
            if (g.cursed && immuneToCurse) continue; // 魔王手下免疫诅咒
            const mult = (g.cursed && g.identified && !immuneToCurse) ? -1 : 1;
            for (const k in g.stats || {}) {
                if (bonus[k] != null) bonus[k] += (g.stats[k] || 0) * mult;
            }
        }
        if (c.gear.weapons) {
            for (const w of c.gear.weapons) {
                if (!w) continue;
                if (w.cursed && immuneToCurse) continue;
                const mult = (w.cursed && w.identified && !immuneToCurse) ? -1 : 1;
                for (const k in w.stats || {}) {
                    if (bonus[k] != null) bonus[k] += (w.stats[k] || 0) * mult;
                }
            }
        }
        return bonus;
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
            if (!gear.identified) gear.identified = true;
            return { success: true, msg: "装备武器: " + this.getGearDescPlain(gear), curseTriggered: gear.cursed };
        }
        const slot = gear.slot;
        if (!slot || !c.gear.hasOwnProperty(slot)) return { success: false, msg: "无效装备槽" };
        const old = c.gear[slot];
        if (old && old.cursed && old.identified && !forced) return { success: false, msg: old.name + " 被诅咒，无法脱下" };
        c.gear[slot] = gear;
        if (!gear.identified) gear.identified = true;
        // 诅咒至尊戒指效果
        let brainwashed = false;
        if (gear.special === "supreme_ring" && gear.cursed && gear.identified) {
            c.talent[247] = (c.talent[247] || 0) + 1; // 洗脑特质
            if (!c.mark) c.mark = new Array(20).fill(0);
            c.mark[0] = 3; // 服从度max
            brainwashed = true;
        }
        return { success: true, msg: "装备" + this.SLOT_NAMES[slot] + ": " + this.getGearDescPlain(gear), curseTriggered: gear.cursed, brainwashed: brainwashed };
    }

    static unequipItem(c, slot, index, forced) {
        if (!c.gear) return { success: false, msg: "无装备" };
        if (slot === "weapon") {
            const w = c.gear.weapons[index];
            if (!w) return { success: false, msg: "该位置无武器" };
            if (w.cursed && w.identified && !forced) return { success: false, msg: w.name + " 被诅咒，无法卸下" };
            const wasSupreme = w.special === "supreme_ring" && w.cursed;
            c.gear.weapons.splice(index, 1);
            return { success: true, gear: w, wasSupreme: wasSupreme };
        }
        const g = c.gear[slot];
        if (!g) return { success: false, msg: "该位置无装备" };
        if (g.cursed && g.identified && !forced) return { success: false, msg: g.name + " 被诅咒，无法脱下" };
        const wasSupreme = g.special === "supreme_ring" && g.cursed;
        c.gear[slot] = null;
        return { success: true, gear: g, wasSupreme: wasSupreme };
    }

    static useItem(c, itemIndex) {
        if (!c.gear || !c.gear.items || itemIndex >= c.gear.items.length) return { success: false, msg: "道具不存在" };
        const item = c.gear.items[itemIndex];
        if (!item) return { success: false, msg: "道具不存在" };
        if (!item.identified) item.identified = true;
        const mult = (item.cursed && item.identified) ? -1 : 1;
        let msg = "";
        if (item.itemType === "heal") {
            const val = (item.stats.hp || 0) * mult;
            c.hp = Math.min(c.maxHp, c.hp + val);
            msg = "恢复 " + val + " HP";
        } else if (item.itemType === "mana") {
            const val = (item.stats.mp || 0) * mult;
            c.mp = Math.min(c.maxMp, c.mp + val);
            msg = "恢复 " + val + " MP";
        } else if (item.itemType === "buff") {
            const atkVal = (item.stats.atk || 0) * mult;
            const defVal = (item.stats.def || 0) * mult;
            c.cflag[CFLAGS.SPY_SENT] = (c.cflag[CFLAGS.SPY_SENT] || 0) + atkVal;
            c.cflag[CFLAGS.SPY_TARGET] = (c.cflag[CFLAGS.SPY_TARGET] || 0) + defVal;
            msg = "攻击+" + atkVal + " 防御+" + defVal + " (持续" + item.stats.duration + "回合)";
        } else if (item.itemType === "cleanse") {
            let count = 0;
            const allGear = [c.gear.head, c.gear.body, c.gear.legs, c.gear.hands, c.gear.neck, c.gear.ring, ...c.gear.weapons];
            for (const g of allGear) {
                if (g && g.cursed) { g.cursed = false; count++; }
            }
            msg = "净化了 " + count + " 件诅咒装备";
        } else if (item.itemType === "cleanse_potion") {
            if (item.cursed) {
                // 诅咒净化药水
                if (c.talent[200]) {
                    // 前勇者：等级+10
                    c.level = Math.min(200, c.level + 10);
                    c.cflag[CFLAGS.BASE_HP] = c.level;
                    msg = "等级提升了10级！但身体感到异常...";
                } else {
                    // 普通勇者：服从度+1
                    if (!c.mark) c.mark = new Array(20).fill(0);
                    c.mark[0] = Math.min(3, (c.mark[0] || 0) + 1);
                    msg = "服从度上升了...但感觉不太对劲...";
                }
            } else {
                // 正常净化药水：清除所有负面效果
                c.cflag[CFLAGS.SPY_SENT] = 0;
                c.cflag[CFLAGS.SPY_TARGET] = 0;
                c.hp = Math.min(c.maxHp, c.hp + Math.floor(c.maxHp * 0.3));
                c.mp = Math.min(c.maxMp, c.mp + Math.floor(c.maxMp * 0.3));
                msg = "所有负面效果被清除，HP/MP大幅恢复";
            }
        }
        c.gear.items.splice(itemIndex, 1);
        return { success: true, msg: msg, cursed: item.cursed };
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