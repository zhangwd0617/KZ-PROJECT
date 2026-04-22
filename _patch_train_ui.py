import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('D:/KZ PROJECT/js/ui/UI.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Modify showTargetSelect - select target and enter TRAIN directly
old_target_select = '''    showTargetSelect() {
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
    },'''

new_target_select = '''    showTargetSelect() {
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

        let listHtml = '<div style="line-height:normal;">';
        for (let i = 0; i < game.characters.length; i++) {
            const c = game.getChara(i);
            if (i === game.master) continue;
            const isTarget = i === game.target;
            listHtml += `<button class="game-btn ${isTarget?'accent':''}" style="margin-bottom:6px;width:100%;" onclick="G.shopAction('select_target', ${i});G.setState('TRAIN')">${isTarget?'✓ ':''}${c.name} Lv.${c.level}</button>`;
        }
        listHtml += '</div>';
        this.textArea.innerHTML += listHtml;

        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回</button>` + topInfo);
    },'''

if old_target_select in content:
    content = content.replace(old_target_select, new_target_select)
    print('✅ showTargetSelect updated')
else:
    print('❌ showTargetSelect not found')

# 2. Modify renderTrain - add train-layout class, hide back to shop button in commands
old_render_train = '''    renderTrain(game) {
        this.showTopBar(true);
        this.updateTopBar(game);
        if (this.dungeonProgress) this.dungeonProgress.style.display = 'none';
        if (this.heroEventLog) this.heroEventLog.style.display = 'none';
        const target = game.getTarget();
        if (!target) return;

        // 不清理文本，追加显示
        if (this.textArea.childElementCount === 0) {
            this.appendText(`【调教开始】\n`, "accent");
            this.appendText(`目标: ${target.name} | 性格: ${target.getPersonalityName()}`);
            this.appendDivider();
        }

        // 显示当前状态（固定到顶部状态栏）
        this._renderTrainStatus(target, game);

        // 显示指令按钮
        this._renderTrainCommands(game);
    },'''

new_render_train = '''    renderTrain(game) {
        this.showTopBar(true);
        this.updateTopBar(game);
        if (this.dungeonProgress) this.dungeonProgress.style.display = 'none';
        if (this.heroEventLog) this.heroEventLog.style.display = 'none';
        const target = game.getTarget();
        if (!target) return;

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
    },'''

if old_render_train in content:
    content = content.replace(old_render_train, new_render_train)
    print('✅ renderTrain updated')
else:
    print('❌ renderTrain not found')

# 3. Modify _renderTrainStatus - add avatar, end button, switch target button
old_train_status = '''    _renderTrainStatus(target, game) {
        const bar = document.getElementById('train-status-bar');
        if (!bar) return;

        const masterRank = game ? game.getMasterRank() : 0;
        const masterRankName = game ? game.getMasterRankName() : "新手调教师";
        const masterExp = game ? (game.masterExp || 0) : 0;
        const nextThreshold = MASTER_RANK_EXP[Math.min(masterRank + 1, MASTER_RANK_EXP.length - 1)];
        const expToNext = masterRank >= 5 ? 0 : (nextThreshold - masterExp);

        let html = `<div class="status-panel">`;
        const pregTag = target.talent[153] ? ` <span style="color:var(--accent);">🤰${target.cflag[800] || 0}d</span>` : '';
        html += `<div class="status-name">${target.name} | Lv.${target.level} | ${target.getPersonalityName()}${pregTag}</div>`;
        html += `<div style="font-size:0.72rem;color:var(--accent);margin-bottom:3px;">👑 ${masterRankName} (经验${masterExp}${expToNext > 0 ? ` | 下级还需${expToNext}` : ` | 已满级`})</div>`;
        html += `<div class="bar-box"><span class="bar-label">体力</span><div class="bar-bg"><div class="bar-fill" style="width:${Math.max(0,target.hp/target.maxHp*100)}%"></div></div><span class="bar-text">${target.hp}/${target.maxHp}</span></div>`;
        html += `<div class="bar-box"><span class="bar-label">气力</span><div class="bar-bg mp"><div class="bar-fill mp" style="width:${Math.max(0,target.mp/target.maxMp*100)}%"></div></div><span class="bar-text">${target.mp}/${target.maxMp}</span></div>`;

        // 关键PALAM - 精简显示
        const palams = [
            [0, "C快"], [1, "V快"], [2, "A快"], [14, "B快"],
            [5, "欲情"], [4, "顺从"], [6, "屈服"], [8, "羞耻"],
            [9, "痛苦"], [10, "恐惧"], [11, "反感"], [3, "润滑"]
        ];
        html += `<div class="stat-grid">`;
        for (const [id, name] of palams) {
            const val = target.palam[id] || 0;
            const highlight = val > 5000 ? ' style="color:var(--danger);"' : (val > 2000 ? ' style="color:var(--warning);"' : '');
            html += `<div class="stat-item"><span class="stat-name">${name}</span>: <span class="stat-val"${highlight}>${val}</span></div>`;
        }
        html += `</div></div>`;

        bar.innerHTML = html;
        bar.style.display = 'block';
    },'''

new_train_status = '''    _renderTrainStatus(target, game) {
        const bar = document.getElementById('train-status-bar');
        if (!bar) return;

        const masterRank = game ? game.getMasterRank() : 0;
        const masterRankName = game ? game.getMasterRankName() : "新手调教师";
        const masterExp = game ? (game.masterExp || 0) : 0;
        const nextThreshold = MASTER_RANK_EXP[Math.min(masterRank + 1, MASTER_RANK_EXP.length - 1)];
        const expToNext = masterRank >= 5 ? 0 : (nextThreshold - masterExp);
        const assi = game.getAssi();

        let leftHtml = '';
        const pregTag = target.talent[153] ? ` <span style="color:var(--accent);">🤰${target.cflag[800] || 0}d</span>` : '';
        leftHtml += `<div class="status-name">${target.name} | Lv.${target.level} | ${target.getPersonalityName()}${pregTag}</div>`;
        leftHtml += `<div style="font-size:0.72rem;color:var(--accent);margin-bottom:3px;">👑 ${masterRankName} (经验${masterExp}${expToNext > 0 ? ` | 下级还需${expToNext}` : ` | 已满级`})</div>`;
        leftHtml += `<div class="bar-box"><span class="bar-label">体力</span><div class="bar-bg"><div class="bar-fill" style="width:${Math.max(0,target.hp/target.maxHp*100)}%"></div></div><span class="bar-text">${target.hp}/${target.maxHp}</span></div>`;
        leftHtml += `<div class="bar-box"><span class="bar-label">气力</span><div class="bar-bg mp"><div class="bar-fill mp" style="width:${Math.max(0,target.mp/target.maxMp*100)}%"></div></div><span class="bar-text">${target.mp}/${target.maxMp}</span></div>`;

        const palams = [
            [0, "C快"], [1, "V快"], [2, "A快"], [14, "B快"],
            [5, "欲情"], [4, "顺从"], [6, "屈服"], [8, "羞耻"],
            [9, "痛苦"], [10, "恐惧"], [11, "反感"], [3, "润滑"]
        ];
        leftHtml += `<div class="stat-grid">`;
        for (const [id, name] of palams) {
            const val = target.palam[id] || 0;
            const highlight = val > 5000 ? ' style="color:var(--danger);"' : (val > 2000 ? ' style="color:var(--warning);"' : '');
            leftHtml += `<div class="stat-item"><span class="stat-name">${name}</span>: <span class="stat-val"${highlight}>${val}</span></div>`;
        }
        leftHtml += `</div>`;

        // 右侧：头像 + 按钮
        let rightHtml = '';
        rightHtml += `<div class="train-avatar">👤</div>`;
        rightHtml += `<button class="game-btn danger" style="font-size:0.7rem;padding:3px 8px;width:90px;" onclick="G.endTrain()">⏹ 结束调教</button>`;
        if (assi) {
            rightHtml += `<button class="game-btn" style="font-size:0.7rem;padding:3px 8px;width:90px;" onclick="G.switchTrainTarget()">🔄 切换为${assi.name}</button>`;
        } else {
            rightHtml += `<button class="game-btn" style="font-size:0.7rem;padding:3px 8px;width:90px;opacity:0.4;" disabled title="无助手无法切换">🔄 切换对象</button>`;
        }

        bar.innerHTML = `<div class="train-info-panel"><div class="train-info-left">${leftHtml}</div><div class="train-info-right">${rightHtml}</div></div>`;
        bar.style.display = 'block';
    },'''

if old_train_status in content:
    content = content.replace(old_train_status, new_train_status)
    print('✅ _renderTrainStatus updated')
else:
    print('❌ _renderTrainStatus not found')

# 4. Modify _renderTrainCommands - category + commands layout
old_train_cmds = '''    _renderTrainCommands(game) {
        // 使用更紧凑的6列网格
        let html = '<div class="btn-grid btn-grid-6">';

        // 按组生成指令
        for (let comId in TRAIN_DEFS) {
            const def = TRAIN_DEFS[comId];
            // 检查过滤器
            if (game.isGroupFiltered(def.group)) continue;
            // 检查是否应完全隐藏（缺少道具/前提条件）
            if (this._shouldHideCommand(game, parseInt(comId))) continue;
            // 检查可用性
            const available = this._checkComAble(game, parseInt(comId));

            html += `<button class="game-btn" ${available ? '' : 'disabled'} onclick="G.selectCommand(${comId})" title="${def.name}">${def.name}</button>`;
        }

        html += `</div><div class="btn-grid" style="margin-top:6px;grid-template-columns:repeat(auto-fill, minmax(70px, 1fr));">`;
        // 过滤器按钮 - 更紧凑
        const GROUP_LABELS = { caress:"爱抚", tool:"器具", vaginal:"阴道", anal:"肛门", service:"侍奉", sm:"SM", rough:"过激", monster:"触手", assistant:"助手", arena:"斗技场" };
        const groups = ["caress", "tool", "vaginal", "anal", "service", "sm", "rough", "monster", "assistant", "arena"];
        groups.forEach((g, i) => {
            const on = game.isGroupFiltered(g);
            html += `<button class="game-btn ${on?'filter-on':''}" style="font-size:0.7rem;padding:4px 6px;text-align:center;" onclick="G.toggleFilter(${i});G.setState('TRAIN')">${on?'✗':'✓'} ${GROUP_LABELS[g]||g}</button>`;
        });
        html += `<button class="game-btn accent" style="font-size:0.75rem;padding:4px 8px;text-align:center;" onclick="G.endTrain()">结束</button>`;
        html += '</div>';
        this.setButtons(html);
    },'''

new_train_cmds = '''    _renderTrainCommands(game) {
        const GROUP_LABELS = { caress:"爱抚", tool:"器具", vaginal:"阴道", anal:"肛门", service:"侍奉", sm:"SM", rough:"过激", monster:"触手", assistant:"助手", arena:"斗技场", special:"特殊" };
        const GROUP_ORDER = ["caress", "tool", "vaginal", "anal", "service", "sm", "special"];
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

        const html = `<div class="train-command-panel"><div class="train-categories">${catHtml}</div><div class="train-commands">${cmdHtml}</div></div>`;
        this.setButtons(html);
    },'''

if old_train_cmds in content:
    content = content.replace(old_train_cmds, new_train_cmds)
    print('✅ _renderTrainCommands updated')
else:
    print('❌ _renderTrainCommands not found')

with open('D:/KZ PROJECT/js/ui/UI.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')
