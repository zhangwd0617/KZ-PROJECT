import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('D:/KZ PROJECT/js/systems/ShopSystem.js', 'r', encoding='utf-8') as f:
    content = f.read()

# The old process() method body (lines 49-408)
old_method = '''    process() {
        const g = this.game;
        const combatEvents = [];

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
                c.cflag[800] = (c.cflag[800] || 0) + 1;
                const days = c.cflag[800];
                if (days >= 30) {
                    // 分娩
                    c.talent[153] = 0;
                    c.cflag[800] = 0;
                    c.addExp(60, 1); // 生产经验
                    if (!c.talent[188]) c.talent[188] = 1; // 获得母性
                    const child = this._createChild(c);
                    g.characters.push(child);
                    combatEvents.push({
                        type: 'daily',
                        title: `👶 ${c.name}分娩了`,
                        text: `${c.name}生下了${child.name}（Lv.${child.level}）。\\n新生命加入了魔王城。`
                    });
                } else if (days === 15) {
                    combatEvents.push({
                        type: 'daily',
                        title: `🤰 ${c.name}的肚子变大了`,
                        text: `${c.name}的妊娠已经过了一半，身体变得敏感而脆弱……`
                    });
                }
            }
        }

        // 领地每日收益
        const income = g.getFacilityIncome ? g.getFacilityIncome() : 0;
        if (income > 0) {
            g.money += income;
        }

        // 勇者入侵判定
        const invader = g.processHeroInvasion();
        if (invader) {
            // 入侵事件会在UI中显示
            g.flag[100] = 1; // 标记有入侵
            g.flag[101] = invader.id; // 入侵者ID
        }

        // 勇者每日移动
        const retreatHeroes = [];
        const combatQueue = []; // 战斗弹窗队列

        // 记录领地收入事件
        if (income > 0) {
            combatEvents.push({
                type: 'dungeon',
                title: `💰 领地收入`,
                text: `魔王领地今日产生${income}G收入（地下城层数发展+俘虏勇者上缴）`
            });
        }

        // 勇者之间相遇事件（伪装/破坏）
        const encounterEvents = g._processHeroEncounters();
        if (encounterEvents.length > 0) {
            for (const evt of encounterEvents) {
                combatEvents.push({
                    type: 'dungeon',
                    title: evt.title,
                    text: evt.text
                });
            }
        }

        // 计算勇者小队（进度重叠的自动组队）
        g._formHeroSquads();
        // 计算前勇者奴隶小队
        g._formSlaveSquads();

        for (let i = g.invaders.length - 1; i >= 0; i--) {
            const hero = g.invaders[i];
            const result = g.moveHeroDaily(hero);
            // 收集战斗事件
            if (result.results) {
                for (const r of result.results) {
                    if (r.type === 'combat') {
                        const outcome = r.victory ? '胜利' : (r.defeated ? '败北' : '逃脱');
                        combatEvents.push({
                            type: 'dungeon',
                            title: `${r.icon} ${r.name}`,
                            text: `${hero.name} Lv.${hero.level} ${outcome} | ${r.combatLog[r.combatLog.length - 1]}`
                        });
                        // 收集完整战斗数据用于弹窗
                        combatQueue.push({
                            type: 'solo',
                            hero: hero,
                            monster: r.monster,
                            combatLog: r.combatLog,
                            victory: r.victory,
                            defeated: r.defeated,
                            escaped: r.escaped,
                            rounds: r.rounds,
                            drop: r.drop
                        });
                    } else if (r.type === 'scombat') {
                        // 小队战斗：只有队长会触发完整记录
                        const outcome = r.victory ? '胜利' : (r.defeated ? '败北' : '撤退');
                        combatEvents.push({
                            type: 'dungeon',
                            title: `${r.icon} ${r.name}`,
                            text: `${hero.name} Lv.${hero.level} 率领小队${outcome} | ${r.combatLog[r.combatLog.length - 1]}`
                        });
                        // 收集完整战斗数据用于弹窗
                        const squad = g.invaders.filter(h => h.cflag[900] === hero.cflag[900]);
                        combatQueue.push({
                            type: 'squad',
                            hero: hero,
                            heroName: hero.name,
                            squad: squad,
                            monster: r.monster,
                            combatLog: r.combatLog,
                            victory: r.victory,
                            defeated: r.defeated,
                            escaped: r.escaped,
                            rounds: r.rounds,
                            drop: r.drop,
                            isSquad: true
                        });
                    } else if (r.type === 'gold') {
                        combatEvents.push({
                            type: 'dungeon',
                            title: `💰 发现财宝`,
                            text: `${hero.name} ${r.description}（持有:${hero.gold}G）`
                        });
                    } else if (r.type === 'shop') {
                        combatEvents.push({
                            type: 'dungeon',
                            title: `🏪 隐藏商店`,
                            text: `${hero.name} ${r.description}`
                        });
                    } else if (r.type === 'swindler') {
                        combatEvents.push({
                            type: 'dungeon',
                            title: `🦊 奸商`,
                            text: `${hero.name} ${r.description}`
                        });
                    } else if (r.type === 'floor_shop') {
                        combatEvents.push({
                            type: 'dungeon',
                            title: `🏪 地下城商店`,
                            text: `${hero.name} ${r.description}`
                        });
                    } else if (r.type === 'spring') {
                        combatEvents.push({
                            type: 'dungeon',
                            title: `💧 回复泉水`,
                            text: `${hero.name} ${r.description}`
                        });
                    } else if (r.type === 'arena') {
                        const outcome = r.victory ? '胜利' : (r.defeated ? '败北' : '撤退');
                        combatEvents.push({
                            type: 'dungeon',
                            title: `⚔️ 竞技场`,
                            text: `${hero.name} ${r.description} (${outcome})`
                        });
                    } else if (r.type === 'boss') {
                        const outcome = r.victory ? '胜利' : (r.defeated ? '败北' : '撤退');
                        combatEvents.push({
                            type: 'dungeon',
                            title: `⚔️ 守关Boss战`,
                            text: `${hero.name} ${r.description} (${outcome})`
                        });
                    } else if (r.type === 'boss_chest') {
                        combatEvents.push({
                            type: 'dungeon',
                            title: `📦 关底宝箱`,
                            text: `${hero.name} ${r.description}`
                        });
                    }
                }
                // 进度宝箱事件
                if (result.results.chests && result.results.chests.length > 0) {
                    for (const chest of result.results.chests) {
                        const chestName = chest.type === 'legendary' ? '🎁 传说宝箱' : '💎 高级宝箱';
                        const curseWarn = chest.curseTriggered ? ' ⚠️受到诅咒！' : '';
                        const goldText = chest.gold ? ` 💰+${chest.gold}G` : '';
                        combatEvents.push({
                            type: 'dungeon',
                            title: chestName,
                            text: `${hero.name} 在${chest.threshold}%处发现了宝箱！${chest.msg}${curseWarn}${goldText}`
                        });
                    }
                }
            }
            if (result.action === 'retreat_to_town') {
                retreatHeroes.push(hero.name);
                // 不再移除，而是标记为撤退中，之后可与其他勇者组队重新侵略
                hero.cflag[503] = 1;
                hero.hp = Math.min(hero.maxHp, hero.hp + Math.floor(hero.maxHp * 0.3));
                hero.mp = Math.min(hero.maxMp, hero.mp + Math.floor(hero.maxMp * 0.3));
                // 回城镇清除所有非诅咒异常状态
                if (typeof g._tryCureStatusAilment === 'function') {
                    const cured = g._tryCureStatusAilment(hero, "town_rest");
                    if (cured && cured.length > 0) {
                        combatEvents.push({
                            type: 'dungeon',
                            title: '🏥 城镇恢复',
                            text: `${hero.name}在城镇休息，${cured.join('、')}`
                        });
                    }
                }
                // 诅咒只能通过神官解除
                const mask = hero.cflag[920] || 0;
                if ((mask & 1) !== 0) {
                    combatEvents.push({
                        type: 'dungeon',
                        title: '🌑 诅咒缠身',
                        text: `${hero.name}身上的诅咒无法通过普通休息解除...`
                    });
                }
            } else if (result.action === 'camp') {
                // 安营扎寨事件
                const camp = result.campResult;
                if (camp && camp.logs) {
                    combatEvents.push({
                        type: 'dungeon',
                        title: `🏕️ 安营扎寨`,
                        text: `${hero.name} Lv.${hero.level} ${camp.logs.join(' | ')}`
                    });
                }
            } else if (result.action === 'defeat_escape') {
                // 被击败后逃跑成功：侵略度大幅降低，勇者继续入侵
                const cap = result.captureResult;
                let capText = `${hero.name} Lv.${hero.level} 被击败 → ${cap.message} `;
                if (result.floor) {
                    capText += `(退回第${result.floor}层 50%)`;
                } else {
                    capText += `(侵略度-50%)`;
                }
                combatEvents.push({
                    type: 'dungeon',
                    title: `⚔️ 战斗结果`,
                    text: capText
                });
            } else if (result.action === 'captured') {
                // 勇者被俘虏，从入侵者列表移除
                g.invaders.splice(i, 1);
                const cap = result.captureResult;
                let capText = `${hero.name} Lv.${hero.level} 被${result.monster.name}击败 → `;
                if (cap.type === 'surrender') {
                    capText += '投降服从';
                } else {
                    capText += '被俘入狱';
                }
                combatEvents.push({
                    type: 'dungeon',
                    title: `⚔️ 战斗结果`,
                    text: capText
                });
            }
        }
        if (retreatHeroes.length > 0) {
            UI.showToast('勇者 ' + retreatHeroes.join('、') + ' 退回小镇恢复', 'info');
        }

        // 前勇者奴隶每日反向探索
        const slaveExploreResults = g.processSlaveExploreDaily();
        if (slaveExploreResults.length > 0) {
            for (const r of slaveExploreResults) {
                let evtText = `[${r.name}] ${r.text}`;
                let title = '🛡️ 奴隶探索';
                if (r.type === 'complete') {
                    evtText = `🏆 ${r.name} ${r.text}`;
                    title = '🏆 探索完成';
                } else if (r.type === 'floor') {
                    evtText = `📍 ${r.name} ${r.text}`;
                    title = '📍 楼层突破';
                } else if (r.type === 'chest') {
                    title = '💎 发现宝箱';
                } else if (r.type === 'upgrade') {
                    title = '⬆️ 装备升级';
                } else if (r.type === 'shop') {
                    title = '🏪 隐藏商店';
                } else if (r.type === 'swindler') {
                    title = '🦊 奸商';
                }
                combatEvents.push({
                    type: 'dungeon',
                    title: title,
                    text: evtText
                });
            }
        }

        // 每天刷新奴隶市场
        g._slaveMarketCandidates = null;

        // 天数推进
        g.day++;

        // ===== 事件系统 =====
        if (g.eventSystem) {
            const evtResults = g.eventSystem.processDayEnd();
            // 分离日常事件与地下城事件
            const dailyEvents = evtResults.filter(e => e.type === 'daily');
            let dungeonEvents = evtResults.filter(e => e.type === 'dungeon');
            // 合并战斗事件到地下城日志
            if (combatEvents.length > 0) {
                dungeonEvents.push(...combatEvents);
            }
            // 地下城事件存入日志（主界面查看）
            if (dungeonEvents.length > 0) {
                if (!g._dayEventLog) g._dayEventLog = [];
                g._dayEventLog.unshift({ day: g.day, events: dungeonEvents });
                if (g._dayEventLog.length > 30) g._dayEventLog.pop();
            }
            // 日常事件弹窗队列播报
            const afterEvents = () => {
                if (combatQueue.length > 0 && typeof UI !== 'undefined') {
                    UI.showCombatQueue(combatQueue, () => {
                        if (typeof UI !== 'undefined' && G && G.currentState === 'SHOP') {
                            UI.renderShop(G);
                        }
                    });
                } else {
                    if (typeof UI !== 'undefined' && G && G.currentState === 'SHOP') {
                        UI.renderShop(G);
                    }
                }
            };
            if (dailyEvents.length > 0) {
                UI.showToast(`本日发生了 ${dailyEvents.length} 个日常事件`, 'info');
                UI.showEventQueue(dailyEvents, () => {
                    afterEvents();
                });
            } else {
                afterEvents();
            }
        } else {
            if (combatQueue.length > 0 && typeof UI !== 'undefined') {
                UI.showCombatQueue(combatQueue, () => {
                    if (typeof UI !== 'undefined' && G && G.currentState === 'SHOP') {
                        UI.renderShop(G);
                    }
                });
            } else {
                if (typeof UI !== 'undefined' && G && G.currentState === 'SHOP') {
                    UI.renderShop(G);
                }
            }
        }
    }'''

# Build new methods
new_methods = '''    process() {
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
                c.cflag[800] = (c.cflag[800] || 0) + 1;
                const days = c.cflag[800];
                if (days >= 30) {
                    // 分娩
                    c.talent[153] = 0;
                    c.cflag[800] = 0;
                    c.addExp(60, 1); // 生产经验
                    if (!c.talent[188]) c.talent[188] = 1; // 获得母性
                    const child = this._createChild(c);
                    g.characters.push(child);
                    dailyEvents.push({
                        type: 'daily',
                        title: `👶 ${c.name}分娩了`,
                        text: `${c.name}生下了${child.name}（Lv.${child.level}）。\\n新生命加入了魔王城。`
                    });
                } else if (days === 15) {
                    dailyEvents.push({
                        type: 'daily',
                        title: `🤰 ${c.name}的肚子变大了`,
                        text: `${c.name}的妊娠已经过了一半，身体变得敏感而脆弱……`
                    });
                }
            }
        }

        // 领地每日收益
        const income = g.getFacilityIncome ? g.getFacilityIncome() : 0;
        if (income > 0) {
            g.money += income;
        }

        // 勇者入侵判定
        const invader = g.processHeroInvasion();
        if (invader) {
            // 入侵事件会在UI中显示
            g.flag[100] = 1; // 标记有入侵
            g.flag[101] = invader.id; // 入侵者ID
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
        const combatEvents = [];
        const combatQueue = []; // 战斗弹窗队列

        // 记录领地收入事件
        const income = g.getFacilityIncome ? g.getFacilityIncome() : 0;
        if (income > 0) {
            combatEvents.push({
                type: 'dungeon',
                title: `💰 领地收入`,
                text: `魔王领地今日产生${income}G收入（地下城层数发展+俘虏勇者上缴）`
            });
        }

        // 勇者之间相遇事件（伪装/破坏）
        const encounterEvents = g._processHeroEncounters();
        if (encounterEvents.length > 0) {
            for (const evt of encounterEvents) {
                combatEvents.push({
                    type: 'dungeon',
                    title: evt.title,
                    text: evt.text
                });
            }
        }

        // 计算勇者小队（进度重叠的自动组队）
        g._formHeroSquads();
        // 计算前勇者奴隶小队
        g._formSlaveSquads();

        const retreatHeroes = [];
        for (let i = g.invaders.length - 1; i >= 0; i--) {
            const hero = g.invaders[i];
            const result = g.moveHeroDaily(hero);
            // 收集战斗事件
            if (result.results) {
                for (const r of result.results) {
                    if (r.type === 'combat') {
                        const outcome = r.victory ? '胜利' : (r.defeated ? '败北' : '逃脱');
                        combatEvents.push({
                            type: 'dungeon',
                            title: `${r.icon} ${r.name}`,
                            text: `${hero.name} Lv.${hero.level} ${outcome} | ${r.combatLog[r.combatLog.length - 1]}`
                        });
                        // 收集完整战斗数据用于弹窗
                        combatQueue.push({
                            type: 'solo',
                            hero: hero,
                            monster: r.monster,
                            combatLog: r.combatLog,
                            victory: r.victory,
                            defeated: r.defeated,
                            escaped: r.escaped,
                            rounds: r.rounds,
                            drop: r.drop
                        });
                    } else if (r.type === 'scombat') {
                        // 小队战斗：只有队长会触发完整记录
                        const outcome = r.victory ? '胜利' : (r.defeated ? '败北' : '撤退');
                        combatEvents.push({
                            type: 'dungeon',
                            title: `${r.icon} ${r.name}`,
                            text: `${hero.name} Lv.${hero.level} 率领小队${outcome} | ${r.combatLog[r.combatLog.length - 1]}`
                        });
                        // 收集完整战斗数据用于弹窗
                        const squad = g.invaders.filter(h => h.cflag[900] === hero.cflag[900]);
                        combatQueue.push({
                            type: 'squad',
                            hero: hero,
                            heroName: hero.name,
                            squad: squad,
                            monster: r.monster,
                            combatLog: r.combatLog,
                            victory: r.victory,
                            defeated: r.defeated,
                            escaped: r.escaped,
                            rounds: r.rounds,
                            drop: r.drop,
                            isSquad: true
                        });
                    } else if (r.type === 'gold') {
                        combatEvents.push({
                            type: 'dungeon',
                            title: `💰 发现财宝`,
                            text: `${hero.name} ${r.description}（持有:${hero.gold}G）`
                        });
                    } else if (r.type === 'shop') {
                        combatEvents.push({
                            type: 'dungeon',
                            title: `🏪 隐藏商店`,
                            text: `${hero.name} ${r.description}`
                        });
                    } else if (r.type === 'swindler') {
                        combatEvents.push({
                            type: 'dungeon',
                            title: `🦊 奸商`,
                            text: `${hero.name} ${r.description}`
                        });
                    } else if (r.type === 'floor_shop') {
                        combatEvents.push({
                            type: 'dungeon',
                            title: `🏪 地下城商店`,
                            text: `${hero.name} ${r.description}`
                        });
                    } else if (r.type === 'spring') {
                        combatEvents.push({
                            type: 'dungeon',
                            title: `💧 回复泉水`,
                            text: `${hero.name} ${r.description}`
                        });
                    } else if (r.type === 'arena') {
                        const outcome = r.victory ? '胜利' : (r.defeated ? '败北' : '撤退');
                        combatEvents.push({
                            type: 'dungeon',
                            title: `⚔️ 竞技场`,
                            text: `${hero.name} ${r.description} (${outcome})`
                        });
                    } else if (r.type === 'boss') {
                        const outcome = r.victory ? '胜利' : (r.defeated ? '败北' : '撤退');
                        combatEvents.push({
                            type: 'dungeon',
                            title: `⚔️ 守关Boss战`,
                            text: `${hero.name} ${r.description} (${outcome})`
                        });
                    } else if (r.type === 'boss_chest') {
                        combatEvents.push({
                            type: 'dungeon',
                            title: `📦 关底宝箱`,
                            text: `${hero.name} ${r.description}`
                        });
                    }
                }
                // 进度宝箱事件
                if (result.results.chests && result.results.chests.length > 0) {
                    for (const chest of result.results.chests) {
                        const chestName = chest.type === 'legendary' ? '🎁 传说宝箱' : '💎 高级宝箱';
                        const curseWarn = chest.curseTriggered ? ' ⚠️受到诅咒！' : '';
                        const goldText = chest.gold ? ` 💰+${chest.gold}G` : '';
                        combatEvents.push({
                            type: 'dungeon',
                            title: chestName,
                            text: `${hero.name} 在${chest.threshold}%处发现了宝箱！${chest.msg}${curseWarn}${goldText}`
                        });
                    }
                }
            }
            if (result.action === 'retreat_to_town') {
                retreatHeroes.push(hero.name);
                // 不再移除，而是标记为撤退中，之后可与其他勇者组队重新侵略
                hero.cflag[503] = 1;
                hero.hp = Math.min(hero.maxHp, hero.hp + Math.floor(hero.maxHp * 0.3));
                hero.mp = Math.min(hero.maxMp, hero.mp + Math.floor(hero.maxMp * 0.3));
                // 回城镇清除所有非诅咒异常状态
                if (typeof g._tryCureStatusAilment === 'function') {
                    const cured = g._tryCureStatusAilment(hero, "town_rest");
                    if (cured && cured.length > 0) {
                        combatEvents.push({
                            type: 'dungeon',
                            title: '🏥 城镇恢复',
                            text: `${hero.name}在城镇休息，${cured.join('、')}`
                        });
                    }
                }
                // 诅咒只能通过神官解除
                const mask = hero.cflag[920] || 0;
                if ((mask & 1) !== 0) {
                    combatEvents.push({
                        type: 'dungeon',
                        title: '🌑 诅咒缠身',
                        text: `${hero.name}身上的诅咒无法通过普通休息解除...`
                    });
                }
            } else if (result.action === 'camp') {
                // 安营扎寨事件
                const camp = result.campResult;
                if (camp && camp.logs) {
                    combatEvents.push({
                        type: 'dungeon',
                        title: `🏕️ 安营扎寨`,
                        text: `${hero.name} Lv.${hero.level} ${camp.logs.join(' | ')}`
                    });
                }
            } else if (result.action === 'defeat_escape') {
                // 被击败后逃跑成功：侵略度大幅降低，勇者继续入侵
                const cap = result.captureResult;
                let capText = `${hero.name} Lv.${hero.level} 被击败 → ${cap.message} `;
                if (result.floor) {
                    capText += `(退回第${result.floor}层 50%)`;
                } else {
                    capText += `(侵略度-50%)`;
                }
                combatEvents.push({
                    type: 'dungeon',
                    title: `⚔️ 战斗结果`,
                    text: capText
                });
            } else if (result.action === 'captured') {
                // 勇者被俘虏，从入侵者列表移除
                g.invaders.splice(i, 1);
                const cap = result.captureResult;
                let capText = `${hero.name} Lv.${hero.level} 被${result.monster.name}击败 → `;
                if (cap.type === 'surrender') {
                    capText += '投降服从';
                } else {
                    capText += '被俘入狱';
                }
                combatEvents.push({
                    type: 'dungeon',
                    title: `⚔️ 战斗结果`,
                    text: capText
                });
            }
        }
        if (retreatHeroes.length > 0) {
            UI.showToast('勇者 ' + retreatHeroes.join('、') + ' 退回小镇恢复', 'info');
        }

        // 前勇者奴隶每日反向探索
        const slaveExploreResults = g.processSlaveExploreDaily();
        if (slaveExploreResults.length > 0) {
            for (const r of slaveExploreResults) {
                let evtText = `[${r.name}] ${r.text}`;
                let title = '🛡️ 奴隶探索';
                if (r.type === 'complete') {
                    evtText = `🏆 ${r.name} ${r.text}`;
                    title = '🏆 探索完成';
                } else if (r.type === 'floor') {
                    evtText = `📍 ${r.name} ${r.text}`;
                    title = '📍 楼层突破';
                } else if (r.type === 'chest') {
                    title = '💎 发现宝箱';
                } else if (r.type === 'upgrade') {
                    title = '⬆️ 装备升级';
                } else if (r.type === 'shop') {
                    title = '🏪 隐藏商店';
                } else if (r.type === 'swindler') {
                    title = '🦊 奸商';
                }
                combatEvents.push({
                    type: 'dungeon',
                    title: title,
                    text: evtText
                });
            }
        }

        // 合并地下城事件
        let dungeonEvents = g._pendingDungeonEvents || [];
        g._pendingDungeonEvents = null;
        if (combatEvents.length > 0) {
            dungeonEvents.push(...combatEvents);
        }
        // 地下城事件存入日志（更新Phase1的日志条目）
        if (dungeonEvents.length > 0) {
            if (!g._dayEventLog) g._dayEventLog = [];
            // 更新今日第一条日志（Phase1创建的）
            if (g._dayEventLog.length > 0 && g._dayEventLog[0].day === g.day) {
                g._dayEventLog[0].events = dungeonEvents;
            } else {
                g._dayEventLog.unshift({ day: g.day, events: dungeonEvents });
            }
            if (g._dayEventLog.length > 30) g._dayEventLog.pop();
        }

        // 战斗弹窗
        const afterCombats = () => {
            g._dayPhase = 0;
            if (typeof UI !== 'undefined' && G && G.state === 'SHOP') {
                UI.renderShop(G);
            }
        };
        if (combatQueue.length > 0 && typeof UI !== 'undefined') {
            UI.showCombatQueue(combatQueue, () => {
                afterCombats();
            });
        } else {
            afterCombats();
        }
    }'''

if old_method in content:
    content = content.replace(old_method, new_methods)
    with open('D:/KZ PROJECT/js/systems/ShopSystem.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print('SUCCESS: process() split into processPhase1() and processPhase2()')
else:
    print('ERROR: old_method not found in file')
    # Debug: find where process() starts
    idx = content.find('    process() {')
    print(f'process() found at index {idx}')
