// Injects methods into the global UI object
Object.assign(UI, {
    // ========== 战斗弹窗系统 ==========
    _combatQueue: [],
    _combatIndex: 0,
    _combatRound: 0,
    _combatAuto: true,
    _combatTimer: null,
    _combatParsed: null,

    _combatOnComplete: null,

    // 启动战斗队列
    showCombatQueue(queue, onComplete) {
        if (!queue || queue.length === 0) {
            if (onComplete) onComplete();
            return;
        }
        this._combatQueue = queue;
        this._combatIndex = 0;
        this._combatOnComplete = onComplete || null;
        this._initCombatModal();
        this._startCombatBattle();
    },

    // 创建/获取战斗弹窗DOM
    _initCombatModal() {
        let modal = document.getElementById('combat-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'combat-modal';
            modal.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.75);z-index:2000;justify-content:center;align-items:center;font-family:inherit;';
            modal.innerHTML = `
                <div style="background:var(--bg-card);border:2px solid var(--border);border-radius:12px;padding:16px;width:92%;max-width:720px;max-height:92vh;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.5);">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                        <h3 id="combat-title" style="margin:0;font-size:1.1rem;">⚔️ 战斗</h3>
                        <button onclick="UI.closeCombatModal()" style="background:none;border:none;color:var(--text);font-size:1.4rem;cursor:pointer;line-height:1;">×</button>
                    </div>
                    <div id="combat-sides" style="display:flex;justify-content:space-between;gap:12px;margin-bottom:10px;flex-shrink:0;">
                        <div id="combat-left" style="flex:1;background:var(--bg);border-radius:8px;padding:10px;text-align:center;"></div>
                        <div style="font-size:1.3rem;font-weight:bold;align-self:center;color:var(--accent);">VS</div>
                        <div id="combat-right" style="flex:1;background:var(--bg);border-radius:8px;padding:10px;text-align:center;"></div>
                    </div>
                    <div id="combat-log" style="flex:1;overflow-y:auto;max-height:260px;background:var(--bg);border-radius:8px;padding:10px;font-size:0.82rem;line-height:1.7;border:1px solid var(--border);"></div>
                    <div style="display:flex;gap:10px;margin-top:12px;justify-content:center;flex-shrink:0;">
                        <button id="combat-auto-btn" class="game-btn" onclick="UI.toggleCombatAuto()">⏸️ 暂停</button>
                        <button id="combat-next-btn" class="game-btn" onclick="UI.combatNextRound()">⏭️ 下一回合</button>
                        <button id="combat-skip-btn" class="game-btn accent" onclick="UI.combatSkipAll()">⏩ 快进</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
    },

    // 开始播放当前战斗
    _startCombatBattle() {
        const battle = this._combatQueue[this._combatIndex];
        if (!battle) {
            this.closeCombatModal();
            return;
        }
        this._combatRound = 0;
        this._combatAuto = true;
        this._combatParsed = this._parseCombatLog(battle.combatLog || []);

        const modal = document.getElementById('combat-modal');
        modal.style.display = 'flex';

        // 更新标题
        const title = document.getElementById('combat-title');
        let heroName = battle.hero ? battle.hero.name : '勇者';
        let monName = battle.monster ? battle.monster.name : '怪物';
        if (battle.leftTeam && battle.leftTeam.length > 1) heroName = (battle.heroName || '勇者') + '小队';
        if (battle.rightTeam && battle.rightTeam.length > 1) monName = '怪物小队';
        title.textContent = `⚔️ ${heroName} vs ${monName}`;

        // 渲染双方信息
        this._renderCombatSides(battle);

        // 清空日志
        const logEl = document.getElementById('combat-log');
        logEl.innerHTML = '';

        // 显示战斗开始
        if (this._combatParsed.preamble.length > 0) {
            for (const line of this._combatParsed.preamble) {
                this._appendCombatLog(line, 'preamble');
            }
        }

        // 重置按钮显示状态
        const autoBtn = document.getElementById('combat-auto-btn');
        const nextBtn = document.getElementById('combat-next-btn');
        const skipBtn = document.getElementById('combat-skip-btn');
        if (autoBtn) { autoBtn.style.display = 'inline-block'; autoBtn.textContent = '⏸️ 暂停'; }
        if (nextBtn) { nextBtn.style.display = 'inline-block'; nextBtn.textContent = '⏭️ 下一回合'; nextBtn.onclick = () => { this.combatNextRound(); }; nextBtn.disabled = false; }
        if (skipBtn) { skipBtn.style.display = 'inline-block'; skipBtn.disabled = false; }

        // 更新按钮状态
        this._updateCombatButtons();

        // 启动自动播放
        this._startCombatTimer();
    },

    // 渲染双方信息面板
    _renderCombatSides(battle) {
        const left = document.getElementById('combat-left');
        const right = document.getElementById('combat-right');
        const parsed = this._combatParsed || {};

        // 左侧：勇者方队伍
        let leftHtml = '';
        const leftTeam = battle.leftTeam || (battle.isSquad && battle.squad ? battle.squad.map((e,i)=>({name:e.name,hp:e.hp,maxHp:e.maxHp,level:e.level,mp:e.mp,maxMp:e.maxMp,isSpy:!!e.cflag[912],entity:e})) : (battle.hero ? [{name:battle.hero.name,hp:battle.hero.hp,maxHp:battle.hero.maxHp,level:battle.hero.level,mp:battle.hero.mp,maxMp:battle.hero.maxMp,isSpy:false,entity:battle.hero}] : []));

        if (leftTeam.length > 1) {
            const squadName = leftTeam[0].entity && leftTeam[0].entity.cstr && leftTeam[0].entity.cstr[1] ? leftTeam[0].entity.cstr[1] : (battle.heroName || '勇者') + '小队';
            leftHtml += `<div style="font-weight:bold;margin-bottom:6px;">👥 ${squadName}</div>`;
        }
        for (let i = 0; i < leftTeam.length; i++) {
            const u = leftTeam[i];
            const isSpy = u.isSpy || (u.entity && u.entity.talent && u.entity.cflag[912]);
            const isLeader = u.entity && u.entity.cflag && u.entity.cflag[901] === 1;
            const leaderLabel = isLeader ? '★' : '';
            const spyLabel = isSpy ? ' <span style="color:var(--danger);font-size:0.65rem;">(伪装)</span>' : '';
            const initHp = u.initialHp !== undefined ? u.initialHp : (parsed.initialHeroHp !== null && i === 0 ? parsed.initialHeroHp : u.hp);
            const initMp = u.initialMp !== undefined ? u.initialMp : u.mp;
            const hpPct = u.maxHp > 0 ? Math.floor(initHp / u.maxHp * 100) : 0;
            const mpPct = u.maxMp > 0 ? Math.floor(initMp / u.maxMp * 100) : 0;
            leftHtml += `<div style="font-size:0.75rem;margin:2px 0;">${leaderLabel}${u.name} Lv.${u.level}${spyLabel}</div>`;
            leftHtml += `<div style="display:flex;justify-content:space-between;font-size:0.7rem;margin-bottom:2px;"><span>HP</span><span id="combat-left-hp-text-${i}">${initHp}/${u.maxHp}</span></div>`;
            leftHtml += `<div style="height:6px;background:var(--hp-bg);border-radius:3px;overflow:hidden;margin-bottom:4px;"><div id="combat-left-hp-bar-${i}" style="height:100%;width:${hpPct}%;background:linear-gradient(90deg,var(--success),#8bc34a);border-radius:3px;transition:width 0.3s;"></div></div>`;
        }
        left.innerHTML = leftHtml || '<div style="color:var(--text-dim);font-size:0.8rem;">无参战单位</div>';

        // 右侧：怪物方队伍
        let rightHtml = '';
        const rightTeam = battle.rightTeam || (battle.monster ? [{name:battle.monster.name,hp:battle.monster.hp,maxHp:battle.monster.maxHp,level:battle.monster.level,mp:battle.monster.mp||0,maxMp:battle.monster.mp||0,isMonster:true,entity:battle.monster}] : []);

        if (rightTeam.length > 1) {
            const first = rightTeam[0];
            const isExHero = first.isExHero || (first.entity && first.entity.talent && first.entity.talent[200]);
            const isHero = first.isHero || (first.entity && first.entity.talent && !first.entity.talent[200]);
            const squadName = first.entity && first.entity.cstr && first.entity.cstr[1] ? first.entity.cstr[1] : null;
            let squadLabel = squadName || '👹 怪物小队';
            if (!squadName) {
                if (isHero) squadLabel = '🗡️ 勇者小队';
                else if (isExHero) squadLabel = '🛡️ 奴隶小队';
            }
            rightHtml += `<div style="font-weight:bold;margin-bottom:6px;">${squadLabel}</div>`;
        }
        for (let i = 0; i < rightTeam.length; i++) {
            const u = rightTeam[i];
            const isExHero = u.isExHero || (u.entity && u.entity.talent && u.entity.talent[200]);
            const isHero = u.isHero || (u.entity && u.entity.talent && !u.entity.talent[200]);
            const isLeader = u.entity && u.entity.cflag && u.entity.cflag[901] === 1;
            const leaderLabel = isLeader ? '★' : '';
            let icon = '👹';
            if (isExHero) icon = '🛡️';
            else if (isHero) icon = '🗡️';
            else if (u.entity && u.entity.icon) icon = u.entity.icon;
            const eliteLabel = u.entity && u.entity.eliteType === 'chief' ? '【首领】' : (u.entity && u.entity.eliteType === 'overlord' ? '【霸主】' : '');
            const initHp = u.initialHp !== undefined ? u.initialHp : (parsed.initialMonHp !== null && i === 0 ? parsed.initialMonHp : u.hp);
            const hpPct = u.maxHp > 0 ? Math.floor(initHp / u.maxHp * 100) : 0;
            rightHtml += `<div style="font-size:0.75rem;margin:2px 0;">${leaderLabel}${icon} ${u.name} Lv.${u.level} <span style="color:var(--text-dim);font-size:0.65rem;">${eliteLabel}</span></div>`;
            rightHtml += `<div style="display:flex;justify-content:space-between;font-size:0.7rem;margin-bottom:2px;"><span>HP</span><span id="combat-right-hp-text-${i}">${initHp}/${u.maxHp}</span></div>`;
            rightHtml += `<div style="height:6px;background:var(--hp-bg);border-radius:3px;overflow:hidden;margin-bottom:4px;"><div id="combat-right-hp-bar-${i}" style="height:100%;width:${hpPct}%;background:linear-gradient(90deg,var(--danger),#ff7043);border-radius:3px;transition:width 0.3s;"></div></div>`;
        }
        right.innerHTML = rightHtml || '<div style="color:var(--text-dim);font-size:0.8rem;">无参战单位</div>';
    },

    _getHeroClassName(hero) {
        const clsId = hero.cflag ? hero.cflag[950] : 0;
        if (!clsId || !HERO_CLASS_DEFS || !HERO_CLASS_DEFS[clsId]) return '';
        return HERO_CLASS_DEFS[clsId].name;
    },

    // 解析 combatLog 为回合数据
    _parseCombatLog(combatLog) {
        const preamble = [];
        const rounds = [];
        const postscript = [];
        let currentRound = 0;
        let initialHeroHp = null;
        let initialMonHp = null;

        for (const log of combatLog) {
            // 提取初始HP
            const initMatch = log.match(/【初始】勇者HP:(\d+)\s+怪物HP:(\d+)/);
            if (initMatch) {
                initialHeroHp = parseInt(initMatch[1]);
                initialMonHp = parseInt(initMatch[2]);
                preamble.push(log);
                continue;
            }
            const squadInitMatch = log.match(/【初始】小队HP:(\d+)\s+怪物HP:(\d+)/);
            if (squadInitMatch) {
                initialMonHp = parseInt(squadInitMatch[2]);
                preamble.push(log);
                continue;
            }

            const match = log.match(/【(\d+)回合】/);
            if (match) {
                const r = parseInt(match[1]);
                if (!rounds[r - 1]) rounds[r - 1] = { round: r, logs: [] };
                rounds[r - 1].logs.push(log);
                currentRound = r;
            } else if (log.startsWith('【胜利】') || log.startsWith('【败北】') || log.startsWith('【撤退】') || log.startsWith('🎁') || log.startsWith('【技能】') || log.startsWith('⚠️')) {
                postscript.push(log);
            } else {
                if (currentRound === 0) {
                    preamble.push(log);
                } else {
                    const idx = currentRound - 1;
                    if (!rounds[idx]) rounds[idx] = { round: currentRound, logs: [] };
                    rounds[idx].logs.push(log);
                }
            }
        }

        // 为每个回合提取HP快照（从回合结束快照行解析所有单位HP）
        const hpSnapshots = [];
        for (let i = 0; i < rounds.length; i++) {
            const snapshot = { left: [], right: [] };
            for (const line of rounds[i].logs) {
                const endMatch = line.match(/【(\d+)回合结束】(.+)/);
                if (endMatch) {
                    const parts = endMatch[2].split('|');
                    const leftPart = parts[0] ? parts[0].replace(/^L:/, '').trim() : '';
                    const rightPart = parts[1] ? parts[1].replace(/^R:/, '').trim() : '';
                    // 解析 name:hp/maxHp
                    const parseUnits = (str) => {
                        const units = [];
                        const regex = /([^:]+):(\d+)\/(\d+)/g;
                        let m;
                        while ((m = regex.exec(str)) !== null) {
                            units.push({ name: m[1].trim(), hp: parseInt(m[2]), maxHp: parseInt(m[3]) });
                        }
                        return units;
                    };
                    snapshot.left = parseUnits(leftPart);
                    snapshot.right = parseUnits(rightPart);
                }
            }
            hpSnapshots[i] = snapshot;
        }

        return { preamble, rounds: rounds.filter(Boolean), postscript, initialHeroHp, initialMonHp, hpSnapshots };
    },

    // 显示指定回合
    _showCombatRound(roundIdx) {
        const parsed = this._combatParsed;
        if (!parsed || roundIdx < 0 || roundIdx >= parsed.rounds.length) {
            // 所有回合已显示，显示结局
            this._showCombatResult();
            return;
        }
        const round = parsed.rounds[roundIdx];
        const logEl = document.getElementById('combat-log');

        // 添加回合分隔
        const sep = document.createElement('div');
        sep.style.cssText = 'margin:6px 0;padding:2px 0;border-top:1px dashed var(--border);color:var(--accent);font-weight:bold;font-size:0.8rem;';
        sep.textContent = `━━ ${round.round}回合 ━━`;
        logEl.appendChild(sep);

        // 添加日志
        for (const line of round.logs) {
            this._appendCombatLog(line, 'round');
        }

        // 自动滚动到底部
        logEl.scrollTop = logEl.scrollHeight;

        this._combatRound = roundIdx + 1;

        // 更新双方HP条（根据本回合结束时的HP快照）
        const snapshot = parsed.hpSnapshots[roundIdx];
        if (snapshot) {
            this._updateCombatHpBars(snapshot);
        }

        // 检查是否还有下一回合
        if (this._combatRound >= parsed.rounds.length) {
            this._showCombatResult();
        }
    },

    // 更新战斗双方HP条（支持多单位）
    _updateCombatHpBars(snapshot) {
        if (!snapshot) return;

        // 更新左侧单位HP（使用回合快照）
        for (let i = 0; i < snapshot.left.length; i++) {
            const u = snapshot.left[i];
            const hpBar = document.getElementById(`combat-left-hp-bar-${i}`);
            const hpText = document.getElementById(`combat-left-hp-text-${i}`);
            if (hpBar && hpText && u.maxHp > 0) {
                const hpPct = Math.floor(u.hp / u.maxHp * 100);
                hpBar.style.width = hpPct + '%';
                hpText.textContent = `${u.hp}/${u.maxHp}`;
            }
        }

        // 更新右侧单位HP（使用回合快照）
        for (let i = 0; i < snapshot.right.length; i++) {
            const u = snapshot.right[i];
            const hpBar = document.getElementById(`combat-right-hp-bar-${i}`);
            const hpText = document.getElementById(`combat-right-hp-text-${i}`);
            if (hpBar && hpText && u.maxHp > 0) {
                const hpPct = Math.floor(u.hp / u.maxHp * 100);
                hpBar.style.width = hpPct + '%';
                hpText.textContent = `${u.hp}/${u.maxHp}`;
            }
        }
    },

    // 显示战斗结果
    _showCombatResult() {
        const parsed = this._combatParsed;
        const logEl = document.getElementById('combat-log');
        if (parsed && parsed.postscript.length > 0) {
            const sep = document.createElement('div');
            sep.style.cssText = 'margin:8px 0;padding:4px 0;border-top:2px solid var(--accent);color:var(--accent);font-weight:bold;font-size:0.85rem;text-align:center;';
            sep.textContent = '━━ 战斗结束 ━━';
            logEl.appendChild(sep);
            for (const line of parsed.postscript) {
                this._appendCombatLog(line, 'result');
            }
            logEl.scrollTop = logEl.scrollHeight;
        }

        // 停止自动播放
        this._stopCombatTimer();
        this._combatAuto = false;

        // 更新按钮：下一回合 → 关闭窗口 / 下一场战斗
        const nextBtn = document.getElementById('combat-next-btn');
        const autoBtn = document.getElementById('combat-auto-btn');
        const skipBtn = document.getElementById('combat-skip-btn');
        if (autoBtn) { autoBtn.style.display = 'none'; }
        if (skipBtn) { skipBtn.style.display = 'none'; }
        if (nextBtn) {
            nextBtn.style.display = 'inline-block';
            nextBtn.disabled = false;
            if (this._combatIndex + 1 < this._combatQueue.length) {
                nextBtn.textContent = '⏭️ 下一场战斗';
                nextBtn.onclick = () => { this._combatIndex++; this._startCombatBattle(); };
            } else {
                nextBtn.textContent = '✖️ 关闭窗口';
                nextBtn.onclick = () => { this.closeCombatModal(); };
            }
        }

        // 3秒后自动进入下一场战斗（如果用户没有点击）
        setTimeout(() => {
            if (this._combatAuto) {
                this._combatIndex++;
                if (this._combatIndex < this._combatQueue.length) {
                    this._startCombatBattle();
                } else {
                    this.closeCombatModal();
                }
            }
        }, 3000);
    },

    _appendCombatLog(text, type) {
        const logEl = document.getElementById('combat-log');
        const div = document.createElement('div');
        div.style.marginBottom = '2px';
        if (type === 'preamble') div.style.color = 'var(--text-dim)';
        else if (type === 'result') div.style.color = 'var(--accent)';
        else if (type === 'round') {
            // 根据内容高亮
            if (text.includes('💢') || text.includes('💥')) div.style.color = 'var(--danger)';
            else if (text.includes('🌿') || text.includes('✨')) div.style.color = 'var(--success)';
            else if (text.includes('🔮') || text.includes('💪')) div.style.color = '#64b5f6';
        }
        div.textContent = text;
        logEl.appendChild(div);
    },

    // 启动自动播放定时器
    _startCombatTimer() {
        this._stopCombatTimer();
        this._combatAuto = true;
        this._updateCombatButtons();
        this._combatTimer = setInterval(() => {
            this._showCombatRound(this._combatRound);
        }, 500);
    },

    _stopCombatTimer() {
        if (this._combatTimer) {
            clearInterval(this._combatTimer);
            this._combatTimer = null;
        }
    },

    // 手动下一回合
    combatNextRound() {
        this._stopCombatTimer();
        this._combatAuto = false;
        this._updateCombatButtons();
        this._showCombatRound(this._combatRound);
    },

    // 快进：显示所有剩余回合
    combatSkipAll() {
        this._stopCombatTimer();
        this._combatAuto = false;
        const parsed = this._combatParsed;
        if (!parsed) return;
        while (this._combatRound < parsed.rounds.length) {
            this._showCombatRound(this._combatRound);
        }
        this._updateCombatButtons();
    },

    // 切换自动/手动
    toggleCombatAuto() {
        if (this._combatAuto) {
            this._stopCombatTimer();
            this._combatAuto = false;
        } else {
            this._combatAuto = true;
            this._startCombatTimer();
        }
        this._updateCombatButtons();
    },

    _updateCombatButtons() {
        const autoBtn = document.getElementById('combat-auto-btn');
        const nextBtn = document.getElementById('combat-next-btn');
        const skipBtn = document.getElementById('combat-skip-btn');
        if (autoBtn) autoBtn.textContent = this._combatAuto ? '⏸️ 暂停' : '▶️ 自动播放';
        // 下一回合和快进按钮始终可用，点击时会自动停止自动播放
        // if (nextBtn) nextBtn.disabled = this._combatAuto;
        // if (skipBtn) skipBtn.disabled = this._combatAuto;
    },

    // 关闭弹窗
    closeCombatModal() {
        this._stopCombatTimer();
        this._combatAuto = false;
        const modal = document.getElementById('combat-modal');
        if (modal) modal.style.display = 'none';
        this._combatQueue = [];
        this._combatIndex = 0;
        this._combatRound = 0;
        this._combatParsed = null;
        if (this._combatOnComplete) {
            const cb = this._combatOnComplete;
            this._combatOnComplete = null;
            cb();
        }
    },
});
