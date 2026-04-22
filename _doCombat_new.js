    _doCombat(hero, monster) {
        let heroHp = hero.hp;
        let heroMp = hero.mp;
        let monHp = monster.hp;
        let monMp = monster.mp || 0;

        // 勇者装备加成
        const gBonus = GearSystem.applyGearBonus(hero, false);
        // 勇者基础属性
        let heroBaseAtk = (hero.cflag[11] || 20) + (gBonus.atk || 0);
        let heroBaseDef = (hero.cflag[12] || 15) + (gBonus.def || 0);
        let heroSpd = hero.cflag[13] || 10 + hero.level * 2;

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
        const maxRounds = 20;
        const combatLog = [];

        // 若有异常状态，战斗开始时报告
        if (statusFx.dotHp > 0 || statusFx.dotMp > 0) {
            const stText = this._getStatusAilmentText(hero);
            if (stText) combatLog.push(`⚠️ ${hero.name}处于异常状态：${stText}`);
        }

        while (rounds < maxRounds && heroHp > 0 && monHp > 0) {
            rounds++;

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
                                if (cured.length > 0) combatLog.push(`  → ${cured.join('、')}`);
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
                        const dmg = Math.max(1, getHeroAtk() - getMonDef());
                        monHp -= dmg;
                        combatLog.push(`【${rounds}回合】${hero.name}攻击 ⚔️ 造成${dmg}伤害 (怪物HP:${Math.max(0,monHp)})`);
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
                                const rawDmg = Math.floor(getMonAtk() * 1.5);
                                const dmg = Math.max(1, rawDmg - getHeroDef());
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}猛击 💢 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            } else if (roll < 80) {
                                const dmg = Math.max(1, getMonAtk() - getHeroDef());
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
                                const dmg = Math.max(1, getMonAtk() - getHeroDef());
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
                                const dmg = Math.max(1, Math.floor(getMonAtk() * 1.2) - (getHeroDef() - pierceDef));
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}魔法弹 🔮 造成${dmg}伤害(穿透) (勇者HP:${Math.max(0,heroHp)})`);
                                // 魔法型怪物有概率附加异常状态
                                if (RAND(100) < 15) {
                                    this._addStatusAilment(hero, "paralysis", 2);
                                    combatLog.push(`  → ${hero.name}被麻痹了！`);
                                }
                            } else if (roll < 70) {
                                const dmg = Math.max(1, getMonAtk() - getHeroDef());
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
                                const dmg = Math.max(1, getMonAtk() - getHeroDef());
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            }
                        } else if (aiType === 'speed') {
                            if (roll < 40) {
                                const dmg1 = Math.max(1, Math.floor(getMonAtk() * 0.7) - getHeroDef());
                                const dmg2 = Math.max(1, Math.floor(getMonAtk() * 0.6) - getHeroDef());
                                heroHp -= dmg1;
                                if (heroHp > 0) heroHp -= dmg2;
                                combatLog.push(`【${rounds}回合】${monster.name}迅捷连击 💨 ${dmg1}+${dmg2}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            } else if (roll < 75) {
                                const dmg = Math.max(1, getMonAtk() - getHeroDef());
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            } else if (roll < 95 && monBuffTurns <= 0) {
                                monDefMod = Math.floor(monster.def * 0.5);
                                monBuffTurns = 2;
                                combatLog.push(`【${rounds}回合】${monster.name}闪避姿态 💨 防御提升`);
                            } else {
                                const dmg = Math.max(1, getMonAtk() - getHeroDef());
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            }
                        } else {
                            if (roll < 50) {
                                const dmg = Math.max(1, getMonAtk() - getHeroDef());
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            } else if (roll < 75) {
                                const rawDmg = Math.floor(getMonAtk() * 1.3);
                                const dmg = Math.max(1, rawDmg - getHeroDef());
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
                                const dmg = Math.max(1, getMonAtk() - getHeroDef());
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

        const victory = monHp <= 0;
        const defeated = heroHp <= 0;
        const escaped = !victory && !defeated;

        let drop = null;
        if (victory) {
            const expGain = monster.level * 10;
            hero.exp[0] = (hero.exp[0] || 0) + expGain;
            const goldGain = Math.floor(monster.level * monster.level * 2 + RAND(monster.level * 10));
            hero.gold += goldGain;
            combatLog.push(`【胜利】${hero.name}击败了${monster.name}(战斗${rounds}回合) 获得${expGain}EXP ${goldGain}G`);
            if (Math.random() < 0.30) {
                const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
                const slot = slotTypes[RAND(slotTypes.length)];
                drop = GearSystem.generateGear(slot, monster.level);
                const r = GearSystem.equipItem(hero, drop);
                if (r.success) combatLog.push(`🎁 ${r.msg}`);
            }
        } else if (defeated) {
            combatLog.push(`【败北】${hero.name}被${monster.name}击败了...`);
        } else {
            combatLog.push(`【撤退】${hero.name}从战斗中撤退了`);
        }

        return { victory, defeated, escaped, rounds, combatLog, monster, drop };
    }
