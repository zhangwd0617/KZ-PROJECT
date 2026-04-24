/**
 * OrgasmSystem.js - 8-Part Climax System
 * C/V/A/B/N/O/W/P gauges -> total orgasm gauge -> climax types
 */

// ========== 8 Parts ==========
const ORGASM_PARTS = [
    { code: "C", name: "\u9634\u6838",    index: 0, baseSensitivity: 1.0, palamSource: 0, ablId: 0, uiColor: "#e06c75", weight: 1.0 },
    { code: "V", name: "\u9634\u9053",    index: 1, baseSensitivity: 1.0, palamSource: 1, ablId: 2, uiColor: "#c678dd", weight: 1.2 },
    { code: "A", name: "\u809b\u95e8",    index: 2, baseSensitivity: 0.8, palamSource: 2, ablId: 3, uiColor: "#e5c07b", weight: 1.0 },
    { code: "B", name: "\u4e73\u623f",    index: 3, baseSensitivity: 0.9, palamSource: 3, ablId: 1, uiColor: "#61afef", weight: 0.9 },
    { code: "N", name: "\u4e73\u5934",    index: 4, baseSensitivity: 1.0, palamSource: 3, ablId: 1, uiColor: "#61afef", weight: 0.8 },
    { code: "O", name: "\u53e3\u8154",    index: 5, baseSensitivity: 0.7, palamSource: 4, ablId: 4, uiColor: "#98c379", weight: 0.7 },
    { code: "W", name: "\u5b50\u5bab",    index: 6, baseSensitivity: 1.2, palamSource: 1, ablId: 2, uiColor: "#c678dd", weight: 1.5 },
    { code: "P", name: "\u9634\u830e",    index: 7, baseSensitivity: 1.0, palamSource: 0, ablId: 0, uiColor: "#e06c75", weight: 1.0 }
];

const ORGASM_PART_CODE_MAP = { C: 0, V: 1, A: 2, B: 3, N: 4, O: 5, W: 6, P: 7 };

// ========== 8 Climax Types ==========
const ORGASM_TYPES = {
    0: { name: "C\u7edd\u9876",  parts: [0],     juelGain: { 0: 500 },  staminaCost: 20, energyCost: 10, exp: { 2: 1 }, desc: "\u9634\u6838\u7edd\u9876" },
    1: { name: "V\u7edd\u9876",  parts: [1],     juelGain: { 1: 600 },  staminaCost: 30, energyCost: 15, exp: { 0: 1 }, desc: "\u9634\u9053\u7edd\u9876" },
    2: { name: "A\u7edd\u9876",  parts: [2],     juelGain: { 2: 500 },  staminaCost: 25, energyCost: 12, exp: { 1: 1 }, desc: "\u809b\u95e8\u7edd\u9876" },
    3: { name: "B\u7edd\u9876",  parts: [3, 4],  juelGain: { 14: 400 }, staminaCost: 15, energyCost: 8,  exp: { 54: 1 }, desc: "\u4e73\u623f/\u4e73\u5934\u7edd\u9876" },
    4: { name: "O\u7edd\u9876",  parts: [5],     juelGain: { 15: 400 }, staminaCost: 15, energyCost: 8,  exp: { 22: 1 }, desc: "\u53e3\u8154\u7edd\u9876" },
    5: { name: "W\u7edd\u9876",  parts: [6],     juelGain: { 1: 800 },  staminaCost: 35, energyCost: 18, exp: { 0: 2 }, desc: "\u5b50\u5bab\u7edd\u9876" },
    6: { name: "P\u5c04\u7cbe",  parts: [7],     juelGain: { 11: 500 }, staminaCost: 20, energyCost: 15, exp: { 3: 1 }, desc: "\u9634\u830e\u5c04\u7cbe" },
    7: { name: "\u5168\u8eab\u7edd\u9876", parts: [0,1,2,3,4,5], juelGain: { 0:300,1:300,2:300,14:300,15:300 }, staminaCost: 50, energyCost: 30, exp: { 2: 3 }, desc: "\u5168\u8eab\u5171\u9e23\u7edd\u9876" }
};

// ========== Charge Levels ==========
const CHARGE_LEVELS = {
    0: { name: "",        threshold: 0,   multiplier: 1.0, risk: 0 },
    1: { name: "C1",      threshold: 100, multiplier: 1.5, risk: 0, desc: "\u84c4\u529b\u9636\u6bb51\uff0c\u7edd\u9876\u5f3a\u5ea6x1.5" },
    2: { name: "C2",      threshold: 200, multiplier: 2.2, risk: 0.05, desc: "\u84c4\u529b\u9636\u6bb52\uff0c\u7edd\u9876\u5f3a\u5ea6x2.2\uff0c5%\u98ce\u9669\u5931\u63a7" },
    3: { name: "C3",      threshold: 350, multiplier: 3.0, risk: 0.15, desc: "\u84c4\u529b\u9636\u6bb53\uff0c\u7edd\u9876\u5f3a\u5ea6x3.0\uff0c15%\u98ce\u9669\u5931\u63a7" },
    4: { name: "OC",      threshold: 500, multiplier: 4.0, risk: 0.35, desc: "Overcharge\uff01\u7edd\u9876\u5f3a\u5ea6x4.0\uff0c35%\u98ce\u9669\u5d29\u574f\u6216\u6781\u4e50\u89c9\u9192" }
};

// ========== Combo Orgasms ==========
const COMBO_ORGASMS = {
    // Dual combos
    "C+V": { name: "\u53cc\u91cd\u5feb\u611f",     parts: [0,1],   multiplier: 1.5, desc: "\u9634\u6838+\u9634\u9053\u53cc\u91cd\u7edd\u9876" },
    "C+A": { name: "\u524d\u540e\u5939\u51fb",     parts: [0,2],   multiplier: 1.5, desc: "\u9634\u6838+\u809b\u95e8\u53cc\u91cd\u7edd\u9876" },
    "V+A": { name: "\u53cc\u7a74\u5f00\u82b1",     parts: [1,2],   multiplier: 1.8, desc: "\u9634\u9053+\u809b\u95e8\u53cc\u91cd\u7edd\u9876" },
    "B+N": { name: "\u4e73\u6d6a\u98d9\u98d9",     parts: [3,4],   multiplier: 1.4, desc: "\u4e73\u623f+\u4e73\u5934\u53cc\u91cd\u7edd\u9876" },
    "C+B": { name: "\u4e0a\u4e0b\u5171\u632f",     parts: [0,3],   multiplier: 1.5, desc: "\u9634\u6838+\u4e73\u623f\u53cc\u91cd\u7edd\u9876" },
    "V+W": { name: "\u5b50\u5bab\u98a0\u98a4",     parts: [1,6],   multiplier: 2.0, desc: "\u9634\u9053+\u5b50\u5bab\u6df1\u5c42\u7edd\u9876" },
    "O+P": { name: "\u53cc\u9f99\u620f\u73e0",     parts: [5,7],   multiplier: 1.6, desc: "\u53e3\u8154+\u9634\u830e\u53cc\u91cd\u5c04\u7cbe" },
    "A+P": { name: "\u540e\u5ead\u7206\u53d1",     parts: [2,7],   multiplier: 1.7, desc: "\u809b\u95e8+\u9634\u830e\u53cc\u91cd\u5c04\u7cbe" },
    // Triple combos
    "C+V+A": { name: "\u4e09\u91cd\u697c\u9600",   parts: [0,1,2], multiplier: 2.2, desc: "\u4e09\u7a74\u540c\u65f6\u7edd\u9876" },
    "C+V+W": { name: "\u5973\u4f53\u6781\u81f4",   parts: [0,1,6], multiplier: 2.5, desc: "\u9634\u6838+\u9634\u9053+\u5b50\u5bab\u4e09\u91cd\u7edd\u9876" },
    "B+N+O": { name: "\u4e0a\u534a\u8eab\u5171\u9e23", parts: [3,4,5], multiplier: 1.8, desc: "\u4e73\u623f+\u4e73\u5934+\u53e3\u8154\u4e09\u91cd\u7edd\u9876" },
    "V+A+P": { name: "\u5168\u7a74\u5f00\u82b1",   parts: [1,2,7], multiplier: 2.3, desc: "\u9634\u9053+\u809b\u95e8+\u9634\u830e\u4e09\u91cd\u5c04\u7cbe" },
    "C+B+N": { name: "\u654f\u611f\u4e09\u89d2",   parts: [0,3,4], multiplier: 1.8, desc: "\u9634\u6838+\u4e73\u623f+\u4e73\u5934\u4e09\u91cd\u7edd\u9876" },
    // Full body resonance (4+ parts)
    "FULL":  { name: "\u5168\u8eab\u5171\u9e23",     parts: [0,1,2,3,4,5], minParts: 4, multiplier: 2.8, desc: "\u56db\u90e8\u4f4d\u4ee5\u4e0a\u540c\u65f6\u7edd\u9876\uff0c\u8eab\u4f53\u5168\u8eab\u5171\u9e23" },
    // Ultimate awakening (5+ parts or all)
    "ULTIMATE": { name: "\u6781\u4e50\u89c9\u9192", parts: [0,1,2,3,4,5,6,7], minParts: 5, multiplier: 4.0, desc: "\u4e94\u90e8\u4f4d\u4ee5\u4e0a\u7edd\u9876\u89e6\u53d1\u6781\u4e50\u89c9\u9192\uff0c\u83b7\u5f97\u300c\u5168\u89c9\u4e4b\u4f53\u300d" }
};

// ========== Ejaculation Types ==========
const EJACULATION_TYPES = {
    0: { name: "C\u5c04\u7cbe", linkedPart: 0, juelGain: { 11: 300 }, staminaCost: 10, desc: "\u9634\u6838\u523a\u6fc0\u5bfc\u81f4\u5c04\u7cbe" },
    1: { name: "V\u5c04\u7cbe", linkedPart: 1, juelGain: { 11: 500 }, staminaCost: 15, desc: "\u9634\u9053\u5185\u5c04\u7cbe" },
    2: { name: "A\u5c04\u7cbe", linkedPart: 2, juelGain: { 11: 400 }, staminaCost: 12, desc: "\u809b\u95e8\u5185\u5c04\u7cbe" },
    3: { name: "B\u5c04\u7cbe", linkedPart: 3, juelGain: { 11: 350 }, staminaCost: 10, desc: "\u4e73\u623f\u5c04\u7cbe" },
    4: { name: "N\u5c04\u7cbe", linkedPart: 4, juelGain: { 11: 350 }, staminaCost: 10, desc: "\u4e73\u5934\u5c04\u7cbe" },
    5: { name: "O\u5c04\u7cbe", linkedPart: 5, juelGain: { 11: 400 }, staminaCost: 12, desc: "\u53e3\u8154\u5c04\u7cbe" },
    6: { name: "W\u5c04\u7cbe", linkedPart: 6, juelGain: { 11: 600 }, staminaCost: 18, desc: "\u5b50\u5bab\u5185\u5c04\u7cbe" },
    7: { name: "P\u5c04\u7cbe", linkedPart: 7, juelGain: { 11: 300 }, staminaCost: 10, desc: "\u624b\u6deb/\u81ea\u52a8\u5c04\u7cbe" }
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
    // Normalize: target ~10000 total for 100% gauge (arbitrary scale)
    chara.totalOrgasmGauge = Math.min(100, Math.floor(total / 100));
    return chara.totalOrgasmGauge;
}

function getChargeLevel(chara) {
    const gauge = chara.totalOrgasmGauge || 0;
    if (gauge >= 500) return 4;
    if (gauge >= 350) return 3;
    if (gauge >= 200) return 2;
    if (gauge >= 100) return 1;
    return 0;
}

function checkOrgasm(chara) {
    if (!chara) return null;
    const gauge = calculateTotalGauge(chara);
    const chargeLv = getChargeLevel(chara);
    const chargeInfo = CHARGE_LEVELS[chargeLv];

    // Apply energy state orgasm threshold modifier
    const energyState = chara.getEnergyState ? chara.getEnergyState() : { orgasmThresholdMod: 0 };
    const thresholdMod = energyState.orgasmThresholdMod || 0;
    const baseThreshold = 800;
    const threshold = Math.max(200, Math.floor(baseThreshold * (1 + thresholdMod)));

    // Check if any part is over local threshold
    const activeParts = [];
    for (let i = 0; i < 8; i++) {
        if ((chara.partGauge[i] || 0) >= threshold) activeParts.push(i);
    }

    if (activeParts.length === 0 && chargeLv === 0) return null;

    // Determine combo
    const combo = _resolveCombo(activeParts, chargeLv);

    return {
        canClimax: activeParts.length > 0 || chargeLv >= 1,
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

    // Check exact matches
    for (const key in COMBO_ORGASMS) {
        if (key === "FULL" || key === "ULTIMATE") continue;
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
    const combo = result.combo;
    const chargeInfo = result.chargeInfo;
    const multiplier = result.multiplier || 1.0;

    // Determine base orgasm type from dominant part
    const dom = chara.getDominantPart ? chara.getDominantPart() : { index: result.activeParts[0] || 0 };
    const baseTypeId = dom.index >= 0 && dom.index <= 7 ? dom.index : 0;
    const baseType = ORGASM_TYPES[baseTypeId] || ORGASM_TYPES[0];

    // Apply stamina/energy costs
    const stmCost = Math.floor((baseType.staminaCost + (combo ? 10 : 0)) * multiplier);
    const nrgCost = Math.floor((baseType.energyCost + (combo ? 5 : 0)) * multiplier);
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

    // Reset gauge for climaxed parts
    if (combo) {
        for (const pi of combo.parts) {
            chara.partGauge[pi] = 0;
            chara.orgasmCooldown[pi] = 3; // 3-turn cooldown
        }
    } else if (result.activeParts && result.activeParts.length > 0) {
        for (const pi of result.activeParts) {
            chara.partGauge[pi] = Math.floor((chara.partGauge[pi] || 0) * 0.3); // keep 30%
            chara.orgasmCooldown[pi] = 2;
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
        if (penis.ejaculationGauge >= 100) {
            results.push({ penisId: penis.id, linkedParts: penis.linkedParts || [] });
        }
    }
    return results.length > 0 ? results : null;
}

function applyEjaculation(chara, ejResults) {
    if (!chara || !ejResults) return [];
    const msgs = [];
    for (const ej of ejResults) {
        const type = EJACULATION_TYPES[7] || EJACULATION_TYPES[0]; // default P-type
        chara.stamina = (chara.stamina || 0) - type.staminaCost;
        for (const jt in type.juelGain) {
            chara.juel[parseInt(jt)] = (chara.juel[parseInt(jt)] || 0) + type.juelGain[jt];
        }
        // Reset penis gauge
        const penis = chara.genitalConfig.penises.find(p => p.id === ej.penisId);
        if (penis) penis.ejaculationGauge = 0;
        msgs.push(`【${chara.name}\u7684${penis ? penis.name : '\u9634\u830e'}\u5c04\u7cbe\u4e86\uff01】`);
    }
    return msgs;
}

function checkComboPreview(chara) {
    const preview = checkOrgasm(chara);
    if (!preview || !preview.canClimax) return null;
    return preview.combo;
}

function addPenisEjaculationGauge(chara, partCode, value) {
    if (!chara || !chara.genitalConfig || !chara.genitalConfig.penises) return;
    for (const penis of chara.genitalConfig.penises) {
        const linked = penis.linkedParts || [];
        if (linked.includes(partCode)) {
            penis.ejaculationGauge = Math.min(200, (penis.ejaculationGauge || 0) + value);
        }
    }
}

function tickOrgasmCooldown(chara) {
    if (!chara || !chara.orgasmCooldown) return;
    for (let i = 0; i < 8; i++) {
        if (chara.orgasmCooldown[i] > 0) chara.orgasmCooldown[i]--;
    }
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
