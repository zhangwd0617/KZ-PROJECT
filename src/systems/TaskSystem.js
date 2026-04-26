/**
 * TaskSystem — extracted from Game.js
 */
Game.prototype._clearSlaveTask = function(slave) {
        if (!slave) return;
        slave.cflag[CFLAGS.SLAVE_TASK_TYPE] = 0;
        slave.cflag[CFLAGS.SLAVE_TASK_FLOOR] = 0;
        slave.cflag[CFLAGS.SLAVE_TASK_CURRENT_FLOOR] = 0;
        slave.cflag[CFLAGS.SLAVE_TASK_PROGRESS] = 0;
        slave.cflag[CFLAGS.COMMAND_FILTER] = 0;
        slave.cflag[912] = 0; // 清除伪装标记
        slave.cstr[CSTRS.TASK_RESULT] = '';
    }

    // 公共接口：清除奴隶任务（供UI调用）
Game.prototype.clearSlaveTask = function(slave) {
        this._clearSlaveTask(slave);
    }

    // ========== 相性系统 ==========

    // 生成角色的相性值 (0-100)，基于种族,职业,性格
Game.prototype.canAssignTask = function(entity) {
        if (!entity) return false;
        if (this.getMaster() === entity) return true; // 魔王
        if (!entity.talent[200]) return false; // 必须是陷落勇者（前勇者标记）
        // V9.0: 洗脑角色视为已陷落，可直接指派
        if (entity.talent[296]) return true;
        if ((entity.mark[0] || 0) >= 3) return true; // 服从刻印Lv3
        // 爱慕系
        if (entity.talent[85]) return true; // 爱慕
        if (entity.talent[86]) return true; // 盲信（爱慕上位）
        if (entity.talent[182]) return true; // 挚爱（爱慕上位）
        // 淫乱系
        if (entity.talent[76]) return true; // 淫乱
        if (entity.talent[272]) return true; // 淫魔（淫乱上位）
        return false;
    }

    // 分配奴隶任务（供UI调用）
Game.prototype.assignSlaveTask = function(slave, taskType, floor) {
        if (!this.canAssignTask(slave)) {
            return { success: false, msg: '该角色无法执行任务（需陷落或魔王）' };
        }
        const isMaster = this.getMaster() === slave;
        // 魔王只能执行讨伐任务（任务类型1）
        if (isMaster && taskType !== 1) {
            return { success: false, msg: '魔王只能执行出击讨伐任务' };
        }
        if ((slave.cflag[CFLAGS.SLAVE_TASK_TYPE] || 0) !== 0) {
            return { success: false, msg: '该角色已有任务进行中' };
        }
        const def = SLAVE_TASK_DEFS[taskType];
        if (!def) {
            return { success: false, msg: '无效的任务类型' };
        }

        slave.cflag[CFLAGS.SLAVE_TASK_TYPE] = taskType;
        slave.cflag[CFLAGS.SLAVE_TASK_FLOOR] = taskType === 3 ? 0 : (floor || 10);
        slave.cflag[CFLAGS.SLAVE_TASK_CURRENT_FLOOR] = taskType === 3 ? 0 : (floor || 10);
        slave.cflag[CFLAGS.SLAVE_TASK_PROGRESS] = 100;
        slave.cflag[CFLAGS.COMMAND_FILTER] = -1;
        slave.cstr[CSTRS.TASK_RESULT] = `${def.icon} ${def.name}`;

        if (taskType === 3) {
            return { success: true, msg: `${slave.name}开始执行"${def.icon} ${def.name}"` };
        } else {
            return { success: true, msg: `${slave.name}从第${floor}层出发执行"${def.icon} ${def.name}"` };
        }
    }

    // V12.0: 组队分配出击任务（最多3人）
    Game.prototype.assignSlaveSquadTask = function(leader, mates, taskType, floor) {
        if (!this.canAssignTask(leader)) {
            return { success: false, msg: '队长无法执行任务' };
        }
        if ((leader.cflag[CFLAGS.SLAVE_TASK_TYPE] || 0) !== 0) {
            return { success: false, msg: '队长已有任务进行中' };
        }
        const def = SLAVE_TASK_DEFS[taskType];
        if (!def) {
            return { success: false, msg: '无效的任务类型' };
        }
        if (mates.length > 2) {
            return { success: false, msg: '出击小队最多3人' };
        }

        // V12.0: 标记队长和队员
        const squadMarker = 900 + RAND(99); // 随机小队标记900-999，避免和勇者小队冲突
        leader.cflag[CFLAGS.SLAVE_TASK_TYPE] = taskType;
        leader.cflag[CFLAGS.SLAVE_TASK_FLOOR] = floor || 10;
        leader.cflag[CFLAGS.SLAVE_TASK_CURRENT_FLOOR] = floor || 10;
        leader.cflag[CFLAGS.SLAVE_TASK_PROGRESS] = 100;
        leader.cflag[CFLAGS.COMMAND_FILTER] = -1;
        leader.cstr[CSTRS.TASK_RESULT] = `${def.icon} ${def.name}(队长)`;
        leader.cflag[CFLAGS.SQUAD_LEADER] = 1; // 标记为队长
        leader.cflag[998] = squadMarker; // 魔王军小队标记

        // 分配队友任务
        for (const mate of mates) {
            if (!this.canAssignTask(mate)) continue;
            if ((mate.cflag[CFLAGS.SLAVE_TASK_TYPE] || 0) !== 0) continue;
            mate.cflag[CFLAGS.SLAVE_TASK_TYPE] = taskType;
            mate.cflag[CFLAGS.SLAVE_TASK_FLOOR] = floor || 10;
            mate.cflag[CFLAGS.SLAVE_TASK_CURRENT_FLOOR] = floor || 10;
            mate.cflag[CFLAGS.SLAVE_TASK_PROGRESS] = 100;
            mate.cflag[CFLAGS.COMMAND_FILTER] = -1;
            mate.cstr[CSTRS.TASK_RESULT] = `${def.icon} ${def.name}(队员)`;
            mate.cflag[CFLAGS.SQUAD_LEADER] = 0; // 标记为队员
            mate.cflag[998] = squadMarker;
        }

        const mateNames = mates.map(m => m.name).join('、');
        return { success: true, msg: `${leader.name}带队${mateNames ? ' + ' + mateNames : ''}执行"${def.icon} ${def.name}"` };
    }

    // 处理奴隶每日任务（返回事件结果供UI显示）
Game.prototype.processSlaveTaskDaily = function(slave) {
        const taskType = slave.cflag[CFLAGS.SLAVE_TASK_TYPE] || 0;
        if (taskType === 0) return null;
        if (taskType === 1) return this._processSlaveHuntHero(slave);
        if (taskType === 2) return this._processSlaveLurk(slave);
        if (taskType === 3) return this._processSlaveTownRaid(slave);
        return null;
    }

    // V12.0: 获取魔王军出击小队的队友（不含队长自身）
    Game.prototype._getSlaveSquadMates = function(slave) {
        const squadMarker = slave.cflag[998] || 0;
        if (!squadMarker) return [];
        return this.characters.filter(c => {
            if (c === slave) return false;
            if (c.hp <= 0) return false;
            if ((c.cflag[CFLAGS.SLAVE_TASK_TYPE] || 0) !== 1) return false;
            if ((c.cflag[998] || 0) !== squadMarker) return false;
            return true;
        });
    }

    // V12.0: 同步魔王军出击小队进度（移动/楼层/任务状态）
    Game.prototype._syncSlaveSquadProgress = function(leader, currentFloor, currentProgress) {
        const mates = this._getSlaveSquadMates(leader);
        for (const mate of mates) {
            mate.cflag[CFLAGS.SLAVE_TASK_CURRENT_FLOOR] = currentFloor;
            mate.cflag[CFLAGS.SLAVE_TASK_PROGRESS] = currentProgress;
        }
    }

    // V12.0: 清除魔王军出击小队所有人的任务
    Game.prototype._clearSlaveSquadTask = function(leader) {
        const mates = this._getSlaveSquadMates(leader);
        for (const mate of mates) {
            this._clearSlaveTask(mate);
        }
        this._clearSlaveTask(leader);
    }

    // 奴隶任务1：讨伐勇者（反向移动，途中俘虏勇者）
    // V12.0: 重写支持出击小队协同
Game.prototype._processSlaveHuntHero = function(slave) {
        const startFloor = slave.cflag[CFLAGS.SLAVE_TASK_FLOOR] || 10;
        let currentFloor = slave.cflag[CFLAGS.SLAVE_TASK_CURRENT_FLOOR] || startFloor;
        let currentProgress = slave.cflag[CFLAGS.SLAVE_TASK_PROGRESS] || 100;
        const oldProgress = currentProgress;
        const moveSpeed = 20; // 固定每天20%
        currentProgress -= moveSpeed;

        const logs = [];
        let medalGained = false;
        const mates = this._getSlaveSquadMates(slave);
        const hasSquad = mates.length > 0;

        // 每走过50%路程都有5%几率等级直接+1（队长独享）
        const milestones = [50];
        for (const m of milestones) {
            if (oldProgress > m && currentProgress <= m && RAND(100) < 5) {
                this._levelUpEntity(slave, 1);
                logs.push(`⭐ ${slave.name}在地下城中有所领悟，等级升至${slave.level}！`);
            }
        }

        // V12.0: 同步小队进度
        this._syncSlaveSquadProgress(slave, currentFloor, currentProgress);

        // 检查同楼层是否有勇者（40%发现率）
        let combatData = null;
        // V12.0: 只有进度接近的勇者才会遇到（阈值30%）
        const heroesOnFloor = this.invaders.filter(h => {
            if (this.getHeroFloor(h) !== currentFloor) return false;
            if (h.hp <= 0) return false;
            if (h.cflag[912]) return false;
            if ((h.cflag[CFLAGS.HERO_TASK_TYPE] || 0) === 3) return false;
            const heroProgress = this.getHeroProgress(h);
            const progressDiff = Math.abs(heroProgress - currentProgress);
            if (progressDiff > 30) return false; // 进度差超过30%不会遇到
            return true;
        });
        if (heroesOnFloor.length > 0 && RAND(100) < 40) {
            const target = heroesOnFloor[RAND(heroesOnFloor.length)];
            logs.push(`👁️ ${slave.name}在第${currentFloor}层发现了${target.name}！`);
            // 勇者遭遇魔王/前勇者日志
            this._addAdventureLog(target, 'encounter_master', `遭遇前勇者${slave.name}的阻击（第${currentFloor}层）`);

            // V12.0: 勇者态度影响遭遇魔王军时的行为
            const targetAttitude = target.cflag[CFLAGS.HERO_ATTITUDE] || 1;
            let attitudeHandled = false;
            if (targetAttitude === 2 && RAND(100) < 30) {
                // 中立型：30%概率选择撤退
                logs.push(`🏃 ${target.name}选择避战撤退！`);
                this._addAdventureLog(target, 'retreat', `遭遇前勇者${slave.name}，选择避战撤退`);
                // 目标向后移动
                target.cflag[CFLAGS.HERO_PROGRESS] = Math.max(0, (target.cflag[CFLAGS.HERO_PROGRESS] || 0) - 10);
                attitudeHandled = true;
            } else if (targetAttitude === 3 && RAND(100) < 20) {
                // 倾向魔王型：20%概率直接投降
                logs.push(`🙇 ${target.name}感受到魔王的力量，直接投降了！`);
                this._addAdventureLog(target, 'surrender', `遭遇前勇者${slave.name}，感受到魔王的力量而投降`);
                // 直接俘虏（跳过战斗）
                this._imprisonHero(target, 1);
                this.addBrainwashExp(slave, 1);
                // V12.0: 出击小队全员获得勋章
                this.addMedal(slave, 1);
                if (hasSquad) {
                    for (const mate of mates) {
                        this.addMedal(mate, 1);
                    }
                    logs.push(`🏅 ${slave.name}的出击小队全员获得魔王勋章！`);
                } else {
                    logs.push(`🏅 ${slave.name}获得魔王勋章！`);
                }
                medalGained = true;
                // 声望只归队长（但不算个人独特加成）
                slave.fame += 10;
                logs.push(`⛓️ ${target.name}被俘虏！`);
                if (RAND(100) < 50) {
                    this._clearSlaveSquadTask(slave);
                    return {
                        type: 'hunt',
                        name: slave.name,
                        text: hasSquad
                            ? `${slave.name}的出击小队在第${currentFloor}层俘虏了投降的${target.name}后返回魔王处汇报工作。\n${logs.join('\n')}`
                            : `${slave.name}在第${currentFloor}层俘虏了投降的${target.name}后返回魔王处汇报工作。\n${logs.join('\n')}`,
                        medalGained: true,
                        combatLog: logs
                    };
                }
                attitudeHandled = true;
            }

            if (!attitudeHandled) {
            // V10.0: 若目标勇者有小队，则与小队全体战斗
            const targetSquadId = target.cflag[CFLAGS.SQUAD_ID];
            let rightTeam = [target];
            if (targetSquadId && targetSquadId > 0) {
                const squadMates = this.invaders.filter(h => h.cflag[CFLAGS.SQUAD_ID] === targetSquadId && h !== target && h.hp > 0);
                if (squadMates.length > 0) {
                    rightTeam = [target, ...squadMates];
                    logs.push(`👥 ${target.name}的小队成员(${squadMates.map(h=>h.name).join('、')})也加入了战斗！`);
                }
            }
            // V12.0: 出击小队协同——队友自动加入战斗（进度已同步，无需检查同楼层）
            let leftTeam = [slave];
            if (hasSquad) {
                leftTeam = [slave, ...mates];
                logs.push(`👥 ${slave.name}的出击小队(${mates.map(a=>a.name).join('、')})协同作战！`);
            }
            const combat = this._doTeamCombat(leftTeam, rightTeam);
            combatData = {
                type: 'team',
                hero: slave,
                heroName: slave.name,
                monster: target,
                leftTeam: combat.leftTeam,
                rightTeam: combat.rightTeam,
                combatLog: combat.combatLog,
                victory: combat.victory,
                defeated: combat.defeated,
                escaped: combat.escaped,
                rounds: combat.rounds
            };
            if (combat.victory) {
                logs.push(`⚔️ ${slave.name}击败了${target.name}！`);
                // V12.0: 声望只归队长，不算个人独特加成
                slave.fame += 5;
                // 俘虏勇者（主动出击，跳过逃跑判定）
                const captureResult = this._processCapture(target, slave, true);
                if (captureResult.type === 'surrender' || captureResult.type === 'imprisoned') {
                    logs.push(`⛓️ ${target.name}被俘虏！`);
                    slave.fame += 10; // 俘虏声望归队长
                    this.addBrainwashExp(slave, 1);
                    // V12.0: 出击小队全员获得勋章
                    this.addMedal(slave, 1);
                    if (hasSquad) {
                        for (const mate of mates) {
                            this.addMedal(mate, 1);
                        }
                        logs.push(`🏅 ${slave.name}的出击小队全员获得魔王勋章！`);
                    } else {
                        logs.push(`🏅 ${slave.name}获得魔王勋章！`);
                    }
                    medalGained = true;
                    // 50%概率返回汇报，50%继续执行任务
                    if (RAND(100) < 50) {
                        this._clearSlaveSquadTask(slave);
                        return {
                            type: 'hunt',
                            name: slave.name,
                            text: hasSquad
                                ? `${slave.name}的出击小队在第${currentFloor}层俘虏了${target.name}后返回魔王处汇报工作。\n${logs.join('\n')}`
                                : `${slave.name}在第${currentFloor}层俘虏了${target.name}后返回魔王处汇报工作。\n${logs.join('\n')}`,
                            medalGained: true,
                            combatData: combatData
                        };
                    }
                }
            } else if (combat.defeated) {
                // 被勇者击败：传送回魔王宫，触发惩罚事件，等级+5（队长独享惩罚）
                this._levelUpEntity(slave, 5);
                slave.hp = slave.maxHp;
                for (const mate of mates) {
                    this._levelUpEntity(mate, 2); // 队员只+2级
                    mate.hp = mate.maxHp;
                }
                logs.push(`💔 ${slave.name}的出击小队被${target.name}击败，被传送回魔王宫。`);
                logs.push(`😈 魔王对${slave.name}进行了惩罚强化，等级+5！（当前Lv.${slave.level}）`);
                if (hasSquad) {
                    logs.push(`😈 队员也获得了一定程度的强化。`);
                }
                this._clearSlaveSquadTask(slave);
                return {
                    type: 'hunt',
                    name: slave.name,
                    text: hasSquad
                        ? `${slave.name}的出击小队任务以失败告终，但被魔王强化。\n${logs.join('\n')}`
                        : `${slave.name}的任务以失败告终，但被魔王强化。\n${logs.join('\n')}`,
                    combatData: combatData
                };
            } else {
                logs.push(`🛡️ ${slave.name}与${target.name}交战未分胜负。`);
            }
            } // V12.0: 闭合 if (!attitudeHandled)
        }

        // 更新位置
        if (currentProgress <= 0) {
            if (currentFloor <= 1) {
                // V12.0: 出击小队全员获得勋章，同步清除任务
                this.addMedal(slave, 1);
                if (hasSquad) {
                    for (const mate of mates) {
                        this.addMedal(mate, 1);
                    }
                    logs.push(`🏅 ${slave.name}的出击小队全员完成任务获得魔王勋章！`);
                } else {
                    logs.push(`🏅 ${slave.name}完成任务获得魔王勋章！`);
                }
                this._clearSlaveSquadTask(slave);
                return {
                    type: 'hunt',
                    name: slave.name,
                    text: hasSquad
                        ? `${slave.name}的出击小队成功从第${startFloor}层返回到第一层入口，完成讨伐任务！\n${logs.join('\n')}`
                        : `${slave.name}成功从第${startFloor}层返回到第一层入口，完成讨伐任务！\n${logs.join('\n')}`,
                    medalGained: true
                };
            } else {
                slave.cflag[CFLAGS.SLAVE_TASK_CURRENT_FLOOR] = currentFloor - 1;
                slave.cflag[CFLAGS.SLAVE_TASK_PROGRESS] = 100;
                // V12.0: 同步小队楼层变化
                this._syncSlaveSquadProgress(slave, currentFloor - 1, 100);
                logs.push(`📍 抵达第${currentFloor - 1}层入口`);
            }
        } else {
            slave.cflag[CFLAGS.SLAVE_TASK_CURRENT_FLOOR] = currentFloor;
            slave.cflag[CFLAGS.SLAVE_TASK_PROGRESS] = currentProgress;
        }

        return {
            type: 'hunt',
            name: slave.name,
            text: hasSquad
                ? `${slave.name}的出击小队正在第${currentFloor}层反向移动（进度${currentProgress}%）。\n${logs.join('\n')}`
                : `${slave.name}正在第${currentFloor}层反向移动（进度${currentProgress}%）。\n${logs.join('\n')}`,
            combatData: combatData
        };
    }

    // 奴隶任务2：潜伏（消耗勇者MP使其屈服）
Game.prototype._processSlaveLurk = function(slave) {
        slave.cflag[912] = 1; // 潜伏任务中标记为伪装者
        const startFloor = slave.cflag[CFLAGS.SLAVE_TASK_FLOOR] || 10;
        let currentFloor = slave.cflag[CFLAGS.SLAVE_TASK_CURRENT_FLOOR] || startFloor;
        let currentProgress = slave.cflag[CFLAGS.SLAVE_TASK_PROGRESS] || 100;
        const oldProgress = currentProgress;
        const moveSpeed = 20; // 固定每天20%
        currentProgress -= moveSpeed;

        const logs = [];

        // 每走过50%路程都有5%几率等级直接+1
        const milestones = [50];
        for (const m of milestones) {
            if (oldProgress > m && currentProgress <= m && RAND(100) < 5) {
                slave.level += 1;
                logs.push(`⭐ ${slave.name}在地下城中有所领悟，等级升至${slave.level}！`);
                if (typeof CharaTemplates !== 'undefined') {
                    CharaTemplates.recalcStats(slave);
                }
            }
        }

        // 检查是否正在潜伏某个勇者
        let lurkTargetIndex = slave.cflag[CFLAGS.COMMAND_FILTER] || -1;
        let lurkTarget = null;
        if (lurkTargetIndex >= 0 && lurkTargetIndex < this.invaders.length) {
            lurkTarget = this.invaders[lurkTargetIndex];
            if (!lurkTarget || lurkTarget.hp <= 0 || this.getHeroFloor(lurkTarget) !== currentFloor) {
                lurkTarget = null;
                slave.cflag[CFLAGS.COMMAND_FILTER] = -1;
            }
        }

        // 寻找新的潜伏目标
        if (!lurkTarget) {
            const heroesOnFloor = this.invaders.filter(h => this.getHeroFloor(h) === currentFloor && h.hp > 0 && !h.cflag[912] && (h.cflag[CFLAGS.HERO_TASK_TYPE] || 0) !== 3);
            if (heroesOnFloor.length > 0 && RAND(100) < 50) {
                lurkTarget = heroesOnFloor[RAND(heroesOnFloor.length)];
                lurkTargetIndex = this.invaders.indexOf(lurkTarget);
                slave.cflag[CFLAGS.COMMAND_FILTER] = lurkTargetIndex;
                logs.push(`🎭 ${slave.name}伪装成同伴接近了${lurkTarget.name}！`);
            }
        }

        // 执行潜伏效果
        if (lurkTarget) {
            // === 每日伪装识破判定 ===
            let exposeChance = 10; // 基础识破率10%
            // 等级差修正：目标比奴隶等级高越多，越容易识破
            const lvDiff = (lurkTarget.level || 1) - (slave.level || 1);
            exposeChance += lvDiff * 3;
            // MP修正：目标MP低时精神不集中，反而更容易察觉异常
            const mpRatio = lurkTarget.maxMp > 0 ? lurkTarget.mp / lurkTarget.maxMp : 1;
            if (mpRatio < 0.3) exposeChance += 10;
            // 性格修正
            if (lurkTarget.talent[13]) exposeChance += 5;   // 坦率（容易发现破绽）
            if (lurkTarget.talent[164]) exposeChance += 5;  // 冷静（善于观察）
            if (lurkTarget.talent[17]) exposeChance += 3;   // 老实（直觉敏锐）
            if (lurkTarget.talent[175]) exposeChance += 5;  // 伶俐（聪明机警）
            // 限制范围：最低5%，最高30%
            exposeChance = Math.max(5, Math.min(30, exposeChance));

            if (RAND(100) < exposeChance) {
                // 伪装被识破！
                logs.push(`⚠️ ${slave.name}的伪装被${lurkTarget.name}识破了！（识破率${exposeChance}%）`);
                slave.cflag[CFLAGS.COMMAND_FILTER] = -1;
                // 勇者会攻击暴露的奴隶，触发战斗
                const combat = this._doTeamCombat([slave], [lurkTarget]);
                const combatData = {
                    type: 'team',
                    hero: slave,
                    heroName: slave.name,
                    monster: lurkTarget,
                    leftTeam: combat.leftTeam,
                    rightTeam: combat.rightTeam,
                    combatLog: combat.combatLog,
                    victory: combat.victory,
                    defeated: combat.defeated,
                    escaped: combat.escaped,
                    rounds: combat.rounds
                };
                if (combat.victory) {
                    logs.push(`⚔️ ${slave.name}在被识破后反而击败了${lurkTarget.name}！`);
                    slave.fame += 5; // 击败勇者 +5 声望
                    const captureResult = this._processCapture(lurkTarget, slave, true);
                    if (captureResult.type === 'surrender' || captureResult.type === 'imprisoned') {
                        logs.push(`⛓️ ${lurkTarget.name}被俘虏！`);
                        slave.fame += 10; // 俘虏勇者 +10 声望
                        this.addBrainwashExp(slave, 1);
                    }
                } else if (combat.defeated) {
                    // 奴隶被击败：传送回魔王宫，等级+5惩罚
                    this._levelUpEntity(slave, 5);
                    slave.hp = slave.maxHp;
                    logs.push(`💔 ${slave.name}被${lurkTarget.name}击败，被传送回魔王宫。`);
                    logs.push(`😈 魔王对${slave.name}进行了惩罚强化，等级+5！（当前Lv.${slave.level}）`);
                } else {
                    logs.push(`🛡️ 双方战斗未分胜负，${slave.name}趁乱撤退了。`);
                }
                this._clearSlaveTask(slave);
                return {
                    type: 'lurk',
                    name: slave.name,
                    text: `${slave.name}的伪装被识破了！\n${logs.join('\n')}`,
                    combatData: combatData
                };
            }

            // 伪装未被识破，继续潜伏效果
            const mpDrain = Math.floor(lurkTarget.maxMp * 0.25);
            lurkTarget.mp = Math.max(0, lurkTarget.mp - mpDrain);
            logs.push(`💤 ${lurkTarget.name}的气力被消耗了${mpDrain}点（剩余${lurkTarget.mp}/${lurkTarget.maxMp}）`);

            if (lurkTarget.mp <= 0) {
                // 判定屈服
                const yieldChance = 50 + (this.getMedalCount(slave) * 5);
                if (RAND(100) < yieldChance) {
                    lurkTarget.mark[0] = (lurkTarget.mark[0] || 0) + 1;
                    logs.push(`😵 ${lurkTarget.name}的屈服度上升了！（当前Lv.${lurkTarget.mark[0]}）`);
                    if (lurkTarget.mark[0] >= 3) {
                        logs.push(`🏳️ ${lurkTarget.name}完全屈服，向魔王投降！`);
                        // 俘虏勇者（主动出击，跳过逃跑判定）
                        const captureResult = this._processCapture(lurkTarget, slave, true);
                        if (captureResult.type !== 'escape') {
                            slave.fame += 10; // 俘虏勇者 +10 声望
                            this.addBrainwashExp(slave, 1);
                            this.addMedal(slave, 1); // V10.0: 俘虏勇者获得勋章
                            logs.push(`🏅 ${slave.name}获得魔王勋章！`);
                        }
                        slave.cflag[CFLAGS.COMMAND_FILTER] = -1;
                        // 50%概率返回
                        if (RAND(100) < 50) {
                            this._clearSlaveTask(slave);
                            return {
                                type: 'lurk',
                                name: slave.name,
                                text: `${slave.name}成功劝诱${lurkTarget.name}投降！\n${logs.join('\n')}`,
                                medalGained: true
                            };
                        }
                    }
                } else {
                    logs.push(`❌ ${lurkTarget.name}顽强抵抗，没有屈服...`);
                }
                // 重置MP以便下次判定
                lurkTarget.mp = Math.floor(lurkTarget.maxMp * 0.1);
            }
        }

        // 更新位置
        if (currentProgress <= 0) {
            if (currentFloor <= 1) {
                this.addMedal(slave, 1); // V10.0: 完成任务获得勋章
                logs.push(`🏅 ${slave.name}完成任务获得魔王勋章！`);
                this._clearSlaveTask(slave);
                return {
                    type: 'lurk',
                    name: slave.name,
                    text: `${slave.name}成功返回到第一层入口，完成潜伏任务！\n${logs.join('\n')}`,
                    medalGained: true
                };
            } else {
                slave.cflag[CFLAGS.SLAVE_TASK_CURRENT_FLOOR] = currentFloor - 1;
                slave.cflag[CFLAGS.SLAVE_TASK_PROGRESS] = 100;
                if (lurkTarget) logs.push(`📍 ${slave.name}跟随${lurkTarget.name}来到了第${currentFloor - 1}层`);
                else logs.push(`📍 抵达第${currentFloor - 1}层入口`);
            }
        } else {
            slave.cflag[CFLAGS.SLAVE_TASK_CURRENT_FLOOR] = currentFloor;
            slave.cflag[CFLAGS.SLAVE_TASK_PROGRESS] = currentProgress;
        }

        return {
            type: 'lurk',
            name: slave.name,
            text: `${slave.name}正在第${currentFloor}层潜伏（进度${currentProgress}%）。\n${logs.join('\n')}`
        };
    }

    // 生成袭击防御小队（临时勇者，不进入 invaders）
Game.prototype._generateRaidDefenseTeam = function(target) {
        const team = [];
        const devilFame = Math.max(this.flag[503] || 0, 1);
        let baseLevel = 50;
        let defenseStrength = 0;
        const count = 3;
        const isCity = target.targetType === 'city' || target.type === 'city';
        const isKing = target.targetType === 'king_territory' || target.type === 'king_territory';
        const isChurch = target.targetType === 'church' || target.type === 'church';

        if (isCity) {
            const cityType = target.type;
            if (cityType === 'town') baseLevel = 50;
            else if (cityType === 'major') baseLevel = 100;
            else if (cityType === 'capital') baseLevel = 150;
            defenseStrength = this.getCityDefenseStrength(target.name) || 0;
        } else if (isKing) {
            const stage = this.getKingTerritoryStage(target.kingId);
            if (!stage) return team;
            baseLevel = stage.level;
            defenseStrength = baseLevel * 10;
        } else if (isChurch) {
            baseLevel = 100;
            defenseStrength = this.churchState ? (this.churchState.defense || 5000) : 5000;
        } else {
            return team;
        }

        const factor = Math.max(0.5, Math.min(2.0, defenseStrength / devilFame));

        for (let i = 0; i < count; i++) {
            const options = {};
            if (isKing) {
                const stage = this.getKingTerritoryStage(target.kingId);
                if (!stage) continue;
                options.rarity = stage.rarity;
                if (stage.isKing && i === 0) {
                    options.isKing = true;
                }
            } else if (isChurch) {
                options.isChurch = true;
                if (RAND(100) < 33) options.forceRace = 6; // 天使
            }

            let level = Math.floor(baseLevel * factor);
            if (isKing && options.isKing) {
                // 天王本人等级略高
                level += RAND_RANGE(0, 21);
            } else {
                level += RAND_RANGE(-20, 21);
            }
            level = Math.max(5, Math.min(200, level));

            const hero = this._createTempDefenseHero(level, options);
            if (hero) team.push(hero);
        }

        return team;
    }

    // 生成单个临时防御勇者
Game.prototype._createTempDefenseHero = function(level, options = {}) {
        if (typeof Character === 'undefined') return null;
        const hero = new Character(-2);

        // 种族
        let preRace = options.forceRace || (1 + RAND(4));
        hero.talent[314] = preRace;

        // 名字
        let name = '守备勇者';
        const cfg = window.HERO_INVASION_CONFIG;
        if (cfg && cfg.heroTemplates && cfg.heroTemplates.female) {
            const template = cfg.heroTemplates.female;
            const raceKey = ['human', 'elf', 'orc', 'dwarf'][preRace - 1] || 'human';
            const pool = template.namePools ? (template.namePools[raceKey] || template.namePools.human) : null;
            if (pool && pool.given) {
                const given = pool.given[RAND(pool.given.length)];
                const family = pool.family && pool.family.length > 0 ? pool.family[RAND(pool.family.length)] : '';
                name = family ? `${given}·${family}` : given;
            }
        }
        hero.name = name;
        hero.callname = name.split('·')[0] || name;

        // 等级
        hero.level = level;
        hero.cflag[CFLAGS.BASE_HP] = level;

        // 职业
        const classId = this._rollBasicClass(preRace);
        const clsDef = window.CLASS_DEFS ? window.CLASS_DEFS[classId] : null;
        if (clsDef) {
            hero.cflag[CFLAGS.CLASS_ID] = classId;
            hero.cflag[CFLAGS.HERO_CLASS] = classId;
            hero.cstr[355] = JSON.stringify(clsDef.skills);
        }

        // 属性
        this._recalcBaseStats(hero);
        hero.base[0] = hero.maxbase[0];
        hero.base[1] = hero.maxbase[1];
        hero.base[2] = hero.maxbase[2];
        hero.hp = hero.maxHp;
        hero.mp = hero.maxMp;

        // 性别（女性为主，10%男性）
        if (RAND(100) < 10) {
            hero.talent[122] = 1;
            hero.talent[1] = 1;
        }

        // 性格
        const personalities = [10, 11, 12, 13, 14, 15, 16, 17, 18];
        hero.talent[personalities[RAND(personalities.length)]] = 1;

        // 稀有度
        if (options.rarity) {
            hero.cflag[CFLAGS.HERO_RARITY] = options.rarity;
        } else {
            hero.cflag[CFLAGS.HERO_RARITY] = 'N';
        }

        // 金币
        hero.gold = Math.floor(level * level + RAND(level * 10));

        return hero;
    }

    // 奴隶任务3：袭击城镇
Game.prototype._processSlaveTownRaid = function(slave) {
        const logs = [];

        // 1. 检查冷却
        if (this._raidCooldownDay > this.day) {
            logs.push(`⏳ 魔王军正在休整中，还需 ${this._raidCooldownDay - this.day} 天才能再次发起袭击。`);
            return {
                type: 'raid',
                name: slave.name,
                text: `${slave.name}的城镇袭击无法执行。\n${logs.join('\n')}`
            };
        }

        // 2. 读取组队和目标
        let attackTeam = [slave];
        let target = null;
        let members = [];
        let parseError = false;

        try {
            const taskData = JSON.parse(slave.cstr[355] || '{}');
            if (taskData.members && Array.isArray(taskData.members)) {
                members = taskData.members;
                for (const idx of members) {
                    if (idx >= 0 && idx < this.characters.length) {
                        const m = this.characters[idx];
                        if (m && m !== slave && m.hp > 0) {
                            attackTeam.push(m);
                        }
                    }
                }
            }
            if (taskData.target) {
                target = taskData.target;
            }
        } catch (e) {
            parseError = true;
        }

        // 如果解析失败或无目标，回退到旧的随机勇者逻辑（兼容旧数据）
        let combatData = null;
        if (parseError || !target) {
            const oldTargets = this.invaders.filter(h => h.hp > 0 && !h.cflag[912] && (h.cflag[CFLAGS.HERO_TASK_TYPE] || 0) !== 3);
            if (oldTargets.length === 0) {
                slave.cstr[355] = '';
                this._clearSlaveTask(slave);
                return {
                    type: 'raid',
                    name: slave.name,
                    text: `${slave.name}袭击了城镇，但没有遇到勇者。\n任务结束。`
                };
            }
            const oldTarget = oldTargets[RAND(oldTargets.length)];
            logs.push(`🔥 ${slave.name}带领怪物袭击了城镇！`);
            logs.push(`⚔️ 与${oldTarget.name}发生战斗！`);

            const combat = this._doTeamCombat([slave], [oldTarget]);
            combatData = {
                type: 'team',
                hero: slave,
                heroName: slave.name,
                monster: oldTarget,
                leftTeam: combat.leftTeam,
                rightTeam: combat.rightTeam,
                combatLog: combat.combatLog,
                victory: combat.victory,
                defeated: combat.defeated,
                escaped: combat.escaped,
                rounds: combat.rounds
            };
            if (combat.victory) {
                logs.push(`✅ ${slave.name}战胜了${oldTarget.name}！`);
                slave.fame += 5;
                this.addMedal(slave, 1);
                logs.push(`🏅 ${slave.name}获得魔王勋章！`);
                if (RAND(100) < 50) {
                    const captureResult = this._processCapture(oldTarget, slave, true);
                    if (captureResult.type !== 'escape') {
                        logs.push(`⛓️ ${oldTarget.name}被抓捕！`);
                        slave.fame += 10;
                        this.addBrainwashExp(slave, 1);
                        this.addMedal(slave, 1);
                        logs.push(`🏅 ${slave.name}因俘虏获得额外魔王勋章！`);
                    }
                }
                if (typeof CharaTemplates !== 'undefined') {
                    const newSlave = CharaTemplates.createRandomSlave(1, Math.max(5, slave.level));
                    newSlave.cflag[CFLAGS.CAPTURE_STATUS] = 0;
                    this.addCharaFromTemplate(newSlave);
                    logs.push(`👩 获得了新的奴隶：${newSlave.name} Lv.${newSlave.level}`);
                }
                const goldReward = slave.level * 200 + RAND(500);
                this.money += goldReward;
                logs.push(`💰 获得${goldReward}G`);
                this.addFame(10);
                slave.fame += 10;
                logs.push(`🏆 魔王声望+10，${slave.name}个人声望+10`);
            } else if (combat.defeated) {
                this._levelUpEntity(slave, 5);
                slave.hp = slave.maxHp;
                logs.push(`💔 ${slave.name}被${oldTarget.name}击败，被传送回魔王宫。`);
                logs.push(`😈 魔王对${slave.name}进行了惩罚强化，等级+5！（当前Lv.${slave.level}）`);
            } else {
                logs.push(`🛡️ 战斗未分胜负。`);
            }

            slave.cstr[355] = '';
            this._clearSlaveTask(slave);
            return {
                type: 'raid',
                name: slave.name,
                text: `${slave.name}的城镇袭击结束了。\n${logs.join('\n')}`,
                combatData: combatData
            };
        }

        // 3. 生成防御小队
        const defenseTeam = this._generateRaidDefenseTeam(target);
        if (defenseTeam.length === 0) {
            logs.push(`⚠️ ${target.name}的防御力量异常薄弱，袭击取消。`);
            slave.cstr[355] = '';
            this._clearSlaveTask(slave);
            return {
                type: 'raid',
                name: slave.name,
                text: `${slave.name}的城镇袭击取消了。\n${logs.join('\n')}`
            };
        }

        logs.push(`🔥 ${slave.name}带领${attackTeam.length}人小队袭击了${target.name}！`);
        logs.push(`🛡️ ${target.name}的防御部队(${defenseTeam.length}人)出阵迎击！`);

        // 4. 战斗
        const combat = this._doTeamCombat(attackTeam, defenseTeam);
        combatData = {
            type: 'team',
            hero: slave,
            heroName: slave.name,
            monster: defenseTeam[0],
            leftTeam: combat.leftTeam,
            rightTeam: combat.rightTeam,
            combatLog: combat.combatLog,
            victory: combat.victory,
            defeated: combat.defeated,
            escaped: combat.escaped,
            rounds: combat.rounds
        };

        // 5. 战斗结果处理
        if (combat.victory) {
            // 胜利处理
            this.devilMorale = Math.min(200, (this.devilMorale || 100) + 5);
            logs.push(`📈 魔王军士气上升！当前士气：${this.devilMorale}`);

            const damagePct = 25 + RAND(16); // 25-40%
            let cityFallen = false;
            let fameTransferred = 0;

            if (target.targetType === 'city' || target.type === 'city') {
                const dmgResult = this._damageCityDefense(target.name, damagePct);
                cityFallen = dmgResult.cityFallen;
                fameTransferred = dmgResult.fameTransferred;
                logs.push(`🏚️ ${target.name}的防御耐久度减少${damagePct}%`);
                if (fameTransferred > 0) {
                    logs.push(`🏆 声望转移：+${fameTransferred}`);
                }
                if (cityFallen) {
                    logs.push(`💥 ${target.name}陷落了！`);
                    // 主城陷落：抓获王族奴隶 + 解锁定制奴隶
                    if (target.type === 'capital' && target.factionId) {
                        if (typeof CharaTemplates !== 'undefined') {
                            const royalSlave = CharaTemplates.createRandomSlave(Math.max(1, slave.level - 5), slave.level + 5);
                            royalSlave.talent[295] = 1; // 贵族
                            royalSlave.cflag[CFLAGS.CAPTURE_STATUS] = 0;
                            this.addCharaFromTemplate(royalSlave);
                            logs.push(`👑 抓获王族奴隶：${royalSlave.name} Lv.${royalSlave.level}`);
                        }
                        if (!this.customSlaveUnlocked.includes(target.factionId)) {
                            this.customSlaveUnlocked.push(target.factionId);
                            logs.push(`🔓 解锁${target.factionId}定制奴隶！`);
                        }
                    }
                }
            } else if (target.targetType === 'king_territory' || target.type === 'king_territory') {
                const kt = this.kingTerritoryStates && this.kingTerritoryStates[target.kingId];
                if (kt) {
                    kt.progress = (kt.progress || 0) + 1;
                    logs.push(`⚔️ ${target.name}受到重创！（阶段进度：${kt.progress}/3）`);
                    if (kt.progress >= 3) {
                        this._applyKingDefeatEffects(target.kingId);
                        logs.push(`🏆 ${target.name}被彻底击溃！`);
                    }
                }
            } else if (target.targetType === 'church' || target.type === 'church') {
                const churchDamage = Math.floor(damagePct * 50);
                this.churchState.defense = Math.max(0, (this.churchState.defense || 5000) - churchDamage);
                logs.push(`⛪ 教廷防御减少${churchDamage}！剩余：${this.churchState.defense}`);
                if (this.churchState.defense <= 0) {
                    this.churchState.defeated = true;
                    logs.push(`💥 教廷圣地陷落！`);
                }
            }

            // 对防御勇者逐个判定投降/逃跑
            for (const def of defenseTeam) {
                const captureResult = this._processCapture(def, slave, true);
                if (captureResult.type === 'surrender') {
                    logs.push(`🏳️ ${def.name}投降了！`);
                } else if (captureResult.type === 'imprisoned') {
                    logs.push(`⛓️ ${def.name}被俘！`);
                } else if (captureResult.type === 'escape') {
                    logs.push(`🏃 ${def.name}逃跑了！`);
                }
            }

            // 额外胜利事件（50%史诗物品 / 50%贵族奴隶）
            if (RAND(100) < 50) {
                if (typeof GearSystem !== 'undefined' && GearSystem.generateGear) {
                    const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
                    const slot = slotTypes[RAND(slotTypes.length)];
                    const drop = GearSystem.generateGear(slot, slave.level, 4); // 史诗
                    if (drop) {
                        logs.push(`🎁 获得史诗物品：${drop.name}`);
                    }
                }
            } else {
                if (typeof CharaTemplates !== 'undefined') {
                    const nobleSlave = CharaTemplates.createRandomSlave(1, Math.max(5, slave.level));
                    nobleSlave.talent[295] = 1; // 贵族
                    nobleSlave.cflag[CFLAGS.CAPTURE_STATUS] = 0;
                    this.addCharaFromTemplate(nobleSlave);
                    logs.push(`👩 获得贵族奴隶：${nobleSlave.name} Lv.${nobleSlave.level}`);
                }
            }

            // 参与者奖励：半级经验 + 2枚勋章
            for (const p of attackTeam) {
                const halfExp = Math.floor((this._calcLevelUpExp(p.level) || 100) * 0.5);
                if (typeof p.addExp === 'function') {
                    p.addExp(102, halfExp);
                }
                if (typeof this.checkLevelUp === 'function') {
                    this.checkLevelUp(p);
                }
                this.addMedal(p, 2);
            }
            logs.push(`⭐ 参与者获得半级经验与2枚魔王勋章！`);

            // 被攻击势力debuff（30天）
            const targetFaction = target.factionId || target.race;
            if (targetFaction && typeof targetFaction === 'string') {
                this._addFactionDebuff(targetFaction, 'morale_negative', 20, 30);
                logs.push(`📉 ${targetFaction}势力士气下降（30天）`);
            }

        } else if (combat.defeated) {
            // 失败处理
            this.devilMorale = Math.max(50, (this.devilMorale || 100) - 5);
            logs.push(`📉 魔王军士气下降！当前士气：${this.devilMorale}`);

            for (const p of attackTeam) {
                const newLevel = Math.max(5, (p.level || 1) - 5);
                if (newLevel < p.level) {
                    p.level = newLevel;
                    p.cflag[CFLAGS.BASE_HP] = newLevel;
                    this._recalcBaseStats(p);
                    logs.push(`💔 ${p.name}等级下降5级（当前Lv.${p.level}）`);
                }
            }

            this._raidCooldownDay = this.day + 10;
            logs.push(`⏳ 10天内无法再次发起袭击`);

            const fameLoss = Math.floor((this.flag[503] || 0) * 0.05);
            this.flag[503] = Math.max(0, (this.flag[503] || 0) - fameLoss);
            logs.push(`🏆 魔王声望-${fameLoss}（-5%）`);

            // 防守方势力增益（30天）
            const targetFaction = target.factionId || target.race;
            if (targetFaction && typeof targetFaction === 'string') {
                this._addFactionDebuff(targetFaction, 'morale_positive', 10, 30);
                logs.push(`📈 ${targetFaction}势力士气上升（30天）`);
            }
        } else {
            logs.push(`🛡️ 战斗未分胜负，双方撤退。`);
        }

        // 7. 清理：恢复cstr[355]为职业技能（如果存在）
        const classId = slave.cflag[CFLAGS.CLASS_ID];
        const clsDef = window.CLASS_DEFS ? window.CLASS_DEFS[classId] : null;
        if (clsDef && clsDef.skills) {
            slave.cstr[355] = JSON.stringify(clsDef.skills);
        } else {
            slave.cstr[355] = '';
        }
        this._clearSlaveTask(slave);

        return {
            type: 'raid',
            name: slave.name,
            text: `${slave.name}的城镇袭击结束了。\n${logs.join('\n')}`,
            combatData: combatData
        };
    }

    // ========== 勇者任务系统 ==========

    // 为勇者生成任务（自动刷新）
Game.prototype.generateHeroTask = function(hero) {
        if (!hero) return;
        // 如果已有未完成任务，不覆盖
        if ((hero.cflag[CFLAGS.HERO_TASK_TYPE] || 0) !== 0 && (hero.cflag[CFLAGS.HERO_TASK_STATUS] || 0) === 0) return;

        const maxReachableFloor = Math.min(Math.ceil(hero.level / 5), 10);
        const attitude = hero.cflag[CFLAGS.HERO_ATTITUDE] || 1;
        const roll = RAND(100);

        // V12.0: 根据勇者态度差异化分配任务
        if (attitude === 2) {
            // 中立型：20%讨伐 + 80%委托
            if (roll < 20) {
                this._generateHeroRaidTask(hero, maxReachableFloor);
            } else {
                this._generateHeroCommissionTask(hero, maxReachableFloor);
            }
        } else if (attitude === 3) {
            // 倾向魔王型：50%修炼 + 50%寻找真相
            if (roll < 50) {
                this._generateHeroTrainingTask(hero);
            } else {
                this._generateHeroTruthTask(hero, maxReachableFloor);
            }
        } else {
            // 讨伐型（默认）：60%讨伐 + 40%委托
            if (roll < 60) {
                this._generateHeroRaidTask(hero, maxReachableFloor);
            } else {
                this._generateHeroCommissionTask(hero, maxReachableFloor);
            }
        }

        // V7.3: 若该勇者是队长，将任务同步给全队（修炼/寻找真相任务不同步）
        const taskType = hero.cflag[CFLAGS.HERO_TASK_TYPE] || 0;
        const squadId = hero.cflag[CFLAGS.SQUAD_ID];
        const isLeader = hero.cflag[CFLAGS.SQUAD_LEADER] === 1;
        if (squadId && isLeader && taskType !== 4 && taskType !== 5) {
            const squad = this.invaders.filter(h => h.cflag[CFLAGS.SQUAD_ID] === squadId && h !== hero);
            for (const m of squad) {
                m.cflag[CFLAGS.HERO_TASK_TYPE] = hero.cflag[CFLAGS.HERO_TASK_TYPE];
                m.cflag[CFLAGS.HERO_REASON] = hero.cflag[CFLAGS.HERO_REASON];
                m.cflag[CFLAGS.HERO_ORIGIN] = hero.cflag[CFLAGS.HERO_ORIGIN];
                m.cflag[CFLAGS.HERO_FAMILY] = hero.cflag[CFLAGS.HERO_FAMILY];
                m.cflag[CFLAGS.HERO_TASK_STATUS] = hero.cflag[CFLAGS.HERO_TASK_STATUS];
                m.cstr[CSTRS.TASK_DESC] = hero.cstr[CSTRS.TASK_DESC] || '';
            }
        }
    }

    // V12.0: 生成讨伐地下城任务
    Game.prototype._generateHeroRaidTask = function(hero, maxReachableFloor) {
        const targetFloor = Math.max(1, Math.min(Math.ceil(hero.level / 10) + 1 + RAND(2), 10, maxReachableFloor));
        hero.cflag[CFLAGS.HERO_TASK_TYPE] = 1; // 讨伐地下城
        hero.cflag[CFLAGS.HERO_REASON] = targetFloor;
        hero.cflag[CFLAGS.HERO_ORIGIN] = 0;
        hero.cflag[CFLAGS.HERO_FAMILY] = 0;
        hero.cflag[CFLAGS.HERO_TASK_STATUS] = 0;
        const floorDef = DUNGEON_FLOOR_DEFS[targetFloor];
        hero.cstr[CSTRS.TASK_DESC] = `前往第${targetFloor}层${floorDef ? '"' + floorDef.name + '"' : ''}，击败关底Boss`;
        // V12.0: 心声——接到讨伐任务
        const raidVoices = [
            `目标是第${targetFloor}层...据说那里的Boss很强大，但我不能退缩。`,
            `讨伐魔王的任务下达了。为了守护大家，我必须变强。`,
            `第${targetFloor}层...希望我带的药足够。`,
            `又一个讨伐任务。每次深入地下城，都感觉离死亡更近了一步。`
        ];
        if (this._addAdventureLog) this._addAdventureLog(hero, 'voice', raidVoices[RAND(raidVoices.length)]);
    }

    // V12.0: 生成委托任务
    Game.prototype._generateHeroCommissionTask = function(hero, maxReachableFloor) {
        const comIds = Object.keys(COMMISSION_DEFS);
        let comId = parseInt(comIds[RAND(comIds.length)]);
        let comDef = COMMISSION_DEFS[comId];
        let comFloor = Math.max(1, Math.min(maxReachableFloor, 1 + RAND(maxReachableFloor)));
        let targetName = '';
        if (comDef.type === 'find_hero') {
            if (this.invaders.length > 1) {
                const others = this.invaders.filter(h => h !== hero);
                targetName = others[RAND(others.length)].name;
            } else {
                targetName = "某位失踪的同伴";
            }
        } else if (comDef.type === 'find_item') {
            const items = window.COMMISSION_ITEM_NAMES || ["古代遗物"];
            targetName = items[RAND(items.length)];
        } else if (comDef.type === 'defeat_elite') {
            const templates = window.MONSTER_TEMPLATES[comFloor];
            targetName = templates ? templates[RAND(templates.length)].name : "精英怪物";
        }
        hero.cflag[CFLAGS.HERO_TASK_TYPE] = 2; // 完成委托
        hero.cflag[CFLAGS.HERO_REASON] = comFloor;
        hero.cflag[CFLAGS.HERO_ORIGIN] = comId;
        hero.cflag[CFLAGS.HERO_FAMILY] = 0;
        hero.cflag[CFLAGS.HERO_TASK_STATUS] = 0;
        let desc = comDef.description
            .replace('{floor}', `${comFloor}层`)
            .replace('{target}', targetName)
            .replace('{heroName}', targetName)
            .replace('{itemName}', targetName)
            .replace('{monsterName}', targetName);
        hero.cstr[CSTRS.TASK_DESC] = `${comDef.icon || '📜'} ${comDef.name}：${desc}（报酬：${comDef.rewardGold}G + 声望+${comDef.rewardFame}）`;
        // V12.0: 心声——接到委托任务
        const comVoices = {
            find_hero: [`${targetName}失踪了...一定要找到${targetName}。`, `听说有人在地下城深处失联了，真让人担心。`],
            find_item: [`寻找古代遗物...希望能在${comFloor}层找到。`, `委托人很急，但这趟不会轻松。`],
            defeat_elite: [`要击败精英怪物...做好万全准备再上吧。`, `这正是证明我实力的时候。`],
            escort: [`护送商队通过${comFloor}层...希望一切顺利。`, `保护弱者也是勇者的职责。`],
            investigate: [`${comFloor}层的异变...希望不是魔王的阴谋。`, `调查任务总是充满未知的危险。`]
        };
        const cv = comVoices[comDef.type];
        if (cv && this._addAdventureLog) this._addAdventureLog(hero, 'voice', cv[RAND(cv.length)]);
    }

    // V12.0: 生成修炼任务（城镇停留1-3天）
    Game.prototype._generateHeroTrainingTask = function(hero) {
        const trainDays = 1 + RAND(3); // 1-3天
        hero.cflag[CFLAGS.HERO_TASK_TYPE] = 4; // 修炼
        hero.cflag[CFLAGS.HERO_REASON] = trainDays; // 需要停留的天数
        hero.cflag[CFLAGS.HERO_ORIGIN] = this.day; // 开始修炼的游戏天数
        hero.cflag[CFLAGS.HERO_FAMILY] = 0;
        hero.cflag[CFLAGS.HERO_TASK_STATUS] = 0;
        hero.cstr[CSTRS.TASK_DESC] = `🧘 修炼任务：在铁砧镇停留${trainDays}天进行修炼（每天EXP+10%）`;
        // 立即回城开始修炼
        this._startReturnToTown(hero, '前往城镇修炼');
    }

    // V12.0: 生成寻找真相任务
    Game.prototype._generateHeroTruthTask = function(hero, maxReachableFloor) {
        const targetFloor = Math.max(1, Math.min(maxReachableFloor, 2 + RAND(3))); // 2-5层
        hero.cflag[CFLAGS.HERO_TASK_TYPE] = 5; // 寻找真相
        hero.cflag[CFLAGS.HERO_REASON] = targetFloor; // 目标楼层
        hero.cflag[CFLAGS.HERO_ORIGIN] = 0;
        hero.cflag[CFLAGS.HERO_FAMILY] = 0;
        hero.cflag[CFLAGS.HERO_TASK_STATUS] = 0;
        hero.cstr[CSTRS.TASK_DESC] = `🔮 寻找真相：探索第${targetFloor}层，寻找关于魔王的线索`;
    }

    // 清除勇者任务
Game.prototype.clearHeroTask = function(hero) {
        if (!hero) return;
        hero.cflag[CFLAGS.HERO_TASK_TYPE] = 0;
        hero.cflag[CFLAGS.HERO_REASON] = 0;
        hero.cflag[CFLAGS.HERO_ORIGIN] = 0;
        hero.cflag[CFLAGS.HERO_FAMILY] = 0;
        hero.cflag[CFLAGS.HERO_TASK_STATUS] = 0;
        hero.cstr[CSTRS.TASK_DESC] = '';
    }


    // ========== 异常状态系统 ==========

Game.prototype._checkCommissionComplete = function(hero, triggerType, data = {}) {
        if (!hero || (hero.cflag[CFLAGS.HERO_TASK_TYPE] || 0) !== 2) return; // 不是委托任务
        if ((hero.cflag[CFLAGS.HERO_TASK_STATUS] || 0) !== 0) return; // 已完成或已结算
        const comId = hero.cflag[CFLAGS.HERO_ORIGIN] || 0;
        const comDef = COMMISSION_DEFS[comId];
        if (!comDef) return;
        const targetFloor = hero.cflag[CFLAGS.HERO_REASON] || 0;

        let completed = false;
        if (comDef.type === 'find_hero' && triggerType === 'meet_hero') {
            // 遇到其他勇者，获得失踪同伴的线索，委托完成
            completed = true;
        } else if (comDef.type === 'find_hero' && triggerType === 'explore') {
            // 在目标楼层探索时，也有概率发现失踪同伴留下的线索
            if (data.floorId === targetFloor && RAND(100) < 40) completed = true;
        } else if (comDef.type === 'find_item' && triggerType === 'explore') {
            // 在目标楼层探索时概率完成
            if (data.floorId === targetFloor && RAND(100) < 30) completed = true;
        } else if (comDef.type === 'defeat_elite' && triggerType === 'combat') {
            // 击败精英怪且在当前楼层
            if (data.floorId === targetFloor && data.monster && data.monster.eliteType === 'chief') completed = true;
        } else if (comDef.type === 'escort' && triggerType === 'explore') {
            // 穿越目标楼层即完成（只需在该楼层探索一次）
            if (data.floorId === targetFloor) completed = true;
        } else if (comDef.type === 'investigate' && triggerType === 'explore') {
            // 在目标楼层调查完成
            if (data.floorId === targetFloor && RAND(100) < 50) completed = true;
        }

        if (completed) {
            hero.cflag[CFLAGS.HERO_TASK_STATUS] = 1; // 标记已完成待汇报
            hero.cstr[CSTRS.TASK_DESC] += ' 【委托完成，返回城镇领取报酬】';
            // V7.2: 若勇者不在回城途中，自动触发回城交委托
            const taskType = hero.cflag[CFLAGS.HERO_TASK_TYPE] || 0;
            if (taskType !== 3 && typeof this._startReturnToTown === 'function') {
                this._startReturnToTown(hero, '委托完成，返回城镇领取报酬');
            }
        }
    }

    // V12.0: 寻找真相任务完成判定
    Game.prototype._checkTruthComplete = function(hero, floorId) {
        if (!hero || (hero.cflag[CFLAGS.HERO_TASK_TYPE] || 0) !== 5) return;
        if ((hero.cflag[CFLAGS.HERO_TASK_STATUS] || 0) !== 0) return;
        const targetFloor = hero.cflag[CFLAGS.HERO_REASON] || 0;
        if (floorId !== targetFloor) return;
        // 在目标楼层探索时30%概率发现线索
        if (RAND(100) < 30) {
            hero.cflag[CFLAGS.HERO_TASK_STATUS] = 1;
            hero.cstr[CSTRS.TASK_DESC] += ' 【发现了关于魔王的线索，返回城镇整理情报】';
            this._addAdventureLog(hero, 'truth_found', `在第${floorId}层发现了关于魔王的线索`);
            // 自动回城整理情报
            const taskType = hero.cflag[CFLAGS.HERO_TASK_TYPE] || 0;
            if (taskType !== 3 && typeof this._startReturnToTown === 'function') {
                this._startReturnToTown(hero, '发现了关于魔王的线索，返回城镇整理情报');
            }
        }
    }

    // ========== 隐藏商店系统 ==========
