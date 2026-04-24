/**
 * Character Class — Full Emuera parallel array architecture
 * Each character has: BASE/MAXBASE, ABL, TALENT, PALAM, EXP, CFLAG, JUEL, MARK, EQUIP, TEQUIP, SOURCE, etc.
 */
class Character {
    constructor(templateId = -1) {
        this.no = templateId;           // 模板ID
        this.name = "";
        this.callname = "";
        this.nickname = "";

        // Base stats (HP/MP/Stamina etc.)
        this.base = new Array(30).fill(0);
        this.maxbase = new Array(30).fill(0);

        // Ability levels
        this.abl = new Array(110).fill(0);

        // Talents (0=none, >0=has/level)
        this.talent = new Array(1000).fill(0);

        // Current params (real-time training state)
        this.palam = new Array(120).fill(0);

        // Experience counters
        this.exp = new Array(100).fill(0);

        // Character flags
        this.cflag = new Array(1000).fill(0);

        // Juel (for ability upgrades)
        this.juel = new Array(120).fill(0);

        // 刻印
        this.mark = new Array(20).fill(0);

        // 装备
        this.equip = new Array(30).fill(0);

        // Training equipment/status
        this.tequip = new Array(30).fill(0);

        // Gear system: armor/weapon/items
        this.gear = { head: null, body: null, legs: null, hands: null, neck: null, ring: null, weapons: [], items: [] };

        // String storage
        this.cstr = new Array(100).fill("");

        // Relation flags
        this.relation = new Array(200).fill(0);

        // 相性值 (0-100)
        this.affinity = 50;

        // 个人声望（勇者/前勇者用）
        this.fame = 0;

        // Current training source accumulation
        this.source = new Array(30).fill(0);

        // ========== NEW SYSTEMS (P1+) ==========
        // Stamina & Energy (slave-only dual bars)
        // stamina maps to base[2] with extension; energy uses cflag[16]
        this._energy = 100;           // current energy (0-100)
        this._maxEnergy = 100;        // max energy

        // Orgasm system: 8 part gauges (C/V/A/B/N/O/W/P)
        // C=0 Clitoris, V=1 Vagina, A=2 Anus, B=3 Breasts, N=4 Nipples, O=5 Mouth, W=6 Womb, P=7 Penis
        this.partGauge = new Array(8).fill(0);
        this.totalOrgasmGauge = 0;    // 0-100%+ (climax threshold)
        this.orgasmCooldown = new Array(8).fill(0); // cooldown turns per part
        this.lastOrgasmType = -1;     // last orgasm type id

        // Charge state
        this.isCharging = false;
        this.chargeLevel = 0;         // 0-3 / overcharge
        this.chargeTurns = 0;         // turns spent charging

        // Personality (generated via PersonalitySystem)
        this.personality = null;      // { main, sub:[], minors:[], hidden:{traitId,revealed,full,progress} }

        // Genital configuration
        this.genitalConfig = null;    // { hasVagina, hasWomb, penises:[], orgasmSystem }

        // Route system
        this.routeExp = new Array(5).fill(0);    // exp per route
        this.routeLevel = new Array(5).fill(0);  // level per route (0-5)
        this.trainLevel = 0;                     // overall train level
        this.routePoints = 0;                    // points to allocate

        // Route allocation (V2.0 doc: 1 main + 2 sub max)
        this.mainRoute = -1;                     // -1 = not chosen, 0-4 = main route
        this.subRoutes = [];                     // max 2 auxiliary routes

        // Assistant qualification
        this._assistantBuff = null;
        this._routeExpBonus = {};

        // Assistant temporary stamina (V3.0 doc: enabled during delegate/participate, max 80)
        this._assistantStamina = 80;
        this._assistantMaxStamina = 80;

        // Bystander tracking
        this._bystanderCount = 0;                // cumulative bystander sessions

        // 固有编号(角色管理用)
        this.id = Character._nextId++;
    }

    static _nextId = 0;

    // ========== Base stat shortcuts ==========
    get hp() { return this.base[0]; }
    set hp(v) { this.base[0] = v; }
    get maxHp() { return this.maxbase[0]; }
    set maxHp(v) { this.maxbase[0] = v; }

    get mp() { return this.base[1]; }
    set mp(v) { this.base[1] = v; }
    get maxMp() { return this.maxbase[1]; }
    set maxMp(v) { this.maxbase[1] = v; }

    get stamina() { return this.base[2]; }
    set stamina(v) { this.base[2] = v; }

    get level() { return this.cflag[9]; }
    set level(v) { this.cflag[9] = v; }

    get atk() { return this.cflag[11]; }
    set atk(v) { this.cflag[11] = v; }
    get def() { return this.cflag[12]; }
    set def(v) { this.cflag[12] = v; }

    // 角色持有金币（勇者/前勇者用）
    get gold() { return this.cflag[800] || 0; }
    set gold(v) { this.cflag[800] = Math.max(0, v); }
    addGold(v) { this.gold += v; }

    // ========== Energy (气力) ==========
    get energy() { return this._energy; }
    set energy(v) { this._energy = Math.max(0, Math.min(this._maxEnergy, v)); }
    get maxEnergy() { return this._maxEnergy; }
    set maxEnergy(v) { this._maxEnergy = Math.max(10, v); }
    addEnergy(v) { this.energy += v; }

    // ========== Energy state machine (V3.0 doc) ==========
    // Boundaries: 81% / 51% / 31% / 11% / 1%
    // Lower energy = higher PALAM gain (mental defense collapse)
    getEnergyState() {
        const pct = this._maxEnergy > 0 ? this._energy / this._maxEnergy : 1;
        if (pct > 0.81) {
            return {
                state: "awake", name: "\u6e05\u9192",
                palamMult: 0.85, refuseMod: 0.15, orgasmThresholdMod: 0.25,
                desc: "\u62d2\u7edd\u7387+15% \u7edd\u9876\u95e8\u69db+25%",
                color: "#98c379",
                special: { name: "\u6323\u624e", chance: 0.10, effect: "struggle" }
            };
        }
        if (pct > 0.51) {
            return {
                state: "wavering", name: "\u52a8\u6447",
                palamMult: 1.00, refuseMod: 0, orgasmThresholdMod: 0,
                desc: "\u57fa\u51c6\u7ebf",
                color: "#e5c07b", special: null
            };
        }
        if (pct > 0.31) {
            return {
                state: "dazed", name: "\u604d\u60da",
                palamMult: 1.25, refuseMod: -0.20, orgasmThresholdMod: -0.20,
                desc: "\u62d2\u7edd\u7387-20% \u7edd\u9876\u95e8\u69d4-20% \u7f9e\u803b\u8f6c\u5feb\u4e50",
                color: "#e06c75",
                special: { name: "\u7f9e\u803b\u8f6c\u5feb\u4e50", effect: "shame_to_joy" }
            };
        }
        if (pct > 0.11) {
            return {
                state: "collapsing", name: "\u5d29\u89e3",
                palamMult: 1.50, refuseMod: -0.40, orgasmThresholdMod: -0.35,
                desc: "\u62d2\u7edd\u7387-40% \u7edd\u9876\u95e8\u69d4-35% 10%\u5931\u795e",
                color: "#c678dd",
                special: { name: "\u5931\u795e", chance: 0.10, effect: "faint" }
            };
        }
        if (pct > 0.01) {
            return {
                state: "broken", name: "\u574f\u6389",
                palamMult: 1.80, refuseMod: 0, orgasmThresholdMod: -0.50,
                desc: "\u62d2\u7edd\u73870% \u7edd\u9876\u95e8\u69d4-50% \u6bcf\u56de\u5408-3%\u4f53\u529b",
                color: "#ff3333",
                special: { name: "\u4f53\u529b\u81ea\u6bc1", effect: "self_destruct" }
            };
        }
        // 0% - collapsed
        return {
            state: "collapsed", name: "\u5d29\u6e83",
            palamMult: 2.00, refuseMod: 0, orgasmThresholdMod: -0.50,
            desc: "PALAM\u00d72.0 \u7d20\u8d28\u83b7\u53d6 \u4e0b\u56de\u5408\u6062\u590d15%",
            color: "#ff0000",
            special: { name: "\u5d29\u6e83\u7ed3\u7b97", effect: "collapse_settlement" }
        };
    }

    getEnergyMultiplier() {
        return this.getEnergyState().palamMult || 1.0;
    }

    // ========== Route allocation (1 main + 2 sub) ==========
    getRouteExpMultiplier(routeId) {
        if (this.mainRoute < 0) return 1.0; // not chosen: all routes 100%
        if (routeId === this.mainRoute) return 1.0;
        if (this.subRoutes.includes(routeId)) return 0.5;
        return 0.0; // other routes get no exp
    }

    setMainRoute(routeId) {
        if (routeId < -1 || routeId >= 5) return false;
        this.mainRoute = routeId;
        // Remove from subRoutes if present
        if (routeId >= 0) {
            this.subRoutes = this.subRoutes.filter(r => r !== routeId);
        }
        return true;
    }

    toggleSubRoute(routeId) {
        if (routeId < 0 || routeId >= 5) return { action: 'invalid', routeId };
        if (routeId === this.mainRoute) return { action: 'isMain', routeId };
        const idx = this.subRoutes.indexOf(routeId);
        if (idx >= 0) {
            this.subRoutes.splice(idx, 1);
            return { action: 'removed', routeId };
        } else {
            if (this.subRoutes.length >= 2) return { action: 'full', routeId };
            this.subRoutes.push(routeId);
            return { action: 'added', routeId };
        }
    }

    getRouteAllocationLabel() {
        const names = ['顺从','欲望','痛苦','露出','支配'];
        if (this.mainRoute < 0) return '未分配';
        let s = names[this.mainRoute];
        if (this.subRoutes.length > 0) {
            s += ' + ' + this.subRoutes.map(r => names[r]).join('/');
        }
        return s;
    }

    // ========== Talent check shortcuts ==========
    hasTalent(id) { return this.talent[id] > 0; }
    setTalent(id, value = 1) { this.talent[id] = value; }
    removeTalent(id) { this.talent[id] = 0; }

    // Get personality
    getPersonality() {
        for (let i = 10; i <= 18; i++) if (this.talent[i]) return i;
        for (let i = 160; i <= 179; i++) if (this.talent[i]) return i;
        return -1;
    }

    getPersonalityName() {
        const p = this.getPersonality();
        return TALENT_DEFS[p]?.name || "普通";
    }

    // ========== Training param operations ==========
    addPalam(id, value) {
        this.palam[id] = Math.max(0, this.palam[id] + value);
    }

    addSource(id, value) {
        this.source[id] += value;
    }

    addExp(id, value = 1) {
        this.exp[id] += value;
    }

    addJuel(id, value) {
        this.juel[id] += value;
    }

    // ========== Mark operations ==========
    addMark(id, value = 1) {
        const max = MARK_DEFS[id]?.max || 3;
        this.mark[id] = Math.min(max, this.mark[id] + value);
    }

    addAbl(id, value = 1) {
        const max = ABLUP_CONDITIONS[id]?.maxLv || 10;
        this.abl[id] = Math.min(max, (this.abl[id] || 0) + value);
    }

    // ========== Ability upgrade ==========
    canAblUp(ablId) {
        const info = this._getAblUpInfo(ablId);
        return info && info.can;
    }

    getAblUpStatus(ablId) {
        return this._getAblUpInfo(ablId);
    }

    doAblUp(ablId) {
        if (!this.canAblUp(ablId)) return false;
        const info = this._getAblUpInfo(ablId);
        this.juel[info.juelType] -= info.need;
        this.abl[ablId]++;

        // 应用升级特殊效果
        const newLevel = this.abl[ablId];
        const effects = ABLUP_EFFECTS[ablId];
        if (effects && effects[newLevel]) {
            const eff = effects[newLevel];
            if (eff.text) {
                const msg = eff.text.replace(/\$\{name\}/g, this.name);
                UI.appendText(msg, "success");
            }
            if (eff.talent) {
                for (const tid in eff.talent) {
                    if (!this.hasTalent(parseInt(tid))) {
                        this.setTalent(parseInt(tid), eff.talent[tid]);
                    }
                }
            }
        }

        return true;
    }

    _getAblUpInfo(ablId) {
        const current = this.abl[ablId];
        const cond = ABLUP_CONDITIONS[ablId];
        if (!cond) return null;
        if (current >= cond.maxLv) return null;

        const need = ABLUP_COST_TABLE[current] || 9999999;
        const juelType = cond.juelType;
        const hasJuel = this.juel[juelType] >= need;

        // 检查经验条件
        let expOk = true;
        let expNeed = 0;
        let expHas = 0;
        if (cond.expCond) {
            for (const expId in cond.expCond) {
                const thresholds = cond.expCond[expId];
                const required = thresholds[Math.min(current, thresholds.length - 1)];
                expNeed = required;
                expHas = this.exp[parseInt(expId)] || 0;
                if (expHas < required) {
                    expOk = false;
                    break;
                }
            }
        }

        // 检查刻印条件
        let markOk = true;
        let markNeed = 0;
        let markHas = 0;
        if (cond.markCond) {
            for (const markId in cond.markCond) {
                const thresholds = cond.markCond[markId];
                const required = thresholds[Math.min(current, thresholds.length - 1)];
                markNeed = required;
                markHas = this.mark[parseInt(markId)] || 0;
                if (markHas < required) {
                    markOk = false;
                    break;
                }
            }
        }

        return {
            can: hasJuel && expOk && markOk,
            need,
            juelType,
            hasJuel,
            expOk,
            expNeed,
            expHas,
            markOk,
            markNeed,
            markHas,
            current,
            next: current + 1,
            maxLv: cond.maxLv
        };
    }

    // ========== Status recovery ==========
    recoverHp(rate = 1.0) {
        this.base[0] = Math.min(this.maxbase[0], this.base[0] + Math.floor(this.maxbase[0] * rate));
    }
    recoverMp(rate = 1.0) {
        this.base[1] = Math.min(this.maxbase[1], this.base[1] + Math.floor(this.maxbase[1] * rate));
    }

    // ========== Training start/end cleanup ==========
    resetForTrain() {
        // 清空本次source
        this.source.fill(0);
        // 部分TEQUIP需要重置
        // 保留某些持续状态
    }

    endTrain() {
        // PALAM → JUEL 转换
        this._convertPalamToJuel();
        // 清空PALAM
        this.palam.fill(0);
        // 清空SOURCE
        this.source.fill(0);
        // 恢复少量体力
        this.recoverHp(0.1);
        this.recoverMp(0.2);
    }

    _convertPalamToJuel() {
        for (let i = 0; i < this.palam.length; i++) {
            const val = this.palam[i];
            if (val <= 0) continue;
            // 查找阈值
            let gain = 0;
            let remaining = val;
            for (const tier of PALAM_TO_JUEL) {
                if (remaining >= tier.threshold) {
                    gain += tier.ratio;
                }
            }
            // 简化: 每100点PALAM = 1点JUEL (保底)
            gain = Math.max(gain, Math.floor(val / 100));
            this.juel[i] += gain;
        }
    }

    // ========== Route System ==========
    addRouteExp(routeId, value) {
        if (routeId < 0 || routeId >= 5 || value <= 0) return 0;
        const mult = this.getRouteExpMultiplier(routeId);
        const gain = Math.floor(value * mult);
        const oldLv = this.routeLevel[routeId] || 0;
        this.routeExp[routeId] = (this.routeExp[routeId] || 0) + gain;
        // Level up thresholds: 0->1:100, 1->2:300, 2->3:600, 3->4:1000, 4->5:1500
        const thresholds = [0, 100, 300, 600, 1000, 1500];
        let newLv = oldLv;
        while (newLv < 5 && this.routeExp[routeId] >= thresholds[newLv + 1]) {
            newLv++;
        }
        if (newLv > oldLv) {
            this.routeLevel[routeId] = newLv;
            this.routePoints += (newLv - oldLv);
            // Grant accelerator talent automatically
            if (typeof onRouteLevelUp === 'function') {
                for (let lv = oldLv + 1; lv <= newLv; lv++) {
                    const result = onRouteLevelUp(this, routeId, lv);
                    if (result && typeof UI !== 'undefined') UI.appendText(result.msg + "\n", "accent");
                }
            }
            if (typeof applyRouteAccelerators === 'function') applyRouteAccelerators(this);
        }
        return gain;
    }

    addTrainExp(value) {
        if (value <= 0) return;
        const oldLevel = this.trainLevel || 0;
        // Train exp thresholds (same pattern)
        const thresholds = [0, 50, 150, 300, 500, 800, 1200, 1700, 2300, 3000];
        this.trainLevel = (this.trainLevel || 0) + value;
        let newLevel = 0;
        while (newLevel < 9 && this.trainLevel >= thresholds[newLevel + 1]) newLevel++;
        if (newLevel > oldLevel) {
            this.routePoints += (newLevel - oldLevel) * 2;
            if (typeof UI !== 'undefined') UI.appendText(`【${this.name}\u7684\u8c03\u6559\u7b49\u7ea7\u63d0\u5347\u5230 Lv.${newLevel}！\u83b7\u5f97${(newLevel - oldLevel) * 2}\u70b9\u8def\u7ebf\u70b9\u6570】\n`, "accent");
        }
    }

    allocateRoutePoint(routeId) {
        if (this.routePoints <= 0) return false;
        if (routeId < 0 || routeId >= 5) return false;
        this.routePoints--;
        this.routeExp[routeId] = (this.routeExp[routeId] || 0) + 50;
        // Re-check level up
        const thresholds = [0, 100, 300, 600, 1000, 1500];
        const oldLv = this.routeLevel[routeId] || 0;
        let newLv = oldLv;
        while (newLv < 5 && this.routeExp[routeId] >= thresholds[newLv + 1]) newLv++;
        if (newLv > oldLv) {
            this.routeLevel[routeId] = newLv;
            if (typeof onRouteLevelUp === 'function') {
                for (let lv = oldLv + 1; lv <= newLv; lv++) {
                    const result = onRouteLevelUp(this, routeId, lv);
                    if (result && typeof UI !== 'undefined') UI.appendText(result.msg + "\n", "accent");
                }
            }
            if (typeof applyRouteAccelerators === 'function') applyRouteAccelerators(this);
        }
        return true;
    }

    checkTalentTree() {
        if (typeof getUnlockableTalents !== 'function') return [];
        const unlockable = getUnlockableTalents(this);
        const results = [];
        for (const { node } of unlockable) {
            const result = tryUnlockTalent(this, node);
            if (result && result.success) results.push(result);
        }
        return results;
    }

    // ========== Personality Effects (wrapper) ==========
    getPersonalityEffects() {
        if (typeof getPersonalityEffects === 'function') {
            return getPersonalityEffects(this);
        }
        return { palamMods: {}, refuseMod: 0, staminaMod: 0, energyMod: 0, orgasmMod: 0, activeModes: [], uiColors: [] };
    }

    // ========== Orgasm System: Part Gauge ==========
    addPartGain(partCode, value) {
        const codeMap = { C: 0, V: 1, A: 2, B: 3, N: 4, O: 5, W: 6, P: 7 };
        const idx = (typeof partCode === 'string') ? codeMap[partCode.toUpperCase()] : partCode;
        if (idx === undefined || idx < 0 || idx >= 8) return 0;
        if (this.orgasmCooldown[idx] > 0) {
            value = Math.floor(value * 0.3); // 70% reduction during cooldown
        }
        this.partGauge[idx] = Math.max(0, (this.partGauge[idx] || 0) + Math.floor(value));
        return this.partGauge[idx];
    }

    decayUnstimulatedParts(stimulatedArray) {
        const stimulated = new Set(stimulatedArray || []);
        for (let i = 0; i < 8; i++) {
            if (!stimulated.has(i) && this.partGauge[i] > 0) {
                this.partGauge[i] = Math.floor(this.partGauge[i] * 0.92); // 8% decay
            }
        }
    }

    getDominantPart() {
        let max = 0, dom = -1;
        for (let i = 0; i < 8; i++) {
            if (this.partGauge[i] > max) { max = this.partGauge[i]; dom = i; }
        }
        return { index: dom, value: max, code: ["C","V","A","B","N","O","W","P"][dom] || null };
    }

    // ========== Assistant System ==========
    isQualifiedAssistant() {
        // Basic qualification: has at least one route level >= 2 OR has fallen talent (85/86/182)
        const maxRoute = Math.max(...this.routeLevel);
        const hasFallen = this.talent[85] || this.talent[86] || this.talent[182];
        return maxRoute >= 2 || hasFallen;
    }

    getFallenDepth() {
        const maxRouteLv = Math.max(...this.routeLevel);
        if (maxRouteLv >= 5) return 3;
        if (maxRouteLv >= 4) return 2;
        if (maxRouteLv >= 3) return 1;
        return 0;
    }

    getAssistantBuff() {
        if (!this.isQualifiedAssistant()) return null;
        const depth = this.getFallenDepth();
        if (depth === 0) return null;
        const mainRoute = this.mainRoute >= 0 ? this.mainRoute : 0;
        const routeLabels = ['\u8f85\u52a9\u4e2d', '\u717d\u60c5\u4e2d', '\u65bd\u538b\u4e2d', '\u5c55\u793a\u4e2d', '\u9a7e\u5fa1\u4e2d'];
        const label = routeLabels[mainRoute] || '\u8f85\u52a9\u4e2d';
        return {
            type: label,
            depth: depth,
            hearts: '\u2665'.repeat(depth),
            palamBoost: depth * 0.10,
            refuseMod: depth >= 2 ? -(depth - 1) * 0.05 : 0,
            stage5: this._assistantBuff || null
        };
    }

    getFallenDepth() {
        // Returns 0-5 based on fallen-related talents
        if (this.talent[86]) return 5; // Blind faith
        if (this.talent[182]) return 4; // Beloved
        if (this.talent[85]) return 3; // Love
        if (this.talent[76]) return 2; // Lewd
        if (this.talent[70]) return 1; // Accept pleasure
        return 0;
    }

    // ========== Hidden Trait ==========
    checkHiddenTraitUnlock() {
        if (typeof checkHiddenTraitUnlock === 'function') {
            return checkHiddenTraitUnlock(this);
        }
        return null;
    }

    // ========== 序列化 ==========
    serialize() {
        return {
            no: this.no,
            name: this.name,
            callname: this.callname,
            nickname: this.nickname,
            base: [...this.base],
            maxbase: [...this.maxbase],
            abl: [...this.abl],
            talent: [...this.talent],
            palam: [...this.palam],
            exp: [...this.exp],
            cflag: [...this.cflag],
            juel: [...this.juel],
            mark: [...this.mark],
            equip: [...this.equip],
            tequip: [...this.tequip],
            gear: JSON.parse(JSON.stringify(this.gear)),
            cstr: [...this.cstr],
            relation: [...this.relation],
            affinity: this.affinity,
            fame: this.fame,
            id: this.id,
            // P1+ new fields
            _energy: this._energy,
            _maxEnergy: this._maxEnergy,
            partGauge: [...this.partGauge],
            totalOrgasmGauge: this.totalOrgasmGauge,
            orgasmCooldown: [...this.orgasmCooldown],
            lastOrgasmType: this.lastOrgasmType,
            isCharging: this.isCharging,
            chargeLevel: this.chargeLevel,
            chargeTurns: this.chargeTurns,
            personality: this.personality ? JSON.parse(JSON.stringify(this.personality)) : null,
            genitalConfig: this.genitalConfig ? JSON.parse(JSON.stringify(this.genitalConfig)) : null,
            routeExp: [...this.routeExp],
            routeLevel: [...this.routeLevel],
            trainLevel: this.trainLevel,
            routePoints: this.routePoints,
            mainRoute: this.mainRoute,
            subRoutes: [...this.subRoutes],
            _bystanderCount: this._bystanderCount,
            _assistantBuff: this._assistantBuff ? JSON.parse(JSON.stringify(this._assistantBuff)) : null,
            _routeExpBonus: JSON.parse(JSON.stringify(this._routeExpBonus || {}))
        };
    }

    static deserialize(data) {
        const c = new Character(data.no);
        c.name = data.name;
        c.callname = data.callname;
        c.nickname = data.nickname;
        c.base = [...data.base];
        c.maxbase = [...data.maxbase];
        c.abl = [...data.abl];
        c.talent = [...data.talent];
        c.palam = [...data.palam];
        c.exp = [...data.exp];
        c.cflag = [...data.cflag];
        c.juel = [...data.juel];
        c.mark = [...data.mark];
        c.equip = [...data.equip];
        c.tequip = [...data.tequip];
        c.gear = data.gear ? JSON.parse(JSON.stringify(data.gear)) : { head: null, body: null, legs: null, hands: null, neck: null, ring: null, weapons: [], items: [] };
        c.cstr = [...data.cstr];
        c.relation = [...data.relation];
        c.affinity = data.affinity !== undefined ? data.affinity : 50;
        c.fame = data.fame !== undefined ? data.fame : 0;
        c.id = data.id;
        // P1+ backward compat: init new fields if missing
        c._energy = data._energy !== undefined ? data._energy : 100;
        c._maxEnergy = data._maxEnergy !== undefined ? data._maxEnergy : 100;
        c.partGauge = data.partGauge ? [...data.partGauge] : new Array(8).fill(0);
        c.totalOrgasmGauge = data.totalOrgasmGauge !== undefined ? data.totalOrgasmGauge : 0;
        c.orgasmCooldown = data.orgasmCooldown ? [...data.orgasmCooldown] : new Array(8).fill(0);
        c.lastOrgasmType = data.lastOrgasmType !== undefined ? data.lastOrgasmType : -1;
        c.isCharging = data.isCharging || false;
        c.chargeLevel = data.chargeLevel !== undefined ? data.chargeLevel : 0;
        c.chargeTurns = data.chargeTurns !== undefined ? data.chargeTurns : 0;
        c.personality = data.personality || { main: -1, sub: -1, minors: [], hidden: { traitId: -1, revealed: false } };
        c.genitalConfig = data.genitalConfig || { hasVagina: true, hasWomb: true, penises: [], orgasmSystem: "standard" };
        c.routeExp = data.routeExp ? [...data.routeExp] : new Array(5).fill(0);
        c.routeLevel = data.routeLevel ? [...data.routeLevel] : new Array(5).fill(0);
        c.trainLevel = data.trainLevel !== undefined ? data.trainLevel : 0;
        c.routePoints = data.routePoints !== undefined ? data.routePoints : 0;
        c.mainRoute = data.mainRoute !== undefined ? data.mainRoute : -1;
        c.subRoutes = data.subRoutes ? [...data.subRoutes] : [];
        c._bystanderCount = data._bystanderCount || 0;
        c._assistantBuff = data._assistantBuff || null;
        c._routeExpBonus = data._routeExpBonus || {};
        return c;
    }
}

window.Character = Character;
