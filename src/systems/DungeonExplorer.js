/**
 * DungeonExplorer — extracted from Game.js
 */
Game.prototype.getFloorLevel = function(floorId) {
        // floorLevel存储在flag中 flag[200 + floorId] = level
        return this.flag[200 + floorId] || 0;
    }

Game.prototype.canUpgradeFloor = function(floorId) {
        const def = DUNGEON_FLOOR_DEFS[floorId];
        if (!def) return { ok: false, reason: "层不存在" };
        const curLv = this.getFloorLevel(floorId);
        if (curLv >= 3) return { ok: false, reason: "已达最高等级Lv.3" };
        const cost = def.upgradeCost[curLv];
        if (this.money < cost) return { ok: false, reason: `需要${cost}G` };
        return { ok: true, cost: cost, nextLv: curLv + 1 };
    }

Game.prototype.upgradeFloor = function(floorId) {
        const check = this.canUpgradeFloor(floorId);
        if (!check.ok) {
            UI.showToast(check.reason, "danger");
            return false;
        }
        this.money -= check.cost;
        this.flag[200 + floorId] = check.nextLv;
        const def = DUNGEON_FLOOR_DEFS[floorId];
        const up = def.upgrades[check.nextLv - 1];
        this.addFame(10); // 地下城升级 +10 声望
        UI.showToast(`【${def.name}】升到Lv.${check.nextLv} ${up.description}（魔王声望 +10）`);
        return true;
    }

Game.prototype.getDungeonMaxDepth = function() {
        // 解锁深度由设施等级决定，默认1层
        let max = 1;
        if (this.getFacilityLevel(3) >= 1) max = 3;  // 肉体改造室解锁深层
        if (this.getFacilityLevel(3) >= 2) max = 5;
        if (this.getFacilityLevel(3) >= 3) max = 7;
        if (this.getFacilityLevel(3) >= 4) max = 10;
        return max;
    }

    // 获取勇者当前所在层（入侵时从第1层开始）
Game.prototype.getHeroFloor = function(hero) {
        return hero.cflag[CFLAGS.HERO_FLOOR] || 1;
    }

    // 获取勇者当前层内进度(0-100)
Game.prototype.getHeroProgress = function(hero) {
        return hero.cflag[CFLAGS.HERO_PROGRESS] || 0;
    }

    // 计算策略对勇者速度的影响
Game.prototype.moveHeroDaily = function(hero) {
        const floorId = this.getHeroFloor(hero);
        if (floorId > 10) {
            return { action: 'reach_throne', hero, message: '勇者到达魔王宫殿！' };
        }

        let progress = this.getHeroProgress(hero);
        const floorLv = this.getFloorLevel(floorId);

        // 基础侵略进度：随等级上升，上限20%
        let moveSpeed;
        if (hero.level <= 50) {
            moveSpeed = 5 + Math.floor((hero.level - 1) * 15 / 49);
        } else {
            moveSpeed = 20; // 上限20%
        }

        // 层升级减缓
        if (floorLv >= 1) moveSpeed -= 1;
        if (floorLv >= 2) moveSpeed -= 1;
        if (floorLv >= 3) moveSpeed -= 1;

        // 高层地下城额外减缓侵略度（第6层起）
        if (floorId >= 6) {
            moveSpeed -= (floorId - 5); // 6层1%, 7层2%, 8层3%, 9层4%, 10层5%
        }

        // === 任务状态检查 ===
        const taskType = hero.cflag[CFLAGS.HERO_TASK_TYPE] || 0;
        const taskTargetFloor = hero.cflag[CFLAGS.HERO_REASON] || 0;
        const hpPct = hero.maxHp > 0 ? hero.hp / hero.maxHp : 1;

        // 回城恢复：HP<30%时自动触发
        if (hpPct < 0.3 && taskType !== 3) {
            hero.cflag[CFLAGS.HERO_TASK_TYPE] = 3;
            hero.cflag[CFLAGS.HERO_REASON] = 0;
            hero.cflag[CFLAGS.HERO_ORIGIN] = 0;
            hero.cflag[CFLAGS.HERO_FAMILY] = 0;
            hero.cflag[CFLAGS.HERO_TASK_STATUS] = 0;
            hero.cstr[CSTRS.TASK_DESC] = '受到重创，紧急返回城镇恢复伤势';
        }

        if (taskType === 3) {
            // 回城恢复：强制向后移动
            moveSpeed = -Math.max(5, Math.floor(hero.level / 5));
            // 如果已在第1层且进度接近起点，直接回城
            if (floorId <= 1 && progress <= Math.abs(moveSpeed)) {
                hero.hp = Math.min(hero.maxHp, hero.hp + Math.floor(hero.maxHp * 0.5));
                hero.mp = Math.min(hero.maxMp, hero.mp + Math.floor(hero.maxMp * 0.3));
                this.clearHeroTask(hero);
                this._markDailyEventTriggered(hero);
                return { action: 'retreat_to_town', hero, results: { events: [{ type: 'event', name: '回城恢复', description: '受到重创后成功返回城镇恢复', icon: '🏥' }] }, moveSpeed, taskComplete: true };
            }
        }

        // === 安营扎寨判定 ===
        if (this._shouldCamp(hero)) {
            const campResult = this._doCamp(hero, moveSpeed);
            if (campResult) {
                // 将安营日志加入探索结果
                const campExplore = { speedMod: 0, hpDmg: 0, mpDmg: 0, results: { camp: campResult, events: [] } };
                campExplore.results.events.push(...campResult.logs);
                this._markDailyEventTriggered(hero);
                return { action: 'camp', hero, results: campExplore.results, moveSpeed: 0, campResult };
            }
        }

        // 探索当前层，触发事件/策略/环境效果
        const explore = this.exploreFloor(hero);

        // 应用策略/事件造成的速度和伤害        moveSpeed += explore.speedMod;
        if (explore.hpDmg > 0) {
            hero.hp = Math.max(0, hero.hp - explore.hpDmg);
        }
        if (explore.mpDmg > 0) {
            hero.mp = Math.max(0, hero.mp - explore.mpDmg);
        }

        // === 守关Boss战判定 ===
        const oldProgress = this.getHeroProgress(hero);
        if (!explore.results._defeated && oldProgress < 100 && oldProgress + moveSpeed >= 100) {
            const bossMonster = this._spawnMonster(floorId, 'overlord');
            let bossCombat = null;
            const squadId = hero.cflag[CFLAGS.SQUAD_ID];
            if (squadId && hero.cflag[CFLAGS.SQUAD_LEADER] === 1) {
                const squad = this.invaders.filter(h => h.cflag[CFLAGS.SQUAD_ID] === squadId);
                const reinforcements = this._findReinforcements(squad, floorId, oldProgress, 'hero');
                if (reinforcements.length > 0) {
                    for (const r of reinforcements) squad.push(r);
                }
                bossCombat = this._doTeamCombat(squad, [bossMonster]);
            } else if (!squadId) {
                const reinforcements = this._findReinforcements([hero], floorId, oldProgress, 'hero');
                const leftTeam = [hero, ...reinforcements];
                bossCombat = this._doTeamCombat(leftTeam, [bossMonster]);
            }
            if (bossCombat) {
                explore.results.leftTeam = bossCombat.leftTeam;
                explore.results.rightTeam = bossCombat.rightTeam;
                explore.results.events = explore.results.events || [];
                explore.results.events.push({
                    type: 'boss',
                    name: `⚔️ 守关Boss战`,
                    description: `${bossMonster.icon} ${bossMonster.name} Lv.${bossMonster.level}`,
                    icon: bossMonster.icon,
                    combatLog: bossCombat.combatLog,
                    victory: bossCombat.victory,
                    defeated: bossCombat.defeated
                });
                if (bossCombat.victory) {
                    // 检查讨伐任务完成
                    if ((hero.cflag[CFLAGS.HERO_TASK_TYPE] || 0) === 1 && (hero.cflag[CFLAGS.HERO_REASON] || 0) === floorId) {
                        hero.cflag[CFLAGS.HERO_TASK_STATUS] = 1;
                        hero.cstr[CSTRS.TASK_DESC] += ' 【讨伐任务完成，准备返回城镇】';
                    }
                    // 通关地下城 + 击败Boss 声望奖励
                    const bossFame = 10 + floorId * 5;
                    hero.fame += bossFame;

                    // === V6.0: 守关Boss宝箱掉落 ===
                    const badgeEvents = this._generateBossChestLoot(bossCombat, floorId);
                    if (badgeEvents.length > 0) {
                        explore.results.events.push(...badgeEvents);
                    }

                    // 进入下一层
                    hero.cflag[CFLAGS.HERO_FLOOR] = floorId + 1;
                    hero.cflag[CFLAGS.HERO_PROGRESS] = 0;
                    hero.cflag[503] = 0;
                    return { action: 'boss_victory', hero, floor: floorId + 1, results: explore.results, moveSpeed };
                } else {
                    // Boss战败或撤退：标记为 defeated
                    explore.results._defeated = true;
                    explore.results._monster = bossMonster;
                }
            }
        }

        // 检查状态，判断是否主动撤退
        const mpPct = hero.maxMp > 0 ? hero.mp / hero.maxMp : 1;

        // 如果被击败，进行逃跑判定
        if (explore.results._defeated) {
            const captureResult = this._processCapture(hero, explore.results._monster);

            if (captureResult.type === 'escape') {
                // 逃跑成功：侵略度-50%，不足则回上一层0%
                if (progress >= 50) {
                    hero.cflag[CFLAGS.HERO_PROGRESS] = progress - 50;
                    // 恢复少量状态以便继续入侵                    hero.hp = Math.max(1, Math.floor(hero.maxHp * 0.15));
                    hero.mp = Math.max(1, Math.floor(hero.maxMp * 0.1));
                    hero.cflag[CFLAGS.SPY_TARGET] = 1; // 被击败后保持低调
                    this._markDailyEventTriggered(hero);
                    return { action: 'defeat_escape', hero, results: explore.results, captureResult, moveSpeed: -50 };
                } else if (floorId > 1) {
                    hero.cflag[CFLAGS.HERO_FLOOR] = floorId - 1;
                    hero.cflag[CFLAGS.HERO_PROGRESS] = 50;
                    hero.hp = Math.max(1, Math.floor(hero.maxHp * 0.15));
                    hero.mp = Math.max(1, Math.floor(hero.maxMp * 0.1));
                    hero.cflag[CFLAGS.SPY_TARGET] = 1; // 被击败后保持低调
                    this._markDailyEventTriggered(hero);
                    return { action: 'defeat_escape', hero, floor: floorId - 1, results: explore.results, captureResult, moveSpeed: -100 };
                } else {
                    // 第一层且进度<50%，只能回小镇
                    hero.cflag[CFLAGS.SPY_TARGET] = 1; // 被击败后保持低调
                    this._markDailyEventTriggered(hero);
                    return { action: 'retreat_to_town', hero, results: explore.results, captureResult, moveSpeed: -100 };
                }
            }

            // 逃跑失败：俘虏投降/入狱
            this._markDailyEventTriggered(hero);
            return { action: 'captured', hero, monster: explore.results._monster, captureResult, results: explore.results, moveSpeed: -100 };
        }

        const retreatChance = this._calcRetreatChance(hero, hpPct, mpPct);
        if (retreatChance > 0 && RAND(100) < retreatChance) {
            moveSpeed = -5; // 主动往回走
        }

        // 检查楼层设施
        const facilityEvents = this._checkFloorFacilities(hero, oldProgress, oldProgress + moveSpeed, floorId, explore);
        if (facilityEvents.length > 0) {
            explore.results.events = explore.results.events || [];
            explore.results.events.push(...facilityEvents);
        }
        if (facilityEvents._haltMove) {
            moveSpeed = 0;
        }

        // 检查进度宝箱（在更新进度前记录旧进度）
        const chestEvents = this._checkProgressChests(hero, oldProgress, oldProgress + moveSpeed, floorId);
        if (chestEvents.length > 0) {
            explore.results.chests = chestEvents;
        }

        // 更新进度
        progress += moveSpeed;

        // 处理边界情况
        if (progress >= 100) {
            hero.cflag[CFLAGS.HERO_FLOOR] = floorId + 1;
            hero.cflag[CFLAGS.HERO_PROGRESS] = 0;
            hero.cflag[503] = 0; // 重置新楼层宝箱标记
            return { action: 'next_floor', hero, floor: floorId + 1, results: explore.results, moveSpeed };
        } else if (progress <= 0) {
            if (floorId <= 1) {
                return { action: 'retreat_to_town', hero, results: explore.results, moveSpeed };
            } else {
                hero.cflag[CFLAGS.HERO_FLOOR] = floorId - 1;
                hero.cflag[CFLAGS.HERO_PROGRESS] = 80;
                return { action: 'prev_floor', hero, floor: floorId - 1, results: explore.results, moveSpeed };
            }
        } else {
            hero.cflag[CFLAGS.HERO_PROGRESS] = progress;
            return { action: 'move', hero, progress, results: explore.results, moveSpeed };
        }
    }

    // 检查进度宝箱：25%/50%/75%高级宝箱，100%传说宝箱
Game.prototype.exploreFloor = function(hero) {
        const floorId = this.getHeroFloor(hero);
        const floorDef = DUNGEON_FLOOR_DEFS[floorId];
        const floorLv = this.getFloorLevel(floorId);
        const results = [];
        let speedMod = 0;
        let hpDmg = 0;
        let mpDmg = 0;

        // 1. 层环境效果
        if (floorLv >= 1) {
            const up = floorDef.upgrades[0];
            results.push({ type: "env", name: up.name, description: up.description });
            speedMod -= 1;
        }

        // 2. 触发御敌策略（如果有）
        if (this.strategies.length > 0) {
            const sid = this.strategies[RAND(this.strategies.length)];
            const sdef = STRATEGY_DEFS[sid];
            results.push({ type: "strategy", name: sdef.name, description: sdef.description, icon: sdef.icon });
            const mod = this._getStrategySpeedMod(sdef);
            speedMod += mod.speed;
            hpDmg += mod.hpDmg;
            mpDmg += mod.mpDmg;
        }

        // 3. 随机事件或遇敌(35%事件 65%遇敌)
        // 每日事件限制：已触发事件的勇者/小队跳过
        const squadId = hero.cflag[CFLAGS.SQUAD_ID];
        const isLeader = hero.cflag[CFLAGS.SQUAD_LEADER] === 1;
        const dailyEventBlocked = squadId ? !isLeader : this._hasTriggeredDailyEvent(hero);
        // 非队长成员始终由队长统一处理；队长/单人检查标记
        const canTriggerEvent = !dailyEventBlocked && (!squadId || isLeader);

        if (canTriggerEvent) {
            const roll = RAND(100);
            // 被击败后保持低调：遇敌概率最高10%
            const encounterChance = hero.cflag[CFLAGS.SPY_TARGET] ? 10 : 65;
            if (roll < encounterChance) {
                // 遇敌战斗：90%普通怪物，10%首领级精英
                let monster;
                if (RAND(100) < 10) {
                    monster = this._spawnMonster(floorId, 'chief');
                } else {
                    monster = this._spawnMonster(floorId, 'normal');
                }
                if (monster) {

                    if (squadId && isLeader) {
                    // 队长：触发小队战斗
                    const squad = this.invaders.filter(h => h.cflag[CFLAGS.SQUAD_ID] === squadId);
                    const heroProgress = this.getHeroProgress(hero);
                    const reinforcements = this._findReinforcements(squad, floorId, heroProgress, 'hero');
                    if (reinforcements.length > 0) {
                        for (const r of reinforcements) squad.push(r);
                    }
                    const combat = this._doTeamCombat(squad, [monster]);
                    results.push({
                        type: "scombat",
                        name: `小队遭遇${monster.name}`,
                        description: `${monster.icon} ${monster.description}`,
                        icon: "👥",
                        combatLog: combat.combatLog,
                        victory: combat.victory,
                        defeated: combat.defeated,
                        monster: monster,
                        leftTeam: combat.leftTeam,
                        rightTeam: combat.rightTeam
                    });
                    // 标记所有成员已战斗
                    for (const member of squad) {
                        member.cflag[902] = 1;
                    }
                    if (combat.victory) {
                        speedMod -= 1;
                        for (const member of squad) {
                            if (member.hp > 0) {
                                member.hp = Math.min(member.maxHp, member.hp + Math.floor(member.maxHp * 0.03));
                                member.mp = Math.min(member.maxMp, member.mp + Math.floor(member.maxMp * 0.03));
                            }
                        }
                        // 击败魔物获得声望
                        const monFame = Math.max(1, Math.floor((monster.level || 1) / 2));
                        for (const member of squad) { member.fame += monFame; }
                        // 共度难关：击败精英怪物时小队成员关系变好
                        if (monster && (monster.eliteType === 'chief' || monster.eliteType === 'overlord')) {
                            for (let si = 0; si < squad.length; si++) {
                                for (let sj = si + 1; sj < squad.length; sj++) {
                                    const rel = this._getHeroRelation(squad[si], squad[sj]);
                                    if (rel.level < 4 && RAND(100) < 40) {
                                        this._setHeroRelation(squad[si], squad[sj], 1, 'defeat_elite');
                                    }
                                }
                            }
                        }
                        // 检查委托：击败精英（以队长为准）
                        this._checkCommissionComplete(hero, 'combat', { floorId, monster });
                    } else if (combat.defeated) {
                        speedMod = -20;
                        // 一意孤行判定：小队HP很低时仍被击败，关系恶化
                        const totalHpRatio = squad.reduce((s, m) => s + (m.maxHp > 0 ? m.hp / m.maxHp : 1), 0);
                        if (totalHpRatio / squad.length < 0.3) {
                            for (let si = 0; si < squad.length; si++) {
                                for (let sj = si + 1; sj < squad.length; sj++) {
                                    this._setHeroRelation(squad[si], squad[sj], -1, 'reckless');
                                }
                            }
                        }
                        for (const member of squad) {
                            member.hp = Math.max(1, member.hp);
                        }
                        results._defeated = true;
                        results._monster = monster;
                    } else {
                        speedMod -= 2;
                        hpDmg += Math.floor(monster.atk * 0.3);
                        mpDmg += Math.floor(monster.atk * 0.2);
                    }
                } else {
                    // 单人战斗 —— 检查是否有关系好的勇者拔刀相助
                    let helpers = [];
                    const otherHeroes = this.invaders.filter(h => h !== hero && h.hp > 0 && this.getHeroFloor(h) === floorId && !h.cflag[912]);
                    for (const other of otherHeroes) {
                        const rel = this._getHeroRelation(hero, other);
                        if (rel.level >= 3 && RAND(100) < (rel.level >= 4 ? 50 : 30)) {
                            helpers.push(other);
                            this._setHeroRelation(hero, other, 1, 'help_combat');
                        }
                    }
                    if (helpers.length > 0) {
                        // 拔刀相助：关系好的勇者加入战斗
                        const squad = [hero, ...helpers];
                        const combat = this._doTeamCombat(squad, [monster]);
                        const helperNames = helpers.map(h => h.name).join(',');
                        results.push({
                            type: "scombat",
                            name: `拔刀相助：遭遇${monster.name}`,
                            description: `${hero.name}遇险，${helperNames}前来相助！${monster.icon} ${monster.description}`,
                            icon: "🤝",
                            combatLog: combat.combatLog,
                            victory: combat.victory,
                            defeated: combat.defeated,
                            monster: monster,
                            leftTeam: combat.leftTeam,
                            rightTeam: combat.rightTeam,
                            isSquad: true,
                            heroName: hero.name,
                            squad: squad
                        });
                        if (combat.victory) {
                            speedMod -= 1;
                            for (const member of squad) {
                                if (member.hp > 0) {
                                    member.hp = Math.min(member.maxHp, member.hp + Math.floor(member.maxHp * 0.03));
                                    member.mp = Math.min(member.maxMp, member.mp + Math.floor(member.maxMp * 0.03));
                                }
                            }
                            this._checkCommissionComplete(hero, 'combat', { floorId, monster });
                        } else if (combat.defeated) {
                            speedMod = -20;
                            for (const member of squad) {
                                member.hp = Math.max(1, member.hp);
                            }
                            results._defeated = true;
                            results._monster = monster;
                        } else {
                            speedMod -= 2;
                            hpDmg += Math.floor(monster.atk * 0.3);
                            mpDmg += Math.floor(monster.atk * 0.2);
                        }
                    } else {
                        // 真正的单人战斗
                        const reinforcements = this._findReinforcements([hero], floorId, this.getHeroProgress(hero), 'hero');
                        const leftTeam = [hero, ...reinforcements];
                        const combat = this._doTeamCombat(leftTeam, [monster]);
                        results.push({
                            type: "combat",
                            name: `遭遇${monster.name}`,
                            description: `${monster.icon} ${monster.description}`,
                            icon: monster.icon,
                            combatLog: combat.combatLog,
                            victory: combat.victory,
                            defeated: combat.defeated,
                            monster: monster,
                            leftTeam: combat.leftTeam,
                            rightTeam: combat.rightTeam
                        });
                        if (combat.victory) {
                            speedMod -= 1;
                            hero.hp = Math.min(hero.maxHp, hero.hp + Math.floor(hero.maxHp * 0.03));
                            hero.mp = Math.min(hero.maxMp, hero.mp + Math.floor(hero.maxMp * 0.03));
                            // 击败魔物获得声望
                            hero.fame += Math.max(1, Math.floor((monster.level || 1) / 2));
                            // 检查委托：击败精英
                            this._checkCommissionComplete(hero, 'combat', { floorId, monster });
                        } else if (combat.defeated) {
                            speedMod = -20;
                            hero.hp = 1;
                            results._defeated = true;
                            results._monster = monster;
                        } else {
                            speedMod -= 2;
                            hpDmg += Math.floor(monster.atk * 0.3);
                            mpDmg += Math.floor(monster.atk * 0.2);
                        }
                    }
                }
            }
        } else {
            // 随机事件
            const event = this.processDungeonEvent(hero);
            if (event) {
                results.push({ type: "event", name: event.name, description: event.description, icon: event.icon });
                if (event.type === 'damage' || event.type === 'combat') {
                    speedMod -= 2;
                    hpDmg += (event.value || 50);
                } else if (event.type === 'debuff') {
                    speedMod -= 2;
                } else if (event.type === 'heal') {
                    speedMod += 1;
                    hero.hp = Math.min(hero.maxHp, hero.hp + (event.value || 50));
                } else if (event.type === 'healer') {
                    speedMod += 1;
                    const healAmt = Math.floor(hero.maxHp * (event.value || 30) / 100);
                    hero.hp = Math.min(hero.maxHp, hero.hp + healAmt);
                    const cured = this._tryCureStatusAilment(hero, "healer_event");
                    results.push({ type: "healer", name: "治疗师的帮助", description: `恢复${healAmt}HP` + (cured.length > 0 ? `，解除：${cured.join(',')}` : ''), icon: "💊" });
                } else if (event.type === 'curse') {
                    speedMod -= 2;
                    this._addStatusAilment(hero, "curse", 5);
                    results.push({ type: "curse", name: "诅咒之泉", description: "勇者被诅咒了！", icon: "🌑" });
                } else if (event.type === 'aphrodisiac') {
                    speedMod -= 1;
                    this._addStatusAilment(hero, "aphrodisiac", 4);
                    results.push({ type: "aphrodisiac", name: "媚药雾气", description: "勇者吸入了媚药雾气！", icon: "💕" });
                } else if (event.type === 'treasure') {
                    // 宝箱事件获得金币（新平衡）
                    const goldGain = Math.floor((event.value || 100) * floorId * floorId * 0.5);
                    hero.gold += goldGain;
                    results.push({ type: "gold", name: "发现财宝", description: `获得${goldGain}G`, icon: "💰", amount: goldGain });
                }
            }
            // 每层10%概率触发隐藏商店
            if (Math.random() < 0.10) {
                const shopResult = this._triggerHiddenShop(hero, floorId);
                if (shopResult) {
                    results.push(shopResult);
                }
            }
            // 5%概率触发奸商事件（与隐藏商店互斥，但如果都触发则优先显示奸商）
            if (Math.random() < 0.05) {
                const swindlerResult = this._triggerSwindler(hero, floorId);
                if (swindlerResult) {
                    results.push(swindlerResult);
                }
            }
        }
            // 标记勇者/小队今天已触发事件
            this._markDailyEventTriggered(hero);
        }

        // 4. 层负面效果（Lv2+）
        if (floorLv >= 2) {
            const up = floorDef.upgrades[1];
            results.push({ type: "trap", name: up.name, description: up.description });
            speedMod -= 1;
        }

        // === 委托完成检查（探索类）===
        this._checkCommissionComplete(hero, 'explore', { floorId });

        return { results, speedMod, hpDmg, mpDmg };
    }

Game.prototype._checkProgressChests = function(hero, oldProgress, newProgress, floorId) {
        const events = [];
        // 勇者用 cflag[503]，奴隶/前勇者用 cflag[CFLAGS.DESIRE]
        const flagSlot = hero.talent[200] ? 704 : 503;
        const mask = hero.cflag[flagSlot] || 0;
        const thresholds = [
            { pct: 25, bit: 1, type: 'advanced' },
            { pct: 50, bit: 2, type: 'advanced' },
            { pct: 75, bit: 4, type: 'advanced' },
            { pct: 100, bit: 8, type: 'legendary' }
        ];
        for (const t of thresholds) {
            if ((mask & t.bit) !== 0) continue; // 已开启            // 前勇者无法打开关底(100%)传说宝箱
            if (hero.talent[200] && t.pct === 100) continue;
            // 检查是否经过了该阈值
            const crossed = (oldProgress < t.pct && newProgress >= t.pct) || (oldProgress > t.pct && newProgress <= t.pct);
            if (!crossed) continue;
            // 进度宝箱（25%/50%/75%）全局共享：检查是否已被其他勇者获取
            if (t.type !== 'legendary') {
                const state = this._floorChestState[floorId];
                if (state && (state.takenMask & t.bit) !== 0) {
                    // 该宝箱已被拿走，仅清除个人掩码位（防止下次再提示）
                    hero.cflag[flagSlot] = (hero.cflag[flagSlot] || 0) | t.bit;
                    continue;
                }
                // 标记全局已被获取
                if (!this._floorChestState[floorId]) {
                    this._floorChestState[floorId] = { refreshDay: this.day + 10, takenMask: 0 };
                }
                this._floorChestState[floorId].takenMask |= t.bit;
            }
            hero.cflag[flagSlot] = (hero.cflag[flagSlot] || 0) | t.bit;
            // 宝箱金币奖励（新平衡：与楼层²挂钩）
            const goldBase = t.type === 'legendary' ? 500 : 100;
            const goldGain = Math.floor(goldBase * floorId * floorId);
            hero.gold += goldGain;
            const item = this._generateChestLoot(hero.level, t.type, hero, floorId);
            let equipResult = null;
            let disputeText = '';
            // 分赃不均判定：同楼层有其他勇者且获得高级装备时（受每日事件限制）
            if (item && t.type === 'advanced' && !this._hasTriggeredDailyEvent(hero)) {
                const others = this.invaders.filter(h => h !== hero && h.hp > 0 && this.getHeroFloor(h) === floorId);
                let hasDispute = false;
                for (const other of others) {
                    const rel = this._getHeroRelation(hero, other);
                    // 关系一般的勇者更容易因为分赃不均产生矛盾
                    if (rel.level <= 3 && RAND(100) < 20 + (3 - rel.level) * 10) {
                        this._setHeroRelation(hero, other, -1, 'loot_dispute');
                        disputeText += `（与${other.name}因分赃不均产生矛盾！）`;
                        hasDispute = true;
                    }
                }
                if (hasDispute) {
                    this._markDailyEventTriggered(hero);
                }
            }
            if (item) {
                const r = GearSystem.equipItem(hero, item);
                equipResult = r;
                events.push({
                    type: t.type,
                    threshold: t.pct,
                    item: GearSystem.getGearDesc(item),
                    success: r.success,
                    msg: r.msg + disputeText,
                    curseTriggered: r.curseTriggered,
                    gold: goldGain
                });
            } else {
                events.push({
                    type: t.type,
                    threshold: t.pct,
                    item: null,
                    success: false,
                    msg: `获得${goldGain}G` + disputeText,
                    curseTriggered: false,
                    gold: goldGain
                });
            }
        }
        return events;
    }

    // V6.0: 守关Boss宝箱掉落 — 晋升徽章（每箱仅1个）+ 转职徽章（10%）+ 金币 + 装备
    Game.prototype._generateBossChestLoot = function(bossCombat, floorId) {
        const events = [];
        const survivors = (bossCombat.leftTeam || []).filter(u => u.hp > 0 && !u.isSpy && !u.isMonster && !u.isMaster).map(u => u.entity);
        if (survivors.length === 0) return events;

        // 1. 晋升徽章 — 每箱只掉1个！
        const lockLevel = floorId * 20; // 第1层=20, 第2层=40, ...
        const badgeDef = window.BADGE_DEFS ? window.BADGE_DEFS[lockLevel] : null;
        if (badgeDef) {
            // 只有1个幸存者能获得晋升徽章
            const lucky = survivors[RAND(survivors.length)];
            const badgeItem = {
                id: badgeDef.id,
                name: badgeDef.name,
                icon: badgeDef.icon,
                type: "badge",
                badgeType: "promotion",
                lockLevel: lockLevel,
                desc: badgeDef.desc,
                sellPrice: badgeDef.sellPrice
            };
            this._giveItem(lucky, badgeItem);

            // 未获得者记录（用于后续AI行为）
            for (const s of survivors) {
                if (s !== lucky) {
                    if (!s._missedBadges) s._missedBadges = [];
                    s._missedBadges.push(lockLevel);
                }
            }

            // 分赃不均：小队成员关系恶化
            if (survivors.length > 1) {
                for (let i = 0; i < survivors.length; i++) {
                    for (let j = i + 1; j < survivors.length; j++) {
                        const a = survivors[i], b = survivors[j];
                        if (a === lucky || b === lucky) {
                            this._setHeroRelation(a, b, -1, 'badge_dispute');
                        }
                    }
                }
            }

            events.push({
                type: 'boss_chest',
                name: `📦 关底宝箱 — ${badgeDef.name}`,
                description: `${lucky.name}获得了${badgeDef.name}！（突破Lv.${lockLevel}等级锁）${survivors.length > 1 ? '其他人只能干瞪眼...' : ''}`,
                icon: '📦',
                badge: badgeDef.name,
                winner: lucky.name
            });
        }

        // 2. 转职徽章 — 10%概率
        if (RAND(100) < 10) {
            const lucky2 = survivors[RAND(survivors.length)];
            const ccBadge = window.CLASS_CHANGE_BADGE_DEF;
            if (ccBadge) {
                this._giveItem(lucky2, {
                    id: ccBadge.id,
                    name: ccBadge.name,
                    icon: ccBadge.icon,
                    type: "badge",
                    badgeType: "class_change",
                    desc: ccBadge.desc,
                    sellPrice: ccBadge.sellPrice
                });
                events.push({
                    type: 'boss_chest',
                    name: `📦 额外掉落 — ${ccBadge.name}`,
                    description: `${lucky2.name}获得了${ccBadge.name}！（20级转职必需品）`,
                    icon: ccBadge.icon || '⚜️'
                });
            }
        }

        // 3. 金币
        const goldGain = lockLevel * 100;
        for (const s of survivors) {
            s.gold += goldGain;
        }
        events.push({
            type: 'boss_chest',
            name: '💰 金币奖励',
            description: `每人获得${goldGain}G`,
            icon: '💰',
            gold: goldGain
        });

        // 4. 装备（1-2件，稀有度基于层数）
        const maxRarity = this._getFloorDropMaxRarity(floorId);
        const equipCount = 1 + RAND(2);
        for (let i = 0; i < equipCount; i++) {
            const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
            const slot = slotTypes[RAND(slotTypes.length)];
            const rarity = Math.min(maxRarity, 2 + RAND(4)); // 至少精良
            const gear = GearSystem.generateGear(slot, lockLevel, rarity);
            const lucky3 = survivors[RAND(survivors.length)];
            const r = GearSystem.equipItem(lucky3, gear);
            events.push({
                type: 'boss_chest',
                name: `🎁 ${r.msg || '获得装备'}`,
                description: r.msg || gear.name,
                icon: '⚔️'
            });
        }

        return events;
    }

    // 生成宝箱物品（根据楼层限制品质）
Game.prototype._generateChestLoot = function(level, chestType, hero, floorId) {
        // 楼层品质限制
        let maxRarity = 5; // 默认无限制
        let minRarity = 0;
        let legendaryRarity = 2; // 默认传说宝箱最低绿色
        if (floorId <= 3) {
            maxRarity = 2; // 最多绿色            legendaryRarity = 3; // 关底蓝色
        } else if (floorId <= 6) {
            maxRarity = 3; // 最多蓝色            legendaryRarity = 4; // 关底紫色
        } else if (floorId <= 9) {
            maxRarity = 4; // 最多紫色            legendaryRarity = 5; // 关底橙色
        } else {
            maxRarity = 5; // 10层：紫色到橙色            legendaryRarity = 5; // 关底橙色
            minRarity = 4; // 10层高级宝箱最低紫色
}

        const roll = Math.random();
        // 小概率出特殊物品
        if (roll < 0.02) {
            return GearSystem.generateSpecialItem('cleanse_potion', level, chestType === 'legendary');
        }
        if (roll < 0.03) {
            return GearSystem.generateSpecialItem('supreme_ring', level, chestType === 'legendary');
        }
        // 普通物品
        if (chestType === 'legendary') {
            // 传说宝箱：无诅咒，品质由楼层决定
            const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
            const itypes = ['heal', 'mana', 'buff'];
            const kind = Math.random() < 0.5 ? 'gear' : 'item';
            if (kind === 'gear') {
                const slot = slotTypes[RAND(slotTypes.length)];
                return GearSystem.generateGear(slot, level, legendaryRarity);
            } else {
                return GearSystem.generateItem(itypes[RAND(itypes.length)], level, legendaryRarity);
            }
        } else {
            // 高级宝箱：可能诅咒，品质受楼层限制
            const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
            const itypes = ['heal', 'mana', 'buff', 'cleanse'];
            const kind = Math.random() < 0.6 ? 'gear' : 'item';
            if (kind === 'gear') {
                const slot = slotTypes[RAND(slotTypes.length)];
                const r = GearSystem._rollRarityCapped(maxRarity, minRarity);
                return GearSystem.generateGear(slot, level, r);
            } else {
                const r = GearSystem._rollRarityCapped(maxRarity, minRarity);
                return GearSystem.generateItem(itypes[RAND(itypes.length)], level, r);
            }
        }
    }

    // 获取楼层怪物等级上限
Game.prototype._checkFloorFacilities = function(hero, oldProgress, newProgress, floorId, explore) {
        const events = [];
        if (!FLOOR_FACILITY_DEFS) return events;

        // 商店：2/4/6/8层，40%处，每层一次
        const shopDef = FLOOR_FACILITY_DEFS.shop;
        if (shopDef && shopDef.floors.includes(floorId)) {
            const pos = shopDef.progress;
            if (oldProgress < pos && newProgress >= pos) {
                const mask = hero.cflag[960] || 0;
                const bit = 1 << (floorId - 1);
                if ((mask & bit) === 0) {
                    const squadId = hero.cflag[CFLAGS.SQUAD_ID];
                    let canAccess = true;
                    if (squadId) {
                        if (hero.cflag[CFLAGS.SQUAD_LEADER] !== 1) {
                            canAccess = false;
                        } else {
                            const squad = this.invaders.filter(h => h.cflag[CFLAGS.SQUAD_ID] === squadId);
                            for (const m of squad) {
                                m.cflag[960] = (m.cflag[960] || 0) | bit;
                            }
                        }
                    }
                    if (canAccess && !squadId) {
                        hero.cflag[960] = mask | bit;
                    }
                    if (canAccess) {
                        const shopResult = this._triggerFloorShop(hero, floorId);
                        if (shopResult) events.push(shopResult);
                    }
                }
            }
        }

        // 回复泉水：1-9层，80%处，每次经过都触发
        const springDef = FLOOR_FACILITY_DEFS.spring;
        if (springDef && springDef.floors.includes(floorId)) {
            const pos = springDef.progress;
            if (oldProgress < pos && newProgress >= pos) {
                const healAmt = Math.floor(hero.maxHp * 0.05);
                hero.hp = Math.min(hero.maxHp, hero.hp + healAmt);
                events.push({
                    type: 'spring',
                    name: '💧 回复泉水',
                    description: `${hero.name}经过回复泉水，恢复${healAmt}HP`,
                    icon: '💧',
                    heal: healAmt
                });
            }
        }

        // 竞技场：3/5/7层，70%处，每层一次
        const arenaDef = FLOOR_FACILITY_DEFS.arena;
        if (arenaDef && arenaDef.floors.includes(floorId)) {
            const pos = arenaDef.progress;
            if (oldProgress < pos && newProgress >= pos) {
                const mask = hero.cflag[CFLAGS.HERO_PERSONALITY] || 0;
                const bit = 1 << (floorId - 1);
                if ((mask & bit) === 0) {
                    const squadId = hero.cflag[CFLAGS.SQUAD_ID];
                    let canAccess = true;
                    if (squadId && hero.cflag[CFLAGS.SQUAD_LEADER] !== 1) {
                        canAccess = false;
                    } else if (squadId && hero.cflag[CFLAGS.SQUAD_LEADER] === 1) {
                        const squad = this.invaders.filter(h => h.cflag[CFLAGS.SQUAD_ID] === squadId);
                        for (const m of squad) {
                            m.cflag[CFLAGS.HERO_PERSONALITY] = (m.cflag[CFLAGS.HERO_PERSONALITY] || 0) | bit;
                        }
                    } else {
                        hero.cflag[CFLAGS.HERO_PERSONALITY] = mask | bit;
                    }
                    if (canAccess) {
                        const arenaResult = this._triggerArena(hero, floorId, squadId);
                        if (arenaResult) {
                            events.push(arenaResult);
                            if (arenaResult.victory) {
                                // 胜利：恢复5%HP已在 _triggerArena 中处理
                            } else if (arenaResult.defeated) {
                                // 战败：标记 defeated，走被俘/逃跑流程
                                explore.results._defeated = true;
                                explore.results._monster = arenaResult._monster;
                            } else {
                                // 撤退：当日停止移动
                                events._haltMove = true;
                            }
                        }
                    }
                }
            }
        }

        return events;
    }

    // 触发地下城商店
Game.prototype._triggerFloorShop = function(hero, floorId) {
        const level = Math.max(1, floorId * 5 + RAND(5));
        const maxRarity = Math.min(5, Math.floor((floorId + 1) / 2));
        const minRarity = Math.max(0, Math.floor((floorId - 2) / 2));
        const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
        const itemTypes = ['heal', 'mana', 'buff'];

        const items = [];
        // 装备
        const slot = slotTypes[RAND(slotTypes.length)];
        const r1 = GearSystem._rollRarityCapped(maxRarity, minRarity);
        const gear = GearSystem.generateGear(slot, level, r1);
        const gearPrice = Math.max(50, Math.floor(this._calcGearPrice(gear) * 2));
        items.push({ item: gear, price: gearPrice, type: 'gear' });

        // 消耗品
        const r2 = GearSystem._rollRarityCapped(maxRarity, minRarity);
        const consumable = GearSystem.generateItem(itemTypes[RAND(itemTypes.length)], level, r2);
        const consPrice = Math.max(30, Math.floor(this._calcGearPrice(consumable) * 1.5));
        items.push({ item: consumable, price: consPrice, type: 'item' });

        let bought = [];
        for (const entry of items) {
            if (hero.gold >= entry.price && Math.random() < 0.7) {
                hero.gold -= entry.price;
                const r = GearSystem.equipItem(hero, entry.item);
                if (r.success) {
                    bought.push(`${entry.item.name}(${entry.price}G)`);
                }
            }
        }

        return {
            type: 'floor_shop',
            name: '🏪 地下城商店',
            description: `${hero.name}在地下城商店浏览，${bought.length > 0 ? '购买了：' + bought.join(',') : '没有购买任何物品'}`,
            icon: '🏪',
            bought: bought
        };
    }

    // 触发竞技场
Game.prototype._triggerArena = function(hero, floorId, squadId) {
        const monster = this._spawnMonster(floorId, 'chief');
        let combat;
        if (squadId && hero.cflag[CFLAGS.SQUAD_LEADER] === 1) {
            const squad = this.invaders.filter(h => h.cflag[CFLAGS.SQUAD_ID] === squadId);
            combat = this._doTeamCombat(squad, [monster]);
        } else {
            combat = this._doTeamCombat([hero], [monster]);
        }

        const result = {
            type: 'arena',
            name: '⚔️ 竞技场',
            description: `${monster.icon} ${monster.name} Lv.${monster.level}`,
            icon: '⚔️',
            combatLog: combat.combatLog,
            victory: combat.victory,
            defeated: combat.defeated,
            _monster: monster,
            leftTeam: combat.leftTeam,
            rightTeam: combat.rightTeam
        };

        if (combat.victory) {
            // 高级物品奖励
            const maxRarity = Math.min(5, Math.floor((floorId + 2) / 2));
            const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
            const slot = slotTypes[RAND(slotTypes.length)];
            const item = GearSystem.generateGear(slot, monster.level, maxRarity);
            const r = GearSystem.equipItem(hero, item);
            result.itemName = item.name;
            result.itemMsg = r.msg;

            // 额外金币
            const bonusGold = Math.floor(monster.level * monster.level * 5);
            hero.gold += bonusGold;
            result.gold = bonusGold;

            // 恢复5%HP
            const healAmt = Math.floor(hero.maxHp * 0.05);
            hero.hp = Math.min(hero.maxHp, hero.hp + healAmt);
            result.heal = healAmt;

            result.description += ` | 胜利！获得${item.name}和${bonusGold}G，恢复${healAmt}HP`;
        } else if (combat.defeated) {
            result.description += ` | 战败...`;
        } else {
            result.description += ` | 撤退，次日可再来挑战`;
        }

        return result;
    }

    // 找到身上最差的可出售装】
Game.prototype._triggerHiddenShop = function(hero, floorId) {
        // 生成一件该层对应等级的物品
        const level = Math.max(1, floorId * 5 + RAND(5));
        const maxRarity = Math.min(5, Math.floor((floorId + 1) / 2));
        const minRarity = Math.max(0, Math.floor((floorId - 2) / 2));
        const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
        const itemTypes = ['heal', 'mana', 'buff', 'cleanse'];
        const kind = Math.random() < 0.5 ? 'gear' : 'item';
        let item;
        if (kind === 'gear') {
            const slot = slotTypes[RAND(slotTypes.length)];
            const r = GearSystem._rollRarityCapped(maxRarity, minRarity);
            item = GearSystem.generateGear(slot, level, r);
        } else {
            const r = GearSystem._rollRarityCapped(maxRarity, minRarity);
            item = GearSystem.generateItem(itemTypes[RAND(itemTypes.length)], level, r);
        }
        const basePrice = this._calcGearPrice(item);
        const shopPrice = basePrice * 10; // 隐藏商店售价为同类物品售价的10倍        // AI决定是否购买（有50%概率购买，如果金币足够）
        if (hero.gold >= shopPrice && Math.random() < 0.5) {
            hero.gold -= shopPrice;
            const r = GearSystem.equipItem(hero, item);
            return {
                type: "shop",
                name: "隐藏商店",
                description: `发现隐藏商店，花${shopPrice}G购买${item.name},${r.success ? r.msg : '但无法携带'}`,
                icon: "🏪",
                item: item,
                price: shopPrice,
                bought: r.success
            };
        }
        return {
            type: "shop",
            name: "隐藏商店",
            description: `发现隐藏商店，有${item.name}出售（${shopPrice}G），${hero.gold < shopPrice ? '金币不足' : '没有购买'}。`,
            icon: "🏪",
            item: item,
            price: shopPrice,
            bought: false
        };
    }

    // ========== 奸商系统 ==========
Game.prototype._triggerSwindler = function(hero, floorId) {
        // 奸商卖出的物品必然带诅咒，必然比该层物品等级高一级
        const level = Math.max(1, floorId * 5 + RAND(5) + 5); // 高一级= 等级+5
        const maxRarity = Math.min(5, Math.floor((floorId + 2) / 2));
        const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
        const itemTypes = ['heal', 'mana', 'buff'];
        const kind = Math.random() < 0.5 ? 'gear' : 'item';
        let item;
        if (kind === 'gear') {
            const slot = slotTypes[RAND(slotTypes.length)];
            item = GearSystem.generateGear(slot, level, maxRarity);
        } else {
            item = GearSystem.generateItem(itemTypes[RAND(itemTypes.length)], level, maxRarity);
        }
        item.cursed = true; // 必然诅咒
        const basePrice = this._calcGearPrice(item);
        const buyPrice = basePrice * 2; // 奸商卖出价格（比正常贵）
        let resultDesc = `遇到了神秘的奸商，正在兜【售${item.name}（诅咒）…`;
        // AI购买判定【0%概率购买
        let bought = false;
        if (hero.gold >= buyPrice && Math.random() < 0.3) {
            hero.gold -= buyPrice;
            const r = GearSystem.equipItem(hero, item);
            bought = r.success;
            resultDesc += `花费${buyPrice}G购买了它【${r.msg}`;
        } else {
            resultDesc += `没有购买。`;
        }
        // 奸商回收物品（价格减半）
        let sold = null;
        if (hero.gear && Math.random() < 0.4) {
            // 尝试卖出身上一件物品（优先道具，然后是最低价值的装备】
            const toSell = this._findWorstGearToSell(hero);
            if (toSell) {
                const sellPrice = Math.floor(this._calcGearPrice(toSell.gear) * 0.5);
                if (sellPrice > 0) {
                    hero.gold += sellPrice;
                    sold = { gear: toSell.gear, price: sellPrice };
                    // 移除物品
                    if (toSell.slot === 'weapon') {
                        hero.gear.weapons.splice(toSell.index, 1);
                    } else if (toSell.slot === 'item') {
                        hero.gear.items.splice(toSell.index, 1);
                    } else {
                        hero.gear[toSell.slot] = null;
                    }
                    resultDesc += ` 并将${toSell.gear.name}卖给了奸商（${sellPrice}G）。`;
                }
            }
        }
        return {
            type: "swindler",
            name: "奸商",
            description: resultDesc,
            icon: "🦊",
            item: item,
            price: buyPrice,
            bought: bought,
            sold: sold
        };
    }

    // 计算装备/道具的基础售价（新物价体系统    // 灰色10G / 白色100G / 绿色1000G / 蓝色10000G / 紫色100000G / 橙色1000000G
    // 武器×2，道具【.5，等级系数每【2%
Game.prototype._findWorstGearToSell = function(c) {
        if (!c.gear) return null;
        let worst = null;
        let worstPrice = Infinity;
        // 检查道具栏
        if (c.gear.items) {
            for (let i = 0; i < c.gear.items.length; i++) {
                const price = this._calcGearPrice(c.gear.items[i]);
                if (price < worstPrice) {
                    worstPrice = price;
                    worst = { slot: 'item', index: i, gear: c.gear.items[i] };
                }
            }
        }
        // 检查装备槽
        const slots = ['head', 'body', 'legs', 'hands', 'neck', 'ring'];
        for (const s of slots) {
            const g = c.gear[s];
            if (!g) continue;
            const price = this._calcGearPrice(g);
            if (price < worstPrice) {
                worstPrice = price;
                worst = { slot: s, index: -1, gear: g };
            }
        }
        // 检查武】
        if (c.gear.weapons) {
            for (let i = 0; i < c.gear.weapons.length; i++) {
                const price = this._calcGearPrice(c.gear.weapons[i]);
                if (price < worstPrice) {
                    worstPrice = price;
                    worst = { slot: 'weapon', index: i, gear: c.gear.weapons[i] };
                }
            }
        }
        return worst;
    }

    // 回合制战斗：勇【vs 地下城怪物
    // 规则：根据敏捷决定出手顺序，攻击【防御【实际伤害，支持回【增益/特殊技】
Game.prototype._shouldCamp = function(hero) {
        if (!hero) return false;
        const hpPct = hero.maxHp > 0 ? hero.hp / hero.maxHp : 1;
        // HP<50% 或有异常状态时考虑安营
        if (hpPct >= 0.5 && (hero.cflag[CFLAGS.HERO_PREVIOUS] || 0) === 0) return false;
        // 根据性格判断
        let chance = 30; // 基础概率30%
        if (hpPct < 0.3) chance += 40;
        else if (hpPct < 0.5) chance += 20;
        const hasAilment = (hero.cflag[CFLAGS.HERO_PREVIOUS] || 0) !== 0;
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

Game.prototype._doCamp = function(hero, moveSpeed) {
        if (!hero) return null;
        hero.cflag[CFLAGS.SPY_TARGET] = 0; // 安营扎寨后解除低调状态
        const hpPct = hero.maxHp > 0 ? hero.hp / hero.maxHp : 1;
        const hasAilment = (hero.cflag[CFLAGS.HERO_PREVIOUS] || 0) !== 0;
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

