/**
 * RelationSystem — extracted from Game.js
 */
Game.prototype._processHeroEncounters = function() {
        const results = [];
        const processed = new Set(); // 避免重复处理

        for (let i = 0; i < this.invaders.length; i++) {
            for (let j = i + 1; j < this.invaders.length; j++) {
                const a = this.invaders[i];
                const b = this.invaders[j];

                // 检查是否在同一】
                if (this.getHeroFloor(a) !== this.getHeroFloor(b)) continue;

                const pairKey = `${a.name}_${b.name}`;
                if (processed.has(pairKey)) continue;
                processed.add(pairKey);

                // 25%概率触发相遇
                if (RAND(100) >= 25) continue;

                // 每日事件限制：双方（或所在小队）今天已触发事件则跳过
                if (this._hasTriggeredDailyEvent(a) || this._hasTriggeredDailyEvent(b)) continue;

                // 检查委托：寻找勇者（双方都可能完成委托）
                this._checkCommissionComplete(a, 'meet_hero');
                this._checkCommissionComplete(b, 'meet_hero');

                // 随机选择发起】
                const actor = RAND(2) === 0 ? a : b;
                const target = actor === a ? b : a;

                // 获取两人关系
                const rel = this._getHeroRelation(actor, target);
                const isFirstMeet = rel.history.length === 0;

                // 发起者决定行动
                let action = 'none';
                if (actor.cflag[912] && target.cflag[912]) {
                    // 双方都是伪装者（奴隶/间谍）：绝不内战，自发组队互助
                    action = 'spy_teamup';
                } else if (actor.cflag[912]) {
                    // 伪装者对普通勇者执行破坏
                    action = 'disguise';
                } else if (target.cflag[912]) {
                    // 普通勇者遇到伪装者：伪装者可能主动出手
                    action = 'disguise';
                } else if (isFirstMeet && RAND(100) < 60) {
                    // 初次相遇：较高概率自发组队
                    action = 'first_teamup';
                } else if (rel.level <= 0) {
                    // 不死不休：必定内战
                    action = 'combat';
                } else if (rel.level >= 4 && RAND(100) < 40) {
                    // 莫逆之交：有概率互相增益
                    action = 'help';
                } else {
                    // 普通勇者：根据关系调整内战概率
                    action = this._decideHeroEncounterAction(actor, rel.level);
                }

                if (action === 'combat') {
                    // 直接对战
                    const combatResult = this._doHeroVsHeroCombat(actor, target);
                    // 内战导致关系恶化
                    const combat = combatResult.combat;
                    if (!combat.victory && !combat.defeated) {
                        // 平手（50回合不分胜负）：关系破裂
                        if (rel.level > 0) {
                            this._setHeroRelation(actor, target, -rel.level, 'combat');
                        }
                    } else {
                        // 有胜负：双方关系-2（最低0）
                        this._setHeroRelation(actor, target, -2, 'combat');
                    }
                    this._markDailyEventTriggered(actor);
                    this._markDailyEventTriggered(target);
                    results.push({
                        type: 'combat',
                        title: `⚔️ 勇者内战`,
                        text: combatResult.text,
                        battle: {
                            type: 'team',
                            hero: actor,
                            heroName: actor.name,
                            leftTeam: combatResult.combat.leftTeam,
                            rightTeam: combatResult.combat.rightTeam,
                            combatLog: combatResult.combat.combatLog,
                            victory: combatResult.combat.victory,
                            defeated: combatResult.combat.defeated,
                            escaped: combatResult.combat.escaped,
                            rounds: combatResult.combat.rounds
                        }
                    });
                } else if (action === 'disguise') {
                    // 伪装者执行破坏事件
                    const spy = actor.cflag[912] ? actor : target;
                    const victim = spy === actor ? target : actor;
                    const eventResult = this._doDisguiseEvent(spy, victim);
                    this._markDailyEventTriggered(actor);
                    this._markDailyEventTriggered(target);
                    // V7.0: 背叛履历
                    this._incrementTitleStat(spy, 'betrayalCount');
                    this._addAdventureLog(spy, 'first_betrayal', `背叛了同伴${victim.name}`);
                    this._incrementTitleStat(victim, 'betrayedCount');
                    this._addAdventureLog(victim, 'betrayal', `被同伴${spy.name}背叛`);
                    results.push({
                        title: `🎭 伪装者行动`,
                        text: `${spy.name}伪装成同伴接近了${victim.name}！${eventResult.text}`
                    });
                } else if (action === 'spy_teamup') {
                    // 奴隶/间谍相遇：绝不内战，自发组队互助
                    const healAmt = Math.floor(actor.maxHp * 0.1);
                    actor.hp = Math.min(actor.maxHp, actor.hp + healAmt);
                    target.hp = Math.min(target.maxHp, target.hp + healAmt);
                    // 尝试组队（最多3人）
                    const merged = this._tryMergeSquad(actor, target);
                    this._markDailyEventTriggered(actor);
                    this._markDailyEventTriggered(target);
                    results.push({
                        title: `🛡️ 奴隶汇合`,
                        text: `${actor.name}与${target.name}都是魔王的仆从，相遇后互相掩护并恢复了${healAmt}HP，${merged ? '自发组成小队行动。' : '但因队伍已满无法组队。'}`
                    });
                } else if (action === 'first_teamup') {
                    // 初次相遇：勇者自发组队
                    const healAmt = Math.floor(actor.maxHp * 0.05);
                    actor.hp = Math.min(actor.maxHp, actor.hp + healAmt);
                    target.hp = Math.min(target.maxHp, target.hp + healAmt);
                    // 尝试组队（最多3人）
                    const merged = this._tryMergeSquad(actor, target);
                    // 记录初次相遇为点头之交（如果相性差很大，保持原有初始化等级）
                    if (rel.level >= 2) {
                        this._setHeroRelation(actor, target, 0, 'complete_quest');
                    }
                    this._markDailyEventTriggered(actor);
                    this._markDailyEventTriggered(target);
                    results.push({
                        title: `🤝 初次组队`,
                        text: `${actor.name}与${target.name}初次相遇，一拍即合结为同伴！两人互相支援并恢复了${healAmt}HP，${merged ? `组成小队共同冒险。（关系：${this._getRelationLabel(this._getHeroRelation(actor, target).level)}）` : '但因队伍已满无法组队。'}`
                    });
                } else if (action === 'help') {
                    // 莫逆之交：互相治疗/增益
                    const healAmt = Math.floor(actor.maxHp * 0.08);
                    actor.hp = Math.min(actor.maxHp, actor.hp + healAmt);
                    target.hp = Math.min(target.maxHp, target.hp + healAmt);
                    this._setHeroRelation(actor, target, 1, 'share_rest');
                    this._markDailyEventTriggered(actor);
                    this._markDailyEventTriggered(target);
                    results.push({
                        title: `💕 同甘共苦`,
                        text: `${actor.name}与${target.name}互相鼓舞，恢复了${healAmt}HP！关系变得更好。`
                    });
                } else if (action === 'frame') {
                    // V7.0: 陷害
                    const stolenGold = Math.min(target.gold, 50 + RAND(100));
                    target.gold -= stolenGold;
                    actor.gold += stolenGold;
                    this._setHeroRelation(actor, target, -1, 'frame');
                    this._markDailyEventTriggered(actor);
                    this._markDailyEventTriggered(target);
                    results.push({
                        title: `🕸️ 陷害`,
                        text: `${actor.name}散布谣言并窃取了${target.name}的财物（${stolenGold}G）……两人关系恶化了。`
                    });
                } else if (action === 'monster_lure') {
                    // V7.0: 引诱魔物
                    const dmg = Math.floor(target.maxHp * 0.2);
                    target.hp = Math.max(1, target.hp - dmg);
                    this._setHeroRelation(actor, target, -1, 'monster_lure');
                    this._markDailyEventTriggered(actor);
                    this._markDailyEventTriggered(target);
                    results.push({
                        title: `👹 诱敌`,
                        text: `${actor.name}故意将强大魔物引向${target.name}的营地……${target.name}受到${dmg}点伤害！`
                    });
                } else {
                    // 什么都不做
                    results.push({
                        title: `👥 勇者相遇`,
                        text: `${actor.name}遇到${target.name}，但没有采取行动（关系：${this._getRelationLabel(rel.level)}）`
                    });
                }
            }
        }
        return results;
    }

    // 伪装判定：勇者尝试伪装成同伴
Game.prototype._tryDisguise = function(hero) {
        let chance = 30; // 基础伪装【0%

        // 性格修正
        if (hero.talent[164]) chance += 15;      // 冷静（善于伪装）
        if (hero.talent[15]) chance += 10;       // 高姿态（有领导力气质】
        if (hero.talent[14]) chance += 5;        // 傲慢（自信能骗过对方】
        if (hero.talent[11]) chance += 10;       // 反抗心（善于欺骗】
        if (hero.talent[13]) chance -= 15;       // 坦率（不会说谎）
        if (hero.talent[17]) chance -= 10;       // 老实（不擅长欺骗】
        if (hero.talent[12]) chance -= 5;        // 刚强（太直率【
        // 限制范围
        chance = Math.max(5, Math.min(80, chance));

        if (RAND(100) < chance) {
            return { success: true, message: `${hero.name}成功伪装成同伴！` };
        } else {
            return { success: false, message: `${hero.name}的伪装被识破【..` };
        }
    }

    // 伪装后的特殊事件
Game.prototype._doDisguiseEvent = function(actor, target) {
        const events = [
            {
                weight: 3,
                name: '下药',
                text: `${actor.name}在食物中下了麻痹药，${target.name}的HP大幅下降！`,
                effect: (a, t) => {
                    const dmg = Math.floor(t.maxHp * 0.25);
                    t.hp = Math.max(1, t.hp - dmg);
                    return `HP-${dmg}`;
                }
            },
            {
                weight: 3,
                name: '带错路',
                text: `${actor.name}故意带错了路，${target.name}的侵略度大幅降低！`,
                effect: (a, t) => {
                    let progress = t.cflag[CFLAGS.HERO_PROGRESS] || 0;
                    progress -= 30;
                    if (progress < 0) {
                        const floorId = this.getHeroFloor(t);
                        if (floorId > 1) {
                            t.cflag[CFLAGS.HERO_FLOOR] = floorId - 1;
                            t.cflag[CFLAGS.HERO_PROGRESS] = 80 + progress;
                        } else {
                            t.cflag[CFLAGS.HERO_PROGRESS] = 0;
                        }
                    } else {
                        t.cflag[CFLAGS.HERO_PROGRESS] = progress;
                    }
                    return `侵略【30%`;
                }
            },
            {
                weight: 2,
                name: '散布谣言',
                text: `${actor.name}散布了魔王城恐怖的谣言使${target.name}的精神受到打击！`,
                effect: (a, t) => {
                    t.mp = Math.max(0, t.mp - Math.floor(t.maxMp * 0.3));
                    return `MP-${Math.floor(t.maxMp * 0.3)}`;
                }
            },
            {
                weight: 2,
                name: '破坏装备',
                text: `${actor.name}趁夜破坏${target.name}的装备，攻击力下降！`,
                effect: (a, t) => {
                    const debuff = Math.max(5, Math.floor((t.cflag[CFLAGS.ATK] || 20) * 0.15));
                    t.cflag[CFLAGS.ATK] = Math.max(1, (t.cflag[CFLAGS.ATK] || 20) - debuff);
                    return `攻击【${debuff}`;
                }
            },
            {
                weight: 2,
                name: '挑拨离间',
                text: `${actor.name}挑拨${target.name}与其他勇者的关系！`,
                effect: (a, t) => {
                    // 降低目标速度（行动力下降】
                    const debuff = Math.max(3, Math.floor((t.cflag[CFLAGS.SPD] || 10) * 0.2));
                    t.cflag[CFLAGS.SPD] = Math.max(1, (t.cflag[CFLAGS.SPD] || 10) - debuff);
                    return `敏捷-${debuff}`;
                }
            },
            {
                weight: 1,
                name: '陷阱诱饵',
                text: `${actor.name}将${target.name}引入了陷阱区域！`,
                effect: (a, t) => {
                    const dmg = Math.floor(t.maxHp * 0.15);
                    t.hp = Math.max(1, t.hp - dmg);
                    let progress = t.cflag[CFLAGS.HERO_PROGRESS] || 0;
                    progress -= 15;
                    t.cflag[CFLAGS.HERO_PROGRESS] = Math.max(0, progress);
                    return `HP-${dmg}, 侵略【15%`;
                }
            }
        ];

        const evt = this._weightedRandom(events);
        const effectText = evt.effect(actor, target);

        return {
            name: evt.name,
            text: `${evt.text} (${effectText})`
        };
    }

    // 勇者相遇时决定行动：对战 / 什么都不做
    // relationLevel: 0-4，影响内战概率
Game.prototype._decideHeroEncounterAction = function(hero, relationLevel = 2) {
        let combatChance = 30; // 基础对战30%

        // 性格修正
        if (hero.talent[12]) combatChance += 20;      // 刚强（喜欢正面冲突）
        if (hero.talent[11]) combatChance += 10;      // 反抗心（好战）
        if (hero.talent[14]) combatChance += 15;      // 傲慢（轻视对手）
        if (hero.talent[164]) combatChance -= 10;     // 冷静（倾向于回避）
        if (hero.talent[16]) combatChance -= 5;       // 低姿态（避免冲突）

        // 关系修正：关系越差越容易内战，关系越好越和平
        if (relationLevel <= 1) combatChance += 25;   // 敌视：+25%
        else if (relationLevel >= 3) combatChance -= 15; // 好感：-15%
        else if (relationLevel >= 4) combatChance -= 25; // 莫逆之交：-25%

        // 限制范围
        combatChance = Math.max(5, Math.min(80, combatChance));

        if (RAND(100) < combatChance) {
            return 'combat';
        }

        // V7.0: Framing / Monster lure for hostile relations
        if (relationLevel <= 1) {
            const roll = RAND(100);
            if (roll < 15) return 'frame';
            if (roll < 30) return 'monster_lure';
        }

        return 'none';
    }

    // 勇【vs 勇者战】
Game.prototype._doHeroVsHeroCombat = function(a, b) {
        // 使用标准团队战斗系统
        const floorId = this.getHeroFloor(a);
        const progress = this.getHeroProgress(a);
        const combat = this._doTeamCombat([a], [b], { noExp: true, noDrop: true, maxRounds: 50 });
        const aHp = a.hp;
        const bHp = b.hp;
        const aWin = aHp > bHp;
        const bWin = bHp > aHp;

        let resultText;
        let lootText = '';
        // 50回合未分胜负或双方撤退时视为平手
        if (!combat.victory && !combat.defeated) {
            resultText = `双方势均力敌，各自负伤后撤退`;
        } else if (aWin) {
            resultText = `${a.name}获胜，${b.name}受到重创(HP:${b.hp}/${b.maxHp})`;
            let progress = b.cflag[CFLAGS.HERO_PROGRESS] || 0;
            progress -= 20;
            if (progress < 0) {
                const floorId = this.getHeroFloor(b);
                if (floorId > 1) {
                    b.cflag[CFLAGS.HERO_FLOOR] = floorId - 1;
                    b.cflag[CFLAGS.HERO_PROGRESS] = 80 + progress;
                } else {
                    b.cflag[CFLAGS.HERO_PROGRESS] = 0;
                }
            } else {
                b.cflag[CFLAGS.HERO_PROGRESS] = progress;
            }
            if (RAND(100) < 20) {
                const ailKeys = Object.keys(STATUS_AILMENT_DEFS);
                const randAil = ailKeys[RAND(ailKeys.length)];
                this._addStatusAilment(a, randAil, 2);
            }
            // 胜利者没收失败者装备与金钱
            lootText = this._confiscateFromLoser(a, b);
            // V7.0: 击败勇者履历
            this._incrementTitleStat(a, 'heroKills');
            this._addAdventureLog(a, 'hero_kill', `在内战中击败勇者${b.name}`);
            this._checkTitle(a);
        } else if (bWin) {
            resultText = `${b.name}获胜，${a.name}受到重创(HP:${a.hp}/${a.maxHp})`;
            let progress = a.cflag[CFLAGS.HERO_PROGRESS] || 0;
            progress -= 20;
            if (progress < 0) {
                const floorId = this.getHeroFloor(a);
                if (floorId > 1) {
                    a.cflag[CFLAGS.HERO_FLOOR] = floorId - 1;
                    a.cflag[CFLAGS.HERO_PROGRESS] = 80 + progress;
                } else {
                    a.cflag[CFLAGS.HERO_PROGRESS] = 0;
                }
            } else {
                a.cflag[CFLAGS.HERO_PROGRESS] = progress;
            }
            if (RAND(100) < 20) {
                const ailKeys = Object.keys(STATUS_AILMENT_DEFS);
                const randAil = ailKeys[RAND(ailKeys.length)];
                this._addStatusAilment(b, randAil, 2);
            }
            // 胜利者没收失败者装备与金钱
            lootText = this._confiscateFromLoser(b, a);
            // V7.0: 击败勇者履历
            this._incrementTitleStat(b, 'heroKills');
            this._addAdventureLog(b, 'hero_kill', `在内战中击败勇者${a.name}`);
            this._checkTitle(b);
        } else {
            resultText = `双方势均力敌，各自负伤后撤退`;
        }
        if (lootText) resultText += ' ' + lootText;

        // 追加结局到 combatLog
        combat.combatLog.push(`【${resultText}】`);

        return {
            text: `${a.name} vs ${b.name} 【${resultText}】`,
            combat: combat
        };
    }

    // 勇者内战胜利者没收失败者装备与金钱
Game.prototype._confiscateFromLoser = function(winner, loser) {
        if (!loser || !winner) return '';
        const parts = [];

        // 1. 没收金钱（100%）
        const goldTaken = loser.gold || 0;
        if (goldTaken > 0) {
            winner.gold += goldTaken;
            loser.gold = 0;
            parts.push(`夺走了${goldTaken}G`);
        }

        // 2. 没收装备（50%概率）
        if (RAND(100) < 50 && loser.gear) {
            const g = loser.gear;
            const slots = ['head', 'body', 'legs', 'hands', 'neck', 'ring'];
            const takenNames = [];
            for (const slot of slots) {
                if (g[slot]) {
                    const item = g[slot];
                    this.addMuseumItem(item, `${winner.name}从${loser.name}身上没收的装备`);
                    takenNames.push(item.name);
                    g[slot] = null;
                }
            }
            // 武器
            if (g.weapons && g.weapons.length > 0) {
                for (const w of g.weapons) {
                    this.addMuseumItem(w, `${winner.name}从${loser.name}身上没收的装备`);
                    takenNames.push(w.name);
                }
                g.weapons = [];
            }
            // 道具
            if (g.items && g.items.length > 0) {
                for (const item of g.items) {
                    this.addMuseumItem(item, `${winner.name}从${loser.name}身上没收的装备`);
                    takenNames.push(item.name);
                }
                g.items = [];
            }
            if (takenNames.length > 0) {
                parts.push(`没收了装备：${takenNames.join(',')}（已收入收藏馆）`);
            }
        }

        return parts.length > 0 ? `【战利品】${winner.name}从${loser.name}身上${parts.join('，')}` : '';
    }

    // ========== 勇者每日事件标记系统 ==========

    // 检查勇者或小队今天是否已触发事件
Game.prototype._getHeroRelation = function(a, b) {
        const key = this._getHeroRelationKey(a, b);
        if (!key) return { level: 2, history: [], squadDays: 0 };
        let rel = this._heroRelations[key];
        if (!rel) {
            // 根据相性差初始化关系
            const diff = this._getAffinityDiff(a, b);
            const initLevel = this._getAffinityRelationLevel(diff);
            rel = { level: initLevel, history: [], squadDays: 0, metDay: this.day || 1 };
            this._heroRelations[key] = rel;
        }
        // V7.0: ensure new fields exist on old relations
        if (rel.squadDays === undefined) rel.squadDays = 0;
        if (rel.metDay === undefined) rel.metDay = this.day || 1;
        if (rel.romanceDay === undefined) rel.romanceDay = null;
        if (rel.engagedDay === undefined) rel.engagedDay = null;
        if (rel.marriedDay === undefined) rel.marriedDay = null;
        if (rel.kissCount === undefined) rel.kissCount = 0;
        if (rel.sexCount === undefined) rel.sexCount = 0;
        if (rel.lastIntimacyDay === undefined) rel.lastIntimacyDay = 0;
        if (rel.swornDay === undefined) rel.swornDay = null;
        if (rel.swornType === undefined) rel.swornType = null;
        if (rel.rivalTarget === undefined) rel.rivalTarget = null;
        if (rel.conflictCount === undefined) rel.conflictCount = 0;
        if (rel.lastConflictDay === undefined) rel.lastConflictDay = 0;
        return rel;
    }

    // 修改两人关系 (delta: +1/-1 等)
Game.prototype._setHeroRelation = function(a, b, delta, eventType) {
        const rel = this._getHeroRelation(a, b);
        const oldLevel = rel.level;
        rel.level = Math.max(0, Math.min(4, rel.level + delta));
        if (eventType) {
            const evtDef = typeof RELATION_EVENT_DEFS !== 'undefined' ? RELATION_EVENT_DEFS[eventType] : null;
            rel.history.push({
                day: this.day,
                event: evtDef ? evtDef.name : eventType,
                delta: delta,
                level: rel.level
            });
            // 限制历史记录长度
            if (rel.history.length > 20) rel.history.shift();
        }
        return { oldLevel, newLevel: rel.level, changed: oldLevel !== rel.level };
    }

    // 获取关系等级标签
Game.prototype._getHeroRelationKey = function(a, b) {
        if (!a || !b) return '';
        return a.name < b.name ? `${a.name}|${b.name}` : `${b.name}|${a.name}`;
    }

    // 获取两人关系数据
Game.prototype._getRelationLabel = function(level) {
        const defs = typeof AFFINITY_RELATION_DEFS !== 'undefined' ? AFFINITY_RELATION_DEFS : {};
        const def = defs[level];
        return def ? `${def.icon} ${def.name}` : '?';
    }

    // 辅助：提升角色等级并同步属性（用于奴隶/魔王任务中的升级）
    // 前勇者和勇者采用同一套属性计算体系
Game.prototype._getAffinityDiff = function(a, b) {
        if (!a || !b) return 50;
        const av = a.affinity !== undefined ? a.affinity : 50;
        const bv = b.affinity !== undefined ? b.affinity : 50;
        return Math.abs(av - bv);
    }

    // 根据相性差获取初始关系等级
Game.prototype._getAffinityRelationLevel = function(diff) {
        const defs = typeof AFFINITY_DIFF_RELATION !== 'undefined' ? AFFINITY_DIFF_RELATION : [
            { maxDiff: 10, level: 4 },
            { maxDiff: 25, level: 3 },
            { maxDiff: 45, level: 2 },
            { maxDiff: 65, level: 1 },
            { maxDiff: 100, level: 0 }
        ];
        for (const d of defs) {
            if (diff <= d.maxDiff) return d.level;
        }
        return 2; // 默认点头之交
    }

    // 获取关系键（按名字字母序）
