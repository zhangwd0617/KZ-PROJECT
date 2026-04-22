    _doSquadCombat(squad, monster) {
        let monHp = monster.hp;
        let monMp = monster.mp || 0;
        let rounds = 0;
        const maxRounds = 15;
        const combatLog = [];

        // 检测伪装者
        const spies = squad.filter(h => h.talent[201]);
        const realHeroes = squad.filter(h => !h.talent[201]);
        const hasSpy = spies.length > 0;
        const attrMod = Math.max(0.25, 1 - spies.length * 0.25);

        // 叛变检测
        let betrayed = false;
        if (hasSpy && realHeroes.length > 0) {
            const totalHeroHp = realHeroes.reduce((s, h) => s + h.hp, 0);
            const spyTotalHp = spies.reduce((s, h) => s + h.hp, 0);
            if (totalHeroHp < (spyTotalHp + monster.hp) * 0.25) {
                betrayed = true;
                combatLog.push(`⚠️ ${spies.map(s => s.name).join('、')} 叛变了！转而攻击勇者！`);
            }
        }

        // 收集所有参与者并按速度排序
        const actors = [];
        for (const member of squad) {
            const statusFx = this._applyStatusAilmentEffects(member);
            let spd = member.cflag[13] || 10 + member.level * 2;
            spd = Math.max(1, Math.floor(spd * (1 + statusFx.spdMod)));
            actors.push({
                type: 'hero',
                entity: member,
                spd: spd,
                baseSpd: member.cflag[13] || 10 + member.level * 2,
                name: member.name,
                isSpy: !!member.talent[201]
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
                                const spyAtk = Math.floor((hero.cflag[11] || 20) * 0.5);
                                const dmg = Math.max(1, spyAtk - (target.cflag[12] || 15));
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
                    let heroBaseAtk = (hero.cflag[11] || 20);
                    let heroBaseDef = (hero.cflag[12] || 15);
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
                    if (cls && HEALER_CLASS_IDS.includes(hero.cflag[950])) {
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
                                if (cured.length > 0) combatLog.push(`  → ${cured.join('、')}`);
                            }
                            if (skillResult.invincible) {
                                combatLog.push(`  → ${hero.name}进入无敌状态`);
                            }
                            continue;
                        }
                    }

                    // 普通攻击
                    const gBonus = GearSystem.applyGearBonus(hero, !!hero.talent[200]);
                    const heroAtk = Math.floor(((hero.cflag[11] || 20) + (gBonus.atk || 0)) * attrMod);
                    const dmg = Math.max(1, heroAtk - monster.def);
                    monHp -= dmg;
                    combatLog.push(`【${rounds}回合】${hero.name}攻击${monster.name}，造成${dmg}伤害`);

                } else if (actor.type === 'monster' && monHp > 0) {
                    let aliveTargets = squad.filter(h => h.hp > 0);
                    if (aliveTargets.length === 0) break;
                    const realTargets = aliveTargets.filter(h => !h.talent[201]);
                    const target = realTargets.length > 0
                        ? realTargets.reduce((min, h) => h.hp < min.hp ? h : min, realTargets[0])
                        : aliveTargets.reduce((min, h) => h.hp < min.hp ? h : min, aliveTargets[0]);
                    const monAtk = Math.floor(monster.atk * (hasSpy && !betrayed ? 1.25 : 1));
                    const tBonus = GearSystem.applyGearBonus(target, !!target.talent[200]);
                    const targetDef = (target.cflag[12] || 15) + (tBonus.def || 0);
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

        const victory = monHp <= 0;
        const allDefeated = squad.filter(h => !h.talent[201]).every(h => h.hp <= 0);
        const survivors = squad.filter(h => h.hp > 0);

        let drop = null;
        if (victory) {
            const expPerMember = Math.floor(monster.level * 10 / Math.max(1, survivors.filter(h => !h.talent[201]).length));
            for (const hero of survivors) {
                if (!hero.talent[201]) hero.exp[0] = (hero.exp[0] || 0) + expPerMember;
            }
            combatLog.push(`【胜利】小队击败了${monster.name}(战斗${rounds}回合) 每人获得${expPerMember}EXP`);
            if (Math.random() < 0.30) {
                const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
                const slot = slotTypes[RAND(slotTypes.length)];
                drop = GearSystem.generateGear(slot, monster.level);
                const lucky = survivors[RAND(survivors.length)];
                const r = GearSystem.equipItem(lucky, drop);
                if (r.success) combatLog.push(`🎁 ${lucky.name}获得了${r.msg}`);
            }
        } else if (allDefeated) {
            combatLog.push(`【败北】小队被${monster.name}全灭了...`);
        } else {
            combatLog.push(`【撤退】小队从战斗中撤退了`);
        }

        return { victory, defeated: allDefeated, escaped: !victory && !allDefeated, rounds, combatLog, monster, betrayed };
    }
