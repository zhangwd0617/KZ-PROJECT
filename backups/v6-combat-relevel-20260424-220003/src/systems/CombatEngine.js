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

        while (rounds < maxRounds && heroHp > 0 && monHp > 0) {
            rounds++;

            // === 逃跑判定 ===
            const fleeChance = Math.max(5, Math.min(95, 30 + (hero.level - monster.level) * 5));
            if (RAND(100) < fleeChance) {
                combatLog.push(`【${rounds}回合】${hero.name}成功撤离了战斗！`);
                hero.hp = Math.max(0, heroHp);
                hero.mp = Math.max(0, heroMp);
                monster.maxHp = monster.hp;
                monster.hp = Math.max(0, monHp);
                return { victory: false, defeated: false, escaped: true, rounds, combatLog, monster, drop: null };
            }

            // 根据敏捷决定行动顺序
            const heroFirst = getHeroSpd() >= monster.spd;
            const actors = heroFirst ? ['hero', 'monster'] : ['monster', 'hero'];

            for (const actor of actors) {
                if (heroHp <= 0 || monHp <= 0) break;

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

                    // 尝试使用职业技能
                    const skillId = this._chooseHeroSkill(hero, "solo");
                    const skillDef = skillId ? HERO_SKILL_DEFS[skillId] : null;
                    const canUseSkill = skillDef && heroMp >= skillDef.cost;

                    if (canUseSkill) {
                        heroMp -= skillDef.cost;
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
                        const healAmt = Math.floor(hero.level * 6 + heroBaseAtk * 0.3);
                        heroHp = Math.min(hero.maxHp, heroHp + healAmt);
                        heroMp -= 15;
                        combatLog.push(`【${rounds}回合】${hero.name}使用回复魔法 ✨ 恢复${healAmt}HP (MP:${heroMp})`);
                    } else if (canBuff) {
                        heroAtkMod = Math.floor(heroBaseAtk * 0.2);
                        heroBuffTurns = 2;
                        heroMp -= 20;
                        combatLog.push(`【${rounds}回合】${hero.name}使用强化魔法 💪 攻击+${heroAtkMod} (持续2回合)`);
                    } else {
                        // V6.0 新伤害公式: (ATK - DEF*0.5) * 等级压制 * 随机浮动
                        const lvDiff = hero.level - monster.level;
                        let lvMult = 1.0;
                        if (lvDiff >= 0) {
                            lvMult = Math.min(1.5, 1.0 + lvDiff * 0.02);
                        } else {
                            lvMult = Math.max(0.3, 1.0 / (1.0 + Math.abs(lvDiff) * 0.03));
                        }
                        const randomFloat = 0.9 + Math.random() * 0.2;
                        let dmg = Math.max(1, Math.floor((getHeroAtk() - getMonDef() * 0.5) * lvMult * randomFloat));
                        // 暴击
                        const critChance = Math.max(5, Math.min(30, 10 + (getHeroAtk() - getMonDef()) * 0.01));
                        if (RAND(100) < critChance) {
                            dmg = Math.floor(dmg * 1.5);
                            combatLog.push(`【${rounds}回合】${hero.name}暴击 💥 造成${dmg}伤害 (怪物HP:${Math.max(0,monHp)})`);
                        } else {
                            combatLog.push(`【${rounds}回合】${hero.name}攻击 ⚔️ 造成${dmg}伤害 (怪物HP:${Math.max(0,monHp)})`);
                        }
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
                                const monLvDiff = monster.level - hero.level;
                                let monLvMult = 1.0;
                                if (monLvDiff >= 0) {
                                    monLvMult = Math.min(1.5, 1.0 + monLvDiff * 0.02);
                                } else {
                                    monLvMult = Math.max(0.3, 1.0 / (1.0 + Math.abs(monLvDiff) * 0.03));
                                }
                                const monRandomFloat = 0.9 + Math.random() * 0.2;
                                let dmg = Math.max(1, Math.floor((getMonAtk() - getHeroDef() * 0.5) * monLvMult * monRandomFloat * 1.5));
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}猛击 💢 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            } else if (roll < 80) {
                                const monLvDiff = monster.level - hero.level;
                                let monLvMult = 1.0;
                                if (monLvDiff >= 0) {
                                    monLvMult = Math.min(1.5, 1.0 + monLvDiff * 0.02);
                                } else {
                                    monLvMult = Math.max(0.3, 1.0 / (1.0 + Math.abs(monLvDiff) * 0.03));
                                }
                                const monRandomFloat = 0.9 + Math.random() * 0.2;
                                let dmg = Math.max(1, Math.floor((getMonAtk() - getHeroDef() * 0.5) * monLvMult * monRandomFloat));
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            } else if (roll < 95 && monBuffTurns <= 0) {
                                monAtkMod = Math.floor(monster.atk * 0.3);
                                monBuffTurns = 1;
                                combatLog.push(`【${rounds}回合】${monster.name}正在蓄力 ⚡ 下回合攻击力大幅提升`);
                            } else {
                                combatLog.push(`【${rounds}回合】${monster.name}采取防御姿态 🛡️`);
                            }
                        } else if (aiType === 'defense') {
                            if (roll < 40) {
                                const monLvDiff = monster.level - hero.level;
                                let monLvMult = 1.0;
                                if (monLvDiff >= 0) {
                                    monLvMult = Math.min(1.5, 1.0 + monLvDiff * 0.02);
                                } else {
                                    monLvMult = Math.max(0.3, 1.0 / (1.0 + Math.abs(monLvDiff) * 0.03));
                                }
                                const monRandomFloat = 0.9 + Math.random() * 0.2;
                                let dmg = Math.max(1, Math.floor((getMonAtk() - getHeroDef() * 0.5) * monLvMult * monRandomFloat));
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
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
                                const pierceDef = Math.floor(getHeroDef() * 0.3);
                                const monLvDiff = monster.level - hero.level;
                                let monLvMult = 1.0;
                                if (monLvDiff >= 0) {
                                    monLvMult = Math.min(1.5, 1.0 + monLvDiff * 0.02);
                                } else {
                                    monLvMult = Math.max(0.3, 1.0 / (1.0 + Math.abs(monLvDiff) * 0.03));
                                }
                                const monRandomFloat = 0.9 + Math.random() * 0.2;
                                let dmg = Math.max(1, Math.floor((Math.floor(getMonAtk() * 1.2) - (getHeroDef() - pierceDef)) * monLvMult * monRandomFloat));
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}魔法弹 🔮 造成${dmg}伤害(穿透) (勇者HP:${Math.max(0,heroHp)})`);
                                // 魔法型怪物有概率附加异常状态
                                if (RAND(100) < 15) {
                                    this._addStatusAilment(hero, "paralysis", 2);
                                    combatLog.push(`  → ${hero.name}被麻痹了！`);
                                }
                            } else if (roll < 70) {
                                const monLvDiff = monster.level - hero.level;
                                let monLvMult = 1.0;
                                if (monLvDiff >= 0) {
                                    monLvMult = Math.min(1.5, 1.0 + monLvDiff * 0.02);
                                } else {
                                    monLvMult = Math.max(0.3, 1.0 / (1.0 + Math.abs(monLvDiff) * 0.03));
                                }
                                const monRandomFloat = 0.9 + Math.random() * 0.2;
                                let dmg = Math.max(1, Math.floor((getMonAtk() - getHeroDef() * 0.5) * monLvMult * monRandomFloat));
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
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
                                const monLvDiff = monster.level - hero.level;
                                let monLvMult = 1.0;
                                if (monLvDiff >= 0) {
                                    monLvMult = Math.min(1.5, 1.0 + monLvDiff * 0.02);
                                } else {
                                    monLvMult = Math.max(0.3, 1.0 / (1.0 + Math.abs(monLvDiff) * 0.03));
                                }
                                const monRandomFloat = 0.9 + Math.random() * 0.2;
                                let dmg = Math.max(1, Math.floor((getMonAtk() - getHeroDef() * 0.5) * monLvMult * monRandomFloat));
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            }
                        } else if (aiType === 'speed') {
                            if (roll < 40) {
                                const monLvDiff = monster.level - hero.level;
                                let monLvMult = 1.0;
                                if (monLvDiff >= 0) {
                                    monLvMult = Math.min(1.5, 1.0 + monLvDiff * 0.02);
                                } else {
                                    monLvMult = Math.max(0.3, 1.0 / (1.0 + Math.abs(monLvDiff) * 0.03));
                                }
                                const monRandomFloat = 0.9 + Math.random() * 0.2;
                                const dmg1 = Math.max(1, Math.floor((Math.floor(getMonAtk() * 0.7) - getHeroDef() * 0.5) * monLvMult * monRandomFloat));
                                const dmg2 = Math.max(1, Math.floor((Math.floor(getMonAtk() * 0.6) - getHeroDef() * 0.5) * monLvMult * monRandomFloat));
                                heroHp -= dmg1;
                                if (heroHp > 0) heroHp -= dmg2;
                                combatLog.push(`【${rounds}回合】${monster.name}迅捷连击 💨 ${dmg1}+${dmg2}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            } else if (roll < 75) {
                                const monLvDiff = monster.level - hero.level;
                                let monLvMult = 1.0;
                                if (monLvDiff >= 0) {
                                    monLvMult = Math.min(1.5, 1.0 + monLvDiff * 0.02);
                                } else {
                                    monLvMult = Math.max(0.3, 1.0 / (1.0 + Math.abs(monLvDiff) * 0.03));
                                }
                                const monRandomFloat = 0.9 + Math.random() * 0.2;
                                let dmg = Math.max(1, Math.floor((getMonAtk() - getHeroDef() * 0.5) * monLvMult * monRandomFloat));
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            } else if (roll < 95 && monBuffTurns <= 0) {
                                monDefMod = Math.floor(monster.def * 0.5);
                                monBuffTurns = 2;
                                combatLog.push(`【${rounds}回合】${monster.name}闪避姿态 💨 防御提升`);
                            } else {
                                const monLvDiff = monster.level - hero.level;
                                let monLvMult = 1.0;
                                if (monLvDiff >= 0) {
                                    monLvMult = Math.min(1.5, 1.0 + monLvDiff * 0.02);
                                } else {
                                    monLvMult = Math.max(0.3, 1.0 / (1.0 + Math.abs(monLvDiff) * 0.03));
                                }
                                const monRandomFloat = 0.9 + Math.random() * 0.2;
                                let dmg = Math.max(1, Math.floor((getMonAtk() - getHeroDef() * 0.5) * monLvMult * monRandomFloat));
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            }
                        } else {
                            if (roll < 50) {
                                const monLvDiff = monster.level - hero.level;
                                let monLvMult = 1.0;
                                if (monLvDiff >= 0) {
                                    monLvMult = Math.min(1.5, 1.0 + monLvDiff * 0.02);
                                } else {
                                    monLvMult = Math.max(0.3, 1.0 / (1.0 + Math.abs(monLvDiff) * 0.03));
                                }
                                const monRandomFloat = 0.9 + Math.random() * 0.2;
                                let dmg = Math.max(1, Math.floor((getMonAtk() - getHeroDef() * 0.5) * monLvMult * monRandomFloat));
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            } else if (roll < 75) {
                                const monLvDiff = monster.level - hero.level;
                                let monLvMult = 1.0;
                                if (monLvDiff >= 0) {
                                    monLvMult = Math.min(1.5, 1.0 + monLvDiff * 0.02);
                                } else {
                                    monLvMult = Math.max(0.3, 1.0 / (1.0 + Math.abs(monLvDiff) * 0.03));
                                }
                                const monRandomFloat = 0.9 + Math.random() * 0.2;
                                let dmg = Math.max(1, Math.floor((getMonAtk() - getHeroDef() * 0.5) * monLvMult * monRandomFloat * 1.3));
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}强力攻击 💥 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
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
                                const monLvDiff = monster.level - hero.level;
                                let monLvMult = 1.0;
                                if (monLvDiff >= 0) {
                                    monLvMult = Math.min(1.5, 1.0 + monLvDiff * 0.02);
                                } else {
                                    monLvMult = Math.max(0.3, 1.0 / (1.0 + Math.abs(monLvDiff) * 0.03));
                                }
                                const monRandomFloat = 0.9 + Math.random() * 0.2;
                                let dmg = Math.max(1, Math.floor((getMonAtk() - getHeroDef() * 0.5) * monLvMult * monRandomFloat));
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
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

        // 更新勇者的实际HP/MP
        hero.hp = Math.max(0, heroHp);
        hero.mp = Math.max(0, heroMp);

        let victory = monHp <= 0;
        let defeated = heroHp <= 0;
        let escaped = false;

        // 50回合后未分胜负，按总剩余血量判胜负
        if (!victory && !defeated) {
            if (heroHp > monHp) {
                victory = true;
                combatLog.push(`【血量判定】${hero.name}以剩余HP优势获胜！(勇者${heroHp} vs 怪物${monHp})`);
            } else if (monHp > heroHp) {
                defeated = true;
                combatLog.push(`【血量判定】${monster.name}以剩余HP优势获胜！(怪物${monHp} vs 勇者${heroHp})`);
            } else {
                escaped = true;
                combatLog.push(`【平手】双方激战50回合，势均力敌，各自撤退`);
            }
        }

        let drop = null;
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
                const r = GearSystem.equipItem(hero, drop);
                if (r.success) combatLog.push(`🎁 ${r.msg}`);
            }
        } else if (defeated) {
            combatLog.push(`【败北】${hero.name}被${monster.name}击败了...`);
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
            const realAlive = aliveHeroes.filter(h => !h.cflag[912]);
            if (realAlive.length > 0) {
                const maxHeroLevel = Math.max(...realAlive.map(h => h.level));
                const fleeChance = Math.max(5, Math.min(95, 30 + (maxHeroLevel - monster.level) * 5));
                if (RAND(100) < fleeChance) {
                    combatLog.push(`【${rounds}回合】小队成功撤离了战斗！`);
                    monster.maxHp = monster.hp;
                    monster.hp = Math.max(0, monHp);
                    return { victory: false, defeated: false, escaped: true, rounds, combatLog, monster, betrayed };
                }
            }

            // 每回合按速度重新排序
            actors.sort((a, b) => b.spd - a.spd);

            for (const actor of actors) {
                if (monHp <= 0) break;

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
                    if (cls && HEALER_CLASS_IDS && HEALER_CLASS_IDS.includes(hero.cflag[CFLAGS.CLASS_ID] || hero.cflag[CFLAGS.HERO_CLASS])) {
                        const allies = realHeroes.filter(h => h.hp > 0 && h.hp < h.maxHp * 0.6);
                        if (allies.length > 0 && RAND(100) < 30) {
                            const target = allies.reduce((min, h) => h.hp / h.maxHp < min.hp / min.maxHp ? h : min, allies[0]);
                            const healAmt = Math.floor(hero.level * 4 + heroBaseAtk * 0.2);
                            target.hp = Math.min(target.maxHp, target.hp + healAmt);
                            combatLog.push(`【${rounds}回合】${hero.name}(治疗)恢复${target.name}${healAmt}HP`);
                        }
                    }

                    // 尝试使用职业技能
                    const skillId = this._chooseHeroSkill(hero, "squad");
                    const skillDef = skillId ? HERO_SKILL_DEFS[skillId] : null;
                    const canUseSkill = skillDef && hero.mp >= skillDef.cost;

                    if (canUseSkill) {
                        hero.mp -= skillDef.cost;
                        const skillResult = this._useHeroSkill(hero, skillId, monster, { isSolo: false, squad: realHeroes });
                        if (skillResult && skillResult.used) {
                            combatLog.push(`【${rounds}回合】${skillResult.log}`);
                            if (skillResult.damage) {
                                monHp -= skillResult.damage;
                            }
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

                    // 普通攻击
                    const gBonus = GearSystem.applyGearBonus(hero, !!hero.talent[200]);
                    const heroAtk = Math.floor(((hero.cflag[CFLAGS.ATK] || 20) + (gBonus.atk || 0)) * attrMod);
                    const dmg = Math.max(1, heroAtk - monster.def);
                    monHp -= dmg;
                    combatLog.push(`【${rounds}回合】${hero.name}攻击${monster.name}，造成${dmg}伤害`);

                } else if (actor.type === 'monster' && monHp > 0) {
                    let aliveTargets = squad.filter(h => h.hp > 0);
                    if (aliveTargets.length === 0) break;
                    const realTargets = aliveTargets.filter(h => !h.cflag[912]);
                    const target = realTargets.length > 0
                        ? realTargets.reduce((min, h) => h.hp < min.hp ? h : min, realTargets[0])
                        : aliveTargets.reduce((min, h) => h.hp < min.hp ? h : min, aliveTargets[0]);
                    const monAtk = Math.floor(monster.atk * (hasSpy && !betrayed ? 1.25 : 1));
                    const tBonus = GearSystem.applyGearBonus(target, !!target.talent[200]);
                    const targetDef = (target.cflag[CFLAGS.DEF] || 15) + (tBonus.def || 0);
                    const monDmg = Math.max(1, monAtk - targetDef);
                    target.hp = Math.max(0, target.hp - monDmg);
                    combatLog.push(`【${rounds}回合】${monster.name}攻击${target.name}，造成${monDmg}伤害`);

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

        // 50回合后未分胜负，按总剩余血量判胜负
        if (!victory && !allDefeated) {
            const heroHp = survivors.filter(h => !h.cflag[912]).reduce((s, h) => s + h.hp, 0);
            if (heroHp > monHp) {
                victory = true;
                combatLog.push(`【血量判定】小队以剩余HP优势获胜！(小队${heroHp} vs 怪物${monHp})`);
            } else if (monHp > heroHp) {
                combatLog.push(`【血量判定】${monster.name}以剩余HP优势获胜！(怪物${monHp} vs 小队${heroHp})`);
            } else {
                escaped = true;
                combatLog.push(`【平手】双方激战50回合，势均力敌，各自撤退`);
            }
        }

        let drop = null;
        if (victory) {
            const expPerMember = Math.floor(monster.level * 10 / Math.max(1, survivors.filter(h => !h.cflag[912]).length));
            for (const hero of survivors) {
                if (!hero.cflag[912]) {
                    hero.addExp(102, expPerMember);
                    this.checkLevelUp(hero);
                }
            }
            combatLog.push(`【胜利】小队击败了${monster.name}(战斗${rounds}回合) 每人获得${expPerMember}EXP`);
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
                const r = GearSystem.equipItem(lucky, drop);
                if (r.success) combatLog.push(`🎁 ${lucky.name}获得了${r.msg}`);
            }
        } else if (allDefeated) {
            combatLog.push(`【败北】小队被${monster.name}全灭了...`);
        } else if (escaped) {
            combatLog.push(`【撤退】小队从战斗中撤退了`);
        }

        // 更新怪物最终HP（用于UI显示）
        monster.maxHp = monster.hp;
        monster.hp = Math.max(0, monHp);
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
            const statusFx = isMonster ? { atkMod:0, defMod:0, spdMod:0, dotHp:0, dotMp:0, actionBlock:0, friendlyFire:0 } : this._applyStatusAilmentEffects(entity);
            // 勋章加成（仅前勇者/奴隶）
            const medalMult = (!isMonster && isExHero) ? this.getMedalBonus(entity) : 1;
            return {
                id: teamSide + '_' + index,
                name: entity.name || '???',
                entity: entity,
                team: teamSide,
                isMonster: isMonster,
                isExHero: !!isExHero,
                isSpy: !!isSpy,
                initialHp: Math.floor((entity.hp || 0) * medalMult),
                initialMp: Math.floor((entity.mp || 0) * medalMult),
                hp: Math.floor((entity.hp || 0) * medalMult),
                maxHp: Math.floor((entity.maxHp || entity.hp || 1) * medalMult),
                mp: isMonster ? (entity.mp || 0) : Math.floor((entity.mp || 0) * medalMult),
                maxMp: isMonster ? (entity.mp || 0) : Math.floor((entity.maxMp || entity.mp || 1) * medalMult),
                baseAtk: Math.max(1, Math.floor(baseAtk * (1 + statusFx.atkMod) * medalMult * (isMaster ? 1.25 : 1))),
                baseDef: Math.max(0, Math.floor(baseDef * (1 + statusFx.defMod) * medalMult * (isMaster ? 1.25 : 1))),
                baseSpd: Math.max(1, Math.floor(baseSpd * (1 + statusFx.spdMod) * medalMult * (isMaster ? 1.25 : 1))),
                atkMod: 0, defMod: 0, spdMod: 0,
                buffTurns: 0,
                invincible: 0,
                statusFx: statusFx,
                classId: isMonster ? 0 : (entity.cflag[CFLAGS.HERO_CLASS] || 0),
                level: effLevel
            };
        };

        const leftUnits = leftTeam.map((e, i) => wrapUnit(e, 'left', i));
        const rightUnits = rightTeam.map((e, i) => wrapUnit(e, 'right', i));

        const snapshotHp = () => {
            const leftStr = leftUnits.filter(u => u.hp > 0).map(u => `${u.name}:${u.hp}/${u.maxHp}`).join(' ');
            const rightStr = rightUnits.filter(u => u.hp > 0).map(u => `${u.name}:${u.hp}/${u.maxHp}`).join(' ');
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
            const leftHasHero = aliveLeft.some(u => !u.isMonster && !u.isExHero && !u.isSpy && !u.isMaster);
            const rightHasHero = aliveRight.some(u => !u.isMonster && !u.isExHero && !u.isSpy && !u.isMaster);
            if (leftHasHero !== rightHasHero) {
                const heroSide = leftHasHero ? aliveLeft : aliveRight;
                const enemySide = leftHasHero ? aliveRight : aliveLeft;
                const heroMaxLevel = Math.max(...heroSide.map(u => u.level));
                const enemyMaxLevel = enemySide.length > 0 ? Math.max(...enemySide.map(u => u.level)) : 1;
                const fleeChance = Math.max(5, Math.min(95, 30 + (heroMaxLevel - enemyMaxLevel) * 5));
                if (RAND(100) < fleeChance) {
                    combatLog.push(`【${rounds}回合】勇者方成功撤离了战斗！`);
                    for (const u of leftUnits) { u.entity.hp = u.hp; u.entity.mp = u.mp; }
                    for (const u of rightUnits) { u.entity.hp = u.hp; u.entity.mp = u.mp; }
                    return { victory: false, defeated: false, escaped: true, rounds, combatLog, leftTeam: leftUnits, rightTeam: rightUnits, drop: null, betrayed, monster: rightUnits[0] ? rightUnits[0].entity : null };
                }
            }

            allActors.sort((a, b) => (b.baseSpd + b.spdMod) - (a.baseSpd + a.spdMod));

            for (const actor of allActors) {
                if (actor.hp <= 0) continue;
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

                const target = enemyAlive.reduce((min, u) => u.hp < min.hp ? u : min, enemyAlive[0]);

                if (!actor.isMonster && actor.mp >= 10) {
                    const skillCtx = actor.team === 'left' ? 'squad' : 'solo';
                    const skillId = this._chooseHeroSkill(actor.entity, skillCtx);
                    const skillDef = skillId ? HERO_SKILL_DEFS[skillId] : null;
                    if (skillDef && actor.mp >= skillDef.cost) {
                        actor.mp -= skillDef.cost;
                        const skillResult = this._useHeroSkill(actor.entity, skillId, target.entity, { isSolo: actor.team !== 'left', squad: leftUnits.filter(u => u.hp > 0 && !u.isSpy).map(u => u.entity) });
                        if (skillResult && skillResult.used) {
                            combatLog.push(`【${rounds}回合】${skillResult.log}`);
                            if (skillResult.damage) {
                                target.hp = Math.max(0, target.hp - skillResult.damage);
                            }
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
                            if (skillResult.ailment) combatLog.push(`  → ${target.name}被施加了异常效果！`);
                            if (skillResult.cleanse) {
                                const cured = this._tryCureStatusAilment(actor.entity, "skill_cleanse");
                                if (cured.length > 0) combatLog.push(`  → ${cured.join(',')}`);
                            }
                            continue;
                        }
                    }
                }

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

                const attackerAtk = Math.max(1, actor.baseAtk + actor.atkMod);
                const targetDef = Math.max(0, target.baseDef + target.defMod);
                let dmg = Math.max(1, attackerAtk - targetDef);

                if (actor.isMonster && actor.team === 'right' && spies.length > 0 && !betrayed) {
                    dmg = Math.floor(dmg * 1.25);
                }

                if (target.invincible > 0) {
                    combatLog.push(`【${rounds}回合】${actor.name}的攻击被${target.name}挡下了！🛡️ (无敌)`);
                    target.invincible--;
                    continue;
                }

                target.hp = Math.max(0, target.hp - dmg);
                combatLog.push(`【${rounds}回合】${actor.name}攻击${target.name}，造成${dmg}伤害`);

                if (actor.isMonster && RAND(100) < 10) {
                    const ailments = ["weak", "burn", "poison", "fear"];
                    const aType = ailments[RAND(ailments.length)];
                    this._addStatusAilment(target.entity, aType, 2 + RAND(2));
                    combatLog.push(`  → ${target.name}被施加了【${STATUS_AILMENT_DEFS[aType].name}】！`);
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
                const leftHp = leftUnits.reduce((s, u) => s + Math.max(0, u.hp), 0);
                const rightHp = rightUnits.reduce((s, u) => s + Math.max(0, u.hp), 0);
                if (leftHp > rightHp) {
                    victory = true;
                    combatLog.push(`【血量判定】左方以剩余HP优势获胜！(左${leftHp} vs 右${rightHp})`);
                } else if (rightHp > leftHp) {
                    defeated = true;
                    combatLog.push(`【血量判定】右方以剩余HP优势获胜！(右${rightHp} vs 左${leftHp})`);
                } else {
                    combatLog.push(`【平手】双方激战50回合未分胜负，各自撤退`);
                }
            }
        }

        for (const u of leftUnits) { u.entity.hp = u.hp; u.entity.mp = u.mp; }
        for (const u of rightUnits) { u.entity.hp = u.hp; u.entity.mp = u.mp; }

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
                    const r = GearSystem.equipItem(lucky.entity, drop);
                    if (r.success) combatLog.push(`🎁 ${lucky.name}获得了${r.msg}`);
                }
            }
        } else if (defeated) {
            combatLog.push(`【败北】${leftUnits.map(u => u.name).join(',')}被全灭了...`);
        } else if (draw) {
            combatLog.push(`【平手】从战斗中撤退了`);
        } else {
            combatLog.push(`【撤退】从战斗中撤退了`);
        }

        return { victory, defeated, escaped: !victory && !defeated && !draw, rounds, combatLog, leftTeam: leftUnits, rightTeam: rightUnits, drop, betrayed, monster: rightUnits[0] ? rightUnits[0].entity : null };
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

        // 5%概率遇到 N*20+5 的超等级怪物
        if (RAND(100) < 5) {
            level = maxLv + 5;
        }

        // 精英怪固定为该层最高等级
        if (eliteType === 'chief' || eliteType === 'overlord') {
            level = maxLv;
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

        // V6.0 统一属性公式
        monster.hp  = Math.floor((800 + level * 20) * hpMul);
        monster.mp  = Math.floor((400 + level * 10) * hpMul);
        monster.atk = Math.floor((20 + level * 3) * atkMul);
        monster.def = Math.floor((15 + level * 2) * defMul);
        monster.spd = Math.floor((8 + level * 1) * spdMul);

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
        let chance = 30; // 基础投降【0%

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

        // 2. 进入投降判定（投降只影响初始屈服度，不直接转化）
        const surrenderResult = this._trySurrender(hero);
        let initialMark = 0;
        if (isEscapee) {
            // 逃跑者再次被捕时，初始屈服度+1
            initialMark = 1;
        }
        if (surrenderResult.success) {
            initialMark = Math.max(initialMark, 1); // 投降者初始屈服度至少1
        }
        // 无论是否投降，一律先关入监狱
        this._imprisonHero(hero, initialMark);
        return { type: surrenderResult.success ? 'surrender' : 'imprisoned', message: surrenderResult.message };
    }

    // 将监狱中的俘虏转化为奴隶（需要 mark[0] >= 3）
Game.prototype._convertHeroToSlave = function(hero) {
        if (!hero) return { success: false, msg: '角色不存在' };
        if ((hero.mark[0] || 0) < 3) return { success: false, msg: `该俘虏尚未完全屈服（当前服从Lv.${hero.mark[0] || 0}，需要Lv.3）` };

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

        // 恢复部分状态
        hero.hp = Math.floor(hero.maxHp * 0.3);
        hero.mp = Math.floor(hero.maxMp * 0.2);

        // 重新计算属性
        this._recalcBaseStats(hero);

        // 加入奴隶列表
        hero.affinity = this.generateAffinity(hero);
        this.addCharaFromTemplate(hero);
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
        hero.cflag[CFLAGS.LOVE_POINTS] = 1;
        hero.cflag[CFLAGS.OBEDIENCE_POINTS] = this.day; // 被俘天数

        // 设置初始屈服度（投降的更高）
        hero.mark[0] = initialMark;

        // 清除勇者专属标记
        hero.cflag[CFLAGS.HERO_FLOOR] = 0;
        hero.cflag[CFLAGS.HERO_PROGRESS] = 0;

        // 恢复少量状态（保证存活）
        hero.hp = Math.max(1, Math.floor(hero.maxHp * 0.1));
        hero.mp = Math.max(1, Math.floor(hero.maxMp * 0.1));

        this.prisoners.push(hero);
        UI.showToast(`勇者${hero.name} 被俘，关入监狱！`, 'warning');
    }

    // ========== 伪装者派遣系统==========

    // 派遣前勇者奴隶伪装混入勇者队】
Game.prototype._getHeroClass = function(hero) {
        if (!hero) return null;
        // V5.0 优先使用 CLASS_DEFS
        const classId = hero.cflag[CFLAGS.CLASS_ID] || hero.cflag[CFLAGS.HERO_CLASS];
        if (window.CLASS_DEFS && window.CLASS_DEFS[classId]) return window.CLASS_DEFS[classId];
        if (!classId || !HERO_CLASS_DEFS[classId]) return null;
        return HERO_CLASS_DEFS[classId];
    }

Game.prototype._getSkillPower = function(hero, skill) {
        if (!hero || !skill) return 0;
        const lv = hero.level || 1;
        return Math.floor(skill.power + skill.scale * lv);
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
            const skillDef = window.CLASS_SKILL_DEFS ? window.CLASS_SKILL_DEFS[sid] : (HERO_SKILL_DEFS ? HERO_SKILL_DEFS[sid] : null);
            if (!skillDef) continue;
            const st = skillDef.type || skillDef.effectType || '';
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
        // V5.0 优先使用 CLASS_SKILL_DEFS
        const skill = window.CLASS_SKILL_DEFS ? window.CLASS_SKILL_DEFS[skillId] : (HERO_SKILL_DEFS ? HERO_SKILL_DEFS[skillId] : null);
        if (!skill) return null;
        const power = this._getSkillPower(hero, skill);
        const st = skill.type || skill.effectType || '';
        const result = { used: true, skillName: skill.name, cost: skill.cost || 0, logs: [] };

        switch (st) {
            case "damage":
            case "crit_damage":
            case "pierce":
            case "execute":
            case "execute_pierce": {
                const baseAtk = (hero.cflag[CFLAGS.ATK] || 20);
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
                const baseAtk = (hero.cflag[CFLAGS.ATK] || 20);
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
                const baseAtk = (hero.cflag[CFLAGS.ATK] || 20);
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

Game.prototype._chooseHeroSkill = function(hero, context) {
        if (!hero) return null;
        const cls = this._getHeroClass(hero);
        if (!cls || !cls.skills) return null;
        const hpPct = hero.hp / Math.max(1, hero.maxHp);
        const mpPct = hero.mp / Math.max(1, hero.maxMp);
        const skillDefs = window.CLASS_SKILL_DEFS || HERO_SKILL_DEFS || {};
        const skills = cls.skills.map(id => skillDefs[id]).filter(Boolean);
        if (skills.length === 0) return null;

        // 必杀技（技能ID >= 3000）：MP充足时有15%概率使用
        const ultIdx = cls.skills.findIndex(id => id >= 3000);
        if (ultIdx >= 0) {
            const ult = skillDefs[cls.skills[ultIdx]];
            if (ult && mpPct >= 0.4 && RAND(100) < 15) return cls.skills[ultIdx];
        }

        // 根据AI倾向选择
        const ai = cls.ai || { agg: 0.5, def: 0.3, sup: 0.2 };
        const roll = RAND(100);

        const getSType = (sk) => sk.type || sk.effectType || '';
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

        // 紧急治疗
        for (let i = 0; i < cls.skills.length; i++) {
            if (hpPct < 0.35 && isHeal(skills[i])) return cls.skills[i];
        }
        if (context === "squad") {
            for (let i = 0; i < cls.skills.length; i++) {
                if (hpPct < 0.5 && getSType(skills[i]) === 'mass_heal') return cls.skills[i];
            }
        }

        if (roll < ai.agg * 100) {
            for (let i = 0; i < cls.skills.length; i++) if (isDamage(skills[i])) return cls.skills[i];
        } else if (roll < (ai.agg + ai.def) * 100) {
            for (let i = 0; i < cls.skills.length; i++) if (isBuff(skills[i])) return cls.skills[i];
        } else {
            for (let i = 0; i < cls.skills.length; i++) if (isSupport(skills[i])) return cls.skills[i];
        }

        // 默认返回第一个可用技能
        return cls.skills[0];
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
        return Math.max(0, Math.min(90, chance));
    }

    // 勇者每日层内移动（新规则：基础+5%，可往回走）
