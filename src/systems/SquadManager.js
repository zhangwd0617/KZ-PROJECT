/**
 * SquadManager — extracted from Game.js
 */
Game.prototype._clearSquadFlags = function() {
        for (const hero of this.invaders) {
            hero.cflag[900] = 0; // 小队ID
            hero.cflag[901] = 0; // 队长标记
            hero.cflag[902] = 0; // 今日已战【
}
        for (const c of this.characters) {
            if (c.talent[200]) {
                c.cflag[900] = 0;
                c.cflag[901] = 0;
                c.cflag[902] = 0;
            }
        }
    }

    // 勇者自动组队：同一层且进度接近的自动组队，相性好的优先
Game.prototype._formHeroSquads = function() {
        this._clearSquadFlags();
        let squadId = 1;
        const assigned = new Set();

        for (let i = 0; i < this.invaders.length; i++) {
            if (assigned.has(i)) continue;
            const hero = this.invaders[i];
            const floorId = this.getHeroFloor(hero);
            const progress = this.getHeroProgress(hero);

            const squad = [hero];
            assigned.add(i);

            for (let j = i + 1; j < this.invaders.length; j++) {
                if (assigned.has(j)) continue;
                if (squad.length >= 3) break; // 小队最多3人
                const other = this.invaders[j];
                if (this.getHeroFloor(other) === floorId) {
                    const diff = Math.abs(this.getHeroProgress(other) - progress);
                    const rel = this._getHeroRelation(hero, other);
                    // 相性影响组队范围：关系好放宽到25%，关系差不允许组队
                    let threshold = 15;
                    if (rel.level >= 4) threshold = 30;      // 莫逆之交：范围更大
                    else if (rel.level >= 3) threshold = 25; // 好感：范围放宽
                    else if (rel.level <= 1) continue;       // 敌视/不死不休：不组队\n                    // 种族配合度修正（V3.0 政治体系）
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
                                    hero.cflag[910] = 1;
                                    other.cflag[910] = 1;
                                }
                            }
                        }
                    }
                }
            }

            if (squad.length >= 2) {
                // 设置小队标记，速度最高的为队长
                const leader = squad.reduce((best, h) => {
                    const spd = h.cflag[13] || 10 + h.level * 2;
                    const bestSpd = best.cflag[13] || 10 + best.level * 2;
                    return spd > bestSpd ? h : best;
                }, squad[0]);

                const squadName = this._generateSquadName(leader);
                for (const member of squad) {
                    member.cflag[900] = squadId;
                    member.cflag[901] = member === leader ? 1 : 0;
                    member.cstr[1] = squadName;
                    // 被组队的撤退勇者重新振作
                    if (member.cflag[503]) member.cflag[503] = 0;
                }
                // 每日事件标记同步：如果小队中任何成员已触发事件，整队同步
                const anyTriggered = squad.some(m => m.cflag[910]);
                if (anyTriggered) {
                    for (const member of squad) {
                        member.cflag[910] = 1;
                    }
                }
                // 计算小队士气（V3.0 种族配合度）
                const morale = this._calculateSquadMorale(squad);
                for (const member of squad) {
                    member.cflag[903] = morale;
                }
                // 治疗职业小队恢复
                this._applySquadHealing(squad);
                squadId++;
            }
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
            if (healerClasses.includes(m.cflag[950] || 0)) hasHealer = true;
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
        const healerClasses = [202, 205, 209]; // 神官,炼金术士,巫女
        const healers = squad.filter(m => healerClasses.includes(m.cflag[950] || 0));
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
            const ailmentMask = member.cflag[920] || 0;
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

        const explorers = this.characters.filter(c => c.talent[200] && c.cflag[700]);

        for (let i = 0; i < explorers.length; i++) {
            if (assigned.has(i)) continue;
            const slave = explorers[i];
            const floorId = slave.cflag[701] || 10;
            const progress = slave.cflag[702] || 0;

            const squad = [slave];
            assigned.add(i);

            for (let j = i + 1; j < explorers.length; j++) {
                if (assigned.has(j)) continue;
                if (squad.length >= 3) break;
                const other = explorers[j];
                if ((other.cflag[701] || 10) === floorId) {
                    const diff = Math.abs((other.cflag[702] || 0) - progress);
                    if (diff <= 15) {
                        squad.push(other);
                        assigned.add(j);
                    }
                }
            }

            if (squad.length > 1) {
                const leader = squad.reduce((best, s) => {
                    const spd = s.cflag[13] || 10 + s.level * 2;
                    const bestSpd = best.cflag[13] || 10 + best.level * 2;
                    return spd > bestSpd ? s : best;
                }, squad[0]);

                const squadName = this._generateSquadName(leader);
                for (const member of squad) {
                    member.cflag[900] = squadId;
                    member.cflag[901] = member === leader ? 1 : 0;
                    member.cstr[1] = squadName;
                }
                squadId++;
            }
        }
    }

    // 获取勇者的小队成员（不包括自己】
Game.prototype._getHeroSquad = function(hero) {
        const squadId = hero.cflag[900];
        if (!squadId) return [];
        return this.invaders.filter(h => h !== hero && h.cflag[900] === squadId);
    }

    // 尝试将两个勇者加入同一小队，最多3人
Game.prototype._getSlaveSquad = function(slave) {
        const squadId = slave.cflag[900];
        if (!squadId) return [];
        return this.characters.filter(c => c !== slave && c.talent[200] && c.cflag[900] === squadId);
    }

    // 寻找战斗增援：同一层20%进度范围内的勇者/前勇者可能加入战斗
Game.prototype._tryMergeSquad = function(a, b) {
        const aId = a.cflag[900];
        const bId = b.cflag[900];
        if (aId && bId && aId === bId) return true; // 已经在同一小队
        const aSquad = aId ? this.invaders.filter(h => h.cflag[900] === aId) : [a];
        const bSquad = bId ? this.invaders.filter(h => h.cflag[900] === bId) : [b];
        if (aSquad.length + bSquad.length > 3) return false; // 超过3人上限
        const newId = aId || bId || (100 + a.id + b.id);
        const allMembers = [...new Set([...aSquad, ...bSquad])];
        const leader = allMembers.reduce((best, h) => {
            const spd = h.cflag[13] || 10 + h.level * 2;
            const bestSpd = best.cflag[13] || 10 + best.level * 2;
            return spd > bestSpd ? h : best;
        }, allMembers[0]);
        for (const m of allMembers) {
            m.cflag[900] = newId;
            m.cflag[901] = m === leader ? 1 : 0;
        }
        return true;
    }

    // 获取前勇者奴隶的小队成员
Game.prototype._findReinforcements = function(fighters, floorId, progress, side = 'hero') {
        const reinforcements = [];
        const candidates = this.invaders.filter(h => {
            if (h.hp <= 0) return false;
            if (fighters.includes(h)) return false;
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
                if (RAND(100) < chance) reinforcements.push(candidate);
            } else if (side === 'monster') {
                if (isSpy) {
                    if (RAND(100) < 35) reinforcements.push(candidate);
                } else {
                    // 普通勇者反叛到怪物方概率极低
                    if ((candidate.mark[0] || 0) >= 2 && RAND(100) < 8) {
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
