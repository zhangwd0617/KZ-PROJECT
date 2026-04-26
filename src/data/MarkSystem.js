/**
 * MarkSystem.js — 刻印系统重设计 V4.0
 * 所有刻印从"被动负面"转为"可策略培养的正向专精"
 */

// ============================================================
// 1. 刻印效果定义表
// ============================================================
const MARK_EFFECTS = {
    0: { // 屈服刻印（原苦痛/服从刻印）
        name: '屈服刻印',
        desc: '痛苦中习得服从，降低拒绝率',
        levels: {
            1: { refuseMod: -0.05, desc: '拒绝率-5%' },
            2: { refuseMod: -0.12, staminaSave: 0.05, desc: '拒绝率-12%，体力消耗-5%' },
            3: { refuseMod: -0.20, staminaSave: 0.05, canAssist: true, desc: '拒绝率-20%，可担任助手' }
        }
    },
    1: { // 快乐刻印
        name: '快乐刻印',
        desc: '对快感的敏感度提升',
        levels: {
            1: { joyMult: 1.08, desc: '快感PALAM+8%' },
            2: { joyMult: 1.15, orgasmThreshold: -0.05, desc: '快感+15%，绝顶门槛-5%' },
            3: { joyMult: 1.25, orgasmThreshold: -0.05, postOrgasmSp: 15, desc: '快感+25%，绝顶后恢复气力' }
        }
    },
    2: { // 侍奉刻印（原屈服刻印）
        name: '侍奉刻印',
        desc: '侍奉技巧与热情的极致',
        levels: {
            1: { serviceMult: 1.10, desc: '侍奉系效果+10%' },
            2: { serviceMult: 1.20, masterStaminaSave: 0.05, desc: '侍奉系+20%，魔王体力消耗-5%' },
            3: { serviceMult: 1.35, masterStaminaSave: 0.05, perTurnSp: 5, desc: '侍奉系+35%，每回合恢复气力' }
        }
    },
    3: { // 反抗刻印 → M属性专精（核心改动）
        name: '反抗刻印',
        desc: '越痛苦越快乐，拒绝反而增加快感',
        levels: {
            1: { painToJoy: 0.30, desc: '痛苦30%→快乐' },
            2: { painToJoy: 0.30, painReduce: 0.20, joyBonus: 0.10, desc: '痛苦30%→快乐，痛苦获取-20%，快乐+10%' },
            3: { painToJoy: 0.50, painReduce: 0.20, joyBonus: 0.10, smMult: 1.40, refuseJoyBonus: 0.30, desc: '逆境狂欢：痛苦50%→快乐，SM指令效果×1.4，拒绝时快感额外+30%' }
        }
    },
    4: { // 猎奇刻印（原恐怖刻印）
        name: '猎奇刻印',
        desc: '对异常play的深度接纳',
        levels: {
            1: { abnormalExpMult: 1.20, desc: '异常经验获取+20%' },
            2: { abnormalExpMult: 1.20, abnormalRefuseMod: -0.15, abnormalEffectMult: 1.15, desc: '异常指令拒绝率-15%，效果+15%' },
            3: { abnormalExpMult: 1.20, abnormalRefuseMod: -0.25, abnormalEffectMult: 1.30, unlockSpecial: true, desc: '异常拒绝率-25%，效果+30%，解锁特殊指令' }
        }
    },
    5: { // 淫乱刻印
        name: '淫乱刻印',
        desc: '羞耻与暴露的快感专精',
        levels: {
            1: { shameToJoy: 0.15, desc: '羞耻15%→快乐' },
            2: { shameToJoy: 0.15, exposeEffectMult: 1.20, audienceBonus: 0.15, desc: '露出指令效果+20%，观众额外+15%' },
            3: { shameToJoy: 0.25, exposeEffectMult: 1.25, audienceBonus: 0.15, shameNoSpDrain: true, desc: '公开play全快感+25%，羞耻不再降气力' }
        }
    },
    6: { // 征服刻印（原反发刻印）
        name: '征服刻印',
        desc: '支配欲与控制力的象征',
        levels: {
            1: { domEffectMult: 1.10, desc: '支配系效果+10%' },
            2: { domEffectMult: 1.20, targetYieldBonus: 0.15, desc: '支配系+20%，对方屈服额外+15%' },
            3: { domEffectMult: 1.35, targetYieldBonus: 0.15, smDualJoy: 0.20, desc: '支配系+35%，SM指令双方快感+20%' }
        }
    },
    7: { // 悲恋刻印（原哀伤刻印）
        name: '悲恋刻印',
        desc: '破碎之美，低气力时的独特增益',
        levels: {
            1: { loveExpMult: 1.30, desc: '爱情经验获取+30%' },
            2: { loveExpMult: 1.30, retainFactionTrait: true, desc: '陷落后保留原阵营特性，获独特加成' },
            3: { loveExpMult: 1.30, retainFactionTrait: true, lowSpPalamMult: 1.30, desc: '解锁"悲剧之美"：低气力时PALAM×1.3' }
        }
    }
};

// 路线对应的刻印ID（用于升级奖励等）
const ROUTE_MARK_MAP = {
    0: 2, // 顺从 → 侍奉刻印
    1: 1, // 欲望 → 快乐刻印
    2: 3, // 痛苦 → 反抗刻印(M专精)
    3: 5, // 露出 → 淫乱刻印
    4: 6  // 支配 → 征服刻印
};

// ============================================================
// 2. 效果应用与查询
// ============================================================

/**
 * 获取刻印当前等级的效果对象（合并1~lv的所有效果）
 */
function getMarkEffect(markId, level) {
    const def = MARK_EFFECTS[markId];
    if (!def || level <= 0) return {};
    const result = {};
    for (let i = 1; i <= Math.min(level, 3); i++) {
        const lvEff = def.levels[i];
        if (!lvEff) continue;
        for (const [key, val] of Object.entries(lvEff)) {
            if (key === 'desc') continue;
            if (typeof val === 'number' && typeof result[key] === 'number') {
                // 数值累加（乘法型转加法累加，如 joyMult: 1.08 + 0.07 = 1.15）
                if (key.endsWith('Mult') || key.endsWith('Mod') || key === 'painToJoy' || key === 'shameToJoy') {
                    result[key] += val;
                } else {
                    result[key] += val;
                }
            } else {
                result[key] = val;
            }
        }
    }
    return result;
}

/**
 * 获取刻印效果描述文本
 */
function getMarkEffectDescription(markId, level) {
    const def = MARK_EFFECTS[markId];
    if (!def || level <= 0) return '无效果';
    const eff = getMarkEffect(markId, level);
    const parts = [];
    if (eff.refuseMod) parts.push(`拒绝率${Math.round(eff.refuseMod * 100)}%`);
    if (eff.staminaSave) parts.push(`体力消耗-${Math.round(eff.staminaSave * 100)}%`);
    if (eff.canAssist) parts.push('可担任助手');
    if (eff.joyMult) parts.push(`快感×${eff.joyMult.toFixed(2)}`);
    if (eff.orgasmThreshold) parts.push(`绝顶门槛${Math.round(eff.orgasmThreshold * 100)}%`);
    if (eff.postOrgasmSp) parts.push(`绝顶后恢复${eff.postOrgasmSp}气力`);
    if (eff.serviceMult) parts.push(`侍奉效果×${eff.serviceMult.toFixed(2)}`);
    if (eff.masterStaminaSave) parts.push(`魔王体力-${Math.round(eff.masterStaminaSave * 100)}%`);
    if (eff.perTurnSp) parts.push(`每回合+${eff.perTurnSp}气力`);
    if (eff.painToJoy) parts.push(`痛苦${Math.round(eff.painToJoy * 100)}%→快乐`);
    if (eff.painReduce) parts.push(`痛苦获取-${Math.round(eff.painReduce * 100)}%`);
    if (eff.smMult) parts.push(`SM效果×${eff.smMult.toFixed(2)}`);
    if (eff.abnormalRefuseMod) parts.push(`异常拒绝率${Math.round(eff.abnormalRefuseMod * 100)}%`);
    if (eff.abnormalEffectMult) parts.push(`异常效果×${eff.abnormalEffectMult.toFixed(2)}`);
    if (eff.shameToJoy) parts.push(`羞耻${Math.round(eff.shameToJoy * 100)}%→快乐`);
    if (eff.exposeEffectMult) parts.push(`露出效果×${eff.exposeEffectMult.toFixed(2)}`);
    if (eff.domEffectMult) parts.push(`支配效果×${eff.domEffectMult.toFixed(2)}`);
    if (eff.loveExpMult) parts.push(`爱情经验×${eff.loveExpMult.toFixed(2)}`);
    if (eff.lowSpPalamMult) parts.push('低气力时PALAM×1.3');
    return parts.length > 0 ? parts.join('，') : '无效果';
}

/**
 * 将所有刻印效果应用到角色的临时属性上
 * 应在每次训练开始前调用（或角色状态变化时）
 */
function applyMarkEffects(chara) {
    if (!chara) return;
    // 重置刻印相关临时属性
    const markKeys = [
        '_markRefuseMod', '_markStaminaSave', '_markCanAssist',
        '_markJoyMult', '_markOrgasmThreshold', '_markPostOrgasmSp',
        '_markServiceMult', '_markMasterStaminaSave', '_markPerTurnSp',
        '_markPainToJoy', '_markPainReduce', '_markSmMult', '_markRefuseJoyBonus',
        '_markAbnormalExpMult', '_markAbnormalRefuseMod', '_markAbnormalEffectMult',
        '_markShameToJoy', '_markExposeEffectMult', '_markAudienceBonus', '_markShameNoSpDrain',
        '_markDomEffectMult', '_markTargetYieldBonus', '_markSmDualJoy',
        '_markLoveExpMult', '_markRetainFactionTrait', '_markLowSpPalamMult'
    ];
    for (const k of markKeys) delete chara[k];

    for (let mid = 0; mid < 8; mid++) {
        const lv = chara.mark[mid] || 0;
        if (lv <= 0) continue;
        const eff = getMarkEffect(mid, lv);

        if (eff.refuseMod !== undefined) chara._markRefuseMod = (chara._markRefuseMod || 0) + eff.refuseMod;
        if (eff.staminaSave !== undefined) chara._markStaminaSave = (chara._markStaminaSave || 0) + eff.staminaSave;
        if (eff.canAssist) chara._markCanAssist = true;
        if (eff.joyMult !== undefined) chara._markJoyMult = (chara._markJoyMult || 1.0) * eff.joyMult;
        if (eff.orgasmThreshold !== undefined) chara._markOrgasmThreshold = (chara._markOrgasmThreshold || 0) + eff.orgasmThreshold;
        if (eff.postOrgasmSp !== undefined) chara._markPostOrgasmSp = (chara._markPostOrgasmSp || 0) + eff.postOrgasmSp;
        if (eff.serviceMult !== undefined) chara._markServiceMult = (chara._markServiceMult || 1.0) * eff.serviceMult;
        if (eff.masterStaminaSave !== undefined) chara._markMasterStaminaSave = (chara._markMasterStaminaSave || 0) + eff.masterStaminaSave;
        if (eff.perTurnSp !== undefined) chara._markPerTurnSp = (chara._markPerTurnSp || 0) + eff.perTurnSp;
        if (eff.painToJoy !== undefined) chara._markPainToJoy = (chara._markPainToJoy || 0) + eff.painToJoy;
        if (eff.painReduce !== undefined) chara._markPainReduce = (chara._markPainReduce || 0) + eff.painReduce;
        if (eff.joyBonus !== undefined) chara._markJoyBonus = (chara._markJoyBonus || 0) + eff.joyBonus;
        if (eff.smMult !== undefined) chara._markSmMult = (chara._markSmMult || 1.0) * eff.smMult;
        if (eff.refuseJoyBonus !== undefined) chara._markRefuseJoyBonus = (chara._markRefuseJoyBonus || 0) + eff.refuseJoyBonus;
        if (eff.abnormalExpMult !== undefined) chara._markAbnormalExpMult = (chara._markAbnormalExpMult || 1.0) * eff.abnormalExpMult;
        if (eff.abnormalRefuseMod !== undefined) chara._markAbnormalRefuseMod = (chara._markAbnormalRefuseMod || 0) + eff.abnormalRefuseMod;
        if (eff.abnormalEffectMult !== undefined) chara._markAbnormalEffectMult = (chara._markAbnormalEffectMult || 1.0) * eff.abnormalEffectMult;
        if (eff.shameToJoy !== undefined) chara._markShameToJoy = (chara._markShameToJoy || 0) + eff.shameToJoy;
        if (eff.exposeEffectMult !== undefined) chara._markExposeEffectMult = (chara._markExposeEffectMult || 1.0) * eff.exposeEffectMult;
        if (eff.audienceBonus !== undefined) chara._markAudienceBonus = (chara._markAudienceBonus || 0) + eff.audienceBonus;
        if (eff.shameNoSpDrain) chara._markShameNoSpDrain = true;
        if (eff.domEffectMult !== undefined) chara._markDomEffectMult = (chara._markDomEffectMult || 1.0) * eff.domEffectMult;
        if (eff.targetYieldBonus !== undefined) chara._markTargetYieldBonus = (chara._markTargetYieldBonus || 0) + eff.targetYieldBonus;
        if (eff.smDualJoy !== undefined) chara._markSmDualJoy = (chara._markSmDualJoy || 0) + eff.smDualJoy;
        if (eff.loveExpMult !== undefined) chara._markLoveExpMult = (chara._markLoveExpMult || 1.0) * eff.loveExpMult;
        if (eff.retainFactionTrait) chara._markRetainFactionTrait = true;
        if (eff.lowSpPalamMult !== undefined) chara._markLowSpPalamMult = (chara._markLowSpPalamMult || 1.0) * eff.lowSpPalamMult;
    }
}

/**
 * 获取角色所有刻印效果的汇总描述（用于UI显示）
 */
function getMarkBonusSummary(chara) {
    if (!chara) return [];
    const summary = [];
    for (let mid = 0; mid < 8; mid++) {
        const lv = chara.mark[mid] || 0;
        if (lv <= 0) continue;
        const def = MARK_EFFECTS[mid];
        summary.push({
            id: mid,
            name: def.name,
            level: lv,
            desc: getMarkEffectDescription(mid, lv)
        });
    }
    return summary;
}

// ============================================================
// 3. 特殊工具函数
// ============================================================

/**
 * mark[3] 反抗刻印：痛苦→快乐转化
 * 返回 { pain, pleasure } 转化后的数值
 */
function convertPainToPleasure(chara, painValue) {
    if (!chara || !painValue) return { pain: painValue || 0, pleasure: 0 };
    const ratio = chara._markPainToJoy || 0;
    if (ratio <= 0) return { pain: painValue, pleasure: 0 };
    // 先应用痛苦减免
    const painReduce = chara._markPainReduce || 0;
    let actualPain = painReduce > 0 ? Math.floor(painValue * (1 - painReduce)) : painValue;
    const converted = Math.floor(actualPain * ratio);
    actualPain -= converted;
    // Lv3额外快乐加成
    const joyBonus = chara._markJoyBonus || 0;
    const bonusPleasure = joyBonus > 0 ? Math.floor(converted * joyBonus) : 0;
    return { pain: Math.max(0, actualPain), pleasure: converted + bonusPleasure };
}

/**
 * 获取角色是否可以担任助手（mark[0] Lv3 或 routeLevel 任意路线达到 Stage V）
 */
function canAssist(chara) {
    if (!chara) return false;
    if (chara._markCanAssist) return true;
    if ((chara.mark[0] || 0) >= 3) return true;
    // Stage V 任意路线也可担任助手
    if (chara.routeLevel) {
        for (let i = 0; i < 5; i++) {
            if ((chara.routeLevel[i] || 0) >= 5) return true;
        }
    }
    return false;
}

/**
 * 新陷落判定：屈服刻印>=3 或 侍奉刻印>=3
 */
function isFallen(chara) {
    if (!chara) return false;
    return (chara.mark[0] || 0) >= 3 || (chara.mark[2] || 0) >= 3;
}

/**
 * 低气力时悲恋刻印加成检查
 */
function checkLowSpBonus(chara, spRatio) {
    if (!chara || spRatio === undefined) return 1.0;
    const mult = chara._markLowSpPalamMult || 1.0;
    if (mult <= 1.0) return 1.0;
    // SP比例低于30%时触发
    if (spRatio < 0.30) {
        return mult;
    }
    return 1.0;
}

// ============================================================
// 4. 导出
// ============================================================
window.MARK_EFFECTS = MARK_EFFECTS;
window.ROUTE_MARK_MAP = ROUTE_MARK_MAP;
window.getMarkEffect = getMarkEffect;
window.getMarkEffectDescription = getMarkEffectDescription;
window.applyMarkEffects = applyMarkEffects;
window.getMarkBonusSummary = getMarkBonusSummary;
window.convertPainToPleasure = convertPainToPleasure;
window.canAssist = canAssist;
window.isFallen = isFallen;
window.checkLowSpBonus = checkLowSpBonus;
