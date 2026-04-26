/**
 * ComboSystem — Route Synergy & Compound Label Generation
 * P5: Composite personality labels and route synergy bonuses
 */

// Route names
const ROUTE_NAMES = ["顺从", "欲望", "痛苦", "露出", "支配"];
const ROUTE_CORE_WORDS = [
    ["顺从的", "温顺的", "献身的", "忠犬般的", "神圣的"],      // 0: 顺从
    ["淫荡的", "贪求的", "饥渴的", "放荡的", "欲望的化身"],   // 1: 欲望
    ["受虐的", "沉溺痛的", "以痛为乐的", "痛苦的信徒", "苦行者"], // 2: 痛苦
    ["暴露的", "羞耻的", "展示的", "公开展示的", "羞耻心崩坏的"], // 3: 露出
    ["支配的", "强势的", "女王的", "绝对支配的", "霸权的"]    // 4: 支配
];

// ========== Dual Route Synergy (20 combos) ==========
const DUAL_ROUTE_SYNERGY = {
    "0+1": { name: "献身淫娃", desc: "顺从与欲望的融合，在侍奉中获得快感", bonus: { desireGain: 0.15, obedienceGain: 0.10, energyDrain: -0.05 } },
    "0+2": { name: "痛苦奴仆", desc: "以痛苦表达忠诚，越痛越顺从", bonus: { painGain: 0.15, obedienceGain: 0.15, staminaDrain: 0.05 } },
    "0+3": { name: "羞耻侍从", desc: "在暴露中保持恭顺，羞耻即是服从", bonus: { shameGain: 0.15, obedienceGain: 0.10, resistMod: -0.10 } },
    "0+4": { name: "代理支配者", desc: "代行主人意志，以支配表达忠诚", bonus: { dominanceGain: 0.10, obedienceGain: 0.10, assistantBuff: 0.15 } },
    "1+2": { name: "痛觉快感者", desc: "从痛苦中榨取快乐，痛即是乐", bonus: { painGain: 0.10, desireGain: 0.15, pleasureMult: 1.20 } },
    "1+3": { name: "羞耻欲女", desc: "在羞耻中燃烧欲望，越羞耻越饥渴", bonus: { shameGain: 0.15, desireGain: 0.15, energyDrain: -0.10 } },
    "1+4": { name: "欲望女王", desc: "以支配满足欲望，强制他人臣服于快感", bonus: { desireGain: 0.15, dominanceGain: 0.15, controlResist: -0.15 } },
    "2+3": { name: "公开受刑", desc: "在众人面前承受痛苦，羞耻加深痛苦", bonus: { painGain: 0.15, shameGain: 0.15, publicBonus: 0.20 } },
    "2+4": { name: "痛苦支配者", desc: "以痛苦支配他人，施虐的快感", bonus: { painGain: 0.10, dominanceGain: 0.15, smMult: 1.25 } },
    "3+4": { name: "羞耻女王", desc: "以暴露宣示支配，让他人在羞耻中臣服", bonus: { shameGain: 0.15, dominanceGain: 0.15, exposeBonus: 0.20 } }
};
// Fill symmetric entries
for (const key in DUAL_ROUTE_SYNERGY) {
    const rev = key.split('+').reverse().join('+');
    if (rev !== key && !DUAL_ROUTE_SYNERGY[rev]) {
        DUAL_ROUTE_SYNERGY[rev] = DUAL_ROUTE_SYNERGY[key];
    }
}

// ========== Triple Route Synergy (6 combos) ==========
const TRIPLE_ROUTE_SYNERGY = {
    "0+1+2": { name: "极乐殉道者", desc: "在痛苦与快乐中献上一切", bonus: { pleasureMult: 1.30, painGain: 0.10, obedienceGain: 0.10 } },
    "0+1+3": { name: "羞耻献身者", desc: "在羞耻与欲望中完全臣服", bonus: { desireGain: 0.15, shameGain: 0.15, obedienceGain: 0.10 } },
    "0+2+4": { name: "痛苦执行官", desc: "以痛苦执行支配，忠犬般的暴君", bonus: { painGain: 0.15, dominanceGain: 0.15, obedienceGain: 0.10 } },
    "1+2+3": { name: "羞耻痛觉奴", desc: "在羞耻,痛苦与欲望中迷失自我", bonus: { pleasureMult: 1.25, shameGain: 0.15, painGain: 0.10 } },
    "1+3+4": { name: "欲望展示者", desc: "以暴露与支配宣示无尽的欲望", bonus: { desireGain: 0.20, shameGain: 0.10, dominanceGain: 0.15 } },
    "2+3+4": { name: "公开处刑者", desc: "在众目睽睽下以痛苦确立支配", bonus: { painGain: 0.15, shameGain: 0.15, dominanceGain: 0.15, publicBonus: 0.25 } }
};

/**
 * Get the top N routes by level
 */
function getTopRoutes(chara, n = 3) {
    if (!chara || !chara.routeLevel) return [];
    const routes = chara.routeLevel.map((lv, id) => ({ id, level: lv || 0, exp: chara.routeExp ? (chara.routeExp[id] || 0) : 0 }));
    routes.sort((a, b) => b.level - a.level || b.exp - a.exp);
    return routes.slice(0, n).filter(r => r.level > 0);
}

/**
 * Generate compound label based on dominant routes
 * Format: [主路线核心词]+[辅A修饰]+[辅B点缀]
 */
function generateCompoundLabel(chara) {
    const top = getTopRoutes(chara, 3);
    if (top.length === 0) return "未开发的";
    if (top.length === 1) {
        const r = top[0];
        const words = ROUTE_CORE_WORDS[r.id];
        const word = words[Math.min(r.level, words.length - 1)] || words[0];
        return word + "奴隶";
    }

    // Main route core word
    const main = top[0];
    const mainWords = ROUTE_CORE_WORDS[main.id];
    const core = mainWords[Math.min(main.level, mainWords.length - 1)] || mainWords[0];

    // Secondary modifier
    const sec = top[1];
    const secWords = ROUTE_CORE_WORDS[sec.id];
    const modifier = secWords[Math.min(sec.level, secWords.length - 1)] || secWords[0];

    // Tertiary garnish (optional)
    let garnish = "";
    if (top.length >= 3) {
        const tri = top[2];
        const triWords = ROUTE_CORE_WORDS[tri.id];
        garnish = triWords[Math.min(tri.level, triWords.length - 1)] || triWords[0];
    }

    // Assemble: core + modifier + (garnish) + suffix
    const suffix = (main.level >= 4) ? "体" : "奴隶";
    if (garnish) {
        return `${core}${modifier.replace(/的$/, '')}${garnish}${suffix}`;
    }
    return `${core}${modifier}${suffix}`;
}

/**
 * Apply route synergy bonus to a character in given context
 * @param {Character} chara
 * @param {Object} context - { isPublic, isSM, isAssistant, sourceType }
 * @returns {Object} active bonuses
 */
function applyRouteSynergy(chara, context) {
    if (!chara || !chara.routeLevel) return { bonuses: [], multiplier: 1.0 };
    const top = getTopRoutes(chara, 3);
    if (top.length < 2) return { bonuses: [], multiplier: 1.0 };

    const ids = top.map(r => r.id).sort((a, b) => a - b);
    let synergy = null;

    if (ids.length >= 3) {
        const tripleKey = ids.slice(0, 3).join('+');
        synergy = TRIPLE_ROUTE_SYNERGY[tripleKey];
    }
    if (!synergy && ids.length >= 2) {
        const dualKey = ids[0] + '+' + ids[1];
        synergy = DUAL_ROUTE_SYNERGY[dualKey];
    }

    if (!synergy) return { bonuses: [], multiplier: 1.0 };

    const bonus = synergy.bonus;
    let mult = 1.0;
    const active = [];

    if (bonus.pleasureMult) {
        mult *= bonus.pleasureMult;
        active.push(`快感x${bonus.pleasureMult}`);
    }
    if (context && context.isPublic && bonus.publicBonus) {
        mult *= (1 + bonus.publicBonus);
        active.push(`公开+${Math.floor(bonus.publicBonus * 100)}%`);
    }
    if (context && context.isSM && bonus.smMult) {
        mult *= bonus.smMult;
        active.push(`SMx${bonus.smMult}`);
    }
    if (context && context.isAssistant && bonus.assistantBuff) {
        mult *= (1 + bonus.assistantBuff);
        active.push(`助手+${Math.floor(bonus.assistantBuff * 100)}%`);
    }
    if (bonus.obedienceGain) active.push(`顺从+${Math.floor(bonus.obedienceGain * 100)}%`);
    if (bonus.desireGain) active.push(`欲望+${Math.floor(bonus.desireGain * 100)}%`);
    if (bonus.painGain) active.push(`痛苦+${Math.floor(bonus.painGain * 100)}%`);
    if (bonus.shameGain) active.push(`露出+${Math.floor(bonus.shameGain * 100)}%`);
    if (bonus.dominanceGain) active.push(`支配+${Math.floor(bonus.dominanceGain * 100)}%`);

    return {
        name: synergy.name,
        desc: synergy.desc,
        bonuses: active,
        multiplier: mult,
        raw: bonus
    };
}

/**
 * Get a short synergy name for UI display
 */
function getSynergyLabel(chara) {
    const top = getTopRoutes(chara, 2);
    if (top.length < 2) return null;
    const ids = top.map(r => r.id).sort((a, b) => a - b);
    const dualKey = ids[0] + '+' + ids[1];
    const synergy = DUAL_ROUTE_SYNERGY[dualKey];
    return synergy ? synergy.name : null;
}

// Global exports
window.ROUTE_NAMES = ROUTE_NAMES;
window.ROUTE_CORE_WORDS = ROUTE_CORE_WORDS;
window.DUAL_ROUTE_SYNERGY = DUAL_ROUTE_SYNERGY;
window.TRIPLE_ROUTE_SYNERGY = TRIPLE_ROUTE_SYNERGY;
window.getTopRoutes = getTopRoutes;
window.generateCompoundLabel = generateCompoundLabel;
window.applyRouteSynergy = applyRouteSynergy;
window.getSynergyLabel = getSynergyLabel;
