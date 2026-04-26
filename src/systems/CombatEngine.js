/**
 * CombatEngine — extracted from Game.js
 */
Game.prototype._doCombat = function(hero, monster) {
        let heroHp = hero.hp;
        let heroMp = hero.mp;
        let monHp = monster.hp;
        let monMp = monster.mp || 0;

        // 勇者装备加成
        const gBonus = GearSystem.applyGearBonus(hero, false);
        // 勇者基础属性
        let heroBaseAtk = (hero.cflag[CFLAGS.ATK] || 20) + (gBonus.atk || 0);
        let heroBaseDef = (hero.cflag[CFLAGS.DEF] || 15) + (gBonus.def || 0);
        let heroSpd = hero.cflag[CFLAGS.SPD] || 10 + hero.level * 2;

        // === 异常状态效果 ===
        const statusFx = this._applyStatusAilmentEffects(hero);
        heroBaseAtk = Math.max(1, Math.floor(heroBaseAtk * (1 + statusFx.atkMod)));
        heroBaseDef = Math.max(0, Math.floor(heroBaseDef * (1 + statusFx.defMod)));
        heroSpd = Math.max(1, Math.floor(heroSpd * (1 + statusFx.spdMod)));
        if (statusFx.dotHp > 0) {
            heroHp = Math.max(1, heroHp - statusFx.dotHp);
        }
        if (statusFx.dotMp > 0) {
            heroMp = Math.max(0, heroMp - statusFx.dotMp);
        }

        // 战斗中的增益/减益状态
        let heroAtkMod = 0;
        let heroDefMod = 0;
        let heroSpdMod = 0;
        let heroBuffTurns = 0;
        let monAtkMod = 0;
        let monDefMod = 0;
        let monBuffTurns = 0;
        let heroInvincible = 0;

        const getHeroAtk = () => Math.max(1, heroBaseAtk + heroAtkMod);
        const getHeroDef = () => Math.max(0, heroBaseDef + heroDefMod);
        const getHeroSpd = () => Math.max(1, heroSpd + heroSpdMod);
        const getMonAtk = () => Math.max(1, monster.atk + monAtkMod);
        const getMonDef = () => Math.max(0, monster.def + monDefMod);
        // V7.2: 统一怪物伤害计算
        const calcMonDmg = (skillPower = 1.0, isPierce = false) => this._calcDamageV2({
            attackerAtk: getMonAtk(), attackerLv: monster.level || 1,
            targetDef: getHeroDef(), targetLv: hero.level || 1,
            skillPower, isPierce,
            attacker: monster, target: hero
        });

        let rounds = 0;
        const maxRounds = 50;
        const combatLog = [];

        // 记录初始HP（用于战斗UI显示）
        combatLog.push(`【初始】勇者HP:${heroHp} 怪物HP:${monHp}`);

        // 若有异常状态，战斗开始时报告
        if (statusFx.dotHp > 0 || statusFx.dotMp > 0) {
            const stText = this._getStatusAilmentText(hero);
            if (stText) combatLog.push(`⚠️ ${hero.name}处于异常状态：${stText}`);
        }

        // V7.1: 濒死判定 — HP<=1时战斗结束
        while (rounds < maxRounds && heroHp > 0 && monHp > 0) {
            rounds++;

            // V7.2: 每回合开始时结算异常状态dot
            if (heroHp > 1) {
                const ailLogs = this._processStatusAilmentTurn(hero);
                for (const log of ailLogs) {
                    combatLog.push(`【${rounds}回合】${hero.name}${log}`);
                }
                heroHp = hero.hp;
            }

            // === 逃跑判定 ===
            if (rounds >= 3) {
                let fleeChance = Math.max(5, Math.min(95, 30 + (hero.level - monster.level) * 5));
                // 血量修正：血量优势大时不逃跑，血量劣势时才考虑跑
                const heroHpRatio = heroHp / hero.maxHp;
                if (heroHpRatio > 0.7 && heroHp > monHp * 2) {
                    fleeChance = 0; // 碾压局不跑
                } else if (heroHpRatio > 0.5 && heroHp > monHp) {
                    fleeChance = Math.floor(fleeChance * 0.3); // 优势局大幅降概率
                }
                if (heroHpRatio < 0.3) {
                    fleeChance = Math.min(95, fleeChance + 30); // 残血提高逃跑意愿
                } else if (heroHpRatio < 0.5) {
                    fleeChance = Math.min(95, fleeChance + 15);
                }
                // 5回合内逃跑成功率-50%
                if (rounds <= 5) {
                    fleeChance = Math.floor(fleeChance * 0.5);
                }
                if (RAND(100) < fleeChance) {
                    combatLog.push(`【${rounds}回合】${hero.name}成功撤离了战斗！`);
                    hero.hp = Math.max(0, heroHp);
                    hero.mp = Math.max(0, heroMp);
                    monster.maxHp = monster.hp;
                    monster.hp = Math.max(0, monHp);
                    return { victory: false, defeated: false, escaped: true, rounds, combatLog, monster, drop: null };
                }
            }

            // 根据敏捷决定行动顺序
            const heroFirst = getHeroSpd() >= monster.spd;
            const actors = heroFirst ? ['hero', 'monster'] : ['monster', 'hero'];

            for (const actor of actors) {
                if (heroHp <= 1 || monHp <= 1) break;

                if (actor === 'hero') {
                    // ===== 勇者AI决策 =====
                    const hpPct = heroHp / hero.maxHp;
                    const mpPct = heroMp / Math.max(1, hero.maxMp);

                    // 异常状态：麻痹/冰冻/恐惧/混乱/魅惑可能导致无法行动或行为异常
                    if (statusFx.actionBlock > 0 && RAND(100) < statusFx.actionBlock * 100) {
                        combatLog.push(`【${rounds}回合】${hero.name}因异常状态无法行动！`);
                        continue;
                    }
                    if (statusFx.friendlyFire > 0 && RAND(100) < statusFx.friendlyFire * 100) {
                        // 混乱/魅惑：自己伤害自己
                        const selfDmg = Math.max(1, Math.floor(getHeroAtk() * 0.3));
                        heroHp -= selfDmg;
                        combatLog.push(`【${rounds}回合】${hero.name}陷入混乱，攻击了自己！💫 受到${selfDmg}伤害`);
                        continue;
                    }

                    // V12.0: 诅咒武器25%概率攻击自身
                    if (this._checkCurseWeaponSelfHarm(hero, combatLog, rounds + '回合')) {
                        heroHp = hero.hp;
                        continue;
                    }

                    // V8.0: 尝试使用消耗品
                    if (this._tryUseConsumable(hero, combatLog, rounds)) {
                        continue;
                    }

                    // 尝试使用职业技能
                    const skillId = this._chooseHeroSkill(hero, "solo");
                    const skillDef = skillId ? ((window.CLASS_SKILL_DEFS && window.CLASS_SKILL_DEFS[skillId]) ? window.CLASS_SKILL_DEFS[skillId] : (typeof HERO_SKILL_DEFS !== 'undefined' ? HERO_SKILL_DEFS[skillId] : null)) : null;
                    const canUseSkill = skillDef && heroMp >= (skillDef.cost || 0);

                    if (canUseSkill) {
                        heroMp -= (skillDef.cost || 0);
                        const skillResult = this._useHeroSkill(hero, skillId, monster, { isSolo: true });
                        if (skillResult && skillResult.used) {
                            combatLog.push(`【${rounds}回合】${skillResult.log}`);
                            if (skillResult.damage) {
                                if (skillResult.isAoE) {
                                    monHp -= skillResult.damage;
                                } else {
                                    monHp -= skillResult.damage;
                                }
                            }
                            if (skillResult.heal) {
                                heroHp = Math.min(hero.maxHp, heroHp + skillResult.heal);
                            }
                            if (skillResult.buff) {
                                const b = skillResult.buff;
                                if (b.type === 'atk' || b.type === 'all') heroAtkMod += b.value;
                                if (b.type === 'def' || b.type === 'all') heroDefMod += b.value;
                                if (b.type === 'spd' || b.type === 'all') heroSpdMod += b.value;
                                heroBuffTurns = Math.max(heroBuffTurns, b.duration || 3);
                            }
                            if (skillResult.debuff) {
                                const d = skillResult.debuff;
                                if (d.type === 'atk' || d.type === 'all') monAtkMod -= d.value;
                                if (d.type === 'def' || d.type === 'all') monDefMod -= d.value;
                                monBuffTurns = Math.max(monBuffTurns, d.duration || 3);
                            }
                            if (skillResult.invincible) {
                                heroInvincible = skillResult.duration || 1;
                            }
                            if (skillResult.ailment) {
                                // 怪物也会被添加异常状态（简化：用战斗内标记表示）
                                combatLog.push(`  → ${monster.name}被施加了异常效果！`);
                            }
                            if (skillResult.cleanse) {
                                // 净化自身异常
                                const cured = this._tryCureStatusAilment(hero, "skill_cleanse");
                                if (cured.length > 0) combatLog.push(`  → ${cured.join(',')}`);
                            }
                            if (skillResult.berserk) {
                                const b = skillResult.buff;
                                const d = skillResult.debuff;
                                if (b) { heroAtkMod += b.value; heroBuffTurns = Math.max(heroBuffTurns, b.duration || 3); }
                                if (d) { heroDefMod += d.value; }
                            }
                            continue;
                        }
                    }

                    // 默认AI：回复 / 增益 / 普通攻击
                    const needHeal = hpPct < 0.35 && heroMp >= 15;
                    const canBuff = heroMp >= 20 && heroBuffTurns <= 0 && RAND(100) < 20;

                    if (needHeal) {
                        const healAmt = Math.floor(hero.level * 2 + heroBaseAtk * 0.15);
                        heroHp = Math.min(hero.maxHp, heroHp + healAmt);
                        heroMp -= 15;
                        combatLog.push(`【${rounds}回合】${hero.name}使用回复魔法 ✨ 恢复${healAmt}HP (勇者HP:${Math.min(hero.maxHp, heroHp)}/${hero.maxHp})`);
                    } else if (canBuff) {
                        heroAtkMod = Math.floor(heroBaseAtk * 0.2);
                        heroBuffTurns = 2;
                        heroMp -= 20;
                        combatLog.push(`【${rounds}回合】${hero.name}使用强化魔法 💪 攻击+${heroAtkMod} (持续2回合)`);
                    } else {
                        // V7.2: 新伤害公式（百分比减伤 + 等级碾压）
                        // V10.0: 统一使用 _calcDamageV2，支持元素克制与堕落种族被动
                        const dmgRes = this._calcDamageV2({
                            attackerAtk: getHeroAtk(), attackerLv: hero.level || 1,
                            targetDef: getMonDef(), targetLv: monster.level || 1,
                            skillPower: 1.0, randomFloat: true,
                            attacker: hero, target: monster
                        });
                        const dmg = dmgRes.dmg;
                        let atkLog = `【${rounds}回合】${hero.name}${dmgRes.isCrit ? '暴击 💥' : '攻击 ⚔️'}造成${dmg}伤害 (怪物HP:${Math.max(0,monHp)})`;
                        if (dmgRes.crushLabel) atkLog += ` (${dmgRes.crushLabel})`;
                        if (dmgRes.elementalLabel) atkLog += ` (${dmgRes.elementalLabel})`;
                        combatLog.push(atkLog);
                    }
                } else {
                    // ===== 怪物AI决策 =====
                    if (heroInvincible > 0) {
                        combatLog.push(`【${rounds}回合】${monster.name}的攻击被${hero.name}挡下了！🛡️ (无敌)`);
                    } else {
                        const aiType = this._getMonsterAIType(monster);
                        const monHpPct = monHp / monster.hp;
                        const roll = RAND(100);

                        if (aiType === 'attack') {
                            if (roll < 50) {
                                const dmgRes = calcMonDmg(1.5);
                                let dmg = dmgRes.dmg;
                                heroHp -= dmg;
                                let monLog = `【${rounds}回合】${monster.name}猛击 💢 造成${dmg}伤害`;
                                if (dmgRes.isCrit) monLog += ' 💥暴击';
                                if (dmgRes.crushLabel) monLog += ` (${dmgRes.crushLabel})`;
                                monLog += ` (勇者HP:${Math.max(0,heroHp)})`;
                                combatLog.push(monLog);
                            } else if (roll < 80) {
                                const dmgRes = calcMonDmg(1.0);
                                let dmg = dmgRes.dmg;
                                heroHp -= dmg;
                                let monLog = `【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害`;
                                if (dmgRes.isCrit) monLog += ' 💥暴击';
                                if (dmgRes.crushLabel) monLog += ` (${dmgRes.crushLabel})`;
                                monLog += ` (勇者HP:${Math.max(0,heroHp)})`;
                                combatLog.push(monLog);
                            } else if (roll < 95 && monBuffTurns <= 0) {
                                monAtkMod = Math.floor(monster.atk * 0.3);
                                monBuffTurns = 1;
                                combatLog.push(`【${rounds}回合】${monster.name}正在蓄力 ⚡ 下回合攻击力大幅提升`);
                            } else {
                                combatLog.push(`【${rounds}回合】${monster.name}采取防御姿态 🛡️`);
                            }
                        } else if (aiType === 'defense') {
                            if (roll < 40) {
                                const dmgRes = calcMonDmg(1.0);
                                let dmg = dmgRes.dmg;
                                heroHp -= dmg;
                                let monLog = `【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害`;
                                if (dmgRes.isCrit) monLog += ' 💥暴击';
                                if (dmgRes.crushLabel) monLog += ` (${dmgRes.crushLabel})`;
                                monLog += ` (勇者HP:${Math.max(0,heroHp)})`;
                                combatLog.push(monLog);
                            } else if (roll < 75 && monBuffTurns <= 0) {
                                monDefMod = Math.floor(monster.def * 0.3);
                                monBuffTurns = 2;
                                combatLog.push(`【${rounds}回合】${monster.name}展开铁壁 🛡️ 防御+${monDefMod}`);
                            } else if (roll < 95) {
                                const heal = Math.floor(monster.level * 5);
                                monHp = Math.min(monster.hp, monHp + heal);
                                combatLog.push(`【${rounds}回合】${monster.name}自愈 🌿 恢复${heal}HP (怪物HP:${monHp})`);
                            } else {
                                combatLog.push(`【${rounds}回合】${monster.name}摆出反击姿态 👁️`);
                            }
                        } else if (aiType === 'magic') {
                            if (roll < 45) {
                                const dmgRes = calcMonDmg(1.2, true);
                                let dmg = dmgRes.dmg;
                                heroHp -= dmg;
                                let monLog = `【${rounds}回合】${monster.name}魔法弹 🔮 造成${dmg}伤害(穿透)`;
                                if (dmgRes.isCrit) monLog += ' 💥暴击';
                                if (dmgRes.crushLabel) monLog += ` (${dmgRes.crushLabel})`;
                                monLog += ` (勇者HP:${Math.max(0,heroHp)})`;
                                combatLog.push(monLog);
                                // 魔法型怪物有概率附加异常状态
                                if (RAND(100) < 15) {
                                    this._addStatusAilment(hero, "paralysis", 2);
                                    combatLog.push(`  → ${hero.name}被麻痹了！`);
                                }
                            } else if (roll < 70) {
                                const dmgRes = calcMonDmg(1.0);
                                let dmg = dmgRes.dmg;
                                heroHp -= dmg;
                                let monLog = `【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害`;
                                if (dmgRes.isCrit) monLog += ' 💥暴击';
                                if (dmgRes.crushLabel) monLog += ` (${dmgRes.crushLabel})`;
                                monLog += ` (勇者HP:${Math.max(0,heroHp)})`;
                                combatLog.push(monLog);
                            } else if (roll < 90 && monMp >= 10) {
                                const heal = Math.floor(monster.mp * 0.2);
                                monHp = Math.min(monster.hp, monHp + heal);
                                monMp -= 10;
                                combatLog.push(`【${rounds}回合】${monster.name}治疗 ✨ 恢复${heal}HP (怪物HP:${monHp})`);
                            } else if (monBuffTurns <= 0) {
                                monAtkMod = Math.floor(monster.atk * 0.2);
                                monBuffTurns = 2;
                                combatLog.push(`【${rounds}回合】${monster.name}魔力增幅 🔮 攻击+${monAtkMod}`);
                            } else {
                                const dmgRes = calcMonDmg(1.0);
                                let dmg = dmgRes.dmg;
                                heroHp -= dmg;
                                let monLog = `【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害`;
                                if (dmgRes.isCrit) monLog += ' 💥暴击';
                                if (dmgRes.crushLabel) monLog += ` (${dmgRes.crushLabel})`;
                                monLog += ` (勇者HP:${Math.max(0,heroHp)})`;
                                combatLog.push(monLog);
                            }
                        } else if (aiType === 'speed') {
                            if (roll < 40) {
                                const dmgRes1 = calcMonDmg(0.7);
                                const dmgRes2 = calcMonDmg(0.6);
                                let dmg1 = dmgRes1.dmg;
                                let dmg2 = dmgRes2.dmg;
                                heroHp -= dmg1;
                                if (heroHp > 0) heroHp -= dmg2;
                                let monLog = `【${rounds}回合】${monster.name}迅捷连击 💨 ${dmg1}+${dmg2}伤害`;
                                if (dmgRes1.isCrit || dmgRes2.isCrit) monLog += ' 💥暴击';
                                if (dmgRes1.crushLabel) monLog += ` (${dmgRes1.crushLabel})`;
                                monLog += ` (勇者HP:${Math.max(0,heroHp)})`;
                                combatLog.push(monLog);
                            } else if (roll < 75) {
                                const dmgRes = calcMonDmg(1.0);
                                let dmg = dmgRes.dmg;
                                heroHp -= dmg;
                                let monLog = `【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害`;
                                if (dmgRes.isCrit) monLog += ' 💥暴击';
                                if (dmgRes.crushLabel) monLog += ` (${dmgRes.crushLabel})`;
                                monLog += ` (勇者HP:${Math.max(0,heroHp)})`;
                                combatLog.push(monLog);
                            } else if (roll < 95 && monBuffTurns <= 0) {
                                monDefMod = Math.floor(monster.def * 0.5);
                                monBuffTurns = 2;
                                combatLog.push(`【${rounds}回合】${monster.name}闪避姿态 💨 防御提升`);
                            } else {
                                const dmgRes = calcMonDmg(1.0);
                                let dmg = dmgRes.dmg;
                                heroHp -= dmg;
                                let monLog = `【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害`;
                                if (dmgRes.isCrit) monLog += ' 💥暴击';
                                if (dmgRes.crushLabel) monLog += ` (${dmgRes.crushLabel})`;
                                monLog += ` (勇者HP:${Math.max(0,heroHp)})`;
                                combatLog.push(monLog);
                            }
                        } else {
                            if (roll < 50) {
                                const dmgRes = calcMonDmg(1.0);
                                let dmg = dmgRes.dmg;
                                heroHp -= dmg;
                                let monLog = `【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害`;
                                if (dmgRes.isCrit) monLog += ' 💥暴击';
                                if (dmgRes.crushLabel) monLog += ` (${dmgRes.crushLabel})`;
                                monLog += ` (勇者HP:${Math.max(0,heroHp)})`;
                                combatLog.push(monLog);
                            } else if (roll < 75) {
                                const dmgRes = calcMonDmg(1.3);
                                let dmg = dmgRes.dmg;
                                heroHp -= dmg;
                                let monLog = `【${rounds}回合】${monster.name}强力攻击 💥 造成${dmg}伤害`;
                                if (dmgRes.isCrit) monLog += ' 💥暴击';
                                if (dmgRes.crushLabel) monLog += ` (${dmgRes.crushLabel})`;
                                monLog += ` (勇者HP:${Math.max(0,heroHp)})`;
                                combatLog.push(monLog);
                                if (RAND(100) < 20) {
                                    const debuffVal = Math.max(3, Math.floor(heroBaseDef * 0.1));
                                    heroDefMod = -debuffVal;
                                    combatLog.push(`  → 勇者防御力下降${debuffVal}！`);
                                }
                                // 均衡型怪物有概率附加异常状态
                                if (RAND(100) < 10) {
                                    const ailments = ["weak", "burn", "poison", "fear"];
                                    const aType = ailments[RAND(ailments.length)];
                                    this._addStatusAilment(hero, aType, 2 + RAND(2));
                                    combatLog.push(`  → ${hero.name}被施加了【${STATUS_AILMENT_DEFS[aType].name}】！`);
                                }
                            } else if (roll < 90) {
                                const heal = Math.floor(monster.level * 3);
                                monHp = Math.min(monster.hp, monHp + heal);
                                combatLog.push(`【${rounds}回合】${monster.name}恢复 🌿 恢复${heal}HP (怪物HP:${monHp})`);
                            } else if (monBuffTurns <= 0) {
                                monAtkMod = Math.floor(monster.atk * 0.15);
                                monBuffTurns = 2;
                                combatLog.push(`【${rounds}回合】${monster.name}强化 💪 攻击+${monAtkMod}`);
                            } else {
                                const dmgRes = calcMonDmg(1.0);
                                let dmg = dmgRes.dmg;
                                heroHp -= dmg;
                                let monLog = `【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害`;
                                if (dmgRes.isCrit) monLog += ' 💥暴击';
                                if (dmgRes.crushLabel) monLog += ` (${dmgRes.crushLabel})`;
                                monLog += ` (勇者HP:${Math.max(0,heroHp)})`;
                                combatLog.push(monLog);
                            }
                        }
                    }
                }
            }

            // 回合结束：处理增益/减益持续时间
            if (heroBuffTurns > 0) {
                heroBuffTurns--;
                if (heroBuffTurns <= 0) {
                    heroAtkMod = 0;
                    heroDefMod = 0;
                    heroSpdMod = 0;
                    combatLog.push(`  【${hero.name}的增益效果消失了`);
                }
            }
            if (monBuffTurns > 0) {
                monBuffTurns--;
                if (monBuffTurns <= 0) {
                    monAtkMod = 0;
                    monDefMod = 0;
                    combatLog.push(`  【${monster.name}的增益效果消失了`);
                }
            }
            if (heroInvincible > 0) {
                heroInvincible--;
                if (heroInvincible <= 0) {
                    combatLog.push(`  【${hero.name}的无敌效果消失了`);
                }
            }
        }

        let victory = monHp <= 1;
        let defeated = heroHp <= 1;
        let escaped = false;

        // V7.2: 50回合后怪物未死 = 怪物撤退恢复，勇者无奖励
        if (!victory && !defeated) {
            monster.hp = Math.floor(monster.hp * 0.3);
            combatLog.push(`【超时】${monster.name}失去耐心，遁入黑暗恢复了伤势...`);
            escaped = true;
        }

        let drop = null;
        // 同步HP/MP
        if (defeated) {
            hero.hp = 0; // 1v1败北=死亡
            hero.mp = Math.max(0, heroMp);
        } else {
            hero.hp = Math.max(1, heroHp);
            hero.mp = Math.max(0, heroMp);
        }

        // V7.2: 战斗中HP<=10的勇者获得重伤debuff
        // V10.0: HP<=10的勇者（包括被击败的）获得重伤
        if (hero.hp <= 10) {
            this._addStatusAilment(hero, "severe_injury", 9999);
            combatLog.push(`【战后】${hero.name}身受重伤，战斗力大幅下降！`);
            this._addAdventureLog(hero, 'severe_injury', '战斗中身受重伤，战斗力大幅下降');
        }

        if (victory) {
            const expGain = monster.level * 10;
            hero.addExp(102, expGain);
            this.checkLevelUp(hero);
            const goldGain = Math.floor(monster.level * monster.level * 2 + RAND(monster.level * 10));
            hero.gold += goldGain;
            combatLog.push(`【胜利】${hero.name}击败了${monster.name}(战斗${rounds}回合) 获得${expGain}EXP ${goldGain}G`);
            // 精英怪物掉落处理
            let dropChance = 0.30;
            let rarityBonus = 0;
            let dropLevel = monster.level;
            const floorId = this.getHeroFloor(hero);
            const maxRarity = this._getFloorDropMaxRarity(floorId);
            if (monster.eliteType === 'chief') {
                dropChance = 1.0;
                rarityBonus = ELITE_TYPE_DEFS.chief.dropRarityBonus;
            } else if (monster.eliteType === 'overlord') {
                dropChance = 1.0;
                rarityBonus = ELITE_TYPE_DEFS.overlord.dropRarityBonus;
                if (RAND(100) < 50) {
                    const nextFloor = Math.min(10, floorId + 1);
                    dropLevel = this._getFloorMaxMonsterLevel(nextFloor) + 5;
                }
            }
            if (Math.random() < dropChance) {
                const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
                const slot = slotTypes[RAND(slotTypes.length)];
                let rarity = GearSystem._rollRarity();
                rarity = Math.min(maxRarity, rarity + rarityBonus);
                drop = GearSystem.generateGear(slot, dropLevel, rarity);
                // V8.0: 智能装备比较
                const check = GearSystem.shouldEquip(drop, slot, hero);
                if (check.should) {
                    const r = GearSystem.equipItem(hero, drop);
                    if (r.success) combatLog.push(`🎁 ${r.msg}`);
                } else {
                    combatLog.push(`🎁 ${hero.name}获得了${drop.name}，但${check.reason}，未装备`);
                }
            }
        } else if (defeated) {
            if (heroHp === 1) {
                combatLog.push(`【败北】${hero.name}陷入濒死，被${monster.name}击败了...`);
            } else {
                combatLog.push(`【败北】${hero.name}被${monster.name}击败了...`);
            }
        } else if (escaped) {
            combatLog.push(`【撤退】${hero.name}从战斗中撤退了`);
        }

        // 更新怪物最终HP（用于UI显示）
        monster.maxHp = monster.hp;
        monster.hp = Math.max(0, monHp);
        return { victory, defeated, escaped, rounds, combatLog, monster, drop };
    }

    // 根据怪物属性判断AI类型
Game.prototype._doSquadCombat = function(squad, monster) {
        let monHp = monster.hp;
        let monMp = monster.mp || 0;
        let rounds = 0;
        const maxRounds = 50;
        const combatLog = [];

        // 记录初始HP（用于战斗UI显示）
        combatLog.push(`【初始】小队HP:${squad.reduce((s,h)=>s+h.hp,0)} 怪物HP:${monHp}`);

        // 检测伪装者
        const spies = squad.filter(h => h.cflag[912]);
        const realHeroes = squad.filter(h => !h.cflag[912]);
        const hasSpy = spies.length > 0;
        const attrMod = Math.max(0.25, 1 - spies.length * 0.25);

        // 叛变检测
        let betrayed = false;
        if (hasSpy && realHeroes.length > 0) {
            const totalHeroHp = realHeroes.reduce((s, h) => s + h.hp, 0);
            const spyTotalHp = spies.reduce((s, h) => s + h.hp, 0);
            if (totalHeroHp < (spyTotalHp + monster.hp) * 0.25) {
                betrayed = true;
                combatLog.push(`⚠️ ${spies.map(s => s.name).join(',')} 叛变了！转而攻击勇者！`);
            }
        }

        // 收集所有参与者并按速度排序
        const actors = [];
        for (const member of squad) {
            const statusFx = this._applyStatusAilmentEffects(member);
            let spd = member.cflag[CFLAGS.SPD] || 10 + member.level * 2;
            spd = Math.max(1, Math.floor(spd * (1 + statusFx.spdMod)));
            actors.push({
                type: 'hero',
                entity: member,
                spd: spd,
                baseSpd: member.cflag[CFLAGS.SPD] || 10 + member.level * 2,
                name: member.name,
                isSpy: !!member.cflag[912]
            });
        }
        actors.push({
            type: 'monster',
            entity: monster,
            spd: monster.spd,
            name: monster.name
        });

        // 回合开始时报告异常状态
        for (const h of realHeroes) {
            const stText = this._getStatusAilmentText(h);
            if (stText) combatLog.push(`⚠️ ${h.name}处于异常状态：${stText}`);
        }

        while (rounds < maxRounds && monHp > 0) {
            const aliveHeroes = squad.filter(h => h.hp > 0);
            if (aliveHeroes.length === 0) break;

            rounds++;

            // === 逃跑判定 ===
            if (rounds >= 3) {
                const realAlive = aliveHeroes.filter(h => !h.cflag[912]);
                if (realAlive.length > 0) {
                    const maxHeroLevel = Math.max(...realAlive.map(h => h.level));
                    let fleeChance = Math.max(5, Math.min(95, 30 + (maxHeroLevel - monster.level) * 5));
                    // 血量修正：血量优势大时不逃跑
                    const heroTotalHp = realAlive.reduce((s, h) => s + Math.max(0, h.hp), 0);
                    const heroTotalMaxHp = realAlive.reduce((s, h) => s + h.maxHp, 0);
                    const heroHpRatio = heroTotalMaxHp > 0 ? heroTotalHp / heroTotalMaxHp : 1;
                    if (heroHpRatio > 0.7 && heroTotalHp > monHp * 2) {
                        fleeChance = 0; // 碾压局不跑
                    } else if (heroHpRatio > 0.5 && heroTotalHp > monHp) {
                        fleeChance = Math.floor(fleeChance * 0.3); // 优势局大幅降概率
                    }
                    if (heroHpRatio < 0.3) {
                        fleeChance = Math.min(95, fleeChance + 30);
                    } else if (heroHpRatio < 0.5) {
                        fleeChance = Math.min(95, fleeChance + 15);
                    }
                    // V7.2: 恐惧状态增加逃跑概率
                    const hasFear = realAlive.some(h => this._hasStatusAilment(h, 'fear'));
                    if (hasFear) {
                        fleeChance = Math.min(95, fleeChance + 25);
                    }
                    // 5回合内逃跑成功率-50%
                    if (rounds <= 5) {
                        fleeChance = Math.floor(fleeChance * 0.5);
                    }
                    // V7.1: 逃跑时濒死勇者可能被落下
                    if (RAND(100) < fleeChance) {
                    const nearDeathHeroes = squad.filter(h => h.hp > 0 && h.hp <= h.maxHp * 0.1 && !h.cflag[912]);
                    if (nearDeathHeroes.length > 0) {
                        const rescued = [];
                        const captured = [];
                        for (const ndh of nearDeathHeroes) {
                            if (RAND(100) < 60) {
                                rescued.push(ndh);
                            } else {
                                captured.push(ndh);
                                ndh.hp = 0;
                                const idx = this.invaders ? this.invaders.indexOf(ndh) : -1;
                                if (idx >= 0) this.invaders.splice(idx, 1);
                                this._imprisonHero(ndh);
                            }
                        }
                        if (rescued.length > 0) {
                            combatLog.push(`【${rounds}回合】🏃 ${rescued.map(h=>h.name).join(',')}被同伴勉强救走了！`);
                        }
                        if (captured.length > 0) {
                            combatLog.push(`【${rounds}回合】💀 ${captured.map(h=>h.name).join(',')}未能被救走，沦为魔王的俘虏！`);
                        }
                    }
                    combatLog.push(`【${rounds}回合】小队成功撤离了战斗！`);
                    monster.maxHp = monster.hp;
                    monster.hp = Math.max(0, monHp);
                    return { victory: false, defeated: false, escaped: true, rounds, combatLog, monster, betrayed };
                }
                }
            }

            // 每回合按速度重新排序
            actors.sort((a, b) => b.spd - a.spd);

            for (const actor of actors) {
                if (monHp <= 0) break;

                // V10.1: 战败勇者(hp<=0)不再行动
                if (actor.type === 'hero' && actor.entity.hp > 0) {
                    const hero = actor.entity;
                    if (actor.isSpy) {
                        if (betrayed) {
                            const aliveTargets = realHeroes.filter(h => h.hp > 0);
                            if (aliveTargets.length > 0) {
                                const target = aliveTargets.reduce((min, h) => h.hp < min.hp ? h : min, aliveTargets[0]);
                                const spyAtk = Math.floor((hero.cflag[CFLAGS.ATK] || 20) * 0.5);
                                const dmg = Math.max(1, spyAtk - (target.cflag[CFLAGS.DEF] || 15));
                                target.hp = Math.max(0, target.hp - dmg);
                                combatLog.push(`💀 ${hero.name}(叛变)攻击${target.name}，造成${dmg}伤害`);
                            }
                        } else {
                            combatLog.push(`😶 ${hero.name}(伪装者)消极作战，没有攻击`);
                        }
                        continue;
                    }

                    // 应用异常状态效果
                    const statusFx = this._applyStatusAilmentEffects(hero);
                    let heroBaseAtk = (hero.cflag[CFLAGS.ATK] || 20);
                    let heroBaseDef = (hero.cflag[CFLAGS.DEF] || 15);
                    heroBaseAtk = Math.max(1, Math.floor(heroBaseAtk * (1 + statusFx.atkMod)));
                    heroBaseDef = Math.max(0, Math.floor(heroBaseDef * (1 + statusFx.defMod)));

                    // 异常状态：无法行动判定
                    if (statusFx.actionBlock > 0 && RAND(100) < statusFx.actionBlock * 100) {
                        combatLog.push(`【${rounds}回合】${hero.name}因异常状态无法行动！`);
                        continue;
                    }
                    if (statusFx.friendlyFire > 0 && RAND(100) < statusFx.friendlyFire * 100) {
                        const selfDmg = Math.max(1, Math.floor(heroBaseAtk * 0.3));
                        hero.hp = Math.max(1, hero.hp - selfDmg);
                        combatLog.push(`【${rounds}回合】${hero.name}陷入混乱，攻击了自己！💫 受到${selfDmg}伤害`);
                        continue;
                    }

                    // 治疗职业回合开始时治疗最低HP队友
                    const cls = this._getHeroClass(hero);
                    // V10.1: 治疗职业不治疗战败队友(hp<=0)
                    if (cls && HEALER_CLASS_IDS && HEALER_CLASS_IDS.includes(hero.cflag[CFLAGS.CLASS_ID] || hero.cflag[CFLAGS.HERO_CLASS])) {
                        const allies = realHeroes.filter(h => h.hp > 0 && h.hp < h.maxHp * 0.6);
                        if (allies.length > 0 && RAND(100) < 30) {
                            const target = allies.reduce((min, h) => h.hp / h.maxHp < min.hp / min.maxHp ? h : min, allies[0]);
                            const healAmt = Math.floor(hero.level * 2 + heroBaseAtk * 0.1);
                            target.hp = Math.min(target.maxHp, target.hp + healAmt);
                            combatLog.push(`【${rounds}回合】${hero.name}(治疗)恢复${target.name}${healAmt}HP`);
                        }
                    }

                    // V8.0: 尝试使用消耗品
                    if (this._tryUseConsumable(hero, combatLog, rounds)) {
                        continue;
                    }

                    // 尝试使用职业技能
                    const skillId = this._chooseHeroSkill(hero, "squad");
                    const skillDef = skillId ? ((window.CLASS_SKILL_DEFS && window.CLASS_SKILL_DEFS[skillId]) ? window.CLASS_SKILL_DEFS[skillId] : (typeof HERO_SKILL_DEFS !== 'undefined' ? HERO_SKILL_DEFS[skillId] : null)) : null;
                    const canUseSkill = skillDef && hero.mp >= (skillDef.cost || 0);

                    if (canUseSkill) {
                        hero.mp -= (skillDef.cost || 0);
                        const skillResult = this._useHeroSkill(hero, skillId, monster, { isSolo: false, squad: realHeroes });
                        if (skillResult && skillResult.used) {
                            combatLog.push(`【${rounds}回合】${skillResult.log}`);
                            if (skillResult.damage) {
                                monHp -= skillResult.damage;
                            }
                            // V10.1: 技能治疗不恢复战败队友
                            if (skillResult.heal) {
                                if (skillResult.isMass) {
                                    for (const ally of realHeroes) {
                                        if (ally.hp > 0) ally.hp = Math.min(ally.maxHp, ally.hp + skillResult.heal);
                                    }
                                } else {
                                    const healTarget = realHeroes.filter(h => h.hp > 0).reduce((min, h) => h.hp < min.hp ? h : min, realHeroes[0]);
                                    if (healTarget) healTarget.hp = Math.min(healTarget.maxHp, healTarget.hp + skillResult.heal);
                                }
                            }
                            if (skillResult.buff) {
                                // 小队战斗中增益效果只作用于自己（简化）
                                combatLog.push(`  → ${hero.name}获得增益效果`);
                            }
                            if (skillResult.cleanse) {
                                const cured = this._tryCureStatusAilment(hero, "skill_cleanse");
                                if (cured.length > 0) combatLog.push(`  → ${cured.join(',')}`);
                            }
                            if (skillResult.invincible) {
                                combatLog.push(`  → ${hero.name}进入无敌状态`);
                            }
                            continue;
                        }
                    }

                    // V7.2: 新伤害公式（百分比减伤 + 等级碾压）
                    const gBonus = GearSystem.applyGearBonus(hero, !!hero.talent[200]);
                    const heroAtkBase = Math.floor(((hero.cflag[CFLAGS.ATK] || 20) + (gBonus.atk || 0)) * attrMod);
                    const heroDmgRes = this._calcDamageV2({
                        attackerAtk: heroAtkBase, attackerLv: hero.level || 1,
                        targetDef: monster.def || 0, targetLv: monster.level || 1,
                        skillPower: 1.0
                    });
                    monHp -= heroDmgRes.dmg;
                    let heroDmgLog = `【${rounds}回合】${hero.name}攻击${monster.name}，造成${heroDmgRes.dmg}伤害`;
                    if (heroDmgRes.isCrit) heroDmgLog += ' 💥暴击';
                    if (heroDmgRes.crushLabel) heroDmgLog += ` (${heroDmgRes.crushLabel})`;
                    combatLog.push(heroDmgLog);

                } else if (actor.type === 'monster' && monHp > 0) {
                    let aliveTargets = squad.filter(h => h.hp > 0);
                    if (aliveTargets.length === 0) break;
                    const realTargets = aliveTargets.filter(h => !h.cflag[912]);

                    // V7.2: 怪物按站位优先级选择目标
                    const getPos = (h) => {
                        const role = (window.CLASS_DEFS && window.CLASS_DEFS[h.cflag[CFLAGS.HERO_CLASS]] && window.CLASS_DEFS[h.cflag[CFLAGS.HERO_CLASS]].role) ||
                                     (HERO_CLASS_DEFS && HERO_CLASS_DEFS[h.cflag[CFLAGS.HERO_CLASS]] && HERO_CLASS_DEFS[h.cflag[CFLAGS.HERO_CLASS]].role) || 'middle';
                        return this._getPositionFromRole(role);
                    };
                    const frontTargets = realTargets.filter(h => getPos(h) === 'front');
                    const middleTargets = realTargets.filter(h => getPos(h) === 'middle');
                    const backTargets = realTargets.filter(h => getPos(h) === 'back');
                    const posRoll = RAND(100);
                    let targetPool;
                    if (posRoll < 60 && frontTargets.length > 0) targetPool = frontTargets;
                    else if (posRoll < 90 && middleTargets.length > 0) targetPool = middleTargets;
                    else if (backTargets.length > 0) targetPool = backTargets;
                    else if (middleTargets.length > 0) targetPool = middleTargets;
                    else if (frontTargets.length > 0) targetPool = frontTargets;
                    else targetPool = aliveTargets;
                    const target = targetPool.reduce((min, h) => h.hp < min.hp ? h : min, targetPool[0]);
                    const monAtkBase = Math.floor(monster.atk * (hasSpy && !betrayed ? 1.25 : 1));
                    const tBonus = GearSystem.applyGearBonus(target, !!target.talent[200]);
                    const targetDef = (target.cflag[CFLAGS.DEF] || 15) + (tBonus.def || 0);
                    const monDmgRes = this._calcDamageV2({
                        attackerAtk: monAtkBase, attackerLv: monster.level || 1,
                        targetDef: targetDef, targetLv: target.level || 1,
                        skillPower: 1.0,
                        attacker: monster, target: target
                    });
                    const monDmg = monDmgRes.dmg;
                    target.hp = Math.max(0, target.hp - monDmg);
                    let monDmgLog = `【${rounds}回合】${monster.name}攻击${target.name}，造成${monDmg}伤害`;
                    if (monDmgRes.isCrit) monDmgLog += ' 💥暴击';
                    if (monDmgRes.crushLabel) monDmgLog += ` (${monDmgRes.crushLabel})`;
                    if (target.hp === 1) {
                        monDmgLog += ` → ${target.name}陷入濒死状态！💀`;
                    }
                    combatLog.push(monDmgLog);

                    // 怪物有概率附加异常状态
                    const aiType = this._getMonsterAIType(monster);
                    if (aiType === 'magic' && RAND(100) < 15) {
                        this._addStatusAilment(target, "paralysis", 2);
                        combatLog.push(`  → ${target.name}被麻痹了！`);
                    } else if (RAND(100) < 8) {
                        const ailments = ["weak", "burn", "poison", "fear"];
                        const aType = ailments[RAND(ailments.length)];
                        this._addStatusAilment(target, aType, 2 + RAND(2));
                        combatLog.push(`  → ${target.name}被施加了【${STATUS_AILMENT_DEFS[aType].name}】！`);
                    }
                }
            }
        }

        let victory = monHp <= 0;
        const allDefeated = squad.filter(h => !h.cflag[912]).every(h => h.hp <= 0);
        const survivors = squad.filter(h => h.hp > 0);
        let escaped = false;

        // V7.2: 50回合后怪物未死 = 怪物撤退恢复30%HP，勇者无奖励
        if (!victory && !allDefeated) {
            monster.hp = Math.floor(monster.hp * 0.3);
            combatLog.push(`【超时】${monster.name}失去耐心，遁入黑暗恢复了伤势...`);
            escaped = true;
        }

        let drop = null;
        if (victory) {
            // V10.1: 濒死勇者战后恢复10%HP
            for (const hero of squad) {
                if (hero.hp > 0 && hero.hp <= hero.maxHp * 0.1 && !hero.cflag[912]) {
                    const recoverHp = Math.min(hero.maxHp, 1 + Math.floor(hero.maxHp * 0.1));
                    combatLog.push(`【战后】${hero.name}被队友救起，从濒死恢复至${recoverHp}HP`);
                    hero.hp = recoverHp;
                }
            }
            const expPerMember = Math.floor(monster.level * 10 / Math.max(1, survivors.filter(h => !h.cflag[912]).length));
            for (const hero of survivors) {
                if (!hero.cflag[912]) {
                    hero.addExp(102, expPerMember);
                    this.checkLevelUp(hero);
                }
            }
            combatLog.push(`【胜利】小队击败了${monster.name}(战斗${rounds}回合) 每人获得${expPerMember}EXP`);
            // V7.2: 战斗中HP<=10的勇者获得重伤debuff
            for (const hero of squad) {
                // V10.0: HP<=10的勇者（包括被击败的）获得重伤
                if (hero.hp <= 10 && !hero.cflag[912]) {
                    this._addStatusAilment(hero, "severe_injury", 9999);
                    combatLog.push(`【战后】${hero.name}身受重伤，战斗力大幅下降！`);
                    this._addAdventureLog(hero, 'severe_injury', '战斗中身受重伤，战斗力大幅下降');
                }
            }

            // 精英怪物掉落处理
            let dropChance = 0.30;
            let rarityBonus = 0;
            let dropLevel = monster.level;
            const floorId = survivors.length > 0 ? this.getHeroFloor(survivors[0]) : 1;
            const maxRarity = this._getFloorDropMaxRarity(floorId);
            if (monster.eliteType === 'chief') {
                dropChance = 1.0;
                rarityBonus = ELITE_TYPE_DEFS.chief.dropRarityBonus;
            } else if (monster.eliteType === 'overlord') {
                dropChance = 1.0;
                rarityBonus = ELITE_TYPE_DEFS.overlord.dropRarityBonus;
                if (RAND(100) < 50) {
                    const nextFloor = Math.min(10, floorId + 1);
                    dropLevel = this._getFloorMaxMonsterLevel(nextFloor) + 5;
                }
            }
            if (Math.random() < dropChance) {
                const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
                const slot = slotTypes[RAND(slotTypes.length)];
                let rarity = GearSystem._rollRarity();
                rarity = Math.min(maxRarity, rarity + rarityBonus);
                drop = GearSystem.generateGear(slot, dropLevel, rarity);
                const lucky = survivors[RAND(survivors.length)];
                // V8.0: 智能装备比较
                const check = GearSystem.shouldEquip(drop, slot, lucky);
                if (check.should) {
                    const r = GearSystem.equipItem(lucky, drop);
                    if (r.success) combatLog.push(`🎁 ${lucky.name}获得了${r.msg}`);
                } else {
                    combatLog.push(`🎁 ${lucky.name}获得了${drop.name}，但${check.reason}，未装备`);
                }
            }
        } else if (allDefeated) {
            combatLog.push(`【败北】小队被${monster.name}全灭了...`);
        } else if (escaped) {
            combatLog.push(`【撤退】小队从战斗中撤退了`);
        }

        // 更新怪物最终HP（用于UI显示）
        monster.maxHp = monster.hp;
        monster.hp = Math.max(0, monHp);
        // V7.2: 清除援军标记
        for (const h of squad) { h._isReinforcement = false; }
        return { victory, defeated: allDefeated, escaped, rounds, combatLog, monster, betrayed };
    }

    // 团队战斗：双方均可组队（最多3标准位+1临时位）
Game.prototype._doTeamCombat = function(leftTeam, rightTeam, options = {}) {
        const maxRounds = options.maxRounds || 50;
        const combatLog = [];
        let rounds = 0;

        const wrapUnit = (entity, teamSide, index) => {
            const isMonster = !entity.talent;
            const isExHero = entity.talent && entity.talent[200];
            const isSpy = entity.talent && entity.cflag[912];
            const isMaster = !isMonster && this.getMaster() === entity;
            const gBonus = isMonster ? {} : GearSystem.applyGearBonus(entity, !!isExHero);
            // 魔王声望等级加成（每100声望=1级）
            const fameLv = isMaster ? this.getMasterFameLevel() : 0;
            const effLevel = (entity.level || 1) + fameLv;
            const baseAtk = isMonster ? (entity.atk || 0) : ((entity.cflag[CFLAGS.ATK] || 20) + (gBonus.atk || 0) + fameLv * 5);
            const baseDef = isMonster ? (entity.def || 0) : ((entity.cflag[CFLAGS.DEF] || 15) + (gBonus.def || 0) + fameLv * 4);
            const baseSpd = isMonster ? (entity.spd || 0) : ((entity.cflag[CFLAGS.SPD] || 10) + effLevel * 2 + fameLv * 3);
            const statusFx = isMonster ? { atkMod:0, defMod:0, spdMod:0, hpMod:0, mpMod:0, dotHp:0, dotMp:0, actionBlock:0, friendlyFire:0 } : this._applyStatusAilmentEffects(entity);
            // 勋章加成（仅前勇者/奴隶）
            const medalMult = (!isMonster && isExHero) ? this.getMedalBonus(entity) : 1;
            // V10.0: 重伤状态HP/MP减半
            const hpMult = (1 + (statusFx.hpMod || 0)) * medalMult;
            const mpMult = (1 + (statusFx.mpMod || 0)) * medalMult;
            // 队长战斗 SPD +10%
            const isLeader = !isMonster && entity.cflag && entity.cflag[CFLAGS.SQUAD_LEADER] === 1;
            const leaderSpdMult = isLeader ? 1.1 : 1;
            return {
                id: teamSide + '_' + index,
                name: entity.name || '???',
                entity: entity,
                team: teamSide,
                isMonster: isMonster,
                isExHero: !!isExHero,
                isSpy: !!isSpy,
                initialHp: Math.max(1, Math.floor(((typeof entity.hp === 'number' && !isNaN(entity.hp)) ? entity.hp : (entity.maxHp || 1)) * hpMult)),
                initialMp: Math.max(0, Math.floor(((typeof entity.mp === 'number' && !isNaN(entity.mp)) ? entity.mp : (entity.maxMp || 0)) * mpMult)),
                hp: Math.max(1, Math.floor(((typeof entity.hp === 'number' && !isNaN(entity.hp)) ? entity.hp : (entity.maxHp || 1)) * hpMult)),
                maxHp: Math.max(1, Math.floor(((typeof entity.maxHp === 'number' && !isNaN(entity.maxHp)) ? entity.maxHp : (entity.hp || 1)) * hpMult)),
                mp: isMonster ? (entity.mp || 0) : Math.floor((entity.mp || 0) * mpMult),
                maxMp: isMonster ? (entity.mp || 0) : Math.floor((entity.maxMp || entity.mp || 1) * mpMult),
                baseAtk: Math.max(1, Math.floor(baseAtk * (1 + statusFx.atkMod) * medalMult * (isMaster ? 1.25 : 1))),
                baseDef: Math.max(0, Math.floor(baseDef * (1 + statusFx.defMod) * medalMult * (isMaster ? 1.25 : 1))),
                baseSpd: Math.max(1, Math.floor(baseSpd * (1 + statusFx.spdMod) * medalMult * (isMaster ? 1.25 : 1) * leaderSpdMult)),
                atkMod: 0, defMod: 0, spdMod: 0,
                buffTurns: 0,
                invincible: 0,
                nearDeath: false,
                tauntTurns: 0,
                counterTurns: 0,
                reflectTurns: 0,
                stunTurns: 0,
                stealthTurns: 0,
                sealTurns: 0,
                statusFx: statusFx,
                classId: isMonster ? 0 : (entity.cflag[CFLAGS.HERO_CLASS] || 0),
                level: effLevel,
                role: isMonster ? 'monster' : (
                    (window.CLASS_DEFS && window.CLASS_DEFS[entity.cflag[CFLAGS.HERO_CLASS]] && window.CLASS_DEFS[entity.cflag[CFLAGS.HERO_CLASS]].role) ||
                    (HERO_CLASS_DEFS && HERO_CLASS_DEFS[entity.cflag[CFLAGS.HERO_CLASS]] && HERO_CLASS_DEFS[entity.cflag[CFLAGS.HERO_CLASS]].role) ||
                    'middle'
                ),
                position: isMonster ? 'front' : this._getPositionFromRole(
                    (window.CLASS_DEFS && window.CLASS_DEFS[entity.cflag[CFLAGS.HERO_CLASS]] && window.CLASS_DEFS[entity.cflag[CFLAGS.HERO_CLASS]].role) ||
                    (HERO_CLASS_DEFS && HERO_CLASS_DEFS[entity.cflag[CFLAGS.HERO_CLASS]] && HERO_CLASS_DEFS[entity.cflag[CFLAGS.HERO_CLASS]].role) ||
                    'middle'
                )
            };
        };

        // 防御性检查：确保同一角色不会同时出现在两边
        const leftSet = new Set(leftTeam);
        const rightFiltered = rightTeam.filter(e => !leftSet.has(e));
        if (rightFiltered.length < rightTeam.length) {
            const dupNames = rightTeam.filter(e => leftSet.has(e)).map(e => e.name).join(', ');
            combatLog.push(`【系统】检测到${dupNames}同时出现在双方队伍中，已自动移除重复`);
        }
        const leftUnits = leftTeam.map((e, i) => wrapUnit(e, 'left', i));
        const rightUnits = rightFiltered.map((e, i) => wrapUnit(e, 'right', i));

        // V7.1: 快照包含所有单位（不过滤），保持索引顺序一致
        // V10.0: 快照同时包含HP和MP
        const snapshotHp = () => {
            const leftStr = leftUnits.map(u => `${u.name}:${Math.max(0, u.hp)}/${u.maxHp}(MP${u.mp || 0}/${u.maxMp || 1})`).join(' ');
            const rightStr = rightUnits.map(u => `${u.name}:${Math.max(0, u.hp)}/${u.maxHp}(MP${u.mp || 0}/${u.maxMp || 1})`).join(' ');
            return `L:${leftStr || '全灭'} | R:${rightStr || '全灭'}`;
        };
        combatLog.push(`【初始】${snapshotHp()}`);

        for (const u of leftUnits) {
            if (u.statusFx.dotHp > 0 || u.statusFx.dotMp > 0) {
                const stText = this._getStatusAilmentText(u.entity);
                if (stText) combatLog.push(`⚠️ ${u.name}处于异常状态：${stText}`);
            }
        }

        let betrayed = false;
        const spies = leftUnits.filter(u => u.isSpy);
        const realLeft = leftUnits.filter(u => !u.isSpy);
        if (spies.length > 0 && realLeft.length > 0) {
            const leftTotalHp = realLeft.reduce((s, u) => s + u.hp, 0);
            const rightTotalHp = rightUnits.reduce((s, u) => s + u.hp, 0);
            if (leftTotalHp < (spies.reduce((s, u) => s + u.hp, 0) + rightTotalHp) * 0.25) {
                betrayed = true;
                combatLog.push(`💀 ${spies.map(s => s.name).join(',')} 叛变了！转而攻击同伴！`);
            }
        }

        let allActors = [...leftUnits, ...rightUnits];

        while (rounds < maxRounds) {
            const aliveLeft = leftUnits.filter(u => u.hp > 0);
            const aliveRight = rightUnits.filter(u => u.hp > 0);
            if (aliveLeft.length === 0 || aliveRight.length === 0) break;

            rounds++;

            // === 逃跑判定：勇者方每回合可以尝试撤离 ===
            if (rounds >= 3) {
                const leftHasHero = aliveLeft.some(u => !u.isMonster && !u.isExHero && !u.isSpy && !u.isMaster);
                const rightHasHero = aliveRight.some(u => !u.isMonster && !u.isExHero && !u.isSpy && !u.isMaster);
                if (leftHasHero !== rightHasHero) {
                    const heroSide = leftHasHero ? aliveLeft : aliveRight;
                    const enemySide = leftHasHero ? aliveRight : aliveLeft;
                    const heroMaxLevel = Math.max(...heroSide.map(u => u.level));
                    const enemyMaxLevel = enemySide.length > 0 ? Math.max(...enemySide.map(u => u.level)) : 1;
                    let fleeChance = Math.max(5, Math.min(95, 30 + (heroMaxLevel - enemyMaxLevel) * 5));
                    // 血量修正：血量优势大时不逃跑
                    const heroTotalHp = heroSide.reduce((s, u) => s + Math.max(0, u.hp), 0);
                    const heroTotalMaxHp = heroSide.reduce((s, u) => s + u.maxHp, 0);
                    const enemyTotalHp = enemySide.reduce((s, u) => s + Math.max(0, u.hp), 0);
                    const heroHpRatio = heroTotalMaxHp > 0 ? heroTotalHp / heroTotalMaxHp : 1;
                    if (heroHpRatio > 0.7 && heroTotalHp > enemyTotalHp * 1.5) {
                        fleeChance = 0; // 碾压局不跑
                    } else if (heroHpRatio > 0.5 && heroTotalHp > enemyTotalHp) {
                        fleeChance = Math.floor(fleeChance * 0.3); // 优势局大幅降概率
                    }
                    if (heroHpRatio < 0.3) {
                        fleeChance = Math.min(95, fleeChance + 30);
                    } else if (heroHpRatio < 0.5) {
                        fleeChance = Math.min(95, fleeChance + 15);
                    }
                    // 5回合内逃跑成功率-50%
                    if (rounds <= 5) {
                        fleeChance = Math.floor(fleeChance * 0.5);
                    }
                    // V7.1: 逃跑时濒死勇者可能被落下
                    if (RAND(100) < fleeChance) {
                    const nearDeathUnits = (leftHasHero ? leftUnits : rightUnits).filter(u => u.hp > 0 && u.hp <= u.maxHp * 0.1 && !u.isMonster && !u.isSpy && !u.isMaster);
                    if (nearDeathUnits.length > 0) {
                        const rescued = [];
                        const captured = [];
                        for (const ndu of nearDeathUnits) {
                            if (RAND(100) < 60) {
                                rescued.push(ndu);
                            } else {
                                captured.push(ndu);
                                ndu.hp = 0;
                                const ent = ndu.entity;
                                const idx = this.invaders ? this.invaders.indexOf(ent) : -1;
                                if (idx >= 0) this.invaders.splice(idx, 1);
                                this._imprisonHero(ent);
                            }
                        }
                        if (rescued.length > 0) {
                            combatLog.push(`【${rounds}回合】🏃 ${rescued.map(u=>u.name).join(',')}被同伴勉强救走了！`);
                        }
                        if (captured.length > 0) {
                            combatLog.push(`【${rounds}回合】💀 ${captured.map(u=>u.name).join(',')}未能被救走，沦为魔王的俘虏！`);
                        }
                    }
                    combatLog.push(`【${rounds}回合】勇者方成功撤离了战斗！`);
                    for (const u of leftUnits) { u.entity.hp = u.hp; u.entity.mp = u.mp; }
                    for (const u of rightUnits) { u.entity.hp = u.hp; u.entity.mp = u.mp; }
                    return { victory: false, defeated: false, escaped: true, rounds, combatLog, leftTeam: leftUnits, rightTeam: rightUnits, drop: null, betrayed, monster: rightUnits[0] ? rightUnits[0].entity : null };
                }
                }
            }

            allActors.sort((a, b) => (b.baseSpd + b.spdMod) - (a.baseSpd + a.spdMod));

            // V7.2: 每回合开始时结算异常状态dot（仅勇者）
            for (const actor of allActors) {
                if (actor.isMonster || actor.hp <= 0) continue;
                // 同步当前HP到entity，确保dot基于最新HP计算
                actor.entity.hp = actor.hp;
                const ailLogs = this._processStatusAilmentTurn(actor.entity);
                for (const log of ailLogs) {
                    combatLog.push(`【${rounds}回合】${actor.name}${log}`);
                }
                actor.hp = actor.entity.hp;
            }

            // V10.1: 战败/眩晕/隐身状态处理
            for (const actor of allActors) {
                if (actor.hp <= 0) continue;
                // 眩晕跳过行动
                if (actor.stunTurns > 0) {
                    actor.stunTurns--;
                    combatLog.push(`【${rounds}回合】${actor.name}处于眩晕状态，无法行动！`);
                    continue;
                }
                // 隐身衰减
                if (actor.stealthTurns > 0) {
                    actor.stealthTurns--;
                    if (actor.stealthTurns <= 0) {
                        combatLog.push(`【${rounds}回合】${actor.name}的隐身效果消失了`);
                    }
                }
                const enemyAlive = actor.team === 'left'
                    ? rightUnits.filter(u => u.hp > 0)
                    : leftUnits.filter(u => u.hp > 0);
                if (enemyAlive.length === 0) break;

                if (actor.isSpy && actor.team === 'left') {
                    if (betrayed) {
                        const targets = leftUnits.filter(u => u.hp > 0 && !u.isSpy);
                        if (targets.length > 0) {
                            const target = targets.reduce((min, u) => u.hp < min.hp ? u : min, targets[0]);
                            const dmg = Math.max(1, Math.floor(actor.baseAtk * 0.5));
                            target.hp = Math.max(0, target.hp - dmg);
                            combatLog.push(`【${rounds}回合】💀 ${actor.name}(叛变)攻击${target.name}，造成${dmg}伤害`);
                        }
                    } else {
                        combatLog.push(`【${rounds}回合】😶 ${actor.name}(伪装者)消极作战，没有攻击`);
                    }
                    continue;
                }

                if (actor.statusFx.actionBlock > 0 && RAND(100) < actor.statusFx.actionBlock * 100) {
                    combatLog.push(`【${rounds}回合】${actor.name}因异常状态无法行动！`);
                    continue;
                }
                if (actor.statusFx.friendlyFire > 0 && RAND(100) < actor.statusFx.friendlyFire * 100) {
                    const selfDmg = Math.max(1, Math.floor((actor.baseAtk + actor.atkMod) * 0.3));
                    actor.hp = Math.max(1, actor.hp - selfDmg);
                    combatLog.push(`【${rounds}回合】${actor.name}陷入混乱，攻击了自己！💫 受到${selfDmg}伤害`);
                    continue;
                }

                // V12.0: 诅咒武器25%概率攻击自身（只对非怪物角色）
                if (!actor.isMonster && this._checkCurseWeaponSelfHarm(actor.entity || actor, combatLog, rounds + '回合')) {
                    continue;
                }

                // V7.2: 怪物按站位优先级选择目标
                let target;
                if (actor.isMonster) {
                    const enemyTeam = actor.team === 'left' ? rightUnits : leftUnits;
                    target = this._chooseMonsterTargetByPosition(enemyTeam, spies, betrayed);
                    if (!target) target = enemyAlive.reduce((min, u) => u.hp < min.hp ? u : min, enemyAlive[0]);
                } else {
                    // 射程限制 + 刺客绕后排
                    const isAssassin = actor.role && (actor.role.includes('assassin') || actor.role.includes('ninja') || actor.role === 'soul_reaper');
                    const isMelee = actor.position === 'front';
                    const front = enemyAlive.filter(u => u.position === 'front');
                    const middle = enemyAlive.filter(u => u.position === 'middle');
                    const back = enemyAlive.filter(u => u.position === 'back');
                    if (isAssassin) {
                        // 刺客优先打后排
                        if (back.length > 0) target = back.reduce((min, u) => u.hp < min.hp ? u : min, back[0]);
                        else if (middle.length > 0) target = middle.reduce((min, u) => u.hp < min.hp ? u : min, middle[0]);
                        else target = front.reduce((min, u) => u.hp < min.hp ? u : min, front[0]);
                    } else if (isMelee) {
                        // 近战只能打前排→中排→后排
                        if (front.length > 0) target = front.reduce((min, u) => u.hp < min.hp ? u : min, front[0]);
                        else if (middle.length > 0) target = middle.reduce((min, u) => u.hp < min.hp ? u : min, middle[0]);
                        else target = back.reduce((min, u) => u.hp < min.hp ? u : min, back[0]);
                    } else {
                        // 远程/魔法打任意，默认打HP最低
                        target = enemyAlive.reduce((min, u) => u.hp < min.hp ? u : min, enemyAlive[0]);
                    }
                }

                // V8.0: 尝试使用消耗品（团队战斗）
                if (!actor.isMonster) {
                    if (this._tryUseConsumable(actor.entity, combatLog, rounds)) {
                        actor.hp = actor.entity.hp;
                        actor.mp = actor.entity.mp;
                        continue;
                    }
                }

                if (!actor.isMonster && actor.mp >= 10) {
                    const skillCtx = actor.team === 'left' ? 'squad' : 'solo';
                    const combatCtx = {
                        targetHpPct: target.hp / Math.max(1, target.maxHp),
                        targetCount: enemyAlive.length,
                        hasDeadAlly: (actor.team === 'left' ? leftUnits : rightUnits).some(u => u.hp <= 0),
                        hasNearDeathAlly: (actor.team === 'left' ? leftUnits : rightUnits).some(u => u.hp > 0 && u.hp <= u.maxHp * 0.1),
                        actorBuffTurns: actor.buffTurns
                    };
                    let skillId = this._chooseHeroSkill(actor.entity, skillCtx, combatCtx);
                    let skillDef = skillId ? ((window.CLASS_SKILL_DEFS && window.CLASS_SKILL_DEFS[skillId]) ? window.CLASS_SKILL_DEFS[skillId] : (typeof HERO_SKILL_DEFS !== 'undefined' ? HERO_SKILL_DEFS[skillId] : null)) : null;
                    // V10.0: 若首选技能MP不足，尝试找MP负担得起的同类型技能
                    if (skillDef && actor.mp < (skillDef.cost || 0)) {
                        const cls = this._getHeroClass(actor.entity);
                        const allSkills = (cls && cls.skills) ? cls.skills.map(id => ({ id, def: (window.CLASS_SKILL_DEFS && window.CLASS_SKILL_DEFS[id]) ? window.CLASS_SKILL_DEFS[id] : (typeof HERO_SKILL_DEFS !== 'undefined' ? HERO_SKILL_DEFS[id] : null) })).filter(s => s.def && actor.mp >= (s.def.cost || 0)) : [];
                        if (allSkills.length > 0) {
                            const sameType = allSkills.find(s => {
                                const aType = (s.def.type === 'active' && s.def.effectType) ? s.def.effectType : (s.def.type || s.def.effectType);
                                const bType = (skillDef.type === 'active' && skillDef.effectType) ? skillDef.effectType : (skillDef.type || skillDef.effectType);
                                return aType === bType;
                            });
                            if (sameType) { skillId = sameType.id; skillDef = sameType.def; }
                            else { skillId = allSkills[0].id; skillDef = allSkills[0].def; }
                        } else {
                            skillDef = null;
                        }
                    }
                    if (skillDef && actor.mp >= (skillDef.cost || 0)) {
                        actor.mp -= (skillDef.cost || 0);
                        const skillResult = this._useHeroSkill(actor.entity, skillId, target.entity, { isSolo: actor.team !== 'left', squad: leftUnits.filter(u => u.hp > 0 && !u.isSpy).map(u => u.entity) });
                        if (skillResult && skillResult.used) {
                            combatLog.push(`【${rounds}回合】${skillResult.log}`);
                            if (skillResult.damage) {
                                if (skillResult.isAoE) {
                                    // AOE技能：伤害所有敌方存活单位
                                    const enemies = (actor.team === 'left' ? rightUnits : leftUnits).filter(u => u.hp > 0);
                                    for (const e of enemies) {
                                        e.hp = Math.max(0, e.hp - skillResult.damage);
                                    }
                                } else {
                                    target.hp = Math.max(0, target.hp - skillResult.damage);
                                }
                            }
                            // V10.1: 技能治疗不恢复战败队友
                            if (skillResult.heal) {
                                const allies = (actor.team === 'left' ? leftUnits : rightUnits).filter(u => u.hp > 0);
                                if (skillResult.isMass) {
                                    for (const ally of allies) ally.hp = Math.min(ally.maxHp, ally.hp + skillResult.heal);
                                } else {
                                    const healTarget = allies.reduce((min, u) => u.hp < min.hp ? u : min, allies[0]);
                                    if (healTarget) healTarget.hp = Math.min(healTarget.maxHp, healTarget.hp + skillResult.heal);
                                }
                            }
                            if (skillResult.buff) {
                                const b = skillResult.buff;
                                if (b.type === 'atk' || b.type === 'all') actor.atkMod += b.value;
                                if (b.type === 'def' || b.type === 'all') actor.defMod += b.value;
                                actor.buffTurns = Math.max(actor.buffTurns, b.duration || 3);
                            }
                            if (skillResult.debuff) {
                                const d = skillResult.debuff;
                                if (d.type === 'atk' || d.type === 'all') target.atkMod -= d.value;
                                if (d.type === 'def' || d.type === 'all') target.defMod -= d.value;
                            }
                            if (skillResult.invincible) actor.invincible = skillResult.duration || 1;
                            if (skillResult.ailment) {
                                this._addStatusAilment(target.entity, skillResult.ailment.type, skillResult.ailment.turns);
                                combatLog.push(`  → ${target.name}被施加了【${STATUS_AILMENT_DEFS[skillResult.ailment.type].name}】！`);
                            }
                            if (skillResult.cleanse) {
                                const cured = this._tryCureStatusAilment(actor.entity, "skill_cleanse");
                                if (cured.length > 0) combatLog.push(`  → ${cured.join(',')}`);
                            }
                            // V7.2: 新技能效果处理
                            if (skillResult.damage && skillResult.lifesteal) {
                                const lsHeal = Math.floor(skillResult.damage * 0.3);
                                actor.hp = Math.min(actor.maxHp, actor.hp + lsHeal);
                                combatLog.push(`  → ${actor.name}吸取了${lsHeal}HP`);
                            }
                            if (skillResult.counter) {
                                actor.counterTurns = skillResult.duration || 2;
                                combatLog.push(`  → ${actor.name}进入反击姿态(${actor.counterTurns}回合)`);
                            }
                            if (skillResult.reflect) {
                                actor.reflectTurns = skillResult.duration || 3;
                                combatLog.push(`  → ${actor.name}进入反伤姿态(${actor.reflectTurns}回合)`);
                            }
                            if (skillResult.stun) {
                                target.stunTurns = skillResult.duration || 1;
                                if (skillResult.damage) target.hp = Math.max(0, target.hp - skillResult.damage);
                                combatLog.push(`  → ${target.name}被眩晕了(${target.stunTurns}回合)！`);
                            }
                            if (skillResult.taunt) {
                                actor.tauntTurns = skillResult.duration || 2;
                                combatLog.push(`  → ${actor.name}挑衅了敌人(${actor.tauntTurns}回合)`);
                            }
                            if (skillResult.stealth) {
                                actor.stealthTurns = skillResult.duration || 2;
                                combatLog.push(`  → ${actor.name}进入隐身状态(${actor.stealthTurns}回合)`);
                            }
                            if (skillResult.confuse) {
                                this._addStatusAilment(target.entity, 'confusion', skillResult.duration || 2);
                                combatLog.push(`  → ${target.name}陷入混乱！`);
                            }
                            if (skillResult.selfStun) {
                                actor.stunTurns = 1;
                                combatLog.push(`  → ${actor.name}因大爆炸的反噬无法行动(1回合)`);
                            }
                            continue;
                        }
                    }
                }

                // V10.1: 治疗职业不治疗战败队友(hp<=0)
                if (!actor.isMonster && HEALER_CLASS_IDS && HEALER_CLASS_IDS.includes(actor.classId || actor.cflag && (actor.cflag[CFLAGS.CLASS_ID] || actor.cflag[CFLAGS.HERO_CLASS]))) {
                    const allies = (actor.team === 'left' ? leftUnits : rightUnits).filter(u => u.hp > 0 && u.hp < u.maxHp * 0.6);
                    if (allies.length > 0 && RAND(100) < 30) {
                        const healTarget = allies.reduce((min, u) => u.hp / u.maxHp < min.hp / min.maxHp ? u : min, allies[0]);
                        const healAmt = Math.floor(actor.level * 4 + actor.baseAtk * 0.2);
                        healTarget.hp = Math.min(healTarget.maxHp, healTarget.hp + healAmt);
                        combatLog.push(`【${rounds}回合】${actor.name}(治疗)恢复${healTarget.name}${healAmt}HP`);
                        continue;
                    }
                }

                // V7.2: 骑士守护 — 近战/怪物攻击后排时，己方坦克有概率替承伤
                let guardUnit = null;
                if ((actor.position === 'front' || actor.isMonster) && target.position !== 'front') {
                    const allyTeam = target.team === 'left' ? leftUnits : rightUnits;
                    const tanks = allyTeam.filter(u => u.hp > 0 && (u.role === 'tank' || u.role === 'holy_tank'));
                    if (tanks.length > 0 && RAND(100) < 40) {
                        guardUnit = tanks.reduce((min, u) => u.hp < min.hp ? u : min, tanks[0]);
                    }
                }

                // V7.2: 新伤害公式（百分比减伤 + 等级碾压 + 站位射程）
                const attackerAtk = Math.max(1, actor.baseAtk + actor.atkMod);
                const targetDef = Math.max(0, target.baseDef + target.defMod);
                let skillPower = 1.0;
                // 前排近战攻击前排目标 +20%伤害
                if (actor.position === 'front' && target.position === 'front') skillPower = 1.2;
                // 刺客绕后排 -10%伤害（忍者/影忍除外）
                if (actor.position === 'back' && target.position === 'back' && (actor.role && actor.role.includes('assassin') && actor.role !== 'dodge_assassin')) skillPower = 0.9;
                // 怪物对间谍增伤
                if (actor.isMonster && actor.team === 'right' && spies.length > 0 && !betrayed) skillPower *= 1.25;

                const dmgRes = this._calcDamageV2({
                    attackerAtk: attackerAtk, attackerLv: actor.level || 1,
                    targetDef: targetDef, targetLv: target.level || 1,
                    skillPower: skillPower,
                    attacker: actor.entity, target: target.entity
                });
                let dmg = dmgRes.dmg;

                if (target.invincible > 0) {
                    combatLog.push(`【${rounds}回合】${actor.name}的攻击被${target.name}挡下了！🛡️ (无敌)`);
                    target.invincible--;
                    continue;
                }

                // V7.2: 守护替承伤
                if (guardUnit) {
                    guardUnit.hp = Math.max(0, guardUnit.hp - dmg);
                    // 反击/反伤由守护单位触发
                    if (guardUnit.counterTurns > 0 && guardUnit.hp > 0) {
                        const counterDmg = Math.max(1, Math.floor(guardUnit.baseAtk * 0.8));
                        actor.hp = Math.max(0, actor.hp - counterDmg);
                        combatLog.push(`  → ${guardUnit.name}反击！造成${counterDmg}伤害`);
                    }
                    if (guardUnit.reflectTurns > 0 && guardUnit.hp > 0) {
                        const reflectDmg = Math.max(1, Math.floor(dmg * 0.3));
                        actor.hp = Math.max(0, actor.hp - reflectDmg);
                        combatLog.push(`  → ${guardUnit.name}反弹了${reflectDmg}伤害！`);
                    }
                    let atkLog = `【${rounds}回合】${actor.name}攻击${target.name}，${guardUnit.name}🛡️守护替其承受了${dmg}伤害`;
                    if (dmgRes.isCrit) atkLog += ' 💥暴击';
                    if (dmgRes.crushLabel) atkLog += ` (${dmgRes.crushLabel})`;
                    if (guardUnit.hp === 1) atkLog += ` → ${guardUnit.name}陷入濒死状态！💀`;
                    combatLog.push(atkLog);
                } else {
                    target.hp = Math.max(0, target.hp - dmg);
                    // V7.2: 反击与反伤
                    if (target.counterTurns > 0 && target.hp > 0) {
                        const counterDmg = Math.max(1, Math.floor(target.baseAtk * 0.8));
                        actor.hp = Math.max(0, actor.hp - counterDmg);
                        combatLog.push(`  → ${target.name}反击！造成${counterDmg}伤害`);
                    }
                    if (target.reflectTurns > 0 && target.hp > 0) {
                        const reflectDmg = Math.max(1, Math.floor(dmg * 0.3));
                        actor.hp = Math.max(0, actor.hp - reflectDmg);
                        combatLog.push(`  → ${target.name}反弹了${reflectDmg}伤害！`);
                    }
                    let atkLog = `【${rounds}回合】${actor.name}攻击${target.name}，造成${dmg}伤害`;
                    if (dmgRes.isCrit) atkLog += ' 💥暴击';
                    if (dmgRes.crushLabel) atkLog += ` (${dmgRes.crushLabel})`;
                    if (target.hp === 1) atkLog += ` → ${target.name}陷入濒死状态！💀`;
                    combatLog.push(atkLog);
                }

                if (actor.isMonster && RAND(100) < 10) {
                    const ailments = ["weak", "burn", "poison", "fear"];
                    const aType = ailments[RAND(ailments.length)];
                    const ailmentTarget = guardUnit || target;
                    this._addStatusAilment(ailmentTarget.entity, aType, 2 + RAND(2));
                    combatLog.push(`  → ${ailmentTarget.name}被施加了【${STATUS_AILMENT_DEFS[aType].name}】！`);
                }
            }

            combatLog.push(`【${rounds}回合结束】${snapshotHp()}`);

            for (const u of allActors) {
                if (u.buffTurns > 0) {
                    u.buffTurns--;
                    if (u.buffTurns <= 0) { u.atkMod = 0; u.defMod = 0; u.spdMod = 0; }
                }
                if (u.invincible > 0) u.invincible--;
            }
        }

        const aliveLeft = leftUnits.filter(u => u.hp > 0);
        const aliveRight = rightUnits.filter(u => u.hp > 0);
        let victory = aliveRight.length === 0 && aliveLeft.length > 0;
        let defeated = aliveLeft.length === 0;
        const realLeftAlive = leftUnits.filter(u => u.hp > 0 && !u.isSpy);
        let draw = false;

        // 50回合后未分胜负
        if (!victory && !defeated) {
            const leftHasMonster = leftUnits.some(u => u.isMonster);
            const rightHasMonster = rightUnits.some(u => u.isMonster);
            const leftHasMaster = leftUnits.some(u => u.isMaster);
            const rightHasMaster = rightUnits.some(u => u.isMaster);
            const isPvP = !leftHasMonster && !rightHasMonster && !leftHasMaster && !rightHasMaster;
            if (isPvP) {
                // 勇者内战50回合视为平手（撤退）
                combatLog.push(`【平手】双方激战50回合未分胜负，各自撤退`);
            } else {
                // V7.2: 50回合后怪物未死 = 怪物撤退，勇者无奖励
                const monsterSide = leftHasMonster ? leftUnits : (rightHasMonster ? rightUnits : null);
                if (monsterSide) {
                    const monUnit = monsterSide.find(u => u.isMonster);
                    if (monUnit && monUnit.entity) {
                        monUnit.entity.hp = Math.floor((monUnit.entity.maxHp || monUnit.entity.hp) * 0.3);
                        combatLog.push(`【超时】${monUnit.name}失去耐心，遁入黑暗恢复了伤势...`);
                    }
                }
                escaped = true;
            }
        }

        // V10.1: 勇者方胜利时，濒死勇者恢复10%HP
        if (victory) {
            for (const u of leftUnits) {
                if (u.hp > 0 && u.hp <= u.maxHp * 0.1 && !u.isMonster && !u.isSpy && !u.isMaster) {
                    const recoverHp = Math.min(u.maxHp, 1 + Math.floor(u.maxHp * 0.1));
                    combatLog.push(`【战后】${u.name}被队友救起，从濒死恢复至${recoverHp}HP`);
                    u.hp = recoverHp;
                }
            }
        }

        for (const u of leftUnits) { u.entity.hp = u.hp; u.entity.mp = u.mp; }
        for (const u of rightUnits) { u.entity.hp = u.hp; u.entity.mp = u.mp; }

        // V10.0: 战斗后恢复
        // - 勇者（入侵者）：存活恢复20%，被击败的获得重伤（在下方处理）
        // - 魔王军（奴隶/魔王）：战败回魔王殿满状态恢复；存活/平手恢复20%
        // - 怪物：每次遭遇均为满状态，无需恢复
        const _recoverAfterCombat = (unitList) => {
            for (const u of unitList) {
                if (u.isMonster) continue;
                const ent = u.entity;
                if (!ent) continue;
                // 魔王专属：无论胜负，每次战斗后满状态恢复（地下城主宰的特权）
                if (u.isMaster) {
                    ent.hp = ent.maxHp;
                    ent.mp = ent.maxMp;
                    u.hp = ent.maxHp;
                    u.mp = ent.maxMp;
                    combatLog.push(`【战后】${u.name}汲取地下城魔力，状态完全恢复！`);
                    continue;
                }
                // 魔王军被击败 → 回魔王殿满状态恢复
                if (u.isExHero && u.hp <= 0) {
                    ent.hp = ent.maxHp;
                    ent.mp = ent.maxMp;
                    u.hp = ent.maxHp;
                    u.mp = ent.maxMp;
                    combatLog.push(`【战后】${u.name}返回魔王殿接受治疗，状态完全恢复`);
                    continue;
                }
                // 存活单位恢复20%
                if (u.hp > 0) {
                    const hpRec = Math.max(1, Math.floor(ent.maxHp * 0.20));
                    const mpRec = Math.max(1, Math.floor(ent.maxMp * 0.20));
                    ent.hp = Math.min(ent.maxHp, ent.hp + hpRec);
                    ent.mp = Math.min(ent.maxMp, ent.mp + mpRec);
                    u.hp = ent.hp;
                    u.mp = ent.mp;
                }
            }
        };
        _recoverAfterCombat(leftUnits);
        _recoverAfterCombat(rightUnits);

        // V7.2: 战斗中HP<=10的勇者获得重伤debuff
        // V10.0: 只有真正的勇者（入侵者）会获得重伤；怪物/魔王/奴隶/间谍不会
        for (const u of leftUnits) {
            if (u.hp <= 10 && !u.isMonster && !u.isSpy && !u.isMaster && !u.isExHero && u.entity) {
                this._addStatusAilment(u.entity, "severe_injury", 9999);
                combatLog.push(`【战后】${u.name}身受重伤，战斗力大幅下降！`);
                this._addAdventureLog(u.entity, 'severe_injury', '战斗中身受重伤，战斗力大幅下降');
            }
        }
        for (const u of rightUnits) {
            if (u.hp <= 10 && !u.isMonster && !u.isSpy && !u.isMaster && !u.isExHero && u.entity) {
                this._addStatusAilment(u.entity, "severe_injury", 9999);
                combatLog.push(`【战后】${u.name}身受重伤，战斗力大幅下降！`);
                this._addAdventureLog(u.entity, 'severe_injury', '战斗中身受重伤，战斗力大幅下降');
            }
        }

        let drop = null;
        if (victory && aliveLeft.length > 0) {
            const highestLevelMonster = rightUnits.reduce((max, u) => u.level > max.level ? u : max, rightUnits[0]);
            if (!options.noExp) {
                const expPerMember = Math.floor(highestLevelMonster.level * 10 / Math.max(1, realLeftAlive.length));
                for (const u of realLeftAlive) {
                    u.entity.addExp(102, expPerMember);
                    this.checkLevelUp(u.entity);
                }
                combatLog.push(`【胜利】${aliveLeft.map(u => u.name).join(',')}击败了敌人(战斗${rounds}回合) 每人获得${expPerMember}EXP`);
            } else {
                combatLog.push(`【胜利】${aliveLeft.map(u => u.name).join(',')}获胜(战斗${rounds}回合)`);
            }
            // V10.0: 击败敌方勇者获得魔王勋章
            const leftHasNonHero = leftUnits.some(u => u.isMonster || u.isExHero || u.isSpy || u.isMaster);
            const rightHasHero = rightUnits.some(u => !u.isMonster && !u.isMaster);
            if (leftHasNonHero && rightHasHero && typeof this.addMedal === 'function') {
                const medalReceiver = aliveLeft.find(u => !u.isMonster && u.entity && typeof this.getMedalCount === 'function');
                if (medalReceiver) {
                    this.addMedal(medalReceiver.entity, 1);
                    combatLog.push(`🏅 ${medalReceiver.name}因击败勇者获得魔王勋章！`);
                }
            }
            if (!options.noDrop) {
                const elite = rightUnits.find(u => u.entity.eliteType);
                let dropChance = 0.30;
                let rarityBonus = 0;
                let dropLevel = highestLevelMonster.level;
                // 获取楼层用于限制掉落品质
                let floorId = 1;
                const heroUnit = aliveLeft.find(u => !u.isMonster && !u.isMaster);
                if (heroUnit) floorId = this.getHeroFloor(heroUnit.entity);
                const maxRarity = this._getFloorDropMaxRarity(floorId);
                if (elite) {
                    dropChance = 1.0;
                    const eliteDef = ELITE_TYPE_DEFS[elite.entity.eliteType];
                    if (eliteDef) {
                        rarityBonus = eliteDef.dropRarityBonus || 0;
                        if (elite.entity.eliteType === 'overlord' && RAND(100) < 50) {
                            dropLevel += 5;
                        }
                    }
                }
                if (Math.random() < dropChance) {
                    const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
                    const slot = slotTypes[RAND(slotTypes.length)];
                    let rarity = GearSystem._rollRarity ? GearSystem._rollRarity() : 1;
                    rarity = Math.min(maxRarity, rarity + rarityBonus);
                    drop = GearSystem.generateGear(slot, dropLevel, rarity);
                    const lucky = aliveLeft[RAND(aliveLeft.length)];
                    // V8.0: 智能装备比较
                    const check = GearSystem.shouldEquip(drop, slot, lucky.entity);
                    if (check.should) {
                        const r = GearSystem.equipItem(lucky.entity, drop);
                        if (r.success) combatLog.push(`🎁 ${lucky.name}获得了${r.msg}`);
                    } else {
                        combatLog.push(`🎁 ${lucky.name}获得了${drop.name}，但${check.reason}，未装备`);
                    }
                }
            }
        } else if (defeated) {
            combatLog.push(`【败北】${leftUnits.map(u => u.name).join(',')}被全灭了...`);
        } else if (draw) {
            combatLog.push(`【平手】从战斗中撤退了`);
        } else {
            combatLog.push(`【撤退】从战斗中撤退了`);
        }

        // V7.2: 清除援军标记
        for (const u of leftUnits) { if (u.entity) u.entity._isReinforcement = false; }
        for (const u of rightUnits) { if (u.entity) u.entity._isReinforcement = false; }
        return { victory, defeated, escaped: !victory && !defeated && !draw, rounds, combatLog, leftTeam: leftUnits, rightTeam: rightUnits, drop, betrayed, monster: rightUnits[0] ? rightUnits[0].entity : null };
    }


    // V8.0: 战斗中使用消耗品
Game.prototype._tryUseConsumable = function(hero, combatLog, roundLabel) {
        if (!hero.gear || !hero.gear.items || hero.gear.items.length === 0) return false;
        const hpPct = hero.hp / Math.max(1, hero.maxHp);
        const mpPct = hero.mp / Math.max(1, hero.maxMp);

        // 优先：异常状态恢复
        const hasAilment = this._hasStatusAilment && (
            this._hasStatusAilment(hero, 'poison') ||
            this._hasStatusAilment(hero, 'paralysis') ||
            this._hasStatusAilment(hero, 'burn') ||
            this._hasStatusAilment(hero, 'fear') ||
            this._hasStatusAilment(hero, 'weak') ||
            this._hasStatusAilment(hero, 'confusion') ||
            this._hasStatusAilment(hero, 'silence')
        );
        if (hasAilment) {
            const idx = hero.gear.items.findIndex(it => it && it.itemType === 'cleanse' && (it.charges || 1) > 0);
            if (idx >= 0) {
                const r = GearSystem.useItem(hero, idx, { inCombat: true });
                if (r.success) {
                    combatLog.push(`【${roundLabel}】${hero.name}使用异常恢复药水 💊 ${r.msg}`);
                    return true;
                }
            }
        }

        // HP < 40% 使用治疗药水
        if (hpPct < 0.40) {
            const idx = hero.gear.items.findIndex(it => it && it.itemType === 'heal' && (it.charges || 1) > 0);
            if (idx >= 0) {
                const r = GearSystem.useItem(hero, idx, { inCombat: true });
                if (r.success) {
                    combatLog.push(`【${roundLabel}】${hero.name}使用治疗药水 🧪 ${r.msg}`);
                    return true;
                }
            }
        }

        // MP < 20% 使用MP药水
        if (mpPct < 0.20) {
            const idx = hero.gear.items.findIndex(it => it && it.itemType === 'mana' && (it.charges || 1) > 0);
            if (idx >= 0) {
                const r = GearSystem.useItem(hero, idx, { inCombat: true });
                if (r.success) {
                    combatLog.push(`【${roundLabel}】${hero.name}使用MP恢复药水 💧 ${r.msg}`);
                    return true;
                }
            }
        }

        return false;
    }

    // 生成入侵勇】
Game.prototype._getMonsterAIType = function(monster) {
        const atkRatio = monster.atk / (monster.def + 1);
        const spdRatio = monster.spd / (monster.atk + 1);
        const mpRatio = monster.mp / (monster.hp + 1);

        if (atkRatio > 1.5) return 'attack';     // 攻击型：攻击力远高于防御
        if (monster.def > monster.atk * 1.2) return 'defense'; // 防御型：防御高于攻击
        if (mpRatio > 0.25 && monster.atk < monster.def * 1.2) return 'magic'; // 魔法型：MP】
        if (spdRatio > 1.0 && monster.spd > monster.atk && monster.spd > monster.def) return 'speed'; // 速度】
        return 'balanced'; // 均衡【
}

    // ========== 勇者俘虏系统==========

    // 处理被击败勇者的俘虏流程
    // skipEscape: 奴隶/魔王主动出击时，跳过逃跑判定（勇者无法从主动出击方手中逃脱）
    // V6.0: 动态怪物生成 — 等级区间 [(N-1)*20, N*20]，属性由等级自动计算
    Game.prototype._spawnMonster = function(floorId, eliteType) {
        const templates = window.MONSTER_TEMPLATES[floorId];
        if (!templates || templates.length === 0) return null;

        // 等级区间
        const minLv = Math.max(1, (floorId - 1) * 20);
        const maxLv = floorId * 20;
        let level = minLv + RAND(maxLv - minLv + 1);

        // V12.0: 魔王军训练强化——每次训练事件提升地下城怪物等级
        const trainBoost = this.flag ? (this.flag[998] || 0) : 0;
        level += trainBoost * 2;

        // 5%概率遇到 N*20+5 的超等级怪物
        if (RAND(100) < 5) {
            level = maxLv + 5;
        }

        // 限制在楼层允许区间内：普通怪最高maxLv，精英怪最高maxLv+5
        const levelCap = (eliteType === 'chief' || eliteType === 'overlord') ? maxLv + 5 : maxLv;
        level = Math.max(minLv, Math.min(levelCap, level));

        // 精英怪至少为该层最高等级
        if (eliteType === 'chief' || eliteType === 'overlord') {
            level = Math.max(maxLv, level);
        }

        // 随机选取模板
        const baseTemplate = templates[RAND(templates.length)];
        const monster = Object.assign({}, baseTemplate);
        monster.level = level;
        monster.eliteType = eliteType || 'normal';

        // 应用精英倍率
        const eDef = window.ELITE_TYPE_DEFS[eliteType || 'normal'];
        const hpMul = eDef ? eDef.hpMul : 1.0;
        const atkMul = eDef ? eDef.atkMul : 1.0;
        const defMul = eDef ? eDef.defMul : 1.0;
        const spdMul = eDef ? eDef.spdMul : 1.0;

        // V7.2 重构属性公式：降低HP基数，提升ATK/SPD成长，让战斗更快结束
        monster.hp  = Math.floor((200 + level * 35) * hpMul);   // Lv.5: 375, Lv.12: 620, Lv.20: 900
        monster.mp  = Math.floor((100 + level * 15) * hpMul);
        monster.atk = Math.floor((15 + level * 4) * atkMul);    // Lv.5: 35, Lv.12: 63, Lv.20: 95
        monster.def = Math.floor((10 + level * 2.5) * defMul);  // Lv.5: 22, Lv.12: 40, Lv.20: 60
        monster.spd = Math.floor((10 + level * 2) * spdMul);    // Lv.5: 20, Lv.12: 34, Lv.20: 50

        // 精英怪命名
        if (eDef && eDef.namePrefix) {
            monster.name = eDef.namePrefix + monster.name;
        }
        if (eDef && eDef.icon) {
            monster.icon = eDef.icon;
        }
        if (eDef && eDef.descSuffix) {
            monster.description = monster.description + eDef.descSuffix;
        }

        return monster;
    }

    // 处理勇者探索一层（触发事件，返回数值效果）
    Game.prototype._getFloorMaxMonsterLevel = function(floorId) {
        return floorId * 20;
    }

    // 获取楼层掉落品质上限（与宝箱系统保持一致）
Game.prototype._getFloorDropMaxRarity = function(floorId) {
        if (floorId <= 3) return 2; // 精品
        if (floorId <= 6) return 3; // 大师
        if (floorId <= 9) return 4; // 传说
        return 5; // 神话
    }

    // 生成怪物（普通/首领/霸主）
Game.prototype._getStrategySpeedMod = function(sdef) {
        const effect = sdef.effect;
        const val = sdef.value || 0;
        let speed = 0, hpDmg = 0, mpDmg = 0;
        switch (effect) {
            case 'damage':   speed = -2; hpDmg = val; break;
            case 'fire':     speed = -2; hpDmg = val; break;
            case 'shoot':    speed = -3; hpDmg = val; break;
            case 'teleport': speed = -5; break;
            case 'confuse':  speed = -3; mpDmg = Math.floor(val * 0.5); break;
            case 'darkness': speed = -2; hpDmg = Math.floor(val * 0.7); break;
            case 'net':      speed = -3; hpDmg = val; break;
            case 'stun':     speed = -4; hpDmg = val; break;
            case 'lust':     speed = -1; mpDmg = Math.floor(val * 0.5); break;
            case 'charm':    speed = -2; hpDmg = Math.floor(val * 0.3); mpDmg = Math.floor(val * 0.5); break;
            case 'hypnotize':speed = -4; mpDmg = val; break;
            case 'weaken_def':case 'weaken_atk':case 'weaken_mag': speed = -1; break;
            case 'debuff':   speed = -3; hpDmg = Math.floor(val * 0.8); mpDmg = Math.floor(val * 0.5); break;
            case 'oil':      speed = -2; break;
            case 'summon':   speed = -3; hpDmg = Math.floor(val * 0.7); break;
            case 'curse':    speed = -3; hpDmg = val; mpDmg = val; break;
            case 'worm':     speed = -2; hpDmg = Math.floor(val * 0.8); mpDmg = Math.floor(val * 0.6); break;
            case 'gem':      speed = -1; break;
            case 'merchant': speed = 0; break;
            case 'illusion': speed = -4; hpDmg = Math.floor(val * 0.8); mpDmg = val; break;
            case 'terror':   speed = -5; hpDmg = val; mpDmg = val; break;
            case 'break':    speed = -6; hpDmg = val; mpDmg = val; break;
            case 'slime':    speed = -2; hpDmg = val; break;
            case 'mimic':    speed = -3; hpDmg = Math.floor(val * 0.7); mpDmg = Math.floor(val * 0.5); break;
        }
        return { speed, hpDmg, mpDmg };
    }

    // 计算勇者主动撤退概率（根据状态和性格）
Game.prototype._tryEscape = function(hero, monster) {
        let chance = 50; // 基础逃跑【0%

        const hpPct = hero.hp / Math.max(1, hero.maxHp);

        if (hpPct < 0.2) {
            // 血【20%时，血量越低逃跑成功率越【            // 血量从20%降到0%，逃跑率从50%降到30%
            const hpPenalty = Math.floor((0.2 - hpPct) / 0.2 * 20);
            chance -= hpPenalty;

            // 性格修正（仅在血【20%时生效）
            if (hero.talent[10]) chance += 15;      // 胆】
            if (hero.talent[162]) chance += 15;     // 懦弱
            if (hero.talent[16]) chance += 5;       // 低姿】
            if (hero.talent[12]) chance -= 15;      // 刚强
            if (hero.talent[11]) chance -= 10;      // 反抗】
            if (hero.talent[14]) chance -= 10;      // 傲慢
            if (hero.talent[15]) chance -= 10;      // 高姿【
}

        // 伪装者惩罚：如果小队中有伪装者，逃跑【30%
        const squadId = hero.cflag[CFLAGS.SQUAD_ID];
        if (squadId) {
            const squadMembers = this.invaders.filter(h => h.cflag[CFLAGS.SQUAD_ID] === squadId);
            const hasSpy = squadMembers.some(h => h.cflag[912]);
            if (hasSpy) chance -= 30;
        }

        // 限制范围：最【0%，最【5%
        chance = Math.max(10, Math.min(95, chance));

        if (RAND(100) < chance) {
            return { success: true, message: `${hero.name}在混乱中成功逃脱了！` };
        } else {
            return { success: false, message: `${hero.name}试图逃跑但被怪物拦住【..` };
        }
    }

    // 投降判定：被俘勇者是否选择投降
Game.prototype._trySurrender = function(hero) {
        let chance = 10; // 基础投降概率10%（V7.1: 降低）

        // HP/MP状态修正（越低越容易投降）
        const hpPct = hero.hp / Math.max(1, hero.maxHp);
        const mpPct = hero.mp / Math.max(1, hero.maxMp);
        chance += Math.floor((1 - hpPct) * 30); // HP越低+越多
        chance += Math.floor((1 - mpPct) * 10); // MP越低+越多

        // 性格修正
        if (hero.talent[10]) chance += 20;      // 胆】
        if (hero.talent[162]) chance += 20;     // 懦弱
        if (hero.talent[16]) chance += 15;      // 低姿】
        if (hero.talent[17]) chance += 10;      // 老实
        if (hero.talent[12]) chance -= 20;      // 刚强
        if (hero.talent[11]) chance -= 15;      // 反抗】
        if (hero.talent[14]) chance -= 15;      // 傲慢
        if (hero.talent[15]) chance -= 15;      // 高姿】
        if (hero.talent[18]) chance -= 5;       // 傲娇

        // 限制范围
        chance = Math.max(0, Math.min(90, chance));

        if (RAND(100) < chance) {
            return { success: true, message: `${hero.name}精神崩溃，选择了投降服【..` };
        } else {
            return { success: false, message: `${hero.name}虽然被俘，但眼神中仍带着不屈...` };
        }
    }

    // 投降勇者转化为奴隶
Game.prototype._processCapture = function(hero, monster, skipEscape = false) {
        // 逃跑者特质特殊处】
        const isEscapee = hero.talent[203];

        // 1. 逃跑判定（奴隶/魔王主动出击时跳过）
        if (!skipEscape) {
            const escapeResult = this._tryEscape(hero, monster);
            if (escapeResult.success) {
                if (isEscapee) {
                    return { type: 'escape', message: `${hero.name}再次从魔王手中逃脱【..但她知道，自己终究会回来的。` };
                }
                return { type: 'escape', message: escapeResult.message };
            }
        }

        // 2. 进入投降判定
        const surrenderResult = this._trySurrender(hero);
        if (surrenderResult.success) {
            // V7.1: 投降者直接屈服Stage3并转化为奴隶，不进监狱
            hero.mark[0] = Math.max(hero.mark[0] || 0, 3);
            const idx = this.invaders.indexOf(hero);
            if (idx >= 0) this.invaders.splice(idx, 1);
            this._addAdventureLog(hero, 'surrender', `向魔王投降，沦为奴隶`);
            this._convertHeroToSlave(hero);
            return { type: 'surrender', message: surrenderResult.message };
        }
        // 未投降者关入监狱
        let initialMark = 0;
        if (isEscapee) {
            initialMark = 1;
        }
        const monName = monster && monster.name ? monster.name : '魔物';
        this._addAdventureLog(hero, 'captured', `被${monName}击败，沦为俘虏`);
        // V12.0: 心声——被俘
        const capturedVoices = [
            '不...不可能...我居然会被俘虏...',
            '这就是魔王的实力吗...到此为止了吗...',
            '对不起...我没能完成任务...',
            `被${monName}打败了...身体...动不了...`
        ];
        if (this._addAdventureLog) this._addAdventureLog(hero, 'voice', capturedVoices[RAND(capturedVoices.length)]);
        // 队友心声
        const squad = this._getHeroSquad ? this._getHeroSquad(hero) : [];
        if (squad.length > 0) {
            const teammateVoices = [
                `${hero.name}被俘了...我们得小心行事...`,
                `队友被魔王抓走了...我必须变得更强...`,
                `${hero.name}...不要放弃，我一定会救你出来的！`,
                `又少了一个同伴...地下城比想象中更可怕。`
            ];
            for (const mate of squad) {
                if (this._addAdventureLog) this._addAdventureLog(mate, 'voice', teammateVoices[RAND(teammateVoices.length)]);
            }
        }
        this._imprisonHero(hero, initialMark);
        return { type: 'imprisoned', message: surrenderResult.message };
    }

    // V9.0: 将监狱中的俘虏转化为奴隶（mark[0] >= 3 或已洗脑）
Game.prototype._convertHeroToSlave = function(hero) {
        if (!hero) return { success: false, msg: '角色不存在' };
        const isBrainwashed = hero.talent[296] > 0;
        if ((hero.mark[0] || 0) < 3 && !isBrainwashed) return { success: false, msg: `该俘虏尚未完全屈服（当前服从Lv.${hero.mark[0] || 0}，需要Lv.3）` };

        // 从监狱中移除
        const pIdx = this.prisoners.indexOf(hero);
        if (pIdx >= 0) this.prisoners.splice(pIdx, 1);

        // 赋予"前勇者"特质
        hero.talent[200] = 1;

        // 声望减半
        hero.fame = Math.floor(hero.fame * 0.5);

        // 清除勇者专属标记
        hero.cflag[CFLAGS.HERO_FLOOR] = 0;
        hero.cflag[CFLAGS.HERO_PROGRESS] = 0;
        hero.cflag[CFLAGS.LOVE_POINTS] = 0;

        // 初始化探索标记
        hero.cflag[CFLAGS.FALLEN_DEPTH] = 0;
        hero.cflag[CFLAGS.FALLEN_STAGE] = 10;
        hero.cflag[CFLAGS.CORRUPTION] = 0;
        hero.cflag[703] = 0;

        // 转化后不再是俘虏
        hero.cflag[CFLAGS.CAPTURE_STATUS] = 0;

        // V10.0: 投降的勇者得到治疗，恢复满状态并清除重伤
        hero.hp = hero.maxHp;
        hero.mp = hero.maxMp;
        if (typeof this._removeStatusAilment === 'function') {
            this._removeStatusAilment(hero, 'severe_injury');
        }

        // 重新计算属性
        this._recalcBaseStats(hero);

        // V12.0: 未鉴定物品回到魔王城自动完成鉴定
        if (typeof GearSystem !== 'undefined' && GearSystem.identifyAllGear) {
            GearSystem.identifyAllGear(hero);
        }

        // 加入奴隶列表（如果尚未在characters中）
        const alreadyInChars = this.characters.some(c => c === hero);
        if (!alreadyInChars) {
            hero.affinity = this.generateAffinity(hero);
            this.addCharaFromTemplate(hero);
        }
        UI.showToast(`${hero.name} 已彻底屈服，成为你的奴隶！(服从Lv.${hero.mark[0]})`, 'success');
        return { success: true, msg: `${hero.name} 已转化为奴隶` };
    }

    // 将勇者关入监狱
Game.prototype._imprisonHero = function(hero, initialMark = 0) {
        // 检查监狱容量
        const maxCap = this.getMaxPrisoners();
        if (this.prisoners.length >= maxCap) {
            const removed = this.prisoners.shift();
            UI.showToast(`监狱已满，${removed.name} 被处决了`, 'danger');
        }

        // 勇者被俘时，金币被魔王没收
        const confiscatedGold = hero.gold;
        if (confiscatedGold > 0) {
            this.money += confiscatedGold;
            hero.gold = 0;
            UI.showToast(`从勇者${hero.name} 身上没收了${confiscatedGold}G！`, 'success');
        }

        // 标记俘虏状态
        hero.cflag[CFLAGS.CAPTURE_STATUS] = 1;
        hero.cflag[CFLAGS.OBEDIENCE_POINTS] = this.day; // 被俘天数

        // 设置初始屈服度（投降的更高）
        // V12.0: 倾向魔王型勇者被俘后恭顺度初始+1
        const attitude = hero.cflag[CFLAGS.HERO_ATTITUDE] || 1;
        if (attitude === 3) {
            initialMark = Math.min(2, initialMark + 1);
        }
        hero.mark[0] = initialMark;

        // 清除勇者专属标记
        hero.cflag[CFLAGS.HERO_FLOOR] = 0;
        hero.cflag[CFLAGS.HERO_PROGRESS] = 0;

        // V10.0: 被俘的勇者得到治疗，恢复满状态并清除重伤
        hero.hp = hero.maxHp;
        hero.mp = hero.maxMp;
        if (typeof this._removeStatusAilment === 'function') {
            this._removeStatusAilment(hero, 'severe_injury');
        }

        // 从入侵者列表中移除，避免在角色列表中仍显示为"入侵勇者"
        const invIdx = this.invaders.indexOf(hero);
        if (invIdx >= 0) this.invaders.splice(invIdx, 1);

        // 加入 characters（如果尚未在角色列表中），确保俘虏能在各系统中被引用
        const alreadyInChars = this.characters.some(c => c === hero);
        if (!alreadyInChars) {
            hero.affinity = this.generateAffinity(hero);
            this.addCharaFromTemplate(hero);
        }

        this.prisoners.push(hero);
        console.log(`[_imprisonHero] ${hero.name} pushed to prisoners. prisoners.length=${this.prisoners.length}`);

        // V12.0: 未鉴定物品回到魔王城自动完成鉴定
        if (typeof GearSystem !== 'undefined' && GearSystem.identifyAllGear) {
            GearSystem.identifyAllGear(hero);
        }

        UI.showToast(`勇者${hero.name} 被俘，关入监狱！`, 'warning');
    }

    // ========== 伪装者派遣系统==========

    // 派遣前勇者奴隶伪装混入勇者队】
Game.prototype._getHeroClass = function(hero) {
        if (!hero || !hero.cflag) return null;
        // V5.0 优先使用 CLASS_DEFS
        const classId = hero.cflag[CFLAGS.CLASS_ID] || hero.cflag[CFLAGS.HERO_CLASS];
        if (window.CLASS_DEFS && window.CLASS_DEFS[classId]) return window.CLASS_DEFS[classId];
        if (!classId || !HERO_CLASS_DEFS[classId]) return null;
        return HERO_CLASS_DEFS[classId];
    }

Game.prototype._getSkillPower = function(hero, skill) {
        if (!hero || !skill) return 0;
        const lv = hero.level || 1;
        if (skill.scale !== undefined) {
            return Math.floor(skill.power + skill.scale * lv);
        }
        return skill.power || 0;
    }

    // 尝试使用技能（勇者内战用简化版）
Game.prototype._tryUseHeroSkill = function(hero) {
        if (!hero) return null;
        // V5.0 使用 CLASS_DEFS + CLASS_SKILL_DEFS
        const classId = hero.cflag[CFLAGS.CLASS_ID] || hero.cflag[CFLAGS.HERO_CLASS] || 0;
        const cls = window.CLASS_DEFS ? window.CLASS_DEFS[classId] : (HERO_CLASS_DEFS ? HERO_CLASS_DEFS[classId] : null);
        if (!cls || !cls.skills || cls.skills.length === 0) return null;
        const lv = hero.level || 1;
        // 按优先级检查技能：必杀/高级 > 职业技能 > 通用
        const skillIds = [...cls.skills].reverse().filter(Boolean);
        for (const sid of skillIds) {
            const skillDef = (window.CLASS_SKILL_DEFS && window.CLASS_SKILL_DEFS[sid]) ? window.CLASS_SKILL_DEFS[sid] : (typeof HERO_SKILL_DEFS !== 'undefined' ? HERO_SKILL_DEFS[sid] : null);
            if (!skillDef) continue;
            const st = (skillDef.type === 'active' && skillDef.effectType) ? skillDef.effectType : (skillDef.type || skillDef.effectType || '');
            const prob = Math.min(50, lv * 3);
            if (st === 'berserk' || st === 'execute' || st === 'execute_pierce' || st === 'big_bang') {
                if (RAND(100) >= Math.min(40, lv * 2)) continue;
            } else {
                if (RAND(100) >= prob) continue;
            }
            const result = {
                name: skillDef.name,
                effectType: st,
                damage: 0,
                heal: 0,
                ailmentChance: 0
            };
            const power = this._getSkillPower(hero, skillDef);
            switch (st) {
                case 'damage': case 'crit_damage': case 'pierce': case 'execute': case 'execute_pierce': case 'berserk':
                    result.damage = power; break;
                case 'aoe': case 'big_bang':
                    result.damage = Math.floor(power * 0.8); break;
                case 'heal': case 'mass_heal':
                    result.heal = Math.min(0.3, power / 100); break;
                case 'dot':
                    result.ailmentChance = 0.4; result.damage = Math.floor(power * 0.5); break;
                case 'stun': case 'seal': case 'confuse':
                    result.ailmentChance = 0.5; break;
                case 'debuff_atk': case 'debuff_def': case 'debuff_spd': case 'debuff_all':
                    result.ailmentChance = 0.35; break;
            }
            return result;
        }
        return null;
    }

Game.prototype._useHeroSkill = function(hero, skillId, target, context) {
        if (!hero || !skillId) return null;
        if (!hero.cflag) {
            console.warn('[_useHeroSkill] hero.cflag missing for', hero.name || hero);
            return null;
        }
        // V5.0 优先使用 CLASS_SKILL_DEFS
        const skill = (window.CLASS_SKILL_DEFS && window.CLASS_SKILL_DEFS[skillId])
            ? window.CLASS_SKILL_DEFS[skillId]
            : (typeof HERO_SKILL_DEFS !== 'undefined' ? HERO_SKILL_DEFS[skillId] : null);
        if (!skill) return null;
        const power = this._getSkillPower(hero, skill);
        // HERO_SKILL_DEFS 用 type="active"+effectType，CLASS_SKILL_DEFS 用 type 直接表示效果
        const st = (skill.type === 'active' && skill.effectType) ? skill.effectType : (skill.type || skill.effectType || '');
        const result = { used: true, skillName: skill.name, cost: skill.cost || 0, logs: [] };

        // 必杀技开场白池
        const isUlt = skillId >= 3000;
        const ultIntros = [
            "燃烧吧，我的灵魂！", "这就是我的全力一击！", "见证吧，绝望的力量！",
            "到此为止了！", "让一切归于虚无……", "觉醒吧，沉睡的力量！",
            "此技名为——", "接招吧！终极奥义！", "消失吧，邪恶之物！",
            "以吾之名，赐予你终结！", "突破极限！", "这就是——绝望的开端！"
        ];
        const intro = isUlt ? ultIntros[RAND(ultIntros.length)] : '';
        const prefix = isUlt ? `💥【必杀技】${intro}` : '【技能】';
        const sname = `「${skill.name}」`;

        const skillElement = skill.element || 'none';
        switch (st) {
            case "damage": {
                const baseAtk = (hero.cflag[CFLAGS.ATK] || 20);
                const dmgRes = this._calcDamageV2({
                    attackerAtk: baseAtk, attackerLv: hero.level || 1,
                    targetDef: target.def || 0, targetLv: target.level || 1,
                    skillPower: power || 1.0,
                    element: skillElement, attacker: hero, target: target
                });
                result.damage = dmgRes.dmg;
                result.isCrit = dmgRes.isCrit;
                result.log = `${prefix}${hero.name}使用${sname}造成${dmgRes.dmg}伤害${dmgRes.isCrit ? '💥' : ''}${dmgRes.elementalLabel ? ' ' + dmgRes.elementalLabel : ''}`;
                break;
            }
            case "crit_damage": {
                const baseAtk = (hero.cflag[CFLAGS.ATK] || 20);
                const dmgRes = this._calcDamageV2({
                    attackerAtk: baseAtk, attackerLv: hero.level || 1,
                    targetDef: target.def || 0, targetLv: target.level || 1,
                    skillPower: power || 1.0, critBonus: 30,
                    element: skillElement, attacker: hero, target: target
                });
                result.damage = dmgRes.dmg;
                result.isCrit = dmgRes.isCrit;
                result.log = `${prefix}${hero.name}使用${sname}造成${dmgRes.dmg}伤害${dmgRes.isCrit ? '💥' : ''}${dmgRes.elementalLabel ? ' ' + dmgRes.elementalLabel : ''}`;
                break;
            }
            case "pierce": {
                const baseAtk = (hero.cflag[CFLAGS.ATK] || 20);
                const dmgRes = this._calcDamageV2({
                    attackerAtk: baseAtk, attackerLv: hero.level || 1,
                    targetDef: target.def || 0, targetLv: target.level || 1,
                    skillPower: power || 1.0, isPierce: true,
                    element: skillElement, attacker: hero, target: target
                });
                result.damage = dmgRes.dmg;
                result.isCrit = dmgRes.isCrit;
                result.log = `${prefix}${hero.name}使用${sname}贯穿防御造成${dmgRes.dmg}伤害${dmgRes.isCrit ? '💥' : ''}${dmgRes.elementalLabel ? ' ' + dmgRes.elementalLabel : ''}`;
                break;
            }
            case "execute": {
                const baseAtk = (hero.cflag[CFLAGS.ATK] || 20);
                const tHpPct = target.hp / Math.max(1, target.maxHp || target.hp);
                const execMult = tHpPct < 0.3 ? 3.0 : 1.0;
                const dmgRes = this._calcDamageV2({
                    attackerAtk: baseAtk, attackerLv: hero.level || 1,
                    targetDef: target.def || 0, targetLv: target.level || 1,
                    skillPower: (power || 1.0) * execMult,
                    element: skillElement, attacker: hero, target: target
                });
                result.damage = dmgRes.dmg;
                result.isCrit = dmgRes.isCrit;
                result.log = `${prefix}${hero.name}使用${sname}${tHpPct < 0.3 ? '【处决】' : ''}造成${dmgRes.dmg}伤害${dmgRes.isCrit ? '💥' : ''}${dmgRes.elementalLabel ? ' ' + dmgRes.elementalLabel : ''}`;
                break;
            }
            case "execute_pierce": {
                const baseAtk = (hero.cflag[CFLAGS.ATK] || 20);
                const tHpPct = target.hp / Math.max(1, target.maxHp || target.hp);
                const execMult = tHpPct < 0.3 ? 3.0 : 1.0;
                const dmgRes = this._calcDamageV2({
                    attackerAtk: baseAtk, attackerLv: hero.level || 1,
                    targetDef: target.def || 0, targetLv: target.level || 1,
                    skillPower: (power || 1.0) * execMult, isPierce: true,
                    element: skillElement, attacker: hero, target: target
                });
                result.damage = dmgRes.dmg;
                result.isCrit = dmgRes.isCrit;
                result.log = `${prefix}${hero.name}使用${sname}${tHpPct < 0.3 ? '【处决】' : ''}贯穿防御造成${dmgRes.dmg}伤害${dmgRes.isCrit ? '💥' : ''}${dmgRes.elementalLabel ? ' ' + dmgRes.elementalLabel : ''}`;
                break;
            }
            case "multi_damage": {
                const baseAtk = (hero.cflag[CFLAGS.ATK] || 20);
                const hits = skill.hits || 2;
                let totalDmg = 0;
                let critCount = 0;
                for (let i = 0; i < hits; i++) {
                    const dmgRes = this._calcDamageV2({
                        attackerAtk: baseAtk, attackerLv: hero.level || 1,
                        targetDef: target.def || 0, targetLv: target.level || 1,
                        skillPower: (power || 1.0) / hits,
                        element: skillElement, attacker: hero, target: target
                    });
                    totalDmg += dmgRes.dmg;
                    if (dmgRes.isCrit) critCount++;
                }
                result.damage = totalDmg;
                result.log = `${prefix}${hero.name}使用${sname}连续攻击${hits}次，共造成${totalDmg}伤害${critCount > 0 ? `(${critCount}次暴击💥)` : ''}`;
                break;
            }
            case "aoe":
            case "big_bang": {
                // 魔王诸神黄昏（4001）：直接扣除敌人最大HP的50%，无视防御
                const isMaster = this.getMaster() === hero;
                if (isMaster && skillId === 4001) {
                    const maxHpDmg = Math.floor((target.maxHp || target.hp || 100) * 0.5);
                    result.damage = maxHpDmg;
                    result.isAoE = true;
                    result.log = `💥【必杀技】${hero.name}发动「${skill.name}」——天穹碎裂，万物归于虚无！全体敌人受到最大HP50%的毁灭伤害(${maxHpDmg})！`;
                    result.selfStun = true;
                    break;
                }
                const baseAtk = (hero.cflag[CFLAGS.ATK] || 20);
                const dmgRes = this._calcDamageV2({
                    attackerAtk: baseAtk, attackerLv: hero.level || 1,
                    targetDef: target.def || 0, targetLv: target.level || 1,
                    skillPower: power || 1.0,
                    element: skillElement, attacker: hero, target: target
                });
                result.damage = dmgRes.dmg;
                result.isAoE = true;
                result.log = `${prefix}${hero.name}使用${sname}造成${dmgRes.dmg}范围伤害${dmgRes.isCrit ? '💥' : ''}${dmgRes.elementalLabel ? ' ' + dmgRes.elementalLabel : ''}`;
                if (st === 'big_bang') {
                    result.selfStun = true; // 大爆炸后自身眩晕一回合
                }
                break;
            }
            case "heal": {
                const heal = Math.floor(power + hero.level * 2);
                result.heal = heal;
                result.log = `${prefix}${hero.name}使用${sname}恢复${heal}HP`;
                break;
            }
            case "mass_heal": {
                const heal = Math.floor(power + hero.level * 1.5);
                result.heal = heal;
                result.isMass = true;
                result.log = `${prefix}${hero.name}使用${sname}恢复全体${heal}HP`;
                break;
            }
            case "buff_atk": {
                result.buff = { type: "atk", value: power, duration: skill.duration || 3 };
                result.log = `${prefix}${hero.name}使用${sname}，攻击力提升${power}`;
                break;
            }
            case "buff_def": {
                result.buff = { type: "def", value: power, duration: skill.duration || 3 };
                result.log = `${prefix}${hero.name}使用${sname}，防御力提升${power}`;
                break;
            }
            case "buff_spd": {
                result.buff = { type: "spd", value: power, duration: skill.duration || 2 };
                result.log = `${prefix}${hero.name}使用${sname}，速度提升${power}`;
                break;
            }
            case "buff_all": {
                result.buff = { type: "all", value: power, duration: skill.duration || 3 };
                result.log = `${prefix}${hero.name}使用${sname}，全属性提升${power}`;
                break;
            }
            case "debuff_atk":
            case "debuff_def":
            case "debuff_spd":
            case "debuff_all":
            case "seal": {
                const debuffType = (skill.effectType || st || '').replace("debuff_", "");
                result.debuff = { type: debuffType, value: power, duration: skill.duration || 3 };
                result.log = `${prefix}${hero.name}使用${sname}，降低敌人${debuffType}${power}`;
                break;
            }
            case "dot": {
                // V7.2: 根据元素类型附加不同异常
                const element = skill.element || 'poison';
                let ailmentType = 'poison';
                if (element === 'fire') ailmentType = 'burn';
                else if (element === 'dark') ailmentType = 'curse';
                else if (element === 'poison') ailmentType = 'poison';
                result.ailment = { type: ailmentType, turns: skill.duration || 3 };
                result.log = `${prefix}${hero.name}使用${sname}，敌人${STATUS_AILMENT_DEFS[ailmentType].name}了`;
                break;
            }
            case "lifesteal": {
                const baseAtk = (hero.cflag[CFLAGS.ATK] || 20);
                const dmgRes = this._calcDamageV2({
                    attackerAtk: baseAtk, attackerLv: hero.level || 1,
                    targetDef: target.def || 0, targetLv: target.level || 1,
                    skillPower: power || 1.0,
                    element: skillElement, attacker: hero, target: target
                });
                result.damage = dmgRes.dmg;
                result.heal = Math.floor(dmgRes.dmg * 0.3);
                result.log = `${prefix}${hero.name}使用${sname}造成${dmgRes.dmg}伤害并吸取${result.heal}HP${dmgRes.isCrit ? '💥' : ''}${dmgRes.elementalLabel ? ' ' + dmgRes.elementalLabel : ''}`;
                break;
            }
            case "counter": {
                result.counter = true;
                result.duration = skill.duration || 2;
                result.log = `${prefix}${hero.name}使用${sname}，进入反击姿态(${result.duration}回合)`;
                break;
            }
            case "reflect": {
                result.reflect = true;
                result.duration = skill.duration || 3;
                result.log = `${prefix}${hero.name}使用${sname}，受到伤害时反弹30%(${result.duration}回合)`;
                break;
            }
            case "stun": {
                result.damage = Math.floor((hero.cflag[CFLAGS.ATK] || 20) * (power || 0.5));
                result.stun = true;
                result.duration = skill.duration || 1;
                result.log = `${prefix}${hero.name}使用${sname}造成${result.damage}伤害并眩晕敌人(${result.duration}回合)`;
                break;
            }
            case "seal": {
                result.debuff = { type: 'seal', value: power || 0, duration: skill.duration || 2 };
                result.log = `${prefix}${hero.name}使用${sname}，封印敌人技能(${skill.duration || 2}回合)`;
                break;
            }
            case "taunt": {
                result.taunt = true;
                result.duration = skill.duration || 2;
                result.log = `${prefix}${hero.name}使用${sname}，强制敌人攻击自己(${result.duration}回合)`;
                break;
            }
            case "stealth": {
                result.stealth = true;
                result.duration = skill.duration || 2;
                result.log = `${prefix}${hero.name}使用${sname}，进入隐身状态(${result.duration}回合)`;
                break;
            }
            case "confuse": {
                result.ailment = { type: 'confusion', turns: skill.duration || 2 };
                result.log = `${prefix}${hero.name}使用${sname}，敌人混乱了`;
                break;
            }
            case "cleanse": {
                result.cleanse = true;
                result.log = `${prefix}${hero.name}使用${sname}净化异常`;
                break;
            }
            case "invincible": {
                result.invincible = true;
                result.duration = skill.duration || 1;
                result.log = `${prefix}${hero.name}使用${sname}，一回合内无敌`;
                break;
            }
            case "berserk": {
                result.berserk = true;
                result.buff = { type: "atk", value: power, duration: skill.duration || 3 };
                result.debuff = { type: "def", value: -Math.floor(power * 0.5), duration: skill.duration || 3 };
                result.log = `${prefix}${hero.name}使用${sname}，攻击力大幅提升但防御下降`;
                break;
            }
            default:
                result.used = false;
        }
        
        // V10.0: 应用元素克制（伤害类技能）
        if (result.damage && result.damage > 0 && skill.element && target) {
            const elemMult = window.getElementalModifier ? window.getElementalModifier(
                skill.element,
                hero.talent ? hero.talent[314] : 0,
                target.talent ? target.talent[314] : 1
            ) : 1.0;
            if (elemMult !== 1.0) {
                result.damage = Math.max(1, Math.floor(result.damage * elemMult));
                if (elemMult > 1.0) {
                    result.log += ' 🔥属性克制!';
                } else if (elemMult < 1.0) {
                    result.log += ' 🛡️属性抗性!';
                }
            }
        }
        
        // V10.0: 堕落种族攻击自带5%额外暗属性伤害
        if (result.damage && result.damage > 0 && hero.cflag && hero.cflag[CFLAGS.FALLEN_RACE_ID]) {
            result.damage = Math.max(1, Math.floor(result.damage * 1.05));
        }
        
        return result;
    }

Game.prototype._chooseHeroSkill = function(hero, context, combatCtx = {}) {
        if (!hero || !hero.cflag) return null;
        const cls = this._getHeroClass(hero);
        if (!cls || !cls.skills || cls.skills.length === 0) return null;
        const hpPct = hero.hp / Math.max(1, hero.maxHp);
        const mpPct = hero.mp / Math.max(1, hero.maxMp);
        // 辅助：获取技能定义（优先CLASS_SKILL_DEFS数字ID，回退HERO_SKILL_DEFS字符串ID）
        const getDef = (id) => {
            if (window.CLASS_SKILL_DEFS && window.CLASS_SKILL_DEFS[id]) return window.CLASS_SKILL_DEFS[id];
            if (typeof HERO_SKILL_DEFS !== 'undefined' && HERO_SKILL_DEFS[id]) return HERO_SKILL_DEFS[id];
            return null;
        };
        const getSType = (sk) => {
            if (!sk) return '';
            const t = sk.type || '';
            if (t === 'active' && sk.effectType) return sk.effectType;
            return t || sk.effectType || '';
        };
        const canUse = (id) => {
            const sk = getDef(id);
            return sk && hero.mp >= (sk.cost || 0);
        };
        const isHeal = (sk) => getSType(sk) === 'heal' || getSType(sk) === 'mass_heal';
        const isDamage = (sk) => {
            const t = getSType(sk);
            return t.includes('damage') || t === 'dot' || t === 'execute' || t === 'execute_pierce' || t === 'aoe' || t === 'big_bang';
        };
        const isBuff = (sk) => getSType(sk).includes('buff');
        const isSupport = (sk) => {
            const t = getSType(sk);
            return t === 'heal' || t === 'mass_heal' || t === 'cleanse' || t.includes('debuff') || t === 'seal' || t === 'taunt' || t === 'confuse';
        };
        // 排除普通攻击(1001)，它不算技能
        const realSkills = cls.skills.filter(id => id !== 1001);
        if (realSkills.length === 0) return null;

        // ===== 魔王专属AI =====
        const isMaster = this.getMaster() === hero;
        if (isMaster) {
            if (hpPct < 0.5) {
                const ragnarok = realSkills.find(id => id === 4001);
                if (ragnarok && canUse(ragnarok)) return ragnarok;
            }
            if (combatCtx.targetCount >= 2) {
                const aoe = realSkills.find(id => {
                    const sk = getDef(id);
                    return sk && (getSType(sk) === 'aoe' || getSType(sk) === 'big_bang') && canUse(id);
                });
                if (aoe) return aoe;
            }
            const damageSkills = realSkills
                .filter(id => {
                    const sk = getDef(id);
                    return sk && isDamage(sk) && canUse(id);
                })
                .map(id => ({ id, def: getDef(id) }))
                .sort((a, b) => (b.def.power || 0) - (a.def.power || 0));
            if (damageSkills.length > 0) return damageSkills[0].id;
            return null;
        }

        // ===== 勇者AI — V10.1 阶段化HP驱动 =====
        // 阶段判定
        const isNearDeath = hpPct <= 0.10;      // 0-10% 濒死
        const isDesperate = hpPct <= 0.30;      // 10-30% 绝境
        const isCritical  = hpPct <= 0.50;      // 30-50% 关键
        const isTense     = hpPct <= 0.80;      // 50-80% 紧张
        // >80% 正常

        // 1. 濒死阶段(0-10%)：优先治疗保命，次选增益
        if (isNearDeath) {
            const healId = realSkills.find(id => isHeal(getDef(id)) && canUse(id));
            if (healId) return healId;
            const buffId = realSkills.find(id => isBuff(getDef(id)) && canUse(id));
            if (buffId) return buffId;
            const supId = realSkills.find(id => isSupport(getDef(id)) && canUse(id));
            if (supId) return supId;
        }

        // 2. 绝境阶段(10-30%)：优先释放最强伤害/必杀技（不再保留MP）
        if (isDesperate) {
            const ult = realSkills.find(id => id >= 3000 && canUse(id));
            if (ult) return ult;
            const damageSkills = realSkills
                .filter(id => {
                    const sk = getDef(id);
                    return sk && isDamage(sk) && canUse(id);
                })
                .map(id => ({ id, def: getDef(id) }))
                .sort((a, b) => (b.def.power || 0) - (a.def.power || 0));
            if (damageSkills.length > 0) return damageSkills[0].id;
            const any = realSkills.find(id => canUse(id));
            if (any) return any;
        }

        // 3. 关键阶段(30-50%)：优先恢复技能和必杀技
        if (isCritical) {
            const healId = realSkills.find(id => isHeal(getDef(id)) && canUse(id));
            if (healId) return healId;
            const ult = realSkills.find(id => id >= 3000 && canUse(id));
            if (ult) return ult;
            const buffId = realSkills.find(id => isBuff(getDef(id)) && canUse(id));
            if (buffId) return buffId;
        }

        // 4. 敌方HP<30% → 优先execute处决
        if (combatCtx.targetHpPct !== undefined && combatCtx.targetHpPct < 0.3) {
            const id = realSkills.find(id => {
                const t = getSType(getDef(id));
                return (t === 'execute' || t === 'execute_pierce') && canUse(id);
            });
            if (id) return id;
        }

        // 5. 多个敌人≥2 → 优先aoe
        if (combatCtx.targetCount >= 2) {
            const id = realSkills.find(id => {
                const t = getSType(getDef(id));
                return (t === 'aoe' || t === 'big_bang') && canUse(id);
            });
            if (id) return id;
        }

        // 6. 紧张阶段(50-80%)：更频繁使用技能 → 提高必杀技触发概率
        if (isTense) {
            const ult = realSkills.find(id => id >= 3000);
            if (ult && canUse(ult) && RAND(100) < 70) return ult; // 70%概率放必杀
        }

        // 7. 正常阶段(80-100%)：基础AI倾向
        const aiAgg = (cls.ai && (cls.ai.agg !== undefined ? cls.ai.agg : cls.ai.aggressive)) || 0.6;
        const aiDef = (cls.ai && (cls.ai.def !== undefined ? cls.ai.def : cls.ai.defensive)) || 0.25;
        const aiSup = (cls.ai && (cls.ai.sup !== undefined ? cls.ai.sup : cls.ai.support)) || 0.15;
        const roll = RAND(100);
        let picked = null;
        const hasActiveBuff = (hero.buffTurns > 0) || (combatCtx && combatCtx.actorBuffTurns > 0);

        // 先筛选出各类可用技能
        const usableDamage = realSkills.filter(id => isDamage(getDef(id)) && canUse(id));
        const usableBuff = realSkills.filter(id => isBuff(getDef(id)) && canUse(id));
        const usableHeal = realSkills.filter(id => isHeal(getDef(id)) && canUse(id));
        const usableOtherSupport = realSkills.filter(id => {
            const sk = getDef(id);
            return isSupport(sk) && !isHeal(sk) && !isBuff(sk) && canUse(id);
        });

        // 是否有可用的伤害技能
        const hasDamage = usableDamage.length > 0;

        if (roll < aiAgg * 100) {
            // 攻击倾向：优先伤害
            picked = usableDamage[0] || null;
        } else if (roll < (aiAgg + aiDef) * 100) {
            // 防御倾向：优先buff，但已有buff时优先攻击
            if (usableBuff.length > 0 && (!hasActiveBuff || !hasDamage || RAND(100) >= 70)) {
                picked = usableBuff[0];
            }
            // buff被跳过时，如果有伤害技能就用伤害
            if (!picked && hasDamage) {
                picked = usableDamage[0];
            }
        } else {
            // 辅助倾向：优先治疗（HP<70%）或其他辅助
            if (usableHeal.length > 0 && hpPct < 0.7) {
                picked = usableHeal[0];
            } else if (usableOtherSupport.length > 0) {
                picked = usableOtherSupport[0];
            }
            // 辅助条件不满足时回退到伤害
            if (!picked && hasDamage) {
                picked = usableDamage[0];
            }
        }

        // 兜底1：有伤害技能优先用伤害（避免纯辅助职业一直治疗）
        if (!picked && hasDamage) {
            picked = usableDamage[0];
        }

        // 兜底2：没有伤害技能时，用buff（即使已有buff也比治疗满血强）
        if (!picked && usableBuff.length > 0) {
            picked = usableBuff[0];
        }

        // 兜底3：真的什么都没有时，允许普通攻击（1001）
        if (!picked) {
            const normalAttack = cls.skills.find(id => id === 1001);
            if (normalAttack) return normalAttack;
        }

        if (picked) return picked;

        // 最终兜底：无条件使用第一个可用技能（但跳过满血治疗）
        const anyUsable = realSkills.find(id => {
            const sk = getDef(id);
            return canUse(id) && (!isHeal(sk) || hpPct < 0.7);
        });
        if (anyUsable) return anyUsable;

        return null;
    }
    // ========== 勇者入侵系统（新：声望驱动 + 每日刷新） ==========

    // 判断角色是否可以分配任务（魔王或已陷落/上位状态）
Game.prototype._weightedRandom = function(items) {
        const total = items.reduce((s, e) => s + e.weight, 0);
        let roll = RAND(total);
        for (const item of items) {
            roll -= item.weight;
            if (roll < 0) return item;
        }
        return items[items.length - 1];
    }

    // ========== 勇者相【伪装系统 ==========

    // 处理所有勇者之间的相遇事件
Game.prototype._calcRetreatChance = function(hero, hpPct, mpPct) {
        let chance = 0;
        if (hpPct < 0.15) chance += 40;
        else if (hpPct < 0.3) chance += 25;
        if (mpPct < 0.1) chance += 30;
        else if (mpPct < 0.2) chance += 15;
        if (hero.talent[12]) chance += 20;
        else if (hero.talent[10]) chance += 10;
        else if (hero.talent[11]) chance -= 15;
        else if (hero.talent[14]) chance -= 10;
        else if (hero.talent[16]) chance -= 10;
        else if (hero.talent[18]) chance -= 15;
        // V12.0: 勇者态度影响撤退概率
        const attitude = hero.cflag[CFLAGS.HERO_ATTITUDE] || 1;
        if (attitude === 2) {
            chance += 15; // 中立型更谨慎，更容易撤退
        } else if (attitude === 3) {
            chance -= 20; // 倾向魔王型更激进，几乎不主动撤退
        }
        return Math.max(0, Math.min(90, chance));
    }

    // 勇者每日层内移动（新规则：基础+5%，可往回走）

    // ========== V7.2 战斗系统v2.0 辅助函数 ==========

    // 统一伤害计算公式（百分比减伤制 + 等级碾压 + 元素克制 + 堕落种族被动）
    Game.prototype._calcDamageV2 = function(params) {
        const {
            attackerAtk, attackerLv = 1,
            targetDef, targetLv = 1,
            skillPower = 1.0,
            isPierce = false,
            critBonus = 0,
            randomFloat = true,
            element = 'none',
            attacker = null,
            target = null
        } = params;

        const lvDiff = attackerLv - targetLv;

        // 基础伤害 = ATK * 技能倍率 * 等级修正
        let rawDmg = attackerAtk * skillPower * (1 + lvDiff * 0.08);

        // 等级碾压机制
        let crushMult = 1.0, crushLabel = '';
        if (lvDiff >= 5) {
            const crushTier = Math.min(3, Math.floor(lvDiff / 5));
            crushMult = 1.0 + crushTier * 0.5;
            crushLabel = '碾压!';
        } else if (lvDiff <= -5) {
            const crushTier = Math.min(2, Math.floor(Math.abs(lvDiff) / 5));
            crushMult = 1.0 - crushTier * 0.30;
            crushLabel = '被碾压...';
        }
        rawDmg *= crushMult;

        // 防御提供百分比减伤
        let mitigation = 0;
        if (!isPierce) {
            const defRate = targetDef / (targetDef + attackerAtk * 1.5);
            mitigation = Math.min(0.75, defRate * 0.5);
        } else {
            // 穿透：只受25%防御减伤
            const defRate = targetDef / (targetDef + attackerAtk * 1.5);
            mitigation = Math.min(0.75, defRate * 0.25);
        }

        let dmg = Math.max(1, Math.floor(rawDmg * (1 - mitigation)));

        // V10.0: 元素属性克制
        let elementalMult = 1.0;
        let elementalLabel = '';
        if (element && element !== 'none' && window.ELEMENTAL_WEAKNESS_MATRIX) {
            const matrix = window.ELEMENTAL_WEAKNESS_MATRIX;
            const adv = matrix[element];
            // 目标元素：优先从目标实体获取，否则默认 'none'
            const targetElement = (target && target.cflag && target.cflag[CFLAGS.HERO_ELEMENT]) || params.targetElement || 'none';
            if (adv && targetElement && targetElement !== 'none') {
                if (adv.strong && adv.strong.includes(targetElement)) {
                    elementalMult = window.ELEMENTAL_ADVANTAGE_MULT || 1.3;
                    elementalLabel = '克制+';
                } else if (adv.weak && adv.weak.includes(targetElement)) {
                    elementalMult = window.ELEMENTAL_DISADVANTAGE_MULT || 0.7;
                    elementalLabel = '抵抗-';
                }
            }
        }
        dmg = Math.floor(dmg * elementalMult);

        // V10.0: 堕落种族被动 — 5% 额外暗属性伤害
        if (attacker && attacker.cflag && attacker.cflag[CFLAGS.FALLEN_RACE_ID]) {
            dmg = Math.floor(dmg * 1.05);
        }

        // 随机浮动
        if (randomFloat) {
            dmg = Math.floor(dmg * (0.85 + Math.random() * 0.3));
        }

        // 暴击判定
        let isCrit = false;
        let critMult = 1.5;
        const baseCritChance = Math.max(5, Math.min(35, 10 + lvDiff * 2)) + critBonus;
        if (RAND(100) < baseCritChance) {
            // V10.0: 堕落种族隐藏被动 — 25%概率双倍暴击伤害（对怪物/魔军无效）
            if (attacker && attacker.cflag && attacker.cflag[CFLAGS.FALLEN_RACE_ID] && target) {
                const targetIsMonster = !target.talent;
                const targetIsDemonArmy = target.cflag && target.cflag[CFLAGS.IS_DEMON_ARMY];
                if (!targetIsMonster && !targetIsDemonArmy) {
                    if (RAND(100) < 25) {
                        critMult = 3.0; // 1.5 * 2 = 双倍暴击伤害
                    }
                }
            }
            dmg = Math.floor(dmg * critMult);
            isCrit = true;
        }

        return { dmg, isCrit, crushMult, crushLabel, elementalMult, elementalLabel };
    };

    // 根据职业role获取站位（front/middle/back）
    Game.prototype._getPositionFromRole = function(role) {
        const frontRoles = ['front_dps', 'tank', 'front_burst', 'holy_tank', 'brawler', 'combo_burst'];
        const backRoles = ['magic_dps', 'magic_aoe', 'healer', 'healer_core', 'healer_buff', 'healer_dot', 'extreme_heal', 'assassin', 'dodge_assassin', 'soul_reaper', 'ninja', 'master_ninja', 'ranged', 'mobile_ranged', 'bard', 'battle_command', 'dancer', 'battle_charm'];
        if (frontRoles.includes(role)) return 'front';
        if (backRoles.includes(role)) return 'back';
        return 'middle';
    };

    // 根据站位计算怪物攻击目标优先级
    Game.prototype._chooseMonsterTargetByPosition = function(leftUnits, spies, betrayed) {
        // 1. 找有挑衅的单位
        const taunters = leftUnits.filter(u => u.hp > 0 && u.tauntTurns > 0);
        if (taunters.length > 0) return taunters[RAND(taunters.length)];

        // 2. 按站位优先级选取（前排60% > 中排30% > 后排10%），跳过隐身单位
        const front = leftUnits.filter(u => u.hp > 0 && u.position === 'front' && !u.isSpy && u.stealthTurns <= 0);
        const middle = leftUnits.filter(u => u.hp > 0 && u.position === 'middle' && !u.isSpy && u.stealthTurns <= 0);
        const back = leftUnits.filter(u => u.hp > 0 && u.position === 'back' && !u.isSpy && u.stealthTurns <= 0);

        const roll = RAND(100);
        let candidates;
        if (roll < 60 && front.length > 0) candidates = front;
        else if (roll < 90 && middle.length > 0) candidates = middle;
        else if (back.length > 0) candidates = back;
        else if (middle.length > 0) candidates = middle;
        else if (front.length > 0) candidates = front;
        else return null;

        // 优先攻击HP最低的目标
        return candidates.reduce((min, u) => u.hp < min.hp ? u : min, candidates[0]);
    };

    // V12.0: 诅咒武器25%概率攻击自身（魔王军免疫诅咒，不受此效果）
    Game.prototype._checkCurseWeaponSelfHarm = function(entity, combatLog, roundLabel) {
        if (!entity || !entity.gear || !entity.gear.weapons) return false;
        // 魔王军免疫诅咒，诅咒武器不会自攻
        if (typeof GearSystem !== 'undefined' && GearSystem._isImmuneToCurse && GearSystem._isImmuneToCurse(entity)) return false;
        for (const w of entity.gear.weapons) {
            if (w && w.cursed && RAND(100) < 25) {
                const atk = entity.cflag ? (entity.cflag[CFLAGS.ATK] || 20) : 20;
                const selfDmg = Math.max(1, Math.floor(atk * 0.5));
                entity.hp = Math.max(1, entity.hp - selfDmg);
                combatLog.push(`【${roundLabel}】${entity.name}的诅咒武器失控了！🌑 攻击了自己，受到${selfDmg}伤害`);
                return true;
            }
        }
        return false;
    };
