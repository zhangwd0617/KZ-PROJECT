/**
 * SquadManager — extracted from Game.js
 */

// 清除已不在 invaders 中的角色的小队标记（被俘/投降/死亡），以及清理过时的小队状态
Game.prototype._clearSquadFlags = function() {
    // 防御性去重：确保 invaders 中没有重复引用
    const seen = new Set();
    this.invaders = this.invaders.filter(h => {
        if (seen.has(h)) return false;
        seen.add(h);
        return true;
    });
    // 只清除已不在 invaders 中（被俘/投降/移除）的角色的队伍标记
    const invaderSet = new Set(this.invaders);
    for (const hero of this.invaders) {
        hero.cflag[902] = 0; // 今日已战标记每天清除
    }
    for (const c of this.characters) {
        if (c.talent[200]) {
            c.cflag[902] = 0;
        }
    }
}

// 根据等级和声望选拔队长（等级优先，同等级比声望）
Game.prototype._pickSquadLeader = function(squad) {
    if (!squad || squad.length === 0) return null;
    return squad.reduce((best, h) => {
        if (h.level !== best.level) return h.level > best.level ? h : best;
        return (h.fame || 0) > (best.fame || 0) ? h : best;
    }, squad[0]);
}

// 勇者自动组队：已有队伍的勇者保留，仅无队者尝试组队
Game.prototype._formHeroSquads = function() {
    this._clearSquadFlags();
    let squadId = 1;
    const assigned = new Set();

    // 找出当前已使用的最大小队ID，避免冲突
    const usedIds = new Set();
    for (const h of this.invaders) {
        const sid = h.cflag[CFLAGS.SQUAD_ID] || 0;
        if (sid > 0 && sid < 100) usedIds.add(sid);
    }
    while (usedIds.has(squadId)) squadId++;

    for (let i = 0; i < this.invaders.length; i++) {
        if (assigned.has(i)) continue;
        const hero = this.invaders[i];

        // 已有队伍的勇者跳过（持久化）
        if ((hero.cflag[CFLAGS.SQUAD_ID] || 0) > 0 && (hero.cflag[CFLAGS.SQUAD_ID] || 0) < 100) {
            continue;
        }

        // V12.0: 倾向魔王型勇者（独行侠）不组队
        if (hero.cflag[CFLAGS.IS_LONE_WOLF]) {
            assigned.add(i);
            continue;
        }

        const floorId = this.getHeroFloor(hero);
        const progress = this.getHeroProgress(hero);

        const squad = [hero];
        assigned.add(i);

        for (let j = i + 1; j < this.invaders.length; j++) {
            if (assigned.has(j)) continue;
            if (squad.length >= 3) break; // 小队最多3人
            const other = this.invaders[j];

            // 已有队伍的跳过
            if ((other.cflag[CFLAGS.SQUAD_ID] || 0) > 0 && (other.cflag[CFLAGS.SQUAD_ID] || 0) < 100) continue;

            // V12.0: 独行侠不参与组队
            if (other.cflag[CFLAGS.IS_LONE_WOLF]) continue;

            if (this.getHeroFloor(other) === floorId) {
                const diff = Math.abs(this.getHeroProgress(other) - progress);
                const rel = this._getHeroRelation(hero, other);
                // 相性影响组队范围：关系好放宽到25%，关系差不允许组队
                let threshold = 15;
                if (rel.level >= 4) threshold = 30;      // 莫逆之交：范围更大
                else if (rel.level >= 3) threshold = 25; // 好感：范围放宽
                else if (rel.level <= 1) continue;       // 敌视/不死不休：不组队
                // 种族配合度修正（V3.0 政治体系）
                if (typeof calculateRaceCompatibility === 'function') {
                    const raceA = hero.talent ? (hero.talent[314] || 1) : 1;
                    const raceB = other.talent ? (other.talent[314] || 1) : 1;
                    const isFallenA = (hero.cflag[960] || 0) === 1;
                    const isFallenB = (other.cflag[960] || 0) === 1;
                    const compat = calculateRaceCompatibility(raceA, raceB, isFallenA, isFallenB);
                    threshold = Math.floor(threshold * (1 + compat / 100));
                    if (threshold < 5) threshold = 5;
                }

                if (diff <= threshold) {
                    squad.push(other);
                    assigned.add(j);
                    // 首次组队触发关系事件（仅一次，受每日事件限制）
                    if (!rel.history.some(h => h.event === '齐心协力' || h.event === '同甘共苦')) {
                        if (!this._hasTriggeredDailyEvent(hero) && !this._hasTriggeredDailyEvent(other)) {
                            if (rel.level >= 3 && RAND(100) < 30) {
                                this._setHeroRelation(hero, other, 1, 'complete_quest');
                                hero.cflag[CFLAGS.SPY_SENT] = 1;
                                other.cflag[CFLAGS.SPY_SENT] = 1;
                            }
                        }
                    }
                }
            }
        }

        if (squad.length >= 2) {
            // 设置小队标记，等级最高（同等级声望最高）的为队长
            const leader = this._pickSquadLeader(squad);
            const squadName = this._generateSquadName(leader);

            // V10.0: 组队时同步所有成员到队长的楼层和进度
            const leaderFloor = this.getHeroFloor(leader);
            const leaderProgress = this.getHeroProgress(leader);
            for (const member of squad) {
                member.cflag[CFLAGS.SQUAD_ID] = squadId;
                member.cflag[CFLAGS.SQUAD_LEADER] = member === leader ? 1 : 0;
                member.cstr[CSTRS.NAME_ALT] = squadName;
                // 被组队的撤退勇者重新振作
                if (member.cflag[503]) member.cflag[503] = 0;
                // 同步楼层和进度到队长
                member.cflag[CFLAGS.HERO_FLOOR] = leaderFloor;
                member.cflag[CFLAGS.HERO_PROGRESS] = leaderProgress;
            }

            // 队长就任日志
            if (leader) {
                this._addAdventureLog(leader, 'squad_leader', `被推举为小队「${squadName}」的队长`);
            }

            // V7.0: 组队履历
            for (const member of squad) {
                const others = squad.filter(m => m !== member).map(m => m.name).join('、');
                this._incrementTitleStat(member, 'squadCount');
                this._addAdventureLog(member, 'squad_form', `与${others}组成小队「${squadName}」`);
            }
            // 每日事件标记同步：如果小队中任何成员已触发事件，整队同步
            const anyTriggered = squad.some(m => m.cflag[CFLAGS.SPY_SENT]);
            if (anyTriggered) {
                for (const member of squad) {
                    member.cflag[CFLAGS.SPY_SENT] = 1;
                }
            }
            // 计算小队士气（V3.0 种族配合度）
            const morale = this._calculateSquadMorale(squad);
            for (const member of squad) {
                member.cflag[CFLAGS.SQUAD_MORALE] = morale;
            }
            // 治疗职业小队恢复
            this._applySquadHealing(squad);
            squadId++;
        }
    }

    // 每日队伍维护：检查离队条件
    this._maintainHeroSquads();
}

// 每日队伍维护：处理离队、队长更替
Game.prototype._maintainHeroSquads = function() {
    // 按小队ID分组
    const squads = new Map();
    for (const hero of this.invaders) {
        const sid = hero.cflag[CFLAGS.SQUAD_ID] || 0;
        if (sid > 0 && sid < 100) {
            if (!squads.has(sid)) squads.set(sid, []);
            squads.get(sid).push(hero);
        }
    }

    for (const [squadId, members] of squads) {
        if (members.length < 2) {
            // 小队不足2人，解散
            for (const m of members) {
                const name = m.cstr[CSTRS.NAME_ALT] || '小队';
                this._addAdventureLog(m, 'squad_leave', `小队「${name}」因人数不足解散`);
                m.cflag[CFLAGS.SQUAD_ID] = 0;
                m.cflag[CFLAGS.SQUAD_LEADER] = 0;
            }
            continue;
        }

        const leader = members.find(m => m.cflag[CFLAGS.SQUAD_LEADER] === 1);
        const squadName = members[0].cstr[CSTRS.NAME_ALT] || '无名小队';

        // 检查成员关系：若有两人关系<=1（敌视/不死不休），关系最差者离队
        for (let i = 0; i < members.length; i++) {
            for (let j = i + 1; j < members.length; j++) {
                const rel = this._getHeroRelation(members[i], members[j]);
                if (rel.level <= 1) {
                    // 关系恶化到无法共存，较弱者离队
                    const toLeave = members[i].level < members[j].level ? members[i] :
                                    members[j].level < members[i].level ? members[j] :
                                    (members[i].fame || 0) < (members[j].fame || 0) ? members[i] : members[j];
                    this._handleSquadMemberLeave(toLeave, '与队友反目成仇');
                }
            }
        }

        // 检查成员位置：若某人不在同楼层或进度差距>30%，视为走散
        if (leader) {
            const lFloor = this.getHeroFloor(leader);
            const lProg = this.getHeroProgress(leader);
            for (const m of members) {
                if (m === leader) continue;
                const mFloor = this.getHeroFloor(m);
                const mProg = this.getHeroProgress(m);
                if (mFloor !== lFloor || Math.abs(mProg - lProg) > 30) {
                    // 使用 cflag[904] 记录走散天数
                    m.cflag[904] = (m.cflag[904] || 0) + 1;
                    if (m.cflag[904] >= 3) {
                        this._handleSquadMemberLeave(m, '与队伍走散超过3天');
                    }
                } else {
                    m.cflag[904] = 0;
                }
            }
        }

        // 若原队长不在队中，重新选举队长
        const stillLeader = members.find(m => m.cflag[CFLAGS.SQUAD_LEADER] === 1);
        if (!stillLeader) {
            const newLeader = this._pickSquadLeader(members);
            if (newLeader) {
                for (const m of members) {
                    m.cflag[CFLAGS.SQUAD_LEADER] = m === newLeader ? 1 : 0;
                }
                this._addAdventureLog(newLeader, 'squad_leader', `继任为小队「${squadName}」的队长`);
                // V10.0: 新队长上任时同步全队进度和楼层到新队长
                const newFloor = this.getHeroFloor(newLeader);
                const newProgress = this.getHeroProgress(newLeader);
                for (const m of members) {
                    m.cflag[CFLAGS.HERO_FLOOR] = newFloor;
                    m.cflag[CFLAGS.HERO_PROGRESS] = newProgress;
                }
            }
        }
    }
}

// 处理成员离队
Game.prototype._handleSquadMemberLeave = function(member, reason) {
    const squadId = member.cflag[CFLAGS.SQUAD_ID] || 0;
    const squadName = member.cstr[CSTRS.NAME_ALT] || '小队';
    const oldLeader = this.invaders.find(h => h.cflag[CFLAGS.SQUAD_ID] === squadId && h.cflag[CFLAGS.SQUAD_LEADER] === 1);

    // 记录离队日志
    this._addAdventureLog(member, 'squad_leave', `脱离小队「${squadName}」，原因：${reason}`);

    // 若因关系恶化离队，与队长关系再降一级
    if (reason.includes('反目') && oldLeader && oldLeader !== member) {
        this._setHeroRelation(member, oldLeader, -1, 'squad_betrayal');
    }

    // 清除队伍标记
    member.cflag[CFLAGS.SQUAD_ID] = 0;
    member.cflag[CFLAGS.SQUAD_LEADER] = 0;
    member.cflag[904] = 0; // 走散天数清零

    // 检查剩余成员是否需要重选队长
    const remaining = this.invaders.filter(h => h.cflag[CFLAGS.SQUAD_ID] === squadId);
    if (remaining.length >= 2) {
        const newLeader = this._pickSquadLeader(remaining);
        if (newLeader && newLeader.cflag[CFLAGS.SQUAD_LEADER] !== 1) {
            for (const m of remaining) {
                m.cflag[CFLAGS.SQUAD_LEADER] = m === newLeader ? 1 : 0;
            }
            this._addAdventureLog(newLeader, 'squad_leader', `继任为小队「${squadName}」的队长`);
            // V10.0: 新队长上任时同步全队进度和楼层到新队长
            const newFloor = this.getHeroFloor(newLeader);
            const newProgress = this.getHeroProgress(newLeader);
            for (const m of remaining) {
                m.cflag[CFLAGS.HERO_FLOOR] = newFloor;
                m.cflag[CFLAGS.HERO_PROGRESS] = newProgress;
            }
        }
    } else if (remaining.length === 1) {
        // 只剩一人，解散
        this._addAdventureLog(remaining[0], 'squad_leave', `小队「${squadName}」因人数不足解散`);
        remaining[0].cflag[CFLAGS.SQUAD_ID] = 0;
        remaining[0].cflag[CFLAGS.SQUAD_LEADER] = 0;
    }
}

// 同步队长位置/任务/状态给所有队员
Game.prototype._syncSquadPosition = function(leader, result) {
    const squadId = leader.cflag[CFLAGS.SQUAD_ID];
    if (!squadId) return;
    const members = this.invaders.filter(h => h.cflag[CFLAGS.SQUAD_ID] === squadId && h !== leader);
    if (members.length === 0) return;

    const floor = this.getHeroFloor(leader);
    const progress = this.getHeroProgress(leader);
    const taskType = leader.cflag[CFLAGS.HERO_TASK_TYPE] || 0;
    const taskStatus = leader.cflag[CFLAGS.HERO_TASK_STATUS] || 0;

    for (const m of members) {
        // 同步楼层和进度（回城中的队员若已到达城镇，保留其恢复后的状态）
        const mTaskType = m.cflag[CFLAGS.HERO_TASK_TYPE] || 0;
        const mFloor = this.getHeroFloor(m);
        const mProgress = this.getHeroProgress(m);
        if (mTaskType === 3 && mFloor <= 1 && mProgress <= 0) {
            // 队员已回城到达，保留位置（已在 moveHeroDaily 中恢复过）
        } else {
            m.cflag[CFLAGS.HERO_FLOOR] = floor;
            m.cflag[CFLAGS.HERO_PROGRESS] = progress;
        }
        // 同步任务状态
        if (taskType !== 0) {
            m.cflag[CFLAGS.HERO_TASK_TYPE] = taskType;
            m.cflag[CFLAGS.HERO_TASK_STATUS] = taskStatus;
            m.cflag[CFLAGS.HERO_REASON] = leader.cflag[CFLAGS.HERO_REASON] || 0;
            m.cflag[CFLAGS.HERO_ORIGIN] = leader.cflag[CFLAGS.HERO_ORIGIN] || 0;
            m.cflag[CFLAGS.HERO_FAMILY] = leader.cflag[CFLAGS.HERO_FAMILY] || 0;
            m.cstr[CSTRS.TASK_DESC] = leader.cstr[CSTRS.TASK_DESC] || '';
        }
        // 同步每日事件标记
        m.cflag[CFLAGS.SPY_SENT] = leader.cflag[CFLAGS.SPY_SENT] || 0;
        m.cflag[902] = leader.cflag[902] || 0;
        m.cflag[503] = leader.cflag[503] || 0;
        // V7.3: 同步回城恢复效果（队员跳过 moveHeroDaily，恢复由队长统一补发）
        if (taskType === 3) {
            // 同步 moveHeroDaily 内部恢复（50% HP / 30% MP）
            m.hp = Math.min(m.maxHp, m.hp + Math.floor(m.maxHp * 0.5));
            m.mp = Math.min(m.maxMp, m.mp + Math.floor(m.maxMp * 0.3));
            if (typeof this._removeStatusAilment === 'function') {
                this._removeStatusAilment(m, 'severe_injury');
            }
        }
    }
}

// 队长回城决策：队员请求回城时，队长决定是否全队回城
Game.prototype._handleSquadRetreatRequest = function(member, reason) {
    const squadId = member.cflag[CFLAGS.SQUAD_ID];
    if (!squadId) {
        // 无队成员，直接回城
        this._startReturnToTown(member, reason);
        return { approved: true, leaver: null };
    }

    const squad = this.invaders.filter(h => h.cflag[CFLAGS.SQUAD_ID] === squadId);
    const leader = squad.find(h => h.cflag[CFLAGS.SQUAD_LEADER] === 1);
    if (!leader) {
        // 无队长，直接回城
        this._startReturnToTown(member, reason);
        return { approved: true, leaver: null };
    }

    // 计算全队平均HP
    const avgHpRatio = squad.reduce((s, h) => s + (h.maxHp > 0 ? h.hp / h.maxHp : 1), 0) / squad.length;

    if (avgHpRatio < 0.4) {
        // 全队状态差，队长同意回城
        for (const m of squad) {
            this._startReturnToTown(m, reason);
        }
        return { approved: true, leaver: null };
    }

    // 50% 概率队长坚持继续探索
    if (RAND(100) < 50) {
        // 请求者离队并独自回城
        const squadName = member.cstr[CSTRS.NAME_ALT] || '小队';
        this._addAdventureLog(member, 'squad_leave', `脱离小队「${squadName}」，原因：回城请求被队长${leader.name}拒绝`);
        // 与队长关系恶化
        this._setHeroRelation(member, leader, -1, 'denied_retreat');

        // 离队处理
        member.cflag[CFLAGS.SQUAD_ID] = 0;
        member.cflag[CFLAGS.SQUAD_LEADER] = 0;
        member.cflag[904] = 0;
        this._startReturnToTown(member, reason);

        // 剩余成员重选队长
        const remaining = squad.filter(h => h !== member);
        if (remaining.length >= 2) {
            const newLeader = this._pickSquadLeader(remaining);
            for (const m of remaining) {
                m.cflag[CFLAGS.SQUAD_LEADER] = m === newLeader ? 1 : 0;
            }
            if (newLeader && newLeader !== leader) {
                this._addAdventureLog(newLeader, 'squad_leader', `继任为小队「${squadName}」的队长`);
            }
        }
        return { approved: false, leaver: member };
    } else {
        // 队长心软同意，全队回城
        for (const m of squad) {
            this._startReturnToTown(m, reason);
        }
        return { approved: true, leaver: null };
    }
}

// 计算小队士气（0-100），受种族配合度、相性关系、职业搭配影响
Game.prototype._calculateSquadMorale = function(squad) {
    if (!squad || squad.length < 2) return 100;
    let morale = 100;
    const healerClasses = [202, 205, 209];
    let hasHealer = false;
    for (let i = 0; i < squad.length; i++) {
        const m = squad[i];
        {
            const cid = m.cflag[CFLAGS.CLASS_ID] || m.cflag[CFLAGS.HERO_CLASS] || 0;
            const role = window.CLASS_DEFS && window.CLASS_DEFS[cid] ? window.CLASS_DEFS[cid].role : '';
            if (role && (role.includes('healer') || role.includes('heal'))) hasHealer = true;
        }
        for (let j = i + 1; j < squad.length; j++) {
            const other = squad[j];
            const rel = this._getHeroRelation(m, other);
            if (rel.level <= 1) morale -= 15;
            else if (rel.level >= 4) morale += 10;
            if (typeof calculateRaceCompatibility === 'function') {
                const raceA = m.talent ? (m.talent[314] || 1) : 1;
                const raceB = other.talent ? (other.talent[314] || 1) : 1;
                const isFallenA = (m.cflag[960] || 0) === 1;
                const isFallenB = (other.cflag[960] || 0) === 1;
                const compat = calculateRaceCompatibility(raceA, raceB, isFallenA, isFallenB);
                morale += compat;
            }
        }
    }
    if (hasHealer) morale += 5;
    return Math.max(0, Math.min(150, morale));
}
// 小队治疗职业自动恢复
Game.prototype._applySquadHealing = function(squad) {
    if (!squad || squad.length < 2) return;
    const healers = squad.filter(m => {
        const cid = m.cflag[CFLAGS.CLASS_ID] || m.cflag[CFLAGS.HERO_CLASS] || 0;
        const role = window.CLASS_DEFS && window.CLASS_DEFS[cid] ? window.CLASS_DEFS[cid].role : '';
        return role && (role.includes('healer') || role.includes('heal'));
    });
    if (healers.length === 0) return;
    for (const member of squad) {
        if (member.hp <= 0) continue;
        // 恢复HP
        const maxHp = member.maxHp || member.base[0] || 100;
        const healAmount = Math.floor(maxHp * 0.05 * healers.length);
        const oldHp = member.hp;
        member.hp = Math.min(maxHp, member.hp + healAmount);
        const actualHeal = member.hp - oldHp;
        // 清除1个非诅咒异常状态（50%概率每个治疗者）
        const ailmentMask = member.cflag[CFLAGS.HERO_PREVIOUS] || 0;
        if (ailmentMask > 0) {
            for (const h of healers) {
                if (RAND(100) < 50) {
                    // 优先清除严重状态
                    const priority = ['poison', 'burn', 'aphrodisiac', 'freeze', 'sleep', 'confuse', 'fear', 'weak'];
                    for (const key of priority) {
                        const def = STATUS_AILMENT_DEFS[key];
                        if (def && (ailmentMask & def.bit)) {
                            this._removeStatusAilment(member, key);
                            break;
                        }
                    }
                    break;
                }
            }
        }
    }
}

// 前勇者奴隶自动组】
Game.prototype._formSlaveSquads = function() {
    let squadId = 100; // 前勇者小队ID【00开始，避免冲突
    const assigned = new Set();

    const explorers = this.characters.filter(c => c.talent[200] && c.cflag[CFLAGS.FALLEN_DEPTH]);

    for (let i = 0; i < explorers.length; i++) {
        if (assigned.has(i)) continue;
        const slave = explorers[i];
        const floorId = slave.cflag[CFLAGS.FALLEN_STAGE] || 10;
        const progress = slave.cflag[CFLAGS.CORRUPTION] || 0;

        const squad = [slave];
        assigned.add(i);

        for (let j = i + 1; j < explorers.length; j++) {
            if (assigned.has(j)) continue;
            if (squad.length >= 3) break;
            const other = explorers[j];
            if ((other.cflag[CFLAGS.FALLEN_STAGE] || 10) === floorId) {
                const diff = Math.abs((other.cflag[CFLAGS.CORRUPTION] || 0) - progress);
                if (diff <= 15) {
                    squad.push(other);
                    assigned.add(j);
                }
            }
        }

        if (squad.length > 1) {
            const leader = this._pickSquadLeader(squad);

            const squadName = this._generateSquadName(leader);
            for (const member of squad) {
                member.cflag[CFLAGS.SQUAD_ID] = squadId;
                member.cflag[CFLAGS.SQUAD_LEADER] = member === leader ? 1 : 0;
                member.cstr[CSTRS.NAME_ALT] = squadName;
            }
            squadId++;
        }
    }
}

// 获取勇者的小队成员（不包括自己】
Game.prototype._getHeroSquad = function(hero) {
    const squadId = hero.cflag[CFLAGS.SQUAD_ID];
    if (!squadId) return [];
    return this.invaders.filter(h => h !== hero && h.cflag[CFLAGS.SQUAD_ID] === squadId);
}

// 尝试将两个勇者加入同一小队，最多3人
Game.prototype._getSlaveSquad = function(slave) {
    const squadId = slave.cflag[CFLAGS.SQUAD_ID];
    if (!squadId) return [];
    return this.characters.filter(c => c !== slave && c.talent[200] && c.cflag[CFLAGS.SQUAD_ID] === squadId);
}

// 寻找战斗增援：同一层20%进度范围内的勇者/前勇者可能加入战斗
Game.prototype._tryMergeSquad = function(a, b) {
    const aId = a.cflag[CFLAGS.SQUAD_ID];
    const bId = b.cflag[CFLAGS.SQUAD_ID];
    if (aId && bId && aId === bId) return true; // 已经在同一小队
    // 检查双方关系，关系破裂或不死不休时不允许组队
    const relation = this._getHeroRelation(a, b);
    if (relation.level <= 0) return false;
    const aSquad = aId ? this.invaders.filter(h => h.cflag[CFLAGS.SQUAD_ID] === aId) : [a];
    const bSquad = bId ? this.invaders.filter(h => h.cflag[CFLAGS.SQUAD_ID] === bId) : [b];
    if (aSquad.length + bSquad.length > 3) return false; // 超过3人上限
    const newId = aId || bId || (100 + a.id + b.id);
    const allMembers = [...new Set([...aSquad, ...bSquad])];
    const leader = this._pickSquadLeader(allMembers);
    // V10.0: 合并小队时同步全队进度和楼层到新队长
    const leaderFloor = this.getHeroFloor(leader);
    const leaderProgress = this.getHeroProgress(leader);
    for (const m of allMembers) {
        m.cflag[CFLAGS.SQUAD_ID] = newId;
        m.cflag[CFLAGS.SQUAD_LEADER] = m === leader ? 1 : 0;
        m.cflag[CFLAGS.HERO_FLOOR] = leaderFloor;
        m.cflag[CFLAGS.HERO_PROGRESS] = leaderProgress;
    }
    return true;
}

// 获取前勇者奴隶的小队成员
Game.prototype._findReinforcements = function(fighters, floorId, progress, side = 'hero', exclude = []) {
    const reinforcements = [];
    const candidates = this.invaders.filter(h => {
        if (h.hp <= 0) return false;
        const excludeSet = new Set([...fighters, ...exclude]);
        if (excludeSet.has(h)) return false;
        if (this.getHeroFloor(h) !== floorId) return false;
        const p = this.getHeroProgress(h);
        return Math.abs(p - progress) <= 20;
    });
    for (const candidate of candidates) {
        const isSpy = candidate.cflag[912];
        if (side === 'hero') {
            if (isSpy) continue; // 伪装者不帮助勇者方
            let totalRel = 0, count = 0;
            for (const f of fighters) {
                if (f.cflag[912]) continue;
                const rel = this._getHeroRelation(f, candidate);
                totalRel += rel.level;
                count++;
            }
            const avgRel = count > 0 ? totalRel / count : 1;
            const chance = Math.min(70, 15 + avgRel * 12);
            if (RAND(100) < chance) {
                candidate._isReinforcement = true;
                reinforcements.push(candidate);
            }
        } else if (side === 'monster') {
            if (isSpy) {
                if (RAND(100) < 35) {
                    candidate._isReinforcement = true;
                    reinforcements.push(candidate);
                }
            } else {
                // 普通勇者反叛到怪物方概率极低
                if ((candidate.mark[0] || 0) >= 2 && RAND(100) < 8) {
                    candidate._isReinforcement = true;
                    reinforcements.push(candidate);
                }
            }
        }
    }
    return reinforcements.slice(0, 1); // 最多1个增援
}

// 小队战斗：多对一回合制，速度高的先手
Game.prototype._generateSquadName = function(leader) {
    const prefixes = ['烈焰', '冰霜', '雷霆', '暗影', '圣光', '风暴', '钢铁', '疾风', '破晓', '暮色', '星辰', '月光', '狂涛', '雷电', '黑铁', '银翼'];
    const suffixes = ['之牙', '之刃', '之心', '之翼', '小队', '旅团', '骑士团', '猎手', '先锋', '守卫', '突击者', '远征军'];
    const prefix = prefixes[RAND(prefixes.length)];
    const suffix = suffixes[RAND(suffixes.length)];
    return `${prefix}${suffix}`;
}

// 计算两人相性差 (0-100)
