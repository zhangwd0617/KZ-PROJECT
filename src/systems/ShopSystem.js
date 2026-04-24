/**
 * Shop System
 */
class ShopSystem {
    constructor(game) {
        this.game = game;
    }

    openShop(type) {
        UI.renderItemShop(this.game, type);
    }

    buy(itemId) {
        const item = ITEM_DEFS[itemId];
        if (!item) return false;
        if (this.game.money < item.price) {
            UI.showToast("金钱不足！", "danger");
            return false;
        }
        this.game.money -= item.price;
        this.game.item[itemId]++;
        UI.showToast(`购买了 ${item.name}`);
        return true;
    }

    sellChara(index) {
        const c = this.game.getChara(index);
        if (!c) return;
        const price = this._estimatePrice(c);
        this.game.money += price;
        this.game.delChara(index);
        UI.showToast(`将 ${c.name} 卖出了 ${price}G`);
    }

    _estimatePrice(c) {
        let price = 500;
        price += c.level * 200;
        for (let i = 0; i < c.abl.length; i++) price += c.abl[i] * 50;
        for (let i = 0; i < c.talent.length; i++) if (c.talent[i]) price += 100;
        return price;
    }
}

class DayEndSystem {
    constructor(game) {
        this.game = game;
    }

    process() {
        this.processPhase1();
        this.processPhase2();
    }

    processPhase1() {
        const g = this.game;
        const dailyEvents = [];

        // Recover all characters' HP
        for (const c of g.characters) {
            c.recoverHp(0.5);
            c.recoverMp(0.8);
        }

        // Clear TEQUIP
        for (const c of g.characters) {
            c.tequip.fill(0);
        }

        // === 怀孕推进与分娩 ===
        for (const c of g.characters) {
            if (c.talent[153]) {
                c.cflag[CFLAGS.PREGNANCY_DAYS] = (c.cflag[CFLAGS.PREGNANCY_DAYS] || 0) + 1;
                const days = c.cflag[CFLAGS.PREGNANCY_DAYS];
                if (days >= 30) {
                    // 分娩
                    c.talent[153] = 0;
                    c.cflag[CFLAGS.PREGNANCY_DAYS] = 0;
                    c.addExp(60, 1); // 生产经验
                    if (!c.talent[188]) c.talent[188] = 1; // 获得母性
                    const child = this._createChild(c);
                    g.characters.push(child);
                    dailyEvents.push({
                        type: 'daily',
                        title: `👶 ${c.name}分娩了`,
                        text: `${c.name}生下了${child.name}（Lv.${child.level}）。\n新生命加入了魔王城。`
                    });
                } else if (days === 15) {
                    dailyEvents.push({
                        type: 'daily',
                        title: `🤰 ${c.name}的肚子变大了`,
                        text: `${c.name}的妊娠已经过了一半，身体变得敏感而脆弱...`
                    });
                }
            }
        }

        // === 楼层进度宝箱刷新 ===
        if (g._floorChestState) {
            for (let fid = 1; fid <= 10; fid++) {
                let state = g._floorChestState[fid];
                if (!state) {
                    state = { refreshDay: 1, takenMask: 0 };
                    g._floorChestState[fid] = state;
                }
                if (g.day >= state.refreshDay) {
                    // 刷新该层进度宝箱
                    state.takenMask = 0;
                    state.refreshDay = g.day + 10;
                    // 重置该层所有勇者的宝箱掩码（25%/50%/75%位）
                    for (const hero of g.invaders) {
                        const heroFloor = g.getHeroFloor(hero);
                        if (heroFloor === fid) {
                            hero.cflag[503] = (hero.cflag[503] || 0) & ~7; // 清除bit 1,2,4
                        }
                    }
                    // 重置该层奴隶的宝箱掩码
                    for (const slave of g.characters) {
                        if (slave.talent[200] && slave.cflag[CFLAGS.FALLEN_DEPTH]) {
                            const slaveFloor = slave.cflag[CFLAGS.FALLEN_STAGE] || 10;
                            if (slaveFloor === fid) {
                                slave.cflag[CFLAGS.DESIRE] = (slave.cflag[CFLAGS.DESIRE] || 0) & ~7;
                            }
                        }
                    }
                }
            }
        }

        // 领地每日收益
        const income = g.getFacilityIncome ? g.getFacilityIncome() : 0;
        if (income > 0) {
            g.money += income;
        }

        // 每日声望增长
        g.addFame(1);

        // 勇者入侵判定（新版：批量刷新）
        const newcomers = g.refreshHeroInvaders();
        if (newcomers.length > 0) {
            g.flag[100] = 1; // 标记有入侵
            // 批量入侵事件加入日常事件队列
            let invaderNames = newcomers.map(h => `${h.name} Lv.${h.level}`).join(',');
            const goalInfo = newcomers.length === 1 ? `
攻略目标：${HERO_GOAL_DEFS[newcomers[0].cflag[CFLAGS.HERO_LEVEL]]?.name || '讨伐魔王'}` : '';
            dailyEvents.push({
                type: 'daily',
                title: `⚔️ ${newcomers.length}名勇者入侵！`,
                text: `今日有${newcomers.length}名勇者踏入了地下城！
${invaderNames}${goalInfo}

当前地下城勇者：${g.invaders.length}/${g.getHeroTargetCount()}人`
            });
        }

        // 每天刷新奴隶市场
        g._slaveMarketCandidates = null;

        // 天数推进
        g.day++;

        // ===== 事件系统 =====
        if (g.eventSystem) {
            const evtResults = g.eventSystem.processDayEnd();
            // 分离日常事件与地下城事件
            const sysDaily = evtResults.filter(e => e.type === 'daily');
            let dungeonEvents = evtResults.filter(e => e.type === 'dungeon');
            // 保存地下城事件供Phase2合并
            g._pendingDungeonEvents = dungeonEvents;
            // 合并系统日常事件
            dailyEvents.push(...sysDaily);

            // 地下城事件先存入日志（不含战斗事件，Phase2会更新）
            if (dungeonEvents.length > 0) {
                if (!g._dayEventLog) g._dayEventLog = [];
                g._dayEventLog.unshift({ day: g.day, events: dungeonEvents });
                if (g._dayEventLog.length > 30) g._dayEventLog.pop();
            }
            // 日常事件弹窗队列播报
            const afterDaily = () => {
                g._dayPhase = 1;
                if (typeof UI !== 'undefined' && G && G.state === 'SHOP') {
                    UI.renderShop(G);
                }
            };
            if (dailyEvents.length > 0) {
                UI.showToast(`本日发生了 ${dailyEvents.length} 个日常事件`, 'info');
                UI.showEventQueue(dailyEvents, () => {
                    afterDaily();
                });
            } else {
                afterDaily();
            }
        } else {
            g._dayPhase = 1;
            if (typeof UI !== 'undefined' && G && G.state === 'SHOP') {
                UI.renderShop(G);
            }
        }
    }

    processPhase2() {
        const g = this.game;
        const phase2Queue = []; // 统一队列：事件+战斗
        const stats = { combat: 0, boss: 0, event: 0, encounter: 0, slave: 0, camp: 0, total: 0 };

        try {
            // 清零每日事件标记（每个勇者/小队每天只能触发一个事件）
            for (const hero of g.invaders) {
                hero.cflag[CFLAGS.SPY_SENT] = 0;
            }

            // 勇者之间相遇事件（伪装/破坏/内战）
            const encounterEvents = g._processHeroEncounters();
            if (encounterEvents.length > 0) {
                stats.encounter += encounterEvents.length;
                for (const evt of encounterEvents) {
                    if (evt.type === 'combat') {
                        stats.combat++;
                        phase2Queue.push({
                            type: 'combat',
                            battle: evt.battle
                        });
                    } else {
                        phase2Queue.push({
                            type: 'event', tag: '遭遇', tagIcon: '🗡️', tagColor: 'var(--danger)',
                            title: evt.title,
                            text: evt.text
                        });
                    }
                }
            }

            // 计算勇者小队（进度重叠的自动组队）
            g._formHeroSquads();
            // 计算前勇者奴隶小队
            g._formSlaveSquads();

            // 见死不救判定：HP<20%的勇者，同楼层关系好的其他勇者没有组队帮助
            for (const weakHero of g.invaders) {
                if (weakHero.hp <= 0) continue;
                // 每日事件限制：已触发事件的勇者不再触发见死不救
                if (g._hasTriggeredDailyEvent(weakHero)) continue;
                const hpRatio = weakHero.maxHp > 0 ? weakHero.hp / weakHero.maxHp : 1;
                if (hpRatio >= 0.2) continue;
                const weakFloor = g.getHeroFloor(weakHero);
                for (const other of g.invaders) {
                    if (other === weakHero || other.hp <= 0) continue;
                    if (g.getHeroFloor(other) !== weakFloor) continue;
                    const rel = g._getHeroRelation(weakHero, other);
                    // 关系>=点头之交，但没有组队（没有帮助）
                    if (rel.level >= 2 && (other.cflag[CFLAGS.SQUAD_ID] || 0) !== (weakHero.cflag[CFLAGS.SQUAD_ID] || 0)) {
                        if (RAND(100) < 25) {
                            g._setHeroRelation(weakHero, other, -1, 'ignore_help');
                            g._markDailyEventTriggered(weakHero);
                            phase2Queue.push({
                                type: 'event', tag: '关系', tagIcon: '🙈', tagColor: 'var(--danger)',
                                title: '🙈 见死不救',
                                text: `${weakHero.name}(${Math.floor(hpRatio*100)}%HP)身陷险境，${other.name}却冷眼旁观...两人关系恶化了（${g._getRelationLabel(rel.level - 1)}）`
                            });
                            break; // 弱勇者今天只触发一次见死不救
                        }
                    }
                }
            }

            const retreatHeroes = [];
            for (let i = g.invaders.length - 1; i >= 0; i--) {
                const hero = g.invaders[i];
                const result = g.moveHeroDaily(hero);

                // 生成勇者移动概览
                const floorId = g.getHeroFloor(hero);
                let moveOverview = '';
                if (result.action === 'move') {
                    const oldProg = result.progress - result.moveSpeed;
                    const dir = result.moveSpeed >= 0 ? '前进' : '后退';
                    moveOverview = `📍 ${hero.name} 第${floorId}层 ${oldProg}% → ${dir}${Math.abs(result.moveSpeed)}% → 第${floorId}层 ${result.progress}%`;
                } else if (result.action === 'next_floor') {
                    moveOverview = `📍 ${hero.name} 突破第${floorId - 1}层 → 进入第${floorId}层 0%`;
                } else if (result.action === 'prev_floor') {
                    moveOverview = `📍 ${hero.name} 战败后退 → 退回第${floorId}层 80%`;
                } else if (result.action === 'retreat_to_town') {
                    moveOverview = `📍 ${hero.name} 主动撤退回城镇恢复`;
                } else if (result.action === 'camp') {
                    moveOverview = `📍 ${hero.name} 安营扎寨（当日不移动）`;
                    stats.camp++;
                } else if (result.action === 'defeat_escape') {
                    if (result.floor) {
                        moveOverview = `📍 ${hero.name} 战败逃跑 → 退回第${result.floor}层 50%`;
                    } else {
                        moveOverview = `📍 ${hero.name} 战败逃跑 → 后退50% → 第${floorId}层 ${hero.cflag[CFLAGS.HERO_PROGRESS]}%`;
                    }
                } else if (result.action === 'captured') {
                    moveOverview = `📍 ${hero.name} 战败 → 被怪物俘虏`;
                } else if (result.action === 'boss_victory') {
                    moveOverview = `📍 ${hero.name} 击败Boss → 进入第${result.floor}层 0%`;
                }

                // 收集该勇者的非战斗探索详情
                let exploreDetails = [];
                if (result.results && Array.isArray(result.results)) {
                    for (const r of result.results) {
                        if (r.type === 'combat' || r.type === 'scombat') {
                            stats.combat++;
                            // 战斗放入 phase2Queue
                            phase2Queue.push({
                                type: 'combat',
                                battle: {
                                    type: 'team',
                                    hero: hero,
                                    heroName: r.type === 'scombat' ? hero.name : undefined,
                                    squad: r.type === 'scombat' ? g.invaders.filter(h => h.cflag[CFLAGS.SQUAD_ID] === hero.cflag[CFLAGS.SQUAD_ID]) : undefined,
                                    monster: r.monster,
                                    leftTeam: r.leftTeam,
                                    rightTeam: r.rightTeam,
                                    combatLog: r.combatLog,
                                    victory: r.victory,
                                    defeated: r.defeated,
                                    escaped: r.escaped,
                                    rounds: r.rounds,
                                    drop: r.drop,
                                    isSquad: r.type === 'scombat'
                                }
                            });
                        } else if (r.type === 'boss') {
                            stats.boss++;
                            const outcome = r.victory ? '胜利' : (r.defeated ? '败北' : '撤退');
                            exploreDetails.push(`⚔️ Boss战：${r.description} (${outcome})`);
                        } else if (r.type === 'boss_chest') {
                            exploreDetails.push(`📦 ${r.description}`);
                        } else if (r.type === 'gold') {
                            exploreDetails.push(`💰 ${r.description}（持有:${hero.gold}G）`);
                        } else if (r.type === 'shop') {
                            exploreDetails.push(`🏪 ${r.description}`);
                        } else if (r.type === 'swindler') {
                            exploreDetails.push(`🦊 ${r.description}`);
                        } else if (r.type === 'floor_shop') {
                            exploreDetails.push(`🏪 ${r.description}`);
                        } else if (r.type === 'spring') {
                            exploreDetails.push(`💧 ${r.description}`);
                        } else if (r.type === 'arena') {
                            stats.combat++;
                            const outcome = r.victory ? '胜利' : (r.defeated ? '败北' : '撤退');
                            exploreDetails.push(`⚔️ 竞技场：${r.description} (${outcome})`);
                        } else if (r.type === 'event') {
                            stats.event++;
                            exploreDetails.push(`${r.icon || ''} ${r.name}：${r.description}`);
                        } else if (r.type === 'healer') {
                            exploreDetails.push(`💊 ${r.description}`);
                        } else if (r.type === 'curse') {
                            exploreDetails.push(`🌑 ${r.description}`);
                        } else if (r.type === 'aphrodisiac') {
                            exploreDetails.push(`💕 ${r.description}`);
                        }
                    }
                    // 进度宝箱
                    if (result.results.chests && result.results.chests.length > 0) {
                        for (const chest of result.results.chests) {
                            const chestName = chest.type === 'legendary' ? '🎁 传说宝箱' : '💎 高级宝箱';
                            const curseWarn = chest.curseTriggered ? ' ⚠️受到诅咒！' : '';
                            const goldText = chest.gold ? ` 💰+${chest.gold}G` : '';
                            exploreDetails.push(`${chestName}：在${chest.threshold}%处发现！${chest.msg}${curseWarn}${goldText}`);
                        }
                    }
                }

                // 勇者冒险口号与目标（固定显示）
                const motto = hero.cstr[CSTRS.NAME] || '';
                const goalId = hero.cflag[CFLAGS.HERO_LEVEL];
                const goalDef = goalId && HERO_GOAL_DEFS[goalId] ? HERO_GOAL_DEFS[goalId] : null;
                const goalText = goalDef ? `【${goalDef.icon} ${goalDef.name}】` : '';
                const mottoHtml = motto ? `<div style="margin:8px 0;padding:8px 12px;background:var(--bg-card);border-left:3px solid var(--accent);border-radius:0 4px 4px 0;font-style:italic;color:var(--accent);font-size:0.85rem;">"${motto}"</div>` : '';

                // 把移动概览+探索详情合并为一个事件弹窗
                let eventText = moveOverview;
                if (exploreDetails.length > 0) {
                    eventText += '\\n\\n' + exploreDetails.join('\\n');
                }
                if (eventText) {
                    phase2Queue.push({
                        type: 'event', tag: '行动', tagIcon: '🚶', tagColor: 'var(--info)',
                        title: `${hero.name}的行动 ${goalText}`,
                        text: mottoHtml + `<div style="white-space:pre-wrap;line-height:1.6;font-size:0.9rem;">${eventText}</div>`
                    });
                }

                // 撤退/恢复/俘虏等状态事件
                if (result.action === 'retreat_to_town') {
                    retreatHeroes.push(hero.name);
                    hero.cflag[503] = 1;
                    hero.cflag[CFLAGS.SPY_TARGET] = 0; // 回城恢复后解除低调状态
                    hero.hp = Math.min(hero.maxHp, hero.hp + Math.floor(hero.maxHp * 0.3));
                    hero.mp = Math.min(hero.maxMp, hero.mp + Math.floor(hero.maxMp * 0.3));
                    let retreatText = `${hero.name}撤退回城镇恢复。`;
                    if (typeof g._tryCureStatusAilment === 'function') {
                        const cured = g._tryCureStatusAilment(hero, "town_rest");
                        if (cured && cured.length > 0) retreatText += `
解除状态：${cured.join(',')}`;
                    }
                    const mask = hero.cflag[CFLAGS.HERO_PREVIOUS] || 0;
                    if ((mask & 1) !== 0) retreatText += `
🌑 诅咒无法通过普通休息解除...`;
                    phase2Queue.push({
                        type: 'event', tag: '恢复', tagIcon: '🏥', tagColor: 'var(--success)',
                        title: '🏥 城镇恢复',
                        text: retreatText
                    });
                } else if (result.action === 'camp') {
                    const camp = result.campResult;
                    if (camp && camp.logs) {
                        phase2Queue.push({
                            type: 'event', tag: '营地', tagIcon: '🏕️', tagColor: 'var(--accent)',
                            title: `🏕️ 安营扎寨`,
                            text: `${hero.name} Lv.${hero.level}\\n${camp.logs.join('\\n')}`
                        });
                    }
                } else if (result.action === 'defeat_escape') {
                    const cap = result.captureResult;
                    let capText = `${hero.name} Lv.${hero.level} 被击败 → ${cap.message}`;
                    if (result.floor) capText += `\n退回第${result.floor}层 50%`;
                    else capText += `\n侵略度-50%`;
                    g.addFame(2); // 击退勇者 +2 声望
                    phase2Queue.push({
                        type: 'event', tag: '战败', tagIcon: '⚔️', tagColor: 'var(--danger)',
                        title: '⚔️ 战败逃跑',
                        text: capText + '\n\n🏆 魔王声望 +2（击退勇者）'
                    });
                } else if (result.action === 'captured') {
                    g.invaders.splice(i, 1);
                    const cap = result.captureResult;
                    const capType = cap.type === 'surrender' ? '投降服从' : '被俘入狱';
                    g.addFame(5); // 俘虏勇者 +5 声望
                    phase2Queue.push({
                        type: 'event', tag: '俘虏', tagIcon: '⛓️', tagColor: 'var(--danger)',
                        title: '⛓️ 勇者被俘',
                        text: `${hero.name} Lv.${hero.level} 被${result.monster.name}击败 → ${capType}\n\n🏆 魔王声望 +5（俘虏勇者）`
                    });
                }

                // === 勇者任务完成结算 ===
                if ((hero.cflag[CFLAGS.HERO_TASK_TYPE] || 0) !== 0 && (hero.cflag[CFLAGS.HERO_TASK_STATUS] || 0) === 1) {
                    const taskType = hero.cflag[CFLAGS.HERO_TASK_TYPE];
                    let taskRewardText = '';
                    if (taskType === 1) {
                        // 讨伐地下城奖励
                        const rewardGold = 500 + hero.level * 50;
                        hero.gold += rewardGold;
                        hero.fame += 5; // 个人声望+5（完成任务）
                        g.addFame(3);
                        taskRewardText = `讨伐完成！获得${rewardGold}G，个人声望+5，魔王声望+3`;
                    } else if (taskType === 2) {
                        // 委托奖励
                        const comId = hero.cflag[CFLAGS.HERO_ORIGIN] || 0;
                        const comDef = COMMISSION_DEFS[comId];
                        if (comDef) {
                            hero.gold += comDef.rewardGold;
                            hero.fame += comDef.rewardFame; // 个人声望
                            g.addFame(comDef.rewardFame);
                            taskRewardText = `委托"${comDef.name}"完成！获得${comDef.rewardGold}G，个人声望+${comDef.rewardFame}，魔王声望+${comDef.rewardFame}`;
                        } else {
                            taskRewardText = '委托完成！';
                        }
                    } else if (taskType === 3) {
                        taskRewardText = '回城恢复完成，伤势已好转';
                    }
                    if (taskRewardText) {
                        phase2Queue.push({
                            type: 'event', tag: '任务', tagIcon: '✅', tagColor: 'var(--success)',
                            title: `✅ ${hero.name}的任务完成`,
                            text: taskRewardText
                        });
                    }
                    g.clearHeroTask(hero);
                    g.generateHeroTask(hero); // 生成新任务
                }
            }
            if (retreatHeroes.length > 0) {
                UI.showToast('勇者 ' + retreatHeroes.join(',') + ' 退回小镇恢复', 'info');
            }

            // === 奴隶/魔王任务处理 ===
            for (let i = g.characters.length - 1; i >= 0; i--) {
                const slave = g.characters[i];
                const isMaster = g.getMaster() === slave;
                if (!slave.talent[200] && !isMaster) continue; // 不是前勇者奴隶也不是魔王
                if ((slave.cflag[CFLAGS.SLAVE_TASK_TYPE] || 0) === 0) continue; // 无任务
                const result = g.processSlaveTaskDaily(slave);
                if (result) {
                    stats.slave++;
                    let tag = '任务';
                    let tagIcon = '📋';
                    let tagColor = 'var(--accent)';
                    if (result.type === 'hunt') {
                        tag = isMaster ? '出击' : '讨伐';
                        tagIcon = '⚔️';
                        if (result.medalGained) tagColor = 'var(--success)';
                    } else if (result.type === 'lurk') {
                        tag = '潜伏';
                        tagIcon = '🎭';
                        if (result.medalGained) tagColor = 'var(--success)';
                    } else if (result.type === 'raid') {
                        tag = '袭击';
                        tagIcon = '🔥';
                    }
                    // 如果有战斗数据，先放入战斗队列
                    if (result.combatData) {
                        stats.combat++;
                        phase2Queue.push({
                            type: 'combat',
                            battle: result.combatData
                        });
                    }
                    phase2Queue.push({
                        type: 'event', tag: tag, tagIcon: tagIcon, tagColor: tagColor,
                        title: `${tagIcon} ${isMaster ? '👑 ' : ''}${slave.name}的${tag}`,
                        text: result.text
                    });
                }
            }

            // 前勇者奴隶每日反向探索
            const slaveExploreResults = g.processSlaveExploreDaily();
            if (slaveExploreResults.length > 0) {
                stats.slave += slaveExploreResults.length;
                for (const r of slaveExploreResults) {
                    let title = '🛡️ 奴隶探索';
                    let tag = '探索';
                    if (r.type === 'complete') { title = '🏆 探索完成'; tag = '完成'; }
                    else if (r.type === 'floor') { title = '📍 楼层突破'; tag = '突破'; }
                    else if (r.type === 'chest') { title = '💎 发现宝箱'; tag = '宝箱'; }
                    else if (r.type === 'upgrade') { title = '⬆️ 装备升级'; tag = '升级'; }
                    else if (r.type === 'shop') { title = '🏪 隐藏商店'; tag = '商店'; }
                    else if (r.type === 'swindler') { title = '🦊 奸商'; tag = '奸商'; }
                    phase2Queue.push({
                        type: 'event', tag: tag, tagIcon: '🛡️', tagColor: 'var(--accent)',
                        title: title,
                        text: `[${r.name}] ${r.text}`
                    });
                }
            }

            // 合并地下城事件到日志
            const dungeonEvents = g._pendingDungeonEvents || [];
            g._pendingDungeonEvents = null;
            if (dungeonEvents.length > 0) {
                if (!g._dayEventLog) g._dayEventLog = [];
                if (g._dayEventLog.length > 0 && g._dayEventLog[0].day === g.day) {
                    g._dayEventLog[0].events = dungeonEvents;
                } else {
                    g._dayEventLog.unshift({ day: g.day, events: dungeonEvents });
                }
                if (g._dayEventLog.length > 30) g._dayEventLog.pop();
            }
        } catch (e) {
            console.error('[processPhase2] ERROR:', e);
            UI.showToast('勇者行动处理出错：' + e.message, 'danger');
        }

        // 统计摘要
        stats.total = phase2Queue.length;
        if (stats.total > 0) {
            const pct = (n) => stats.total > 0 ? Math.round(n / stats.total * 100) : 0;
            const summaryText = `📊 本日事件统计（共${stats.total}件）
⚔️ 战斗 ${stats.combat}件(${pct(stats.combat)}%)　👹 Boss ${stats.boss}件(${pct(stats.boss)}%)
📜 探索事件 ${stats.event}件(${pct(stats.event)}%)　🏕️ 安营 ${stats.camp}件(${pct(stats.camp)}%)
👥 勇者相遇 ${stats.encounter}件(${pct(stats.encounter)}%)　🛡️ 奴隶探索 ${stats.slave}件(${pct(stats.slave)}%)`;
            phase2Queue.push({
                type: 'event', tag: '统计', tagIcon: '📊', tagColor: 'var(--accent)',
                title: '📊 本日勇者行动统计',
                text: `<div style="white-space:pre-wrap;line-height:1.8;font-size:0.9rem;">${summaryText}</div>`
            });
        }

        // 统一弹窗队列
        const afterPhase2 = () => {
            g._dayPhase = 0;
            if (typeof UI !== 'undefined' && G && G.state === 'SHOP') {
                UI.renderShop(G);
            }
        };
        if (phase2Queue.length > 0 && typeof UI !== 'undefined') {
            UI.showPhase2Queue(phase2Queue, () => {
                afterPhase2();
            });
        } else {
            afterPhase2();
        }
    }

    /**
     * 生成子代角色
     * 继承母亲的外貌/体型特征和部分能力
     */
    _createChild(mother) {
        const child = new Character(-3);
        // 名字池
        const girlNames = ['小魔','莉莉姆','帕皮','苏茜','库尔','梅菲','巴风特','因库','露娜','芙兰','拉米','茜拉','米娅','缇娜'];
        const boyNames = ['魔太','凯恩','雷欧','迪亚','泽克','洛基','艾克','萨姆'];
        // 性别继承（80%概率与母亲相同）
        const isFemale = (mother.talent[120] || mother.talent[121]) ? (RAND(5) !== 0) : (RAND(5) === 0);
        child.talent[120] = isFemale ? 1 : 0; // 女性
        child.talent[122] = isFemale ? 0 : 1; // 男性
        child.talent[121] = 0; // 非扶她
        const childNames = isFemale ? girlNames : boyNames;
        child.name = childNames[RAND(childNames.length)];
        child.callname = child.name;

        // 基础属性（魔族成长较高）
        child.base[0] = 400; child.maxbase[0] = 400; child.hp = 400;
        child.base[1] = 300; child.maxbase[1] = 300; child.mp = 300;
        child.level = 1;
        child.cflag[CFLAGS.BASE_HP] = 1; // 奴隶标记

        // 继承母亲的体型特征
        if (mother.talent[99]) child.talent[99] = 1; // 魁梧
        if (mother.talent[100]) child.talent[100] = 1; // 娇小
        if (mother.talent[101]) child.talent[101] = 1; // C低
        if (mother.talent[102]) child.talent[102] = 1; // C高
        if (mother.talent[103]) child.talent[103] = 1; // V低
        if (mother.talent[104]) child.talent[104] = 1; // V高
        if (mother.talent[105]) child.talent[105] = 1; // A低
        if (mother.talent[106]) child.talent[106] = 1; // A高
        if (mother.talent[107]) child.talent[107] = 1; // B低
        if (mother.talent[108]) child.talent[108] = 1; // B高
        if (mother.talent[109]) child.talent[109] = 1; // 贫乳
        if (mother.talent[110]) child.talent[110] = 1; // 巨乳
        if (mother.talent[111]) child.talent[111] = 1; // 小尻
        if (mother.talent[112]) child.talent[112] = 1; // 巨尻
        if (mother.talent[113]) child.talent[113] = 1; // 未成熟
        if (mother.talent[114]) child.talent[114] = 1; // 爆乳
        if (mother.talent[115]) child.talent[115] = 1; // 大尻
        if (mother.talent[116]) child.talent[116] = 1; // 绝壁

        // 继承部分性格
        if (mother.talent[10]) child.talent[10] = 1; // 胆怯
        if (mother.talent[13]) child.talent[13] = 1; // 坦率
        if (mother.talent[17]) child.talent[17] = 1; // 老实
        if (mother.talent[20]) child.talent[20] = 1; // 克制
        if (mother.talent[23]) child.talent[23] = 1; // 好奇心
        if (mother.talent[25]) child.talent[25] = 1; // 乐观

        // 继承肤色/发色（使用cflag外观编码）
        child.cflag[CFLAGS.ATK] = mother.cflag[CFLAGS.ATK] || 8; // 肤色
        child.cflag[CFLAGS.DEF] = mother.cflag[CFLAGS.DEF] || 6; // 发色
        child.cflag[CFLAGS.SPD] = mother.cflag[CFLAGS.SPD] || 5; // 瞳色

        // 继承少量能力
        for (let i = 0; i < child.abl.length; i++) {
            if (mother.abl[i] > 0) {
                child.abl[i] = Math.floor(mother.abl[i] * 0.15);
            }
        }
        // 限制上限
        for (let i = 0; i < child.abl.length; i++) {
            if (child.abl[i] > 2) child.abl[i] = 2;
        }

        // 外观：如果母亲是未成熟/萝莉体型，孩子也为未成熟
        if (mother.talent[113]) {
            child.talent[113] = 1;
            child.cflag[CFLAGS.ATK] = 7; // 较浅肤色
        }

        return child;
    }
}

window.ShopSystem = ShopSystem;
window.DayEndSystem = DayEndSystem;
