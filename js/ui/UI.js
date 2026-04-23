/**
 * UI Renderer — Emuera-style text interface
 */
const UI = {
    textArea: null,
    buttonArea: null,
    topBar: null,
    _waitCallback: null,

    init() {
        this.textArea = document.getElementById('text-area');
        this.buttonArea = document.getElementById('button-area');
        this.topBar = document.getElementById('top-bar');
        this.dungeonProgress = document.getElementById('dungeon-progress');
        this.heroEventLog = document.getElementById('hero-event-log');

        // Click text area to continue (when waiting)
        this.textArea.addEventListener('click', () => {
            if (this._waitCallback) {
                const cb = this._waitCallback;
                this._waitCallback = null;
                cb();
            }
        });
    },

    // ========== Utils ==========
    clearText() { 
        this.textArea.innerHTML = ''; 
        if (this.textArea) this.textArea.style.display = ''; 
        if (this.dungeonProgress) this.dungeonProgress.style.display = 'none';
        if (this.heroEventLog) this.heroEventLog.style.display = 'none';
    },
    clearButtons() { this.buttonArea.innerHTML = ''; },

    appendText(text, type = "") {
        const div = document.createElement('div');
        div.className = 'line' + (type ? ' line-' + type : '');
        div.textContent = text;
        const trainContainer = document.getElementById('train-text-main');
        if (trainContainer && G && G.state === 'TRAIN') {
            trainContainer.appendChild(div);
            trainContainer.scrollTop = trainContainer.scrollHeight;
        } else {
            this.textArea.appendChild(div);
            this.textArea.scrollTop = this.textArea.scrollHeight;
        }
    },

    appendDivider() {
        const div = document.createElement('div');
        div.className = 'divider';
        const trainContainer = document.getElementById('train-text-main');
        if (trainContainer && G && G.state === 'TRAIN') {
            trainContainer.appendChild(div);
        } else {
            this.textArea.appendChild(div);
        }
    },

    setButtons(html) {
        this.buttonArea.innerHTML = html;
    },

    waitClick(callback) {
        this._waitCallback = callback;
        this.appendText("\n[点击继续...]", "dim");
    },

    showTopBar(show) {
        this.topBar.style.display = show ? 'flex' : 'none';
    },

    updateTopBar(game) {
        const times = ["朝", "昼", "夕", "夜"];
        document.getElementById('day-display').textContent = `第 ${game.day} 天`;
        document.getElementById('time-display').textContent = times[game.time] || "朝";
        document.getElementById('money-display').textContent = `💰 ${game.money}G`;
        const masterRankEl = document.getElementById('master-rank-display');
        if (masterRankEl && game) {
            const rank = game.getMasterRank();
            const rankName = game.getMasterRankName();
            const exp = game.masterExp || 0;
            const nextThreshold = MASTER_RANK_EXP[Math.min(rank + 1, MASTER_RANK_EXP.length - 1)];
            const expToNext = rank >= 5 ? 0 : (nextThreshold - exp);
            const fameLv = game.getMasterFameLevel ? game.getMasterFameLevel() : 0;
            masterRankEl.textContent = `👑 ${rankName} Lv.${game.getMasterEffectiveLevel ? game.getMasterEffectiveLevel() : (game.getMaster()?.level || 1)} (调教师经验${exp}${expToNext > 0 ? ` | 下级还需${expToNext}` : ` | 已满级`})`;
        }
        const fameEl = document.getElementById('fame-display');
        if (fameEl && game) {
            const fame = game.flag[503] || 0;
            const fameLv = game.getMasterFameLevel ? game.getMasterFameLevel() : Math.floor(fame / 100);
            fameEl.textContent = `🏆 地下城声望 ${fame} (+${fameLv}级)`;
        }
    },

    // ========== TITLE ==========
    renderTitle() {
        this.showTopBar(false);
        this.clearText();
        this.textArea.innerHTML = `
            <div class="title-screen">
                <h1>ERA 魔王EX</h1>
                <div class="subtitle">网页重构版</div>
                <div class="version">ver 0.1.0 | 重构版</div>
            </div>
        `;
        this.clearButtons();
        this.buttonArea.innerHTML = `
            <div style="max-width:280px;margin:0 auto;">
                <button class="game-btn title-btn" onclick="G.setState('FIRST')">🎮 新的开始</button>
                <button class="game-btn title-btn" onclick="G.setState('LOAD')">📂 读取存档</button>
            </div>
        `;
    },

    // ========== SHOP ==========
    renderShop(game) {
        this.showTopBar(true);
        this.updateTopBar(game);
        this.hideTrainStatus();
        this.clearText();
        // SHOP状态下主文本区不需要显示内容，所有信息已分布在独立区域
        if (this.textArea) this.textArea.style.display = 'none';
        // 显示主界面独立面板
        if (this.dungeonProgress) this.dungeonProgress.style.display = 'block';
        if (this.heroEventLog) this.heroEventLog.style.display = 'block';

        // 勇者动态消息栏（独立区域）— 包含入侵者状态+事件日志
        if (this.heroEventLog) {
            this.heroEventLog.innerHTML = this._renderHeroStatusHtml(game) + this._renderEventLogHtml(game);
        }

        // 10层地下城进度条（独立区域）
        if (this.dungeonProgress) {
            this.dungeonProgress.innerHTML = this._renderDungeonOverviewHtml(game);
        }

        this.clearButtons();
        let html = '<div class="btn-grid">';

        // 选择目标
        html += `<button class="game-btn accent" onclick="UI.showTargetSelect()">选择调教目标</button>`;
        html += `<button class="game-btn" onclick="UI.showAssiSelect()">选择助手</button>`;
        html += `<button class="game-btn" onclick="G.shopAction('chara_info')">角色信息</button>`;
        html += `<button class="game-btn" onclick="G.shopAction('merged_shop')">🛒 商店</button>`;
        html += `<button class="game-btn accent" onclick="G.shopAction('slave_market')">🏛️ 奴隶市场</button>`;
        html += `<button class="game-btn" onclick="G.shopAction('mystery_upgrade')">🔮 神秘升级</button>`;
        html += `<button class="game-btn accent" onclick="UI.renderSlaveTaskAssignmentList(G)">📋 任务分配</button>`;
        html += `<button class="game-btn" onclick="UI.renderPrison(G)">⛓️ 俘虏管理</button>`;
        html += `<button class="game-btn danger" onclick="G.shopAction('dispose')">⚔️ 奴隶处分</button>`;
        html += `<button class="game-btn" onclick="G.setState('MUSEUM')">🏛️ 收藏馆</button>`;
        if (game._dayPhase === 1) {
            html += `<button class="game-btn primary" onclick="G.eventPhase2()">👁️ 观察勇者行动</button>`;
        } else {
            html += `<button class="game-btn" onclick="G.shopAction('rest')">💤 结束一天</button>`;
        }
        // 存档/读档已移至顶部栏
        html += '</div>';
        this.setButtons(html);
    },

    showTargetSelect() {
        const game = G;
        this.clearText();
        this.appendText(`【选择调教目标】\n`, "accent");
        this.appendDivider();

        const target = game.getTarget();
        const assi = game.getAssi();
        let topInfo = '<div style="margin-bottom:10px;padding:8px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;">';
        topInfo += `<div style="font-size:0.85rem;color:var(--text);"><strong>当前目标:</strong> <span style="color:var(--accent);">${target ? target.name + ' Lv.' + target.level : '无'}</span></div>`;
        topInfo += `<div style="font-size:0.8rem;color:var(--text-dim);margin-top:2px;">当前助手: ${assi ? assi.name : '无'} | 持有角色: ${game.characters.length}人</div>`;
        topInfo += '</div>';

        // 角色列表直接插入 textArea，填补标题和按钮区之间的空白
        let listHtml = '<div style="line-height:normal;">';
        for (let i = 0; i < game.characters.length; i++) {
            const c = game.getChara(i);
            if (i === game.master) continue;
            const isTarget = i === game.target;
            listHtml += `<button class="game-btn ${isTarget?'accent':''}" style="margin-bottom:6px;width:100%;" onclick="G.shopAction('select_target', ${i})">${isTarget?'✓ ':''}${c.name} Lv.${c.level}</button>`;
        }
        listHtml += '</div>';
        this.textArea.innerHTML += listHtml;

        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回</button>` + topInfo);
    },

    showAssiSelect() {
        const game = G;
        this.clearText();
        this.appendText(`【选择助手】\n`, "accent");
        this.appendDivider();

        const target = game.getTarget();
        const assi = game.getAssi();
        let topInfo = '<div style="margin-bottom:10px;padding:8px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;">';
        topInfo += `<div style="font-size:0.85rem;color:var(--text);"><strong>当前助手:</strong> <span style="color:var(--accent);">${assi ? assi.name : '无'}</span></div>`;
        topInfo += `<div style="font-size:0.8rem;color:var(--text-dim);margin-top:2px;">当前目标: ${target ? target.name + ' Lv.' + target.level : '无'} | 持有角色: ${game.characters.length}人</div>`;
        topInfo += '</div>';

        // 角色列表直接插入 textArea，填补标题和按钮区之间的空白
        let listHtml = '<div style="line-height:normal;">';
        for (let i = 0; i < game.characters.length; i++) {
            const c = game.getChara(i);
            if (i === game.master || i === game.target) continue;
            const isAssi = i === game.assi;
            listHtml += `<button class="game-btn ${isAssi?'accent':''}" style="margin-bottom:6px;width:100%;" onclick="G.shopAction('select_assi', ${i})">${isAssi?'✓ ':''}${c.name}</button>`;
        }
        listHtml += `<button class="game-btn" style="margin-bottom:6px;width:100%;" onclick="G.shopAction('select_assi', -1)">❌ 取消助手</button>`;
        listHtml += '</div>';
        this.textArea.innerHTML += listHtml;

        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回</button>` + topInfo);
    },

    // ========== TRAIN ==========
    renderTrain(game) {
        this.showTopBar(true);
        this.updateTopBar(game);
        if (this.dungeonProgress) this.dungeonProgress.style.display = 'none';
        if (this.heroEventLog) this.heroEventLog.style.display = 'none';
        const target = game.getTarget();
        if (!target) return;

        // 确保文本区可见
        if (this.textArea) this.textArea.style.display = '';

        // 添加调教布局样式
        document.getElementById('game-container').classList.add('train-layout');

        // 初始化调教文本区结构（左右分栏）
        if (!this._trainTextInited) {
            this.textArea.innerHTML = `
                <div class="train-text-panel">
                    <div class="train-text-left" id="train-text-main"></div>
                    <div class="train-text-right" id="train-text-result">
                        <div style="font-weight:bold;color:var(--accent);margin-bottom:6px;font-size:0.82rem;">📊 调教结果</div>
                        <div id="train-result-content" style="color:var(--text-dim);">执行指令后显示珠子变化...</div>
                    </div>
                </div>
            `;
            this._trainTextInited = true;
        }

        // 显示当前状态
        this._renderTrainStatus(target, game);

        // 显示指令按钮
        this._renderTrainCommands(game);
    },

    _renderTrainStatus(target, game) {
        const bar = document.getElementById('train-status-bar');
        if (!bar) return;

        const assi = game.getAssi();
        const bystander = game.bystander >= 0 ? game.characters[game.bystander] : null;

        // === Top: Assistant bar (single line) ===
        let assistantBar = '';
        if (assi) {
            const buff = assi.getAssistantBuff ? assi.getAssistantBuff() : null;
            const hearts = '♥'.repeat(Math.min(3, assi.getFallenDepth ? assi.getFallenDepth() : 0));
            assistantBar = `<div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:6px;padding:4px 8px;background:rgba(255,255,255,0.03);border-radius:4px;">助手: <span style="color:var(--accent);">${assi.name}</span> ${hearts ? `[${hearts}]` : ''} ${buff ? `| 效果: ${buff.type}` : ''}</div>`;
        }

        // === Left: Main slave panel ===
        let leftHtml = '';
        const pregTag = target.talent[153] ? ` <span style="color:var(--accent);">🤰${target.cflag[800] || 0}d</span>` : '';
        const persName = target.getPersonalityName ? target.getPersonalityName() : '普通';
        // === NEW (P5): Compound label & route synergy ===
        const compoundLabel = (typeof generateCompoundLabel === 'function') ? generateCompoundLabel(target) : '';
        const synergyLabel = (typeof getSynergyLabel === 'function') ? getSynergyLabel(target) : '';
        let labelTags = '';
        if (compoundLabel) labelTags += ` <span style="color:var(--accent);font-size:0.78rem;">${compoundLabel}</span>`;
        if (synergyLabel) labelTags += ` <span style="color:var(--warning);font-size:0.72rem;">[${synergyLabel}]</span>`;
        leftHtml += `<div class="status-name">${target.name} Lv.${target.level} · ${persName}${pregTag}${labelTags}</div>`;

        // Stamina + Energy bars side by side
        const stmPct = target.maxbase[2] > 0 ? Math.max(0, (target.stamina || target.base[2]) / target.maxbase[2] * 100) : 0;
        const nrgPct = target.maxEnergy > 0 ? Math.max(0, (target.energy || 0) / target.maxEnergy * 100) : 0;
        const nrgState = target.getEnergyState ? target.getEnergyState() : { name: '未知', color: '#888' };
        leftHtml += `<div style="display:flex;gap:10px;margin:4px 0;">`;
        leftHtml += `<div style="flex:1;"><div style="font-size:0.7rem;color:var(--text-dim);margin-bottom:2px;">体力 ${target.stamina || target.base[2]}/${target.maxbase[2]}</div><div style="height:8px;background:var(--hp-bg);border-radius:4px;overflow:hidden;"><div style="height:100%;background:var(--hp-fill);width:${stmPct}%;transition:width 0.3s;"></div></div></div>`;
        leftHtml += `<div style="flex:1;"><div style="font-size:0.7rem;color:var(--text-dim);margin-bottom:2px;">气力 ${target.energy || 0}/${target.maxEnergy} <span style="color:${nrgState.color}">[${nrgState.name}]</span></div><div style="height:8px;background:var(--mp-bg);border-radius:4px;overflow:hidden;"><div style="height:100%;background:var(--mp-fill);width:${nrgPct}%;transition:width 0.3s;"></div></div></div>`;
        leftHtml += `</div>`;

        // Total orgasm gauge
        const totalGauge = target.totalOrgasmGauge || 0;
        const chargeLv = target.chargeLevel || 0;
        const chargeLabel = chargeLv > 0 ? `⚡C${chargeLv}` : '';
        const gaugeColor = totalGauge >= 100 ? 'var(--danger)' : (totalGauge >= 80 ? 'var(--warning)' : 'var(--accent)');
        leftHtml += `<div style="margin:6px 0;"><div style="font-size:0.72rem;color:var(--text-dim);margin-bottom:2px;">绝顶槽 ${totalGauge}% ${chargeLabel}</div><div style="height:14px;background:rgba(255,255,255,0.05);border-radius:7px;overflow:hidden;border:1px solid var(--border);"><div style="height:100%;background:linear-gradient(90deg,${gaugeColor},${gaugeColor}88);width:${Math.min(100,totalGauge)}%;transition:width 0.3s;"></div></div></div>`;

        // Dominant part hint (compact)
        const partCodes = ['C','V','A','B','N','O','W','P'];
        const partNames = ['阴核','阴道','肛门','乳房','乳头','口腔','子宫','阴茎'];
        const partColors = ['#e06c75','#c678dd','#e5c07b','#61afef','#61afef','#98c379','#c678dd','#e06c75'];
        let maxPart = -1, maxVal = -1;
        for (let i = 0; i < 8; i++) {
            const pg = target.partGauge ? (target.partGauge[i] || 0) : 0;
            if (pg > maxVal) { maxVal = pg; maxPart = i; }
        }
        if (maxPart >= 0 && maxVal > 0) {
            const pct = Math.min(100, Math.floor(maxVal / 10));
            leftHtml += `<div style="display:flex;align-items:center;gap:6px;margin:4px 0;font-size:0.68rem;">`;
            leftHtml += `<span style="color:var(--text-dim)">主导:</span>`;
            leftHtml += `<span style="color:${partColors[maxPart]}">${partCodes[maxPart]} ${partNames[maxPart]}</span>`;
            leftHtml += `<span style="color:var(--text-dim)">${pct}%</span>`;
            leftHtml += `</div>`;
        }

        // Collapsible 8-part detail panel
        leftHtml += `<details style="margin:2px 0;">`;
        leftHtml += `<summary style="font-size:0.65rem;padding:2px 8px;cursor:pointer;color:var(--text-dim);list-style:none;background:rgba(255,255,255,0.03);border-radius:4px;">▼ 部位详情</summary>`;
        leftHtml += `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:4px;">`;
        for (let i = 0; i < 8; i++) {
            const pg = target.partGauge ? (target.partGauge[i] || 0) : 0;
            const pct = Math.min(100, Math.floor(pg / 10));
            const flash = pg >= 800 ? 'animation:pulse 1s infinite;' : '';
            const gold = pg >= 500 ? 'border-color:var(--accent);' : '';
            const cd = target.orgasmCooldown ? target.orgasmCooldown[i] : 0;
            leftHtml += `<div style="padding:3px 5px;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:4px;${gold}">`;
            leftHtml += `<div style="display:flex;justify-content:space-between;font-size:0.65rem;"><span style="color:${partColors[i]}">${partCodes[i]}</span><span style="color:var(--text-dim)">${partNames[i]}</span></div>`;
            leftHtml += `<div style="height:4px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden;margin-top:2px;"><div style="height:100%;background:${partColors[i]}44;width:${pct}%;${flash}"></div></div>`;
            if (cd > 0) leftHtml += `<div style="font-size:0.58rem;color:var(--text-dim);text-align:right;">CD:${cd}</div>`;
            leftHtml += `</div>`;
        }
        leftHtml += `</div></details>`;

        // Status tags
        const tags = [];
        if (nrgState.state) tags.push({ text: nrgState.name, color: nrgState.color });
        if (target.isCharging) tags.push({ text: `蓄力C${chargeLv}`, color: '#e5c07b' });
        const pEff = target.getPersonalityEffects ? target.getPersonalityEffects() : { activeModes: [] };
        for (const mode of (pEff.activeModes || [])) tags.push({ text: mode, color: '#98c379' });
        // Marks display (max 3)
        for (let m = 0; m < 8; m++) {
            const lv = target.mark[m] || 0;
            if (lv > 0) tags.push({ text: `${['苦痛','快乐','屈服','反抗','恐怖','淫乱','反发','哀伤'][m]}${lv}`, color: 'var(--text-dim)' });
        }
        if (tags.length > 0) {
            leftHtml += `<div style="display:flex;flex-wrap:wrap;gap:4px;margin:4px 0;">`;
            for (const t of tags.slice(0, 6)) {
                leftHtml += `<span style="font-size:0.68rem;padding:2px 8px;background:rgba(255,255,255,0.04);border:1px solid ${t.color}44;color:${t.color};border-radius:10px;">${t.text}</span>`;
            }
            leftHtml += `</div>`;
        }

        // Hidden trait display
        if (target.personality && target.personality.hidden) {
            const ht = target.personality.hidden;
            const htName = ht.revealed ? (typeof HIDDEN_TRAITS !== 'undefined' && HIDDEN_TRAITS[ht.traitId] ? HIDDEN_TRAITS[ht.traitId].name : '???') : '???';
            const htColor = ht.revealed ? 'var(--accent)' : 'var(--text-dim)';
            leftHtml += `<div style="font-size:0.7rem;color:${htColor};margin-top:4px;">隐藏特质: ${htName} ${ht.revealed ? (ht.full ? '(完全)' : '(部分)') : '(未解锁)'}</div>`;
        }

        // Penis ejaculation gauges (if any)
        if (target.genitalConfig && target.genitalConfig.penises && target.genitalConfig.penises.length > 0) {
            leftHtml += `<div style="display:flex;gap:6px;margin:4px 0;">`;
            for (const penis of target.genitalConfig.penises) {
                const ejPct = Math.min(100, (penis.ejaculationGauge || 0));
                const borderColors = ['#e06c75','#61afef','#98c379'];
                leftHtml += `<div style="flex:1;padding:3px 5px;background:rgba(255,255,255,0.03);border:1px solid ${borderColors[penis.id % 3]}44;border-radius:4px;">`;
                leftHtml += `<div style="font-size:0.68rem;color:${borderColors[penis.id % 3]}">${penis.name} 射精槽</div>`;
                leftHtml += `<div style="height:5px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden;margin-top:2px;"><div style="height:100%;background:${borderColors[penis.id % 3]}66;width:${ejPct}%;"></div></div>`;
                leftHtml += `</div>`;
            }
            leftHtml += `</div>`;
        }

        // Legacy PALAM (compact)
        const palams = [[0,'C快'],[1,'V快'],[2,'A快'],[14,'B快'],[5,'欲情'],[4,'顺从'],[8,'羞耻'],[3,'润滑']];
        leftHtml += `<div style="display:flex;flex-wrap:wrap;gap:6px;margin:4px 0;font-size:0.7rem;">`;
        for (const [id, name] of palams) {
            const val = target.palam[id] || 0;
            if (val > 0) leftHtml += `<span style="color:var(--text-dim)">${name}:${val}</span>`;
        }
        leftHtml += `</div>`;

        // === Right: Avatar + buttons ===
        let rightHtml = '';
        rightHtml += `<div class="train-avatar">👤</div>`;
        rightHtml += `<button class="game-btn danger" style="font-size:0.7rem;padding:3px 8px;width:90px;" onclick="G.endTrain()">⏹ 结束调教</button>`;
        rightHtml += `<button class="game-btn" style="font-size:0.7rem;padding:3px 8px;width:90px;" onclick="UI.showTrainHistory()">📜 历史</button>`;
        rightHtml += `<button class="game-btn" style="font-size:0.7rem;padding:3px 8px;width:90px;" onclick="UI.showTrainTargetInfo(0)">📋 信息</button>`;
        if (assi) {
            rightHtml += `<button class="game-btn" style="font-size:0.7rem;padding:3px 8px;width:90px;" onclick="G.switchTrainTarget()">🔄 切${assi.name}</button>`;
        } else {
            rightHtml += `<button class="game-btn" style="font-size:0.7rem;padding:3px 8px;width:90px;opacity:0.4;" disabled>🔄 无助手</button>`;
        }

        // === Bystander panel (if present) ===
        let bystanderHtml = '';
        if (bystander) {
            const bStm = bystander.stamina || bystander.base[2] || 0;
            const bMaxStm = bystander.maxbase[2] || 1;
            const bNrg = bystander.energy || 0;
            const bMaxNrg = bystander.maxEnergy || 1;
            const bGauge = bystander.totalOrgasmGauge || 0;
            const bDom = bystander.getDominantPart ? bystander.getDominantPart() : { code: '-' };
            bystanderHtml = `<div style="margin-top:8px;padding:6px 8px;background:rgba(255,255,255,0.02);border:1px dashed var(--border);border-radius:6px;">`;
            bystanderHtml += `<div style="font-size:0.78rem;color:var(--accent-dim);margin-bottom:3px;">👁️ 旁观者: ${bystander.name} <span style="font-size:0.65rem;color:var(--text-dim)">(${bDom.code}主导 ${bGauge}%)</span></div>`;
            bystanderHtml += `<div style="display:flex;gap:8px;">`;
            bystanderHtml += `<div style="flex:1;"><div style="height:6px;background:var(--hp-bg);border-radius:3px;"><div style="height:100%;background:var(--hp-fill);width:${Math.max(0,bStm/bMaxStm*100)}%;"></div></div></div>`;
            bystanderHtml += `<div style="flex:1;"><div style="height:6px;background:var(--mp-bg);border-radius:3px;"><div style="height:100%;background:var(--mp-fill);width:${Math.max(0,bNrg/bMaxNrg*100)}%;"></div></div></div>`;
            bystanderHtml += `</div></div>`;
        }

        bar.innerHTML = `<div style="font-size:0.7rem;color:var(--text-dim);margin-bottom:4px;">第 ${game.trainCount + 1} 回</div>${assistantBar}<div class="train-info-panel"><div class="train-info-left">${leftHtml}${bystanderHtml}</div><div class="train-info-right">${rightHtml}</div></div>`;
        bar.style.display = 'block';
    },

    _saveTrainHistory(count, commandName) {
        const main = document.getElementById('train-text-main');
        const result = document.getElementById('train-result-content');
        if (!main || !result) return;
        if (!this._trainHistory) this._trainHistory = [];
        this._trainHistory.push({
            count: count,
            command: commandName,
            mainHtml: main.innerHTML,
            resultHtml: result.innerHTML
        });
    },

    _clearTrainCurrent() {
        const main = document.getElementById('train-text-main');
        const result = document.getElementById('train-result-content');
        if (main) main.innerHTML = '';
        if (result) result.innerHTML = '<span style="color:var(--text-dim);">执行指令后显示珠子变化...</span>';
    },

    showTrainHistory() {
        if (!this._trainHistory || this._trainHistory.length === 0) {
            this.showToast("暂无调教历史", "info");
            return;
        }
        let html = '<div style="max-height:60vh;overflow-y:auto;padding-right:4px;">';
        for (const h of this._trainHistory) {
            html += `<div style="margin-bottom:12px;padding:10px;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;">`;
            html += `<div style="font-weight:bold;color:var(--accent);margin-bottom:6px;font-size:0.85rem;">第${h.count}回 · ${h.command}</div>`;
            html += `<div style="font-size:0.8rem;color:var(--text);margin-bottom:4px;">${h.mainHtml}</div>`;
            if (h.resultHtml && !h.resultHtml.includes('执行指令后显示珠子变化')) {
                html += `<div style="font-size:0.75rem;color:var(--info);border-top:1px solid var(--border);padding-top:4px;margin-top:4px;">${h.resultHtml}</div>`;
            }
            html += `</div>`;
        }
        html += '</div>';
        this.showModal("调教历史", html + `<div style="text-align:center;margin-top:10px;"><button class="game-btn" onclick="UI.closeModal()">关闭</button></div>`);
    },

    showReleasePreview() {
        const game = G;
        const target = game.getTarget();
        if (!target) return;
        if (!target.isCharging || target.chargeLevel <= 0) {
            this.showToast(`${target.name} 没有在蓄力`, "warning");
            return;
        }

        // Calculate preview
        const chargeLv = target.chargeLevel || 0;
        const chargeInfo = (typeof CHARGE_LEVELS !== 'undefined') ? CHARGE_LEVELS[chargeLv] : null;
        const releaseMult = 1.0 + chargeLv * 0.5;

        // Simulate part gains on release
        const simulatedGauge = [...(target.partGauge || new Array(8).fill(0))];
        for (let i = 0; i < 8; i++) {
            simulatedGauge[i] = Math.floor(simulatedGauge[i] * releaseMult);
        }

        // Check what orgasm would trigger
        const activeParts = [];
        for (let i = 0; i < 8; i++) if (simulatedGauge[i] >= 800) activeParts.push(i);
        let comboName = '单部位绝顶';
        let comboMult = 1.0;
        if (activeParts.length >= 5 && typeof COMBO_ORGASMS !== 'undefined') {
            comboName = COMBO_ORGASMS['ULTIMATE']?.name || '极乐觉醒';
            comboMult = COMBO_ORGASMS['ULTIMATE']?.multiplier || 4.0;
        } else if (activeParts.length >= 4 && typeof COMBO_ORGASMS !== 'undefined') {
            comboName = COMBO_ORGASMS['FULL']?.name || '全身共鸣';
            comboMult = COMBO_ORGASMS['FULL']?.multiplier || 2.8;
        } else if (activeParts.length >= 2 && typeof COMBO_ORGASMS !== 'undefined') {
            const codes = activeParts.sort((a,b)=>a-b).map(i => (typeof ORGASM_PARTS !== 'undefined' ? ORGASM_PARTS[i].code : '?'));
            const key = codes.join('+');
            const combo = COMBO_ORGASMS[key];
            if (combo) { comboName = combo.name; comboMult = combo.multiplier; }
            else if (codes.length >= 2) {
                const fb = codes[0] + '+' + codes[1];
                for (const k in COMBO_ORGASMS) {
                    if (k.includes(codes[0]) && k.includes(codes[1]) && COMBO_ORGASMS[k].parts.length === 2) {
                        comboName = COMBO_ORGASMS[k].name; comboMult = COMBO_ORGASMS[k].multiplier; break;
                    }
                }
            }
        }

        const partNames = ['阴核','阴道','肛门','乳房','乳头','口腔','子宫','阴茎'];
        const activeNames = activeParts.map(i => partNames[i]).join(' + ');

        let html = '<div style="padding:8px;">';
        html += `<div style="font-size:1rem;font-weight:bold;color:var(--accent);margin-bottom:8px;">释放许可预览</div>`;
        html += `<div style="font-size:0.85rem;color:var(--text);margin-bottom:6px;">${target.name} 当前蓄力等级: C${chargeLv}</div>`;
        html += `<div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:10px;">释放倍率: x${releaseMult.toFixed(1)} ${chargeInfo ? `| 蓄力倍率: x${chargeInfo.multiplier}` : ''}</div>`;

        if (activeParts.length > 0) {
            html += `<div style="background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:6px;padding:8px;margin-bottom:10px;">`;
            html += `<div style="font-size:0.8rem;color:var(--warning);margin-bottom:4px;">预计触发: ${comboName}</div>`;
            html += `<div style="font-size:0.75rem;color:var(--text-dim);">活跃部位: ${activeNames || '-'}</div>`;
            html += `<div style="font-size:0.75rem;color:var(--text-dim);">组合倍率: x${comboMult.toFixed(1)}</div>`;
            html += `</div>`;
        } else {
            html += `<div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:10px;">释放后可能没有部位达到绝顶阈值...</div>`;
        }

        // Personality reaction preview
        const pEff = target.getPersonalityEffects ? target.getPersonalityEffects() : null;
        if (pEff && pEff.activeModes && pEff.activeModes.length > 0) {
            html += `<div style="font-size:0.75rem;color:var(--success);margin-bottom:10px;">性格修正: ${pEff.activeModes.join(' / ')}</div>`;
        }

        html += `<div style="display:flex;gap:10px;justify-content:center;margin-top:12px;">`;
        html += `<button class="game-btn accent" onclick="UI.closeModal();G._executeMasterSkill(990);G.trainCount++;UI.renderTrain(G);">确认释放</button>`;
        html += `<button class="game-btn" onclick="UI.closeModal();">取消</button>`;
        html += `</div>`;
        html += `</div>`;

        this.showModal('释放许可', html);
    },

    showTrainTargetInfo(page = 0) {
        const game = G;
        const c = game.getTarget();
        if (!c) return;
        const job = this._getJobName(c);
        const personality = c.getPersonalityName ? c.getPersonalityName() : '未知';
        const pages = ['基本信息', '能力经验', '素质背景', '装备道具'];

        let content = '';
        switch (page) {
            case 0: content = this._renderCharaPageBasic(c, job, personality, 'chara'); break;
            case 1: content = this._renderCharaPageStats(c, 'chara'); break;
            case 2: content = this._renderCharaPageTraits(c, 'chara'); break;
            case 3: content = this._renderCharaPageGear(c, 'chara'); break;
        }

        // 迷你姓名头部（所有页面共用）
        const miniHeader = `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--bg-card);border-radius:6px;margin-bottom:10px;border:1px solid var(--border);flex-wrap:wrap;">
            <div style="font-size:1.05rem;font-weight:bold;color:var(--text);">${c.name}</div>
            <div style="font-size:0.8rem;color:var(--text-dim);">Lv.${c.level} · ${job} · ${personality}</div>
        </div>`;

        let html = `<div style="max-height:65vh;overflow-y:auto;padding-right:4px;">${miniHeader}${content}</div>`;
        html += `<div style="display:flex;gap:8px;justify-content:center;margin-top:12px;flex-wrap:wrap;">`;
        html += `<button class="game-btn chara-page-arrow" ${page <= 0 ? 'disabled' : ''} onclick="UI.closeModal();UI.showTrainTargetInfo(${page - 1})">◀</button>`;
        for (let i = 0; i < pages.length; i++) {
            const cls = i === page ? 'accent' : '';
            html += `<button class="game-btn ${cls}" style="font-size:0.75rem;padding:4px 10px;" onclick="UI.closeModal();UI.showTrainTargetInfo(${i})">${pages[i]}</button>`;
        }
        html += `<button class="game-btn chara-page-arrow" ${page >= pages.length - 1 ? 'disabled' : ''} onclick="UI.closeModal();UI.showTrainTargetInfo(${page + 1})">▶</button>`;
        html += `</div>`;
        html += `<div style="text-align:center;margin-top:8px;"><button class="game-btn danger" style="font-size:0.8rem;padding:4px 16px;" onclick="UI.closeModal()">关闭</button></div>`;

        this.showModal(`${c.name} 的角色信息`, html);
    },

    hideTrainStatus() {
        const bar = document.getElementById('train-status-bar');
        if (bar) bar.style.display = 'none';
    },

    _renderTrainCommands(game) {
        const GROUP_LABELS = { caress:"爱抚", tool:"器具", vaginal:"阴道", anal:"肛门", service:"侍奉", sm:"SM", rough:"过激", monster:"触手", assistant:"助手", arena:"斗技场", special:"特殊" };
        const GROUP_ORDER = ["caress", "tool", "vaginal", "anal", "service", "sm", "rough", "monster", "assistant", "arena", "special"];
        const category = this._trainCategory || GROUP_ORDER[0];

        // 收集所有可用指令并按分类分组
        const cmdByGroup = {};
        const allCmds = [];
        for (let comId in TRAIN_DEFS) {
            const def = TRAIN_DEFS[comId];
            if (game.isGroupFiltered(def.group)) continue;
            if (this._shouldHideCommand(game, parseInt(comId))) continue;
            const available = this._checkComAble(game, parseInt(comId));
            const cmd = { id: comId, name: def.name, group: def.group, available };
            if (!cmdByGroup[def.group]) cmdByGroup[def.group] = [];
            cmdByGroup[def.group].push(cmd);
            allCmds.push(cmd);
        }

        // 左侧分类列表
        let catHtml = '';
        for (const g of GROUP_ORDER) {
            if (!cmdByGroup[g] || cmdByGroup[g].length === 0) continue;
            const isActive = category === g;
            catHtml += `<button class="game-btn ${isActive ? 'accent' : ''}" style="font-size:0.72rem;padding:4px 6px;text-align:left;" onclick="UI._trainCategory = '${g}'; UI._renderTrainCommands(G);">${isActive ? '▸ ' : ''}${GROUP_LABELS[g] || g} (${cmdByGroup[g].length})</button>`;
        }
        catHtml += `<button class="game-btn ${category === 'all' ? 'accent' : ''}" style="font-size:0.72rem;padding:4px 6px;text-align:left;margin-top:4px;border-top:1px solid var(--border);padding-top:6px;" onclick="UI._trainCategory = 'all'; UI._renderTrainCommands(G);">${category === 'all' ? '▸ ' : ''}显示全部 (${allCmds.length})</button>`;

        // 右侧指令列表
        const displayCmds = category === 'all' ? allCmds : (cmdByGroup[category] || []);
        let cmdHtml = '<div class="btn-grid btn-grid-4">';
        for (const cmd of displayCmds) {
            cmdHtml += `<button class="game-btn" ${cmd.available ? '' : 'disabled'} onclick="G.selectCommand(${cmd.id})" title="${cmd.name}">${cmd.name}</button>`;
        }
        cmdHtml += '</div>';

        // Turn preview (compact)
        const target = game.getTarget();
        let previewHtml = '';
        if (target && game.selectcom >= 0) {
            const meta = (typeof getTrainMeta === 'function') ? getTrainMeta(game.selectcom) : null;
            const stmCost = meta ? (meta.staminaCost?.target || 0) : 0;
            const nrgCost = meta ? (meta.energyCost?.target || 0) : 0;
            if (stmCost > 0 || nrgCost > 0) {
                previewHtml = `<div style="font-size:0.6rem;color:var(--text-dim);margin-bottom:3px;text-align:right;">上回合: 体-${stmCost} 气-${nrgCost}</div>`;
            }
        }

        const html = `<div class="train-command-panel"><div class="train-categories">${catHtml}</div><div class="train-commands">${previewHtml}${cmdHtml}</div></div>`;
        this.setButtons(html);
    },

    _shouldHideCommand(game, comIdInt) {
        const target = game.getTarget();
        if (!target) return true;

        // ========== 1. 解锁条件检查 ==========
        const unlock = TRAIN_UNLOCK[comIdInt];
        if (unlock) {
            // 调教师等级检查
            if (unlock.rank !== undefined) {
                const masterRank = game.getMasterRank();
                if (masterRank < unlock.rank) return true;
            }
            // 魔王能力检查
            if (unlock.masterAbl) {
                const master = game.getMaster();
                for (const ablId in unlock.masterAbl) {
                    const need = unlock.masterAbl[ablId];
                    const has = master ? (master.abl[ablId] || 0) : 0;
                    if (has < need) return true;
                }
            }
            // 道具持有检查
            if (unlock.items) {
                for (const itemId of unlock.items) {
                    if ((game.item[itemId] || 0) <= 0) return true;
                }
            }
            // 目标能力检查
            if (unlock.targetAbl) {
                for (const ablId in unlock.targetAbl) {
                    const need = unlock.targetAbl[ablId];
                    const has = target.abl[ablId] || 0;
                    if (has < need) return true;
                }
            }
            // 目标经验检查
            if (unlock.targetExp) {
                for (const expId in unlock.targetExp) {
                    const need = unlock.targetExp[expId];
                    const has = target.exp[expId] || 0;
                    if (has < need) return true;
                }
            }
            // 目标素质要求
            if (unlock.targetTalent) {
                for (const tid of unlock.targetTalent) {
                    if (!target.hasTalent(tid)) return true;
                }
            }
            // 目标禁止素质
            if (unlock.forbiddenTalent) {
                for (const tid of unlock.forbiddenTalent) {
                    if (target.hasTalent(tid)) return true;
                }
            }
        }

        // ========== 2. 道具/状态条件检查 ==========
        // 消耗型道具: 没有物品时隐藏
        const itemMap = { 50: 20, 51: 21, 52: 22 };
        if (itemMap[comIdInt] !== undefined && (game.item[itemMap[comIdInt]] || 0) <= 0) {
            return true;
        }

        // 触手召唤: 没有触手召唤契约书时隐藏 (已在unlock中检查，这里是fallback)
        if (comIdInt === 100 && (game.item[90] || 0) <= 0) {
            return true;
        }

        // 放尿: 没有利尿剂状态时隐藏
        if (comIdInt === 85 && !target.tequip[22]) {
            return true;
        }

        // 肛门珠(18): 已装备时隐藏（显示拉出）
        if (comIdInt === 18 && target.tequip[19]) {
            return true;
        }

        // 肛门珠拉出(19): 没有珠子装备时隐藏
        if (comIdInt === 19 && !target.tequip[19]) {
            return true;
        }

        // 撕破衣服: 没有穿衣时隐藏
        if (comIdInt === 111 && !target.tequip[110]) {
            return true;
        }

        return false;
    },

    _checkComAble(game, comId) {
        const target = game.getTarget();
        if (!target) return false;

        const def = TRAIN_DEFS[comId];
        if (!def) return false;

        const comIdInt = parseInt(comId);

        // HP check
        if (target.hp <= 0) return false;

        // Faint check
        if (target.base[20] > 0) return false;

        // Broken mind
        if (target.hasTalent(9)) return false;

        // 体力过低时限制剧烈动作 (HP < 20%)
        const hpRatio = target.hp / target.maxHp;
        const intenseCommands = [20,21,22,23,24,25,26,27,28,29,34,36,64,65,80,81,82,83,84,100,120,121,128,129,130,131,132,133,134];
        if (hpRatio < 0.2 && intenseCommands.includes(comIdInt)) return false;

        // 反抗刻印Lv3时部分指令不可用
        if (target.mark[3] >= 3 && [6, 56, 58, 59].includes(comIdInt)) return false;

        // Ball gag blocks oral service
        if (target.tequip[12] && [4, 31, 32, 33, 34, 35, 36, 37, 38, 61, 63, 66, 68, 69, 123, 125, 126].includes(comIdInt)) {
            return false;
        }

        // Blindfold blocks visual commands
        if (target.tequip[10] && [7, 53, 54, 57].includes(comIdInt)) {
            return false;
        }

        // Assistant commands require assistant
        if (def.category === "assistant" && game.assi < 0) {
            return false;
        }

        // Bondage suit restricts movement
        if (target.tequip[47] && [22,23,24,25,28,29,34,35,36,120,121,128,129,130,131,132,133,134].includes(comIdInt)) {
            return false;
        }

        // 绳索限制部分动作
        if (target.tequip[11] && [3,7,22,23,24,25,28,29,34,35,36,120,121,128,129,130,131,132,133,134].includes(comIdInt)) {
            return false;
        }

        return true;
    },

    // ========== AFTERTRAIN ==========
    renderAfterTrain(game) {
        this.hideTrainStatus();
        this.clearText();
        const target = game.getTarget();
        this.appendText(`\n【调教结束】\n`, "accent");
        if (target) {
            this.appendText(`${target.name}的调教结束了。`);
            // 显示本次获得的珠子 (只显示PALAM相关的juel)
            const keyJuel = [0, 1, 2, 5, 6, 7, 8, 9, 10, 11, 14, 15];
            let juelLine = "";
            for (const j of keyJuel) {
                if (target.juel[j] > 0) {
                    juelLine += `${PALAM_DEFS[j]?.name || '珠'+j}珠:${target.juel[j]} `;
                }
            }
            if (juelLine) {
                this.appendText(`获得珠: ${juelLine}`, "info");
            } else {
                this.appendText(`获得珠: (本次没有获得珠子)`, "dim");
            }
        }
        this.clearButtons();
        this.setButtons(`
            <div class="btn-grid">
                <button class="game-btn accent" onclick="G.setState('ABLUP')">能力升级</button>
                <button class="game-btn" onclick="G.setState('TURNEND')">跳过升级</button>
            </div>
        `);
    },

    // ========== ABLUP ==========
    renderAblUp(game) {
        this.hideTrainStatus();
        this.clearText();
        this.appendText(`【能力升级】\n`, "accent");
        const target = game.getTarget();
        if (!target) {
            this.appendText("没有目标");
            this.waitClick(() => G.setState("TURNEND"));
            return;
        }

        this.clearButtons();

        // Build resource bar directly into button HTML (appendText uses textContent, not innerHTML)
        const routeNames = ['\u987a\u4ece','\u6b32\u671b','\u75db\u82e6','\u9732\u51fa','\u652f\u914d'];
        const routeColors = ['#61afef','#e06c75','#c678dd','#e5c07b','#98c379'];
        const thresholds = [0, 100, 300, 600, 1000, 1500];
        let routeLine = '';
        for (let r = 0; r < 5; r++) {
            const lv = target.routeLevel ? (target.routeLevel[r] || 0) : 0;
            const exp = target.routeExp ? (target.routeExp[r] || 0) : 0;
            const next = thresholds[Math.min(5, lv + 1)];
            routeLine += `<span style="color:${routeColors[r]};font-weight:bold;">${routeNames[r]}Lv${lv}</span><span style="color:var(--text-dim);font-size:0.68rem;">(${exp}/${next})</span>  `;
        }

        const keyJuel = [0,1,2,3,4,5,6,7,8,9,10,14,15];
        let juelLine = "";
        for (const j of keyJuel) {
            if (target.juel[j] > 0) {
                juelLine += `${PALAM_DEFS[j]?.name || '珠'+j}:${target.juel[j]}  `;
            }
        }

        let html = '<div class="btn-grid btn-grid-3">';
        html += `<div style="grid-column:1/-1;font-size:0.75rem;margin-bottom:6px;padding:6px 8px;background:rgba(255,255,255,0.03);border-radius:6px;">`;
        html += `<div style="margin-bottom:4px;line-height:1.6;">${target.name} 路线: ${routeLine}</div>`;
        html += `<div style="color:var(--text-dim);">珠子: ${juelLine || '(暂无)'}</div>`;
        html += `</div>`;

        // === Route Talents (unlockable first) ===
        const lockedTalents = [];
        if (typeof TALENT_TREE !== 'undefined' && typeof TALENT_ROUTES !== 'undefined') {
            let talentHtml = '';
            let hasUnlockable = false;
            for (const tid in TALENT_TREE) {
                const node = TALENT_TREE[tid];
                const hasTalent = target.talent[node.id] > 0;
                if (hasTalent) continue;
                const check = (typeof checkTalentTreeUnlock === 'function') ? checkTalentTreeUnlock(target, node) : { unlock: false };
                const routeInfo = TALENT_ROUTES[node.route];
                const juelType = routeInfo ? routeInfo.juelType : 0;
                const juelName = PALAM_DEFS[juelType]?.name || '\u73e0';
                const cost = (node.req && node.req.juel) ? `需:${juelName}\u00d7${node.req.juel}` : '';
                if (check.unlock) {
                    hasUnlockable = true;
                    talentHtml += `<button class="game-btn accent" onclick="if(G.doRouteTalentUp(${node.id})) UI.renderAblUp(G)" title="${node.desc || ''}">`;
                    talentHtml += `<div style="font-size:0.78rem;font-weight:bold;">${node.name}</div>`;
                    talentHtml += `<div style="font-size:0.65rem;color:var(--text-dim);">${routeInfo ? routeInfo.name : ''} ${cost}</div>`;
                    talentHtml += `<div style="font-size:0.6rem;color:var(--success);margin-top:2px;line-height:1.3;">${node.desc || ''}</div>`;
                    talentHtml += `</button>`;
                } else {
                    lockedTalents.push({ node, check, routeInfo, cost });
                }
            }
            if (hasUnlockable) {
                html += `<div style="grid-column:1/-1;font-weight:bold;margin-top:4px;color:var(--accent);">\u3010\u8def\u7ebf\u5929\u8d4b - \u53ef\u89e3\u9501\u3011</div>`;
                html += talentHtml;
            }
        }

        // === ABL Upgrades (can-upgrade first) ===
        const categories = {
            sensation: "\u3010\u611f\u89c9\u3011",
            mental: "\u3010\u7cbe\u795e/\u6280\u672f\u3011",
            fetish: "\u3010\u6027\u7656\u3011",
            addiction: "\u3010\u4e2d\u6bd2\u3011",
            otherworld: "\u3010\u5176\u4ed6\u3011"
        };

        for (const cat in categories) {
            let catHtml = "";
            for (let i = 0; i < 105; i++) {
                const def = ABL_DEFS[i];
                if (!def || def.category !== cat) continue;
                const lv = target.abl[i] || 0;
                const info = target.getAblUpStatus(i);
                if (!info) continue;

                if (info.can) {
                    catHtml += `<button class="game-btn accent" onclick="if(G.doAblUp(${i})) UI.renderAblUp(G)" title="\u9700${PALAM_DEFS[info.juelType]?.name||''}\u00d7${info.need}">`;
                    catHtml += `<div style="font-size:0.78rem;">${def.name} ${lv}\u2192${info.next}</div>`;
                    catHtml += `<div style="font-size:0.65rem;color:var(--text-dim);">\u9700:${PALAM_DEFS[info.juelType]?.name||''}\u00d7${info.need}</div>`;
                    catHtml += `</button>`;
                } else if (lv > 0 || info.hasJuel) {
                    let reason = "";
                    if (!info.expOk) reason += `${EXP_DEFS[Object.keys(ABLUP_CONDITIONS[i].expCond||{})[0]]?.name||'\u7ecf\u9a8c'}\u4e0d\u8db3 `;
                    else if (!info.markOk) reason += `\u523b\u5370\u4e0d\u8db3 `;
                    else if (!info.hasJuel) reason += `\u73e0\u4e0d\u8db3`;
                    catHtml += `<button class="game-btn" disabled title="${reason}">${def.name} Lv.${lv}</button>`;
                }
            }
            if (catHtml) {
                html += `<div style="grid-column:1/-1;font-weight:bold;margin-top:8px;color:var(--accent);">${categories[cat]}</div>`;
                html += catHtml;
            }
        }

        // === Locked route talents (collapsible) ===
        if (lockedTalents.length > 0) {
            html += `<details style="grid-column:1/-1;margin-top:8px;">`;
            html += `<summary style="font-size:0.72rem;color:var(--text-dim);cursor:pointer;list-style:none;padding:4px 8px;background:rgba(255,255,255,0.03);border-radius:4px;">\u25bc \u672a\u89e3\u9501\u5929\u8d4b (${lockedTalents.length})</summary>`;
            html += `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:6px;">`;
            for (const { node, check, routeInfo, cost } of lockedTalents) {
                html += `<button class="game-btn" disabled title="${check.reasons ? check.reasons.join('\uff0c') : ''}">`;
                html += `<div style="font-size:0.72rem;">${node.name}</div>`;
                html += `<div style="font-size:0.6rem;color:var(--text-dim);">${routeInfo ? routeInfo.name : ''} ${cost}</div>`;
                html += `<div style="font-size:0.58rem;color:var(--danger);margin-top:1px;">${check.reasons ? check.reasons.join('\uff0c') : ''}</div>`;
                html += `</button>`;
            }
            html += `</div></details>`;
        }

        html += `<button class="game-btn back-btn" onclick="G.finishAblUp()" style="grid-column:1/-1;margin-top:8px;">\u7ed3\u675f\u5347\u7ea7</button>`;
        html += '</div>';
        this.setButtons(html);
    },

    // ========== TURNEND ==========
    renderTurnEnd(game) {
        this.hideTrainStatus();
        this.clearText();
        const endedDay = game.day - 1; // day已在DayEndSystem中推进，显示时要减1
        this.appendText(`【第 ${endedDay} 天结束】\n`, "accent");
        this.appendText(`所有角色的体力恢复了。`);
        this.appendText(`新的一天开始了...`);
        this.clearButtons();
        this.setButtons(`<div class="btn-grid"><button class="game-btn accent" onclick="G.setState('SHOP')">进入第 ${game.day} 天</button></div>`);
    },

    // ========== 角色列表 ==========
    renderCharaList(game) {
        this.hideTrainStatus();
        this.clearText();
        this.appendText(`【角色与勇者一览】\n`, "accent");
        this.clearButtons();
        let listHtml = '<div style="line-height:normal;">';

        // 持有角色（魔王始终第一，其余按等级降序）
        const charaList = [];
        for (let i = 0; i < game.characters.length; i++) {
            charaList.push({ index: i, chara: game.getChara(i) });
        }
        charaList.sort((a, b) => {
            if (a.index === game.master) return -1;
            if (b.index === game.master) return 1;
            return b.chara.level - a.chara.level;
        });

        listHtml += `<div style="font-weight:bold;font-size:0.85rem;margin:8px 0 4px;color:var(--accent);">👤 持有角色</div>`;
        for (const item of charaList) {
            const c = item.chara;
            const isMaster = item.index === game.master;
            const isExHero = c.talent[200];
            const exploring = isExHero && c.cflag[700];
            const name = isMaster ? `👑${c.name}` : (isExHero ? `🛡️${c.name}` : c.name);
            const borderColor = isMaster ? '#d4af37' : (isExHero ? '#8b5cf6' : 'var(--accent)');
            let extra = `<span style="color:var(--text-dim);font-size:0.75rem;">Lv.${c.level}</span>`;
            if (exploring) {
                const floor = c.cflag[701] || 10;
                const progress = c.cflag[702] || 0;
                extra += ` <span style="color:var(--success);font-size:0.7rem;">探索第${floor}层 ${progress}%</span>`;
            } else if (isExHero) {
                extra += ` <span style="color:var(--info);font-size:0.7rem;">前勇者</span>`;
            }
            listHtml += `<button class="game-btn" style="margin-bottom:6px;width:100%;border-left:3px solid ${borderColor};text-align:left;" onclick="UI.renderCharaDetail(G, ${item.index}, 0, 'chara')">${name} ${extra}</button>`;
        }

        // 入侵勇者（按等级降序）
        if (game.invaders.length > 0) {
            const heroList = game.invaders.map((h, i) => ({ index: i, chara: h }));
            heroList.sort((a, b) => b.chara.level - a.chara.level);

            listHtml += `<div style="font-weight:bold;font-size:0.85rem;margin:12px 0 4px;color:var(--danger);">🗡️ 入侵勇者</div>`;
            for (const item of heroList) {
                const c = item.chara;
                const floor = game.getHeroFloor(c);
                const progress = game.getHeroProgress(c);
                listHtml += `<button class="game-btn" style="margin-bottom:6px;width:100%;border-left:3px solid var(--danger);text-align:left;opacity:0.92;" onclick="UI.renderCharaDetail(G, ${item.index}, 0, 'hero')">🗡️ ${c.name} <span style="color:var(--text-dim);font-size:0.75rem;">Lv.${c.level}</span> <span style="color:var(--danger);font-size:0.7rem;">第${floor}层 ${progress}%</span></button>`;
            }
        }

        listHtml += '</div>';
        this.textArea.innerHTML += listHtml;
        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回</button>`);
    },

    renderCharaDetail(game, index, page = 0, type = 'chara') {
        const c = type === 'hero' ? game.invaders[index] : game.getChara(index);
        if (!c) return;
        this._charaDetailIndex = index;
        this._charaDetailPage = page;
        this._charaDetailType = type;

        const job = this._getJobName(c) || (type === 'hero' ? '勇者' : '无职业');
        const personality = c.getPersonalityName ? c.getPersonalityName() : '未知';
        const pages = ['基本信息', '能力经验', '素质背景', '装备道具', '相性关系'];

        let content = '';
        switch (page) {
            case 0: content = this._renderCharaPageBasic(c, job, personality, type); break;
            case 1: content = this._renderCharaPageStats(c, type); break;
            case 2: content = this._renderCharaPageTraits(c, type); break;
            case 3: content = this._renderCharaPageGear(c, type); break;
            case 4: content = this._renderCharaPageRelations(game, c, type); break;
        }

        // 迷你姓名头部（所有页面共用）
        const miniHeader = `
        <div class="chara-page-header-mini" style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--bg-card);border-radius:6px;margin-bottom:10px;border:1px solid var(--border);flex-wrap:wrap;">
            <div style="font-size:1.1rem;font-weight:bold;color:${type==='hero'?'var(--danger)':'var(--text)'};">${type==='hero'?'🗡️ ':''}${c.name}</div>
            <div style="font-size:0.8rem;color:var(--text-dim);">Lv.${c.level} · ${job} · ${personality}</div>
        </div>`;

        this.textArea.innerHTML = `<div class="chara-detail-wrap">${miniHeader}${content}</div>`;

        // 计算上一个/下一个角色导航
        let prevIndex = null, nextIndex = null, prevName = '', nextName = '';
        if (type === 'chara') {
            const charaList = [];
            for (let i = 0; i < game.characters.length; i++) charaList.push({ index: i, chara: game.getChara(i) });
            charaList.sort((a, b) => {
                if (a.index === game.master) return -1;
                if (b.index === game.master) return 1;
                return b.chara.level - a.chara.level;
            });
            const pos = charaList.findIndex(item => item.index === index);
            if (pos > 0) { prevIndex = charaList[pos - 1].index; prevName = charaList[pos - 1].chara.name; }
            if (pos >= 0 && pos < charaList.length - 1) { nextIndex = charaList[pos + 1].index; nextName = charaList[pos + 1].chara.name; }
        } else {
            const heroList = game.invaders.map((h, i) => ({ index: i, chara: h }));
            heroList.sort((a, b) => b.chara.level - a.chara.level);
            const pos = heroList.findIndex(item => item.index === index);
            if (pos > 0) { prevIndex = heroList[pos - 1].index; prevName = heroList[pos - 1].chara.name; }
            if (pos >= 0 && pos < heroList.length - 1) { nextIndex = heroList[pos + 1].index; nextName = heroList[pos + 1].chara.name; }
        }

        // 翻页控制
        let btnHtml = '<div class="chara-page-tabs">';
        btnHtml += `<button class="game-btn chara-page-arrow" ${page <= 0 ? 'disabled' : ''} onclick="UI.renderCharaDetail(G, ${index}, ${page - 1}, '${type}')">◀</button>`;
        for (let i = 0; i < pages.length; i++) {
            const cls = i === page ? 'chara-page-tab active' : 'chara-page-tab';
            btnHtml += `<button class="game-btn ${cls}" onclick="UI.renderCharaDetail(G, ${index}, ${i}, '${type}')">${pages[i]}</button>`;
        }
        btnHtml += `<button class="game-btn chara-page-arrow" ${page >= pages.length - 1 ? 'disabled' : ''} onclick="UI.renderCharaDetail(G, ${index}, ${page + 1}, '${type}')">▶</button>`;
        btnHtml += '</div>';

        // 角色间导航
        btnHtml += '<div style="display:flex;gap:8px;justify-content:center;margin:8px 0;">';
        if (prevIndex !== null) {
            btnHtml += `<button class="game-btn" style="font-size:0.8rem;padding:4px 12px;" onclick="UI.renderCharaDetail(G, ${prevIndex}, 0, '${type}')">◀ ${prevName}</button>`;
        } else {
            btnHtml += `<button class="game-btn" style="font-size:0.8rem;padding:4px 12px;" disabled>◀ 没有了</button>`;
        }
        if (nextIndex !== null) {
            btnHtml += `<button class="game-btn" style="font-size:0.8rem;padding:4px 12px;" onclick="UI.renderCharaDetail(G, ${nextIndex}, 0, '${type}')">${nextName} ▶</button>`;
        } else {
            btnHtml += `<button class="game-btn" style="font-size:0.8rem;padding:4px 12px;" disabled>没有了 ▶</button>`;
        }
        btnHtml += '</div>';

        btnHtml += '<div class="btn-grid">';
        // 求婚按钮（仅奴隶）
        if (type === 'chara') {
            const isMarried = c.cflag[600] ? true : false;
            const isFallen = (c.mark[0] || 0) >= 3;
            const hasRing = (game.item[70] || 0) > 0;
            if (isMarried) {
                btnHtml += `<button class="game-btn accent" onclick="UI.confirmMarry(G,${index})">💍 已婚</button>`;
            } else if (isFallen && hasRing) {
                btnHtml += `<button class="game-btn accent" onclick="UI.proposeMarry(G,${index})">💍 求婚</button>`;
            } else if (isFallen) {
                btnHtml += `<button class="game-btn" disabled>💍 求婚（无婚戒）</button>`;
            } else {
                btnHtml += `<button class="game-btn" disabled>💍 求婚（未陷落）</button>`;
            }
            // 前勇者金币上缴按钮
            if (c.talent[200] && c.gold > 0) {
                btnHtml += `<button class="game-btn accent" onclick="UI.submitGoldToMaster(G,${index})">💰 上缴${c.gold}G</button>`;
            }
            // 魔王升级按钮
            if (G.getMaster() === c) {
                btnHtml += `<button class="game-btn accent" onclick="const r=G.masterLevelUp();UI.showToast(r.msg,r.success?'success':'warning');UI.renderCharaDetail(G,${index},0,'chara')">💰 10万G 升级</button>`;
            }
            // 任务分配按钮（魔王或已陷落角色）
            if (G.canAssignTask(c)) {
                const hasTask = (c.cflag[985] || 0) !== 0;
                btnHtml += `<button class="game-btn ${hasTask ? 'accent' : ''}" onclick="UI.renderTaskAssignment(G,${index})">📋 ${hasTask ? '任务进行中' : '任务分配'}</button>`;
            }
            // 物品操作按钮（奴隶和俘虏勇者）
            btnHtml += `<button class="game-btn" onclick="UI.renderGearOperations(G,${index},'chara')">🎒 物品操作</button>`;
            // 肉体改造按钮（需要肉体改造室）
            if (game.getFacilityLevel(3) >= 1) {
                btnHtml += `<button class="game-btn" onclick="UI.renderCharaBodyMod(G,${index})">🔧 肉体改造</button>`;
            }
        }
        btnHtml += `<button class="game-btn back-btn" onclick="UI.renderCharaList(G)">返回角色列表</button>`;
        btnHtml += '</div>';
        this.clearButtons();
        this.setButtons(btnHtml);
    },

    renderCharaBodyMod(game, index) {
        const c = game.getChara(index);
        if (!c) return;
        this.hideTrainStatus();
        this.clearText();
        this.appendText(`【肉体改造】\n`, "accent");
        this.appendText(`对象: ${c.name}  Lv.${c.level}`);
        this.appendText(`肉体改造室 Lv.${game.getFacilityLevel(3)}`);
        this.appendDivider();
        this.clearButtons();

        const hasLactation = c.talent[130] ? true : false;
        const currentBreast = c.talent[116] ? '绝壁' : (c.talent[109] ? '贫乳' : (c.talent[110] ? '巨乳' : (c.talent[114] ? '爆乳' : '普通')));

        let html = '<div class="btn-grid">';

        // 升级改造
        const afford = game.money >= 10000;
        html += `<div style="grid-column:1/-1;padding:10px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;">`;
        html += `<div style="font-weight:bold;margin-bottom:4px;">🔧 直接升级</div>`;
        html += `<div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:8px;">通过肉体改造强行提升角色的身体能力，直接升一级。</div>`;
        html += `<button class="game-btn accent" style="width:100%;" ${afford ? '' : 'disabled'} onclick="const r=G.bodyModifyLevelUp(${index});UI.showToast(r.msg,r.success?'success':'warning');UI.renderCharaBodyMod(G,${index})">💰 10000G 执行升级</button>`;
        html += `</div>`;

        // 母乳体质改造
        html += `<div style="grid-column:1/-1;padding:10px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;margin-top:8px;">`;
        html += `<div style="font-weight:bold;margin-bottom:4px;">🥛 母乳体质改造</div>`;
        if (hasLactation) {
            html += `<div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:8px;">该角色已经是母乳体质。当前胸围: ${currentBreast}</div>`;
            html += `<button class="game-btn" style="width:100%;" disabled>✓ 已是母乳体质</button>`;
        } else {
            html += `<div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:8px;">激活乳腺功能，角色将开始泌乳。胸围会自动提升一个等级（${currentBreast} → 更大）。费用: 50000G</div>`;
            if (c.talent[122]) {
                html += `<div style="font-size:0.75rem;color:var(--danger);margin-bottom:8px;">⚠️ 该角色为男性，改造后会变为无穴扶她</div>`;
            }
            const affordLact = game.money >= 50000;
            html += `<button class="game-btn accent" style="width:100%;" ${affordLact ? '' : 'disabled'} onclick="const r=G.bodyModifyLactation(${index});UI.showToast(r.msg,r.success?'success':'warning');UI.renderCharaBodyMod(G,${index})">💰 50000G 执行改造</button>`;
        }
        html += `</div>`;

        // 扶她化改造
        html += `<div style="grid-column:1/-1;padding:10px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;margin-top:8px;">`;
        html += `<div style="font-weight:bold;margin-bottom:4px;">⚧ 扶她化改造</div>`;
        if (c.talent[121]) {
            html += `<div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:8px;">该角色已经是扶她。</div>`;
            html += `<button class="game-btn" style="width:100%;" disabled>✓ 已是扶她</button>`;
        } else {
            html += `<div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:8px;">通过肉体改造改变角色性别形态。费用: 50000G</div>`;
            if (c.talent[122]) {
                html += `<div style="font-size:0.75rem;color:var(--danger);margin-bottom:8px;">⚠️ 男性将变为无穴扶她</div>`;
            } else {
                html += `<div style="font-size:0.75rem;color:var(--info);margin-bottom:8px;">ℹ️ 女性将变为有穴扶她</div>`;
            }
            const affordFuta = game.money >= 50000;
            html += `<button class="game-btn accent" style="width:100%;" ${affordFuta ? '' : 'disabled'} onclick="const r=G.bodyModifyFutanari(${index});UI.showToast(r.msg,r.success?'success':'warning');UI.renderCharaBodyMod(G,${index})">💰 50000G 执行改造</button>`;
        }
        html += `</div>`;

        html += '</div>';
        this.setButtons(`<button class="back-btn-top" onclick="UI.renderCharaDetail(G,${index},0,'chara')">← 返回角色信息</button>` + html);
    },

    renderTaskAssignment(game, index) {
        const c = game.getChara(index);
        if (!c || !game.canAssignTask(c)) return;
        this.hideTrainStatus();
        this.clearText();
        this.appendText(`【任务分配】\n`, "accent");
        this.appendText(`对象: ${c.name}  Lv.${c.level}`);
        this.appendDivider();
        this.clearButtons();

        const currentTask = c.cflag[985] || 0;
        const isMaster = G.getMaster() === c;

        let html = '<div style="display:flex;flex-direction:column;gap:12px;">';

        // 任务类型选择（放在顶部）
        html += `<div style="font-weight:bold;margin-bottom:4px;">选择任务类型：</div>`;

        const tasks = [
            { id: 1, key: 'hunt' },
            { id: 2, key: 'lurk' },
            { id: 3, key: 'raid' }
        ];

        for (const t of tasks) {
            // 魔王只能执行讨伐
            if (isMaster && t.id !== 1) continue;
            const def = SLAVE_TASK_DEFS[t.id];
            if (!def) continue;
            const isCurrent = currentTask === t.id;
            html += `<div style="padding:10px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;${isCurrent ? 'opacity:0.6;' : ''}">`;
            html += `<div style="font-weight:bold;margin-bottom:4px;">${def.icon} ${def.name}</div>`;
            html += `<div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:8px;">${def.desc}</div>`;
            html += `<div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:8px;">🏅 勋章经验 +${def.rewardMedalExp || 0}</div>`;

            if (t.id === 3) {
                html += `<button class="game-btn ${isCurrent ? '' : 'accent'}" style="width:100%;" ${isCurrent ? 'disabled' : ''} onclick="UI.confirmTaskAssignment(G,${index},${t.id},0)">🔥 执行袭击</button>`;
            } else {
                html += `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">`;
                html += `<span style="font-size:0.8rem;color:var(--text-dim);align-self:center;">出发楼层：</span>`;
                for (let f = 1; f <= 10; f++) {
                    html += `<button class="game-btn" style="font-size:0.7rem;padding:3px 8px;min-width:36px;" ${isCurrent ? 'disabled' : ''} onclick="UI.confirmTaskAssignment(G,${index},${t.id},${f})">${f}层</button>`;
                }
                html += `</div>`;
            }
            html += `</div>`;
        }

        // 当前任务状态（放在底部）
        if (currentTask !== 0) {
            const taskDef = SLAVE_TASK_DEFS[currentTask];
            html += `<div style="padding:10px 12px;background:var(--bg-card);border:1px solid var(--accent);border-radius:6px;">`;
            html += `<div style="font-weight:bold;color:var(--accent);margin-bottom:4px;">📋 当前任务：${taskDef ? taskDef.icon : ''} ${taskDef ? taskDef.name : ''}</div>`;
            html += `<div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:8px;">${taskDef ? taskDef.desc : ''}</div>`;
            html += `<button class="game-btn" style="width:100%;" onclick="G.clearSlaveTask(G.getChara(${index}));UI.showToast('任务已取消','info');UI.renderTaskAssignment(G,${index})">❌ 取消当前任务</button>`;
            html += `</div>`;
        }

        html += '</div>';
        this.setButtons(`<button class="back-btn-top" onclick="UI.renderCharaDetail(G,${index},0,'chara')">← 返回角色信息</button>` + html);
    },

    confirmTaskAssignment(game, index, taskType, floor) {
        const c = game.getChara(index);
        if (!c) return;
        const def = SLAVE_TASK_DEFS[taskType];
        if (!def) return;

        let confirmText = '';
        if (taskType === 3) {
            confirmText = `确定要让 ${c.name} 执行"${def.icon} ${def.name}"吗？\n\n${def.desc}`;
        } else {
            confirmText = `确定要让 ${c.name} 从第${floor}层出发执行"${def.icon} ${def.name}"吗？\n\n${def.desc}\n\n📍 出发楼层：第${floor}层`;
        }

        if (!confirm(confirmText)) return;

        const result = game.assignSlaveTask(c, taskType, floor);
        if (result && result.success) {
            UI.showToast(result.msg, 'success');
            UI.renderTaskAssignment(game, index);
        } else {
            UI.showToast(result ? result.msg : '任务分配失败', 'warning');
        }
    },

    _getJobName(c) {
        for (let i = 200; i <= 210; i++) {
            if (c.talent[i] && TALENT_DEFS[i]) return TALENT_DEFS[i].name;
        }
        return '无职业';
    },

    _renderCharaPageBasic(c, job, personality, type = 'chara') {
        const isHero = type === 'hero';
        const hpPct = Math.max(0, Math.min(100, c.hp / c.maxHp * 100));
        const mpPct = Math.max(0, Math.min(100, c.mp / c.maxMp * 100));

        // 勇者额外信息
        let heroInfoHtml = '';
        if (isHero) {
            const floor = c.cflag[501] || 1;
            const progress = c.cflag[502] || 0;
            const floorDef = DUNGEON_FLOOR_DEFS[floor];
            const taskType = c.cflag[980] || 0;
            const taskDef = HERO_TASK_TYPE_DEFS[taskType] || HERO_TASK_TYPE_DEFS[0];
            const taskDesc = c.cstr[340] || '暂无任务';
            const taskStatus = (c.cflag[984] || 0) === 1 ? '<span style="color:var(--success);">[已完成]</span>' : '';
            heroInfoHtml = `
            <div class="chara-section" style="border-color:var(--danger);">
                <div class="chara-section-title" style="color:var(--danger);">🗡️ 勇者情报</div>
                <div class="chara-stat-grid">
                    <div class="chara-stat-item"><span class="chara-stat-name">当前位置</span><span class="chara-stat-val">第${floor}层 ${floorDef ? floorDef.name : ''}</span></div>
                    <div class="chara-stat-item"><span class="chara-stat-name">侵略进度</span><span class="chara-stat-val">${progress}%</span></div>
                    <div class="chara-stat-item"><span class="chara-stat-name">持有金币</span><span class="chara-stat-val">💰 ${c.gold}G</span></div>
                    <div class="chara-stat-item"><span class="chara-stat-name">个人声望</span><span class="chara-stat-val">🏆 ${c.fame || 0}</span></div>
                    ${c.cstr[1] ? `<div class="chara-stat-item"><span class="chara-stat-name">所属小队</span><span class="chara-stat-val">${c.cflag[901] === 1 ? '★' : ''}${c.cstr[1]}</span></div>` : ''}
                </div>
                <div style="margin-top:8px;padding:6px 10px;background:var(--bg);border-radius:4px;border-left:3px solid var(--accent);">
                    <div style="font-size:0.8rem;color:var(--text-dim);">${taskDef.icon || ''} 当前任务 ${taskStatus}</div>
                    <div style="font-size:0.85rem;">${taskDesc}</div>
                </div>
            </div>`;
        }

        // 刻印概览（仅奴隶）
        let marksHtml = '';
        if (!isHero) {
            for (let i = 0; i < 8; i++) {
                if (c.mark[i] > 0 && MARK_DEFS[i]) {
                    marksHtml += `<div class="chara-mark-item">${MARK_DEFS[i].name}<span class="chara-mark-lv">Lv.${c.mark[i]}</span></div>`;
                }
            }
            if (!marksHtml) marksHtml = '<span style="color:var(--text-dim);font-size:0.8rem;">无刻印</span>';
        }

        // 背景故事
        let backstoryHtml = '';
        const backstoryFields = [
            { key: 315, label: '勇者前生活' },
            { key: 316, label: '成为勇者理由' },
            { key: 317, label: '喜欢的东西' },
            { key: 320, label: '家族构成' }
        ];
        let hasBackstory = false;
        for (const f of backstoryFields) {
            const val = c.cstr[f.key];
            if (val) {
                hasBackstory = true;
                backstoryHtml += `<div class="chara-backstory-item"><span class="chara-backstory-label">${f.label}:</span>${val}</div>`;
            }
        }
        if (c.talent[157]) {
            hasBackstory = true;
            backstoryHtml += `<div class="chara-backstory-item"><span class="chara-backstory-label">配偶:</span>已婚（人妻）</div>`;
        }
        if (!hasBackstory) {
            backstoryHtml = '<div class="chara-backstory-empty">背景故事未记录</div>';
        }

        return `
        ${(() => {
            const appDesc = c.cstr[330];
            if (!appDesc) return '';
            const age = c.cstr[331] || '?';
            const height = c.cstr[332] || '?';
            const weight = c.cstr[333] || '?';
            const bodyFeat = c.cstr[335] || '';
            return `
            <div class="chara-section" style="border-color:var(--accent);">
                <div class="chara-section-title" style="color:var(--accent);">✨ 外貌描述</div>
                <div style="font-size:0.9rem;line-height:1.6;margin-bottom:8px;">${appDesc}</div>
                ${bodyFeat ? `<div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:8px;padding:4px 8px;background:var(--bg);border-radius:4px;">${bodyFeat}</div>` : ''}
                <div class="chara-stat-grid">
                    <div class="chara-stat-item"><span class="chara-stat-name">年龄</span><span class="chara-stat-val">${age}岁</span></div>
                    <div class="chara-stat-item"><span class="chara-stat-name">身高</span><span class="chara-stat-val">${height}cm</span></div>
                    <div class="chara-stat-item"><span class="chara-stat-name">体重</span><span class="chara-stat-val">${weight}kg</span></div>
                </div>
            </div>`;
        })()}

        <div class="chara-section">
            <div class="chara-section-title">📖 背景经历</div>
            ${backstoryHtml}
        </div>

        ${!isHero && c.talent[200] ? `
        <div class="chara-section" style="border-color:#d4af37;">
            <div class="chara-section-title" style="color:#d4af37;">🏅 魔王勋章</div>
            <div class="chara-stat-grid">
                <div class="chara-stat-item"><span class="chara-stat-name">勋章数</span><span class="chara-stat-val" style="color:#d4af37;">${c.cflag[988] || 0} 枚</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">全属性加成</span><span class="chara-stat-val" style="color:var(--success);">+${c.cflag[988] || 0}%</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">勋章经验</span><span class="chara-stat-val">${c.cflag[989] || 0}</span></div>
            </div>
        </div>
        ` : ''}

        ${!isHero && G.canAssignTask(c) ? `
        <div class="chara-section" style="border-color:var(--accent);">
            <div class="chara-section-title" style="color:var(--accent);">📋 当前任务</div>
            ${(() => {
                const taskType = c.cflag[985] || 0;
                if (taskType === 0) return '<div style="font-size:0.85rem;color:var(--text-dim);">暂无任务</div>';
                const taskDef = SLAVE_TASK_DEFS[taskType];
                const currentFloor = c.cflag[987] || c.cflag[986] || '?';
                const progress = c.cflag[990] || 0;
                return `
                <div style="font-size:0.9rem;font-weight:bold;margin-bottom:4px;">${taskDef ? taskDef.icon : ''} ${taskDef ? taskDef.name : '未知任务'}</div>
                <div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:6px;">${taskDef ? taskDef.desc : ''}</div>
                <div class="chara-stat-grid">
                    <div class="chara-stat-item"><span class="chara-stat-name">出发楼层</span><span class="chara-stat-val">第${c.cflag[986] || '?'}层</span></div>
                    <div class="chara-stat-item"><span class="chara-stat-name">当前楼层</span><span class="chara-stat-val">第${currentFloor}层</span></div>
                    <div class="chara-stat-item"><span class="chara-stat-name">移动进度</span><span class="chara-stat-val">${progress}%</span></div>
                </div>`;
            })()}
        </div>
        ` : ''}

        ${heroInfoHtml}

        <div class="chara-section">
            <div class="chara-section-title">基础属性</div>
            <div class="chara-bar-row">
                <span class="chara-bar-label">HP</span>
                <div class="chara-bar-bg"><div class="chara-bar-fill" style="width:${hpPct}%"></div></div>
                <span class="chara-bar-text">${c.hp}/${c.maxHp}</span>
            </div>
            <div class="chara-bar-row">
                <span class="chara-bar-label">MP</span>
                <div class="chara-bar-bg mp"><div class="chara-bar-fill mp" style="width:${mpPct}%"></div></div>
                <span class="chara-bar-text">${c.mp}/${c.maxMp}</span>
            </div>
            <div class="chara-stat-grid" style="margin-top:8px;">
                <div class="chara-stat-item"><span class="chara-stat-name">攻击</span><span class="chara-stat-val">${c.atk || 0}</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">防御</span><span class="chara-stat-val">${c.def || 0}</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">体力</span><span class="chara-stat-val">${c.stamina || c.maxbase[2] || 0}</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">气力</span><span class="chara-stat-val">${c.maxMp || 0}</span></div>
                ${(c.talent[200] || isHero) ? `<div class="chara-stat-item"><span class="chara-stat-name">持有金币</span><span class="chara-stat-val" style="color:var(--success);">💰 ${c.gold}G</span></div>` : ''}
                ${(c.talent[200] || isHero) ? `<div class="chara-stat-item"><span class="chara-stat-name">个人声望</span><span class="chara-stat-val" style="color:var(--warning);">🏆 ${c.fame || 0}</span></div>` : ''}
            </div>
        </div>

        ${!isHero ? `<div class="chara-section">
            <div class="chara-section-title">刻印</div>
            <div class="chara-mark-list">${marksHtml}</div>
        </div>` : ''}

        ${(!isHero && c.talent[153]) ? `<div class="chara-section" style="border-color:var(--accent);">
            <div class="chara-section-title" style="color:var(--accent);">🤰 妊娠状态</div>
            <div class="chara-stat-grid">
                <div class="chara-stat-item"><span class="chara-stat-name">妊娠天数</span><span class="chara-stat-val" style="color:var(--accent);">${c.cflag[800] || 0} / 30 天</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">预计分娩</span><span class="chara-stat-val" style="color:var(--accent);">${30 - (c.cflag[800] || 0)} 天后</span></div>
            </div>
        </div>` : ''}
        `;
    },

    _renderCharaPageStats(c, type = 'chara') {
        // 能力
        let ablHtml = '';
        for (let i = 0; i < 105; i++) {
            if (c.abl[i] > 0 && ABL_DEFS[i]) {
                ablHtml += `<div class="chara-stat-item"><span class="chara-stat-name">${ABL_DEFS[i].name}</span><span class="chara-stat-val">Lv.${c.abl[i]}</span></div>`;
            }
        }
        if (!ablHtml) ablHtml = '<span style="color:var(--text-dim);font-size:0.8rem;">无能力</span>';

        // 经验
        let expHtml = '';
        for (let i = 0; i < 100; i++) {
            if (c.exp[i] > 0 && EXP_DEFS[i]) {
                expHtml += `<div class="chara-stat-item"><span class="chara-stat-name">${EXP_DEFS[i].name}</span><span class="chara-stat-val">${c.exp[i]}</span></div>`;
            }
        }
        if (!expHtml) expHtml = '<span style="color:var(--text-dim);font-size:0.8rem;">无经验</span>';

        // 珠子
        let juelHtml = '';
        let hasJuel = false;
        for (let i = 0; i < 20; i++) {
            if (c.juel[i] > 0) {
                juelHtml += `<div class="chara-stat-item"><span class="chara-stat-name">${PALAM_DEFS[i]?.name || '珠'+i}</span><span class="chara-stat-val">${c.juel[i]}</span></div>`;
                hasJuel = true;
            }
        }
        if (!hasJuel) juelHtml = '<span style="color:var(--text-dim);font-size:0.8rem;">暂无珠子</span>';

        return `
        <div class="chara-two-col">
            <div class="chara-section">
                <div class="chara-section-title">能力</div>
                <div class="chara-stat-grid">${ablHtml}</div>
            </div>
            <div class="chara-section">
                <div class="chara-section-title">经验</div>
                <div class="chara-stat-grid">${expHtml}</div>
            </div>
        </div>
        <div class="chara-section">
            <div class="chara-section-title">持有珠</div>
            <div class="chara-stat-grid">${juelHtml}</div>
        </div>
        `;
    },

    _renderCharaPageTraits(c, type = 'chara') {
        const groupClass = {
            personality: 'group-personality',
            interest: '',
            maiden: '',
            body: 'group-body',
            tech: 'group-tech',
            devotion: '',
            honesty: '',
            lewd: 'group-lewd',
            orientation: '',
            charm: '',
            physique: '',
            breast: '',
            gender: '',
            special: '',
            job: 'group-job',
            combat_skill: 'group-combat',
            element: '',
            appearance: '',
            backstory: '',
            state: '',
            personality2: 'group-personality'
        };

        // 收集所有素质tag，直接横排，不分组标题（跳过外观数值型素质）
        let tags = [];
        let talentCount = 0;
        for (let i = 0; i < 1000; i++) {
            if (c.talent[i] > 0 && TALENT_DEFS[i]) {
                const def = TALENT_DEFS[i];
                // 跳过 appearance group（发色,瞳色等数值型外观已在外貌描述中体现）
                if (def.group === 'appearance') continue;
                const lv = def.type === 'level' ? ` ${c.talent[i]}` : '';
                tags.push({ name: def.name + lv, cls: groupClass[def.group] || '' });
                talentCount++;
            }
        }

        let traitsHtml = '';
        if (talentCount === 0) {
            traitsHtml = '<div class="chara-backstory-empty">无特殊素质</div>';
        } else {
            traitsHtml = '<div class="chara-tag-list">';
            for (const tag of tags) {
                traitsHtml += `<span class="chara-tag ${tag.cls}">${tag.name}</span>`;
            }
            traitsHtml += '</div>';
        }

        return `
        <div class="chara-section">
            <div class="chara-section-title">素质</div>
            ${traitsHtml}
        </div>
        `;
    },

    _renderCharaPageGear(c, type = 'chara') {
        const g = c.gear || { head: null, body: null, legs: null, hands: null, neck: null, ring: null, weapons: [], items: [] };
        const bonus = GearSystem.applyGearBonus(c, type !== 'hero');
        const isMasterView = type !== 'hero';
        const charaIndex = isMasterView && G ? G.characters.indexOf(c) : -1;
        const slotOrder = [
            { key: 'head', label: '头盔' },
            { key: 'body', label: '衣服' },
            { key: 'legs', label: '裤子' },
            { key: 'hands', label: '手套' },
            { key: 'neck', label: '项链' },
            { key: 'ring', label: '戒指' }
        ];
        let armorHtml = '';
        for (const s of slotOrder) {
            const item = g[s.key];
            const desc = item ? GearSystem.getGearDesc(item) : '<span style="color:var(--text-dim)">空</span>';
            let actionBtns = '';
            if (isMasterView && item && charaIndex >= 0) {
                actionBtns += `<button class="game-btn danger" style="font-size:0.65rem;padding:2px 6px;margin-left:4px;" onclick="UI.unequipGear(G, ${charaIndex}, '${s.key}', -1)">卸下</button>`;
                actionBtns += `<button class="game-btn" style="font-size:0.65rem;padding:2px 6px;margin-left:4px;" onclick="UI.discardGear(G, ${charaIndex}, '${s.key}', -1)">丢弃</button>`;
                actionBtns += `<button class="game-btn accent" style="font-size:0.65rem;padding:2px 6px;margin-left:4px;" onclick="UI.confiscateToMuseum(G, ${charaIndex}, '${s.key}', -1)">没收</button>`;
            }
            armorHtml += `<div class="chara-stat-item"><span class="chara-stat-name">${s.label}</span><span class="chara-stat-val" style="font-size:0.75rem;">${desc}</span>${actionBtns}</div>`;
        }
        let weaponHtml = '';
        if (g.weapons && g.weapons.length > 0) {
            for (let i = 0; i < g.weapons.length; i++) {
                const w = g.weapons[i];
                let actionBtns = '';
                if (isMasterView && charaIndex >= 0) {
                    actionBtns += `<button class="game-btn danger" style="font-size:0.65rem;padding:2px 6px;margin-left:4px;" onclick="UI.unequipGear(G, ${charaIndex}, 'weapon', ${i})">卸下</button>`;
                    actionBtns += `<button class="game-btn" style="font-size:0.65rem;padding:2px 6px;margin-left:4px;" onclick="UI.discardGear(G, ${charaIndex}, 'weapon', ${i})">丢弃</button>`;
                    actionBtns += `<button class="game-btn accent" style="font-size:0.65rem;padding:2px 6px;margin-left:4px;" onclick="UI.confiscateToMuseum(G, ${charaIndex}, 'weapon', ${i})">没收</button>`;
                }
                weaponHtml += `<div class="chara-stat-item"><span class="chara-stat-name">武器${i + 1}</span><span class="chara-stat-val" style="font-size:0.75rem;">${GearSystem.getGearDesc(w)}</span>${actionBtns}</div>`;
            }
        } else {
            weaponHtml = '<div class="chara-stat-item"><span class="chara-stat-name">武器</span><span class="chara-stat-val" style="color:var(--text-dim)">空</span></div>';
        }
        let itemHtml = '';
        if (g.items && g.items.length > 0) {
            for (let i = 0; i < g.items.length; i++) {
                const it = g.items[i];
                let actionBtns = '';
                if (isMasterView && charaIndex >= 0) {
                    actionBtns += `<button class="game-btn accent" style="font-size:0.65rem;padding:2px 6px;margin-left:4px;" onclick="UI.useGearItem(G, ${charaIndex}, ${i})">使用</button>`;
                    actionBtns += `<button class="game-btn" style="font-size:0.65rem;padding:2px 6px;margin-left:4px;" onclick="UI.discardGear(G, ${charaIndex}, 'item', ${i})">丢弃</button>`;
                    actionBtns += `<button class="game-btn accent" style="font-size:0.65rem;padding:2px 6px;margin-left:4px;" onclick="UI.confiscateToMuseum(G, ${charaIndex}, 'item', ${i})">没收</button>`;
                }
                itemHtml += `<div class="chara-stat-item"><span class="chara-stat-name">道具${i + 1}</span><span class="chara-stat-val" style="font-size:0.75rem;">${GearSystem.getGearDesc(it)}</span>${actionBtns}</div>`;
            }
        } else {
            itemHtml = '<div class="chara-stat-item"><span class="chara-stat-name">道具</span><span class="chara-stat-val" style="color:var(--text-dim)">空</span></div>';
        }
        const curseCount = GearSystem.countCursed(c);
        const curseWarn = curseCount > 0 ? `<div style="color:var(--danger);font-size:0.8rem;margin-top:4px;">⚠️ 身上有 ${curseCount} 件诅咒装备</div>` : '';
        return `
        <div class="chara-section">
            <div class="chara-section-title">装备加成</div>
            <div class="chara-stat-grid">
                <div class="chara-stat-item"><span class="chara-stat-name">攻击</span><span class="chara-stat-val" style="color:${bonus.atk > 0 ? 'var(--success)' : ''}">${bonus.atk > 0 ? '+' : ''}${bonus.atk}</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">防御</span><span class="chara-stat-val" style="color:${bonus.def > 0 ? 'var(--success)' : ''}">${bonus.def > 0 ? '+' : ''}${bonus.def}</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">生命</span><span class="chara-stat-val" style="color:${bonus.hp > 0 ? 'var(--success)' : ''}">${bonus.hp > 0 ? '+' : ''}${bonus.hp}</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">气力</span><span class="chara-stat-val" style="color:${bonus.mp > 0 ? 'var(--success)' : ''}">${bonus.mp > 0 ? '+' : ''}${bonus.mp}</span></div>
            </div>
            ${curseWarn}
        </div>
        <div class="chara-section">
            <div class="chara-section-title">防具</div>
            <div class="chara-stat-grid">${armorHtml}</div>
        </div>
        <div class="chara-section">
            <div class="chara-section-title">武器</div>
            <div class="chara-stat-grid">${weaponHtml}</div>
        </div>
        <div class="chara-section">
            <div class="chara-section-title">道具 (${g.items ? g.items.length : 0}/3)</div>
            <div class="chara-stat-grid">${itemHtml}</div>
        </div>
        ${isMasterView && charaIndex >= 0 && G && G.museum && G.museum.items.length > 0 ? `
        <div class="chara-section">
            <div class="chara-section-title">🏛️ 从收藏馆赠予</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
                ${G.museum.items.map((mitem, mi) => `
                    <button class="game-btn" style="font-size:0.72rem;padding:4px 8px;" onclick="UI.giveMuseumItem(G, ${mi}, ${charaIndex})">
                        ${GearSystem.getGearNameHtml(mitem.gear)} <span style="color:var(--text-dim);">Lv.${mitem.gear.level || 0}</span>
                    </button>
                `).join('')}
            </div>
        </div>` : ''}
        `;
    },

    _renderCharaPageRelations(game, c, type = 'chara') {
        let html = '<div style="font-size:0.85rem;line-height:1.6;">';

        // 显示自己的相性值
        const affinity = c.affinity !== undefined ? c.affinity : 50;
        html += `<div style="margin-bottom:10px;padding:8px;background:var(--bg-card);border-radius:6px;">`;
        html += `<div style="font-weight:bold;margin-bottom:4px;">🌟 相性值: ${affinity}</div>`;
        html += `<div style="font-size:0.75rem;color:var(--text-dim);">种族:${TALENT_DEFS[314]?.name || '?'} 职业:${this._getJobName(c) || '?'} 性格:${c.getPersonalityName ? c.getPersonalityName() : '?'}</div>`;
        html += `</div>`;

        // 勇者：显示与其他勇者的关系
        if (type === 'hero') {
            const relations = [];
            for (const other of game.invaders) {
                if (other === c) continue;
                const rel = game._getHeroRelation(c, other);
                const diff = game._getAffinityDiff(c, other);
                const def = AFFINITY_RELATION_DEFS[rel.level];
                relations.push({
                    name: other.name,
                    level: rel.level,
                    label: def ? `${def.icon} ${def.name}` : '?',
                    color: def ? def.color : '#aaa',
                    diff: diff,
                    history: rel.history.slice(-3)
                });
            }
            // 按关系等级排序（好的在前）
            relations.sort((a, b) => b.level - a.level);

            if (relations.length === 0) {
                html += `<div style="color:var(--text-dim);padding:10px;">地下城中暂无其他勇者。</div>`;
            } else {
                html += `<div style="font-weight:bold;margin-bottom:6px;">👥 勇者关系</div>`;
                for (const r of relations) {
                    html += `<div style="margin:4px 0;padding:6px 8px;background:var(--bg-card);border-radius:4px;border-left:3px solid ${r.color};">`;
                    html += `<div style="display:flex;justify-content:space-between;align-items:center;">`;
                    html += `<span>${r.label} <strong>${r.name}</strong></span>`;
                    html += `<span style="font-size:0.75rem;color:var(--text-dim);">相性差:${r.diff}</span>`;
                    html += `</div>`;
                    if (r.history.length > 0) {
                        html += `<div style="font-size:0.72rem;color:var(--text-dim);margin-top:2px;">`;
                        html += r.history.map(h => `第${h.day}天 ${h.event}`).join(' · ');
                        html += `</div>`;
                    }
                    html += `</div>`;
                }
            }
        } else {
            // 奴隶/魔王：显示与魔王的相性
            const master = game.getMaster();
            if (master && master !== c) {
                const diff = game._getAffinityDiff ? game._getAffinityDiff(c, master) : Math.abs((c.affinity || 50) - (master.affinity || 50));
                let affinityLabel = '普通';
                let affinityColor = '#aaaaaa';
                if (diff <= 10) { affinityLabel = '灵魂共鸣 ✨'; affinityColor = '#ff44aa'; }
                else if (diff <= 25) { affinityLabel = '心意相通 💕'; affinityColor = '#44ff88'; }
                else if (diff <= 45) { affinityLabel = '平平无奇 😐'; affinityColor = '#aaaaaa'; }
                else if (diff <= 65) { affinityLabel = '格格不入 😤'; affinityColor = '#ff8844'; }
                else { affinityLabel = '水火不容 💀'; affinityColor = '#ff3333'; }
                html += `<div style="margin:6px 0;padding:8px;background:var(--bg-card);border-radius:6px;border-left:3px solid ${affinityColor};">`;
                html += `<div style="font-weight:bold;">与魔王 ${master.name} 的相性</div>`;
                html += `<div style="font-size:0.8rem;">相性差: ${diff} — ${affinityLabel}</div>`;
                html += `<div style="font-size:0.72rem;color:var(--text-dim);margin-top:2px;">调教效果: ${diff <= 10 ? '+15%' : diff <= 25 ? '+8%' : diff <= 45 ? '±0%' : diff <= 65 ? '-8%' : '-15%'}</div>`;
                html += `</div>`;
            } else if (master === c) {
                html += `<div style="color:var(--text-dim);padding:10px;">你是魔王，相性系统主要影响你对奴隶的调教效果。</div>`;
            }
        }

        html += '</div>';
        return html;
    },

    // ========== 卖出 ==========
    renderSellList(game) {
        this.clearText();
        this.appendText(`【卖出角色】\n`, "accent");
        this.clearButtons();
        let listHtml = '<div style="line-height:normal;">';
        for (let i = 0; i < game.characters.length; i++) {
            if (i === game.master) continue;
            const c = game.getChara(i);
            listHtml += `<button class="game-btn danger" style="margin-bottom:6px;width:100%;" onclick="G.shopSystem.sellChara(${i}); G.setState('SHOP')">卖出 ${c.name}</button>`;
        }
        listHtml += '</div>';
        this.textArea.innerHTML += listHtml;
        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回</button>`);
    },

    // ========== 奴隶处分 ==========
    renderDisposeList(game) {
        this.hideTrainStatus();
        this.clearText();
        this.appendText(`【奴隶处分】\n`, "accent");
        this.appendText(`选择一名奴隶进行处分。`);
        this.appendDivider();
        this.clearButtons();

        let listHtml = '<div style="line-height:normal;">';
        let hasAny = false;
        for (let i = 0; i < game.characters.length; i++) {
            if (i === game.master) continue;
            hasAny = true;
            const c = game.getChara(i);
            const price = game.shopSystem._estimatePrice(c);
            const isMarried = c.cflag[600] ? true : false;
            listHtml += `<button class="game-btn" style="margin-bottom:6px;width:100%;text-align:left;display:flex;justify-content:space-between;align-items:center;" onclick="UI.renderDisposeOptions(G,${i})">`;
            listHtml += `<span><strong>${c.name}</strong> <span style="color:var(--text-dim);font-size:0.75rem;">Lv.${c.level}</span></span>`;
            listHtml += `<span style="font-size:0.75rem;"><span style="color:var(--success);">💰 ${price}G</span> ${isMarried ? '<span style="color:var(--accent);">💍</span>' : ''}</span>`;
            listHtml += `</button>`;
        }
        if (!hasAny) {
            listHtml += `<div style="color:var(--text-dim);text-align:center;padding:20px;">没有可处分的奴隶</div>`;
        }
        listHtml += '</div>';
        this.textArea.innerHTML += listHtml;
        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回</button>`);
    },

    renderDisposeOptions(game, index) {
        const c = game.getChara(index);
        if (!c) return;
        this.hideTrainStatus();
        this.clearText();
        this.appendText(`【奴隶处分】\n`, "accent");
        this.appendText(`对象: ${c.name}  Lv.${c.level}`);
        this.appendDivider();
        this.clearButtons();

        const price = game.shopSystem._estimatePrice(c);
        const isMarried = c.cflag[600] ? true : false;
        let html = '<div class="btn-grid">';

        // 经济/婚姻操作
        html += `<div style="grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px;">`;
        html += `<button class="game-btn" style="flex:1;min-width:100px;" onclick="G.shopSystem.sellChara(${index}); UI.renderDisposeList(G)">💰 卖出 (${price}G)</button>`;
        html += `<button class="game-btn ${isMarried ? 'accent' : ''}" style="flex:1;min-width:100px;" onclick="UI.confirmMarry(G,${index})">${isMarried ? '💍 解除婚约' : '💍 结婚'}</button>`;
        html += `</div>`;

        html += `<div style="grid-column:1/-1;margin:4px 0;border-top:1px solid var(--border);"></div>`;

        // 处刑选项
        html += `<div style="grid-column:1/-1;display:flex;gap:6px;flex-wrap:wrap;">`;
        html += `<span style="font-size:0.8rem;color:var(--text-dim);width:100%;margin-bottom:4px;">⚔️ 普通处刑</span>`;
        html += `<button class="game-btn danger" style="font-size:0.8rem;padding:6px 10px;flex:1;" onclick="UI.confirmDispose(G,${index},'behead')">斩首</button>`;
        html += `<button class="game-btn danger" style="font-size:0.8rem;padding:6px 10px;flex:1;" onclick="UI.confirmDispose(G,${index},'bisect')">腰斩</button>`;
        html += `</div>`;

        html += `<div style="grid-column:1/-1;display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">`;
        html += `<span style="font-size:0.8rem;color:var(--danger);width:100%;margin-bottom:4px;">🔞 H处刑</span>`;
        html += `<button class="game-btn danger" style="font-size:0.8rem;padding:6px 10px;flex:1;" onclick="UI.confirmDispose(G,${index},'gang')">公开轮奸</button>`;
        html += `<button class="game-btn danger" style="font-size:0.8rem;padding:6px 10px;flex:1;" onclick="UI.confirmDispose(G,${index},'limbless')">做成人彘</button>`;
        html += `<button class="game-btn danger" style="font-size:0.8rem;padding:6px 10px;flex:1;" onclick="UI.confirmDispose(G,${index},'fountain')">尿液喷泉</button>`;
        html += `</div>`;

        html += `<div style="grid-column:1/-1;display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">`;
        html += `<span style="font-size:0.8rem;color:var(--accent);width:100%;margin-bottom:4px;">✨ 特殊处刑</span>`;
        html += `<button class="game-btn accent" style="font-size:0.8rem;padding:6px 10px;flex:1;" onclick="UI.confirmDispose(G,${index},'memory_wipe')">记忆释放</button>`;
        html += `<button class="game-btn" style="font-size:0.8rem;padding:6px 10px;flex:1;background:var(--bg-dark);border-color:var(--accent);color:var(--accent);" onclick="UI.confirmDispose(G,${index},'specimen')">🧪 做成标本</button>`;
        html += `</div>`;

        html += '</div>';
        this.setButtons(`<button class="back-btn-top" onclick="UI.renderDisposeList(G)">← 返回选择</button>` + html);
    },

    confirmDispose(game, index, type) {
        const c = game.getChara(index);
        if (!c) return;
        const defs = {
            behead: { title: '斩首处刑', text: '用利刃斩断脖颈，瞬间死亡。', confirm: '执行斩首' },
            bisect: { title: '腰斩处刑', text: '拦腰斩断，内脏横流。', confirm: '执行腰斩' },
            gang: { title: '公开轮奸', text: '让魔物们轮流侵犯直至死亡。', confirm: '执行轮奸' },
            limbless: { title: '做成人彘', text: '斩去四肢，制成肉便器。', confirm: '执行人彘' },
            fountain: { title: '尿液喷泉', text: '石化后改造成永恒的尿液喷泉。', confirm: '执行石化' },
            memory_wipe: { title: '记忆释放', text: '洗去所有记忆后释放，她将忘记一切重新成为勇者。', confirm: '执行释放' },
            specimen: { title: '做成标本', text: '将她的遗体精心处理，制成永久陈列的收藏标本。', confirm: '制作标本' }
        };
        const d = defs[type];
        this.showModal(d.title, `
            <p>确定要对 <strong style="color:var(--danger);">${c.name}</strong> 执行${d.title}吗？</p>
            <p style="color:var(--danger);font-size:0.85rem;margin-top:8px;">${d.text}</p>
            <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;">
                <button class="game-btn danger" onclick="UI.doDispose(G,${index},'${type}'); UI.closeModal();">${d.confirm}</button>
                <button class="game-btn" onclick="UI.closeModal()">取消</button>
            </div>
        `);
    },

    confirmMarry(game, index) {
        const c = game.getChara(index);
        if (!c) return;
        const isMarried = c.cflag[600] ? true : false;
        if (isMarried) {
            this.showModal('解除婚约', `
                <p>确定要与 <strong style="color:var(--accent);">${c.name}</strong> 解除婚约吗？</p>
                <p style="color:var(--text-dim);font-size:0.85rem;margin-top:8px;">她将不再是你的妻子，新婚事件也不再触发。</p>
                <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;">
                    <button class="game-btn danger" onclick="G.marrySlave(-1); UI.renderDisposeList(G); UI.closeModal();">解除婚约</button>
                    <button class="game-btn" onclick="UI.closeModal()">取消</button>
                </div>
            `);
        } else {
            this.showModal('结婚仪式', `
                <p>确定要与 <strong style="color:var(--accent);">${c.name}</strong> 缔结婚约吗？</p>
                <p style="color:var(--text-dim);font-size:0.85rem;margin-top:8px;">结婚后她将获得妻子身份，日终事件中有概率触发新婚之夜等特殊事件。（同时只能有一位妻子）</p>
                <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;">
                    <button class="game-btn accent" onclick="G.marrySlave(${index}); UI.renderDisposeList(G); UI.closeModal();">缔结婚约</button>
                    <button class="game-btn" onclick="UI.closeModal()">取消</button>
                </div>
            `);
        }
    },

    proposeMarry(game, index) {
        const c = game.getChara(index);
        if (!c) return;
        if ((c.mark[0] || 0) < 3) {
            UI.showToast('只有已陷落的奴隶才能接受求婚', 'warning');
            return;
        }
        if ((game.item[70] || 0) <= 0) {
            UI.showToast('需要魔王的婚戒才能求婚', 'warning');
            return;
        }
        this.showModal('求婚仪式', `
            <p>你取出<span style="color:var(--accent);">魔王的婚戒</span>，在<strong style="color:var(--accent);">${c.name}</strong>面前单膝跪下。</p>
            <p style="color:var(--text-dim);font-size:0.85rem;margin-top:8px;">已陷落的她眼中闪过狂喜与深深的爱慕。这枚刻有魔王纹章的暗黑戒指，象征着永恒的契约——不仅是奴隶与主人的关系，更是妻子与丈夫的羁绊。</p>
            <p style="color:var(--danger);font-size:0.85rem;margin-top:8px;">（同时只能有一位妻子，日终事件中将触发新婚之夜）</p>
            <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;">
                <button class="game-btn accent" onclick="G.item[70] = (G.item[70] || 0) - 1; G.marrySlave(${index}); UI.closeModal(); UI.showToast('求婚成功！${c.name}成为了你的妻子', 'accent'); UI.renderCharaDetail(G, ${index}, 0, 'chara');">💍 缔结婚约</button>
                <button class="game-btn" onclick="UI.closeModal()">取消</button>
            </div>
        `);
    },

    unequipGear(game, index, slot, windex) {
        const c = game.getChara(index);
        if (!c) return;
        const r = GearSystem.unequipItem(c, slot, windex, true);
        if (!r.success) {
            UI.showToast(r.msg, 'warning');
            return;
        }
        // 诅咒至尊戒指被魔王脱下
        if (r.wasSupreme) {
            c.talent[247] = 0; // 清除洗脑
            c.mark[0] = Math.max(0, c.mark[0] - 1); // 服从度降1
            UI.showToast(c.name + '的洗脑效果结束了，至尊戒指的诅咒被魔王的力量驱散', 'accent');
            // 触发特殊对话弹窗
            UI.showModal('洗脑解除', `
                <p>${c.name}颤抖着将至尊戒指从手指上取下。</p>
                <p style="color:var(--accent);margin-top:8px;">"我...我想起来了...我为什么会在这里..."</p>
                <p style="color:var(--danger);margin-top:8px;">洗脑效果已经解除，但${c.name}的意识仍然混乱。作为对魔王的冒犯，她被关入监狱等待处置。</p>
                <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;">
                    <button class="game-btn" onclick="UI.closeModal()">关入监狱</button>
                </div>
            `);
        } else {
            UI.showToast('已卸下 ' + (r.gear ? r.gear.name : '装备'), 'info');
        }
        // 刷新当前页面
        const page = UI._charaDetailPage || 0;
        const ctype = UI._charaDetailType || 'chara';
        UI.renderCharaDetail(game, index, page, ctype);
    },

    useGearItem(game, index, itemIndex) {
        const c = game.getChara(index);
        if (!c) return;
        const r = GearSystem.useItem(c, itemIndex);
        if (r.success) {
            UI.showToast(r.msg, r.cursed ? 'danger' : 'success');
        } else {
            UI.showToast(r.msg, 'warning');
        }
        const page = UI._charaDetailPage || 0;
        const ctype = UI._charaDetailType || 'chara';
        UI.renderCharaDetail(game, index, page, ctype);
    },

    // 前勇者上缴金币给魔王
    submitGoldToMaster(game, index) {
        const c = game.getChara(index);
        if (!c || !c.talent[200]) return;
        const amount = c.gold;
        if (amount <= 0) {
            UI.showToast('没有可上缴的金币', 'warning');
            return;
        }
        c.gold = 0;
        game.money += amount;
        UI.showToast(`${c.name} 上缴了 ${amount}G 给魔王！`, 'success');
        const page = UI._charaDetailPage || 0;
        const ctype = UI._charaDetailType || 'chara';
        UI.renderCharaDetail(game, index, page, ctype);
    },

    // 丢弃角色装备/道具
    discardGear(game, index, slot, windex) {
        const c = game.getChara(index);
        if (!c || !c.gear) return;
        let removed = null;
        if (slot === 'weapon' && c.gear.weapons && c.gear.weapons[windex]) {
            removed = c.gear.weapons[windex];
            c.gear.weapons.splice(windex, 1);
        } else if (slot === 'item' && c.gear.items && c.gear.items[windex]) {
            removed = c.gear.items[windex];
            c.gear.items.splice(windex, 1);
        } else if (c.gear[slot]) {
            removed = c.gear[slot];
            c.gear[slot] = null;
        }
        if (removed) {
            UI.showToast(`丢弃了 ${removed.name}`, 'info');
        }
        const page = UI._charaDetailPage || 0;
        const ctype = UI._charaDetailType || 'chara';
        UI.renderCharaDetail(game, index, page, ctype);
    },

    doDispose(game, index, type) {
        const c = game.getChara(index);
        if (!c) return;
        const events = {
            behead: `${c.name}被斩首，头颅滚落在地，鲜血喷涌而出。`,
            bisect: `${c.name}被拦腰斩断，上半身在地上痛苦地爬行，最终停止了呼吸。`,
            gang: `${c.name}被数十只魔物轮流侵犯，在无尽的羞辱与快感中失去了生命。`,
            limbless: `${c.name}的四肢被斩去，眼睛被挖出，舌头被割掉，沦为纯粹的人彘肉便器。`,
            fountain: `${c.name}被石化魔法凝固，下体被改造成永恒的尿液喷泉，成为地下城的奇观。`,
            memory_wipe: `${c.name}的记忆被彻底洗去。她迷茫地走出地下城，忘记了自己曾是魔王的奴隶，重新踏上了冒险的旅途。`,
            specimen: `${c.name}的遗体被魔王的炼金术士精心处理。防腐魔药注入了每一寸肌肤，双眼被替换成宝石，身体被摆成跪伏姿态，仿佛仍在向魔王献上永恒的臣服。`
        };
        if (type === 'memory_wipe') {
            // 特殊处理：记忆释放
            c.talent[202] = 1; // 记忆清除特质
            c.cflag[600] = 0;
            c.cflag[601] = 0;
            c.mark[0] = 0; // 清除服从度
            c.hp = c.maxHp;
            c.mp = c.maxMp;
            // 生成新的勇者并加入入侵者
            const newHero = new Character(-2);
            newHero.name = c.name;
            newHero.callname = c.callname;
            newHero.base = [...c.base];
            newHero.maxbase = [...c.maxbase];
            newHero.hp = c.hp;
            newHero.mp = c.mp;
            newHero.level = c.level;
            newHero.cflag[9] = c.level;
            newHero.cflag[11] = c.cflag[11] || 20;
            newHero.cflag[12] = c.cflag[12] || 15;
            newHero.cflag[13] = c.cflag[13] || 10;
            newHero.talent = [...c.talent];
            newHero.talent[200] = 0;
            newHero.cflag[912] = 0;
            newHero.talent[202] = 1; // 记忆清除
            newHero.abl = [...c.abl];
            newHero.exp = [...c.exp];
            game.invaders.push(newHero);
            game.delChara(index);
            UI.showToast(`${c.name} 被洗去记忆后释放了，她将成为新的勇者`, 'warning');
            this.showEventQueue([{ type: 'daily', title: `【特殊处刑】${c.name}的记忆释放`, text: events[type], effects: [] }]);
        } else if (type === 'specimen') {
            game.addSpecimen(c, 'specimen');
            game.delChara(index);
            UI.showToast(`${c.name} 被制成标本，收入收藏馆`, 'accent');
            if (!game._dayEventLog) game._dayEventLog = [];
            game._dayEventLog.unshift({ day: game.day, events: [{ type: 'dungeon', title: `【处刑】${c.name}的标本制作`, text: events[type] }] });
            if (game._dayEventLog.length > 30) game._dayEventLog.pop();
        } else {
            game.delChara(index);
            UI.showToast(events[type], 'danger');
            if (!game._dayEventLog) game._dayEventLog = [];
            game._dayEventLog.unshift({ day: game.day, events: [{ type: 'dungeon', title: `【处刑】${c.name}`, text: events[type] }] });
            if (game._dayEventLog.length > 30) game._dayEventLog.pop();
        }
        this.renderDisposeList(game);
    },

    // ========== 收藏馆系统 ==========
    renderMuseum(game) {
        this.hideTrainStatus();
        this.clearText();
        this.appendText(`【收藏馆】\n`, "accent");
        this.appendText(`这里陈列着被永久保存的标本与没收的藏品。`);
        this.appendDivider();
        this.clearButtons();

        let html = '<div class="btn-grid">';
        // 标本区
        if (game.museum.specimens.length > 0) {
            html += `<div style="grid-column:1/-1;margin-bottom:8px;"><span style="font-size:0.85rem;color:var(--accent);font-weight:bold;">🧪 标本 (${game.museum.specimens.length})</span></div>`;
            for (const sp of game.museum.specimens) {
                html += `<div style="grid-column:1/-1;padding:10px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;margin-bottom:6px;">`;
                html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">`;
                html += `<strong>${sp.name}</strong> <span style="font-size:0.75rem;color:var(--text-dim);">Lv.${sp.level} · ${sp.job} · ${sp.gender} · 第${sp.day}天</span>`;
                html += `</div>`;
                html += `<div style="font-size:0.78rem;color:var(--text-dim);margin-bottom:6px;">`;
                if (sp.talentSnapshot && sp.talentSnapshot.length > 0) {
                    html += `<span style="color:var(--accent);">特质:</span> ${sp.talentSnapshot.join(' · ')}<br>`;
                }
                html += `<span style="color:var(--danger);">HP:${sp.hp} MP:${sp.mp} ATK:${sp.atk} DEF:${sp.def}</span>`;
                html += `</div>`;
                html += `<div style="font-size:0.8rem;color:var(--text);line-height:1.5;border-left:3px solid var(--accent);padding-left:8px;background:var(--bg-dark);padding:6px 8px;border-radius:0 4px 4px 0;">${sp.description}</div>`;
                html += `</div>`;
            }
        } else {
            html += `<div style="grid-column:1/-1;color:var(--text-dim);text-align:center;padding:12px;">暂无标本</div>`;
        }

        html += `<div style="grid-column:1/-1;margin:8px 0;border-top:1px solid var(--border);"></div>`;

        // 物品区
        if (game.museum.items.length > 0) {
            html += `<div style="grid-column:1/-1;margin-bottom:8px;"><span style="font-size:0.85rem;color:var(--success);font-weight:bold;">📦 藏品 (${game.museum.items.length})</span></div>`;
            for (let i = 0; i < game.museum.items.length; i++) {
                const mitem = game.museum.items[i];
                const price = game._calcGearPrice(mitem.gear);
                html += `<div style="grid-column:1/-1;display:flex;gap:6px;align-items:center;padding:8px 10px;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;margin-bottom:4px;">`;
                html += `<div style="flex:1;font-size:0.8rem;"><strong>${GearSystem.getGearNameHtml(mitem.gear)}</strong> <span style="color:var(--text-dim);">Lv.${mitem.gear.level || 0}</span> <span style="color:var(--success);">${price}G</span></div>`;
                html += `<div style="font-size:0.7rem;color:var(--text-dim);">来源: ${mitem.source}</div>`;
                html += `<button class="game-btn accent" style="font-size:0.65rem;padding:2px 8px;" onclick="UI.showMuseumGiveDialog(G,${i})">🎁 赠予</button>`;
                html += `<button class="game-btn" style="font-size:0.65rem;padding:2px 8px;" onclick="const p=G.sellMuseumItem(${i});UI.showToast('卖出藏品获得 '+p+'G','success');UI.renderMuseum(G);">💰 卖出</button>`;
                html += `<button class="game-btn danger" style="font-size:0.65rem;padding:2px 8px;" onclick="G.discardMuseumItem(${i});UI.showToast('已丢弃藏品','info');UI.renderMuseum(G);">🗑️ 丢弃</button>`;
                html += `</div>`;
            }
        } else {
            html += `<div style="grid-column:1/-1;color:var(--text-dim);text-align:center;padding:12px;">暂无藏品</div>`;
        }

        html += '</div>';
        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回</button>` + html);
    },

    // 收藏馆赠予角色选择弹窗
    showMuseumGiveDialog(game, itemIndex) {
        const item = game.museum.items[itemIndex];
        if (!item) {
            UI.showToast('物品不存在', 'warning');
            return;
        }
        let html = '<div style="display:flex;flex-direction:column;gap:8px;">';
        html += `<div style="font-weight:bold;margin-bottom:6px;">选择赠予对象：${GearSystem.getGearNameHtml(item.gear)}</div>`;
        // 魔王
        const master = game.getMaster();
        if (master) {
            html += `<button class="game-btn" style="text-align:left;" onclick="UI._doMuseumGive(G,${itemIndex},'master',-1)">👑 ${master.name} (魔王)</button>`;
        }
        // 奴隶
        const slaves = game.characters.filter((c, i) => i !== game.master && c.talent[200]);
        if (slaves.length > 0) {
            html += '<div style="font-size:0.8rem;color:var(--accent);margin-top:4px;">🛡️ 奴隶/前勇者</div>';
            for (let i = 0; i < game.characters.length; i++) {
                const c = game.characters[i];
                if (i === game.master || !c.talent[200]) continue;
                html += `<button class="game-btn" style="text-align:left;" onclick="UI._doMuseumGive(G,${itemIndex},'chara',${i})">🛡️ ${c.name} Lv.${c.level}</button>`;
            }
        }
        // 俘虏
        if (game.prisoners && game.prisoners.length > 0) {
            html += '<div style="font-size:0.8rem;color:var(--danger);margin-top:4px;">⛓️ 俘虏</div>';
            for (let i = 0; i < game.prisoners.length; i++) {
                const p = game.prisoners[i];
                html += `<button class="game-btn" style="text-align:left;" onclick="UI._doMuseumGive(G,${itemIndex},'prisoner',${i})">⛓️ ${p.name} Lv.${p.level}</button>`;
            }
        }
        html += '</div>';
        this.showModal('🏛️ 赠予藏品', html + `<div style="text-align:center;margin-top:10px;"><button class="game-btn" onclick="UI.closeModal()">取消</button></div>`);
    },

    _doMuseumGive(game, itemIndex, targetType, targetIndex) {
        let r;
        if (targetType === 'prisoner') {
            r = { success: false, msg: '俘虏系统暂不支持此操作' };
            const p = game.prisoners[targetIndex];
            if (p) {
                const res = GearSystem.equipItem(p, game.museum.items[itemIndex].gear, true);
                if (res.success) {
                    game.museum.items.splice(itemIndex, 1);
                }
                r = res;
            }
        } else {
            const charaIndex = targetType === 'master' ? game.master : targetIndex;
            r = game.giftMuseumItemToChara(itemIndex, charaIndex);
        }
        if (r.success) {
            UI.showToast('赠予成功: ' + r.msg, 'success');
            UI.closeModal();
            UI.renderMuseum(game);
        } else {
            UI.showToast('赠予失败: ' + r.msg, 'warning');
        }
    },

    confiscateToMuseum(game, index, slot, windex) {
        const r = game.confiscateGear(index, slot, windex);
        if (r.success) {
            UI.showToast(r.msg, 'success');
        } else {
            UI.showToast(r.msg, 'warning');
        }
        const page = UI._charaDetailPage || 0;
        const ctype = UI._charaDetailType || 'chara';
        UI.renderCharaDetail(game, index, page, ctype);
    },

    giveMuseumItem(game, itemIndex, charaIndex) {
        const r = game.giftMuseumItemToChara(itemIndex, charaIndex);
        if (r.success) {
            UI.showToast('赠予成功: ' + r.msg, 'success');
        } else {
            UI.showToast('赠予失败: ' + r.msg, 'warning');
        }
        const page = UI._charaDetailPage || 0;
        const ctype = UI._charaDetailType || 'chara';
        UI.renderCharaDetail(game, charaIndex, page, ctype);
    },

    // ========== 物品操作弹窗（奴隶/俘虏通用） ==========
    renderGearOperations(game, index, sourceType) {
        const c = sourceType === 'prisoner' ? game.prisoners[index] : game.getChara(index);
        if (!c) return;
        const g = c.gear || { head: null, body: null, legs: null, hands: null, neck: null, ring: null, weapons: [], items: [] };
        const isPrisoner = sourceType === 'prisoner';
        let html = '<div style="display:flex;flex-direction:column;gap:10px;">';

        // 防具
        html += '<div style="font-weight:bold;">防具</div>';
        const slots = [
            { key: 'head', label: '头盔' },
            { key: 'body', label: '衣服' },
            { key: 'legs', label: '裤子' },
            { key: 'hands', label: '手套' },
            { key: 'neck', label: '项链' },
            { key: 'ring', label: '戒指' }
        ];
        for (const s of slots) {
            const item = g[s.key];
            const desc = item ? GearSystem.getGearDesc(item) : '<span style="color:var(--text-dim)">空</span>';
            let btns = '';
            if (item) {
                if (isPrisoner) {
                    btns += `<button class="game-btn danger" style="font-size:0.65rem;padding:2px 6px;" onclick="UI.unequipPrisonerGear(G,${index},'${s.key}',-1)">卸下</button>`;
                    btns += `<button class="game-btn" style="font-size:0.65rem;padding:2px 6px;" onclick="UI.discardPrisonerGear(G,${index},'${s.key}',-1)">丢弃</button>`;
                    btns += `<button class="game-btn accent" style="font-size:0.65rem;padding:2px 6px;" onclick="UI.confiscatePrisonerGear(G,${index},'${s.key}',-1)">没收</button>`;
                } else {
                    btns += `<button class="game-btn danger" style="font-size:0.65rem;padding:2px 6px;" onclick="UI.unequipGear(G,${index},'${s.key}',-1);UI.renderGearOperations(G,${index},'${sourceType}')">卸下</button>`;
                    btns += `<button class="game-btn" style="font-size:0.65rem;padding:2px 6px;" onclick="UI.discardGear(G,${index},'${s.key}',-1);UI.renderGearOperations(G,${index},'${sourceType}')">丢弃</button>`;
                    btns += `<button class="game-btn accent" style="font-size:0.65rem;padding:2px 6px;" onclick="UI.confiscateToMuseum(G,${index},'${s.key}',-1);UI.renderGearOperations(G,${index},'${sourceType}')">没收</button>`;
                }
            }
            html += `<div style="display:flex;align-items:center;gap:6px;padding:6px;background:var(--bg-card);border-radius:4px;"><span style="flex:1;font-size:0.8rem;">${s.label}: ${desc}</span><span style="display:flex;gap:4px;">${btns}</span></div>`;
        }

        // 武器
        html += '<div style="font-weight:bold;margin-top:6px;">武器</div>';
        if (g.weapons && g.weapons.length > 0) {
            for (let i = 0; i < g.weapons.length; i++) {
                const w = g.weapons[i];
                let btns = '';
                if (isPrisoner) {
                    btns += `<button class="game-btn danger" style="font-size:0.65rem;padding:2px 6px;" onclick="UI.unequipPrisonerGear(G,${index},'weapon',${i})">卸下</button>`;
                    btns += `<button class="game-btn" style="font-size:0.65rem;padding:2px 6px;" onclick="UI.discardPrisonerGear(G,${index},'weapon',${i})">丢弃</button>`;
                    btns += `<button class="game-btn accent" style="font-size:0.65rem;padding:2px 6px;" onclick="UI.confiscatePrisonerGear(G,${index},'weapon',${i})">没收</button>`;
                } else {
                    btns += `<button class="game-btn danger" style="font-size:0.65rem;padding:2px 6px;" onclick="UI.unequipGear(G,${index},'weapon',${i});UI.renderGearOperations(G,${index},'${sourceType}')">卸下</button>`;
                    btns += `<button class="game-btn" style="font-size:0.65rem;padding:2px 6px;" onclick="UI.discardGear(G,${index},'weapon',${i});UI.renderGearOperations(G,${index},'${sourceType}')">丢弃</button>`;
                    btns += `<button class="game-btn accent" style="font-size:0.65rem;padding:2px 6px;" onclick="UI.confiscateToMuseum(G,${index},'weapon',${i});UI.renderGearOperations(G,${index},'${sourceType}')">没收</button>`;
                }
                html += `<div style="display:flex;align-items:center;gap:6px;padding:6px;background:var(--bg-card);border-radius:4px;"><span style="flex:1;font-size:0.8rem;">武器${i+1}: ${GearSystem.getGearDesc(w)}</span><span style="display:flex;gap:4px;">${btns}</span></div>`;
            }
        } else {
            html += '<div style="font-size:0.8rem;color:var(--text-dim);padding:6px;">无武器</div>';
        }

        // 道具
        html += '<div style="font-weight:bold;margin-top:6px;">道具</div>';
        if (g.items && g.items.length > 0) {
            for (let i = 0; i < g.items.length; i++) {
                const it = g.items[i];
                let btns = '';
                if (isPrisoner) {
                    btns += `<button class="game-btn" style="font-size:0.65rem;padding:2px 6px;" onclick="UI.discardPrisonerGear(G,${index},'item',${i})">丢弃</button>`;
                    btns += `<button class="game-btn accent" style="font-size:0.65rem;padding:2px 6px;" onclick="UI.confiscatePrisonerGear(G,${index},'item',${i})">没收</button>`;
                } else {
                    btns += `<button class="game-btn accent" style="font-size:0.65rem;padding:2px 6px;" onclick="UI.useGearItem(G,${index},${i});UI.renderGearOperations(G,${index},'${sourceType}')">使用</button>`;
                    btns += `<button class="game-btn" style="font-size:0.65rem;padding:2px 6px;" onclick="UI.discardGear(G,${index},'item',${i});UI.renderGearOperations(G,${index},'${sourceType}')">丢弃</button>`;
                    btns += `<button class="game-btn accent" style="font-size:0.65rem;padding:2px 6px;" onclick="UI.confiscateToMuseum(G,${index},'item',${i});UI.renderGearOperations(G,${index},'${sourceType}')">没收</button>`;
                }
                html += `<div style="display:flex;align-items:center;gap:6px;padding:6px;background:var(--bg-card);border-radius:4px;"><span style="flex:1;font-size:0.8rem;">道具${i+1}: ${GearSystem.getGearDesc(it)}</span><span style="display:flex;gap:4px;">${btns}</span></div>`;
            }
        } else {
            html += '<div style="font-size:0.8rem;color:var(--text-dim);padding:6px;">无道具</div>';
        }

        // 收藏馆赠予
        if (game.museum && game.museum.items.length > 0) {
            html += '<div style="font-weight:bold;margin-top:10px;">🏛️ 从收藏馆赠予</div>';
            html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
            for (let i = 0; i < game.museum.items.length; i++) {
                const mitem = game.museum.items[i];
                const onclick = isPrisoner
                    ? `UI.giftMuseumItemToPrisoner(G,${i},${index})`
                    : `UI.giveMuseumItem(G,${i},${index});UI.renderGearOperations(G,${index},'${sourceType}')`;
                html += `<button class="game-btn" style="font-size:0.72rem;padding:4px 8px;" onclick="${onclick}">${GearSystem.getGearNameHtml(mitem.gear)} <span style="color:var(--text-dim);">Lv.${mitem.gear.level || 0}</span></button>`;
            }
            html += '</div>';
        }

        html += '</div>';
        this.showModal(`🎒 ${c.name} 的物品操作`, html + `<div style="text-align:center;margin-top:10px;"><button class="game-btn" onclick="UI.closeModal()">关闭</button></div>`);
    },

    // 俘虏装备操作辅助函数
    confiscatePrisonerGear(game, prisonerIndex, slot, windex) {
        const p = game.prisoners[prisonerIndex];
        if (!p || !p.gear) return;
        let removed = null;
        if (slot === 'weapon' && p.gear.weapons && p.gear.weapons[windex]) {
            removed = p.gear.weapons[windex];
            p.gear.weapons.splice(windex, 1);
        } else if (slot === 'item' && p.gear.items && p.gear.items[windex]) {
            removed = p.gear.items[windex];
            p.gear.items.splice(windex, 1);
        } else if (p.gear[slot]) {
            removed = p.gear[slot];
            p.gear[slot] = null;
        }
        if (removed) {
            game.addMuseumItem(removed, `没收${p.name}的装备`);
            UI.showToast(`没收了 ${removed.name}`, 'success');
        }
        UI.renderGearOperations(game, prisonerIndex, 'prisoner');
    },

    unequipPrisonerGear(game, prisonerIndex, slot, windex) {
        const p = game.prisoners[prisonerIndex];
        if (!p) return;
        const r = GearSystem.unequipItem(p, slot, windex, true);
        if (r.success) {
            UI.showToast('已卸下 ' + (r.gear ? r.gear.name : '装备'), 'info');
        } else {
            UI.showToast(r.msg, 'warning');
        }
        UI.renderGearOperations(game, prisonerIndex, 'prisoner');
    },

    discardPrisonerGear(game, prisonerIndex, slot, windex) {
        const p = game.prisoners[prisonerIndex];
        if (!p || !p.gear) return;
        let removed = null;
        if (slot === 'weapon' && p.gear.weapons && p.gear.weapons[windex]) {
            removed = p.gear.weapons[windex];
            p.gear.weapons.splice(windex, 1);
        } else if (slot === 'item' && p.gear.items && p.gear.items[windex]) {
            removed = p.gear.items[windex];
            p.gear.items.splice(windex, 1);
        } else if (p.gear[slot]) {
            removed = p.gear[slot];
            p.gear[slot] = null;
        }
        if (removed) {
            UI.showToast(`丢弃了 ${removed.name}`, 'info');
        }
        UI.renderGearOperations(game, prisonerIndex, 'prisoner');
    },

    giftMuseumItemToPrisoner(game, itemIndex, prisonerIndex) {
        const item = game.museum.items[itemIndex];
        if (!item) {
            UI.showToast('物品不存在', 'warning');
            return;
        }
        const p = game.prisoners[prisonerIndex];
        if (!p) {
            UI.showToast('俘虏不存在', 'warning');
            return;
        }
        const r = GearSystem.equipItem(p, item.gear, true);
        if (r.success) {
            game.museum.items.splice(itemIndex, 1);
            UI.showToast('赠予成功: ' + r.msg, 'success');
        } else {
            UI.showToast('赠予失败: ' + r.msg, 'warning');
        }
        UI.renderGearOperations(game, prisonerIndex, 'prisoner');
    },

    // ========== 合并商店 ==========
    renderMergedShop(game) {
        this.hideTrainStatus();
        this.clearText();
        this.clearButtons();
        this._shopSelected = null;

        const html = `
        <div style="margin-bottom:8px;">
            <span style="color:var(--accent);font-weight:bold;font-size:1.05rem;">【商店】</span>
            <span style="color:var(--text-dim);font-size:0.85rem;">持有金钱: ${game.money}G</span>
        </div>
        <div class="shop-split">
            <div class="shop-list-col" id="shop-list">
                <div class="shop-section-title">🛒 道具</div>
                ${this._renderShopItemList(game)}
                <div class="shop-section-title">🛡️ 御敌策略</div>
                ${this._renderShopStrategyList(game)}
            </div>
            <div class="shop-detail-col" id="shop-detail">
                <div style="color:var(--text-dim);text-align:center;padding-top:40px;font-size:0.9rem;">
                    点击左侧物品查看详情
                </div>
            </div>
        </div>`;

        this.textArea.innerHTML = html;
        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回</button>`);
    },

    _renderShopItemList(game) {
        let html = '';
        const basicItems = window.BASIC_SHOP_ITEMS || [];
        for (const itemId of basicItems) {
            const item = ITEM_DEFS[itemId];
            if (!item) continue;
            const owned = game.item[itemId] || 0;
            const afford = game.money >= item.price;
            html += `<button class="shop-item-btn ${afford?'':'danger'}" data-type="item" data-id="${itemId}" onclick="UI.showMergedShopDetail(G,'item',${itemId})">`;
            html += `<div style="font-weight:bold;">${item.name}</div>`;
            html += `<div style="font-size:0.72rem;color:var(--text-dim);">${item.price}G | 持有${owned}</div>`;
            html += `</button>`;
        }
        return html;
    },

    _renderShopStrategyList(game) {
        let html = '';
        for (const [id, def] of Object.entries(STRATEGY_DEFS)) {
            const sid = parseInt(id);
            const owned = game.strategies.includes(sid);
            if (owned) {
                html += `<button class="shop-item-btn owned" disabled>`;
                html += `<div style="font-weight:bold;">✅ ${def.icon} ${def.name}</div>`;
                html += `<div style="font-size:0.72rem;color:var(--text-dim);">已习得</div>`;
                html += `</button>`;
                continue;
            }
            const check = game.canBuyStrategy(sid);
            const afford = game.money >= def.price;
            const canBuy = check.ok && afford;
            html += `<button class="shop-item-btn ${canBuy?'':'danger'}" data-type="strategy" data-id="${sid}" onclick="UI.showMergedShopDetail(G,'strategy',${sid})">`;
            html += `<div style="font-weight:bold;">${def.icon} ${def.name}</div>`;
            html += `<div style="font-size:0.72rem;color:var(--text-dim);">${def.price}G</div>`;
            html += `</button>`;
        }
        return html;
    },

    showMergedShopDetail(game, type, id) {
        this._shopSelected = { type, id };
        const detailEl = document.getElementById('shop-detail');
        if (!detailEl) return;

        // 更新选中状态
        document.querySelectorAll('.shop-item-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.type === type && parseInt(btn.dataset.id) === id) {
                btn.classList.add('selected');
            }
        });

        let html = '';
        if (type === 'item') {
            const item = ITEM_DEFS[id];
            const owned = game.item[id] || 0;
            const afford = game.money >= item.price;
            html += `<div class="shop-detail-title">${item.name}</div>`;
            html += `<div class="shop-detail-row">类型: ${item.type || '道具'}</div>`;
            html += `<div class="shop-detail-row">价格: ${item.price}G</div>`;
            html += `<div class="shop-detail-row">当前持有: ${owned}</div>`;
            html += `<div class="shop-detail-desc">${this._getItemDesc(item)}</div>`;
            if (afford) {
                html += `<button class="game-btn accent" style="width:100%;margin-top:8px;" onclick="G.shopSystem.buy(${id}); UI.refreshMergedShop(G)">💰 购买</button>`;
            } else {
                html += `<button class="game-btn danger" disabled style="width:100%;margin-top:8px;">金钱不足 (${item.price}G)</button>`;
            }
        } else if (type === 'strategy') {
            const def = STRATEGY_DEFS[id];
            const check = game.canBuyStrategy(id);
            const afford = game.money >= def.price;
            const canBuy = check.ok && afford;
            html += `<div class="shop-detail-title">${def.icon} ${def.name}</div>`;
            html += `<div class="shop-detail-row">价格: ${def.price}G</div>`;
            html += `<div class="shop-detail-desc"><strong style="color:var(--success);">效果:</strong> ${def.effectDesc || '效果未知'}</div>`;
            html += `<div class="shop-detail-desc"><strong>描述:</strong> ${def.description}</div>`;
            if (def.unlockFacilityLv) {
                html += `<div class="shop-detail-row" style="margin-top:6px;"><strong>解锁条件:</strong></div>`;
                for (const [fid, minLv] of Object.entries(def.unlockFacilityLv)) {
                    const fdef = FACILITY_DEFS[fid];
                    const curLv = game.getFacilityLevel(parseInt(fid));
                    const ok = curLv >= minLv;
                    html += `<div class="shop-detail-row">${ok?'✅':'❌'} 需要【${fdef?.name || '设施'}】Lv.${minLv} (当前Lv.${curLv})</div>`;
                }
            }
            if (canBuy) {
                html += `<button class="game-btn accent" style="width:100%;margin-top:8px;" onclick="G.buyStrategy(${id}); UI.refreshMergedShop(G)">💰 购买</button>`;
            } else {
                html += `<button class="game-btn danger" disabled style="width:100%;margin-top:8px;">${check.reason || '无法购买'}</button>`;
            }
        }
        detailEl.innerHTML = html;
    },

    refreshMergedShop(game) {
        this.renderMergedShop(game);
        if (this._shopSelected) {
            const { type, id } = this._shopSelected;
            this.showMergedShopDetail(game, type, id);
        }
    },

    // ========== 商店 ==========
    renderItemShop(game, type) {
        this.clearText();
        this.appendText(`【道具商店】\n`, "accent");
        this.appendText(`持有金钱: ${game.money}G`);
        this.appendText(`点击商品查看详情并购买。升级"高级道具商店"可解锁更多商品。`);
        this.appendDivider();

        this.clearButtons();
        let html = '<div class="btn-grid">';

        // 基础商品（开局可购买）
        const basicItems = window.BASIC_SHOP_ITEMS || [];
        for (const itemId of basicItems) {
            const item = ITEM_DEFS[itemId];
            if (!item) continue;
            const owned = game.item[itemId] || 0;
            const afford = game.money >= item.price;
            html += `<button class="game-btn ${afford?'':'danger'}" onclick="UI.showItemDetail(G,${itemId})" style="text-align:left;">`;
            html += `<div style="font-weight:bold;">${item.name}</div>`;
            html += `<div style="font-size:0.75rem;">${item.price}G | 持有${owned}</div>`;
            html += `</button>`;
        }

        html += '</div>';
        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回</button>` + html);
    },

    showItemDetail(game, itemId) {
        const item = ITEM_DEFS[itemId];
        if (!item) return;
        const owned = game.item[itemId] || 0;
        const afford = game.money >= item.price;
        this.clearText();
        this.appendText(`【商品详情】\n`, "accent");
        this.appendText(`━━━━━━━━━━━━━━━━━━━━━━━━`);
        this.appendText(`${item.name}`, "accent");
        this.appendText(`类型: ${item.type || '道具'}`);
        this.appendText(`价格: ${item.price}G`);
        this.appendText(`当前持有: ${owned}`);
        this.appendDivider();
        this.appendText(`效果说明:`);
        this.appendText(this._getItemDesc(item));
        this.appendDivider();

        this.clearButtons();
        let html = '<div class="btn-grid">';
        if (afford) {
            html += `<button class="game-btn accent" onclick="G.shopSystem.buy(${itemId}); UI.renderItemShop(G)">💰 购买</button>`;
        } else {
            html += `<button class="game-btn danger" disabled>金钱不足 (${item.price}G)</button>`;
        }
        html += `<button class="game-btn" onclick="UI.renderItemShop(G)">返回列表</button>`;
        html += '</div>';
        this.setButtons(html);
    },

    _getItemDesc(item) {
        // 优先使用 ITEM_DEFS 中定义的描述
        if (item && item.description) return item.description;
        return "特殊道具，效果未知。";
    },

    // ========== 御敌策略商店 ==========
    renderStrategyShop(game) {
        this.hideTrainStatus();
        this.clearText();
        this.appendText(`【御敌策略】\n`, "accent");
        this.appendText(`持有金钱: ${game.money}G`);
        this.appendText(`点击策略查看详情并购买。已购买的策略会在勇者探索地下城时自动触发。`);
        this.appendDivider();

        // 显示已拥有的策略
        if (game.strategies.length > 0) {
            this.appendText(`已配置策略:`, "info");
            for (const sid of game.strategies) {
                const def = STRATEGY_DEFS[sid];
                if (def) this.appendText(`  ${def.icon} ${def.name}`);
            }
            this.appendDivider();
        }

        this.clearButtons();
        let html = '<div class="btn-grid">';
        for (const [id, def] of Object.entries(STRATEGY_DEFS)) {
            const sid = parseInt(id);
            const owned = game.strategies.includes(sid);
            if (owned) {
                html += `<button class="game-btn" style="opacity:0.6;cursor:default;text-align:left;" onclick="UI.showToast('已拥有该策略','info')">`;
                html += `<div style="font-weight:bold;">✅ ${def.icon} ${def.name}</div>`;
                html += `<div style="font-size:0.72rem;color:var(--text-dim);">${def.description}</div>`;
                html += `</button>`;
                continue;
            }
            const check = game.canBuyStrategy(sid);
            const afford = game.money >= def.price;
            const canBuy = check.ok && afford;
            html += `<button class="game-btn ${canBuy?'':'danger'}" onclick="UI.showStrategyDetail(G,${sid})" style="text-align:left;">`;
            html += `<div style="font-weight:bold;">${def.icon} ${def.name}</div>`;
            html += `<div style="font-size:0.75rem;">${def.price}G</div>`;
            html += `</button>`;
        }
        html += '</div>';
        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回</button>` + html);
    },

    showStrategyDetail(game, sid) {
        const def = STRATEGY_DEFS[sid];
        if (!def) return;
        const check = game.canBuyStrategy(sid);
        const afford = game.money >= def.price;
        const canBuy = check.ok && afford;

        this.clearText();
        this.appendText(`【策略详情】\n`, "accent");
        this.appendText(`━━━━━━━━━━━━━━━━━━━━━━━━`);
        this.appendText(`${def.icon} ${def.name}`, "accent");
        this.appendText(`价格: ${def.price}G`);
        this.appendText(`━━━━━━━━━━━━━━━━━━━━━━━━`);
        this.appendText(`效果: ${def.effectDesc || '效果未知'}`, "success");
        this.appendDivider();
        this.appendText(`描述:`);
        this.appendText(def.description);
        this.appendDivider();
        this.appendText(`触发条件:`);
        if (def.unlockFacilityLv) {
            for (const [fid, minLv] of Object.entries(def.unlockFacilityLv)) {
                const fdef = FACILITY_DEFS[fid];
                const curLv = game.getFacilityLevel(parseInt(fid));
                const ok = curLv >= minLv;
                this.appendText(`  ${ok?'✅':'❌'} 需要【${fdef?.name || '设施'}】Lv.${minLv} (当前Lv.${curLv})`);
            }
        } else {
            this.appendText(`  无特殊解锁条件`);
        }

        this.clearButtons();
        let html = '<div class="btn-grid">';
        if (canBuy) {
            html += `<button class="game-btn accent" onclick="G.buyStrategy(${sid})">💰 购买</button>`;
        } else {
            html += `<button class="game-btn danger" disabled>${check.reason || '无法购买'}</button>`;
        }
        html += `<button class="game-btn" onclick="UI.renderStrategyShop(G)">返回列表</button>`;
        html += '</div>';
        this.setButtons(html);
    },

    // ========== 设施建造 ==========
    // ========== 神秘升级 ==========
    renderMysteryUpgrade(game) {
        this.hideTrainStatus();
        this.clearText();
        this.appendText(`【神秘升级】\n`, "accent");
        this.appendText(`持有金钱: ${game.money}G`);
        this.appendText(`升级设施以解锁强大的子功能。`);
        this.appendDivider();

        this.clearButtons();
        let html = '<div class="btn-grid">';

        // 两个设施（监狱已移除）
        for (const fid of [3, 8]) {
            const def = FACILITY_DEFS[fid];
            if (!def) continue;
            const curLv = game.getFacilityLevel(fid);
            const maxed = curLv >= def.maxLv;
            const check = game.canBuildFacility(fid);

            html += `<button class="game-btn ${maxed?'':(check.ok?'accent':'')}" onclick="${maxed?'':`if(G.buildFacility(${fid})){UI.renderMysteryUpgrade(G);}`}" style="text-align:left;">`;
            html += `<div style="font-weight:bold;">${def.icon} ${def.name} Lv.${curLv}/${def.maxLv}</div>`;
            if (!maxed) {
                html += `<div style="font-size:0.72rem;color:var(--text-dim);">${def.description}</div>`;
                html += `<div style="font-size:0.72rem;">升级费用: ${check.cost || def.cost[curLv]}G | 下一级: ${def.effects[curLv] || '---'}</div>`;
                if (!check.ok) html += `<div style="font-size:0.7rem;color:var(--danger);">${check.reason}</div>`;
            } else {
                html += `<div style="font-size:0.72rem;color:var(--success);">已满级 ✓</div>`;
            }
            html += `</button>`;
        }

        // 已解锁的功能入口
        const bodyLv = game.getFacilityLevel(3);
        const magicLv = game.getFacilityLevel(8);

        if (bodyLv >= 1 || magicLv >= 1) {
            html += `<div style="grid-column:1/-1;font-size:0.78rem;color:var(--accent);margin-top:6px;padding-left:4px;font-weight:600;">🔓 已解锁功能</div>`;
        }

        if (bodyLv >= 1) {
            html += `<button class="game-btn" onclick="UI.renderBodyModification(G)" style="text-align:left;">`;
            html += `<div style="font-weight:bold;">🔬 肉体改造</div>`;
            html += `<div style="font-size:0.72rem;color:var(--text-dim);">对奴隶进行肉体改造，解锁特殊Play</div>`;
            html += `</button>`;
        }

        if (magicLv >= 1) {
            html += `<button class="game-btn" onclick="UI.renderMagicResearch(G)" style="text-align:left;">`;
            html += `<div style="font-weight:bold;">🔮 魔法研究</div>`;
            html += `<div style="font-size:0.72rem;color:var(--text-dim);">查看已解锁的御敌策略与魔法</div>`;
            html += `</button>`;
        }

        html += '</div>';
        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回</button>` + html);
    },

    // ========== 肉体改造子菜单 ==========
    renderBodyModification(game) {
        this.hideTrainStatus();
        this.clearText();
        this.appendText(`【肉体改造】\n`, "accent");
        const lv = game.getFacilityLevel(3);
        this.appendText(`肉体改造室 Lv.${lv}`);
        this.appendDivider();
        this.appendText(`已解锁的改造类型:`);
        const def = FACILITY_DEFS[3];
        for (let i = 0; i < lv; i++) {
            this.appendText(`  Lv.${i+1}: ${def.effects[i]}`, "success");
        }
        this.appendDivider();
        this.appendText(`选择奴隶执行改造（将在调教中体现效果）:`);

        this.clearButtons();
        let listHtml = '<div style="line-height:normal;">';
        let hasAny = false;
        for (let i = 0; i < game.characters.length; i++) {
            if (i === game.master) continue;
            hasAny = true;
            const c = game.getChara(i);
            listHtml += `<button class="game-btn" onclick="UI.showToast('${c.name} 已接受肉体改造','success')" style="margin-bottom:6px;width:100%;text-align:left;">`;
            listHtml += `<div style="font-weight:bold;">${c.name}</div>`;
            listHtml += `<div style="font-size:0.72rem;color:var(--text-dim);">Lv.${c.level}</div>`;
            listHtml += `</button>`;
        }
        if (!hasAny) {
            listHtml += `<div style="color:var(--text-dim);text-align:center;padding:12px;">没有可改造的奴隶</div>`;
        }
        listHtml += '</div>';
        this.textArea.innerHTML += listHtml;
        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回</button>`);
    },

    // ========== 魔法研究子菜单 ==========
    renderMagicResearch(game) {
        this.hideTrainStatus();
        this.clearText();
        this.appendText(`【魔法研究】\n`, "accent");
        const lv = game.getFacilityLevel(8);
        this.appendText(`魔法研究所 Lv.${lv}`);
        this.appendDivider();
        this.appendText(`已研究完成的策略:`);
        if (game.strategies.length === 0) {
            this.appendText(`  暂无已配置策略`, "dim");
        } else {
            for (const sid of game.strategies) {
                const sdef = STRATEGY_DEFS[sid];
                if (sdef) this.appendText(`  ${sdef.icon} ${sdef.name} - ${sdef.effectDesc || ''}`, "success");
            }
        }
        this.appendDivider();
        this.appendText(`当前可解锁策略:`);
        const def = FACILITY_DEFS[8];
        if (def && def.unlockStrategies) {
            for (let i = 1; i <= lv; i++) {
                const list = def.unlockStrategies[i] || [];
                for (const sid of list) {
                    const sdef = STRATEGY_DEFS[sid];
                    if (!sdef) continue;
                    const owned = game.strategies.includes(sid);
                    const icon = owned ? '✅' : '🔒';
                    const color = owned ? 'success' : 'dim';
                    this.appendText(`  ${icon} ${sdef.icon} ${sdef.name} - ${sdef.price}G`, color);
                }
            }
        }
        this.appendText(`\n（策略可在商店中购买配置）`, "dim");

        this.clearButtons();
        let html = '<div class="btn-grid">';
        html += '</div>';
        this.setButtons(`<button class="back-btn-top" onclick="UI.renderMysteryUpgrade(G)">← 返回神秘升级</button>` + html);
    },

    // ========== 监狱子菜单 ==========
    renderPrison(game) {
        this.hideTrainStatus();
        this.clearText();
        this.appendText(`【俘虏管理】\n`, "accent");
        this.appendText(`俘虏: ${game.prisoners.length}人`);
        this.appendDivider();
        this.appendText(`俘虏列表:`);
        if (game.prisoners.length === 0) {
            this.appendText(`  暂无俘虏勇者`, "dim");
        } else {
            for (const p of game.prisoners) {
                const days = game.day - (p.cflag[601] || game.day);
                const gender = p.talent[122] ? '♂' : '♀';
                this.appendText(`  🗡️ ${gender}${p.name} Lv.${p.level} | 被俘${days}天 | HP:${p.hp}/${p.maxHp}`, "warning");
            }
        }

        this.clearButtons();
        let listHtml = '<div style="line-height:normal;">';

        // 对每个俘虏显示操作按钮
        if (game.prisoners.length > 0) {
            listHtml += `<div style="font-size:0.78rem;color:var(--accent);margin:8px 0 4px;font-weight:600;">🔓 俘虏操作</div>`;
            for (let i = 0; i < game.prisoners.length; i++) {
                const p = game.prisoners[i];
                listHtml += `<div style="display:flex;gap:6px;align-items:stretch;margin-bottom:6px;">`;
                listHtml += `<div style="flex:1;padding:7px 10px;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;display:flex;align-items:center;justify-content:space-between;min-height:40px;">`;
                listHtml += `<span><strong>${p.name}</strong> <span style="color:var(--text-dim);font-size:0.75rem;">Lv.${p.level}</span></span>`;
                listHtml += `</div>`;
                listHtml += `<button class="game-btn" style="min-width:70px;" onclick="UI.renderGearOperations(G,${i},'prisoner')">🎒 物品</button>`;
                listHtml += `<button class="game-btn danger" style="min-width:70px;" onclick="UI.interrogatePrisoner(G,${i})">🔥 拷问</button>`;
                listHtml += `<button class="game-btn accent" style="min-width:70px;" onclick="UI.brainwashPrisoner(G,${i})">🧠 洗脑</button>`;
                listHtml += `<button class="game-btn" style="min-width:70px;" onclick="UI.releasePrisoner(G,${i})">🚪 释放</button>`;
                listHtml += `</div>`;
            }
        }

        listHtml += '</div>';
        this.textArea.innerHTML += listHtml;
        this.setButtons(`<button class="back-btn-top" onclick="UI.renderMysteryUpgrade(G)">← 返回神秘升级</button>`);
    },

    // 拷问俘虏
    interrogatePrisoner(game, index) {
        const p = game.prisoners[index];
        if (!p) return;
        // 拷问效果：HP-10%，尝试投降判定
        p.hp = Math.max(1, Math.floor(p.hp * 0.9));
        const result = game._trySurrender(p);
        if (result.success) {
            // 投降，转化为奴隶
            const hero = game.prisoners.splice(index, 1)[0];
            game._convertHeroToSlave(hero);
        } else {
            UI.showToast(`${p.name} 经受住了拷问...`, 'warning');
        }
        this.renderPrison(game);
    },

    // 洗脑俘虏（监狱Lv3解锁）
    brainwashPrisoner(game, index) {
        const p = game.prisoners[index];
        if (!p) return;
        // 洗脑直接成功
        const hero = game.prisoners.splice(index, 1)[0];
        hero.mark[0] = 3;
        hero.addExp(81, 3); // 洗脑经验+3
        game._convertHeroToSlave(hero);
        UI.showToast(`${hero.name}被彻底洗脑，洗脑经验+3`, 'accent');
        this.renderPrison(game);
    },

    // 释放俘虏
    releasePrisoner(game, index) {
        const p = game.prisoners[index];
        if (!p) return;
        game.prisoners.splice(index, 1);
        UI.showToast(`释放了 ${p.name}`, 'info');
        this.renderPrison(game);
    },

    // ========== 奴隶任务批量分配 ==========
    renderSlaveTaskAssignmentList(game) {
        this.hideTrainStatus();
        this.clearText();
        this.appendText(`【任务分配中心】\n`, "accent");
        this.appendText(`为魔王和前勇者奴隶分配地下城任务。`);
        this.appendText(`⚔️ 讨伐勇者：反向移动，途中遇勇者战斗并俘虏。`);
        this.appendText(`🎭 潜伏：消耗勇者MP使其屈服投降。`);
        this.appendText(`🔥 袭击城镇：直接对战随机勇者，胜利获得奴隶+金币。`);
        this.appendDivider();

        // 收集可分配任务的角色
        const taskers = [];
        // 魔王
        const master = game.getMaster();
        if (master) {
            taskers.push({ index: game.master, chara: master, isMaster: true, typeIcon: '👑' });
        }
        // 可分配任务的陷落角色（魔王 + 前勇者 + 所有已陷落）
        for (let i = 0; i < game.characters.length; i++) {
            if (i === game.master) continue;
            const c = game.getChara(i);
            if (game.canAssignTask(c)) {
                const icon = c.talent[200] ? '🛡️' : '💖';
                taskers.push({ index: i, chara: c, isMaster: false, typeIcon: icon });
            }
        }

        const onTask = taskers.filter(t => (t.chara.cflag[985] || 0) !== 0);
        const idle = taskers.filter(t => (t.chara.cflag[985] || 0) === 0);

        if (onTask.length > 0) {
            this.appendText(`📋 正在执行任务：`, "success");
            for (const t of onTask) {
                const c = t.chara;
                const taskType = c.cflag[985];
                const taskDef = SLAVE_TASK_DEFS[taskType];
                const currentFloor = c.cflag[987] || c.cflag[986] || '?';
                const progress = c.cflag[990] || 0;
                this.appendText(`  ${t.typeIcon} ${c.name} Lv.${c.level} | ${taskDef ? taskDef.icon : ''} ${taskDef ? taskDef.name : ''} | 第${currentFloor}层 ${progress}%`, "success");
            }
            this.appendDivider();
        }

        if (idle.length > 0) {
            this.appendText(`👤 可分配任务：`, "info");
            for (const t of idle) {
                const c = t.chara;
                this.appendText(`  ${t.typeIcon} ${c.name} Lv.${c.level} | HP:${c.hp}/${c.maxHp}`, "info");
            }
        } else if (onTask.length === 0) {
            this.appendText(`没有可分配任务的角色。`, "dim");
            this.appendText(`俘虏勇者并使其投降后，即可获得前勇者奴隶。`, "dim");
        }

        this.clearButtons();
        let listHtml = '<div style="line-height:normal;">';

        // 正在执行任务的：显示取消按钮
        for (const t of onTask) {
            const c = t.chara;
            const taskType = c.cflag[985];
            const taskDef = SLAVE_TASK_DEFS[taskType];
            const currentFloor = c.cflag[987] || c.cflag[986] || '?';
            const progress = c.cflag[990] || 0;
            listHtml += `<div style="display:flex;gap:6px;align-items:stretch;margin-bottom:8px;">`;
            listHtml += `<div style="flex:1;padding:8px 10px;background:var(--bg-card);border:1px solid var(--accent);border-radius:6px;display:flex;align-items:center;justify-content:space-between;min-height:40px;">`;
            listHtml += `<span><span style="font-size:0.9rem;">${t.typeIcon}</span> <strong>${c.name}</strong> <span style="color:var(--text-dim);font-size:0.75rem;">Lv.${c.level}</span></span>`;
            listHtml += `<span style="color:var(--accent);font-size:0.75rem;">${taskDef ? taskDef.icon : ''} ${taskDef ? taskDef.name : ''} · 第${currentFloor}层 ${progress}%</span>`;
            listHtml += `</div>`;
            listHtml += `<button class="game-btn" style="min-width:80px;" onclick="G.clearSlaveTask(G.getChara(${t.index})); UI.renderSlaveTaskAssignmentList(G)">❌ 取消</button>`;
            listHtml += `</div>`;
        }

        // 空闲的：显示任务分配按钮
        for (const t of idle) {
            const c = t.chara;
            listHtml += `<div style="display:flex;gap:6px;align-items:stretch;margin-bottom:8px;">`;
            listHtml += `<div style="flex:1;padding:8px 10px;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;display:flex;align-items:center;justify-content:space-between;min-height:40px;">`;
            listHtml += `<span><span style="font-size:0.9rem;">${t.typeIcon}</span> <strong>${c.name}</strong> <span style="color:var(--text-dim);font-size:0.75rem;">Lv.${c.level}</span></span>`;
            listHtml += `<span style="color:var(--text-dim);font-size:0.75rem;">HP:${c.hp}/${c.maxHp}</span>`;
            listHtml += `</div>`;
            // 魔王只能讨伐；奴隶可以讨伐/潜伏/袭击
            if (t.isMaster) {
                listHtml += `<button class="game-btn accent" style="min-width:80px;" onclick="UI.showFloorSelectForTask(G,${t.index},1)">⚔️ 出击</button>`;
            } else {
                listHtml += `<button class="game-btn accent" style="min-width:80px;" onclick="UI.showFloorSelectForTask(G,${t.index},1)">⚔️ 讨伐</button>`;
                listHtml += `<button class="game-btn" style="min-width:80px;" onclick="UI.showFloorSelectForTask(G,${t.index},2)">🎭 潜伏</button>`;
                listHtml += `<button class="game-btn danger" style="min-width:80px;" onclick="UI.assignTaskAndRefresh(G,${t.index},3,0)">🔥 袭击</button>`;
            }
            listHtml += `</div>`;
        }

        listHtml += '</div>';
        this.textArea.innerHTML += listHtml;
        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回</button>`);
    },

    // 弹出楼层选择（讨伐/潜伏需要选楼层）
    showFloorSelectForTask(game, index, taskType) {
        const c = game.getChara(index);
        if (!c) return;
        const def = SLAVE_TASK_DEFS[taskType];
        if (!def) return;
        let html = '<div style="display:flex;flex-direction:column;gap:8px;align-items:center;padding:10px;">';
        html += `<div style="font-weight:bold;margin-bottom:4px;">${def.icon} ${def.name} — 选择出发楼层</div>`;
        html += `<div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:8px;">${def.desc}</div>`;
        html += '<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">';
        for (let f = 1; f <= 10; f++) {
            html += `<button class="game-btn" style="min-width:50px;" onclick="UI.assignTaskAndRefresh(G,${index},${taskType},${f})">第${f}层</button>`;
        }
        html += '</div>';
        html += '</div>';
        this.showModal(`${def.icon} ${def.name}`, html);
    },

    assignTaskAndRefresh(game, index, taskType, floor) {
        const c = game.getChara(index);
        if (!c) return;
        const def = SLAVE_TASK_DEFS[taskType];
        if (!def) return;

        if ((c.cflag[985] || 0) !== 0) {
            UI.showToast('该角色已有任务进行中', 'warning');
            return;
        }

        const result = game.assignSlaveTask(c, taskType, floor);
        if (result && result.success) {
            UI.closeModal();
            UI.showToast(result.msg, 'success');
            UI.renderSlaveTaskAssignmentList(game);
        } else {
            UI.showToast(result ? result.msg : '任务分配失败', 'warning');
        }
    },

    // ========== 勇者/俘虏状态概览 ==========
    _renderHeroStatusHtml(game) {
        let html = '';
        // 监狱俘虏
        if (game.prisoners.length > 0) {
            html += '<div style="margin: 4px 0; border: 1px solid var(--border); border-radius: 8px; padding: 6px 8px; background: rgba(0,0,0,0.12); line-height: 1.5;">';
            html += '<div style="font-weight:bold; font-size:0.82rem; margin-bottom:4px; color:var(--warning);">⛓️ 监狱俘虏</div>';
            for (const p of game.prisoners) {
                const days = game.day - (p.cflag[601] || game.day);
                html += `<div style="font-size:0.75rem; margin:2px 0; padding:2px 4px; border-left:2px solid var(--warning);">`;
                html += `<span style="color:var(--warning);">⛓️ ${p.name} Lv.${p.level}</span><br/>`;
                html += `<span style="color:var(--text-dim);">被俘${days}天 | HP:${p.hp}/${p.maxHp}</span>`;
                html += `</div>`;
            }
            html += '</div>';
        }
        return html;
    },

    // ========== 事件日志显示 ==========
    _renderEventLogHtml(game) {
        if (!game._dayEventLog || game._dayEventLog.length === 0) return '';
        const today = game._dayEventLog[0];
        if (!today || today.day !== game.day) return '';

        let html = '<div style="margin: 4px 0; border: 1px solid var(--border); border-radius: 8px; padding: 6px 8px; background: rgba(0,0,0,0.12); line-height: 1.5;">';
        html += '<div style="font-weight:bold; font-size:0.82rem; margin-bottom:4px;">🗡️ 勇者动态</div>';
        for (const evt of today.events) {
            const color = evt.type === 'daily' ? 'var(--info)' : 'var(--danger)';
            const icon = evt.type === 'daily' ? '🏰' : '🗡️';
            html += `<div style="font-size:0.75rem; margin:2px 0; padding:2px 4px; border-left:2px solid ${color};">`;
            html += `<span style="color:${color};">${icon} ${evt.title}</span><br/>`;
            html += `<span style="color:var(--text-dim);">${evt.text}</span>`;
            html += `</div>`;
        }
        html += '</div>';
        return html;
    },

    // ========== 主界面地下城概览 ==========
    _renderDungeonOverviewHtml(game) {
        let html = '<div style="margin: 4px 0; border: 1px solid var(--border); border-radius: 8px; padding: 6px 8px; background: rgba(0,0,0,0.15); line-height: 1.4;">';

        // 收集每层勇者
        const floorHeroes = {};
        for (const h of game.invaders) {
            const f = game.getHeroFloor(h);
            const p = game.getHeroProgress(h);
            if (!floorHeroes[f]) floorHeroes[f] = [];
            floorHeroes[f].push({ name: h.name, progress: p, hp: h.hp, maxHp: h.maxHp });
        }

        for (let fid = 1; fid <= 10; fid++) {
            const def = DUNGEON_FLOOR_DEFS[fid];
            const lv = game.getFloorLevel(fid);
            const heroes = floorHeroes[fid] || [];

            // 进度条：勇者路径 + 勇者标记 + 设施图标 + 宝箱/Boss图标 + 魔王/奴隶反向移动标识
            let progressHtml = '';

            // 魔王/奴隶反向移动标识
            const taskers = [];
            for (let ci = 0; ci < game.characters.length; ci++) {
                const c = game.characters[ci];
                if ((c.cflag[985] || 0) === 0) continue;
                const taskFloor = c.cflag[987] || c.cflag[986] || 10;
                if (taskFloor === fid) {
                    const progress = c.cflag[990] || 0;
                    const isMaster = game.getMaster() === c;
                    const taskType = c.cflag[985] || 0;
                    let icon = '⚔️';
                    let color = '#4488ff';
                    let label = '讨伐';
                    if (isMaster) { icon = '👑'; color = '#aa44ff'; label = '魔王出击'; }
                    else if (taskType === 2) { icon = '🎭'; color = '#44ff88'; label = '潜伏'; }
                    else if (taskType === 3) { icon = '🔥'; color = '#ff8844'; label = '袭击'; }
                    taskers.push({ name: c.name, progress, icon, color, label });
                }
            }
            for (const t of taskers) {
                const pct = Math.min(100, Math.max(0, t.progress));
                const rgb = t.color.replace('#', '');
                const r = parseInt(rgb.substring(0,2), 16);
                const g = parseInt(rgb.substring(2,4), 16);
                const b = parseInt(rgb.substring(4,6), 16);
                // 反向移动路径（半透明填充，从当前位置到100%）
                progressHtml += `<div style="position:absolute; left:${pct}%; top:0; height:100%; width:${100 - pct}%; background:linear-gradient(90deg, rgba(${r},${g},${b},0.25), rgba(${r},${g},${b},0.55)); border-radius:6px; pointer-events:none;"></div>`;
                // 反向移动图标
                progressHtml += `<div title="${t.label}: ${t.name} 进度:${pct}%" style="position:absolute; left:${pct}%; top:50%; transform:translate(-50%,-50%); z-index:4; font-size:0.72rem; filter:drop-shadow(0 0 3px ${t.color}); pointer-events:none;">${t.icon}</div>`;
            }
            // 设施图标
            if (typeof FLOOR_FACILITY_DEFS !== 'undefined') {
                const facs = [
                    { def: FLOOR_FACILITY_DEFS.shop, color: '#44ff44' },
                    { def: FLOOR_FACILITY_DEFS.spring, color: '#4488ff' },
                    { def: FLOOR_FACILITY_DEFS.arena, color: '#ff4444' }
                ];
                for (const fac of facs) {
                    if (fac.def && fac.def.floors.includes(fid)) {
                        const fp = fac.def.progress;
                        progressHtml += `<div title="${fac.def.name}" style="position:absolute; left:${fp}%; top:50%; transform:translate(-50%,-50%); z-index:2; font-size:0.6rem; filter:drop-shadow(0 0 2px ${fac.color}); pointer-events:none;">${fac.def.icon}</div>`;
                    }
                }
            }
            // 进度宝箱图标（25%/50%/75%）+ Boss图标（100%）
            const chestState = G && G._floorChestState ? G._floorChestState[fid] : null;
            const chestTimers = [
                { pct: 25, bit: 1, icon: '💎', label: '高级宝箱' },
                { pct: 50, bit: 2, icon: '💎', label: '高级宝箱' },
                { pct: 75, bit: 4, icon: '💎', label: '高级宝箱' }
            ];
            for (const ct of chestTimers) {
                const taken = chestState && (chestState.takenMask & ct.bit) !== 0;
                const color = taken ? 'var(--text-dim)' : '#44ff88';
                const opacity = taken ? '0.4' : '1';
                const title = taken ? `${ct.label}(已被获取，${chestState.refreshDay - (G ? G.day : 0)}天后刷新)` : `${ct.label}(可获取)`;
                progressHtml += `<div title="${title}" style="position:absolute; left:${ct.pct}%; top:50%; transform:translate(-50%,-50%); z-index:2; font-size:0.55rem; color:${color}; opacity:${opacity}; pointer-events:none;">${taken ? '✓' : ct.icon}</div>`;
            }
            // Boss/传说宝箱（100%，始终可获取）
            progressHtml += `<div title="关底Boss" style="position:absolute; left:95%; top:50%; transform:translate(-50%,-50%); z-index:2; font-size:0.6rem; filter:drop-shadow(0 0 2px #ff4444); pointer-events:none;">👹</div>`;
            if (heroes.length > 0) {
                for (const h of heroes) {
                    const pct = Math.min(100, Math.max(0, h.progress));
                    // 勇者走过的路径（金色半透明填充）
                    progressHtml += `<div style="position:absolute; left:0; top:0; height:100%; width:${pct}%; background:linear-gradient(90deg, rgba(212,175,55,0.25), rgba(212,175,55,0.55)); border-radius:6px; pointer-events:none;"></div>`;
                    // 勇者图标（更大更明显）
                    progressHtml += `<div title="${h.name} HP:${h.hp}/${h.maxHp} 进度:${pct}%" style="position:absolute; left:${pct}%; top:50%; transform:translate(-50%,-50%); z-index:3; font-size:0.72rem; filter:drop-shadow(0 0 3px #d4af37); pointer-events:none;">🗡️</div>`;
                }
            }

            const upNames = lv > 0 ? def.upgrades.slice(0, lv).map(u => u.name).join('·') : '';

            html += `<div onclick="UI.showFloorDetail(G, ${fid})" style="display:flex; align-items:center; flex-wrap:nowrap; gap:4px; margin:2px 0; padding:3px 5px; cursor:pointer; border-radius:5px; transition:background 0.2s; font-size:0.78rem; white-space:nowrap;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='transparent'">`;
            html += `<span style="font-size:0.85rem; flex-shrink:0;">${def.icon}</span>`;
            html += `<span style="min-width:55px; flex-shrink:0; font-weight:500;">${def.name}</span>`;
            html += `<span style="width:36px; font-size:0.7rem; color:var(--text-dim); flex-shrink:0;">Lv.${lv}</span>`;
            // 进度条容器（高度加大到12px，更醒目）
            html += `<div style="flex:1; min-width:40px; height:12px; background:var(--hp-bg); border-radius:6px; position:relative; overflow:hidden; flex-shrink:0;">`;
            html += progressHtml;
            html += `</div>`;
            if (upNames) {
                html += `<span style="width:50px; font-size:0.6rem; color:var(--success); text-align:right; flex-shrink:0; overflow:hidden; text-overflow:ellipsis;">${upNames}</span>`;
            } else {
                html += `<span style="width:50px; font-size:0.6rem; color:var(--text-dim); text-align:right; flex-shrink:0;">无升级</span>`;
            }
            html += `</div>`;
        }

        html += '</div>';
        return html;
    },

    // ========== 单层详情+升级 ==========
    showFloorDetail(game, fid) {
        const def = DUNGEON_FLOOR_DEFS[fid];
        if (!def) return;

        this.hideTrainStatus();
        this.clearText();
        this.appendText(`【${def.icon} ${def.name}】\n`, "accent");
        this.appendText(`${def.description}`);
        this.appendDivider();

        const curLv = game.getFloorLevel(fid);
        this.appendText(`当前等级: Lv.${curLv}/3`);

        // 显示已激活的升级效果
        if (curLv > 0) {
            this.appendText(`已激活效果:`, "info");
            for (let i = 0; i < curLv; i++) {
                const up = def.upgrades[i];
                this.appendText(`  ✅ ${up.name}: ${up.description}`);
            }
        }

        // 显示下一级升级
        if (curLv < 3) {
            this.appendDivider();
            const up = def.upgrades[curLv];
            const check = game.canUpgradeFloor(fid);
            this.appendText(`下一级: ${up.name}`, "accent");
            this.appendText(`效果: ${up.description}`);
            this.appendText(`费用: ${check.cost || def.upgradeCost[curLv]}G`);
            if (!check.ok) this.appendText(`❌ ${check.reason}`, "danger");
        } else {
            this.appendText(`已满级 ✓`, "success");
        }

        // 该层当前勇者
        const heroesHere = game.invaders.filter(h => game.getHeroFloor(h) === fid);
        if (heroesHere.length > 0) {
            this.appendDivider();
            this.appendText(`【当前入侵者】`, "danger");
            for (const h of heroesHere) {
                const p = game.getHeroProgress(h);
                this.appendText(`  🗡️ ${h.name} Lv.${h.level} | 进度: ${p}% | HP:${h.hp}/${h.maxHp}`);
            }
        }

        this.clearButtons();
        let html = '<div class="btn-grid">';
        if (curLv < 3) {
            const check = game.canUpgradeFloor(fid);
            if (check.ok) {
                html += `<button class="game-btn accent" onclick="G.upgradeFloor(${fid}); UI.showFloorDetail(G,${fid})">🔨 升级 (${check.cost}G)</button>`;
            } else {
                html += `<button class="game-btn danger" disabled>${check.reason || '无法升级'}</button>`;
            }
        }
        if (game.invaders.length > 0 && heroesHere.length > 0) {
            html += `<button class="game-btn danger" onclick="UI.appendText('战斗系统开发中...','warning')">⚔️ 迎击勇者</button>`;
        }
        html += '</div>';
        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回</button>` + html);
    },

    // ========== 地下城层升级（批量界面，保留但返回主界面） ==========
    renderFloorUpgrade(game) {
        this.hideTrainStatus();
        this.clearText();
        this.appendText(`【地下城层升级】\n`, "accent");
        this.appendText(`持有金钱: ${game.money}G`);
        this.appendDivider();

        this.clearButtons();
        let html = '<div class="btn-grid">';

        for (let fid = 1; fid <= 10; fid++) {
            const def = DUNGEON_FLOOR_DEFS[fid];
            const curLv = game.getFloorLevel(fid);

            const maxed = curLv >= 3;
            const check = game.canUpgradeFloor(fid);

            html += `<button class="game-btn ${maxed?'':(check.ok?'accent':'')}" onclick="${maxed?'':`G.upgradeFloor(${fid})`}" style="text-align:left;">`;
            html += `<div style="font-weight:bold;">${def.icon} ${def.name} Lv.${curLv}/3</div>`;
            html += `<div style="font-size:0.72rem;color:var(--text-dim);">${def.description}</div>`;

            if (!maxed) {
                const up = def.upgrades[curLv];
                html += `<div style="font-size:0.72rem;">下一级: ${up.name} (${up.description})</div>`;
                html += `<div style="font-size:0.72rem;">费用: ${check.cost || def.upgradeCost[curLv]}G</div>`;
                if (!check.ok) html += `<div style="font-size:0.7rem;color:var(--danger);">${check.reason}</div>`;
            } else {
                html += `<div style="font-size:0.72rem;color:var(--success);">已满级</div>`;
                const ups = def.upgrades.map(u => u.name).join(" / ");
                html += `<div style="font-size:0.7rem;color:var(--text-dim);">${ups}</div>`;
            }
            html += `</button>`;
        }

        html += '</div>';
        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回主界面</button>` + html);
    },

    // ========== 奴隶市场 ==========
    renderSlaveMarket(game) {
        this.hideTrainStatus();
        this.clearText();
        this.appendText(`【奴隶市场】\n`, "accent");
        this.appendText(`持有金钱: ${game.money}G`);
        this.appendText(`今日可供挑选的奴隶:`);
        this.appendDivider();

        // 如果没有预生成，生成3个候选
        if (!game._slaveMarketCandidates || game._slaveMarketCandidates.length === 0) {
            game._slaveMarketCandidates = [];
            for (let i = 0; i < 3; i++) {
                const slave = CharaTemplates.createRandomSlave(1, 5 + game.day);
                const price = 800 + slave.level * 300 + RAND(400);
                game._slaveMarketCandidates.push({ slave, price });
            }
        }

        this.clearButtons();
        let html = '<div class="btn-grid">';
        for (let i = 0; i < game._slaveMarketCandidates.length; i++) {
            const { slave, price } = game._slaveMarketCandidates[i];
            const job = UI._getJobName(slave);
            const afford = game.money >= price;
            const virginMark = slave.talent[0] ? '🔹' : '';
            html += `<button class="game-btn ${afford?'':'danger'}" ${afford?'':'disabled'} onclick="UI.renderSlaveDetail(G,${i})" style="text-align:left;">`;
            html += `<div style="font-weight:bold;color:var(--accent);">${virginMark}${slave.name}</div>`;
            html += `<div style="font-size:0.75rem;color:var(--text-dim);">Lv.${slave.level} ${job} | HP${slave.hp} MP${slave.mp}</div>`;
            html += `<div style="font-size:0.75rem;">${price}G</div>`;
            html += `</button>`;
        }
        html += `<button class="game-btn" onclick="G.refreshSlaveMarket()">🔄 刷新商品 (500G)</button>`;
        html += '</div>';
        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回</button>` + html);
    },

    renderSlaveDetail(game, candidateIndex, page = 0) {
        const candidate = game._slaveMarketCandidates ? game._slaveMarketCandidates[candidateIndex] : null;
        if (!candidate) return;
        const { slave, price } = candidate;

        this.hideTrainStatus();
        this.clearText();
        this.appendText(`【奴隶详情】\n`, "accent");
        this.appendText(`持有金钱: ${game.money}G`);
        this.appendDivider();

        const job = this._getJobName(slave);
        const personality = slave.getPersonalityName ? slave.getPersonalityName() : '未知';
        const pages = ['基本信息', '能力经验', '素质背景', '装备道具'];

        let content = '';
        switch (page) {
            case 0: content = this._renderCharaPageBasic(slave, job, personality, 'market'); break;
            case 1: content = this._renderCharaPageStats(slave, 'market'); break;
            case 2: content = this._renderCharaPageTraits(slave, 'market'); break;
            case 3: content = this._renderCharaPageGear(slave, 'market'); break;
        }

        // 价格标签插入到内容顶部
        const priceTag = `<div style="text-align:center;margin-bottom:10px;"><span style="display:inline-block;padding:4px 14px;border-radius:6px;background:var(--bg-card);border:2px solid var(--accent);color:var(--accent);font-size:1.1rem;font-weight:bold;">💰 ${price}G</span></div>`;
        this.textArea.innerHTML = `<div class="chara-detail-wrap">${priceTag}${content}</div>`;

        const afford = game.money >= price;
        let btnHtml = '<div class="chara-page-tabs">';
        btnHtml += `<button class="game-btn chara-page-arrow" ${page <= 0 ? 'disabled' : ''} onclick="UI.renderSlaveDetail(G, ${candidateIndex}, ${page - 1})">◀</button>`;
        for (let i = 0; i < pages.length; i++) {
            const cls = i === page ? 'chara-page-tab active' : 'chara-page-tab';
            btnHtml += `<button class="game-btn ${cls}" onclick="UI.renderSlaveDetail(G, ${candidateIndex}, ${i})">${pages[i]}</button>`;
        }
        btnHtml += `<button class="game-btn chara-page-arrow" ${page >= pages.length - 1 ? 'disabled' : ''} onclick="UI.renderSlaveDetail(G, ${candidateIndex}, ${page + 1})">▶</button>`;
        btnHtml += '</div>';
        btnHtml += '<div class="btn-grid">';
        btnHtml += `<button class="game-btn accent" ${afford ? '' : 'disabled'} onclick="G.buyRandomSlave(${candidateIndex})">💰 ${price}G 购买</button>`;
        btnHtml += '</div>';
        this.clearButtons();
        this.setButtons(`<button class="back-btn-top" onclick="UI.renderSlaveMarket(G)">← 返回市场</button>` + btnHtml);
    },

    // ========== 存档/读档 ==========
    renderSaveLoad(game, mode) {
        this.hideTrainStatus();
        if (this.dungeonProgress) this.dungeonProgress.style.display = 'none';
        if (this.heroEventLog) this.heroEventLog.style.display = 'none';
        this.clearText();
        this.appendText(mode === 'save' ? `【存档】\n` : `【读档】\n`, "accent");
        this.clearButtons();
        let html = '<div class="btn-grid btn-grid-4">';
        for (let i = 1; i <= 8; i++) {
            const data = game.saveManager.load(i);
            if (mode === 'save') {
                html += `<button class="game-btn" onclick="G.saveGame(${i}); G.setState('SHOP')">档位${i} ${data?'[覆盖]':''}</button>`;
            } else {
                html += `<button class="game-btn ${data?'':'danger'}" ${data?'':'disabled'} onclick="G.loadGame(${i})">档位${i} ${data?'[有数据]':'[空]'}</button>`;
            }
        }
        html += '</div>';
        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回</button>` + html);
    },

    renderTalentHelp() {
        this.hideTrainStatus();
        this.clearText();
        this.appendText(`【素质帮助】\n`, "accent");
        this.appendText(`以下列出全部素质及其获取条件。调教相关素质在每次调教结束时自动判定。`);
        this.appendDivider();
        let html = '<div style="line-height:normal;">';
        html += '<div style="font-weight:bold;color:var(--accent);margin:8px 0;">📋 有获取途径的素质</div>';
        html += '<div style="font-size:0.8rem;color:var(--text-dim);margin:6px 0 2px;">性格 (10-18)</div>';
        { const def = TALENT_DEFS[10]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#10]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[11]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#11]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[12]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#12]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[13]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#13]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[14]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#14]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[15]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#15]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[16]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#16]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[17]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#17]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[18]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#18]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        html += '<div style="font-size:0.8rem;color:var(--text-dim);margin:6px 0 2px;">兴趣/性向 (20-37)</div>';
        { const def = TALENT_DEFS[20]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#20]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[21]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#21]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[22]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#22]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[23]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#23]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[24]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#24]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[25]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#25]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[26]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#26]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[27]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#27]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[28]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#28]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[30]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#30]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[31]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#31]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[32]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#32]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[33]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#33]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[34]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#34]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[35]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#35]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[36]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#36]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[37]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#37]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        html += '<div style="font-size:0.8rem;color:var(--text-dim);margin:6px 0 2px;">体质 (40-48)</div>';
        { const def = TALENT_DEFS[40]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#40]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[41]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#41]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[42]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#42]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[43]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#43]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[44]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#44]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[45]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#45]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[46]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#46]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[47]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#47]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[48]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#48]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        html += '<div style="font-size:0.8rem;color:var(--text-dim);margin:6px 0 2px;">技术 (50-55,57)</div>';
        { const def = TALENT_DEFS[50]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#50]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[51]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#51]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[52]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#52]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[53]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#53]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[54]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#54]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[55]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#55]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[57]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#57]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        html += '<div style="font-size:0.8rem;color:var(--text-dim);margin:6px 0 2px;">忠诚/献身 (60-64)</div>';
        { const def = TALENT_DEFS[60]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#60]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[61]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#61]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[62]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#62]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[63]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#63]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[64]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#64]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        html += '<div style="font-size:0.8rem;color:var(--text-dim);margin:6px 0 2px;">诚实/性癖 (69-89)</div>';
        { const def = TALENT_DEFS[69]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#69]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[70]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#70]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[71]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#71]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[72]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#72]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[73]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#73]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[79]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#79]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[80]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#80]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[81]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#81]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[82]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#82]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[83]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#83]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[84]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#84]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[85]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#85]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[86]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#86]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[87]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#87]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[88]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#88]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[89]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#89]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        html += '<div style="font-size:0.8rem;color:var(--text-dim);margin:6px 0 2px;">体型 (99-116)</div>';
        { const def = TALENT_DEFS[99]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#99]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[100]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#100]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[101]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#101]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[102]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#102]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[103]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#103]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[104]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#104]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[105]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#105]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[106]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#106]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[107]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#107]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[108]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#108]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[109]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#109]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[110]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#110]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[114]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#114]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[116]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#116]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        html += '<div style="font-size:0.8rem;color:var(--text-dim);margin:6px 0 2px;">魅力 (91-93)</div>';
        { const def = TALENT_DEFS[91]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#91]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[92]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#92]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[93]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#93]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        html += '<div style="font-size:0.8rem;color:var(--text-dim);margin:6px 0 2px;">性别/改造</div>';
        { const def = TALENT_DEFS[121]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#121]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 肉体改造 / 角色初始</span></div>'; }
        { const def = TALENT_DEFS[122]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#122]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 肉体改造 / 角色初始</span></div>'; }
        { const def = TALENT_DEFS[123]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#123]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 肉体改造 / 角色初始</span></div>'; }
        { const def = TALENT_DEFS[130]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#130]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 肉体改造 / 角色初始</span></div>'; }
        html += '<div style="font-size:0.8rem;color:var(--text-dim);margin:6px 0 2px;">亲族/特殊</div>';
        { const def = TALENT_DEFS[140]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#140]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[141]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#141]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[142]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#142]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[143]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#143]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[152]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#152]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[157]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#157]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[158]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#158]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[180]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#180]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[181]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#181]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[188]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#188]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        { const def = TALENT_DEFS[290]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#290]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机 / 调教结束自动判定</span></div>'; }
        html += '<div style="font-size:0.8rem;color:var(--text-dim);margin:6px 0 2px;">personality2 (160-179)</div>';
        { const def = TALENT_DEFS[160]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#160]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[161]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#161]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[162]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#162]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[163]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#163]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[164]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#164]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[165]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#165]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[166]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#166]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[167]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#167]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[168]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#168]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[169]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#169]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[170]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#170]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[171]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#171]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[172]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#172]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[173]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#173]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[175]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#175]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        html += '<div style="font-size:0.8rem;color:var(--text-dim);margin:6px 0 2px;">职业/技能 (200-251)</div>';
        { const def = TALENT_DEFS[200]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#200]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[201]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#201]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[202]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#202]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[203]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#203]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[204]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#204]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[205]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#205]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[206]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#206]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[207]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#207]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[208]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#208]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[209]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#209]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[210]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#210]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[240]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#240]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[241]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#241]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[242]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#242]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[243]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#243]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[244]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#244]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[245]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#245]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[246]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#246]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[247]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#247]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[248]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#248]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[249]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#249]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[250]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#250]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        { const def = TALENT_DEFS[251]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#251]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时职业绑定</span></div>'; }
        html += '<div style="font-size:0.8rem;color:var(--text-dim);margin:6px 0 2px;">元素 (275-279)</div>';
        { const def = TALENT_DEFS[275]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#275]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时极低概率</span></div>'; }
        { const def = TALENT_DEFS[276]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#276]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时极低概率</span></div>'; }
        { const def = TALENT_DEFS[277]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#277]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时极低概率</span></div>'; }
        { const def = TALENT_DEFS[278]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#278]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时极低概率</span></div>'; }
        { const def = TALENT_DEFS[279]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#279]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时极低概率</span></div>'; }
        html += '<div style="font-size:0.8rem;color:var(--text-dim);margin:6px 0 2px;">外观/背景 (300-320)</div>';
        { const def = TALENT_DEFS[300]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#300]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[301]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#301]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[302]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#302]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[303]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#303]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[304]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#304]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[305]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#305]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[306]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#306]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[307]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#307]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[308]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#308]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[309]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#309]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[310]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#310]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[311]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#311]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[314]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#314]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[315]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#315]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[316]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#316]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[317]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#317]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        { const def = TALENT_DEFS[320]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#320]</span><br/><span style="color:var(--success);font-size:0.78rem;">✓ 角色创建时随机</span></div>'; }
        html += '<div style="font-weight:bold;color:var(--accent);margin:12px 0 4px;">🔥 调教自动获取条件</div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>容易湿</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#42]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 阴道感觉Lv4</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>精液爱好</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#47]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 精液经验≥50 + 精液中毒Lv3</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>擅用舌头</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#52]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 口交经验≥50 + 口腔感觉Lv4</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>容易自慰</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#60]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 自慰经验≥30</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>接受快感</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#70]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 快乐刻印Lv2 + 欲望Lv3</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>容易上瘾</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#72]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 药物经验≥30</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>容易陷落</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#73]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 屈服刻印Lv2 + 爱情经验≥50</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>自慰狂</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#74]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 自慰经验≥100 + 自慰中毒Lv3</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>性交狂</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#75]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 性交经验≥100 + 性交中毒Lv3</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>淫乱</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#76]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 快乐刻印Lv3 + 欲望Lv5</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>尻穴狂</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#77]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 肛门经验≥100 + 肛门感觉Lv5</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>乳狂</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#78]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 胸部经验≥100 + 胸部感觉Lv5</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>变态</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#80]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 异常经验≥50</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>施虐狂</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#83]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 施虐快乐经验≥50 + 抖S气质Lv3</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>爱慕</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#85]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 屈服刻印Lv3 + 顺从Lv3 + 爱情经验≥30</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>盲信</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#86]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 爱慕+勋章经验≥5+顺从Lv4 或 淫乱+勋章经验≥10+顺从Lv5 或 重塑+勋章经验≥3+顺从Lv3</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>挚爱</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#182]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 爱慕+爱情经验≥80+顺从Lv4 或 淫乱+爱情经验≥60+顺从Lv3</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>重塑</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#183]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 崩坏+服从度Lv3+恐惧刻印Lv2+勋章经验≥5</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>被虐狂</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#88]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 被虐快乐经验≥50 + 抖M气质Lv3</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>露出狂</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#89]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 露出癖Lv3 + 露出中毒Lv2</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>淫核</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#136]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 欲望Lv5 + 兽奸经验≥50</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>同性恋</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#158]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 百合/BL经验≥20</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>娼妇</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#180]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 卖春经验≥50 + 无恐怖刻印 + 欲望Lv3</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>卖春</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#181]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 卖春经验≥100 + 已拥有娼妇</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>母性</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#188]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 生产经验≥30</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>淫核感觉上升</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#230]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 阴蒂感觉Lv5 + 调教自慰经验≥50 + 绝顶经验≥50</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>淫乳感觉上升</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#231]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 胸部感觉Lv5 + 喷乳经验≥30 + 绝顶经验≥50</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>淫壶感觉上升</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#232]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 阴道感觉Lv5 + 阴道经验≥50 + 绝顶经验≥50</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>淫肛感觉上升</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#233]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 肛门感觉Lv5 + A快乐经验≥50 + 绝顶经验≥50</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>淫魔</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#272]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 四淫感觉上升全获得</span></div>';
        html += '<div style="font-weight:bold;color:var(--danger);margin:12px 0 4px;">❌ 暂无法获取的素质</div>';
        { const def = TALENT_DEFS[1]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#1]</span><br/><span style="color:var(--danger);font-size:0.78rem;">✗ 暂无获取途径</span></div>'; }
        { const def = TALENT_DEFS[9]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#9]</span><br/><span style="color:var(--danger);font-size:0.78rem;">✗ 暂无获取途径</span></div>'; }
        { const def = TALENT_DEFS[153]; if (def) html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>' + def.name + '</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#153]</span><br/><span style="color:var(--danger);font-size:0.78rem;">✗ 暂无获取途径</span></div>'; }
        html += '</div>';
        this.textArea.innerHTML += html;
        this.clearButtons();
        this.setButtons(`<button class="back-btn-top" onclick="UI.renderConfig(G)">← 返回设定</button>`);
    },
    // ========== 设定 ==========
    // ========== 设定 ==========
    renderConfig(game) {
        this.hideTrainStatus();
        if (this.dungeonProgress) this.dungeonProgress.style.display = 'none';
        if (this.heroEventLog) this.heroEventLog.style.display = 'none';
        this.clearText();
        this.appendText(`【设定】\n`, "accent");
        this.appendDivider();

        // 勇者性别比例设定
        const ratio = game.flag[500] || 90;
        this.appendText(`勇者性别比例`, "accent");
        this.appendText(`当前: 女性 ${ratio}% | 男性 ${100 - ratio}%`);
        this.appendText(`调节后新入侵的勇者将按此比例生成。`);
        this.appendDivider();

        // 日常事件数量设定
        const dailyCount = game.flag[501] || 2;
        this.appendText(`日常事件数量`, "accent");
        this.appendText(`当前: 每天 ${dailyCount} 个事件`);
        this.appendText(`每日结束时触发的魔王城日常事件数量。`);
        this.appendDivider();

        // 日常事件触发概率设定
        const dailyRate = game.flag[502] !== undefined ? game.flag[502] : 10;
        this.appendText(`日常事件触发概率`, "accent");
        this.appendText(`当前: 单个事件触发概率 ${dailyRate}%`);
        this.appendText(`设为0%则不会触发任何日常事件，设为100%则设定数量的日常事件必定全部触发。`);
        this.appendDivider();

        this.clearButtons();
        let html = '<div class="btn-grid">';
        html += `<div style="grid-column:1/-1;font-weight:bold;color:var(--accent);">勇者性别比例</div>`;
        html += `<button class="game-btn" onclick="G.flag[500] = Math.max(0, (G.flag[500]||90) - 10); UI.renderConfig(G)">➖ 女性 -10%</button>`;
        html += `<button class="game-btn" onclick="G.flag[500] = Math.min(100, (G.flag[500]||90) + 10); UI.renderConfig(G)">➕ 女性 +10%</button>`;
        html += `<button class="game-btn" onclick="G.flag[500] = 100; UI.renderConfig(G)">全部女性</button>`;
        html += `<button class="game-btn" onclick="G.flag[500] = 0; UI.renderConfig(G)">全部男性</button>`;
        html += `<button class="game-btn" onclick="G.flag[500] = 90; UI.renderConfig(G)">恢复默认 (90%女)</button>`;
        html += `<div style="grid-column:1/-1;font-weight:bold;color:var(--accent);margin-top:4px;">日常事件数量</div>`;
        html += `<button class="game-btn" onclick="G.flag[501] = Math.max(0, (G.flag[501]||2) - 1); UI.renderConfig(G)">➖ 减少1个</button>`;
        html += `<button class="game-btn" onclick="G.flag[501] = Math.min(5, (G.flag[501]||2) + 1); UI.renderConfig(G)">➕ 增加1个</button>`;
        html += `<button class="game-btn" onclick="G.flag[501] = 2; UI.renderConfig(G)">恢复默认 (2个)</button>`;
        html += `<div style="grid-column:1/-1;font-weight:bold;color:var(--accent);margin-top:4px;">日常事件触发概率</div>`;
        html += `<button class="game-btn" onclick="G.flag[502] = Math.max(0, (G.flag[502]!==undefined?G.flag[502]:10) - 5); UI.renderConfig(G)">➖ -5%</button>`;
        html += `<button class="game-btn" onclick="G.flag[502] = Math.min(100, (G.flag[502]!==undefined?G.flag[502]:10) + 5); UI.renderConfig(G)">➕ +5%</button>`;
        html += `<button class="game-btn" onclick="G.flag[502] = 0; UI.renderConfig(G)">0% (关闭)</button>`;
        html += `<button class="game-btn" onclick="G.flag[502] = 100; UI.renderConfig(G)">100% (必触发)</button>`;
        html += `<button class="game-btn" onclick="G.flag[502] = 10; UI.renderConfig(G)">恢复默认 (10%)</button>`;
        html += '</div>';
        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回</button><button class="game-btn" style="margin-left:8px;" onclick="UI.renderTalentHelp()">📖 素质帮助</button>` + html);
    },

    // ========== 弹窗 ==========
    showModal(title, bodyHtml) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = bodyHtml;
        document.getElementById('modal-overlay').classList.remove('hidden');
    },
    closeModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
    },

    // ========== Phase2 统一队列（事件+战斗轮播） ==========
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
            this.closeModal();
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
            // 覆盖关闭按钮行为，确保点击 × 也能推进队列
            const closeBtn = document.querySelector('#modal-overlay .modal-close');
            if (closeBtn) {
                closeBtn.onclick = () => { UI.closeModal(); UI._phase2Index++; UI._showPhase2Step(); };
            }
        }
    },

    // ========== 事件弹窗队列（NSFW日常事件播报） ==========
    _eventQueue: [],
    _eventQueueIndex: 0,
    _eventQueueOnDone: null,

    showEventQueue(events, onDone) {
        if (!events || events.length === 0) {
            if (onDone) onDone();
            return;
        }
        this._eventQueue = events;
        this._eventQueueIndex = 0;
        this._eventQueueOnDone = onDone;
        this._showEventModalStep();
    },

    _formatEffectText(key, val) {
        const map = {
            mark0: `服从度`, mark1: `快乐刻印`, mark2: `屈服刻印`, mark3: `反抗刻印`, mark4: `恐怖刻印`, mark5: `淫乱刻印`, mark6: `反发刻印`, mark7: `哀伤刻印`,
            abl0: `阴蒂感觉`, abl1: `胸部感觉`, abl2: `阴道感觉`, abl3: `肛门感觉`, abl4: `口腔感觉`,
            abl10: `顺从`, abl11: `欲望`, abl12: `技巧`, abl13: `侍奉技术`, abl14: `性交技术`, abl15: `话术`, abl16: `侍奉精神`, abl17: `露出癖`,
            abl20: `抖S气质`, abl21: `抖M气质`, abl22: `百合气质`, abl23: `搞基气质`,
            abl30: `性交中毒`, abl31: `自慰中毒`, abl32: `精液中毒`, abl33: `百合中毒`, abl34: `卖春中毒`, abl35: `兽奸中毒`, abl36: `露出中毒`, abl37: `BL中毒`,
            abl100: `学习能力`, abl101: `运动能力`, abl102: `战斗能力`, abl103: `感受性`,
            hp: `HP`, mp: `气力`, maxHp: `最大HP`, maxMp: `最大气力`, exp: `调教经验`, money: `金钱`, progress: `进度`, buff: `增益`
        };
        const name = map[key] || key;
        // 处理形如 "阴蒂感觉+1" 的值
        const valStr = String(val);
        if (valStr.startsWith(`+`) || valStr.startsWith(`-`) || valStr.includes(`→`)) {
            return `${name}${valStr}`;
        }
        return `${name} ${valStr}`;
    },

    _showEventModalStep() {
        const evt = this._eventQueue[this._eventQueueIndex];
        if (!evt) {
            this.closeModal();
            if (this._eventQueueOnDone) {
                const cb = this._eventQueueOnDone;
                this._eventQueueOnDone = null;
                cb();
            }
            return;
        }
        const isLast = this._eventQueueIndex >= this._eventQueue.length - 1;
        const btnText = isLast ? `关闭` : `下一条 (${this._eventQueueIndex + 1}/${this._eventQueue.length})`;
        const btnClass = isLast ? `game-btn` : `game-btn accent`;
        const tagColor = evt.type === `daily` ? `var(--info)` : `var(--danger)`;
        const tagIcon = evt.type === `daily` ? `🏰` : `🗡️`;
        const tagLabel = evt.type === `daily` ? `日常` : `地下城`;

        let effectsHtml = ``;
        if (evt.effects && evt.effects.length > 0) {
            effectsHtml = `<div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border);font-size:0.78rem;color:var(--text-dim);">`;
            effectsHtml += `<div style="font-weight:bold;margin-bottom:4px;color:var(--success);">✨ 效果</div>`;
            for (const ef of evt.effects) {
                const parts = [];
                for (const [k, v] of Object.entries(ef)) {
                    if (k === `target`) continue;
                    parts.push(this._formatEffectText(k, v));
                }
                if (parts.length > 0) {
                    effectsHtml += `<div style="margin:2px 0;"><span style="color:var(--info);">▸ ${ef.target || `?`}</span> ${parts.join(`，`)}</div>`;
                }
            }
            effectsHtml += `</div>`;
        }

        const body = `
            <div style="text-align:center;margin-bottom:10px;">
                <span style="display:inline-block;padding:2px 8px;border-radius:4px;background:${tagColor}22;color:${tagColor};font-size:0.75rem;font-weight:bold;">${tagIcon} ${tagLabel}</span>
            </div>
            <div style="white-space:pre-wrap;line-height:1.6;font-size:0.9rem;">${evt.text || ``}</div>
            ${effectsHtml}
            <div style="display:flex;justify-content:center;margin-top:16px;gap:10px;">
                <button class="${btnClass}" onclick="UI._eventQueueIndex++; UI._showEventModalStep();">${btnText}</button>
            </div>
        `;
        this.showModal(evt.title || `事件`, body);
    },
    showConfig() { if(G) G.setState('CONFIG'); },
    showSave() { if(G) G.setState('SAVE'); },
    showLoad() { if(G) G.setState('LOAD'); },

    // ========== Toast ==========
    showToast(msg, type = 'info') {
        const box = document.getElementById('toast-box');
        const div = document.createElement('div');
        div.className = `toast-msg toast-${type}`;
        div.textContent = msg;
        box.appendChild(div);
        setTimeout(() => div.remove(), 2000);
    },

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
    }
};

// 训练状态栏已迁移到 #train-status-bar，底部覆盖代码已移除
// UI._renderTrainStatus 现在直接在对象方法中操作 DOM

