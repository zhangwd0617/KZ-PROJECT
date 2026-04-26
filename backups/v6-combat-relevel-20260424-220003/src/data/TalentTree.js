/**
 * TalentTree.js - Five Route Talent Tree Data
 * Routes: Obedience / Desire / Pain / Shame / Dominance
 * Stage 0-5 per route. Stage5 = assistantOnly.
 */

const TALENT_ROUTES = {
    0: { id: 0, code: "obedience", name: "\u987a\u4ece", juelType: 4, markType: 2, cflagId: 100, color: "#61afef", desc: "\u5c48\u670d\u4e0e\u5f7d\u5f0a\u4e4b\u8def" },
    1: { id: 1, code: "desire",    name: "\u6b32\u671b", juelType: 5, markType: 1, cflagId: 101, color: "#e06c75", desc: "\u8ffd\u6c42\u5feb\u611f\u4e4b\u8def" },
    2: { id: 2, code: "pain",      name: "\u75db\u82e6", juelType: 9, markType: 0, cflagId: 102, color: "#c678dd", desc: "\u75db\u82e6\u4e0e\u6b22\u6109\u4e4b\u8def" },
    3: { id: 3, code: "shame",     name: "\u9732\u51fa", juelType: 8, markType: 5, cflagId: 103, color: "#e5c07b", desc: "\u7f9e\u803b\u4e0e\u66b4\u9732\u4e4b\u8def" },
    4: { id: 4, code: "dominance", name: "\u652f\u914d", juelType: 20, markType: 3, cflagId: 104, color: "#98c379", desc: "\u63a7\u5236\u4e0e\u5f81\u670d\u4e4b\u8def" }
};

const ROUTE_CODE_MAP = { obedience: 0, desire: 1, pain: 2, shame: 3, dominance: 4 };

const TALENT_TREE = {
    // --- Obedience ---
    300: { id: 300, name: "\u6e29\u987a", route: 0, stage: 0,
           req: { abl: { 10: 1 }, routeLv: 0 },
           effect: { palamMods: { 4: 0.10 }, staminaMod: -0.05 },
           desc: "\u521d\u6b65\u987a\u4ece\uff0c\u670d\u4ece\u65f6PALAM\u589e\u52a0+10%\uff0c\u4f53\u529b\u6d88\u8017-5%" },
    301: { id: 301, name: "\u4e56\u5de7", route: 0, stage: 1,
           req: { abl: { 10: 2 }, mark: { 2: 1 }, routeLv: 1, juel: 100 },
           effect: { palamMods: { 4: 0.15, 17: 0.10 }, staminaMod: -0.08 },
           desc: "\u66f4\u52a0\u987a\u4ece\uff0c\u5c48\u670dPALAM+15%\uff0c\u5f7d\u5f0a\u65f6\u989d\u5916\u52a0\u6210" },
    302: { id: 302, name: "\u732e\u8eab", route: 0, stage: 2,
           req: { abl: { 10: 3 }, mark: { 2: 2 }, routeLv: 2, juel: 500, preTalent: [301] },
           effect: { palamMods: { 4: 0.20, 17: 0.15 }, staminaMod: -0.10, refuseMod: -0.15 },
           desc: "\u613f\u610f\u4e3a\u4e3b\u4eba\u732e\u8eab\uff0c\u62d2\u7edd\u7387\u5927\u5e45\u4e0b\u964d" },
    303: { id: 303, name: "\u5fe0\u72ac", route: 0, stage: 3,
           req: { abl: { 10: 4 }, mark: { 2: 3 }, routeLv: 3, juel: 2000, preTalent: [302] },
           effect: { palamMods: { 4: 0.25, 17: 0.20 }, staminaMod: -0.12, refuseMod: -0.25 },
           desc: "\u7edd\u5bf9\u7684\u5fe0\u8bda\uff0c\u51e0\u4e4e\u4e0d\u4f1a\u62d2\u7edd\u4efb\u4f55\u6307\u4ee4" },
    304: { id: 304, name: "\u5974\u96b6\u672c\u80fd", route: 0, stage: 4,
           req: { abl: { 10: 5 }, mark: { 2: 3 }, routeLv: 4, juel: 8000, exp: { 23: 30 }, preTalent: [303] },
           effect: { palamMods: { 4: 0.30, 17: 0.25 }, staminaMod: -0.15, refuseMod: -0.35, orgasmMod: 0.10 },
           desc: "\u6df1\u690d\u9aa8\u9ad3\u7684\u670d\u4ece\u672c\u80fd\uff0c\u7edd\u9876\u65f6\u4e5f\u60f3\u7740\u53d6\u60a6\u4e3b\u4eba" },
    305: { id: 305, name: "\u81f3\u9ad8\u7684\u5949\u4ed5\u8005", route: 0, stage: 5, assistantOnly: true,
           req: { abl: { 10: 6 }, routeLv: 5, juel: 30000, preTalent: [304] },
           effect: { palamMods: { 4: 0.15, 17: 0.15 }, staminaMod: -0.10, energyMod: 0.10 },
           desc: "\u3010\u52a9\u624b\u4e13\u7528\u3011\u4f5c\u4e3a\u52a9\u624b\u65f6\u4ee3\u884c\u6307\u4ee4\u6548\u679c+15%\uff0c\u6c14\u529b\u6062\u590d\u52a0\u5feb" },

    // --- Desire ---
    310: { id: 310, name: "\u597d\u5947", route: 1, stage: 0,
           req: { abl: { 11: 1 }, routeLv: 0 },
           effect: { palamMods: { 5: 0.10, 0: 0.05 }, energyMod: -0.05 },
           desc: "\u5bf9\u5feb\u611f\u4ea7\u751f\u597d\u5947\uff0c\u6b32\u60c5PALAM+10%\uff0c\u6c14\u529b\u6d88\u8017-5%" },
    311: { id: 311, name: "\u53d1\u60c5", route: 1, stage: 1,
           req: { abl: { 11: 2 }, mark: { 1: 1 }, routeLv: 1, juel: 100 },
           effect: { palamMods: { 5: 0.20, 0: 0.10, 3: 0.10 }, energyMod: -0.08 },
           desc: "\u8eab\u4f53\u5bb9\u6613\u8fdb\u5165\u53d1\u60c5\u72b6\u6001\uff0c\u5feb\u611f\u83b7\u5f97\u5168\u9762\u63d0\u5347" },
    312: { id: 312, name: "\u6deb\u4e71", route: 1, stage: 2,
           req: { abl: { 11: 3 }, mark: { 1: 2 }, routeLv: 2, juel: 500, preTalent: [311] },
           effect: { palamMods: { 5: 0.25, 0: 0.15, 1: 0.15 }, energyMod: -0.10, orgasmMod: 0.15 },
           desc: "\u8ffd\u6c42\u5feb\u611f\u7684\u6deb\u4e71\u4f53\u8d28\uff0c\u7edd\u9876\u5f3a\u5ea6+15%" },
    313: { id: 313, name: "\u5feb\u611f\u5974\u96b6", route: 1, stage: 3,
           req: { abl: { 11: 4 }, mark: { 1: 3 }, routeLv: 3, juel: 2000, preTalent: [312] },
           effect: { palamMods: { 5: 0.30, 0: 0.20, 1: 0.20, 2: 0.10 }, energyMod: -0.12, orgasmMod: 0.20 },
           desc: "\u4e3a\u5feb\u611f\u800c\u6d3b\uff0c\u6240\u6709\u90e8\u4f4d\u654f\u611f\u5ea6\u4e0a\u5347\uff0c\u7edd\u9876\u5f3a\u5ea6+20%" },
    314: { id: 314, name: "\u60c5\u6b32\u5316\u8eab", route: 1, stage: 4,
           req: { abl: { 11: 5 }, mark: { 1: 3 }, routeLv: 4, juel: 8000, exp: { 2: 50 }, preTalent: [313] },
           effect: { palamMods: { 5: 0.35, 0: 0.25, 1: 0.25, 2: 0.15 }, energyMod: -0.15, orgasmMod: 0.25, staminaMod: 0.10 },
           desc: "\u5feb\u611f\u5373\u662f\u4e00\u5207\uff0c\u7edd\u9876\u65f6\u8fdb\u5165\u7279\u6b8a\u53d1\u60c5\u6a21\u5f0f" },
    315: { id: 315, name: "\u6deb\u6b32\u4e4b\u6e90", route: 1, stage: 5, assistantOnly: true,
           req: { abl: { 11: 6 }, routeLv: 5, juel: 30000, preTalent: [314] },
           effect: { palamMods: { 5: 0.15, 0: 0.10 }, energyMod: 0.10, orgasmMod: 0.10 },
           desc: "\u3010\u52a9\u624b\u4e13\u7528\u3011\u4f5c\u4e3a\u52a9\u624b\u65f6\u534f\u52a9\u7684\u5feb\u611f\u4f20\u5bfc+15%" },

    // --- Pain ---
    320: { id: 320, name: "\u8010\u75db", route: 2, stage: 0,
           req: { abl: { 21: 1 }, routeLv: 0 },
           effect: { palamMods: { 9: 0.10, 16: 0.10 }, staminaMod: -0.05 },
           desc: "\u5f00\u59cb\u4ece\u75db\u82e6\u4e2d\u83b7\u5f97\u5f02\u5e38\u5feb\u611f\uff0c\u75db\u82e6PALAM+10%" },
    321: { id: 321, name: "\u88ab\u8650\u503e\u5411", route: 2, stage: 1,
           req: { abl: { 21: 2 }, mark: { 0: 1 }, routeLv: 1, juel: 100 },
           effect: { palamMods: { 9: 0.20, 16: 0.15 }, staminaMod: -0.08, refuseMod: -0.10 },
           desc: "SM\u6307\u4ee4\u62d2\u7edd\u7387\u4e0b\u964d\uff0c\u75db\u82e6\u8f6c\u5316\u4e3a\u5feb\u611f\u7684\u6548\u7387\u63d0\u5347" },
    322: { id: 322, name: "\u75db\u82e6\u6210\u763e", route: 2, stage: 2,
           req: { abl: { 21: 3 }, mark: { 0: 2 }, routeLv: 2, juel: 500, preTalent: [321] },
           effect: { palamMods: { 9: 0.25, 16: 0.20, 5: 0.10 }, staminaMod: -0.10, refuseMod: -0.15 },
           desc: "\u6ca1\u6709\u75db\u82e6\u5c31\u611f\u53d7\u4e0d\u5230\u5feb\u4e50\uff0c\u75db\u82e6\u65f6\u989d\u5916\u589e\u52a0\u6b32\u60c5" },
    323: { id: 323, name: "\u82e6\u75db\u4e4b\u95e8", route: 2, stage: 3,
           req: { abl: { 21: 4 }, mark: { 0: 3 }, routeLv: 3, juel: 2000, preTalent: [322] },
           effect: { palamMods: { 9: 0.30, 16: 0.25, 5: 0.15 }, staminaMod: -0.12, refuseMod: -0.20, orgasmMod: 0.15 },
           desc: "\u75db\u82e6\u662f\u901a\u5f80\u6781\u4e50\u7684\u95e8\u6249\uff0c\u7edd\u9876\u5f3a\u5ea6\u968f\u75db\u82e6\u7d2f\u79ef\u63d0\u5347" },
    324: { id: 324, name: "\u75db\u89c9\u5feb\u611f\u5230\u8fbe", route: 2, stage: 4,
           req: { abl: { 21: 5 }, mark: { 0: 3 }, routeLv: 4, juel: 8000, exp: { 30: 40 }, preTalent: [323] },
           effect: { palamMods: { 9: 0.35, 16: 0.30, 5: 0.20 }, staminaMod: -0.15, refuseMod: -0.25, orgasmMod: 0.25 },
           desc: "\u75db\u82e6\u4e0e\u5feb\u611f\u7684\u754c\u9650\u5b8c\u5168\u6a21\u7cca\uff0c\u4efb\u4f55\u523a\u6fc0\u90fd\u80fd\u901a\u5411\u7edd\u9876" },
    325: { id: 325, name: "\u75db\u82e6\u7684\u4f20\u9012\u8005", route: 2, stage: 5, assistantOnly: true,
           req: { abl: { 21: 6 }, routeLv: 5, juel: 30000, preTalent: [324] },
           effect: { palamMods: { 9: 0.15, 16: 0.15 }, staminaMod: -0.10 },
           desc: "\u3010\u52a9\u624b\u4e13\u7528\u3011\u4ee3\u884cSM\u6307\u4ee4\u65f6\u6548\u679c+20%\uff0c\u81ea\u8eab\u4e5f\u83b7\u5f97\u90e8\u5206\u5feb\u611f\u53cd\u9988" },

    // --- Shame ---
    330: { id: 330, name: "\u7f9e\u803b\u5fc3", route: 3, stage: 0,
           req: { abl: { 17: 1 }, routeLv: 0 },
           effect: { palamMods: { 8: 0.15, 5: 0.05 }, energyMod: -0.05 },
           desc: "\u7f9e\u803b\u5fc3\u6210\u4e3a\u5feb\u611f\u7684\u50ac\u5316\u5242\uff0c\u7f9e\u803bPALAM+15%" },
    331: { id: 331, name: "\u9732\u51fa\u7656", route: 3, stage: 1,
           req: { abl: { 17: 2 }, mark: { 5: 1 }, routeLv: 1, juel: 100 },
           effect: { palamMods: { 8: 0.25, 5: 0.10 }, energyMod: -0.08, refuseMod: -0.10 },
           desc: "\u5f00\u59cb\u6e34\u671b\u88ab\u6ce8\u89c6\uff0c\u9732\u51fa\u7c7b\u6307\u4ee4\u62d2\u7edd\u7387\u4e0b\u964d" },
    332: { id: 332, name: "\u7f9e\u803b\u5feb\u611f", route: 3, stage: 2,
           req: { abl: { 17: 3 }, mark: { 5: 2 }, routeLv: 2, juel: 500, preTalent: [331] },
           effect: { palamMods: { 8: 0.30, 5: 0.15, 0: 0.10 }, energyMod: -0.10, refuseMod: -0.15 },
           desc: "\u7f9e\u803b\u611f\u76f4\u63a5\u8f6c\u5316\u4e3a\u5feb\u611f\uff0c\u6709\u65c1\u89c2\u8005\u65f6\u6548\u679c\u7ffb\u500d" },
    333: { id: 333, name: "\u516c\u5f00\u5c55\u793a", route: 3, stage: 3,
           req: { abl: { 17: 4 }, mark: { 5: 3 }, routeLv: 3, juel: 2000, preTalent: [332] },
           effect: { palamMods: { 8: 0.35, 5: 0.20, 0: 0.15 }, energyMod: -0.12, refuseMod: -0.20, orgasmMod: 0.15 },
           desc: "\u6e34\u671b\u5728\u4f17\u4eba\u9762\u524d\u5c55\u793a\u6deb\u6001\uff0c\u6709\u526f\u5974\u5728\u573a\u65f6\u603b\u5feb\u611f+15%" },
    334: { id: 334, name: "\u7f9e\u803b\u7684\u6781\u9650", route: 3, stage: 4,
           req: { abl: { 17: 5 }, mark: { 5: 3 }, routeLv: 4, juel: 8000, exp: { 36: 30 }, preTalent: [333] },
           effect: { palamMods: { 8: 0.40, 5: 0.25, 0: 0.20 }, energyMod: -0.15, refuseMod: -0.25, orgasmMod: 0.25 },
           desc: "\u7f9e\u803b\u611f\u5b8c\u5168\u8f6c\u5316\u4e3a\u5feb\u611f\u5f15\u64ce\uff0c\u4efb\u4f55\u573a\u666fplay\u90fd\u80fd\u89e6\u53d1\u989d\u5916\u52a0\u6210" },
    335: { id: 335, name: "\u7f9e\u803b\u7684\u5f15\u5bfc\u8005", route: 3, stage: 5, assistantOnly: true,
           req: { abl: { 17: 6 }, routeLv: 5, juel: 30000, preTalent: [334] },
           effect: { palamMods: { 8: 0.15, 5: 0.10 }, energyMod: 0.10 },
           desc: "\u3010\u52a9\u624b\u4e13\u7528\u3011\u4f5c\u4e3a\u52a9\u624b\u5728\u573a\u65f6\uff0c\u4e3b\u5974\u7684\u7f9e\u803b/\u9732\u51fa\u7c7b\u5feb\u611f+15%" },

    // --- Dominance ---
    340: { id: 340, name: "\u5360\u6709\u6b32", route: 4, stage: 0,
           req: { abl: { 20: 1 }, routeLv: 0 },
           effect: { palamMods: { 20: 0.10, 5: 0.05 }, staminaMod: -0.05 },
           desc: "\u5bf9\u652f\u914d\u4ea7\u751f\u6e34\u671b\uff0c\u65bd\u8650\u65f6\u81ea\u8eab\u6c14\u529b\u6d88\u8017-5%" },
    341: { id: 341, name: "\u63a7\u5236\u6b32", route: 4, stage: 1,
           req: { abl: { 20: 2 }, mark: { 3: 1 }, routeLv: 1, juel: 100 },
           effect: { palamMods: { 20: 0.20, 5: 0.10 }, staminaMod: -0.08, refuseMod: -0.10 },
           desc: "\u6e34\u671b\u63a7\u5236\u5bf9\u65b9\u7684\u4e00\u5207\uff0c\u652f\u914d\u7c7b\u6307\u4ee4\u62d2\u7edd\u7387\u4e0b\u964d" },
    342: { id: 342, name: "\u652f\u914d\u8005", route: 4, stage: 2,
           req: { abl: { 20: 3 }, mark: { 3: 2 }, routeLv: 2, juel: 500, preTalent: [341] },
           effect: { palamMods: { 20: 0.25, 5: 0.15, 16: 0.10 }, staminaMod: -0.10, refuseMod: -0.15 },
           desc: "\u5929\u751f\u7684\u652f\u914d\u8005\u6c14\u8d28\uff0cSM\u6307\u4ee4\u6548\u679c\u63d0\u5347\uff0c\u5bf9\u65b9\u5c48\u670d\u589e\u52a0" },
    343: { id: 343, name: "\u7edd\u5bf9\u652f\u914d", route: 4, stage: 3,
           req: { abl: { 20: 4 }, mark: { 3: 3 }, routeLv: 3, juel: 2000, preTalent: [342] },
           effect: { palamMods: { 20: 0.30, 5: 0.20, 16: 0.15 }, staminaMod: -0.12, refuseMod: -0.20, orgasmMod: 0.10 },
           desc: "\u652f\u914d\u7684\u6c14\u573a\u4ee4\u4eba\u65e0\u6cd5\u62b5\u6297\uff0c\u5bf9\u65b9\u7684\u62d2\u7edd\u7387\u5168\u9762\u4e0b\u964d" },
    344: { id: 344, name: "\u738b\u8005\u7684\u6109\u60a6", route: 4, stage: 4,
           req: { abl: { 20: 5 }, mark: { 3: 3 }, routeLv: 4, juel: 8000, exp: { 33: 30 }, preTalent: [343] },
           effect: { palamMods: { 20: 0.35, 5: 0.25, 16: 0.20 }, staminaMod: -0.15, refuseMod: -0.25, orgasmMod: 0.20 },
           desc: "\u652f\u914d\u672c\u8eab\u5c31\u662f\u6700\u5927\u7684\u5feb\u611f\uff0c\u63a7\u5236\u5bf9\u65b9\u7edd\u9876\u65f6\u83b7\u5f97\u53cc\u500d\u6ee1\u8db3" },
    345: { id: 345, name: "\u5171\u72af\u8005", route: 4, stage: 5, assistantOnly: true,
           req: { abl: { 20: 6 }, routeLv: 5, juel: 30000, preTalent: [344] },
           effect: { palamMods: { 20: 0.15, 5: 0.10 }, staminaMod: -0.10, energyMod: 0.10 },
           desc: "\u3010\u52a9\u624b\u4e13\u7528\u3011\u53c2\u4e0e\u6a21\u5f0f\u65f6\u4ee3\u884c/\u53c2\u4e0e\u6548\u679c+15%\uff0c\u53cc\u65b9\u6c14\u529b\u6d88\u8017\u964d\u4f4e" }
};

// Group by route+stage for fast lookup
const TALENT_TREE_BY_ROUTE = {};
for (let r = 0; r < 5; r++) { TALENT_TREE_BY_ROUTE[r] = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] }; }
for (const tid in TALENT_TREE) {
    const n = TALENT_TREE[tid];
    TALENT_TREE_BY_ROUTE[n.route][n.stage].push(n);
}

function checkTalentTreeUnlock(chara, node) {
    if (!chara || !node) return { unlock: false, reasons: ["\u89d2\u8272\u6216\u8282\u70b9\u4e0d\u5b58\u5728"] };
    if (chara.talent[node.id] > 0) return { unlock: false, reasons: ["\u5df2\u62e5\u6709\u8be5\u7d20\u8d28"] };
    const reasons = [];
    const req = node.req || {};
    if (req.routeLv !== undefined) {
        const routeLv = (chara.routeLevel && chara.routeLevel[node.route]) || 0;
        if (routeLv < req.routeLv) reasons.push(`${TALENT_ROUTES[node.route].name}\u8def\u7ebf\u7b49\u7ea7\u4e0d\u8db3 (${routeLv}/${req.routeLv})`);
    }
    if (req.abl) {
        for (const ablId in req.abl) {
            const need = req.abl[ablId], has = chara.abl[parseInt(ablId)] || 0;
            if (has < need) {
                const name = (typeof ABL_DEFS !== 'undefined' && ABL_DEFS[ablId]) ? (ABL_DEFS[ablId].name || ABL_DEFS[ablId]) : `ABL[${ablId}]`;
                reasons.push(`${name}\u4e0d\u8db3 (${has}/${need})`);
            }
        }
    }
    if (req.mark) {
        for (const markId in req.mark) {
            const need = req.mark[markId], has = chara.mark[parseInt(markId)] || 0;
            if (has < need) {
                const name = (typeof MARK_DEFS !== 'undefined' && MARK_DEFS[markId]) ? (MARK_DEFS[markId].name || MARK_DEFS[markId]) : `\u523b\u5370[${markId}]`;
                reasons.push(`${name}\u4e0d\u8db3 (${has}/${need})`);
            }
        }
    }
    if (req.juel !== undefined) {
        const juelType = TALENT_ROUTES[node.route].juelType;
        const has = chara.juel[juelType] || 0;
        if (has < req.juel) reasons.push(`\u73e0\u5b50\u4e0d\u8db3 (${has}/${req.juel})`);
    }
    if (req.exp) {
        for (const expId in req.exp) {
            const need = req.exp[expId], has = chara.exp[parseInt(expId)] || 0;
            if (has < need) {
                const name = (typeof EXP_DEFS !== 'undefined' && EXP_DEFS[expId]) ? (EXP_DEFS[expId].name || EXP_DEFS[expId]) : `\u7ecf\u9a8c[${expId}]`;
                reasons.push(`${name}\u4e0d\u8db3 (${has}/${need})`);
            }
        }
    }
    if (req.preTalent) {
        for (const preId of req.preTalent) {
            if (!chara.talent[preId] || chara.talent[preId] <= 0) {
                const preName = TALENT_TREE[preId] ? TALENT_TREE[preId].name : `\u7d20\u8d28[${preId}]`;
                reasons.push(`\u9700\u8981\u5148\u83b7\u5f97\u300c${preName}\u300d`);
            }
        }
    }
    return { unlock: reasons.length === 0, reasons };
}

function tryUnlockTalent(chara, node) {
    const check = checkTalentTreeUnlock(chara, node);
    if (!check.unlock) return { success: false, msg: `\u89e3\u9501\u300c${node.name}\u300d\u5931\u8d25\uff1a${check.reasons.join("\uff0c")}` };
    if (node.req && node.req.juel !== undefined) {
        const juelType = TALENT_ROUTES[node.route].juelType;
        chara.juel[juelType] -= node.req.juel;
    }
    chara.talent[node.id] = 1;
    return { success: true, msg: `\u3010${chara.name}\u83b7\u5f97\u4e86\u300c${node.name}\u300d\uff01\u3011` };
}

function getRouteTalentStage(chara, routeId) {
    const stages = TALENT_TREE_BY_ROUTE[routeId];
    if (!stages) return 0;
    for (let s = 5; s >= 0; s--) {
        for (const node of (stages[s] || [])) {
            if (chara.talent[node.id] > 0) return s;
        }
    }
    return 0;
}

function getUnlockableTalents(chara) {
    const result = [];
    for (const tid in TALENT_TREE) {
        const node = TALENT_TREE[tid];
        const check = checkTalentTreeUnlock(chara, node);
        if (check.unlock) result.push({ node, check });
    }
    return result;
}

window.TALENT_ROUTES = TALENT_ROUTES;
window.TALENT_TREE = TALENT_TREE;
window.TALENT_TREE_BY_ROUTE = TALENT_TREE_BY_ROUTE;
window.checkTalentTreeUnlock = checkTalentTreeUnlock;
window.tryUnlockTalent = tryUnlockTalent;
window.getRouteTalentStage = getRouteTalentStage;
window.getUnlockableTalents = getUnlockableTalents;
