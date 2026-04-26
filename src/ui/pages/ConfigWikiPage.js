// Injects methods into the global UI object
Object.assign(UI, {
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
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>精液爱好</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#47]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 精液经验≥50 + 精液成瘾Lv3</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>擅用舌头</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#52]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 口交经验≥50 + 口腔感觉Lv4</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>容易自慰</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#60]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 自慰经验≥30</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>接受快感</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#70]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 快乐刻印Lv2 + 欲望Lv3</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>容易上瘾</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#72]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 药物经验≥30</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>容易陷落</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#73]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 屈服刻印Lv2 + 爱情经验≥50</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>自慰狂</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#74]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 自慰经验≥100 + 自慰成瘾Lv3</span></div>';
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>性交狂</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#75]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 性交经验≥100 + 性交成瘾Lv3</span></div>';
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
        html += '<div style="font-size:0.85rem;margin:2px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;"><strong>露出狂</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[#89]</span><br/><span style="color:var(--warning);font-size:0.78rem;">⚡ 露出癖Lv3 + 露出成瘾Lv2</span></div>';
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
        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回</button><button class="game-btn" style="margin-left:8px;" onclick="UI.renderTalentHelp()">📖 素质帮助</button><button class="game-btn" style="margin-left:8px;" onclick="UI.renderWorldWiki()">🌍 世界百科</button><button class="game-btn" style="margin-left:8px;" onclick="window.open('worldmap.html','_blank')">🗺️ 世界地图</button>` + html);
    },
    // ========== 世界百科（Wiki）==========
    renderWorldWiki(tab) {
        tab = tab || 'overview';
        this.hideTrainStatus();
        this.clearText();
        if (this.textArea) this.textArea.style.display = 'block';
        this.appendText('【世界百科】\n', 'accent');
        this.appendText('ERA Maou EX 世界观与势力设定总览');
        this.appendDivider();

        const tabs = [
            { key: 'overview', label: '🌍 世界观总览' },
            { key: 'races', label: '👑 四大种族' },
            { key: 'kings', label: '👼 四天王' },
            { key: 'grudges', label: '⚔️ 种族恩怨' },
            { key: 'heroes', label: '🛡️ 勇者制度' },
            { key: 'classes', label: '⚔️ 职业体系' },
            { key: 'fallen', label: '🌑 堕落种族' },
            { key: 'elements', label: '🔥 元素克制' },
            { key: 'demon_classes', label: '👿 魔军职阶' }
        ];
        let nav = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">';
        for (const t of tabs) {
            const active = t.key === tab ? 'background:var(--accent);color:#fff;' : '';
            nav += '<button class="game-btn" style="font-size:0.82rem;padding:4px 8px;' + active + '" onclick="UI.renderWorldWiki(\'' + t.key + '\')">' + t.label + '</button>';
        }
        nav += '</div>';
        this.textArea.innerHTML += nav;

        let html = '<div style="line-height:normal;">';
        if (tab === 'overview') html += this._renderWikiOverview();
        else if (tab === 'races') html += this._renderWikiRaces();
        else if (tab === 'kings') html += this._renderWikiKings();
        else if (tab === 'grudges') html += this._renderWikiGrudges();
        else if (tab === 'heroes') html += this._renderWikiHeroes();
        else if (tab === 'classes') html += this._renderWikiClasses();
        else if (tab === 'fallen') html += this._renderWikiFallen();
        else if (tab === 'elements') html += this._renderWikiElements();
        else if (tab === 'demon_classes') html += this._renderWikiDemonClasses();
        html += '</div>';
        this.textArea.innerHTML += html;
        this.setButtons('<button class="back-btn-top" onclick="G.setState(\'SHOP\')">← 返回</button>');
    },

    _wikiCard(title, content, color) {
        const c = color || 'var(--accent)';
        return '<div style="margin:8px 0;padding:10px 12px;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;">' +
            '<div style="font-weight:bold;color:' + c + ';margin-bottom:6px;font-size:0.95rem;">' + title + '</div>' +
            '<div style="font-size:0.85rem;color:var(--text);">' + content + '</div></div>';
    },

    _renderWikiOverview() {
        let html = '';
        html += this._wikiCard('三层权力结构',
            '<div style="font-family:monospace;font-size:0.8rem;line-height:1.6;">' +
            '<strong style="color:var(--accent);">【天界】</strong><br/>' +
            '&nbsp;&nbsp;神王（最高意志）<br/>' +
            '&nbsp;&nbsp;└─ 神谕传达<br/><br/>' +
            '<strong style="color:var(--accent);">【地面议会】</strong>（教廷中枢）<br/>' +
            '&nbsp;&nbsp;├─ 四天王（天使总督，各管一域）<br/>' +
            '&nbsp;&nbsp;├─ 教廷大主教（行政总管）<br/>' +
            '&nbsp;&nbsp;└─ 议会决议 → 向神王汇报<br/><br/>' +
            '<strong style="color:var(--accent);">【四大种族王国】</strong>（自治领地）<br/>' +
            '&nbsp;&nbsp;├─ 人类：圣光联邦（贵族议会制）<br/>' +
            '&nbsp;&nbsp;├─ 矮人：霜铁议会（锻造家族制）<br/>' +
            '&nbsp;&nbsp;├─ 精灵：翡翠之冠（王族制）<br/>' +
            '&nbsp;&nbsp;└─ 兽人：赤潮联盟（酋长制）<br/><br/>' +
            '<strong style="color:var(--accent);">【天王自治领】</strong>（依附于主城旁）<br/>' +
            '&nbsp;&nbsp;├─ 圣天王领：纯白要塞<br/>' +
            '&nbsp;&nbsp;├─ 铁天王领：钢铁圣殿<br/>' +
            '&nbsp;&nbsp;├─ 翠天王领：翡翠高塔<br/>' +
            '&nbsp;&nbsp;└─ 赤天王领：战争神殿' +
            '</div>');
        html += this._wikiCard('关键规则',
            '• 四天王<strong>不伪装身份</strong>，公开以天使身份存在<br/>' +
            '• 四大种族保留自己的政治体系，四天王不直接干涉内政（除非涉及异端）<br/>' +
            '• 教廷是<strong>独立于种族统治阶级</strong>的特殊存在，直接向神王负责<br/>' +
            '• 四天王之间是<strong>平级关系</strong>，但互相竞争，都希望扩大自己的影响力');
        return html;
    },

    _renderWikiRaces() {
        let html = '';
        const rp = window.RACE_POLITICS;
        const raceOrder = [1, 4, 2, 3];
        const raceColors = { 1: '#ffd700', 4: '#87ceeb', 2: '#90ee90', 3: '#ff6347' };
        for (const raceId of raceOrder) {
            const r = rp[raceId];
            if (!r) continue;
            let content = '<strong>政体：</strong>' + r.polity + ' | <strong>首都：</strong>' + r.capital + '<br/><br/>';
            content += '<strong>权力结构：</strong><br/>';
            for (const p of r.powerStructure) {
                content += '• ' + p.title + ' — ' + p.desc + '<br/>';
            }
            content += '<br/><strong>与教廷关系：</strong><br/>';
            for (const rel of r.churchRelation) {
                content += '• ' + rel + '<br/>';
            }
            content += '<br/><strong>内部矛盾：</strong><br/>';
            for (const c of r.internalConflicts) {
                content += '• ' + c + '<br/>';
            }
            content += '<br/><strong>对魔王态度：</strong><br/>';
            for (const k in r.attitudeToDevil) {
                content += '• ' + r.attitudeToDevil[k] + '<br/>';
            }
            html += this._wikiCard(r.kingdom + '（' + r.raceName + '）', content, raceColors[raceId]);
        }
        return html;
    },

    _renderWikiKings() {
        let html = '';
        const hk = window.HEAVENLY_KINGS;
        const kingOrder = ['raphael', 'thor', 'olivia', 'caesar'];
        const kingColors = { raphael: '#fffacd', thor: '#c0c0c0', olivia: '#98fb98', caesar: '#ff7f50' };
        for (const key of kingOrder) {
            const k = hk[key];
            if (!k) continue;
            let content = '<strong>神名：</strong>' + k.divineName + ' | <strong>性别：</strong>' + k.gender + ' | <strong>位阶：</strong>' + k.rank + '<br/>';
            content += '<strong>驻地：</strong>' + k.base + ' | <strong>军团规模：</strong>' + k.legionSize + ' ' + k.legionType + '<br/><br/>';
            content += '<strong>心理状态：</strong>' + k.psyche + '<br/>';
            content += '<strong>魔王苏醒后态度：</strong>' + k.attitudeToDevil + '<br/><br/>';
            content += '<strong>暗中挑事：</strong>' + k.intrigue.method + '<br/>';
            content += '• 效果：' + k.intrigue.effect;
            html += this._wikiCard(k.title + '「' + k.divineName + '」', content, kingColors[key]);
        }
        return html;
    },

    _renderWikiGrudges() {
        let html = '';
        const rg = window.RACE_GRUDGES;
        for (const key in rg) {
            const g = rg[key];
            let content = '<strong>恩怨根源：</strong>' + g.origin + '<br/><br/>';
            content += '<strong>现状：</strong><br/>';
            for (const c of g.current) {
                content += '• ' + c + '<br/>';
            }
            content += '<br/><strong>游戏影响：</strong><br/>';
            content += '• 小队配合度惩罚：' + g.partyPenalty + '%<br/>';
            content += '• ' + g.combatEffect;
            html += this._wikiCard(g.name, content, '#ff6b6b');
        }
        html += this._wikiCard('配合度速查表',
            '<div style="font-size:0.8rem;">' +
            '• 同种族正统 +20%<br/>' +
            '• 人类↔兽人 -15%<br/>' +
            '• 矮人↔精灵 -15%<br/>' +
            '• 精灵↔人类 -10%<br/>' +
            '• 兽人↔矮人 -10%<br/>' +
            '• 堕落者+正统 -20%<br/>' +
            '• 堕落者+堕落者 +10%<br/>' +
            '• 堕落者+魔族 +30%' +
            '</div>');
        return html;
    },

    _renderWikiHeroes() {
        let html = '';
        html += this._wikiCard('勇者小队配置',
            '<strong>标准配置：3人冒险小队</strong><br/><br/>' +
            '• <strong>前排（坦克/战士）</strong>：人类骑士 / 矮人重装 / 兽人狂战士<br/>' +
            '• <strong>中排（输出/控制）</strong>：人类法师 / 精灵弓手 / 矮人工程师<br/>' +
            '• <strong>后排（辅助/治疗）</strong>：人类牧师 / 精灵德鲁伊 / 兽人萨满');

        let rarityContent = '';
        rarityContent += '• <strong>N</strong>（普通）— 基础属性<br/>';
        rarityContent += '• <strong>R</strong>（精英）— 全属性+10%<br/>';
        rarityContent += '• <strong>SR</strong>（英雄）— 全属性+20%<br/>';
        rarityContent += '• <strong>SSR</strong>（传说）— 全属性+35%<br/>';
        rarityContent += '• <strong>UR</strong>（唯一）— 全属性+50%<br/>';
        rarityContent += '<br/><strong>动态生成规则（基于魔王天数）：</strong><br/>';
        rarityContent += '• D1-10：100% N<br/>';
        rarityContent += '• D11-30：N 80%, R 20%<br/>';
        rarityContent += '• D31-60：N 50%, R 40%, SR 10%<br/>';
        rarityContent += '• D61-100：N 25%, R 35%, SR 25%, SSR 15%<br/>';
        rarityContent += '• D101+：N 10%, R 20%, SR 30%, SSR 30%, UR 10%<br/>';
        rarityContent += '<br/><strong>动态晋升规则（基于个人声望）：</strong><br/>';
        rarityContent += '• N→R：声望≥50 + 等级≥5<br/>';
        rarityContent += '• R→SR：声望≥150 + 等级≥15<br/>';
        rarityContent += '• SR→SSR：声望≥400 + 等级≥30<br/>';
        rarityContent += '• SSR→UR：声望≥1000 + 等级≥50<br/>';
        html += this._wikiCard('勇者稀有度（V8.0 动态系统）', rarityContent, '#ffd700');

        let urContent = '';
        const ur = window.UR_HERO_DEFS;
        for (const key in ur) {
            const u = ur[key];
            urContent += '• <strong>「' + u.title + '」' + u.name + '</strong>（' + u.desc + '）<br/>';
        }
        html += this._wikiCard('UR勇者列表', urContent, '#ff44aa');
        return html;
    },

    _renderWikiFallen() {
        let html = '';
        html += this._wikiCard('什么是堕落？',
            '堕落不是生理变异，而是<strong>思想上的背离教廷</strong>。<br/>' +
            '被教廷定义为堕落的个体，仍然属于原种族，但：<br/>' +
            '• 被教廷通缉<br/>' +
            '• 被同族排斥（除非同族也有堕落者）<br/>' +
            '• 对魔王有天然好感<br/>' +
            '• 知道部分或全部真相');

        const fr = window.FALLEN_RACES;
        for (const key in fr) {
            const f = fr[key];
            let content = '<strong>原种族：</strong>' + f.originRaceName + '<br/>';
            content += '<strong>形成原因：</strong>' + f.formationCause + '<br/>';
            content += '<strong>标记：</strong>' + f.marking + '<br/>';
            content += '<strong>投靠方式：</strong>' + f.joinMethod + '<br/>';
            content += '<strong>初始恭顺加成：</strong>+' + (f.traits.obedienceBonus || 0) + '%<br/>';
            content += '<strong>真相碎片：</strong>' + f.truthFragment + '个';
            html += this._wikiCard(f.prefix, content, '#8b4513');
        }

        html += this._wikiCard('队伍编成影响',
            '• 正统种族队员 + 堕落者队员 = 配合度-20%（被队友敌视）<br/>' +
            '• 堕落者队员 + 堕落者队员 = 配合度+10%（同病相怜）<br/>' +
            '• 堕落者队员 + 魔族队员 = 配合度+30%（天然同盟）');
        return html;
    },

    _renderWikiElements() {
        let html = '';
        html += this._wikiCard('元素属性克制关系',
            '<div style="font-size:0.85rem;line-height:1.6;">' +
            '<strong>🔥 火 → ❄️ 冰 → 💨 风 → 🪨 土 → ⚡ 雷 → 💧 水 → 🔥 火</strong>（循环克制）<br/>' +
            '<strong>✨ 圣 ↔ 🌑 暗</strong>（互相克制）<br/><br/>' +
            '• 克制方造成 <strong style="color:var(--success);">×1.3</strong> 伤害<br/>' +
            '• 被克制方造成 <strong style="color:var(--danger);">×0.7</strong> 伤害<br/>' +
            '• 物理/穿刺/魅惑/无属性：无克制效果<br/>' +
            '</div>', '#ff6b6b');
        html += this._wikiCard('克制详情表',
            '<div style="font-size:0.8rem;line-height:1.6;">' +
            '<strong style="color:#ff4444;">🔥 火</strong>：克制 ❄️ 冰｜被克 💧 水 🪨 土<br/>' +
            '<strong style="color:#44aaff;">❄️ 冰</strong>：克制 💨 风｜被克 🔥 火 🪨 土<br/>' +
            '<strong style="color:#88dd88;">💨 风</strong>：克制 🪨 土｜被克 ❄️ 冰 ⚡ 雷<br/>' +
            '<strong style="color:#cc8844;">🪨 土</strong>：克制 ⚡ 雷｜被克 🔥 火 💨 风<br/>' +
            '<strong style="color:#ffdd44;">⚡ 雷</strong>：克制 💧 水｜被克 🪨 土 ❄️ 冰<br/>' +
            '<strong style="color:#4488ff;">💧 水</strong>：克制 🔥 火｜被克 ⚡ 雷 ❄️ 冰<br/>' +
            '<strong style="color:#ffdd88;">✨ 圣</strong>：克制 🌑 暗｜被克 🌑 暗<br/>' +
            '<strong style="color:#8844aa;">🌑 暗</strong>：克制 ✨ 圣｜被克 ✨ 圣<br/>' +
            '</div>');
        html += this._wikiCard('堕落种族被动',
            '<div style="font-size:0.85rem;line-height:1.6;">' +
            '• <strong>5% 额外暗属性伤害</strong>：所有攻击附加 5% 暗属性伤害加成<br/>' +
            '• <strong>25% 双倍暴击</strong>：暴击时有 25% 概率造成双倍暴击伤害（对怪物/魔军无效）<br/>' +
            '</div>', '#8844aa');
        return html;
    },

    _renderWikiDemonClasses() {
        let html = '';
        html += this._wikiCard('魔军职阶系统',
            '<div style="font-size:0.85rem;line-height:1.6;">' +
            '魔军职阶是勇者方职业的黑暗版本，属性比原版更强。<br/>' +
            '• <strong>魔军基础职阶</strong>：比原版基础职阶属性 +5%<br/>' +
            '• <strong>魔军进阶职阶</strong>：比原版进阶职阶属性 +8%<br/>' +
            '</div>', '#ff4444');
        html += this._wikiCard('晋升消耗',
            '<div style="font-size:0.85rem;line-height:1.6;">' +
            '• 基础职阶 → 魔军基础职阶：<strong>2🏅 魔王勋章</strong><br/>' +
            '• 进阶职阶 → 魔军进阶职阶：<strong>3🏅 魔王勋章</strong><br/>' +
            '• 魔军基础 → 魔军进阶：<strong>1🏅 魔王勋章</strong><br/>' +
            '• 强制基础 → 进阶（跳过徽章）：<strong>1🏅 魔王勋章</strong><br/>' +
            '• 堕落种族转换：<strong>5🏅 魔王勋章</strong><br/>' +
            '</div>');
        let basicList = '';
        for (let i = 400; i <= 414; i++) {
            const def = window.CLASS_DEFS ? window.CLASS_DEFS[i] : null;
            if (def) basicList += `• <strong>${def.name}</strong>（${def.role}）— ${def.desc}<br/>`;
        }
        html += this._wikiCard('魔军基础职阶（400-414）', basicList, '#cc4444');
        let advList = '';
        for (let i = 500; i <= 514; i++) {
            const def = window.CLASS_DEFS ? window.CLASS_DEFS[i] : null;
            if (def) advList += `• <strong>${def.name}</strong>（${def.role}）— ${def.desc}<br/>`;
        }
        html += this._wikiCard('魔军进阶职阶（500-514）', advList, '#aa2222');
        return html;
    },

    _renderWikiClasses() {
        const defs = window.CLASS_DEFS || {};
        const skDefs = window.CLASS_SKILL_DEFS || {};

        let html = '';

        // 1. 职业体系总览
        html += this._wikiCard('职业体系总览',
            '<div style="font-size:0.85rem;line-height:1.6;">' +
            '<strong>勇者方职业（30种）</strong><br/>' +
            '• <strong>基础职业（15种，ID 200-214）</strong>：勇者创建时随机分配，Lv.20可转职为对应高级职业<br/>' +
            '• <strong>高级职业（15种，ID 300-314）</strong>：基础职业Lv.20后晋升，50天后勇者有小概率直接生成<br/>' +
            '<br/><strong>魔王军职阶（30种）</strong><br/>' +
            '• <strong>魔军基础（15种，ID 400-414）</strong>：勇者方基础职业的黑暗版本，属性+5%，仅可通过魔王转职获得<br/>' +
            '• <strong>魔军高级（15种，ID 500-514）</strong>：勇者方高级职业的黑暗版本，属性+8%，仅可通过魔王转职获得<br/>' +
            '<br/><strong>晋升规则</strong><br/>' +
            '• 基础 → 高级：转职徽章 或 1🏅强制晋升<br/>' +
            '• 基础 → 魔军基础：2🏅<br/>' +
            '• 高级 → 魔军高级：3🏅<br/>' +
            '• 魔军基础 → 魔军高级：1🏅<br/>' +
            '</div>', '#4488ff');

        const fmtStats = s => `HP${s.hp.toFixed(2)} MP${s.mp.toFixed(2)} ATK${s.atk.toFixed(2)} DEF${s.def.toFixed(2)} SPD${s.spd.toFixed(2)}`;
        const fmtAI = a => `攻${Math.round(a.agg*100)}% 防${Math.round(a.def*100)}% 辅${Math.round(a.sup*100)}%`;
        const fmtSkills = ids => ids.map(id => {
            const sd = skDefs[id];
            return sd ? `<span title="${sd.desc}（${sd.type}｜${sd.element}｜威力${sd.power}｜MP${sd.cost}）">${sd.name}</span>` : `?${id}`;
        }).join('｜');

        // 2. 勇者基础职业
        let basicHtml = '<div style="font-size:0.8rem;line-height:1.5;">';
        for (let i = 200; i <= 214; i++) {
            const d = defs[i];
            if (!d) continue;
            basicHtml += `<div style="margin:4px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;">` +
                `<strong style="color:var(--accent);">${d.name}</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[${d.role}]</span><br/>` +
                `<span style="font-size:0.75rem;color:var(--text-dim);">${fmtStats(d.stats)}｜AI:${fmtAI(d.ai)}</span><br/>` +
                `<span style="font-size:0.75rem;">${fmtSkills(d.skills)}</span>` +
                `</div>`;
        }
        basicHtml += '</div>';
        html += this._wikiCard('勇者基础职业（200-214）', basicHtml, '#4488ff');

        // 3. 勇者高级职业
        let advHtml = '<div style="font-size:0.8rem;line-height:1.5;">';
        for (let i = 300; i <= 314; i++) {
            const d = defs[i];
            if (!d) continue;
            const baseName = d.baseClassId && defs[d.baseClassId] ? defs[d.baseClassId].name : '?';
            advHtml += `<div style="margin:4px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;">` +
                `<strong style="color:var(--accent);">${d.name}</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[${d.role}] ← ${baseName}</span><br/>` +
                `<span style="font-size:0.75rem;color:var(--text-dim);">${fmtStats(d.stats)}｜AI:${fmtAI(d.ai)}</span><br/>` +
                `<span style="font-size:0.75rem;">${fmtSkills(d.skills)}</span>` +
                `</div>`;
        }
        advHtml += '</div>';
        html += this._wikiCard('勇者高级职业（300-314）', advHtml, '#8866ff');

        // 4. 魔军职阶
        let demonHtml = '<div style="font-size:0.8rem;line-height:1.5;">';
        demonHtml += '<div style="font-weight:bold;color:#ff4444;margin-bottom:4px;">魔军基础职阶（400-414）</div>';
        for (let i = 400; i <= 414; i++) {
            const d = defs[i];
            if (!d) continue;
            demonHtml += `<div style="margin:4px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;border-left:3px solid #ff4444;">` +
                `<strong style="color:#ff6666;">${d.name}</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[${d.role}]</span><br/>` +
                `<span style="font-size:0.75rem;color:var(--text-dim);">${fmtStats(d.stats)}｜AI:${fmtAI(d.ai)}</span><br/>` +
                `<span style="font-size:0.75rem;">${fmtSkills(d.skills)}</span>` +
                `</div>`;
        }
        demonHtml += '<div style="font-weight:bold;color:#ff4444;margin:8px 0 4px;">魔军高级职阶（500-514）</div>';
        for (let i = 500; i <= 514; i++) {
            const d = defs[i];
            if (!d) continue;
            const baseName = d.baseClassId && defs[d.baseClassId] ? defs[d.baseClassId].name : '?';
            demonHtml += `<div style="margin:4px 0;padding:4px 6px;background:var(--bg-card);border-radius:4px;border-left:3px solid #aa2222;">` +
                `<strong style="color:#ff6666;">${d.name}</strong> <span style="color:var(--text-dim);font-size:0.75rem;">[${d.role}] ← ${baseName}</span><br/>` +
                `<span style="font-size:0.75rem;color:var(--text-dim);">${fmtStats(d.stats)}｜AI:${fmtAI(d.ai)}</span><br/>` +
                `<span style="font-size:0.75rem;">${fmtSkills(d.skills)}</span>` +
                `</div>`;
        }
        demonHtml += '</div>';
        html += this._wikiCard('魔军职阶（400-514）', demonHtml, '#ff4444');

        // 5. 全技能效果表
        const skillGroups = [
            { name: '基础通用技能（1001-1008）', ids: [1001,1002,1003,1004,1005,1006,1007,1008] },
            { name: '高级通用技能（1101-1108）', ids: [1101,1102,1103,1104,1105,1106,1107,1108] },
            { name: '基础职业技能（2001-2015）', ids: [2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015] },
            { name: '基础职业必杀技（3001-3015）', ids: [3001,3002,3003,3004,3005,3006,3007,3008,3009,3010,3011,3012,3013,3014,3015] },
            { name: '进阶职业技能（3101-3130）', ids: [3101,3102,3103,3104,3105,3106,3107,3108,3109,3110,3111,3112,3113,3114,3115,3116,3117,3118,3119,3120,3121,3122,3123,3124,3125,3126,3127,3128,3129,3130] },
            { name: '进阶职业必杀技（4001-4015）', ids: [4001,4002,4003,4004,4005,4006,4007,4008,4009,4010,4011,4012,4013,4014,4015] }
        ];

        let skillHtml = '<div style="font-size:0.78rem;line-height:1.5;">';
        for (const g of skillGroups) {
            skillHtml += `<div style="font-weight:bold;color:var(--accent);margin:8px 0 4px;">${g.name}</div>`;
            for (const sid of g.ids) {
                const sd = skDefs[sid];
                if (!sd) continue;
                const hits = sd.hits ? `×${sd.hits}hit` : '';
                const dur = sd.duration ? `持续${sd.duration}T` : '';
                skillHtml += `<div style="margin:2px 0;padding:3px 5px;background:var(--bg-card);border-radius:3px;">` +
                    `<strong>${sd.name}</strong> <span style="color:var(--text-dim);font-size:0.72rem;">[${sd.type}]</span> ` +
                    `<span style="color:var(--text-dim);font-size:0.72rem;">${sd.element}｜威力${sd.power}${hits}｜MP${sd.cost}｜${sd.target}${dur ? '｜' + dur : ''}</span><br/>` +
                    `<span style="font-size:0.72rem;color:var(--text);">${sd.desc}</span>` +
                    `</div>`;
            }
        }
        skillHtml += '</div>';
        html += this._wikiCard('全技能效果表', skillHtml, '#44aa88');

        return html;
    },

    renderWorldMap(game) {
        try {
            this.hideTrainStatus();
            this.clearText();
            if (this.textArea) this.textArea.style.display = 'block';
            this.appendText('【世界地图】\n', 'accent');
            this.appendText('地图加载中...');
            this.setButtons('<button class="back-btn-top" onclick="G.setState(\'SHOP\')">← 返回</button>');
            if (typeof WorldMapUI !== 'undefined' && WorldMapUI.render) {
                setTimeout(function() { WorldMapUI.render(game); }, 50);
            } else {
                this.appendText('\n[错误] WorldMapUI 未加载，请刷新页面 (Ctrl+F5)', 'danger');
            }
        } catch (e) {
            this.appendText('\n[地图错误] ' + e.message, 'danger');
        }
    }
});
