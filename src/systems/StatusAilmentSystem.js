/**
 * StatusAilmentSystem — extracted from Game.js
 */
Game.prototype._hasStatusAilment = function(hero, type) {
        if (!hero || !STATUS_AILMENT_DEFS[type]) return false;
        const mask = hero.cflag[920] || 0;
        return (mask & STATUS_AILMENT_DEFS[type].bit) !== 0;
    }

Game.prototype._addStatusAilment = function(hero, type, turns) {
        if (!hero || !STATUS_AILMENT_DEFS[type]) return;
        const def = STATUS_AILMENT_DEFS[type];
        hero.cflag[920] = (hero.cflag[920] || 0) | def.bit;
        const turnKey = STATUS_AILMENT_TURN_CFIDS[type];
        hero.cflag[turnKey] = Math.max(hero.cflag[turnKey] || 0, turns);
    }

Game.prototype._removeStatusAilment = function(hero, type) {
        if (!hero || !STATUS_AILMENT_DEFS[type]) return;
        const def = STATUS_AILMENT_DEFS[type];
        hero.cflag[920] = (hero.cflag[920] || 0) & ~def.bit;
        const turnKey = STATUS_AILMENT_TURN_CFIDS[type];
        hero.cflag[turnKey] = 0;
    }

Game.prototype._clearAllStatusAilments = function(hero) {
        if (!hero) return;
        hero.cflag[920] = 0;
        for (let i = 921; i <= 930; i++) hero.cflag[i] = 0;
    }

Game.prototype._getStatusAilmentText = function(hero) {
        if (!hero) return "";
        const mask = hero.cflag[920] || 0;
        if (mask === 0) return "";
        const names = [];
        for (const key in STATUS_AILMENT_DEFS) {
            if ((mask & STATUS_AILMENT_DEFS[key].bit) !== 0) {
                const turns = hero.cflag[STATUS_AILMENT_TURN_CFIDS[key]] || 0;
                names.push(`${STATUS_AILMENT_DEFS[key].name}(${turns}T)`);
            }
        }
        return names.join(",");
    }

Game.prototype._applyStatusAilmentEffects = function(hero) {
        if (!hero) return { atkMod: 0, defMod: 0, spdMod: 0, dotHp: 0, dotMp: 0, actionBlock: 0, friendlyFire: 0 };
        const mask = hero.cflag[920] || 0;
        let atkMod = 0, defMod = 0, spdMod = 0, dotHp = 0, dotMp = 0, actionBlock = 0, friendlyFire = 0;
        for (const key in STATUS_AILMENT_DEFS) {
            const def = STATUS_AILMENT_DEFS[key];
            if ((mask & def.bit) !== 0) {
                atkMod += def.effect.atkMod || 0;
                defMod += def.effect.defMod || 0;
                spdMod += def.effect.spdMod || 0;
                if (def.dot.type === "hp_percent") dotHp += Math.floor(hero.maxHp * def.dot.value);
                if (def.dot.type === "mp_percent") dotMp += Math.floor(hero.maxMp * def.dot.value);
                actionBlock = Math.max(actionBlock, def.actionBlock || 0);
                friendlyFire = Math.max(friendlyFire, def.friendlyFire || 0);
            }
        }
        return { atkMod, defMod, spdMod, dotHp, dotMp, actionBlock, friendlyFire };
    }

Game.prototype._processStatusAilmentTurn = function(hero) {
        if (!hero) return [];
        const mask = hero.cflag[920] || 0;
        if (mask === 0) return [];
        const logs = [];
        for (const key in STATUS_AILMENT_DEFS) {
            const def = STATUS_AILMENT_DEFS[key];
            if ((mask & def.bit) !== 0) {
                const turnKey = STATUS_AILMENT_TURN_CFIDS[key];
                hero.cflag[turnKey] = (hero.cflag[turnKey] || 1) - 1;
                if (def.dot.type === "hp_percent") {
                    const dmg = Math.floor(hero.maxHp * def.dot.value);
                    hero.hp = Math.max(1, hero.hp - dmg);
                    logs.push(`${hero.name}因【${def.name}】损失${dmg}HP`);
                }
                if (def.dot.type === "mp_percent") {
                    const dmg = Math.floor(hero.maxMp * def.dot.value);
                    hero.mp = Math.max(0, hero.mp - dmg);
                    logs.push(`${hero.name}因【${def.name}】损失${dmg}MP`);
                }
                if (hero.cflag[turnKey] <= 0) {
                    hero.cflag[920] = (hero.cflag[920] || 0) & ~def.bit;
                    hero.cflag[turnKey] = 0;
                    logs.push(`${hero.name}的【${def.name}】解除了`);
                }
            }
        }
        return logs;
    }

Game.prototype._tryCureStatusAilment = function(hero, method) {
        if (!hero) return [];
        const mask = hero.cflag[920] || 0;
        if (mask === 0) return [];
        const logs = [];
        for (const key in STATUS_AILMENT_DEFS) {
            const def = STATUS_AILMENT_DEFS[key];
            if ((mask & def.bit) === 0) continue;
            if (!def.cureMethods.includes(method)) continue;
            const chance = def.cureChance[method] || 0;
            if (RAND(100) < chance * 100) {
                this._removeStatusAilment(hero, key);
                logs.push(`${hero.name}的【${def.name}】被解除了`);
            }
        }
        return logs;
    }

Game.prototype._applyRandomAilmentFromMonster = function(hero, monster) {
        if (!hero || !monster) return;
        const aiType = this._getMonsterAIType(monster);
        const possible = [];
        if (aiType === "magic") possible.push("curse", "paralysis");
        if (aiType === "attack") possible.push("weak", "bleed");
        if (monster.name && monster.name.includes("火")) possible.push("burn");
        if (monster.name && monster.name.includes("毒")) possible.push("poison");
        if (possible.length === 0) return;
        const type = possible[RAND(possible.length)];
        if (STATUS_AILMENT_DEFS[type]) {
            this._addStatusAilment(hero, type, 3 + RAND(3));
        }
    }

    // ========== 安营扎寨系统 ==========

