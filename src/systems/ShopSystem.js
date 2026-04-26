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
        // V7.1: 道具一次购买无限使用，已拥有则不可重复购买
        if ((this.game.item[itemId] || 0) > 0) {
            UI.showToast(`已拥有 ${item.name}，无需重复购买`, "warning");
            return false;
        }
        if (this.game.money < item.price) {
            UI.showToast("金钱不足！", "danger");
            return false;
        }
        this.game.money -= item.price;
        this.game.item[itemId] = 1;
        UI.showToast(`购买了 ${item.name}（永久拥有）`);
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
            // V7.3: 每日额外恢复5点气力
            if (c.energy !== undefined) {
                c.energy = Math.min(c._maxEnergy || 100, c.energy + 5);
            }
        }

        // Clear TEQUIP
        for (const c of g.characters) {
            c.tequip.fill(0);
        }

        // === V4.1: Stage 5 talent daily fame income ===
        let stage5Count = 0;
        for (const c of g.characters) {
            if (!c.talent) continue;
            // Check all Stage 5 talent IDs (505, 515, 525, 535, 545)
            for (const tid of [505, 515, 525, 535, 545]) {
                if (c.talent[tid] > 0) stage5Count++;
            }
        }
        if (stage5Count > 0) {
            const fameGain = stage5Count * 10;
            g.addFame(fameGain);
            dailyEvents.push({
                type: 'daily',
                title: `🏆 魔王威名远播`,
                text: `共有 ${stage5Count} 位奴隶掌握了至高技艺，地下城声望 +${fameGain}（每位Stage5每天+10）`,
                icon: '🏆'
            });
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

        // V11.0: 势力系统每日更新
        if (g._updateFactionDaily) g._updateFactionDaily();
        // 每10天恢复城市防御耐久度
        if ((g.day || 1) % 10 === 0) {
            if (g._healAllCityDefenses) g._healAllCityDefenses();
        }
        // 四大天王击败后的持续效果：奴隶/前勇者个人声望每天+击败数
        if (g.kingTerritoryStates) {
            const defeatedKings = Object.values(g.kingTerritoryStates).filter(k => k.defeated).length;
            if (defeatedKings > 0) {
                for (const c of g.characters) {
                    if (c !== g.getMaster() && (c.talent[200] || c.talent[296])) {
                        c.fame = (c.fame || 0) + defeatedKings;
                    }
                }
            }
        }
        // 教廷攻破后的持续效果：每日声望+50
        if (g.churchState && g.churchState.defeated) {
            g.addFame(50);
        }

        // V10.0: 重伤长期效果 — 获得重伤>10天后，每天等级-1（最低5级）
        const _processSevereInjuryDecay = (entityList) => {
            for (const c of entityList) {
                if (!c || !c.cflag) continue;
                if (!g._hasStatusAilment(c, 'severe_injury')) continue;
                const injuryDay = c.cflag[CFLAGS.SEVERE_INJURY_DAY] || g.day;
                const daysSince = (g.day || 1) - injuryDay;
                if (daysSince > 10 && c.level > 5) {
                    c.level = Math.max(5, c.level - 1);
                    // 同步等级相关的cflag
                    c.cflag[CFLAGS.BASE_HP] = c.level;
                    // 重新计算属性
                    if (g._recalcBaseStats) g._recalcBaseStats(c);
                    // 恢复满HP/MP（防止属性重算后HP溢出）
                    c.hp = c.maxHp;
                    c.mp = c.maxMp;
                    if (g._addAdventureLog) {
                        g._addAdventureLog(c, 'severe_injury_decay', `因重伤长期未愈，等级下降至 Lv.${c.level}`);
                    }
                }
            }
        };
        _processSevereInjuryDecay(g.characters);
        _processSevereInjuryDecay(g.invaders);

        // V10.0: 小队领袖每5天+1个人声望；高声望勇者每日为魔王带来额外声望
        let squadLeaderBonus = 0;
        let highFameBonus = 0;
        const day = g.day || 1;
        for (const hero of g.invaders) {
            if (!hero) continue;
            // 小队领袖：每5天+1个人声望
            if (hero.cflag[CFLAGS.SQUAD_LEADER] === 1 && day % 5 === 0) {
                hero.fame = (hero.fame || 0) + 1;
                squadLeaderBonus++;
            }
            // 高声望勇者：个人声望≥300 +5/天，≥500 +10/天（取最高值）
            const hf = hero.fame || 0;
            if (hf >= 500) {
                highFameBonus = Math.max(highFameBonus, 10);
            } else if (hf >= 300) {
                highFameBonus = Math.max(highFameBonus, 5);
            }
        }
        if (squadLeaderBonus > 0) {
            dailyEvents.push({
                type: 'daily',
                title: `👑 小队领袖声望`,
                text: `${squadLeaderBonus} 位小队领袖获得领袖威望，个人声望 +1`,
                icon: '👑'
            });
        }
        if (highFameBonus > 0) {
            g.addFame(highFameBonus);
            dailyEvents.push({
                type: 'daily',
                title: `🏆 勇者威名`,
                text: `入侵者中有人声名显赫，魔王声望 +${highFameBonus}`,
                icon: '🏆'
            });
        }

        // 勇者入侵判定（新版：批量刷新）
        let invasionEvent = null;
        const newcomers = g.refreshHeroInvaders();
        if (newcomers.length > 0) {
            g.flag[100] = 1; // 标记有入侵
            let invaderNames = newcomers.map(h => `${h.name} Lv.${h.level}`).join(',');
            const goalInfo = newcomers.length === 1 ? `
攻略目标：${HERO_GOAL_DEFS[newcomers[0].cflag[CFLAGS.HERO_LEVEL]]?.name || '讨伐魔王'}` : '';
            invasionEvent = {
                type: 'invasion',
                title: `⚔️ ${newcomers.length}名勇者入侵！`,
                text: `今日有${newcomers.length}名勇者踏入了地下城！
${invaderNames}${goalInfo}

当前地下城勇者：${g.invaders.length}/${g.getHeroTargetCount()}人`
            };
        }

        // V10.0: 未归属堕落种族勇者每日腐化收益
        for (const hero of g.invaders) {
            if (hero.cflag[CFLAGS.FALLEN_RACE_ID] && !hero.cflag[CFLAGS.IS_DEMON_ARMY]) {
                const oldYield = hero.cflag[CFLAGS.CORRUPTION_YIELD] || 0;
                const newYield = oldYield + 10;
                hero.cflag[CFLAGS.CORRUPTION_YIELD] = newYield;
                if (newYield >= 100 && oldYield < 100) {
                    // 达到叛逃阈值，标记为即将叛逃
                    hero._willBetray = true;
                }
            }
        }

        // 每天刷新奴隶市场
        g._slaveMarketCandidates = null;

        // 天数推进
        g.day++;

        // V12.0: 4件诅咒装备/武器——角色直接投降加入魔王军
        if (typeof GearSystem !== 'undefined' && GearSystem.countCursedGear) {
            for (let i = g.invaders.length - 1; i >= 0; i--) {
                const hero = g.invaders[i];
                if (GearSystem.countCursedGear(hero) >= 4) {
                    g.invaders.splice(i, 1);
                    g.prisoners.push(hero);
                    dailyEvents.push({
                        type: 'daily',
                        title: `🌑 ${hero.name}被诅咒吞噬了`,
                        text: `${hero.name}身上承载了太多诅咒，精神崩溃，在地下城中跪地投降，成为了魔王的俘虏...`,
                        icon: '🌑'
                    });
                }
            }
        }

        // ===== 事件系统：魔王日常事件（Phase1）=====
        if (g.eventSystem) {
            const evtResults = g.eventSystem.processMasterDaily();
            dailyEvents.push(...evtResults);
            // 日常事件弹窗队列播报
            const afterDaily = () => {
                g._dayPhase = 1;
                g.phase = 'adventure'; // V12.0
                if (typeof UI !== 'undefined' && G && G.state === 'SHOP') {
                    UI.renderShop(G);
                }
            };
            // V10.1: 勇者入侵与日常事件分离显示
            const showNext = () => {
                if (dailyEvents.length > 0) {
                    UI.showToast(`本日发生了 ${dailyEvents.length} 个日常事件`, 'info');
                    UI.showEventQueue(dailyEvents, () => {
                        afterDaily();
                    });
                } else {
                    afterDaily();
                }
            };
            if (invasionEvent) {
                UI.showEventQueue([invasionEvent], () => {
                    showNext();
                });
            } else {
                showNext();
            }
        } else {
            g._dayPhase = 1;
            g.phase = 'adventure'; // V12.0
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

            // V12.0: 古代遗物buff过期检查
            const currentDay = g.day || 1;
            for (const hero of g.invaders) {
                try {
                    const relicBuffs = JSON.parse(hero.cstr[CSTRS.RELIC_BUFFS] || '[]');
                    const activeBuffs = [];
                    for (const buff of relicBuffs) {
                        if (buff.expire >= currentDay) {
                            activeBuffs.push(buff);
                        } else {
                            // buff过期，尝试还原属性（近似）
                            const ratio = 1 + (buff.val || 0);
                            if (buff.stat === 'atk' && hero.atk > 0) hero.atk = Math.max(1, Math.floor(hero.atk / ratio));
                            else if (buff.stat === 'def' && hero.def > 0) hero.def = Math.max(1, Math.floor(hero.def / ratio));
                            else if (buff.stat === 'spd' && hero.spd > 0) hero.spd = Math.max(1, Math.floor(hero.spd / ratio));
                            else if (buff.stat === 'mpPct' && hero.maxMp > 0) hero.maxMp = Math.max(1, Math.floor(hero.maxMp / ratio));
                        }
                    }
                    if (activeBuffs.length !== relicBuffs.length) {
                        hero.cstr[CSTRS.RELIC_BUFFS] = JSON.stringify(activeBuffs);
                    }
                } catch (e) { /* ignore parse error */ }
            }

            // V12.0: 冒险日常事件（勇者地下城事件+魔王军冒险事件）
            if (g.eventSystem && g.eventSystem.processAdventureDaily) {
                const adventureEvents = g.eventSystem.processAdventureDaily();
                for (const evt of adventureEvents) {
                    if (evt.type === 'dungeon') {
                        phase2Queue.push({
                            type: 'event', tag: '冒险', tagIcon: '🏰', tagColor: 'var(--info)',
                            title: evt.title || '🏰 地下城事件',
                            text: evt.text || evt.description || ''
                        });
                    } else if (evt.type === 'demon_army') {
                        phase2Queue.push({
                            type: 'event', tag: '魔军', tagIcon: '👿', tagColor: 'var(--danger)',
                            title: evt.title || '👿 魔王军冒险',
                            text: evt.text || ''
                        });
                    } else if (evt.type === 'demon_squad') {
                        phase2Queue.push({
                            type: 'event', tag: '魔军小队', tagIcon: '👿', tagColor: 'var(--danger)',
                            title: evt.title || '👿 魔王军小队事件',
                            text: evt.text || ''
                        });
                    } else if (evt.type === 'master_raid') {
                        phase2Queue.push({
                            type: 'event', tag: '魔王', tagIcon: '👑', tagColor: 'var(--accent)',
                            title: evt.title || '👑 魔王出击',
                            text: evt.text || ''
                        });
                    }
                }
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

            // V10.0: 堕落种族勇者叛逃处理
            const betrayedHeroes = [];
            for (let i = g.invaders.length - 1; i >= 0; i--) {
                const hero = g.invaders[i];
                if (hero._willBetray) {
                    const squadId = hero.cflag[CFLAGS.SQUAD_ID] || 0;
                    const floorId = g.getHeroFloor(hero);
                    const raceName = (window.APPEARANCE_DESC_DEFS && window.APPEARANCE_DESC_DEFS.race && window.APPEARANCE_DESC_DEFS.race[hero.cflag[CFLAGS.FALLEN_RACE_ID]]) || '背教者';
                    betrayedHeroes.push({ hero, squadId, floorId, raceName });
                    // 从 invaders 移除
                    g.invaders.splice(i, 1);
                    // 清除小队标记
                    hero.cflag[CFLAGS.SQUAD_ID] = 0;
                    hero.cflag[CFLAGS.SQUAD_LEADER] = 0;
                    delete hero._willBetray;
                }
            }
            for (const b of betrayedHeroes) {
                if (b.squadId > 0) {
                    // 通知同队成员
                    const squadMates = g.invaders.filter(h => (h.cflag[CFLAGS.SQUAD_ID] || 0) === b.squadId);
                    const mateNames = squadMates.map(h => h.name).join('、');
                    phase2Queue.push({
                        type: 'event', tag: '叛逃', tagIcon: '😈', tagColor: '#8844aa',
                        title: `😈 ${b.hero.name} 叛逃了！`,
                        text: `${b.hero.name}（${b.raceName}）在地下城第${b.floorId}层彻底堕落，背叛了勇者小队！${mateNames ? '\n同队成员：' + mateNames + ' 受到了冲击。' : ''}`
                    });
                } else {
                    phase2Queue.push({
                        type: 'event', tag: '叛逃', tagIcon: '😈', tagColor: '#8844aa',
                        title: `😈 ${b.hero.name} 叛逃了！`,
                        text: `${b.hero.name}（${b.raceName}）在地下城第${b.floorId}层彻底堕落，加入了魔王的阵营...`
                    });
                }
            }

            // V7.0: 更新同队勇者组队天数
            g._updateSquadRomanceTimers();

            // V7.0: 勇者之间恋爱/亲密事件
            g._processHeroRelationships(phase2Queue);

            // V8.0: 每日稀有度升级检查（基于个人声望动态晋升，仅记录履历，不弹窗）
            // 检查所有角色：勇者 + 奴隶/前勇者
            const checkedRarity = new Set();
            for (const hero of g.invaders) {
                if (hero.hp <= 0) continue;
                checkedRarity.add(hero);
                const newRarity = g._checkHeroRarityUpgrade(hero);
                if (newRarity) {
                    g._addAdventureLog(hero, 'rarity_up', `稀有度晋升为【${newRarity}】`);
                }
            }
            for (let i = 0; i < g.characters.length; i++) {
                if (i === g.master) continue;
                const c = g.characters[i];
                if (!c || checkedRarity.has(c)) continue;
                const newRarity = g._checkHeroRarityUpgrade(c);
                if (newRarity) {
                    g._addAdventureLog(c, 'rarity_up', `稀有度晋升为【${newRarity}】`);
                }
            }

            // V9.0: 俘虏调教路线 Stage 3 自动转化
            const autoConverted = g._checkPrisonerAutoConvert();
            if (autoConverted.length > 0) {
                for (const name of autoConverted) {
                    phase2Queue.push({
                        type: 'event', tag: '转化', tagIcon: '⛓️', tagColor: 'var(--success)',
                        title: `⛓️ ${name} 自动转化`,
                        text: `${name}的调教路线达到了 Stage III，已自动转化为魔王军。`
                    });
                }
            }

            // V7.2: 异常状态每日结算（战斗中未结束的异常在每日继续生效）
            for (const hero of g.invaders) {
                if (hero.hp <= 0) continue;
                const logs = g._processStatusAilmentTurn(hero);
                for (const log of logs) {
                    g._addAdventureLog(hero, 'status', log);
                }
            }

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

            // V12.0: 修炼任务处理（在移动之前）
            for (const hero of g.invaders) {
                if ((hero.cflag[CFLAGS.HERO_TASK_TYPE] || 0) === 4) {
                    const trainDays = hero.cflag[CFLAGS.HERO_REASON] || 1;
                    const startDay = hero.cflag[CFLAGS.HERO_ORIGIN] || g.day;
                    const elapsed = g.day - startDay;
                    if (elapsed >= trainDays) {
                        // 修炼完成
                        const rewardGold = 200 + hero.level * 20;
                        hero.gold += rewardGold;
                        hero.fame += 3;
                        g.addFame(2);
                        // 等级微升
                        if (typeof g._levelUpEntity === 'function') {
                            g._levelUpEntity(hero, 1);
                        } else {
                            hero.level += 1;
                        }
                        g._recalcBaseStats(hero);
                        phase2Queue.push({
                            type: 'event', tag: '修炼', tagIcon: '🧘', tagColor: 'var(--success)',
                            title: `🧘 ${hero.name}修炼完成`,
                            text: `在铁砧镇修炼了${trainDays}天，等级升至Lv.${hero.level}，获得${rewardGold}G、声望+3`
                        });
                        g.clearHeroTask(hero);
                        g.generateHeroTask(hero);
                    } else {
                        // 仍在修炼中，不移动
                        phase2Queue.push({
                            type: 'event', tag: '修炼', tagIcon: '🧘', tagColor: 'var(--accent)',
                            title: `🧘 ${hero.name}修炼中`,
                            text: `第${elapsed + 1}/${trainDays}天修炼中...EXP正在积累`
                        });
                        // 标记今日已触发事件，跳过移动
                        hero.cflag[CFLAGS.SPY_SENT] = 1;
                    }
                }
            }

            const retreatHeroes = [];
            const processedSquadRetreats = new Set(); // 已生成回城事件的小队ID
            for (let i = g.invaders.length - 1; i >= 0; i--) {
                const hero = g.invaders[i];
                const result = g.moveHeroDaily(hero);

                // V7.3: 小队成员完全跳过独立事件生成（由队长统一代表）
                if (result.action === 'squad_member') continue;

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

                // 勇者目标（固定显示）
                const goalId = hero.cflag[CFLAGS.HERO_LEVEL];
                const goalDef = goalId && HERO_GOAL_DEFS[goalId] ? HERO_GOAL_DEFS[goalId] : null;
                const goalText = goalDef ? `【${goalDef.icon} ${goalDef.name}】` : '';

                // 把移动概览+探索详情合并为一个事件弹窗
                let eventText = moveOverview;
                if (exploreDetails.length > 0) {
                    eventText += '\\n\\n' + exploreDetails.join('\\n');
                }
                if (eventText) {
                    // V7.3: 队长的事件弹窗以小队名义显示
                    const squadId = hero.cflag[CFLAGS.SQUAD_ID] || 0;
                    const squadName = hero.cstr[CSTRS.NAME_ALT] || '';
                    const isLeader = hero.cflag[CFLAGS.SQUAD_LEADER] === 1;
                    let displayName = hero.name;
                    if (squadName && isLeader && squadId > 0 && squadId < 100) {
                        displayName = `「${squadName}」小队`;
                    }
                    phase2Queue.push({
                        type: 'event', tag: '行动', tagIcon: '🚶', tagColor: 'var(--info)',
                        title: `${displayName}的行动 ${goalText}`,
                        text: `<div style="white-space:pre-wrap;line-height:1.6;font-size:0.9rem;">${eventText}</div>`
                    });
                }

                // 撤退/恢复/俘虏等状态事件
                if (result.action === 'retreat_to_town') {
                    retreatHeroes.push(hero.name);
                    hero.cflag[503] = 1;
                    hero.cflag[CFLAGS.SPY_TARGET] = 0; // 回城恢复后解除低调状态
                    hero.hp = Math.min(hero.maxHp, hero.hp + Math.floor(hero.maxHp * 0.3));
                    hero.mp = Math.min(hero.maxMp, hero.mp + Math.floor(hero.maxMp * 0.3));

                    // V12.0: 城镇服务——旅店/净化/鉴定
                    let townServices = [];

                    // 1. 旅店：恢复HP/MP至满，费用=等级×10G
                    const innCost = hero.level * 10;
                    if (hero.gold >= innCost) {
                        hero.gold -= innCost;
                        const healHp = hero.maxHp - hero.hp;
                        const healMp = hero.maxMp - hero.mp;
                        hero.hp = hero.maxHp;
                        hero.mp = hero.maxMp;
                        townServices.push(`🏨 旅店休息（-${innCost}G）：HP/MP恢复满`);
                    } else {
                        // 金币不足，只进行基础恢复
                        hero.hp = Math.min(hero.maxHp, hero.hp + Math.floor(hero.maxHp * 0.3));
                        hero.mp = Math.min(hero.maxMp, hero.mp + Math.floor(hero.maxMp * 0.3));
                        townServices.push(`🏨 旅店休息（金币不足）：HP/MP恢复30%`);
                    }

                    // 2. 净化神殿：解除诅咒装备，费用=诅咒件数×100G
                    if (typeof GearSystem !== 'undefined' && GearSystem.countCursedGear) {
                        const curseCount = GearSystem.countCursedGear(hero);
                        if (curseCount > 0) {
                            const templeCost = curseCount * 100;
                            if (hero.gold >= templeCost) {
                                hero.gold -= templeCost;
                                const uncurseResult = GearSystem.uncurseAllGear(hero);
                                townServices.push(`⛪ 净化神殿（-${templeCost}G）：解除${uncurseResult.count}件诅咒`);
                            } else {
                                townServices.push(`⛪ 净化神殿（金币不足）：身上${curseCount}件诅咒装备无法解除`);
                            }
                        }
                    }

                    // 3. 鉴定所：鉴定所有未鉴定物品，费用=件数×50G
                    let identifiedCount = 0;
                    if (hero.gear) {
                        const allGear = [hero.gear.head, hero.gear.body, hero.gear.legs, hero.gear.hands, hero.gear.neck, hero.gear.ring, ...(hero.gear.weapons || [])];
                        let unidentifiedCount = 0;
                        for (const g of allGear) {
                            if (g && !g.identified) unidentifiedCount++;
                        }
                        const identifyCost = unidentifiedCount * 50;
                        if (unidentifiedCount > 0 && hero.gold >= identifyCost) {
                            hero.gold -= identifyCost;
                            for (const g of allGear) {
                                if (g && !g.identified) {
                                    GearSystem.identifyGear(g);
                                    identifiedCount++;
                                }
                            }
                            townServices.push(`🔍 鉴定所（-${identifyCost}G）：鉴定了${identifiedCount}件装备`);
                        } else if (unidentifiedCount > 0) {
                            townServices.push(`🔍 鉴定所（金币不足）：${unidentifiedCount}件未鉴定装备`);
                        }
                    }
                    if (identifiedCount > 0 && g._addAdventureLog) {
                        g._addAdventureLog(hero, 'identify', `回城镇后鉴定了${identifiedCount}件装备`);
                    }

                    // V7.3: 小队回城事件合并——同小队只弹一次
                    const squadId = hero.cflag[CFLAGS.SQUAD_ID] || 0;
                    const squadName = hero.cstr[CSTRS.NAME_ALT] || '';
                    let skipEvent = false;
                    if (squadId > 0 && squadId < 100) {
                        if (processedSquadRetreats.has(squadId)) {
                            skipEvent = true;
                        } else {
                            processedSquadRetreats.add(squadId);
                        }
                    }

                    if (!skipEvent) {
                        let retreatText;
                        if (squadName && squadId > 0 && squadId < 100) {
                            // 收集该小队所有回城成员的名字
                            const retreatMembers = g.invaders.filter(h => {
                                const sid = h.cflag[CFLAGS.SQUAD_ID] || 0;
                                const tt = h.cflag[CFLAGS.HERO_TASK_TYPE] || 0;
                                return sid === squadId && tt === 3;
                            }).map(h => h.name);
                            retreatText = `小队「${squadName}」撤退回城镇恢复。成员：${retreatMembers.join('、')}`;
                        } else {
                            retreatText = `${hero.name}撤退回城镇恢复。`;
                        }
                        // V12.0: 城镇服务详情
                        if (townServices.length > 0) {
                            retreatText += '\n\n【铁砧镇服务】';
                            for (const svc of townServices) {
                                retreatText += '\n' + svc;
                            }
                            retreatText += `\n💰 剩余金币：${hero.gold}G`;
                        }
                        if (typeof g._tryCureStatusAilment === 'function') {
                            const cured = g._tryCureStatusAilment(hero, "town_rest");
                            if (cured && cured.length > 0) retreatText += `
解除状态：${cured.join(',')}`;
                        }
                        // V7.2: 兜底清除重伤（即使_tryCureStatusAilment未处理到）
                        const hadSevere = typeof g._hasStatusAilment === 'function' && g._hasStatusAilment(hero, 'severe_injury');
                        if (typeof g._removeStatusAilment === 'function') {
                            g._removeStatusAilment(hero, 'severe_injury');
                        }
                        if (hadSevere) {
                            g._addAdventureLog(hero, 'injury_healed', '在城镇休息，重伤得到缓解');
                        }
                        phase2Queue.push({
                            type: 'event', tag: '恢复', tagIcon: '🏥', tagColor: 'var(--success)',
                            title: squadName && squadId > 0 && squadId < 100 ? `🏥 ${squadName} 回城恢复` : '🏥 城镇恢复',
                            text: retreatText
                        });
                    }
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
                    // _imprisonHero 已在 moveHeroDaily 中移除了该勇者，无需再次 splice
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
                            g._addAdventureLog(hero, 'commission_complete', `完成委托「${comDef.name}」，获得${comDef.rewardGold}G、声望+${comDef.rewardFame}`);
                        } else {
                            taskRewardText = '委托完成！';
                        }
                    } else if (taskType === 3) {
                        taskRewardText = '回城恢复完成，伤势已好转';
                    } else if (taskType === 4) {
                        // 修炼奖励（已在上方处理，此处仅为保险）
                        taskRewardText = '修炼完成，实力有所提升';
                    } else if (taskType === 5) {
                        // 寻找真相奖励
                        const rewardGold = 300 + hero.level * 30;
                        hero.gold += rewardGold;
                        hero.fame += 4;
                        g.addFame(3);
                        taskRewardText = `发现了关于魔王的线索！获得${rewardGold}G，个人声望+4，魔王声望+3`;
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
            // V12.0: 收集出击小队队长，队员由队长统一处理
            const processedDemonSquads = new Set();
            for (let i = g.characters.length - 1; i >= 0; i--) {
                const slave = g.characters[i];
                const isMaster = g.getMaster() === slave;
                if (!slave.talent[200] && !isMaster) continue; // 不是前勇者奴隶也不是魔王
                if ((slave.cflag[CFLAGS.SLAVE_TASK_TYPE] || 0) === 0) continue; // 无任务
                // V12.0: 出击小队队员跳过独立执行，由队长统一处理
                const taskType = slave.cflag[CFLAGS.SLAVE_TASK_TYPE] || 0;
                const squadMarker = slave.cflag[998] || 0;
                if (taskType === 1 && squadMarker > 0 && slave.cflag[CFLAGS.SQUAD_LEADER] !== 1) {
                    continue; // 出击小队队员跳过，由队长统一处理
                }
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

            // V12.0: 地下城事件已通过 processAdventureDaily 直接加入 phase2Queue
            // 冒险日志由 phase2Queue 统一处理
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
            g.phase = 'train'; // V12.0
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

        child.cflag[CFLAGS.HERO_RARITY] = 'N'; // 稀有度默认为N
        return child;
    }
}

window.ShopSystem = ShopSystem;
window.DayEndSystem = DayEndSystem;
