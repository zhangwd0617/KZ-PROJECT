/**
 * OrgasmSystem.js - 8-Part Climax System
 * C/V/A/B/N/O/W/P gauges -> total orgasm gauge -> climax types
 */

// ========== 8 Parts ==========
const ORGASM_PARTS = [
    { code: "C", name: "\u9634\u6838",    index: 0, baseSensitivity: 1.0, palamSource: 0, ablId: 0, uiColor: "#e06c75", weight: 1.0 },
    { code: "V", name: "\u9634\u9053",    index: 1, baseSensitivity: 1.0, palamSource: 1, ablId: 2, uiColor: "#c678dd", weight: 1.0 },
    { code: "A", name: "\u809b\u95e8",    index: 2, baseSensitivity: 0.8, palamSource: 2, ablId: 3, uiColor: "#e5c07b", weight: 0.9 },
    { code: "B", name: "\u4e73\u623f",    index: 3, baseSensitivity: 0.9, palamSource: 14, ablId: 1, uiColor: "#61afef", weight: 0.8 },
    { code: "N", name: "\u4e73\u5934",    index: 4, baseSensitivity: 1.1, palamSource: 14, ablId: 1, uiColor: "#61afef", weight: 0.9 },
    { code: "O", name: "\u53e3\u8154",    index: 5, baseSensitivity: 0.9, palamSource: 15, ablId: 4, uiColor: "#98c379", weight: 0.7 },
    { code: "W", name: "\u5b50\u5bab",    index: 6, baseSensitivity: 1.2, palamSource: 1, ablId: 2, uiColor: "#c678dd", weight: 1.1 },
    { code: "P", name: "\u5fc3\u7406",    index: 7, baseSensitivity: 0.7, palamSource: 6, ablId: 11, uiColor: "#9370DB", weight: 0.6 }
];

const ORGASM_PART_CODE_MAP = { C: 0, V: 1, A: 2, B: 3, N: 4, O: 5, W: 6, P: 7 };

// ========== 8 Climax Types ==========
const ORGASM_TYPES = {
    0: { name: "C\u7edd\u9876",  parts: [0],     juelGain: { 5: 80 },   staminaCost: 5,  energyCost: 8,  exp: { 34: 3 }, desc: "\u9634\u6838\u7edd\u9876", special: "nextTurnCSensitivity" },
    1: { name: "V\u7edd\u9876",  parts: [1],     juelGain: { 5: 100 },  staminaCost: 8,  energyCost: 10, exp: { 0: 5 },  desc: "\u9634\u9053\u7edd\u9876", special: "lubrication" },
    2: { name: "A\u7edd\u9876",  parts: [2],     juelGain: { 5: 90, 8: 30 }, staminaCost: 8, energyCost: 12, exp: { 1: 5 }, desc: "\u809b\u95e8\u7edd\u9876" },
    3: { name: "B\u7edd\u9876",  parts: [3, 4],  juelGain: { 5: 70 },   staminaCost: 5,  energyCost: 6,  exp: { 35: 3 }, desc: "\u4e73\u623f/\u4e73\u5934\u7edd\u9876" },
    4: { name: "N\u7edd\u9876",  parts: [4],     juelGain: { 5: 75 },   staminaCost: 5,  energyCost: 7,  exp: { 35: 4 }, desc: "\u4e73\u5934\u7edd\u9876" },
    5: { name: "O\u7edd\u9876",  parts: [5],     juelGain: { 5: 60 },   staminaCost: 4,  energyCost: 5,  exp: { 22: 3 }, desc: "\u53e3\u8154\u7edd\u9876" },
    6: { name: "W\u7edd\u9876",  parts: [6],     juelGain: { 5: 120 },  staminaCost: 12, energyCost: 15, exp: { 0: 8 },  desc: "\u5b50\u5bab\u7edd\u9876", special: "nextTurnPalamBoost" },
    7: { name: "P\u7edd\u9876",  parts: [7],     juelGain: { 5: 50 },   staminaCost: 3,  energyCost: 5,  exp: { 2: 3 },  desc: "\u5fc3\u7406\u7edd\u9876", special: "mentalBoost" }
};

// ========== Charge Levels ==========
const CHARGE_LEVELS = {
    0: { name: "",        threshold: 0,   multiplier: 1.0, risk: 0 },
    1: { name: "C1",      threshold: 1000, multiplier: 1.5, risk: 0, desc: "\u84c4\u529b\u9636\u6bb51\uff0c\u7edd\u9876\u5f3a\u5ea6x1.5" },
    2: { name: "C2",      threshold: 1500, multiplier: 2.2, risk: 0.20, desc: "\u84c4\u529b\u9636\u6bb52\uff0c\u7edd\u9876\u5f3a\u5ea6x2.2\uff0c20%\u98ce\u9669\u98a4\u6296" },
    3: { name: "C3",      threshold: 2000, multiplier: 3.0, risk: 0.30, desc: "\u84c4\u529b\u9636\u6bb53\uff0c\u7edd\u9876\u5f3a\u5ea6x3.0\uff0c30%\u98ce\u9669\u5931\u795e" },
    4: { name: "OC",      threshold: 3000, multiplier: 4.0, risk: 0.50, desc: "Overcharge\uff01\u7edd\u9876\u5f3a\u5ea6x4.0\uff0c50%\u98ce\u9669\u5d29\u574f\u91ca\u653e" }
};

// ========== Combo Orgasms ==========
// 双部位倍率取文档 Charge1 值；三重/四重/五重为固定倍率
const COMBO_ORGASMS = {
    // Dual combos
    "C+V": { name: "\u82af\u82b1\u7efd\u653e",     parts: [0,1],   multiplier: 1.6, desc: "\u9634\u8487+\u9634\u9053\u53cc\u91cd\u7edd\u9876" },
    "C+A": { name: "\u524d\u540e\u5939\u51fb",     parts: [0,2],   multiplier: 1.5, desc: "\u9634\u8487+\u809b\u95e8\u53cc\u91cd\u7edd\u9876" },
    "C+B": { name: "\u4e0a\u4e0b\u9f50\u9e23",     parts: [0,3],   multiplier: 1.5, desc: "\u9634\u8487+\u4e73\u623f\u53cc\u91cd\u7edd\u9876" },
    "V+W": { name: "\u6df1\u5904\u89c9\u9192",     parts: [1,6],   multiplier: 1.7, desc: "\u9634\u9053+\u5b50\u5bab\u6df1\u5c42\u7edd\u9876" },
    "V+A": { name: "\u53cc\u7a74\u540c\u6f6e",     parts: [1,2],   multiplier: 1.6, desc: "\u9634\u9053+\u809b\u95e8\u53cc\u91cd\u7edd\u9876" },
    "B+N": { name: "\u4e73\u9996\u72c2\u6f6e",     parts: [3,4],   multiplier: 1.4, desc: "\u4e73\u623f+\u4e73\u5934\u53cc\u91cd\u7edd\u9876" },
    "O+P": { name: "\u53e3\u5fc3\u540c\u8c03",     parts: [5,7],   multiplier: 1.5, desc: "\u53e3\u8154+\u5fc3\u7406\u53cc\u91cd\u7edd\u9876" },
    "P+ANY": { name: "\u5fc3\u8eab\u5408\u4e00",   parts: [7],     multiplier: 1.3, desc: "\u5fc3\u7406+\u4efb\u610f\u90e8\u4f4d\u534f\u540c" },
    // Triple combos
    "C+V+W": { name: "\u82af\u82b1\u6df1\u5904\u5168\u5f00", parts: [0,1,6], multiplier: 3.0, desc: "\u9634\u8487+\u9634\u9053+\u5b50\u5bab\u4e09\u91cd\u7edd\u9876" },
    "C+V+A": { name: "\u4e09\u7a74\u9f50\u9e23",   parts: [0,1,2], multiplier: 3.2, desc: "\u4e09\u7a74\u540c\u65f6\u7edd\u9876" },
    "B+N+O": { name: "\u4f8d\u5949\u7edd\u9876",   parts: [3,4,5], multiplier: 2.8, desc: "\u4e73\u623f+\u4e73\u5934+\u53e3\u8154\u4e09\u91cd\u7edd\u9876" },
    "C+B+P": { name: "\u7f9e\u803b\u5feb\u4e50\u540c\u8c03", parts: [0,3,7], multiplier: 2.5, desc: "\u9634\u8487+\u4e73\u623f+\u5fc3\u7406\u4e09\u91cd\u7edd\u9876" },
    "V+W+P": { name: "\u5b50\u5bab\u670d\u4ece",   parts: [1,6,7], multiplier: 3.0, desc: "\u9634\u9053+\u5b50\u5bab+\u5fc3\u7406\u4e09\u91cd\u7edd\u9876" },
    // Full body resonance (4+ parts)
    "FULL":  { name: "\u5168\u8eab\u5171\u9e23",     parts: [0,1,2,3,4,5], minParts: 4, multiplier: 4.0, desc: "\u56db\u90e8\u4f4d\u4ee5\u4e0a\u540c\u65f6\u7edd\u9876\uff0c\u654f\u611f\u5ea6\u6c38\u4e45+0.03" },
    // Ultimate awakening (5+ parts or all)
    "ULTIMATE": { name: "\u6781\u4e50\u89c9\u9192", parts: [0,1,2,3,4,5,6,7], minParts: 5, multiplier: 5.0, desc: "\u4e94\u90e8\u4f4d\u4ee5\u4e0a\u7edd\u9876\u89e6\u53d1\u6781\u4e50\u89c9\u9192\uff0c\u83b7\u5f97\u300c\u5168\u89c9\u4e4b\u4f53\u300d" }
};

// ========== Ejaculation Types ==========
// 与8种绝顶类型对应（C~P），数值与绝顶效果一致
const EJACULATION_TYPES = {
    0: { name: "C\u5c04\u7cbe", linkedPart: 0, juelGain: { 5: 80 },   staminaCost: 5,  exp: { 34: 3 }, desc: "\u9634\u8487\u523a\u6fc0\u5bfc\u81f4\u5c04\u7cbe" },
    1: { name: "V\u5c04\u7cbe", linkedPart: 1, juelGain: { 5: 100 },  staminaCost: 8,  exp: { 0: 5 },  desc: "\u9634\u9053\u5185\u5c04\u7cbe" },
    2: { name: "A\u5c04\u7cbe", linkedPart: 2, juelGain: { 5: 90, 8: 30 }, staminaCost: 8, exp: { 1: 5 },  desc: "\u809b\u95e8\u5185\u5c04\u7cbe" },
    3: { name: "B\u5c04\u7cbe", linkedPart: 3, juelGain: { 5: 70 },   staminaCost: 5,  exp: { 35: 3 }, desc: "\u4e73\u623f\u5c04\u7cbe" },
    4: { name: "N\u5c04\u7cbe", linkedPart: 4, juelGain: { 5: 75 },   staminaCost: 5,  exp: { 35: 4 }, desc: "\u4e73\u5934\u5c04\u7cbe" },
    5: { name: "O\u5c04\u7cbe", linkedPart: 5, juelGain: { 5: 60 },   staminaCost: 4,  exp: { 22: 3 }, desc: "\u53e3\u8154\u5c04\u7cbe" },
    6: { name: "W\u5c04\u7cbe", linkedPart: 6, juelGain: { 5: 120 },  staminaCost: 12, exp: { 0: 8 },  desc: "\u5b50\u5bab\u5185\u5c04\u7cbe" },
    7: { name: "P\u5c04\u7cbe", linkedPart: 7, juelGain: { 5: 50 },   staminaCost: 3,  exp: { 2: 3 },  desc: "\u5fc3\u7406\u5c04\u7cbe" }
};

// ========== Core Functions ==========

function calculateTotalGauge(chara) {
    if (!chara || !chara.partGauge) return 0;
    let total = 0;
    for (let i = 0; i < 8; i++) {
        const part = ORGASM_PARTS[i];
        const val = chara.partGauge[i] || 0;
        total += val * part.weight;
    }
    // 文档: 总高潮槽 0~1000，满1000=100%
    chara.totalOrgasmGauge = Math.min(1000, Math.floor(total));
    return chara.totalOrgasmGauge;
}

function getChargeLevel(chara) {
    const gauge = chara.totalOrgasmGauge || 0;
    if (gauge >= 3000) return 4;
    if (gauge >= 2000) return 3;
    if (gauge >= 1500) return 2;
    if (gauge >= 1000) return 1;
    return 0;
}

function checkOrgasm(chara) {
    if (!chara) return null;
    const gauge = calculateTotalGauge(chara);
    const chargeLv = getChargeLevel(chara);
    const chargeInfo = CHARGE_LEVELS[chargeLv];

    // 文档: 总槽满1000=100%触发绝顶
    if (gauge < 1000) return null;

    // 主导部位 = 快感最高的部位
    const dom = chara.getDominantPart ? chara.getDominantPart() : { index: 0, value: 0 };

    // 活跃部位: 快感>=400 的部位（用于协同判断）
    const activeParts = [];
    for (let i = 0; i < 8; i++) {
        if ((chara.partGauge[i] || 0) >= 400) activeParts.push(i);
    }
    // 确保主导部位包含在活跃列表中
    if (!activeParts.includes(dom.index)) {
        activeParts.push(dom.index);
        activeParts.sort((a, b) => a - b);
    }

    // Determine combo
    const combo = _resolveCombo(activeParts, chargeLv);

    return {
        canClimax: true,
        gauge,
        chargeLv,
        chargeInfo,
        activeParts,
        combo,
        multiplier: (combo ? combo.multiplier : 1.0) * (chargeInfo ? chargeInfo.multiplier : 1.0)
    };
}

function _resolveCombo(activeParts, chargeLv) {
    const n = activeParts.length;
    if (n >= 5) return COMBO_ORGASMS["ULTIMATE"];
    if (n >= 4) return COMBO_ORGASMS["FULL"];
    if (n === 0) return null;

    // Sort and create key
    const sorted = [...activeParts].sort((a, b) => a - b);
    const codes = sorted.map(i => ORGASM_PARTS[i].code);

    // Special: P + any other single part (dual combo)
    if (n === 2 && sorted.includes(7)) {
        return COMBO_ORGASMS["P+ANY"];
    }

    // Check exact matches
    for (const key in COMBO_ORGASMS) {
        if (key === "FULL" || key === "ULTIMATE" || key === "P+ANY") continue;
        const combo = COMBO_ORGASMS[key];
        if (!combo.parts) continue;
        if (combo.parts.length === n && combo.parts.every(p => sorted.includes(p))) {
            return combo;
        }
    }

    // Fallback: dual combo with first two active parts
    if (n >= 2) {
        const fallbackKey = codes[0] + "+" + codes[1];
        for (const key in COMBO_ORGASMS) {
            if (key.includes(codes[0]) && key.includes(codes[1]) && COMBO_ORGASMS[key].parts.length === 2) {
                return COMBO_ORGASMS[key];
            }
        }
    }

    return null;
}

function applyOrgasm(chara, result) {
    if (!chara || !result) return null;

    // V7.0: 初次高潮记录 + 连续绝顶计数
    const _game = (typeof G !== 'undefined') ? G : ((typeof game !== 'undefined') ? game : null);
    if (_game && _game._recordSexualFirst && _game._incrementTitleStat) {
        const master = _game.getMaster ? _game.getMaster() : null;
        _game._recordSexualFirst(chara, 'firstOrgasm', master, 'train');
        _game._incrementTitleStat(chara, 'orgasmCount');
    }
    // 连续绝顶计数 + 本次调教高潮计数
    const currentTurn = _game ? _game.trainCount : 0;
    if (chara.lastOrgasmTurn === currentTurn - 1) {
        chara.consecutiveOrgasmCount = (chara.consecutiveOrgasmCount || 0) + 1;
    } else {
        chara.consecutiveOrgasmCount = 1;
    }
    chara.lastOrgasmTurn = currentTurn;
    chara.sessionOrgasmCount = (chara.sessionOrgasmCount || 0) + 1;

    const combo = result.combo;

    // 各部位绝顶计数
    const climaxedPartsForCount = combo ? combo.parts : (result.activeParts || []);
    chara.partOrgasmCount = chara.partOrgasmCount || new Array(8).fill(0);
    for (const pi of climaxedPartsForCount) {
        if (pi >= 0 && pi < 8) chara.partOrgasmCount[pi] = (chara.partOrgasmCount[pi] || 0) + 1;
    }
    const chargeLv = result.chargeLv || 0;
    const chargeInfo = result.chargeInfo;
    const multiplier = result.multiplier || 1.0;

    // Determine base orgasm type from dominant part (before reset)
    const dom = chara.getDominantPart ? chara.getDominantPart() : { index: result.activeParts[0] || 0 };
    const baseTypeId = dom.index >= 0 && dom.index <= 7 ? dom.index : 0;
    const baseType = ORGASM_TYPES[baseTypeId] || ORGASM_TYPES[0];

    // Apply stamina/energy costs
    const stmCost = Math.floor((baseType.staminaCost + (combo ? 10 : 0)) * multiplier);
    let nrgCost = Math.floor((baseType.energyCost + (combo ? 5 : 0)) * multiplier);
    // V7.3: 气力消耗阶梯修正（高潮同样受影响）
    if (_game && _game._calcEnergyDrainMultiplier) {
        nrgCost = Math.floor(nrgCost * _game._calcEnergyDrainMultiplier(chara, null));
    }
    chara.stamina = (chara.stamina || 0) - stmCost;
    chara.energy = (chara.energy || 0) - nrgCost;

    // Apply JUEL gains
    for (const juelType in baseType.juelGain) {
        const gain = Math.floor(baseType.juelGain[juelType] * multiplier);
        chara.juel[parseInt(juelType)] = (chara.juel[parseInt(juelType)] || 0) + gain;
    }

    // Apply EXP
    for (const expId in baseType.exp) {
        chara.exp[parseInt(expId)] = (chara.exp[parseInt(expId)] || 0) + baseType.exp[expId];
    }

    // === Special effects per orgasm type ===
    switch (baseTypeId) {
        case 0: // C绝顶: 下回合C敏感度+10%
            chara._nextTurnCSensitivityBoost = 0.10;
            break;
        case 1: // V绝顶: 润滑+200
            if (chara.addPalam) chara.addPalam(3, 200);
            break;
        case 6: // W绝顶: 下回合全PALAM起始+100
            chara._nextTurnPalamBoost = 100;
            break;
        case 7: // P绝顶: 恭顺/屈服/羞耻+40
            if (chara.addPalam) {
                chara.addPalam(4, 40);
                chara.addPalam(6, 40);
                chara.addPalam(8, 40);
            }
            break;
    }

    // === FULL / ULTIMATE combo special effects ===
    if (combo) {
        if (combo.name === "\u5168\u8eab\u5171\u9e23") {
            // 4部位+: 全部位敏感度永久+0.03
            chara._sensitivityMultipliers = chara._sensitivityMultipliers || {};
            for (let i = 0; i < 8; i++) {
                chara._sensitivityMultipliers[i] = (chara._sensitivityMultipliers[i] || 1.0) + 0.03;
            }
        } else if (combo.name === "\u6781\u4e50\u89c9\u9192") {
            // 5部位+: 全部位敏感度永久+0.15，获得「全觉之体」
            chara._sensitivityMultipliers = chara._sensitivityMultipliers || {};
            for (let i = 0; i < 8; i++) {
                chara._sensitivityMultipliers[i] = (chara._sensitivityMultipliers[i] || 1.0) + 0.15;
            }
            chara._hasUltimateBody = true;
            chara.talent[291] = 1; // 全觉之体素质
        }
        // 三重绝顶: 20%概率获得【多重绝顶】本session buff
        if (combo.parts && combo.parts.length === 3 && Math.random() < 0.20) {
            chara._hasMultipleOrgasm = true;
        }
    }

    // === NEW (P2-3): Orgasm resonance - other parts gain gauge ===
    const resonance = chara._accelOrgasmResonance || 0;
    const climaxedParts = combo ? combo.parts : (result.activeParts || []);
    if (resonance > 0 && chara.partGauge) {
        for (let i = 0; i < 8; i++) {
            if (!climaxedParts.includes(i)) {
                chara.partGauge[i] = Math.floor((chara.partGauge[i] || 0) * (1 + resonance));
            }
        }
    }

    // Reset gauge: 主导部位归零，其他保留50%，不应期按适应系统计算
    const domIdx = dom.index;
    const cdTurns = (typeof calculateCooldown === 'function') ? calculateCooldown(chara) : 2.0;
    if (chara.partGauge) {
        chara.partGauge[domIdx] = 0;
        chara.orgasmCooldown[domIdx] = cdTurns;
        for (let i = 0; i < 8; i++) {
            if (i !== domIdx && (chara.partGauge[i] || 0) > 0) {
                chara.partGauge[i] = Math.floor(chara.partGauge[i] * 0.5);
                // 只有参与了绝顶的部位进入不应期
                if (climaxedParts.includes(i)) {
                    chara.orgasmCooldown[i] = cdTurns;
                }
            }
        }
    }

    // === NEW (P3-3): Hidden trait progress from orgasm ===
    if (typeof addHiddenTraitProgress === 'function') {
        addHiddenTraitProgress(chara, 5 + Math.floor(Math.random() * 6)); // +5~10
    }

    // Reset total gauge
    calculateTotalGauge(chara);

    // Risk check for overcharge
    if (chargeInfo && chargeInfo.risk > 0 && Math.random() < chargeInfo.risk) {
        return {
            type: baseTypeId,
            combo,
            multiplier,
            riskTriggered: true,
            riskType: chargeLv >= 4 ? "ultimate_awakening" : "loss_of_control",
            msg: chargeLv >= 4
                ? `【${chara.name}\u89e6\u53d1\u4e86\u6781\u4e50\u89c9\u9192\uff01\u83b7\u5f97\u300c\u5168\u89c9\u4e4b\u4f53\u300d\u7d20\u8d28\uff01】`
                : `【${chara.name}\u5728\u84c4\u529b\u4e2d\u5931\u63a7\u4e86\uff01】`
        };
    }

    chara.lastOrgasmType = baseTypeId;
    // === NEW (P5): Personality orgasm line ===
    const partCode = (typeof ORGASM_PARTS !== 'undefined' && ORGASM_PARTS[baseTypeId]) ? ORGASM_PARTS[baseTypeId].code : 'C';
    const line = (typeof getOrgasmLine === 'function') ? getOrgasmLine(chara, partCode) : '';
    return {
        type: baseTypeId,
        combo,
        multiplier,
        riskTriggered: false,
        msg: combo
            ? `【${chara.name}\u89e6\u53d1\u4e86${combo.name}\uff01(\u500d\u7387x${multiplier.toFixed(1)})】`
            : `【${chara.name}\u8fbe\u5230\u4e86${baseType.name}\uff01】`,
        line
    };
}

function checkEjaculation(chara) {
    if (!chara || !chara.genitalConfig || !chara.genitalConfig.penises || chara.genitalConfig.penises.length === 0) return null;
    const results = [];
    for (const penis of chara.genitalConfig.penises) {
        if (penis.ejaculationGauge >= 1000) {
            results.push({ penisId: penis.id, linkedParts: penis.linkedParts || [] });
        }
    }
    return results.length > 0 ? results : null;
}

function applyEjaculation(chara, ejResults) {
    if (!chara || !ejResults) return [];
    const msgs = [];
    for (const ej of ejResults) {
        const penis = chara.genitalConfig.penises.find(p => p.id === ej.penisId);
        if (!penis) continue;

        // Determine ejaculation type from linked parts (match first)
        let typeId = 7;
        const linked = ej.linkedParts || penis.linkedParts || [];
        for (let t = 0; t < 8; t++) {
            const typeDef = EJACULATION_TYPES[t];
            if (typeDef && linked.includes(ORGASM_PARTS[typeDef.linkedPart].code)) {
                typeId = t;
                break;
            }
        }
        const type = EJACULATION_TYPES[typeId] || EJACULATION_TYPES[7];

        // 连续射精递减
        penis.ejaculationCount = (penis.ejaculationCount || 0) + 1;
        const count = penis.ejaculationCount;
        const decayMult = count === 1 ? 1.0 : (count === 2 ? 0.7 : (count === 3 ? 0.4 : 0.2));

        const syncMult = ej._syncPleasure ? 2.5 : 1.0;
        chara.stamina = (chara.stamina || 0) - Math.floor(type.staminaCost * decayMult * syncMult);
        for (const jt in type.juelGain) {
            const gain = Math.floor(type.juelGain[jt] * decayMult * syncMult);
            chara.juel[parseInt(jt)] = (chara.juel[parseInt(jt)] || 0) + gain;
        }
        // Apply EXP
        for (const expId in type.exp) {
            chara.exp[parseInt(expId)] = (chara.exp[parseInt(expId)] || 0) + type.exp[expId];
        }
        // Reset penis gauge
        penis.ejaculationGauge = 0;
        penis.lastEjaculation = (typeof G !== 'undefined') ? G.trainCount : 0;
        msgs.push(`【${chara.name}\u7684${penis.name}\u5c04\u7cbe\u4e86\uff01(${type.name}, ${count}\u6b21\u76ee, \u6548\u679c${Math.floor(decayMult*100)}%)】`);
    }
    return msgs;
}

function checkComboPreview(chara) {
    const preview = checkOrgasm(chara);
    if (!preview || !preview.canClimax) return null;
    return preview.combo;
}

function addPenisEjaculationGauge(chara, partCodeOrPenisId, value) {
    if (!chara || !chara.genitalConfig || !chara.genitalConfig.penises) return;
    // Support penisId (number) direct injection
    if (typeof partCodeOrPenisId === 'number') {
        const penis = chara.genitalConfig.penises.find(p => p.id === partCodeOrPenisId);
        if (penis) {
            penis.ejaculationGauge = Math.min(1000, (penis.ejaculationGauge || 0) + value);
        }
        return;
    }
    // Original: match by partCode
    for (const penis of chara.genitalConfig.penises) {
        const linked = penis.linkedParts || [];
        if (linked.includes(partCodeOrPenisId)) {
            penis.ejaculationGauge = Math.min(1000, (penis.ejaculationGauge || 0) + value);
        }
    }
}

function tickOrgasmCooldown(chara) {
    if (!chara || !chara.orgasmCooldown) return;
    for (let i = 0; i < 8; i++) {
        if (chara.orgasmCooldown[i] > 0) chara.orgasmCooldown[i] -= 1.0;
        if (chara.orgasmCooldown[i] < 0) chara.orgasmCooldown[i] = 0;
    }
}

// ========== ABL Multiplier Table ==========
// 文档: 0级×0.6 / 1级×0.8 / 2级×1.0 / 3级×1.2 / 4级×1.4 / 5级×1.6
function getAblMultiplier(ablLevel) {
    const table = [0.6, 0.8, 1.0, 1.2, 1.4, 1.6];
    return table[Math.min(Math.max(ablLevel || 0, 0), 5)];
}

// ========== Cooldown Adaptation System ==========
// 文档: 基础2回合，多种条件可缩短，最低0.25回合
function calculateCooldown(chara) {
    let cd = 2.0;

    // ABL缩短: 取全部位ABL最高值
    let maxAbl = 0;
    for (let i = 0; i < 8; i++) {
        const ablLv = chara.abl[ORGASM_PARTS[i].ablId] || 0;
        if (ablLv > maxAbl) maxAbl = ablLv;
    }
    if (maxAbl >= 5) cd -= 1.5;
    else if (maxAbl >= 3) cd -= 1.0;

    // 素质缩短
    if (chara.talent[291]) cd -= 1.0;      // 全觉之体
    if (chara.talent[272]) cd -= 1.0;      // 淫魔
    // TODO: 【多重绝顶】素质待定义，暂用标记
    if (chara._hasMultipleOrgasm) cd -= 0.5;

    // 连续绝顶3+: 每次-0.3
    const consec = chara.consecutiveOrgasmCount || 0;
    if (consec >= 3) {
        cd -= 0.3 * (consec - 2);
    }

    return Math.max(0.25, cd);
}

// Global exports
window.ORGASM_PARTS = ORGASM_PARTS;
window.ORGASM_PART_CODE_MAP = ORGASM_PART_CODE_MAP;
window.ORGASM_TYPES = ORGASM_TYPES;
window.CHARGE_LEVELS = CHARGE_LEVELS;
window.COMBO_ORGASMS = COMBO_ORGASMS;
window.EJACULATION_TYPES = EJACULATION_TYPES;
window.calculateTotalGauge = calculateTotalGauge;
window.getChargeLevel = getChargeLevel;
window.checkOrgasm = checkOrgasm;
window.applyOrgasm = applyOrgasm;
window.checkEjaculation = checkEjaculation;
window.applyEjaculation = applyEjaculation;
window.checkComboPreview = checkComboPreview;
window.addPenisEjaculationGauge = addPenisEjaculationGauge;
window.tickOrgasmCooldown = tickOrgasmCooldown;
window.getAblMultiplier = getAblMultiplier;
window.calculateCooldown = calculateCooldown;
