// Injects methods into the global UI object
Object.assign(UI, {
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
            const assiStamina = assi._assistantStamina !== undefined ? assi._assistantStamina : 80;
            const assiMaxStamina = assi._assistantMaxStamina || 80;
            assistantBar = `<div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:6px;padding:4px 8px;background:rgba(255,255,255,0.03);border-radius:4px;">助手: <span style="color:var(--accent);">${assi.name}</span> ${hearts ? `[${hearts}]` : ''} ${buff ? `| ${buff.type}` : ''} <span style="font-size:0.62rem;opacity:0.7;">(${assiStamina}/${assiMaxStamina})</span></div>`;
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
        if (nrgState.desc) {
            leftHtml += `<div style="font-size:0.62rem;color:${nrgState.color};margin:2px 0 4px;opacity:0.85;">${nrgState.desc}</div>`;
        }

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
        const pEff = target.getPersonalityEffects ? target.getPersonalityEffects() : { activeModes: [], uiColors: [] };
        // === NEW (P3-5): Build personality effect tooltip ===
        let pTooltip = '';
        if (pEff) {
            const modTexts = [];
            if (pEff.refuseMod) modTexts.push(`拒绝率${pEff.refuseMod > 0 ? '+' : ''}${Math.round(pEff.refuseMod * 100)}%`);
            if (pEff.staminaMod) modTexts.push(`体力${pEff.staminaMod > 0 ? '+' : ''}${Math.round(pEff.staminaMod * 100)}%`);
            if (pEff.energyMod) modTexts.push(`气力${pEff.energyMod > 0 ? '+' : ''}${Math.round(pEff.energyMod * 100)}%`);
            if (pEff.orgasmMod) modTexts.push(`绝顶${pEff.orgasmMod > 0 ? '+' : ''}${Math.round(pEff.orgasmMod * 100)}%`);
            for (const k in pEff.palamMods || {}) {
                const pid = parseInt(k);
                const pname = (typeof PALAM_DEFS !== 'undefined' && PALAM_DEFS[pid]) ? PALAM_DEFS[pid].name : 'PALAM'+pid;
                modTexts.push(`${pname}${pEff.palamMods[k] > 0 ? '+' : ''}${Math.round(pEff.palamMods[k] * 100)}%`);
            }
            if (modTexts.length > 0) pTooltip = modTexts.join(' | ');
        }
        for (let i = 0; i < (pEff.activeModes || []).length; i++) {
            const mode = pEff.activeModes[i];
            const color = (pEff.uiColors && pEff.uiColors[i]) ? pEff.uiColors[i] : '#98c379';
            tags.push({ text: mode, color: color, title: pTooltip });
        }
        // === NEW (P2-4): Special body mode tags ===
        if (target._specialMode) {
            if (target._specialMode.wet) tags.push({ text: '湿滑', color: '#61afef' });
            if (target._specialMode.milky) tags.push({ text: '泌乳', color: '#e5c07b' });
            if (target._specialMode.lewd) tags.push({ text: '淫乱', color: '#c678dd' });
        }
        for (let m = 0; m < 8; m++) {
            const lv = target.mark[m] || 0;
            if (lv > 0) tags.push({ text: `${['苦痛','快乐','屈服','反抗','恐怖','淫乱','反发','哀伤'][m]}${lv}`, color: 'var(--text-dim)' });
        }
        if (tags.length > 0) {
            leftHtml += `<div style="display:flex;flex-wrap:wrap;gap:4px;margin:4px 0;">`;
            for (const t of tags.slice(0, 6)) {
                const titleAttr = t.title ? ` title="${t.title}"` : '';
                leftHtml += `<span style="font-size:0.68rem;padding:2px 8px;background:rgba(255,255,255,0.04);border:1px solid ${t.color}44;color:${t.color};border-radius:10px;cursor:help;"${titleAttr}>${t.text}</span>`;
            }
            leftHtml += `</div>`;
        }

        // Hidden trait display
        if (target.personality && target.personality.hidden) {
            const ht = target.personality.hidden;
            const htName = ht.revealed ? (typeof HIDDEN_TRAITS !== 'undefined' && HIDDEN_TRAITS[ht.traitId] ? HIDDEN_TRAITS[ht.traitId].name : '???') : '???';
            const htColor = ht.revealed ? 'var(--accent)' : 'var(--text-dim)';
            const htProgress = ht.progress || 0;
            const progressBar = ht.full ? '' : `<div style="height:4px;background:rgba(255,255,255,0.05);border-radius:2px;margin-top:2px;overflow:hidden;"><div style="height:100%;background:${htColor};width:${htProgress}%;transition:width 0.3s;"></div></div>`;
            leftHtml += `<div style="font-size:0.7rem;color:${htColor};margin-top:4px;">隐藏特质: ${htName} ${ht.revealed ? (ht.full ? '(完全)' : '(部分)') : '(未解锁)'} ${!ht.full ? `(${htProgress}%)` : ''}</div>${progressBar}`;
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
            const modeColors = pEff.uiColors || [];
            const coloredModes = pEff.activeModes.map((m, i) => `<span style="color:${modeColors[i] || '#98c379'}">${m}</span>`);
            html += `<div style="font-size:0.75rem;color:var(--success);margin-bottom:10px;">性格修正: ${coloredModes.join(' / ')}</div>`;
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
            // === NEW (P2-5): Turn preview cost estimation ===
            let costHint = cmd.name;
            const cmdMeta = (typeof getTrainMeta === 'function') ? getTrainMeta(cmd.id) : null;
            if (cmdMeta && cmd.available) {
                const tStm = cmdMeta.staminaCost?.target || 0;
                const tNrg = cmdMeta.energyCost?.target || 0;
                const bStm = cmdMeta.staminaCost?.bystander || 0;
                const bNrg = cmdMeta.energyCost?.bystander || 0;
                let costParts = [];
                if (tStm > 0 || tNrg > 0) costParts.push(`主:体-${tStm}气-${tNrg}`);
                if (bStm > 0 || bNrg > 0) costParts.push(`副:体-${bStm}气-${bNrg}`);
                if (costParts.length > 0) costHint += `\n[${costParts.join(' | ')}]`;
            }
            cmdHtml += `<button class="game-btn" ${cmd.available ? '' : 'disabled'} onclick="G.selectCommand(${cmd.id})" title="${costHint}">${cmd.name}</button>`;
        }
        cmdHtml += '</div>';

        // === NEW (P2-5): Turn preview cost estimation ===
        const target = game.getTarget();
        const assi = game.getAssi();
        const bystander = game.bystander >= 0 ? game.characters[game.bystander] : null;
        let previewHtml = '';
        if (target && game.selectcom >= 0) {
            const meta = (typeof getTrainMeta === 'function') ? getTrainMeta(game.selectcom) : null;
            const stmCost = meta ? (meta.staminaCost?.target || 0) : 0;
            const nrgCost = meta ? (meta.energyCost?.target || 0) : 0;
            const bStmCost = meta ? (meta.staminaCost?.bystander || 0) : 0;
            const bNrgCost = meta ? (meta.energyCost?.bystander || 0) : 0;
            let previewParts = [];
            if (stmCost > 0 || nrgCost > 0) {
                previewParts.push(`<span style="color:#e06c75;">主奴:体-${stmCost} 气-${nrgCost}</span>`);
            }
            if (bystander && (bStmCost > 0 || bNrgCost > 0)) {
                previewParts.push(`<span style="color:#61afef;">副奴:体-${bStmCost} 气-${bNrgCost}</span>`);
            }
            // Assistant cost preview for 900/901
            if (assi && (game.selectcom === 900 || game.selectcom === 901)) {
                const assiStm = game.selectcom === 900 ? 15 : 10;
                const assiNrg = game.selectcom === 900 ? 5 : 3;
                previewParts.push(`<span style="color:#98c379;">助手:体-${assiStm} 气-${assiNrg}</span>`);
            }
            if (previewParts.length > 0) {
                previewHtml = `<div style="font-size:0.62rem;color:var(--text-dim);margin-bottom:4px;text-align:right;border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:4px;">上回合消耗: ${previewParts.join(' | ')}</div>`;
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

        // === NEW (P3-5): Personality & Hidden Trait Panel ===
        if (target.personality) {
            const p = target.personality;
            const mainName = (typeof MAIN_PERSONALITY !== 'undefined' && MAIN_PERSONALITY[p.main]) ? MAIN_PERSONALITY[p.main].name : '???';
            const subNames = (p.sub || []).map(sid => (typeof SUB_PERSONALITY !== 'undefined' && SUB_PERSONALITY[sid]) ? SUB_PERSONALITY[sid].name : '???');
            html += `<div style="grid-column:1/-1;font-size:0.72rem;margin-bottom:6px;padding:6px 8px;background:rgba(255,255,255,0.03);border-radius:6px;border:1px solid var(--border);">`;
            html += `<div style="margin-bottom:4px;"><span style="color:var(--accent);font-weight:bold;">性格:</span> <span style="color:var(--text);">${mainName}</span>${subNames.length > 0 ? ' <span style="color:var(--text-dim);">/ ' + subNames.join(' / ') + '</span>' : ''}</div>`;
            if (p.hidden) {
                const ht = p.hidden;
                const htDef = (typeof HIDDEN_TRAITS !== 'undefined' && HIDDEN_TRAITS[ht.traitId]) ? HIDDEN_TRAITS[ht.traitId] : null;
                const htName = ht.revealed ? (htDef ? htDef.name : '???') : '???';
                const htColor = ht.revealed ? 'var(--accent)' : 'var(--text-dim)';
                const htProgress = ht.progress || 0;
                html += `<div style="display:flex;align-items:center;gap:8px;margin-top:4px;">`;
                html += `<span style="color:${htColor};">隐藏: ${htName} ${ht.revealed ? (ht.full ? '(完全)' : '(部分)') : '(未解锁)'}</span>`;
                if (!ht.full) {
                    html += `<div style="flex:1;height:6px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden;"><div style="height:100%;background:${htColor};width:${htProgress}%;transition:width 0.3s;"></div></div>`;
                    html += `<span style="font-size:0.65rem;color:var(--text-dim);">${htProgress}%</span>`;
                }
                html += `</div>`;
            }
            html += `</div>`;
        }

        // === Route Allocation (1 main + 2 sub) ===
        const allocLabel = target.getRouteAllocationLabel ? target.getRouteAllocationLabel() : '\u672a\u5206\u914d';
        html += `<div style="grid-column:1/-1;font-size:0.75rem;margin-bottom:6px;padding:6px 8px;background:rgba(255,255,255,0.03);border-radius:6px;border:1px solid var(--border);">`;
        html += `<div style="margin-bottom:6px;font-weight:bold;color:var(--accent);">\u8def\u7ebf\u5206\u914d: <span style="color:var(--text);">${allocLabel}</span></div>`;
        html += `<div style="display:flex;gap:6px;flex-wrap:wrap;">`;
        for (let r = 0; r < 5; r++) {
            const isMain = target.mainRoute === r;
            const isSub = target.subRoutes && target.subRoutes.includes(r);
            let btnStyle = 'font-size:0.72rem;padding:4px 10px;border-radius:4px;cursor:pointer;border:1px solid ';
            if (isMain) {
                btnStyle += `${routeColors[r]};background:${routeColors[r]}22;color:${routeColors[r]};font-weight:bold;`;
            } else if (isSub) {
                btnStyle += `${routeColors[r]}88;background:${routeColors[r]}11;color:${routeColors[r]};border-style:dashed;`;
            } else {
                btnStyle += 'var(--border);background:transparent;color:var(--text-dim);';
            }
            const badge = isMain ? ' [\u4e3b]' : (isSub ? ' [\u8f85]' : '');
            html += `<button class="game-btn" style="${btnStyle}" onclick="G.clickRouteAllocation(${r})" title="${isMain ? '\u70b9\u51fb\u53d6\u6d88\u4e3b\u8def\u7ebf' : (isSub ? '\u70b9\u51fb\u53d6\u6d88\u8f85\u52a9\u8def\u7ebf' : '\u70b9\u51fb\u9009\u62e9')}">${routeNames[r]}${badge}</button>`;
        }
        html += `</div>`;
        html += `<div style="font-size:0.65rem;color:var(--text-dim);margin-top:4px;">\u4e3b\u8def\u7ebf100%\u7ecf\u9a8c\uff0c\u8f85\u52a9\u8def\u7ebf50%\uff0c\u5176\u4f59\u4e0d\u83b7\u53d6</div>`;
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
});
