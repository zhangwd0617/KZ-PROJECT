
    // 团队战斗：双方均可组队（最多3标准位+1临时位）
    _doTeamCombat(leftTeam, rightTeam, options = {}) {
        const maxRounds = options.maxRounds || 15;
        const combatLog = [];
        let rounds = 0;

        const wrapUnit = (entity, teamSide, index) => {
            const isMonster = !entity.talent;
            const isExHero = entity.talent && entity.talent[200];
            const isSpy = entity.talent && entity.talent[201];
            const gBonus = isMonster ? {} : GearSystem.applyGearBonus(entity, !!isExHero);
            const baseAtk = isMonster ? (entity.atk || 0) : ((entity.cflag[11] || 20) + (gBonus.atk || 0));
            const baseDef = isMonster ? (entity.def || 0) : ((entity.cflag[12] || 15) + (gBonus.def || 0));
            const baseSpd = isMonster ? (entity.spd || 0) : ((entity.cflag[13] || 10) + entity.level * 2);
            const statusFx = isMonster ? { atkMod:0, defMod:0, spdMod:0, dotHp:0, dotMp:0, actionBlock:0, friendlyFire:0 } : this._applyStatusAilmentEffects(entity);
            return {
                id: teamSide + '_' + index,
                name: entity.name || '???',
                entity: entity,
                team: teamSide,
                isMonster: isMonster,
                isExHero: !!isExHero,
                isSpy: !!isSpy,
                hp: entity.hp || 0,
                maxHp: entity.maxHp || entity.hp || 1,
                mp: isMonster ? (entity.mp || 0) : (entity.mp || 0),
                maxMp: isMonster ? (entity.mp || 0) : (entity.maxMp || entity.mp || 1),
                baseAtk: Math.max(1, Math.floor(baseAtk * (1 + statusFx.atkMod))),
                baseDef: Math.max(0, Math.floor(baseDef * (1 + statusFx.defMod))),
                baseSpd: Math.max(1, Math.floor(baseSpd * (1 + statusFx.spdMod))),
                atkMod: 0, defMod: 0, spdMod: 0,
                buffTurns: 0,
                invincible: 0,
                statusFx: statusFx,
                classId: isMonster ? 0 : (entity.cflag[950] || 0),
                level: entity.level || 1
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
                combatLog.push(`💀 ${spies.map(s => s.name).join('、')} 叛变了！转而攻击同伴！`);
            }
        }

        let allActors = [...leftUnits, ...rightUnits];

        while (rounds < maxRounds) {
            const aliveLeft = leftUnits.filter(u => u.hp > 0);
            const aliveRight = rightUnits.filter(u => u.hp > 0);
            if (aliveLeft.length === 0 || aliveRight.length === 0) break;

            rounds++;
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
                                if (cured.length > 0) combatLog.push(`  → ${cured.join('、')}`);
                            }
                            continue;
                        }
                    }
                }

                if (!actor.isMonster && HEALER_CLASS_IDS && HEALER_CLASS_IDS.includes(actor.classId)) {
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
        const victory = aliveRight.length === 0 && aliveLeft.length > 0;
        const defeated = aliveLeft.length === 0;
        const realLeftAlive = leftUnits.filter(u => u.hp > 0 && !u.isSpy);

        for (const u of leftUnits) { u.entity.hp = u.hp; u.entity.mp = u.mp; }
        for (const u of rightUnits) { u.entity.hp = u.hp; u.entity.mp = u.mp; }

        let drop = null;
        if (victory && aliveLeft.length > 0) {
            const highestLevelMonster = rightUnits.reduce((max, u) => u.level > max.level ? u : max, rightUnits[0]);
            const expPerMember = Math.floor(highestLevelMonster.level * 10 / Math.max(1, realLeftAlive.length));
            for (const u of realLeftAlive) {
                u.entity.exp[0] = (u.entity.exp[0] || 0) + expPerMember;
            }
            combatLog.push(`【胜利】${aliveLeft.map(u => u.name).join('、')}击败了敌人(战斗${rounds}回合) 每人获得${expPerMember}EXP`);
            const elite = rightUnits.find(u => u.entity.eliteType);
            let dropChance = 0.30;
            let rarityBonus = 0;
            let dropLevel = highestLevelMonster.level;
            if (elite) {
                dropChance = 1.0;
                rarityBonus = ELITE_TYPE_DEFS[elite.entity.eliteType].dropRarityBonus;
                if (elite.entity.eliteType === 'overlord' && RAND(100) < 50) {
                    dropLevel += 5;
                }
            }
            if (Math.random() < dropChance) {
                const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
                const slot = slotTypes[RAND(slotTypes.length)];
                let rarity = GearSystem._rollRarity ? GearSystem._rollRarity() : 1;
                rarity = Math.min(5, rarity + rarityBonus);
                drop = GearSystem.generateGear(slot, dropLevel, rarity);
                const lucky = aliveLeft[RAND(aliveLeft.length)];
                const r = GearSystem.equipItem(lucky.entity, drop);
                if (r.success) combatLog.push(`🎁 ${lucky.name}获得了${r.msg}`);
            }
        } else if (defeated) {
            combatLog.push(`【败北】${leftUnits.map(u => u.name).join('、')}被全灭了...`);
        } else {
            combatLog.push(`【撤退】从战斗中撤退了`);
        }

        return { victory, defeated, escaped: !victory && !defeated, rounds, combatLog, leftTeam: leftUnits, rightTeam: rightUnits, drop, betrayed };
    }
