// Injects methods into the global UI object
Object.assign(UI, {
    // ========== 角色列表 ==========
    renderCharaList(game) {
        this.hideTrainStatus();
        this.clearText();
        this.appendText(`【角色与勇者一览】\n`, "accent");
        this.clearButtons();
        let listHtml = '<div style="line-height:normal;">';

        // 分类持有角色
        const ownedList = [];
        const prisonerList = [];
        for (let i = 0; i < game.characters.length; i++) {
            const c = game.getChara(i);
            const isCaptured = c.talent[200] || c.cflag[CFLAGS.CAPTURE_STATUS] === 1;
            if (i === game.master) {
                ownedList.push({ index: i, chara: c });
            } else if (isCaptured && (c.mark[0] || 0) < 3) {
                prisonerList.push({ index: i, chara: c });
            } else {
                ownedList.push({ index: i, chara: c });
            }
        }
        const sortByLevel = (a, b) => b.chara.level - a.chara.level;
        ownedList.sort((a, b) => {
            if (a.index === game.master) return -1;
            if (b.index === game.master) return 1;
            return sortByLevel(a, b);
        });
        prisonerList.sort(sortByLevel);

        // 持有角色（魔王始终第一，其余按等级降序）
        listHtml += `<div style="font-weight:bold;font-size:0.85rem;margin:8px 0 4px;color:var(--accent);">👤 持有角色</div>`;
        for (const item of ownedList) {
            const c = item.chara;
            const isMaster = item.index === game.master;
            const isExHero = c.talent[200];
            const isAssi = item.index === game.assi;
            const name = isMaster ? `👑${c.name}` : (isExHero ? `🛡️${c.name}` : c.name);
            const borderColor = isMaster ? '#d4af37' : (isExHero ? '#8b5cf6' : 'var(--accent)');
            const job = this._getJobName(c);
            const race = (window.APPEARANCE_DESC_DEFS && window.APPEARANCE_DESC_DEFS.race && window.APPEARANCE_DESC_DEFS.race[c.talent[314]]) || '人类';
            const faction = this._getFactionName(c);
            const taskLabel = this._getTaskLabel(c);
            const power = this._calcCombatPower(c);
            let extra = `<span style="color:var(--text-dim);font-size:0.75rem;">Lv.${c.level}</span>`;
            extra += ` <span style="color:#ff6b6b;font-size:0.7rem;font-weight:bold;">⚔️${power}</span>`;
            extra += ` <span style="color:var(--text);font-size:0.72rem;">${job}</span>`;
            extra += ` <span style="color:var(--info);font-size:0.7rem;">${race}</span>`;
            extra += ` <span style="color:var(--warning);font-size:0.7rem;">${faction}</span>`;
            if (taskLabel) extra += ` <span style="color:var(--success);font-size:0.7rem;">📋${taskLabel}</span>`;
            if (isAssi) extra += ` <span style="color:#d4af37;font-size:0.7rem;font-weight:bold;">【助】</span>`;
            listHtml += `<button class="game-btn" style="margin-bottom:6px;width:100%;border-left:3px solid ${borderColor};text-align:left;" onclick="UI.renderCharaDetail(G, ${item.index}, 0, 'chara')">${name} ${extra}</button>`;
        }

        // 俘虏列表（被俘获但未完全陷落）
        if (prisonerList.length > 0) {
            listHtml += `<div style="font-weight:bold;font-size:0.85rem;margin:12px 0 4px;color:var(--danger);">⛓️ 俘虏</div>`;
            for (const item of prisonerList) {
                const c = item.chara;
                const isAssi = item.index === game.assi;
                const job = this._getJobName(c);
                const race = (window.APPEARANCE_DESC_DEFS && window.APPEARANCE_DESC_DEFS.race && window.APPEARANCE_DESC_DEFS.race[c.talent[314]]) || '人类';
                const faction = this._getFactionName(c);
                const taskLabel = this._getTaskLabel(c);
                const power = this._calcCombatPower(c);
                let extra = `<span style="color:var(--text-dim);font-size:0.75rem;">Lv.${c.level}</span>`;
                extra += ` <span style="color:#ff6b6b;font-size:0.7rem;font-weight:bold;">⚔️${power}</span>`;
                extra += ` <span style="color:var(--text);font-size:0.72rem;">${job}</span>`;
                extra += ` <span style="color:var(--info);font-size:0.7rem;">${race}</span>`;
                extra += ` <span style="color:var(--warning);font-size:0.7rem;">${faction}</span>`;
                if (taskLabel) extra += ` <span style="color:var(--success);font-size:0.7rem;">📋${taskLabel}</span>`;
                if (isAssi) extra += ` <span style="color:#d4af37;font-size:0.7rem;font-weight:bold;">【助】</span>`;
                listHtml += `<button class="game-btn" style="margin-bottom:6px;width:100%;border-left:3px solid var(--danger);text-align:left;opacity:0.92;" onclick="UI.renderCharaDetail(G, ${item.index}, 0, 'chara')">⛓️${c.name} ${extra}</button>`;
            }
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
                const clsName = this._getHeroClassName(c);
                const race = (window.APPEARANCE_DESC_DEFS && window.APPEARANCE_DESC_DEFS.race && window.APPEARANCE_DESC_DEFS.race[c.talent[314]]) || '人类';
                const faction = this._getFactionName(c);
                const taskLabel = this._getTaskLabel(c);
                const power = this._calcCombatPower(c);
                let extra = `<span style="color:var(--text-dim);font-size:0.75rem;">Lv.${c.level}</span>`;
                extra += ` <span style="color:#ff6b6b;font-size:0.7rem;font-weight:bold;">⚔️${power}</span>`;
                if (clsName) extra += ` <span style="color:var(--text);font-size:0.72rem;">${clsName}</span>`;
                extra += ` <span style="color:var(--info);font-size:0.7rem;">${race}</span>`;
                extra += ` <span style="color:var(--warning);font-size:0.7rem;">${faction}</span>`;
                if (taskLabel) extra += ` <span style="color:var(--success);font-size:0.7rem;">📋${taskLabel}</span>`;
                extra += ` <span style="color:var(--danger);font-size:0.7rem;">第${floor}层 ${progress}%</span>`;
                listHtml += `<button class="game-btn" style="margin-bottom:6px;width:100%;border-left:3px solid var(--danger);text-align:left;opacity:0.92;" onclick="UI.renderCharaDetail(G, ${item.index}, 0, 'hero')">🗡️ ${c.name} ${extra}</button>`;
            }
        }

        listHtml += '</div>';
        this.textArea.innerHTML += listHtml;
        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回</button>`);
    },

    // V6.0: 计算综合战力
    _calcCombatPower(c) {
        if (!c) return 0;
        const hp = c.maxHp || c.base[0] || 1;
        const mp = c.maxMp || c.base[1] || 1;
        const atk = c.cflag ? (c.cflag[11] || 20) : 20;
        const def = c.cflag ? (c.cflag[12] || 15) : 15;
        const spd = c.cflag ? (c.cflag[13] || 10) : 10;
        // 战力 = (HP/10 + MP/20 + ATK*2 + DEF*1.5 + SPD*1)
        let power = Math.floor(hp / 10 + mp / 20 + atk * 2 + def * 1.5 + spd * 1);
        return power;
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
            <div style="font-size:0.8rem;color:var(--text-dim);">Lv.${c.level} · ⚔️${this._calcCombatPower(c)} · ${job} · ${personality}</div>
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
            const isMarried = c.cflag[CFLAGS.LOVE_POINTS] ? true : false;
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
                const hasTask = (c.cflag[CFLAGS.SLAVE_TASK_TYPE] || 0) !== 0;
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

        const currentTask = c.cflag[CFLAGS.SLAVE_TASK_TYPE] || 0;
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
        // V5.0 优先使用 CLASS_DEFS
        const classId = c.cflag[CFLAGS.CLASS_ID] || c.cflag[CFLAGS.HERO_CLASS];
        if (classId && window.CLASS_DEFS && window.CLASS_DEFS[classId]) {
            return window.CLASS_DEFS[classId].name;
        }
        // 向后兼容：从 talent 中查找旧职业
        for (let i = 200; i <= 214; i++) {
            if (c.talent[i] && TALENT_DEFS[i]) return TALENT_DEFS[i].name;
        }
        return '无职业';
    },

    _getFactionName(c) {
        // 魔王（玩家）
        if (c.talent[94]) return '魔王军';
        // 已完全陷落的前勇者/俘虏显示魔王军，并附带原势力
        const isCaptured = c.talent[200] || c.cflag[CFLAGS.CAPTURE_STATUS] === 1;
        if (isCaptured && (c.mark[0] || 0) >= 3) {
            const original = (window.APPEARANCE_DESC_DEFS && window.APPEARANCE_DESC_DEFS.raceFaction && window.APPEARANCE_DESC_DEFS.raceFaction[c.talent[314]]) || '未知';
            return `魔王军（原：${original}）`;
        }
        // 按种族返回统一势力名
        return (window.APPEARANCE_DESC_DEFS && window.APPEARANCE_DESC_DEFS.raceFaction && window.APPEARANCE_DESC_DEFS.raceFaction[c.talent[314]]) || '未知势力';
    },

    _getHeroClassName(c) {
        const clsId = c.cflag ? c.cflag[CFLAGS.HERO_CLASS] : 0;
        if (!clsId || typeof HERO_CLASS_DEFS === 'undefined' || !HERO_CLASS_DEFS[clsId]) return '';
        return HERO_CLASS_DEFS[clsId].name;
    },

    _getTaskLabel(c) {
        // 奴隶/持有角色任务
        const slaveTaskType = c.cflag[CFLAGS.SLAVE_TASK_TYPE] || 0;
        if (slaveTaskType !== 0) {
            const defs = typeof SLAVE_TASK_DEFS !== 'undefined' ? SLAVE_TASK_DEFS : {};
            const def = defs[slaveTaskType];
            return def ? def.name : '任务中';
        }
        // 勇者任务
        const heroTaskType = c.cflag[CFLAGS.HERO_TASK_TYPE] || 0;
        if (heroTaskType !== 0) {
            const desc = c.cstr[CSTRS.TASK_DESC];
            if (desc) {
                // 截断过长的描述，只取前16个字符
                return desc.length > 16 ? desc.slice(0, 16) + '…' : desc;
            }
            return heroTaskType === 1 ? '讨伐地下城' : '执行委托';
        }
        return '';
    },

    _renderCharaPageBasic(c, job, personality, type = 'chara') {
        const isHero = type === 'hero';
        const hpPct = Math.max(0, Math.min(100, c.hp / c.maxHp * 100));
        const mpPct = Math.max(0, Math.min(100, c.mp / c.maxMp * 100));

        // 勇者额外信息
        let heroInfoHtml = '';
        if (isHero) {
            const floor = c.cflag[CFLAGS.HERO_FLOOR] || 1;
            const progress = c.cflag[CFLAGS.HERO_PROGRESS] || 0;
            const floorDef = DUNGEON_FLOOR_DEFS[floor];
            const taskType = c.cflag[CFLAGS.HERO_TASK_TYPE] || 0;
            const taskDef = HERO_TASK_TYPE_DEFS[taskType] || HERO_TASK_TYPE_DEFS[0];
            const taskDesc = c.cstr[CSTRS.TASK_DESC] || '暂无任务';
            const taskStatus = (c.cflag[CFLAGS.HERO_TASK_STATUS] || 0) === 1 ? '<span style="color:var(--success);">[已完成]</span>' : '';
            heroInfoHtml = `
            <div class="chara-section" style="border-color:var(--danger);">
                <div class="chara-section-title" style="color:var(--danger);">🗡️ 勇者情报</div>
                <div class="chara-stat-grid">
                    <div class="chara-stat-item"><span class="chara-stat-name">当前位置</span><span class="chara-stat-val">第${floor}层 ${floorDef ? floorDef.name : ''}</span></div>
                    <div class="chara-stat-item"><span class="chara-stat-name">侵略进度</span><span class="chara-stat-val">${progress}%</span></div>
                    <div class="chara-stat-item"><span class="chara-stat-name">持有金币</span><span class="chara-stat-val">💰 ${c.gold}G</span></div>
                    <div class="chara-stat-item"><span class="chara-stat-name">个人声望</span><span class="chara-stat-val">🏆 ${c.fame || 0}</span></div>
                    ${c.cstr[CSTRS.NAME_ALT] ? `<div class="chara-stat-item"><span class="chara-stat-name">所属小队</span><span class="chara-stat-val">${c.cflag[CFLAGS.SQUAD_LEADER] === 1 ? '★' : ''}${c.cstr[CSTRS.NAME_ALT]}</span></div>` : ''}
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
            { key: CSTRS.PREVIOUS_LIFE, label: '勇者前生活' },
            { key: CSTRS.REASON, label: '成为勇者理由' },
            { key: CSTRS.SEXUAL_WEAKNESS_DESC, label: '性弱点' },
            { key: CSTRS.FAMILY, label: '家族构成' },
            { key: CSTRS.FACTION, label: '所属势力' },
            { key: CSTRS.HOMETOWN, label: '家乡' }
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
            const appDesc = c.cstr[CSTRS.APPEARANCE];
            if (!appDesc) return '';
            const age = c.cstr[CSTRS.AGE] || '?';
            const height = c.cstr[CSTRS.HEIGHT] || '?';
            const weight = c.cstr[CSTRS.WEIGHT] || '?';
            const bodyFeat = c.cstr[CSTRS.BODY_FEATURES] || '';
            return `
            <div class="chara-section" style="border-color:var(--accent);">
                <div class="chara-section-title" style="color:var(--accent);">✨ 外貌描述</div>
                <div style="font-size:0.9rem;line-height:1.6;margin-bottom:8px;">${appDesc}</div>
                ${bodyFeat ? `<div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:8px;padding:4px 8px;background:var(--bg);border-radius:4px;">${bodyFeat}</div>` : ''}
                <div class="chara-stat-grid">
                    <div class="chara-stat-item"><span class="chara-stat-name">性别</span><span class="chara-stat-val">${c.talent[122] ? '男' : '女'}</span></div>
                    <div class="chara-stat-item"><span class="chara-stat-name">种族</span><span class="chara-stat-val">${(window.APPEARANCE_DESC_DEFS && window.APPEARANCE_DESC_DEFS.race && window.APPEARANCE_DESC_DEFS.race[c.talent[314]]) || '人类'}</span></div>
                    <div class="chara-stat-item"><span class="chara-stat-name">势力</span><span class="chara-stat-val">${this._getFactionName(c)}</span></div>
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
                <div class="chara-stat-item"><span class="chara-stat-name">勋章数</span><span class="chara-stat-val" style="color:#d4af37;">${c.cflag[CFLAGS.MEDAL_COUNT] || 0} 枚</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">全属性加成</span><span class="chara-stat-val" style="color:var(--success);">+${c.cflag[CFLAGS.MEDAL_COUNT] || 0}%</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">勋章经验</span><span class="chara-stat-val">${c.cflag[CFLAGS.MEDAL_EXP] || 0}</span></div>
            </div>
        </div>
        ` : ''}

        ${!isHero && G.canAssignTask(c) ? `
        <div class="chara-section" style="border-color:var(--accent);">
            <div class="chara-section-title" style="color:var(--accent);">📋 当前任务</div>
            ${(() => {
                const taskType = c.cflag[CFLAGS.SLAVE_TASK_TYPE] || 0;
                if (taskType === 0) return '<div style="font-size:0.85rem;color:var(--text-dim);">暂无任务</div>';
                const taskDef = SLAVE_TASK_DEFS[taskType];
                const currentFloor = c.cflag[CFLAGS.SLAVE_TASK_CURRENT_FLOOR] || c.cflag[CFLAGS.SLAVE_TASK_FLOOR] || '?';
                const progress = c.cflag[CFLAGS.SLAVE_TASK_PROGRESS] || 0;
                return `
                <div style="font-size:0.9rem;font-weight:bold;margin-bottom:4px;">${taskDef ? taskDef.icon : ''} ${taskDef ? taskDef.name : '未知任务'}</div>
                <div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:6px;">${taskDef ? taskDef.desc : ''}</div>
                <div class="chara-stat-grid">
                    <div class="chara-stat-item"><span class="chara-stat-name">出发楼层</span><span class="chara-stat-val">第${c.cflag[CFLAGS.SLAVE_TASK_FLOOR] || '?'}层</span></div>
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
                <div class="chara-stat-item"><span class="chara-stat-name">妊娠天数</span><span class="chara-stat-val" style="color:var(--accent);">${c.cflag[CFLAGS.PREGNANCY_DAYS] || 0} / 30 天</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">预计分娩</span><span class="chara-stat-val" style="color:var(--accent);">${30 - (c.cflag[CFLAGS.PREGNANCY_DAYS] || 0)} 天后</span></div>
            </div>
        </div>` : ''}
        `;
    },

    _getClassSkills(c) {
        try {
            const s = c.cstr[355];
            if (s) return JSON.parse(s);
        } catch (e) {}
        // 兜底：从 CLASS_DEFS 推导
        const classId = c.cflag[CFLAGS.CLASS_ID] || c.cflag[CFLAGS.HERO_CLASS] || 200;
        const def = window.CLASS_DEFS ? window.CLASS_DEFS[classId] : null;
        return def ? def.skills : [];
    },

    _renderClassInfo(c) {
        const classId = c.cflag[CFLAGS.CLASS_ID] || c.cflag[CFLAGS.HERO_CLASS] || 200;
        const def = window.CLASS_DEFS ? window.CLASS_DEFS[classId] : null;
        if (!def) return '';

        const isAdvanced = def.tier === 'advanced';
        const roleLabels = {
            front_dps: "前排·物理输出", magic_dps: "后排·魔法输出", healer: "后排·治疗",
            assassin: "中排·爆发刺客", tank: "前排·坦克", dot_aoe: "中排·持续伤害",
            ranged: "中排·远程输出", ninja: "中排·闪避特化", brawler: "前排·连击输出",
            healer_buff: "后排·封印辅助", pierce: "前排·贯穿输出", bard: "后排·增益辅助",
            healer_dot: "后排·治疗解毒", dancer: "中排·干扰控制",
            front_burst: "前排·极限输出", magic_aoe: "后排·毁灭AoE", healer_core: "后排·团队核心",
            dodge_assassin: "中排·闪避刺客", holy_tank: "前排·圣光坦克", battle_control: "中排·战场控制",
            mobile_ranged: "中排·机动射手", master_ninja: "中排·暗杀大师", combo_burst: "前排·连击爆发",
            holy_seal: "后排·神圣封印", mounted_pierce: "前排·骑乘贯穿", battle_command: "后排·战场指挥",
            soul_reaper: "中排·灵魂收割", extreme_heal: "后排·极限治疗", battle_charm: "中排·战场魅惑"
        };
        const roleLabel = roleLabels[def.role] || def.role;
        const tierIcon = isAdvanced ? '⭐' : '';

        // 转职按钮
        let promoteBtn = '';
        if (!isAdvanced && c.level >= 20) {
            const advDef = window.CLASS_DEFS ? window.CLASS_DEFS[def.advClassId] : null;
            if (advDef) {
                promoteBtn = `<button class="game-btn accent" style="margin-top:8px;font-size:0.8rem;padding:4px 12px;" onclick="UI._handlePromote(G, ${c.cflag[CFLAGS.CLASS_ID]})">⚔️ 转职为 ${advDef.name}</button>`;
            }
        } else if (isAdvanced) {
            promoteBtn = `<div style="margin-top:6px;font-size:0.75rem;color:var(--success);">✓ 已完成转职</div>`;
        } else {
            promoteBtn = `<div style="margin-top:6px;font-size:0.75rem;color:var(--text-dim);">Lv.20 可转职为 ${window.CLASS_DEFS && window.CLASS_DEFS[def.advClassId] ? window.CLASS_DEFS[def.advClassId].name : '进阶职业'}</div>`;
        }

        // 种族特长
        const raceId = c.talent[314] || 1;
        const raceTrait = window.RACE_TRAITS ? window.RACE_TRAITS[raceId] : null;
        let raceHtml = '';
        if (raceTrait) {
            const s = raceTrait.stats;
            const statStr = [];
            if (s.hp !== 1.0) statStr.push(`HP${s.hp > 1 ? '+' : ''}${Math.round((s.hp-1)*100)}%`);
            if (s.mp !== 1.0) statStr.push(`MP${s.mp > 1 ? '+' : ''}${Math.round((s.mp-1)*100)}%`);
            if (s.atk !== 1.0) statStr.push(`ATK${s.atk > 1 ? '+' : ''}${Math.round((s.atk-1)*100)}%`);
            if (s.def !== 1.0) statStr.push(`DEF${s.def > 1 ? '+' : ''}${Math.round((s.def-1)*100)}%`);
            if (s.spd !== 1.0) statStr.push(`SPD${s.spd > 1 ? '+' : ''}${Math.round((s.spd-1)*100)}%`);
            raceHtml = `<div style="font-size:0.75rem;color:var(--info);margin-top:4px;">🧬 ${raceTrait.name} | ${statStr.join(' ')} | ${raceTrait.desc}</div>`;
        }

        return `
        <div class="chara-section" style="border-color:var(--accent);">
            <div class="chara-section-title" style="color:var(--accent);">🛡️ 职业信息</div>
            <div style="font-size:0.9rem;font-weight:bold;margin-bottom:4px;">${tierIcon}${def.name} <span style="color:var(--text-dim);font-size:0.8rem;font-weight:normal;">(${roleLabel})</span></div>
            <div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:4px;">${def.desc}</div>
            ${raceHtml}
            ${promoteBtn}
        </div>`;
    },

    _renderCombatSkills(c) {
        const skillIds = this._getClassSkills(c);
        if (!skillIds || skillIds.length === 0) return '';
        const defs = window.CLASS_SKILL_DEFS || {};
        let html = '';
        for (const sid of skillIds) {
            const sdef = defs[sid];
            if (!sdef) continue;
            const isUlt = sid >= 3000;
            const icon = isUlt ? '★' : '•';
            const color = isUlt ? 'color:var(--danger);font-weight:bold;' : 'color:var(--text);';
            const elIcon = window.ELEMENT_ICONS ? (window.ELEMENT_ICONS[sdef.element] || '') : '';
            html += `<div style="font-size:0.82rem;margin:3px 0;padding:3px 6px;background:var(--bg);border-radius:4px;"><span style="${color}">${icon} ${sdef.name}</span> <span style="color:var(--text-dim);font-size:0.7rem;">${elIcon} ${sdef.desc}</span></div>`;
        }
        if (!html) return '';
        return `
        <div class="chara-section" style="border-color:#d4af37;">
            <div class="chara-section-title" style="color:#d4af37;">⚔️ 战斗技能</div>
            ${html}
        </div>`;
    },

    _handlePromote(game, currentClassId) {
        // 找到当前显示的角色索引
        const idx = this._charaDetailIndex;
        const type = this._charaDetailType;
        if (type !== 'chara' || idx == null) return;
        const c = game.getChara(idx);
        if (!c) return;
        const result = game.promoteClass(c);
        if (result && result.can) {
            UI.showToast(result.msg, 'success');
            UI.renderCharaDetail(game, idx, 1, 'chara');
        } else {
            UI.showToast(result ? result.reason || result.msg : '转职失败', 'warning');
        }
    },

    _renderCharaPageStats(c, type = 'chara') {
        const classInfo = this._renderClassInfo(c);
        const combatSkills = this._renderCombatSkills(c);

        // V6.0: 基础属性 + 经验条
        const lv = c.level || 1;
        const maxHp = c.maxHp || c.maxbase[0] || 1;
        const maxMp = c.maxMp || c.maxbase[1] || 1;
        const atk = c.cflag ? (c.cflag[11] || 20) : 20;
        const def = c.cflag ? (c.cflag[12] || 15) : 15;
        const spd = c.cflag ? (c.cflag[13] || 10) : 10;
        const power = this._calcCombatPower(c);

        // EXP条
        const game = (typeof G !== 'undefined') ? G : null;
        let expHtml2 = '';
        if (game && game._calcLevelUpExp) {
            const needExp = game._calcLevelUpExp(lv);
            const curExp = c.exp[102] || 0;
            const expPct = Math.min(100, Math.floor(curExp / needExp * 100));
            // 检查是否卡级
            const nextLock = Math.ceil((lv + 1) / 20) * 20;
            let lockText = '';
            if (lv >= nextLock - 1 && nextLock <= 200) {
                const lockCfg = window.LEVEL_LOCK_CONFIG ? window.LEVEL_LOCK_CONFIG[nextLock] : null;
                const hasBadge = lockCfg ? game._hasItem(c, lockCfg.badgeId) : true;
                if (!hasBadge) {
                    const badgeDef = window.BADGE_DEFS ? window.BADGE_DEFS[nextLock] : null;
                    lockText = `<span style="color:var(--danger);font-size:0.75rem;"> 🔒需要${badgeDef ? badgeDef.name : '晋升徽章'}突破Lv.${nextLock}</span>`;
                }
            }
            expHtml2 = `
            <div class="chara-section">
                <div class="chara-section-title">经验值 (Lv.${lv}) ${lockText}</div>
                <div style="background:var(--bg-card);border-radius:4px;height:20px;overflow:hidden;border:1px solid var(--border);margin:4px 0;">
                    <div style="background:linear-gradient(90deg,#4ecdc4,#44a08d);height:100%;width:${expPct}%;transition:width 0.3s;display:flex;align-items:center;justify-content:center;">
                        <span style="font-size:0.7rem;color:#fff;text-shadow:0 0 2px rgba(0,0,0,0.5);">${curExp}/${needExp} (${expPct}%)</span>
                    </div>
                </div>
            </div>`;
        }

        const statsHtml = `
        <div class="chara-section">
            <div class="chara-section-title">基础属性 · 综合战力 ⚔️${power}</div>
            <div class="chara-stat-grid">
                <div class="chara-stat-item"><span class="chara-stat-name">生命</span><span class="chara-stat-val">${maxHp}</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">气力</span><span class="chara-stat-val">${maxMp}</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">攻击</span><span class="chara-stat-val">${atk}</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">防御</span><span class="chara-stat-val">${def}</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">速度</span><span class="chara-stat-val">${spd}</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">战力</span><span class="chara-stat-val" style="color:#ff6b6b;font-weight:bold;">⚔️${power}</span></div>
            </div>
        </div>`;

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

        return `${classInfo}${combatSkills}${expHtml2}${statsHtml}
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
        <!-- V6.0: 徽章显示 -->
        ${this._renderBadgeSection(c, isMasterView, charaIndex)}
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

    _renderBadgeSection(c, isMasterView, charaIndex) {
        const items = c.gear ? (c.gear.items || []) : [];
        const badges = items.filter(it => it && it.type === 'badge');
        if (badges.length === 0) return '';
        let badgeHtml = '';
        for (const b of badges) {
            let actionBtn = '';
            if (isMasterView && charaIndex >= 0 && b.badgeType === 'promotion') {
                // 晋升徽章：魔王可以给奴隶/勇者使用
                actionBtn = `<button class="game-btn accent" style="font-size:0.6rem;padding:2px 6px;margin-left:4px;" onclick="UI.useBadge(G, ${charaIndex}, ${b.id})">使用</button>`;
            }
            badgeHtml += `<div class="chara-stat-item">
                <span class="chara-stat-name">${b.icon || '🏅'} ${b.name}</span>
                <span class="chara-stat-val" style="font-size:0.72rem;color:var(--warning);">${b.desc || ''}</span>
                ${actionBtn}
            </div>`;
        }
        return `
        <div class="chara-section">
            <div class="chara-section-title">🏅 徽章</div>
            <div class="chara-stat-grid">${badgeHtml}</div>
        </div>`;
    },

    useBadge(game, charaIndex, badgeId) {
        const c = game.getChara(charaIndex);
        if (!c) return;
        const badge = (c.gear.items || []).find(it => it && it.id === badgeId);
        if (!badge) { UI.showToast('徽章不存在', 'warning'); return; }
        if (badge.badgeType === 'promotion') {
            // 使用晋升徽章：解锁对应等级锁
            const lockLevel = badge.lockLevel;
            UI.showToast(`${c.name}使用了${badge.name}，Lv.${lockLevel}等级锁已解除！`, 'success');
            game._removeItem(c, badgeId);
            UI.renderCharaDetail(game, charaIndex, 3, 'chara');
        } else if (badge.badgeType === 'class_change') {
            UI.showToast(`${badge.name}可在转职界面自动消耗`, 'info');
        }
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
                const isFallen = (c.mark[2] >= 3) || c.talent[85] || (c.mark[0] >= 3);
                let affinityLabel = '普通';
                let affinityColor = '#aaaaaa';
                if (diff <= 10 && isFallen) { affinityLabel = '灵魂共鸣 ✨'; affinityColor = '#ff44aa'; }
                else if (diff <= 10) { affinityLabel = '心意相通 💕'; affinityColor = '#44ff88'; }
                else if (diff <= 25) { affinityLabel = '情投意合 💫'; affinityColor = '#66ccff'; }
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
});
