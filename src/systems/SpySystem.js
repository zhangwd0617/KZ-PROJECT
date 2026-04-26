/**
 * SpySystem — extracted from Game.js
 */
Game.prototype.sendSpy = function(index) {
        const slave = this.getChara(index);
        if (!slave || !slave.talent[200]) {
            UI.showToast('该角色不是前勇者，无法派遣伪装', 'danger');
            return false;
        }
        if (slave.cflag[CFLAGS.FALLEN_DEPTH]) {
            UI.showToast(`${slave.name} 正在探索中，无法派遣`, 'warning');
            return false;
        }
        if (slave.cflag[CFLAGS.PLEASURE]) {
            UI.showToast(`${slave.name} 已经派出了伪装者`, 'warning');
            return false;
        }

        // 创建伪装者：复制前勇者的数据
        const spy = new Character(-2);
        spy.name = slave.name;
        spy.callname = slave.callname;
        spy.base = [...slave.base];
        spy.maxbase = [...slave.maxbase];
        spy.hp = Math.floor(slave.maxHp * 0.6);
        spy.mp = Math.floor(slave.maxMp * 0.5);
        spy.level = slave.level;
        spy.cflag[CFLAGS.BASE_HP] = slave.level;
        spy.cflag[CFLAGS.ATK] = slave.cflag[CFLAGS.ATK] || 20 + slave.level * 5;
        spy.cflag[CFLAGS.DEF] = slave.cflag[CFLAGS.DEF] || 15 + slave.level * 4;
        spy.cflag[CFLAGS.SPD] = slave.cflag[CFLAGS.SPD] || 10 + slave.level * 3;
        spy.talent = [...slave.talent];
        spy.talent[200] = 0; // 伪装者应像普通勇者，不要前勇者标记
        spy.cflag[912] = 1; // 伪装者标记
        spy.cflag[CFLAGS.HERO_RARITY] = 'N'; // 稀有度默认为N
        spy.mark = [...slave.mark];
        spy.abl = [...slave.abl];

        // 初始化勇者入侵标【        spy.cflag[CFLAGS.HERO_FLOOR] = 1;
        spy.cflag[CFLAGS.HERO_PROGRESS] = 0;

        // 标记原奴隶已派出伪装
        slave.cflag[CFLAGS.PLEASURE] = 1;

        this.invaders.push(spy);
        UI.showToast(`${slave.name} 伪装成勇者混入了入侵者队伍！`, 'warning');
        return true;
    }

    // ========== 奴隶反向探索系统 ==========

    // 派出前勇者奴隶进行地下城反向探索
Game.prototype.sendSlaveExplore = function(index) {
        const slave = this.getChara(index);
        if (!slave || !slave.talent[200]) {
            UI.showToast('该角色不是前勇者，无法派出探索', 'danger');
            return false;
        }
        if (slave.cflag[CFLAGS.FALLEN_DEPTH]) {
            UI.showToast(`${slave.name} 已经在探索中了`, 'warning');
            return false;
        }
        slave.cflag[CFLAGS.FALLEN_DEPTH] = 1; // 标记探索【        slave.cflag[CFLAGS.FALLEN_STAGE] = 10; // 从第10层开【        slave.cflag[CFLAGS.CORRUPTION] = 0; // 进度0
        UI.showToast(`派出【${slave.name} 前往地下城第10层探索！`, 'success');
        return true;
    }

    // 召回探索中的奴隶
Game.prototype.recallSlaveExplore = function(index) {
        const slave = this.getChara(index);
        if (!slave || !slave.cflag[CFLAGS.FALLEN_DEPTH]) {
            UI.showToast('该角色没有在探索', 'warning');
            return false;
        }
        slave.cflag[CFLAGS.FALLEN_DEPTH] = 0;
        UI.showToast(`召回【${slave.name} (累计获得${slave.cflag[703] || 0}EXP)`, 'info');
        return true;
    }

    // 处理奴隶每日探索
Game.prototype.processSlaveExploreDaily = function() {
        const results = [];
        const processed = new Set();

        for (const slave of this.characters) {
            if (!slave.talent[200] || !slave.cflag[CFLAGS.FALLEN_DEPTH]) continue;
            if (processed.has(slave)) continue;

            // 处理返回魔王宫的奴隶
            if (slave.cflag[CFLAGS.DEPRAVITY]) {
                const squadId = slave.cflag[CFLAGS.SQUAD_ID];
                // 如果属于小队但不是队长，跳过（由队长统一处理）
                if (squadId && slave.cflag[CFLAGS.SQUAD_LEADER] !== 1) {
                    processed.add(slave);
                    continue;
                }
                let squad = [];
                if (squadId && slave.cflag[CFLAGS.SQUAD_LEADER] === 1) {
                    squad = this.characters.filter(c => c !== slave && c.talent[200] && c.cflag[CFLAGS.SQUAD_ID] === squadId);
                    for (const member of squad) processed.add(member);
                }
                // 触发复命事件
                const reportResult = this._processSlaveReport(slave, squad);
                results.push(reportResult);
                processed.add(slave);
                continue;
            }

            const floorId = slave.cflag[CFLAGS.FALLEN_STAGE] || 10;
            let progress = slave.cflag[CFLAGS.CORRUPTION] || 0;

            // 反向探索：每天基础+5%进度
            let moveSpeed = 5 + Math.floor((slave.level - 1) * 10 / 49);
            if (moveSpeed > 15) moveSpeed = 15;

            // 检查是否属于小队
            const squadId = slave.cflag[CFLAGS.SQUAD_ID];
            let squad = [];
            if (squadId && slave.cflag[CFLAGS.SQUAD_LEADER] === 1) {
                // 队长：收集所有小队成【                squad = this.characters.filter(c => c !== slave && c.talent[200] && c.cflag[CFLAGS.SQUAD_ID] === squadId);
                for (const member of squad) processed.add(member);
            } else if (squadId && slave.cflag[CFLAGS.SQUAD_LEADER] !== 1) {
                // 非队长：跳过（由队长处理【                continue;
            }

            // 40%触发好事件，60%触发修炼事件
            const roll = RAND(100);
            if (roll < 40) {
                // 好事】
                if (squad.length > 0) {
                    // 小队好事件：效果共享
                    const goodEvent = this._processSlaveGoodEvent(slave, floorId);
                    results.push({ name: `${slave.name}小队`, type: 'good', text: goodEvent.text, exp: goodEvent.exp, gold: goodEvent.gold });
                    for (const member of squad) {
                        member.hp = Math.min(member.maxHp, member.hp + Math.floor(member.maxHp * 0.05));
                        member.mp = Math.min(member.maxMp, member.mp + Math.floor(member.maxMp * 0.03));
                    }
                } else {
                    const goodEvent = this._processSlaveGoodEvent(slave, floorId);
                    results.push({ name: slave.name, type: 'good', text: goodEvent.text, exp: goodEvent.exp, gold: goodEvent.gold });
                }
            } else {
                // 修炼事件
                if (squad.length > 0) {
                    // 小队修炼：遇到怪物，小队一起战斗
                    const monster = this._spawnMonster(floorId, 'normal');
                    if (monster) {
                        const fullSquad = [slave, ...squad];
                        const combat = this._doTeamCombat(fullSquad, [monster]);
                        const expPerMember = combat.victory ? Math.floor(monster.level * 10 / fullSquad.filter(s => s.hp > 0).length) : 0;
                        results.push({
                            name: `${slave.name}小队`,
                            type: 'train',
                            text: `遭遇${monster.name} ${combat.victory ? '胜利' : (combat.defeated ? '败北' : '撤退')} ${combat.victory ? `(+${expPerMember}EXP)` : ''}`,
                            exp: expPerMember
                        });
                    } else {
                        const trainEvent = this._processSlaveTrainEvent(slave, floorId);
                        results.push({ name: slave.name, type: 'train', text: trainEvent.text, exp: trainEvent.exp, gold: trainEvent.gold });
                    }
                } else {
                    const trainEvent = this._processSlaveTrainEvent(slave, floorId);
                    results.push({ name: slave.name, type: 'train', text: trainEvent.text, exp: trainEvent.exp, gold: trainEvent.gold });
                }
            }

            // 前勇者探索也可能触发隐藏商店（每【%概率）和奸商【%概率】
            if (Math.random() < 0.08) {
                const shopResult = this._triggerHiddenShop(slave, floorId);
                if (shopResult) results.push({ name: slave.name, ...shopResult });
            }
            if (Math.random() < 0.04) {
                const swindlerResult = this._triggerSwindler(slave, floorId);
                if (swindlerResult) results.push({ name: slave.name, ...swindlerResult });
            }

            // 前勇者训练补偿：5%概率随机升级身上一件装备（最高橙色）
            if (roll >= 40) {
                const upgradeTargets = [slave, ...squad].filter(m => m && m.gear);
                for (const target of upgradeTargets) {
                    if (Math.random() < 0.05) {
                        const upgraded = GearSystem.randomUpgradeGear(target);
                        if (upgraded) {
                            results.push({
                                name: target.name,
                                type: 'upgrade',
                                text: `在修炼中顿悟，${GearSystem.getGearNameHtml(upgraded)} 的品质提升了！当前品质：${GearSystem.getRarityName(upgraded.rarity)}`
                            });
                        }
                    }
                }
            }

            // 检查进度宝箱（奴隶探索也触发）
            const oldProgress = slave.cflag[CFLAGS.CORRUPTION] || 0;
            const slaveChests = this._checkProgressChests(slave, oldProgress, oldProgress + moveSpeed, floorId);
            if (slaveChests.length > 0) {
                for (const chest of slaveChests) {
                    results.push({
                        name: slave.name,
                        type: 'chest',
                        text: `【${chest.threshold}%处发现${chest.type === 'legendary' ? '传说宝箱' : '高级宝箱'}】${chest.msg}${chest.curseTriggered ? ' ⚠️受到诅咒' : ''}`
                    });
                }
            }

            // 更新进度（所有成员同步）
            progress += moveSpeed;
            if (progress >= 100) {
                if (floorId > 1) {
                    slave.cflag[CFLAGS.FALLEN_STAGE] = floorId - 1;
                    slave.cflag[CFLAGS.CORRUPTION] = 0;
                    slave.cflag[CFLAGS.DESIRE] = 0; // 重置宝箱标记
                    for (const member of squad) {
                        member.cflag[CFLAGS.FALLEN_STAGE] = floorId - 1;
                        member.cflag[CFLAGS.CORRUPTION] = 0;
                        member.cflag[CFLAGS.DESIRE] = 0;
                    }
                    results.push({ name: slave.name, type: 'floor', text: `小队到达第${floorId - 1}层！` });
                } else {
                    // 到达【层出口，开始返回魔王宫
                    slave.cflag[CFLAGS.DEPRAVITY] = 1; // 标记为返回中
                    slave.cflag[CFLAGS.CORRUPTION] = 0;
                    slave.cflag[CFLAGS.DESIRE] = 0;
                    for (const member of squad) {
                        member.cflag[CFLAGS.DEPRAVITY] = 1;
                        member.cflag[CFLAGS.CORRUPTION] = 0;
                        member.cflag[CFLAGS.DESIRE] = 0;
                    }
                    results.push({ name: slave.name, type: 'floor', text: `小队到达【层出口，开始返回魔王宫…` });
                }
            } else {
                slave.cflag[CFLAGS.CORRUPTION] = progress;
                for (const member of squad) {
                    member.cflag[CFLAGS.CORRUPTION] = progress;
                }
            }

            // 自动恢复
            slave.hp = Math.min(slave.maxHp, slave.hp + Math.floor(slave.maxHp * 0.05));
            slave.mp = Math.min(slave.maxMp, slave.mp + Math.floor(slave.maxMp * 0.03));
            processed.add(slave);
        }
        return results;
    }

    // 奴隶好事】
Game.prototype._processSlaveGoodEvent = function(slave, floorId) {
        const monLevel = floorId * 5; // 该层平均怪物等级参】
        const events = [
            { weight: 3, text: `发现了隐藏的宝箱，获得${monLevel * monLevel}G`, gold: monLevel * monLevel },
            { weight: 3, text: `发现了魔力结晶，MP完全恢复`, restoreMp: 1 },
            { weight: 2, text: `找到了治愈泉水，HP完全恢复`, restoreHp: 1 },
            { weight: 2, text: `遇到了友善的低级魔物，获得${floorId * 5}EXP`, exp: floorId * 5 },
            { weight: 1, text: `发现了古代遗迹，获得${floorId * 15}EXP`, exp: floorId * 15 },
            { weight: 2, text: `休息了一整天，状态恢复`, restoreBoth: 0.3 },
            { weight: 2, text: `发现了被遗忘的财宝库`, gold: monLevel * monLevel * 2 },
        ];
        const evt = this._weightedRandom(events);
        let text = evt.text;
        let gainedExp = evt.exp || 0;
        let gainedGold = evt.gold || 0;

        if (gainedGold > 0) {
            slave.gold += gainedGold;
            text += ` [${slave.name}金币:${slave.gold}G]`;
        }
        if (evt.restoreMp) {
            slave.mp = slave.maxMp;
        }
        if (evt.restoreHp) {
            slave.hp = slave.maxHp;
        }
        if (evt.restoreBoth) {
            slave.hp = Math.min(slave.maxHp, slave.hp + Math.floor(slave.maxHp * evt.restoreBoth));
            slave.mp = Math.min(slave.maxMp, slave.mp + Math.floor(slave.maxMp * evt.restoreBoth));
        }
        if (gainedExp > 0) {
            // V6.0: 统一EXP系统
            slave.addExp(102, gainedExp);
            if (typeof this.checkLevelUp === 'function') this.checkLevelUp(slave);
            slave.cflag[703] = (slave.cflag[703] || 0) + gainedExp;
            text += ` (+${gainedExp}EXP)`;
        }

        return { text, exp: gainedExp, gold: gainedGold };
    }

    // 奴隶修炼事件
Game.prototype._processSlaveTrainEvent = function(slave, floorId) {
        const templates = window.MONSTER_TEMPLATES[floorId];
        const monLevel = floorId * 20; // V6.0: 该层最高等级
        const expGain = monLevel; // 修炼结果 = 当楼层怪物等级的经验
        // 前勇者修炼获得金币（新平衡：与怪物等级²挂钩）
        const goldGain = Math.floor(monLevel * monLevel + RAND(monLevel * 5));
        slave.gold += goldGain;

        // V6.0: 统一EXP系统
        slave.addExp(102, expGain);
        if (typeof this.checkLevelUp === 'function') this.checkLevelUp(slave);
        slave.cflag[703] = (slave.cflag[703] || 0) + expGain;

        const trainTexts = [
            `与地下城魔物战斗修炼，击败了${templates ? templates[RAND(templates.length)].name : '魔物'}`,
            `在魔力浓郁的区域冥想修炼`,
            `反复演练战斗技巧`,
            `独自深入危险区域历练`,
            `研究了古代战斗壁画`,
            `与幻影进行模拟战斗`,
        ];
        const text = trainTexts[RAND(trainTexts.length)] + ` (+${expGain}EXP, +${goldGain}G)`;

        return { text, exp: expGain, gold: goldGain };
    }

    // 前勇者返回魔王宫复命
Game.prototype._processSlaveReport = function(slave, squad) {
        const totalExp = slave.cflag[703] || 0;
        const totalGold = slave.gold;
        const allMembers = [slave, ...squad];

        // 重置所有成员探索状】
        for (const member of allMembers) {
            member.cflag[CFLAGS.FALLEN_DEPTH] = 0;
            member.cflag[CFLAGS.FALLEN_STAGE] = 10;
            member.cflag[CFLAGS.CORRUPTION] = 0;
            member.cflag[703] = 0;
            member.cflag[CFLAGS.DESIRE] = 0;
            member.cflag[CFLAGS.DEPRAVITY] = 0;
            member.cflag[CFLAGS.SQUAD_ID] = 0;
            member.cflag[CFLAGS.SQUAD_LEADER] = 0;
            // 恢复状【            member.hp = Math.min(member.maxHp, member.hp + Math.floor(member.maxHp * 0.5));
            member.mp = Math.min(member.maxMp, member.mp + Math.floor(member.maxMp * 0.5));
        }

        // 30%概率触发魔王性爱奖励事件
        const triggerReward = Math.random() < 0.3;
        let rewardText = '';
        if (triggerReward) {
            // 魔王奖励效果
            slave.addPalam(5, 3000);  // 欲情
            slave.addPalam(4, 2000);  // 顺从
            slave.addPalam(6, 2000);  // 屈服
            slave.addExp(2, 3);        // 绝顶经验+3
            slave.addExp(4, 2);        // 性交经验+2
            slave.addMark(1, 1);       // 快乐刻印+1
            if (slave.abl[10] < 5) slave.abl[10]++; // 顺从+1
            if (slave.abl[11] < 5) slave.abl[11]++; // 欲望+1
            // 魔王获得调教经验
            this.masterExp += 5;
            rewardText = `\n🏰 【魔王的爱奖励】\n${slave.name}回到魔王宫复命，魔王对她的表现非常满意。\n"做得很好，值得奖励。"魔王将她拉入怀中…\n在魔王的宠爱下，${slave.name}的身体变得火热，顺从心增加了。\n获得：绝顶经【3,快乐刻【1,顺【欲望上升,魔王经【5`;
        } else {
            rewardText = `\n${slave.name}顺利返回魔王宫复命。`;
        }

        const squadText = squad.length > 0 ? `（小队共${allMembers.length}人）` : '';
        return {
            name: slave.name,
            type: 'complete',
            text: `${squadText}完成了地下城探索！累计获得${totalExp}EXP,持有金${totalGold}G，${rewardText}`,
            exp: totalExp,
            gold: totalGold,
            reward: triggerReward
        };
    }

    // 加权随机选择
