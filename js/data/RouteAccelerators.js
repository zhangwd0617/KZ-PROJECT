/**
 * RouteAccelerators.js - Route acceleration talents & assistant buffs
 * Stage1-4: 20 acceleration talents (5 routes x 4 stages)
 * Stage5: 5 assistant-only buffs
 */

const ROUTE_ACCELERATORS = {
    // ===== Obedience accelerators =====
    400: { id: 400, name: "\u987a\u4ece\u52a0\u901f I",  route: 0, stage: 1,
           effectDesc: "\u987a\u4ece\u8def\u7ebf\u7ecf\u9a8c+20%",
           applyFunc: (chara) => { chara._routeExpBonus = (chara._routeExpBonus || {}); chara._routeExpBonus[0] = (chara._routeExpBonus[0] || 0) + 0.20; } },
    401: { id: 401, name: "\u987a\u4ece\u52a0\u901f II", route: 0, stage: 2,
           effectDesc: "\u987a\u4ece\u8def\u7ebf\u7ecf\u9a8c+35%",
           applyFunc: (chara) => { chara._routeExpBonus = (chara._routeExpBonus || {}); chara._routeExpBonus[0] = (chara._routeExpBonus[0] || 0) + 0.35; } },
    402: { id: 402, name: "\u987a\u4ece\u52a0\u901f III", route: 0, stage: 3,
           effectDesc: "\u987a\u4ece\u8def\u7ebf\u7ecf\u9a8c+50%",
           applyFunc: (chara) => { chara._routeExpBonus = (chara._routeExpBonus || {}); chara._routeExpBonus[0] = (chara._routeExpBonus[0] || 0) + 0.50; } },
    403: { id: 403, name: "\u987a\u4ece\u52a0\u901f IV", route: 0, stage: 4,
           effectDesc: "\u987a\u4ece\u8def\u7ebf\u7ecf\u9a8c+70%",
           applyFunc: (chara) => { chara._routeExpBonus = (chara._routeExpBonus || {}); chara._routeExpBonus[0] = (chara._routeExpBonus[0] || 0) + 0.70; } },

    // ===== Desire accelerators =====
    410: { id: 410, name: "\u6b32\u671b\u52a0\u901f I",  route: 1, stage: 1,
           effectDesc: "\u6b32\u671b\u8def\u7ebf\u7ecf\u9a8c+20%",
           applyFunc: (chara) => { chara._routeExpBonus = (chara._routeExpBonus || {}); chara._routeExpBonus[1] = (chara._routeExpBonus[1] || 0) + 0.20; } },
    411: { id: 411, name: "\u6b32\u671b\u52a0\u901f II", route: 1, stage: 2,
           effectDesc: "\u6b32\u671b\u8def\u7ebf\u7ecf\u9a8c+35%",
           applyFunc: (chara) => { chara._routeExpBonus = (chara._routeExpBonus || {}); chara._routeExpBonus[1] = (chara._routeExpBonus[1] || 0) + 0.35; } },
    412: { id: 412, name: "\u6b32\u671b\u52a0\u901f III", route: 1, stage: 3,
           effectDesc: "\u6b32\u671b\u8def\u7ebf\u7ecf\u9a8c+50%",
           applyFunc: (chara) => { chara._routeExpBonus = (chara._routeExpBonus || {}); chara._routeExpBonus[1] = (chara._routeExpBonus[1] || 0) + 0.50; } },
    413: { id: 413, name: "\u6b32\u671b\u52a0\u901f IV", route: 1, stage: 4,
           effectDesc: "\u6b32\u671b\u8def\u7ebf\u7ecf\u9a8c+70%",
           applyFunc: (chara) => { chara._routeExpBonus = (chara._routeExpBonus || {}); chara._routeExpBonus[1] = (chara._routeExpBonus[1] || 0) + 0.70; } },

    // ===== Pain accelerators =====
    420: { id: 420, name: "\u75db\u82e6\u52a0\u901f I",  route: 2, stage: 1,
           effectDesc: "\u75db\u82e6\u8def\u7ebf\u7ecf\u9a8c+20%",
           applyFunc: (chara) => { chara._routeExpBonus = (chara._routeExpBonus || {}); chara._routeExpBonus[2] = (chara._routeExpBonus[2] || 0) + 0.20; } },
    421: { id: 421, name: "\u75db\u82e6\u52a0\u901f II", route: 2, stage: 2,
           effectDesc: "\u75db\u82e6\u8def\u7ebf\u7ecf\u9a8c+35%",
           applyFunc: (chara) => { chara._routeExpBonus = (chara._routeExpBonus || {}); chara._routeExpBonus[2] = (chara._routeExpBonus[2] || 0) + 0.35; } },
    422: { id: 422, name: "\u75db\u82e6\u52a0\u901f III", route: 2, stage: 3,
           effectDesc: "\u75db\u82e6\u8def\u7ebf\u7ecf\u9a8c+50%",
           applyFunc: (chara) => { chara._routeExpBonus = (chara._routeExpBonus || {}); chara._routeExpBonus[2] = (chara._routeExpBonus[2] || 0) + 0.50; } },
    423: { id: 423, name: "\u75db\u82e6\u52a0\u901f IV", route: 2, stage: 4,
           effectDesc: "\u75db\u82e6\u8def\u7ebf\u7ecf\u9a8c+70%",
           applyFunc: (chara) => { chara._routeExpBonus = (chara._routeExpBonus || {}); chara._routeExpBonus[2] = (chara._routeExpBonus[2] || 0) + 0.70; } },

    // ===== Shame accelerators =====
    430: { id: 430, name: "\u9732\u51fa\u52a0\u901f I",  route: 3, stage: 1,
           effectDesc: "\u9732\u51fa\u8def\u7ebf\u7ecf\u9a8c+20%",
           applyFunc: (chara) => { chara._routeExpBonus = (chara._routeExpBonus || {}); chara._routeExpBonus[3] = (chara._routeExpBonus[3] || 0) + 0.20; } },
    431: { id: 431, name: "\u9732\u51fa\u52a0\u901f II", route: 3, stage: 2,
           effectDesc: "\u9732\u51fa\u8def\u7ebf\u7ecf\u9a8c+35%",
           applyFunc: (chara) => { chara._routeExpBonus = (chara._routeExpBonus || {}); chara._routeExpBonus[3] = (chara._routeExpBonus[3] || 0) + 0.35; } },
    432: { id: 432, name: "\u9732\u51fa\u52a0\u901f III", route: 3, stage: 3,
           effectDesc: "\u9732\u51fa\u8def\u7ebf\u7ecf\u9a8c+50%",
           applyFunc: (chara) => { chara._routeExpBonus = (chara._routeExpBonus || {}); chara._routeExpBonus[3] = (chara._routeExpBonus[3] || 0) + 0.50; } },
    433: { id: 433, name: "\u9732\u51fa\u52a0\u901f IV", route: 3, stage: 4,
           effectDesc: "\u9732\u51fa\u8def\u7ebf\u7ecf\u9a8c+70%",
           applyFunc: (chara) => { chara._routeExpBonus = (chara._routeExpBonus || {}); chara._routeExpBonus[3] = (chara._routeExpBonus[3] || 0) + 0.70; } },

    // ===== Dominance accelerators =====
    440: { id: 440, name: "\u652f\u914d\u52a0\u901f I",  route: 4, stage: 1,
           effectDesc: "\u652f\u914d\u8def\u7ebf\u7ecf\u9a8c+20%",
           applyFunc: (chara) => { chara._routeExpBonus = (chara._routeExpBonus || {}); chara._routeExpBonus[4] = (chara._routeExpBonus[4] || 0) + 0.20; } },
    441: { id: 441, name: "\u652f\u914d\u52a0\u901f II", route: 4, stage: 2,
           effectDesc: "\u652f\u914d\u8def\u7ebf\u7ecf\u9a8c+35%",
           applyFunc: (chara) => { chara._routeExpBonus = (chara._routeExpBonus || {}); chara._routeExpBonus[4] = (chara._routeExpBonus[4] || 0) + 0.35; } },
    442: { id: 442, name: "\u652f\u914d\u52a0\u901f III", route: 4, stage: 3,
           effectDesc: "\u652f\u914d\u8def\u7ebf\u7ecf\u9a8c+50%",
           applyFunc: (chara) => { chara._routeExpBonus = (chara._routeExpBonus || {}); chara._routeExpBonus[4] = (chara._routeExpBonus[4] || 0) + 0.50; } },
    443: { id: 443, name: "\u652f\u914d\u52a0\u901f IV", route: 4, stage: 4,
           effectDesc: "\u652f\u914d\u8def\u7ebf\u7ecf\u9a8c+70%",
           applyFunc: (chara) => { chara._routeExpBonus = (chara._routeExpBonus || {}); chara._routeExpBonus[4] = (chara._routeExpBonus[4] || 0) + 0.70; } }
};

const ASSISTANT_BUFFS = {
    // ===== Stage5 assistant-only buffs =====
    450: { id: 450, name: "\u5949\u4ed5\u4e4b\u5fc3", route: 0, assistantOnly: true,
           effectDesc: "\u4f5c\u4e3a\u52a9\u624b\u65f6\uff0c\u4ee3\u884c\u6307\u4ee4\u6548\u679c+20%\uff0c\u81ea\u8eab\u6c14\u529b\u6d88\u8017-10%",
           applyFunc: (chara) => { chara._assistantBuff = { type: "delegate", power: 0.20, energyCost: -0.10 }; } },
    451: { id: 451, name: "\u60c5\u6b32\u4e4b\u706b", route: 1, assistantOnly: true,
           effectDesc: "\u4f5c\u4e3a\u52a9\u624b\u65f6\uff0c\u53c2\u4e0e\u6a21\u5f0f\u4e0b\u53cc\u65b9\u5feb\u611f+15%",
           applyFunc: (chara) => { chara._assistantBuff = { type: "participate", pleasureBoost: 0.15 }; } },
    452: { id: 452, name: "\u75db\u82e6\u5171\u9e23", route: 2, assistantOnly: true,
           effectDesc: "\u4f5c\u4e3a\u52a9\u624b\u65f6\uff0cSM\u6307\u4ee4\u4ee3\u884c\u6548\u679c+25%\uff0c\u4e3b\u5974\u75db\u82e6\u8f6c\u5316\u7387+10%",
           applyFunc: (chara) => { chara._assistantBuff = { type: "delegate", power: 0.25, painConvert: 0.10 }; } },
    453: { id: 453, name: "\u7f9e\u803b\u5171\u611f", route: 3, assistantOnly: true,
           effectDesc: "\u4f5c\u4e3a\u52a9\u624b\u65f6\uff0c\u9732\u51fa\u573a\u666fplay\u6548\u679c+20%\uff0c\u4e3b\u5974\u7f9e\u803bPALAM+10%",
           applyFunc: (chara) => { chara._assistantBuff = { type: "participate", shameBoost: 0.20, targetShame: 0.10 }; } },
    454: { id: 454, name: "\u652f\u914d\u5171\u8c0b", route: 4, assistantOnly: true,
           effectDesc: "\u4f5c\u4e3a\u52a9\u624b\u65f6\uff0c\u53cc\u4eba\u6307\u4ee4\u6548\u679c+15%\uff0c\u4e3b\u5974\u62d2\u7edd\u7387-10%",
           applyFunc: (chara) => { chara._assistantBuff = { type: "participate", dualPower: 0.15, targetRefuse: -0.10 }; } }
};

/**
 * Apply route accelerator talents based on current route levels
 * Should be called when route level changes or on character init
 */
function applyRouteAccelerators(chara) {
    if (!chara || !chara.routeLevel) return;
    // Reset bonuses
    chara._routeExpBonus = {};
    for (let r = 0; r < 5; r++) {
        const lv = chara.routeLevel[r] || 0;
        if (lv >= 1) {
            const acc1 = ROUTE_ACCELERATORS[400 + r * 10 + 0];
            if (acc1 && chara.talent[acc1.id] > 0) acc1.applyFunc(chara);
        }
        if (lv >= 2) {
            const acc2 = ROUTE_ACCELERATORS[400 + r * 10 + 1];
            if (acc2 && chara.talent[acc2.id] > 0) acc2.applyFunc(chara);
        }
        if (lv >= 3) {
            const acc3 = ROUTE_ACCELERATORS[400 + r * 10 + 2];
            if (acc3 && chara.talent[acc3.id] > 0) acc3.applyFunc(chara);
        }
        if (lv >= 4) {
            const acc4 = ROUTE_ACCELERATORS[400 + r * 10 + 3];
            if (acc4 && chara.talent[acc4.id] > 0) acc4.applyFunc(chara);
        }
        // Stage5 assistant buff
        if (lv >= 5) {
            const buff = ASSISTANT_BUFFS[450 + r];
            if (buff && chara.talent[buff.id] > 0) buff.applyFunc(chara);
        }
    }
}

/**
 * Auto-grant route accelerator when route level increases
 * @returns {Object|null} { id, name, msg }
 */
function onRouteLevelUp(chara, routeId, newLevel) {
    if (!chara || newLevel < 1 || newLevel > 5) return null;
    if (newLevel <= 4) {
        const acc = ROUTE_ACCELERATORS[400 + routeId * 10 + (newLevel - 1)];
        if (acc && !chara.talent[acc.id]) {
            chara.talent[acc.id] = 1;
            return { id: acc.id, name: acc.name, msg: `【${chara.name}\u83b7\u5f97\u4e86\u300c${acc.name}\u300d\uff01${acc.effectDesc}】` };
        }
    } else if (newLevel === 5) {
        const buff = ASSISTANT_BUFFS[450 + routeId];
        if (buff && !chara.talent[buff.id]) {
            chara.talent[buff.id] = 1;
            return { id: buff.id, name: buff.name, msg: `【${chara.name}\u83b7\u5f97\u4e86\u52a9\u624b\u4e13\u7528\u589e\u76ca\u300c${buff.name}\u300d\uff01${buff.effectDesc}】` };
        }
    }
    return null;
}

/**
 * Get effective route exp multiplier for a character
 */
function getRouteExpMultiplier(chara, routeId) {
    if (!chara || !chara._routeExpBonus) return 1.0;
    return 1.0 + (chara._routeExpBonus[routeId] || 0);
}

window.ROUTE_ACCELERATORS = ROUTE_ACCELERATORS;
window.ASSISTANT_BUFFS = ASSISTANT_BUFFS;
window.applyRouteAccelerators = applyRouteAccelerators;
window.onRouteLevelUp = onRouteLevelUp;
window.getRouteExpMultiplier = getRouteExpMultiplier;
