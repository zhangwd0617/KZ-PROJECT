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

    // 处理奴隶每日任务（返回事件结果供UI显示）
Game.prototype.processSlaveTaskDaily = function(slave) {
        const taskType = slave.cflag[CFLAGS.SLAVE_TASK_TYPE] || 0;
        if (taskType === 0) return null;
        if (taskType === 1) return this._processSlaveHuntHero(slave);
        if (taskType === 2) return this._processSlaveLurk(slave);
        if (taskType === 3) return this._processSlaveTownRaid(slave);
        return null;
    }

    // 奴隶任务1：讨伐勇者（反向移动，途中俘虏勇者）
Game.prototype._processSlaveHuntHero = function(slave) {
        const startFloor = slave.cflag[CFLAGS.SLAVE_TASK_FLOOR] || 10;
        let currentFloor = slave.cflag[CFLAGS.SLAVE_TASK_CURRENT_FLOOR] || startFloor;
        let currentProgress = slave.cflag[CFLAGS.SLAVE_TASK_PROGRESS] || 100;
        const oldProgress = currentProgress;
        const moveSpeed = 20; // 固定每天20%
        currentProgress -= moveSpeed;

        const logs = [];
        let medalGained = false;

        // 每走过50%路程都有5%几率等级直接+1
        const milestones = [50];
        for (const m of milestones) {
            if (oldProgress > m && currentProgress <= m && RAND(100) < 5) {
                this._levelUpEntity(slave, 1);
                logs.push(`⭐ ${slave.name}在地下城中有所领悟，等级升至${slave.level}！`);
            }
        }

        // 检查同楼层是否有勇者（40%发现率）
        let combatData = null;
        const heroesOnFloor = this.invaders.filter(h => this.getHeroFloor(h) === currentFloor && h.hp > 0);
        if (heroesOnFloor.length > 0 && RAND(100) < 40) {
            const target = heroesOnFloor[RAND(heroesOnFloor.length)];
            logs.push(`👁️ ${slave.name}在第${currentFloor}层发现了${target.name}！`);
            const combat = this._doTeamCombat([slave], [target]);
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
                slave.fame += 5; // 击败勇者 +5 声望
                // 俘虏勇者（主动出击，跳过逃跑判定）
                const captureResult = this._processCapture(target, { name: '奴隶伏击者', hp: 100, atk: 20, def: 10, spd: 10 }, true);
                if (captureResult.type === 'surrender' || captureResult.type === 'imprisoned') {
                    logs.push(`⛓️ ${target.name}被俘虏！`);
                    slave.fame += 10; // 俘虏勇者 +10 声望
                    this.addBrainwashExp(slave, 1);
                    medalGained = true;
                    // 50%概率返回汇报，50%继续执行任务
                    if (RAND(100) < 50) {
                        this._clearSlaveTask(slave);
                        return {
                            type: 'hunt',
                            name: slave.name,
                            text: `${slave.name}在第${currentFloor}层俘虏了${target.name}后返回魔王处汇报工作。\n${logs.join('\n')}`,
                            medalGained: true,
                            combatData: combatData
                        };
                    }
                }
            } else if (combat.defeated) {
                // 被勇者击败：传送回魔王宫，触发惩罚事件，等级+5
                this._levelUpEntity(slave, 5);
                slave.hp = slave.maxHp;
                logs.push(`💔 ${slave.name}被${target.name}击败，被传送回魔王宫。`);
                logs.push(`😈 魔王对${slave.name}进行了惩罚强化，等级+5！（当前Lv.${slave.level}）`);
                this._clearSlaveTask(slave);
                return {
                    type: 'hunt',
                    name: slave.name,
                    text: `${slave.name}的任务以失败告终，但被魔王强化。\n${logs.join('\n')}`,
                    combatData: combatData
                };
            } else {
                logs.push(`🛡️ ${slave.name}与${target.name}交战未分胜负。`);
            }
        }

        // 更新位置
        if (currentProgress <= 0) {
            if (currentFloor <= 1) {
                this._clearSlaveTask(slave);
                return {
                    type: 'hunt',
                    name: slave.name,
                    text: `${slave.name}成功从第${startFloor}层返回到第一层入口，完成讨伐任务！\n${logs.join('\n')}`
                };
            } else {
                slave.cflag[CFLAGS.SLAVE_TASK_CURRENT_FLOOR] = currentFloor - 1;
                slave.cflag[CFLAGS.SLAVE_TASK_PROGRESS] = 100;
                logs.push(`📍 抵达第${currentFloor - 1}层入口`);
            }
        } else {
            slave.cflag[CFLAGS.SLAVE_TASK_CURRENT_FLOOR] = currentFloor;
            slave.cflag[CFLAGS.SLAVE_TASK_PROGRESS] = currentProgress;
        }

        return {
            type: 'hunt',
            name: slave.name,
            text: `${slave.name}正在第${currentFloor}层反向移动（进度${currentProgress}%）。\n${logs.join('\n')}`,
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
            const heroesOnFloor = this.invaders.filter(h => this.getHeroFloor(h) === currentFloor && h.hp > 0);
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
                    const captureResult = this._processCapture(lurkTarget, { name: '潜伏者', hp: 100, atk: 10, def: 5, spd: 10 }, true);
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
                        const captureResult = this._processCapture(lurkTarget, { name: '潜伏者', hp: 100, atk: 10, def: 5, spd: 10 }, true);
                        if (captureResult.type !== 'escape') {
                            slave.fame += 10; // 俘虏勇者 +10 声望
                            this.addBrainwashExp(slave, 1);
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
                this._clearSlaveTask(slave);
                return {
                    type: 'lurk',
                    name: slave.name,
                    text: `${slave.name}成功返回到第一层入口，完成潜伏任务！\n${logs.join('\n')}`
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

    // 奴隶任务3：袭击城镇
Game.prototype._processSlaveTownRaid = function(slave) {
        const logs = [];
        // 随机选择一个勇者作为对手
        const targets = this.invaders.filter(h => h.hp > 0);
        if (targets.length === 0) {
            this._clearSlaveTask(slave);
            return {
                type: 'raid',
                name: slave.name,
                text: `${slave.name}袭击了城镇，但没有遇到勇者。\n任务结束。`
            };
        }
        const target = targets[RAND(targets.length)];
        logs.push(`🔥 ${slave.name}带领怪物袭击了城镇！`);
        logs.push(`⚔️ 与${target.name}发生战斗！`);

        const combat = this._doTeamCombat([slave], [target]);
        const combatData = {
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
            logs.push(`✅ ${slave.name}战胜了${target.name}！`);
            slave.fame += 5; // 击败勇者 +5 声望
            // 50%概率抓捕（主动出击，跳过逃跑判定）
            if (RAND(100) < 50) {
                const captureResult = this._processCapture(target, { name: '袭击者', hp: 100, atk: 20, def: 10, spd: 10 }, true);
                if (captureResult.type !== 'escape') {
                    logs.push(`⛓️ ${target.name}被抓捕！`);
                    slave.fame += 10; // 俘虏勇者 +10 声望
                    this.addBrainwashExp(slave, 1);
                }
            }
            // 100%获得随机女性
            if (typeof CharaTemplates !== 'undefined') {
                const newSlave = CharaTemplates.createRandomSlave(1, Math.max(5, slave.level));
                newSlave.cflag[CFLAGS.CAPTURE_STATUS] = 1;
                this.addCharaFromTemplate(newSlave);
                logs.push(`👩 获得了新的奴隶：${newSlave.name} Lv.${newSlave.level}`);
            }
            // 金币奖励
            const goldReward = slave.level * 200 + RAND(500);
            this.money += goldReward;
            logs.push(`💰 获得${goldReward}G`);
            // 声望
            this.addFame(10);
            slave.fame += 10; // 袭击城镇 +10 个人声望
            logs.push(`🏆 魔王声望+10，${slave.name}个人声望+10`);
        } else if (combat.defeated) {
            // 被勇者击败：传送回魔王宫，触发惩罚事件，等级+5
            slave.level += 5;
            if (typeof CharaTemplates !== 'undefined') {
                CharaTemplates.recalcStats(slave);
            }
            slave.hp = slave.maxHp;
            logs.push(`💔 ${slave.name}被${target.name}击败，被传送回魔王宫。`);
            logs.push(`😈 魔王对${slave.name}进行了惩罚强化，等级+5！（当前Lv.${slave.level}）`);
        } else {
            logs.push(`🛡️ 战斗未分胜负。`);
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
        const roll = RAND(100);

        if (roll < 60) {
            // 60% 讨伐地下城
            const targetFloor = Math.min(Math.ceil(hero.level / 10) + 1 + RAND(2), 10);
            hero.cflag[CFLAGS.HERO_TASK_TYPE] = 1; // 讨伐地下城
            hero.cflag[CFLAGS.HERO_REASON] = targetFloor;
            hero.cflag[CFLAGS.HERO_ORIGIN] = 0;
            hero.cflag[CFLAGS.HERO_FAMILY] = 0;
            hero.cflag[CFLAGS.HERO_TASK_STATUS] = 0;
            const floorDef = DUNGEON_FLOOR_DEFS[targetFloor];
            hero.cstr[CSTRS.TASK_DESC] = `前往第${targetFloor}层${floorDef ? '"' + floorDef.name + '"' : ''}，击败关底Boss`;
        } else {
            // 40% 完成委托
            const comIds = Object.keys(COMMISSION_DEFS);
            let comId = parseInt(comIds[RAND(comIds.length)]);
            let comDef = COMMISSION_DEFS[comId];
            // 确保委托目标可达：委托楼层不超过勇者可达楼层
            let comFloor = Math.max(1, Math.min(maxReachableFloor, 1 + RAND(maxReachableFloor)));
            let targetName = '';
            if (comDef.type === 'find_hero') {
                // 寻找某个勇者（从当前入侵者中随机选）
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
                const monsters = FLOOR_MONSTER_DEFS[comFloor];
                targetName = monsters ? monsters[RAND(monsters.length)].name : "精英怪物";
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
        }
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
            // 遇到目标勇者即完成
            completed = true;
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
        }
    }

    // ========== 隐藏商店系统 ==========
