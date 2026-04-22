
    // ========== 异常状态系统 ==========

    _hasStatusAilment(hero, type) {
        if (!hero || !STATUS_AILMENT_DEFS[type]) return false;
        const mask = hero.cflag[920] || 0;
        return (mask & STATUS_AILMENT_DEFS[type].bit) !== 0;
    }

    _addStatusAilment(hero, type, turns) {
        if (!hero || !STATUS_AILMENT_DEFS[type]) return;
        const def = STATUS_AILMENT_DEFS[type];
        hero.cflag[920] = (hero.cflag[920] || 0) | def.bit;
        const turnKey = STATUS_AILMENT_TURN_CFIDS[type];
        hero.cflag[turnKey] = Math.max(hero.cflag[turnKey] || 0, turns);
    }

    _removeStatusAilment(hero, type) {
        if (!hero || !STATUS_AILMENT_DEFS[type]) return;
        const def = STATUS_AILMENT_DEFS[type];
        hero.cflag[920] = (hero.cflag[920] || 0) & ~def.bit;
        const turnKey = STATUS_AILMENT_TURN_CFIDS[type];
        hero.cflag[turnKey] = 0;
    }

    _clearAllStatusAilments(hero) {
        if (!hero) return;
        hero.cflag[920] = 0;
        for (let i = 921; i <= 930; i++) hero.cflag[i] = 0;
    }

    _getStatusAilmentText(hero) {
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
        return names.join("、");
    }

    _applyStatusAilmentEffects(hero) {
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

    _processStatusAilmentTurn(hero) {
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

    _tryCureStatusAilment(hero, method) {
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

    _applyRandomAilmentFromMonster(hero, monster) {
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

    _shouldCamp(hero) {
        if (!hero) return false;
        const hpPct = hero.maxHp > 0 ? hero.hp / hero.maxHp : 1;
        // HP<50% 或有异常状态时考虑安营
        if (hpPct >= 0.5 && (hero.cflag[920] || 0) === 0) return false;
        // 根据性格判断
        let chance = 30; // 基础概率30%
        if (hpPct < 0.3) chance += 40;
        else if (hpPct < 0.5) chance += 20;
        const hasAilment = (hero.cflag[920] || 0) !== 0;
        if (hasAilment) chance += 15;
        // 性格修正
        if (hero.talent[12]) chance += 10; // 刚强：更不愿退缩
        if (hero.talent[13]) chance -= 5;  // 坦率：按部就班
        if (hero.talent[14]) chance -= 10; // 傲慢：不愿示弱
        if (hero.talent[16]) chance += 10; // 低姿态：更谨慎
        if (hero.talent[164]) chance += 15; // 冷静：理性判断
        if (hero.talent[165]) chance -= 10; // 叛逆：更激进
        if (hero.talent[170]) chance += 5;  // 孤独者：独自休息
        chance = Math.max(5, Math.min(90, chance));
        return RAND(100) < chance;
    }

    _doCamp(hero, moveSpeed) {
        if (!hero) return null;
        const hpPct = hero.maxHp > 0 ? hero.hp / hero.maxHp : 1;
        const hasAilment = (hero.cflag[920] || 0) !== 0;
        // 恢复HP：侵略度转化为HP恢复
        const healPct = Math.max(moveSpeed, 5) / 100;
        const healAmt = Math.floor(hero.maxHp * healPct);
        hero.hp = Math.min(hero.maxHp, hero.hp + healAmt);
        // 恢复少量MP
        const mpHeal = Math.floor(hero.maxMp * 0.03);
        hero.mp = Math.min(hero.maxMp, hero.mp + mpHeal);
        // 尝试解除非诅咒异常状态
        const cureLogs = this._tryCureStatusAilment(hero, "camp_rest");
        const logs = [`🏕️ ${hero.name}选择安营扎寨休息`, `HP恢复${healAmt}，MP恢复${mpHeal}`];
        if (cureLogs.length > 0) logs.push(...cureLogs);
        return {
            action: 'camp',
            hero,
            moveSpeed: 0,
            logs,
            healedHp: healAmt,
            healedMp: mpHeal
        };
    }

    // ========== 勇者职业技能系统 ==========

    _getHeroClass(hero) {
        if (!hero) return null;
        const classId = hero.cflag[950];
        if (!classId || !HERO_CLASS_DEFS[classId]) return null;
        return HERO_CLASS_DEFS[classId];
    }

    _getSkillPower(hero, skill) {
        if (!hero || !skill) return 0;
        const lv = hero.level || 1;
        return Math.floor(skill.power + skill.scale * lv);
    }

    _useHeroSkill(hero, skillId, target, context) {
        if (!hero || !skillId) return null;
        const skill = HERO_SKILL_DEFS[skillId];
        if (!skill) return null;
        const power = this._getSkillPower(hero, skill);
        const result = { used: true, skillName: skill.name, cost: skill.cost, logs: [] };

        switch (skill.effectType) {
            case "damage":
            case "crit_damage":
            case "pierce":
            case "execute":
            case "execute_pierce": {
                const baseAtk = (hero.cflag[11] || 20);
                let dmg = Math.max(1, baseAtk + power - (target.def || 0));
                if (skill.effectType === "crit_damage" && RAND(100) < 40) dmg = Math.floor(dmg * 1.8);
                if (skill.effectType === "pierce" || skill.effectType === "execute_pierce") dmg = Math.floor(dmg * 1.3);
                if (skill.effectType === "execute" || skill.effectType === "execute_pierce") {
                    const tHpPct = target.hp / Math.max(1, target.maxHp || target.hp);
                    if (tHpPct < 0.3) dmg = Math.floor(dmg * 2.0);
                }
                result.damage = dmg;
                result.log = `【技能】${hero.name}使用${skill.name}造成${dmg}伤害`;
                break;
            }
            case "multi_damage": {
                const baseAtk = (hero.cflag[11] || 20);
                const hits = skill.hits || 2;
                let totalDmg = 0;
                for (let i = 0; i < hits; i++) {
                    const dmg = Math.max(1, baseAtk + Math.floor(power / hits) - (target.def || 0));
                    totalDmg += dmg;
                }
                result.damage = totalDmg;
                result.log = `【技能】${hero.name}使用${skill.name}连续攻击${hits}次，共造成${totalDmg}伤害`;
                break;
            }
            case "aoe":
            case "big_bang": {
                const baseAtk = (hero.cflag[11] || 20);
                result.damage = Math.max(1, baseAtk + power);
                result.isAoE = true;
                result.log = `【技能】${hero.name}使用${skill.name}造成范围伤害`;
                break;
            }
            case "heal": {
                const heal = Math.floor(power + hero.level * 2);
                result.heal = heal;
                result.log = `【技能】${hero.name}使用${skill.name}恢复${heal}HP`;
                break;
            }
            case "mass_heal": {
                const heal = Math.floor(power + hero.level * 1.5);
                result.heal = heal;
                result.isMass = true;
                result.log = `【技能】${hero.name}使用${skill.name}恢复全体${heal}HP`;
                break;
            }
            case "buff_atk": {
                result.buff = { type: "atk", value: power, duration: skill.duration || 3 };
                result.log = `【技能】${hero.name}使用${skill.name}，攻击力提升${power}`;
                break;
            }
            case "buff_def": {
                result.buff = { type: "def", value: power, duration: skill.duration || 3 };
                result.log = `【技能】${hero.name}使用${skill.name}，防御力提升${power}`;
                break;
            }
            case "buff_spd": {
                result.buff = { type: "spd", value: power, duration: skill.duration || 2 };
                result.log = `【技能】${hero.name}使用${skill.name}，速度提升${power}`;
                break;
            }
            case "buff_all": {
                result.buff = { type: "all", value: power, duration: skill.duration || 3 };
                result.log = `【技能】${hero.name}使用${skill.name}，全属性提升${power}`;
                break;
            }
            case "debuff_atk":
            case "debuff_def":
            case "debuff_spd":
            case "debuff_all":
            case "seal": {
                const debuffType = skill.effectType.replace("debuff_", "");
                result.debuff = { type: debuffType, value: power, duration: skill.duration || 3 };
                result.log = `【技能】${hero.name}使用${skill.name}，降低敌人${debuffType}${power}`;
                break;
            }
            case "dot": {
                result.ailment = { type: "poison", turns: skill.duration || 3 };
                result.log = `【技能】${hero.name}使用${skill.name}，敌人中毒了`;
                break;
            }
            case "cleanse": {
                result.cleanse = true;
                result.log = `【技能】${hero.name}使用${skill.name}净化异常`;
                break;
            }
            case "invincible": {
                result.invincible = true;
                result.duration = skill.duration || 1;
                result.log = `【技能】${hero.name}使用${skill.name}，一回合内无敌`;
                break;
            }
            case "berserk": {
                result.berserk = true;
                result.buff = { type: "atk", value: power, duration: skill.duration || 3 };
                result.debuff = { type: "def", value: -Math.floor(power * 0.5), duration: skill.duration || 3 };
                result.log = `【技能】${hero.name}使用${skill.name}，攻击力大幅提升但防御下降`;
                break;
            }
            default:
                result.used = false;
        }
        return result;
    }

    _chooseHeroSkill(hero, context) {
        if (!hero) return null;
        const cls = this._getHeroClass(hero);
        if (!cls || !cls.skills) return null;
        const hpPct = hero.hp / Math.max(1, hero.maxHp);
        const mpPct = hero.mp / Math.max(1, hero.maxMp);
        const [s1, s2, s3] = cls.skills;
        const sk1 = HERO_SKILL_DEFS[s1];
        const sk2 = HERO_SKILL_DEFS[s2];
        const sk3 = HERO_SKILL_DEFS[s3];

        // 专属技能：MP充足且战况需要时使用
        if (sk3 && mpPct >= 0.4 && RAND(100) < 15) {
            return s3;
        }

        // 根据AI倾向选择
        const ai = cls.ai || { aggressive: 0.5, defensive: 0.3, support: 0.2 };
        const roll = RAND(100);

        if (hpPct < 0.35 && sk1 && sk1.effectType === "heal") {
            return s1; // 优先治疗
        }
        if (context === "squad" && hpPct < 0.5 && sk2 && sk2.effectType === "mass_heal") {
            return s2;
        }

        if (roll < ai.aggressive * 100) {
            // 攻击倾向：选择伤害技能
            if (sk1 && (sk1.effectType.includes("damage") || sk1.effectType === "dot" || sk1.effectType === "execute")) return s1;
            if (sk2 && (sk2.effectType.includes("damage") || sk2.effectType === "dot" || sk2.effectType === "execute")) return s2;
        } else if (roll < (ai.aggressive + ai.defensive) * 100) {
            // 防御倾向：增益/护盾
            if (sk1 && sk1.effectType.includes("buff")) return s1;
            if (sk2 && sk2.effectType.includes("buff")) return s2;
        } else {
            // 辅助倾向：治疗/净化/减益
            if (sk1 && (sk1.effectType === "heal" || sk1.effectType === "cleanse" || sk1.effectType.includes("debuff"))) return s1;
            if (sk2 && (sk2.effectType === "heal" || sk2.effectType === "cleanse" || sk2.effectType.includes("debuff"))) return s2;
        }

        // 默认返回第一个可用技能
        if (sk1) return s1;
        if (sk2) return s2;
        return null;
    }
