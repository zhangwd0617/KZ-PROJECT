/**
 * GenitalConfig.js - Genital configuration & body modification interfaces
 */

const GENITAL_TYPES = {
    female:  { hasVagina: true,  hasWomb: true,  hasPenis: false, penisCount: 0, desc: "\u666e\u901a\u5973\u6027" },
    male:    { hasVagina: false, hasWomb: false, hasPenis: true,  penisCount: 1, desc: "\u666e\u901a\u7537\u6027" },
    futa:    { hasVagina: true,  hasWomb: true,  hasPenis: true,  penisCount: 1, desc: "\u6276\u5979\uff08\u6709\u7a74\uff09" },
    cuntboy: { hasVagina: true,  hasWomb: false, hasPenis: false, penisCount: 0, desc: "\u65e0\u830e\u5973\u6027/\u7537\u6837" },
    neuter:  { hasVagina: false, hasWomb: false, hasPenis: false, penisCount: 0, desc: "\u65e0\u6027\u522b" }
};

const PENIS_TEMPLATE = {
    id: 0,
    name: "\u8089\u68d2",
    ejaculationGauge: 0,
    maxEjaculationGauge: 1000,
    sensitivity: 1.0,
    linkedParts: ["V", "A", "O"],
    ejaculationCount: 0,
    lastEjaculation: 0,
    length: 15,
    girth: 3
};

function createGenitalConfig(type) {
    const def = GENITAL_TYPES[type];
    if (!def) return createGenitalConfig("female");
    const penises = [];
    for (let i = 0; i < def.penisCount; i++) {
        penises.push({ ...PENIS_TEMPLATE, id: i, name: def.penisCount > 1 ? `\u7b2c${i+1}\u6839` : "\u8089\u68d2" });
    }
    return {
        type: type,
        hasVagina: def.hasVagina,
        hasWomb: def.hasWomb,
        penises: penises,
        orgasmSystem: "standard",
        modifications: [] // history of body mods
    };
}

function addPenis(chara, options = {}) {
    if (!chara || !chara.genitalConfig) return { success: false, msg: "\u89d2\u8272\u65e0\u751f\u6b96\u5668\u914d\u7f6e" };
    const gc = chara.genitalConfig;
    if (gc.penises.length >= 3) return { success: false, msg: "\u6700\u591a\u53ea\u80fd\u62e5\u67093\u6839\u9634\u830e" };
    const id = gc.penises.length;
    const penis = {
        id: id,
        name: options.name || `\u7b2c${id+1}\u6839`,
        ejaculationGauge: 0,
        maxEjaculationGauge: options.maxGauge || 1000,
        ejaculationCount: 0,
        lastEjaculation: 0,
        sensitivity: options.sensitivity || 1.0,
        linkedParts: options.linkedParts || ["V", "A", "O"],
        length: options.length || 15,
        girth: options.girth || 3
    };
    gc.penises.push(penis);
    gc.hasPenis = true;
    return { success: true, penis, msg: `\u4e3a${chara.name}\u79fb\u690d\u4e86\u7b2c${id+1}\u6839\u9634\u830e` };
}

function removePenis(chara, penisId) {
    if (!chara || !chara.genitalConfig) return { success: false };
    const gc = chara.genitalConfig;
    const idx = gc.penises.findIndex(p => p.id === penisId);
    if (idx < 0) return { success: false, msg: "\u6307\u5b9a\u9634\u830e\u4e0d\u5b58\u5728" };
    gc.penises.splice(idx, 1);
    // Re-index
    for (let i = 0; i < gc.penises.length; i++) gc.penises[i].id = i;
    if (gc.penises.length === 0) gc.hasPenis = false;
    return { success: true, msg: `\u5254\u9664\u4e86${chara.name}\u7684\u7b2c${idx+1}\u6839\u9634\u830e` };
}

function modifyPenisLink(chara, penisId, parts) {
    if (!chara || !chara.genitalConfig) return { success: false };
    const penis = chara.genitalConfig.penises.find(p => p.id === penisId);
    if (!penis) return { success: false, msg: "\u6307\u5b9a\u9634\u830e\u4e0d\u5b58\u5728" };
    penis.linkedParts = parts.filter(p => ["C","V","A","B","N","O","W","P"].includes(p));
    return { success: true, msg: `\u4fee\u6539\u4e86${chara.name}\u7684${penis.name}\u5173\u8054\u90e8\u4f4d` };
}

function enhanceSensitivity(chara, partCode, multiplier) {
    if (!chara || !chara.genitalConfig) return { success: false };
    const codeMap = { C: 0, V: 1, A: 2, B: 3, N: 4, O: 5, W: 6, P: 7 };
    const idx = codeMap[partCode.toUpperCase()];
    if (idx === undefined) return { success: false };
    chara._sensitivityMultipliers = chara._sensitivityMultipliers || {};
    chara._sensitivityMultipliers[idx] = (chara._sensitivityMultipliers[idx] || 1.0) * multiplier;
    return { success: true, msg: `${chara.name}\u7684${ORGASM_PARTS[idx].name}\u654f\u611f\u5ea6\u63d0\u5347\u4e86` };
}

function implantWomb(chara) {
    if (!chara || !chara.genitalConfig) return { success: false };
    if (chara.genitalConfig.hasWomb) return { success: false, msg: `${chara.name}\u5df2\u7ecf\u62e5\u6709\u5b50\u5bab` };
    chara.genitalConfig.hasWomb = true;
    chara.genitalConfig.modifications.push("womb_implant");
    return { success: true, msg: `\u4e3a${chara.name}\u690d\u5165\u4e86\u4eba\u5de5\u5b50\u5bab` };
}

function getGenitalDesc(chara) {
    if (!chara || !chara.genitalConfig) return "\u672a\u77e5";
    const gc = chara.genitalConfig;
    const parts = [];
    if (gc.hasVagina) parts.push(gc.hasWomb ? "\u6709\u7a74(\u6709\u5bab)" : "\u6709\u7a74(\u65e0\u5bab)");
    if (gc.penises.length > 0) parts.push(`${gc.penises.length}\u6839\u9634\u830e`);
    if (parts.length === 0) parts.push("\u65e0\u7279\u6b8a\u751f\u6b96\u5668");
    return parts.join(" + ");
}

window.GENITAL_TYPES = GENITAL_TYPES;
window.PENIS_TEMPLATE = PENIS_TEMPLATE;
window.createGenitalConfig = createGenitalConfig;
window.addPenis = addPenis;
window.removePenis = removePenis;
window.modifyPenisLink = modifyPenisLink;
window.enhanceSensitivity = enhanceSensitivity;
window.implantWomb = implantWomb;
window.getGenitalDesc = getGenitalDesc;
