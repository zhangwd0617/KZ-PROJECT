/**
 * RouteAccelerators.js - Route acceleration talents & assistant buffs
 * Stage1-4: 20 acceleration talents (5 routes x 4 stages) - V3.0 complex effects
 * Stage5: 5 assistant-only buffs
 */

const ROUTE_ACCELERATORS = {
    // ===== Obedience accelerators =====
    400: { id: 400, name: "\u4f8d\u5949\u70ed\u5fc3", route: 0, stage: 1,
           effectDesc: "\u4f8d\u5949\u7cfb\u6307\u4ee4PALAM+15%",
           applyFunc: (chara) => { chara._accelServiceMult = 1.15; } },
    401: { id: 401, name: "\u5fe0\u8bda\u4e4b\u5fc3", route: 0, stage: 2,
           effectDesc: "\u62d2\u7edd\u7387-10%\uff0c\u5c48\u670dPALAM\u989d\u5916+20%",
           applyFunc: (chara) => { chara._accelRefuseMod = -0.10; chara._accelYieldBonus = 0.20; } },
    402: { id: 402, name: "\u732e\u8eab\u7cbe\u795e", route: 0, stage: 3,
           effectDesc: "\u4f53\u529b\u6d88\u8017-20%\uff0c\u6bcf\u56de\u5408\u6062\u590d5%\u4f53\u529b",
           applyFunc: (chara) => { chara._accelStaminaSave = 0.20; chara._accelStaminaRegen = 0.05; } },
    403: { id: 403, name: "\u7edd\u5bf9\u670d\u4ece", route: 0, stage: 4,
           effectDesc: "\u62d2\u7edd\u7387-25%\uff0c\u987a\u4ece\u7cfb\u6307\u4ee4\u6548\u679c\u00d71.5",
           applyFunc: (chara) => { chara._accelRefuseMod = (chara._accelRefuseMod || 0) - 0.15; chara._accelObedienceMult = 1.50; } },

    // ===== Desire accelerators =====
    410: { id: 410, name: "\u6e7f\u6da6\u8bf1\u5bfc", route: 1, stage: 1,
           effectDesc: "\u6da6\u6ed1PALAM\u83b7\u53d6+25%",
           applyFunc: (chara) => { chara._accelWetMult = 1.25; } },
    411: { id: 411, name: "\u6deb\u6b32\u5faa\u73af", route: 1, stage: 2,
           effectDesc: "\u5feb\u4e50PALAM\u53cd\u9988+15%\uff08\u5feb\u4e50\u8d8a\u9ad8\u5176\u4ed6PALAM\u5fae\u589e\uff09",
           applyFunc: (chara) => { chara._accelJoyFeedback = 0.15; } },
    412: { id: 412, name: "\u5feb\u611f\u5171\u9e23", route: 1, stage: 3,
           effectDesc: "\u7edd\u9876\u65f6\u5176\u4ed6\u90e8\u4f4dgauge+10%",
           applyFunc: (chara) => { chara._accelOrgasmResonance = 0.10; } },
    413: { id: 413, name: "\u6b32\u671b\u6df1\u6e0a", route: 1, stage: 4,
           effectDesc: "\u5feb\u4e50PALAM\u00d71.3\uff0c\u7edd\u9876\u95e8\u69db-10%",
           applyFunc: (chara) => { chara._accelJoyMult = 1.30; chara._accelOrgasmThresholdMod = -0.10; } },

    // ===== Pain accelerators =====
    420: { id: 420, name: "\u82e6\u75db\u8f6c\u5316", route: 2, stage: 1,
           effectDesc: "\u75db\u82e6PALAM 30%\u8f6c\u5feb\u4e50",
           applyFunc: (chara) => { chara._accelPainToJoy = 0.30; } },
    421: { id: 421, name: "\u5fcd\u8010\u529b", route: 2, stage: 2,
           effectDesc: "\u75db\u82e6PALAM\u83b7\u53d6-20%\u4f46\u5feb\u4e50+10%",
           applyFunc: (chara) => { chara._accelPainReduce = 0.20; chara._accelJoyFromPain = 0.10; } },
    422: { id: 422, name: "\u55dc\u75db\u4f53\u8d28", route: 2, stage: 3,
           effectDesc: "\u75db\u82e6PALAM\u00d71.2\uff0c\u75db\u82e6\u72b6\u6001\u62d2\u7edd\u7387\u989d\u5916-15%",
           applyFunc: (chara) => { chara._accelPainMult = 1.20; chara._accelPainRefuseMod = -0.15; } },
    423: { id: 423, name: "\u82e6\u75db\u5347\u534e", route: 2, stage: 4,
           effectDesc: "\u75db\u82e6100%\u8f6c\u5feb\u4e50\uff0cSM\u6307\u4ee4\u6548\u679c\u00d71.5",
           applyFunc: (chara) => { chara._accelPainToJoy = (chara._accelPainToJoy || 0) + 0.70; chara._accelSMMult = 1.50; } },

    // ===== Shame accelerators =====
    430: { id: 430, name: "\u7f9e\u803b\u5feb\u611f", route: 3, stage: 1,
           effectDesc: "\u7f9e\u803bPALAM 20%\u8f6c\u5feb\u4e50",
           applyFunc: (chara) => { chara._accelShameToJoy = 0.20; } },
    431: { id: 431, name: "\u66b4\u9732\u7656", route: 3, stage: 2,
           effectDesc: "\u7f9e\u803bPALAM\u83b7\u53d6+25%\uff0c\u6709\u526f\u5974\u65f6\u989d\u5916+15%",
           applyFunc: (chara) => { chara._accelShameMult = 1.25; chara._accelBystanderShame = 0.15; } },
    432: { id: 432, name: "\u516c\u5f00\u5feb\u611f", route: 3, stage: 3,
           effectDesc: "\u6709\u526f\u5974\u5728\u573a\u65f6\u5feb\u4e50\u00d71.2",
           applyFunc: (chara) => { chara._accelPublicJoy = 1.20; } },
    433: { id: 433, name: "\u5c55\u89c8\u72c2", route: 3, stage: 4,
           effectDesc: "\u7f9e\u803bPALAM\u00d71.4\uff0c\u62d2\u7edd\u7387-20%",
           applyFunc: (chara) => { chara._accelShameMult = (chara._accelShameMult || 1.0) * 1.12; chara._accelRefuseMod = (chara._accelRefuseMod || 0) - 0.20; } },

    // ===== Dominance accelerators =====
    440: { id: 440, name: "\u652f\u914d\u6c14\u606f", route: 4, stage: 1,
           effectDesc: "\u652f\u914dPALAM\u83b7\u53d6+20%\uff0c\u53cd\u611f-10%",
           applyFunc: (chara) => { chara._accelDomMult = 1.20; chara._accelHateReduce = 0.10; } },
    441: { id: 441, name: "\u6743\u5a01\u611f", route: 4, stage: 2,
           effectDesc: "\u62d2\u7edd\u7387-15%\uff0c\u5c48\u670dPALAM+15%",
           applyFunc: (chara) => { chara._accelRefuseMod = (chara._accelRefuseMod || 0) - 0.15; chara._accelYieldBonus = (chara._accelYieldBonus || 0) + 0.15; } },
    442: { id: 442, name: "\u638c\u63a7\u6b32", route: 4, stage: 3,
           effectDesc: "\u6bcf\u56de\u5408\u968f\u673a\u4e00\u4e2a\u90e8\u4f4dgauge+5%",
           applyFunc: (chara) => { chara._accelRandomGauge = 0.05; } },
    443: { id: 443, name: "\u7edd\u5bf9\u652f\u914d", route: 4, stage: 4,
           effectDesc: "\u652f\u914dPALAM\u00d71.3\uff0c\u53cd\u611f50%\u8f6c\u606d\u987a",
           applyFunc: (chara) => { chara._accelDomMult = (chara._accelDomMult || 1.0) * 1.083; chara._accelHateToObey = 0.50; } }
};

const ASSISTANT_BUFFS = {
    // ===== Stage5 assistant-only buffs (V3.0 complex effects) =====
    // 顺从: 信仰传播者
    450: { id: 450, name: "\u4fe1\u4ef0\u4f20\u64ad\u8005", route: 0, assistantOnly: true,
           effectDesc: "\u4f5c\u4e3a\u52a9\u624b\u65f6\uff0c\u6bcf\u56de\u5408+50\u606d\u987aPALAM\uff0c\u523b\u5370\u7ecf\u9a8c\u00d71.5\uff0c\u540c\u8def\u7ebf\u7ecf\u9a8c\u00d71.3",
           applyFunc: (chara) => {
               chara._assistantBuff = {
                   type: "delegate", power: 0.20,
                   perTurnPalam: { 4: 50 },      // 每回合+50恭顺PALAM
                   markExpMult: 1.5,             // 刻印获取概率提升、等级增加
                   sameRouteExpMult: 1.3         // 同路线经验×1.3
               };
           } },
    // 欲望: 快感导师
    451: { id: 451, name: "\u5feb\u611f\u5bfc\u5e08", route: 1, assistantOnly: true,
           effectDesc: "\u4f5c\u4e3a\u52a9\u624b\u65f6\uff0c\u5feb\u4e50\u00d71.25\uff0c\u6da6\u6ed1\u8d77\u59cb+200\uff0c\u7edd\u9876\u540e\u4e0b\u56de\u5408\u5168PALAM+150",
           applyFunc: (chara) => {
               chara._assistantBuff = {
                   type: "participate", pleasureBoost: 0.15,
                   joyMult: 1.25,                 // 快乐PALAM×1.25
                   wetStart: 200,                 // 润滑起始+200
                   postOrgasmBoost: 150           // 绝顶后下回合全PALAM起始+150
               };
           } },
    // 痛苦: 苦痛代行者
    452: { id: 452, name: "\u82e6\u75db\u4ee3\u884c\u8005", route: 2, assistantOnly: true,
           effectDesc: "\u4f5c\u4e3a\u52a9\u624b\u65f6\uff0c\u75db\u82e680%\u8f6c\u5feb\u4e50\uff0cSM\u6307\u4ee4\u00d71.4\uff0c\u6050\u60e7\u4e0d\u52a0\u62d2\u7edd\u7387",
           applyFunc: (chara) => {
               chara._assistantBuff = {
                   type: "delegate", power: 0.25,
                   painToJoy: 0.80,               // 痛苦80%转快乐
                   smMult: 1.40,                  // SM指令×1.4
                   noFearRefuse: true             // 恐惧不加拒绝率
               };
           } },
    // 露出: 公开处刑人
    453: { id: 453, name: "\u516c\u5f00\u5904\u5211\u4eba", route: 3, assistantOnly: true,
           effectDesc: "\u4f5c\u4e3a\u52a9\u624b\u65f6\uff0c\u7f9e\u803b\u00d71.3\uff0c\u526f\u5974\u5728\u573a\u00d71.2\uff0c\u89e3\u9501\u534f\u540c\u6307\u4ee4",
           applyFunc: (chara) => {
               chara._assistantBuff = {
                   type: "participate", shameBoost: 0.20,
                   shameMult: 1.30,               // 羞耻×1.3
                   bystanderShameMult: 1.20,      // 副奴在场羞耻×1.2
                   unlockPublicShame: true        // 解锁协同指令"公开羞辱"
               };
           } },
    // 支配: 代理支配者
    454: { id: 454, name: "\u4ee3\u7406\u652f\u914d\u8005", route: 4, assistantOnly: true,
           effectDesc: "\u4f5c\u4e3a\u52a9\u624b\u65f6\uff0c\u4e0d\u5360\u52a9\u624b\u69fd\u4f4d\uff0c\u6bcf3\u56de\u5408\u4ee3\u4e3a\u8c03\u6559\uff0c\u53cd\u611f50%\u8f6c\u606d\u987a",
           applyFunc: (chara) => {
               chara._assistantBuff = {
                   type: "participate", dualPower: 0.15,
                   noSlot: true,                  // 不占助手槽位
                   autoTeachEvery: 3,             // 每3回合代为调教
                   hateToObey: 0.50               // 反感50%转恭顺
               };
           } }
};

/**
 * Apply route accelerator talents based on current route levels
 * Should be called when route level changes or on character init
 */
function applyRouteAccelerators(chara) {
    if (!chara || !chara.routeLevel) return;
    // Reset all accelerator properties
    chara._routeExpBonus = {};
    chara._accelServiceMult = 1.0;
    chara._accelRefuseMod = 0;
    chara._accelYieldBonus = 0;
    chara._accelStaminaSave = 0;
    chara._accelStaminaRegen = 0;
    chara._accelObedienceMult = 1.0;
    chara._accelWetMult = 1.0;
    chara._accelJoyFeedback = 0;
    chara._accelOrgasmResonance = 0;
    chara._accelJoyMult = 1.0;
    chara._accelOrgasmThresholdMod = 0;
    chara._accelPainToJoy = 0;
    chara._accelPainReduce = 0;
    chara._accelJoyFromPain = 0;
    chara._accelPainMult = 1.0;
    chara._accelPainRefuseMod = 0;
    chara._accelSMMult = 1.0;
    chara._accelShameToJoy = 0;
    chara._accelShameMult = 1.0;
    chara._accelBystanderShame = 0;
    chara._accelPublicJoy = 1.0;
    chara._accelDomMult = 1.0;
    chara._accelHateReduce = 0;
    chara._accelRandomGauge = 0;
    chara._accelHateToObey = 0;

    for (let r = 0; r < 5; r++) {
        const lv = chara.routeLevel[r] || 0;
        // Simple exp bonus fallback for Stage1-2 (backward compat)
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
            applyRouteAccelerators(chara); // Re-apply all
            return { id: acc.id, name: acc.name, msg: `【${chara.name}\u83b7\u5f97\u4e86\u300c${acc.name}\u300d\uff01${acc.effectDesc}】` };
        }
    } else if (newLevel === 5) {
        const buff = ASSISTANT_BUFFS[450 + routeId];
        if (buff && !chara.talent[buff.id]) {
            chara.talent[buff.id] = 1;
            applyRouteAccelerators(chara); // Re-apply all
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
