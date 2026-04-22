import sys, re
sys.stdout.reconfigure(encoding='utf-8')

# ========== 1. Modify UI.js: add showPhase2Queue ==========
with open('D:/KZ PROJECT/js/ui/UI.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add showPhase2Queue before showEventQueue
old_event_queue = '''    // ========== 事件弹窗队列（NSFW日常事件播报） ==========
    _eventQueue: [],
    _eventQueueIndex: 0,
    _eventQueueOnDone: null,

    showEventQueue(events, onDone) {'''

new_phase2_queue = '''    // ========== Phase2 统一队列（事件+战斗轮播） ==========
    _phase2Queue: [],
    _phase2Index: 0,
    _phase2OnDone: null,

    showPhase2Queue(queue, onDone) {
        if (!queue || queue.length === 0) {
            if (onDone) onDone();
            return;
        }
        this._phase2Queue = queue;
        this._phase2Index = 0;
        this._phase2OnDone = onDone;
        this._showPhase2Step();
    },

    _showPhase2Step() {
        const item = this._phase2Queue[this._phase2Index];
        if (!item) {
            if (this._phase2OnDone) {
                const cb = this._phase2OnDone;
                this._phase2OnDone = null;
                cb();
            }
            return;
        }
        const isLast = this._phase2Index >= this._phase2Queue.length - 1;
        const btnText = isLast ? `关闭` : `下一个 (${this._phase2Index + 1}/${this._phase2Queue.length})`;
        const btnClass = isLast ? `game-btn` : `game-btn accent`;

        if (item.type === 'combat') {
            // 战斗：使用 combat modal，但设置单元素队列和自定义回调
            this._combatQueue = [item.battle];
            this._combatIndex = 0;
            this._combatOnComplete = () => {
                this._phase2Index++;
                this._showPhase2Step();
            };
            this._initCombatModal();
            this._startCombatBattle();
        } else {
            // 事件：使用 modal
            const tagColor = item.tagColor || 'var(--info)';
            const tagIcon = item.tagIcon || '📜';
            const body = `
                <div style="text-align:center;margin-bottom:10px;">
                    <span style="display:inline-block;padding:2px 8px;border-radius:4px;background:${tagColor}22;color:${tagColor};font-size:0.75rem;font-weight:bold;">${tagIcon} ${item.tag || '事件'}</span>
                </div>
                <div style="white-space:pre-wrap;line-height:1.6;font-size:0.9rem;">${item.text || ''}</div>
                <div style="display:flex;justify-content:center;margin-top:16px;gap:10px;">
                    <button class="${btnClass}" onclick="UI._phase2Index++; UI._showPhase2Step();">${btnText}</button>
                </div>
            `;
            this.showModal(item.title || `事件`, body);
        }
    },

    // ========== 事件弹窗队列（NSFW日常事件播报） ==========
    _eventQueue: [],
    _eventQueueIndex: 0,
    _eventQueueOnDone: null,

    showEventQueue(events, onDone) {'''

if old_event_queue in content:
    content = content.replace(old_event_queue, new_phase2_queue)
    print('✅ UI.showPhase2Queue added')
else:
    print('❌ UI.showPhase2Queue insert point not found')

with open('D:/KZ PROJECT/js/ui/UI.js', 'w', encoding='utf-8') as f:
    f.write(content)

# ========== 2. Modify ShopSystem.js: processPhase2 to use phase2Queue ==========
with open('D:/KZ PROJECT/js/systems/ShopSystem.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the entire combatEvents/combatQueue collection logic
old_phase2_logic = '''    processPhase2() {
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
            } else if (result.action === 'defeat_escape') {
                if (result.floor) {
                    moveOverview = `📍 ${hero.name} 战败逃跑 → 退回第${result.floor}层 50%`;
                } else {
                    const oldProg = hero.cflag[502] + 50;
                    moveOverview = `📍 ${hero.name} 战败逃跑 → 后退50% → 第${floorId}层 ${hero.cflag[502]}%`;
                }
            } else if (result.action === 'captured') {
                moveOverview = `📍 ${hero.name} 战败 → 被怪物俘虏`;
            } else if (result.action === 'boss_victory') {
                moveOverview = `📍 ${hero.name} 击败Boss → 进入第${result.floor}层 0%`;
            }
            if (moveOverview) {
                combatEvents.push({ type: 'dungeon', title: `🚶 ${hero.name}的行动`, text: moveOverview });
            }

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
                            type: 'team',
                            hero: hero,
                            monster: r.monster,
                            leftTeam: r.leftTeam,
                            rightTeam: r.rightTeam,
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
                            type: 'team',
                            hero: hero,
                            heroName: hero.name,
                            squad: squad,
                            monster: r.monster,
                            leftTeam: r.leftTeam,
                            rightTeam: r.rightTeam,
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

# This is too large for string matching. Let me read the file and replace by line range.
print('Skip large replacement, use line-based edit')

with open('D:/KZ PROJECT/js/systems/ShopSystem.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find processPhase2 start and end
start_idx = None
end_idx = None
for i, line in enumerate(lines):
    if '    processPhase2()' in line:
        start_idx = i
    if start_idx is not None and end_idx is None:
        # Find the end of processPhase2 (next method at same indentation or class end)
        if i > start_idx and (line.startswith('    }') or line.startswith('\t}')) and line.strip() == '}':
            # Check if this is the closing brace of processPhase2
            # We need to track brace depth
            pass

# Actually, let's find the line that starts processPhase2 and the line after it ends
brace_depth = 0
for i in range(start_idx, len(lines)):
    line = lines[i]
    if '{' in line:
        brace_depth += line.count('{')
    if '}' in line:
        brace_depth -= line.count('}')
    if brace_depth == 0 and i > start_idx:
        end_idx = i
        break

print(f'processPhase2: lines {start_idx+1} to {end_idx+1}')

# Build new processPhase2
new_method = '''    processPhase2() {
        const g = this.game;
        const phase2Queue = []; // 统一队列：事件+战斗

        // 记录领地收入事件
        const income = g.getFacilityIncome ? g.getFacilityIncome() : 0;
        if (income > 0) {
            phase2Queue.push({
                type: 'event', tag: '领地', tagIcon: '💰', tagColor: 'var(--success)',
                title: '💰 领地收入',
                text: `魔王领地今日产生${income}G收入（地下城层数发展+俘虏勇者上缴）`
            });
        }

        // 勇者之间相遇事件（伪装/破坏）
        const encounterEvents = g._processHeroEncounters();
        if (encounterEvents.length > 0) {
            for (const evt of encounterEvents) {
                phase2Queue.push({
                    type: 'event', tag: '遭遇', tagIcon: '🗡️', tagColor: 'var(--danger)',
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
            } else if (result.action === 'defeat_escape') {
                if (result.floor) {
                    moveOverview = `📍 ${hero.name} 战败逃跑 → 退回第${result.floor}层 50%`;
                } else {
                    moveOverview = `📍 ${hero.name} 战败逃跑 → 后退50% → 第${floorId}层 ${hero.cflag[502]}%`;
                }
            } else if (result.action === 'captured') {
                moveOverview = `📍 ${hero.name} 战败 → 被怪物俘虏`;
            } else if (result.action === 'boss_victory') {
                moveOverview = `📍 ${hero.name} 击败Boss → 进入第${result.floor}层 0%`;
            }

            // 收集该勇者的非战斗探索详情
            let exploreDetails = [];
            if (result.results) {
                for (const r of result.results) {
                    if (r.type === 'combat' || r.type === 'scombat') {
                        // 战斗放入 phase2Queue
                        phase2Queue.push({
                            type: 'combat',
                            battle: {
                                type: 'team',
                                hero: hero,
                                heroName: r.type === 'scombat' ? hero.name : undefined,
                                squad: r.type === 'scombat' ? g.invaders.filter(h => h.cflag[900] === hero.cflag[900]) : undefined,
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
                        const outcome = r.victory ? '胜利' : (r.defeated ? '败北' : '撤退');
                        exploreDetails.push(`⚔️ 竞技场：${r.description} (${outcome})`);
                    } else if (r.type === 'event') {
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

            // 把移动概览+探索详情合并为一个事件弹窗
            let eventText = moveOverview;
            if (exploreDetails.length > 0) {
                eventText += '\n\n' + exploreDetails.join('\n');
            }
            if (eventText) {
                phase2Queue.push({
                    type: 'event', tag: '行动', tagIcon: '🚶', tagColor: 'var(--info)',
                    title: `${hero.name}的行动`,
                    text: eventText
                });
            }

            // 撤退/恢复/俘虏等状态事件
            if (result.action === 'retreat_to_town') {
                retreatHeroes.push(hero.name);
                hero.cflag[503] = 1;
                hero.hp = Math.min(hero.maxHp, hero.hp + Math.floor(hero.maxHp * 0.3));
                hero.mp = Math.min(hero.maxMp, hero.mp + Math.floor(hero.maxMp * 0.3));
                let retreatText = `${hero.name}撤退回城镇恢复。`;
                if (typeof g._tryCureStatusAilment === 'function') {
                    const cured = g._tryCureStatusAilment(hero, "town_rest");
                    if (cured && cured.length > 0) retreatText += `\n解除状态：${cured.join('、')}`;
                }
                const mask = hero.cflag[920] || 0;
                if ((mask & 1) !== 0) retreatText += `\n🌑 诅咒无法通过普通休息解除...`;
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
                        text: `${hero.name} Lv.${hero.level}\n${camp.logs.join('\n')}`
                    });
                }
            } else if (result.action === 'defeat_escape') {
                const cap = result.captureResult;
                let capText = `${hero.name} Lv.${hero.level} 被击败 → ${cap.message}`;
                if (result.floor) capText += `\n退回第${result.floor}层 50%`;
                else capText += `\n侵略度-50%`;
                phase2Queue.push({
                    type: 'event', tag: '战败', tagIcon: '⚔️', tagColor: 'var(--danger)',
                    title: '⚔️ 战败逃跑',
                    text: capText
                });
            } else if (result.action === 'captured') {
                g.invaders.splice(i, 1);
                const cap = result.captureResult;
                const capType = cap.type === 'surrender' ? '投降服从' : '被俘入狱';
                phase2Queue.push({
                    type: 'event', tag: '俘虏', tagIcon: '⛓️', tagColor: 'var(--danger)',
                    title: '⛓️ 勇者被俘',
                    text: `${hero.name} Lv.${hero.level} 被${result.monster.name}击败 → ${capType}`
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
'''

# Replace lines
if start_idx is not None and end_idx is not None:
    new_lines = lines[:start_idx] + [new_method] + lines[end_idx+1:]
    with open('D:/KZ PROJECT/js/systems/ShopSystem.js', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print(f'✅ ShopSystem.processPhase2 replaced ({start_idx+1}-{end_idx+1})')
else:
    print('❌ Could not find processPhase2 boundaries')

print('Done')
