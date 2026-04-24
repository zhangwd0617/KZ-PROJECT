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
            id: this.id
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
        return c;
    }
}

window.Character = Character;
