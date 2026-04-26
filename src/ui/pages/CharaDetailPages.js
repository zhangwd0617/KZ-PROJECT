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
            const isCaptured = c.cflag[CFLAGS.CAPTURE_STATUS] === 1;
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
            let title = c.cstr ? c.cstr[CFLAGS.CURRENT_TITLE] : '';
            if (title && (title.startsWith('{') || title.startsWith('['))) title = '';
            if (title) extra += ` <span style="color:#d4af37;font-size:0.7rem;font-weight:bold;">【${title}】</span>`;
            listHtml += `<button class="game-btn" style="margin-bottom:6px;width:100%;border-left:3px solid ${borderColor};text-align:left;" onclick="UI.renderCharaDetail(G, ${item.index}, 0, 'chara')">${name} ${extra}</button>`;
        }

        // 俘虏列表（被俘获但未完全陷落）
        // 合并 game.characters 中的俘虏 和 game.prisoners 中的监狱俘虏
        const prisonCaptives = game.prisoners || [];
        const allPrisoners = prisonerList.slice(); // 已转为characters但mark<3的
        // 监狱中的俘虏也加入显示，点击时跳转到俘虏管理
        if (prisonCaptives.length > 0) {
            for (let pi = 0; pi < prisonCaptives.length; pi++) {
                const c = prisonCaptives[pi];
                // 检查是否已因转化同时存在于characters中（去重）
                const dup = allPrisoners.find(item => item.chara === c);
                if (!dup) allPrisoners.push({ index: -1 - pi, chara: c, isPrison: true });
            }
        }
        allPrisoners.sort((a, b) => b.chara.level - a.chara.level);

        if (allPrisoners.length > 0) {
            listHtml += `<div style="font-weight:bold;font-size:0.85rem;margin:12px 0 4px;color:var(--danger);">⛓️ 俘虏</div>`;
            for (const item of allPrisoners) {
                const c = item.chara;
                const isPrison = item.isPrison;
                const job = this._getJobName(c);
                const race = (window.APPEARANCE_DESC_DEFS && window.APPEARANCE_DESC_DEFS.race && window.APPEARANCE_DESC_DEFS.race[c.talent[314]]) || '人类';
                const faction = this._getFactionName(c);
                const power = this._calcCombatPower(c);
                let extra = `<span style="color:var(--text-dim);font-size:0.75rem;">Lv.${c.level}</span>`;
                extra += ` <span style="color:#ff6b6b;font-size:0.7rem;font-weight:bold;">⚔️${power}</span>`;
                extra += ` <span style="color:var(--text);font-size:0.72rem;">${job}</span>`;
                extra += ` <span style="color:var(--info);font-size:0.7rem;">${race}</span>`;
                extra += ` <span style="color:var(--warning);font-size:0.7rem;">${faction}</span>`;
                let ptitle = c.cstr ? c.cstr[CFLAGS.CURRENT_TITLE] : '';
                if (ptitle && (ptitle.startsWith('{') || ptitle.startsWith('['))) ptitle = '';
                if (ptitle) extra += ` <span style="color:#d4af37;font-size:0.7rem;font-weight:bold;">【${ptitle}】</span>`;
                if (isPrison) {
                    extra += ` <span style="color:var(--danger);font-size:0.7rem;font-weight:bold;">[监狱]</span>`;
                    listHtml += `<button class="game-btn" style="margin-bottom:6px;width:100%;border-left:3px solid var(--danger);text-align:left;opacity:0.92;" onclick="UI.renderPrison(G)">⛓️${c.name} ${extra}</button>`;
                } else {
                    listHtml += `<button class="game-btn" style="margin-bottom:6px;width:100%;border-left:3px solid var(--danger);text-align:left;opacity:0.92;" onclick="UI.renderCharaDetail(G, ${item.index}, 0, 'chara')">⛓️${c.name} ${extra}</button>`;
                }
            }
        }

        // 入侵勇者（按小队分组→等级降序）
        if (game.invaders.length > 0) {
            const heroList = game.invaders.map((h, i) => ({ index: i, chara: h }));
            // 排序：有队的按小队ID升序排在一起，同小队内按等级降序；无队的按等级降序排最后
            heroList.sort((a, b) => {
                const aSquad = a.chara.cflag[CFLAGS.SQUAD_ID] || 0;
                const bSquad = b.chara.cflag[CFLAGS.SQUAD_ID] || 0;
                const aHasSquad = aSquad > 0 && aSquad < 100;
                const bHasSquad = bSquad > 0 && bSquad < 100;
                if (aHasSquad && !bHasSquad) return -1;
                if (!aHasSquad && bHasSquad) return 1;
                if (aHasSquad && bHasSquad && aSquad !== bSquad) return aSquad - bSquad;
                return b.chara.level - a.chara.level;
            });

            listHtml += `<div style="font-weight:bold;font-size:0.85rem;margin:12px 0 4px;color:var(--danger);">🗡️ 入侵勇者</div>`;
            let lastSquadId = null;
            for (const item of heroList) {
                const c = item.chara;
                const squadId = c.cflag[CFLAGS.SQUAD_ID] || 0;
                const squadName = c.cstr[CSTRS.NAME_ALT] || '';
                const isLeader = c.cflag[CFLAGS.SQUAD_LEADER] === 1;
                const hasSquad = squadId > 0 && squadId < 100;
                // V10.0: 小队进度统一按队长显示
                let floor = game.getHeroFloor(c);
                let progress = game.getHeroProgress(c);
                if (hasSquad && !isLeader) {
                    const leader = game.invaders.find(h => h.cflag[CFLAGS.SQUAD_ID] === squadId && h.cflag[CFLAGS.SQUAD_LEADER] === 1);
                    if (leader) {
                        floor = game.getHeroFloor(leader);
                        progress = game.getHeroProgress(leader);
                    }
                }
                const clsName = this._getHeroClassName(c);
                const race = (window.APPEARANCE_DESC_DEFS && window.APPEARANCE_DESC_DEFS.race && window.APPEARANCE_DESC_DEFS.race[c.talent[314]]) || '人类';
                const faction = this._getFactionName(c);
                const taskLabel = this._getTaskLabel(c);
                const power = this._calcCombatPower(c);

                // 小队分组间隔线
                if (hasSquad && lastSquadId !== null && lastSquadId !== squadId) {
                    listHtml += `<div style="border-top:1px dashed var(--border);margin:4px 0;"></div>`;
                }
                lastSquadId = hasSquad ? squadId : null;

                // V12.0: 勇者态度标签
                const attitude = c.cflag[CFLAGS.HERO_ATTITUDE] || 1;
                let attitudeTag = '';
                let attitudeColor = 'var(--danger)'; // 讨伐型默认红色
                if (attitude === 2) {
                    attitudeTag = '⚖️中立';
                    attitudeColor = '#4ecdc4';
                } else if (attitude === 3) {
                    attitudeTag = '😈倾向魔王';
                    attitudeColor = '#a855f7';
                }

                let extra = `<span style="color:var(--text-dim);font-size:0.75rem;">Lv.${c.level}</span>`;
                extra += ` <span style="color:#ff6b6b;font-size:0.7rem;font-weight:bold;">⚔️${power}</span>`;
                if (clsName) extra += ` <span style="color:var(--text);font-size:0.72rem;">${clsName}</span>`;
                extra += ` <span style="color:var(--info);font-size:0.7rem;">${race}</span>`;
                extra += ` <span style="color:var(--warning);font-size:0.7rem;">${faction}</span>`;
                if (attitudeTag) extra += ` <span style="color:${attitudeColor};font-size:0.7rem;font-weight:bold;">${attitudeTag}</span>`;
                if (taskLabel) extra += ` <span style="color:var(--success);font-size:0.7rem;">📋${taskLabel}</span>`;
                extra += ` <span style="color:var(--danger);font-size:0.7rem;">第${floor}层 ${progress}%</span>`;
                let title = c.cstr ? c.cstr[CFLAGS.CURRENT_TITLE] : '';
                if (title && (title.startsWith('{') || title.startsWith('['))) title = '';
                if (title) extra += ` <span style="color:#d4af37;font-size:0.7rem;font-weight:bold;">【${title}】</span>`;

                // 姓名前缀：有队显示小队名，队长加👑
                let namePrefix = '🗡️ ';
                if (hasSquad) {
                    namePrefix = isLeader ? `👑「${squadName}」` : `　「${squadName}」`;
                }
                listHtml += `<button class="game-btn" style="margin-bottom:6px;width:100%;border-left:3px solid ${attitudeColor};text-align:left;opacity:0.92;" onclick="UI.renderCharaDetail(G, ${item.index}, 0, 'hero')">${namePrefix}${c.name} ${extra}</button>`;
            }
        }

        listHtml += '</div>';
        this.textArea.innerHTML += listHtml;
        this.setButtons(`<button class="back-btn-top" onclick="G.setState('SHOP')">← 返回</button>`);
    },

    // V6.0: 计算综合战力
    // V10.0: 考虑异常状态效果（如重伤减半）
    _calcCombatPower(c) {
        if (!c) return 0;
        const hp = c.maxHp || c.maxbase[0] || 1;
        const mp = c.maxMp || c.maxbase[1] || 1;
        let atk = c.cflag ? (c.cflag[11] || 20) : 20;
        let def = c.cflag ? (c.cflag[12] || 15) : 15;
        let spd = c.cflag ? (c.cflag[13] || 10) : 10;
        // 应用异常状态修正
        if (typeof G !== 'undefined' && G._applyStatusAilmentEffects) {
            const fx = G._applyStatusAilmentEffects(c);
            atk = Math.max(1, Math.floor(atk * (1 + fx.atkMod)));
            def = Math.max(0, Math.floor(def * (1 + fx.defMod)));
            spd = Math.max(1, Math.floor(spd * (1 + fx.spdMod)));
        }
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
        const pages = ['基本信息', '能力经验', '素质背景', '装备道具', '相性关系', '称号履历'];

        let content = '';
        switch (page) {
            case 0: content = this._renderCharaPageBasic(c, job, personality, type); break;
            case 1: content = this._renderCharaPageStats(c, type); break;
            case 2: content = this._renderCharaPageTraits(c, type); break;
            case 3: content = this._renderCharaPageGear(c, type); break;
            case 4: content = this._renderCharaPageRelations(game, c, type); break;
            case 5: content = this._renderCharaPageHistory(c, type); break;
        }

        // V12.0: 勇者态度标签
        let attitudeLabel = '';
        if (type === 'hero') {
            const attitude = c.cflag[CFLAGS.HERO_ATTITUDE] || 1;
            if (attitude === 1) attitudeLabel = ' <span style="color:var(--danger);font-weight:bold;">⚔️讨伐型</span>';
            else if (attitude === 2) attitudeLabel = ' <span style="color:#4ecdc4;font-weight:bold;">⚖️中立型</span>';
            else if (attitude === 3) attitudeLabel = ' <span style="color:#a855f7;font-weight:bold;">😈倾向魔王</span>';
        }

        // 迷你姓名头部（所有页面共用）
        const miniHeader = `
        <div class="chara-page-header-mini" style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--bg-card);border-radius:6px;margin-bottom:10px;border:1px solid var(--border);flex-wrap:wrap;">
            <div style="font-size:1.1rem;font-weight:bold;color:${type==='hero'?'var(--danger)':'var(--text)'};">${type==='hero'?'🗡️ ':''}${c.name}</div>
            <div style="font-size:0.8rem;color:var(--text-dim);">Lv.${c.level} · ⚔️${this._calcCombatPower(c)} · ${job} · ${personality}${attitudeLabel}</div>
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
            const isFallen = (c.mark[0] || 0) >= 3 || (c.mark[2] || 0) >= 3;
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
                const mlvUpGold = 100000;
                const mlvUpMedal = 1;
                const hasGold = G.money >= mlvUpGold;
                const hasMedal = G.getMedalCount(c) >= mlvUpMedal;
                const upDisabled = !hasGold && !hasMedal;
                btnHtml += `<button class="game-btn accent" ${upDisabled?'disabled':''} onclick="const r=G.masterLevelUp();UI.showToast(r.msg,r.success?'success':'warning');UI.renderCharaDetail(G,${index},0,'chara')">💰${mlvUpGold}G / 🏅${mlvUpMedal} 升级</button>`;
            }
            // V9.0: 取消洗脑按钮（仅洗脑角色）
            if (c.talent[296]) {
                btnHtml += `<button class="game-btn warning" onclick="UI.confirmCancelBrainwash(G,${index})">🔮 取消洗脑</button>`;
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
            // V10.0: 堕落按钮
            const fallCheck = G.canFallHero(c);
            if (fallCheck.can) {
                btnHtml += `<button class="game-btn warning" onclick="const r=G.fallHero(c);UI.showToast(r.msg,r.can?'success':'warning');UI.renderCharaDetail(G,${index},0,'chara')">😈 堕落 (${fallCheck.raceName}) 5🏅</button>`;
            } else if (c.cflag[CFLAGS.FALLEN_RACE_ID]) {
                const frName = (window.APPEARANCE_DESC_DEFS && window.APPEARANCE_DESC_DEFS.race && window.APPEARANCE_DESC_DEFS.race[c.cflag[CFLAGS.FALLEN_RACE_ID]]) || '背教者';
                btnHtml += `<button class="game-btn" disabled>😈 已堕落 (${frName})</button>`;
            }
            // V10.0: 晋升按钮（基本→进阶 1勋章 / 基本→魔军基本 2勋章 / 进阶→魔军进阶 3勋章 / 魔军基本→魔军进阶 1勋章）
            const demonCheck = G.canDemonPromote(c);
            if (demonCheck.can) {
                btnHtml += `<button class="game-btn accent" onclick="const r=G.demonPromote(c);UI.showToast(r.msg,r.can?'success':'warning');UI.renderCharaDetail(G,${index},0,'chara')">⚔️ 晋升${demonCheck.targetName} ${demonCheck.cost}🏅</button>`;
            }
            const promoteCheck = G.canPromote(c, true);
            if (promoteCheck.can) {
                btnHtml += `<button class="game-btn" onclick="const r=G.promoteClass(c,true);UI.showToast(r.msg,r.can?'success':'warning');UI.renderCharaDetail(G,${index},0,'chara')">⭐ 强制转职${promoteCheck.advName} 1🏅</button>`;
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
        // V4.0: 陷落判定更新为 mark[0]>=3 或 mark[2]>=3
        if (isCaptured && ((c.mark[0] || 0) >= 3 || (c.mark[2] || 0) >= 3)) {
            const original = (window.APPEARANCE_DESC_DEFS && window.APPEARANCE_DESC_DEFS.raceFaction && window.APPEARANCE_DESC_DEFS.raceFaction[c.talent[314]]) || '未知';
            return `魔王军（原：${original}）`;
        }
        // 按种族返回统一势力名
        return (window.APPEARANCE_DESC_DEFS && window.APPEARANCE_DESC_DEFS.raceFaction && window.APPEARANCE_DESC_DEFS.raceFaction[c.talent[314]]) || '未知势力';
    },

    _getHeroClassName(c) {
        const clsId = c.cflag ? (c.cflag[CFLAGS.CLASS_ID] || c.cflag[CFLAGS.HERO_CLASS]) : 0;
        // V5.0 优先使用 CLASS_DEFS
        if (window.CLASS_DEFS && window.CLASS_DEFS[clsId]) return window.CLASS_DEFS[clsId].name;
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
        // V10.0: 考虑异常状态对HP/MP上限的影响（如重伤减半）
        let displayMaxHp = c.maxHp || c.maxbase[0] || 1;
        let displayMaxMp = c.maxMp || c.maxbase[1] || 1;
        let displayHp = c.hp;
        let displayMp = c.mp;
        if (typeof G !== 'undefined' && G._applyStatusAilmentEffects) {
            const fx = G._applyStatusAilmentEffects(c);
            if (fx.hpMod) {
                displayMaxHp = Math.max(1, Math.floor(displayMaxHp * (1 + fx.hpMod)));
                displayHp = Math.min(displayHp, displayMaxHp);
            }
            if (fx.mpMod) {
                displayMaxMp = Math.max(1, Math.floor(displayMaxMp * (1 + fx.mpMod)));
                displayMp = Math.min(displayMp, displayMaxMp);
            }
        }
        const hpPct = Math.max(0, Math.min(100, displayHp / displayMaxHp * 100));
        const mpPct = Math.max(0, Math.min(100, displayMp / displayMaxMp * 100));

        // V8.0: 稀有度徽章
        const rarity = c.cflag ? (c.cflag[CFLAGS.HERO_RARITY] || 'N') : 'N';
        const rarityColors = { N: '#888', R: '#4a9', SR: '#48f', SSR: '#a4f', UR: '#fa4' };
        const rarityLabels = { N: '普通', R: '精英', SR: '英雄', SSR: '传说', UR: '唯一' };
        const rarityColor = rarityColors[rarity] || '#888';
        const rarityBadge = `【${rarity}】${rarityLabels[rarity] || '普通'}`;

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
                    <div class="chara-stat-item"><span class="chara-stat-name">种族</span><span class="chara-stat-val">${(window.APPEARANCE_DESC_DEFS && window.APPEARANCE_DESC_DEFS.race && window.APPEARANCE_DESC_DEFS.race[c.talent[314]]) || '人类'}${(()=>{const realRace=c.cflag[CFLAGS.FALLEN_RACE_ID]||c.talent[314]||1;const rt=window.RACE_TRAITS?window.RACE_TRAITS[realRace]:null;if(!rt||!rt.element||rt.element.length===0||(rt.element.length===1&&rt.element[0]==='none'))return'';const elNames={fire:'火',ice:'冰',lightning:'雷',wind:'风',earth:'土',water:'水',holy:'圣',dark:'暗',poison:'毒',blood:'血',charm:'魅',pierce:'穿',physical:'物',none:'无'};const tags=rt.element.map(e=>{const icon=window.ELEMENT_ICONS?window.ELEMENT_ICONS[e]:'';const colors={fire:'#c44',ice:'#48f',lightning:'#fa4',wind:'#4a9',earth:'#8b5',water:'#48f',holy:'#d4af37',dark:'#a4f',poison:'#5a5',blood:'#c22',charm:'#f4a',pierce:'#a84',physical:'#888',none:'#888'};return`<span style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:0.7rem;background:${colors[e]||'#444'}22;color:${colors[e]||'#aaa'};margin-left:3px;border:1px solid ${colors[e]||'#444'}44;">${icon||''}${elNames[e]||e}</span>`;}).join('');return tags;})()}</span></div>
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
            <div class="chara-bar-row" style="display:flex;gap:8px;align-items:center;">
                <div style="flex:7;display:flex;align-items:center;gap:4px;">
                    <span class="chara-bar-label">HP</span>
                    <div class="chara-bar-bg" style="flex:1;"><div class="chara-bar-fill" style="width:${hpPct}%"></div></div>
                    <span class="chara-bar-text">${displayHp}/${displayMaxHp}</span>
                </div>
                <div style="flex:3;display:flex;align-items:center;gap:4px;">
                    <span class="chara-bar-label">MP</span>
                    <div class="chara-bar-bg mp" style="flex:1;"><div class="chara-bar-fill mp" style="width:${mpPct}%"></div></div>
                    <span class="chara-bar-text">${displayMp}/${displayMaxMp}</span>
                </div>
            </div>
            ${(() => {
                const ailText = (typeof G !== 'undefined' && G._getStatusAilmentText) ? G._getStatusAilmentText(c) : '';
                if (!ailText) return '';
                return `<div style="margin-top:6px;padding:4px 8px;background:rgba(196,68,68,0.1);border-radius:4px;border-left:3px solid var(--danger);font-size:0.82rem;color:var(--danger);">⚠️ 异常状态：${ailText}</div>`;
            })()}
            <div class="chara-stat-grid" style="margin-top:8px;">
                <div class="chara-stat-item"><span class="chara-stat-name">体力</span><span class="chara-stat-val">${c.stamina || c.maxbase[2] || 0}</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">气力</span><span class="chara-stat-val">${c.energy || 0}/${c.maxEnergy || 100}</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">持有金币</span><span class="chara-stat-val" style="color:var(--success);">💰 ${c.gold || 0}G</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">个人声望</span><span class="chara-stat-val" style="color:var(--warning);">🏆 ${c.fame || 0}</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">稀有度</span><span class="chara-stat-val" style="color:${rarityColor};font-weight:bold;">${rarityBadge}</span></div>
            </div>
        </div>

        ${(!isHero && c.talent[153]) ? `<div class="chara-section" style="border-color:var(--accent);">
            <div class="chara-section-title" style="color:var(--accent);">🤰 妊娠状态</div>
            <div class="chara-stat-grid">
                <div class="chara-stat-item"><span class="chara-stat-name">妊娠天数</span><span class="chara-stat-val" style="color:var(--accent);">${c.cflag[CFLAGS.PREGNANCY_DAYS] || 0} / 30 天</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">预计分娩</span><span class="chara-stat-val" style="color:var(--accent);">${30 - (c.cflag[CFLAGS.PREGNANCY_DAYS] || 0)} 天后</span></div>
            </div>
        </div>` : ''}

        ${(!isHero && c.talent[296]) ? `<div class="chara-section" style="border-color:#a855f7;background:rgba(168,85,247,0.08);">
            <div class="chara-section-title" style="color:#a855f7;">🔮 洗脑状态</div>
            <div style="font-size:0.85rem;color:var(--text);">
                ${c.name} 处于魔王的洗脑控制之下，暂时臣服于魔王军。<br>
                <span style="font-size:0.78rem;color:var(--text-dim);">身体会如实记录所有经历和获得的特质。洗脑可随时取消。</span>
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

        // 可装备武器
        const weaponMap = {
            sword:'🗡️剑', axe:'🪓斧', hammer:'🔨锤', spear:'🔱枪', halberd:'戟',
            staff:'🪄杖', wand:'🔮魔杖', mace:'🔨锤', orb:'🔮宝珠', grimoire:'📖魔导书',
            dagger:'🗡️短剑', claw:'🐾爪', kunai:'苦无', shuriken:'手里剑', ninjato:'忍刀',
            bow:'🏹弓', crossbow:'弩', longbow:'长弓',
            shield:'🛡️盾', flask:'⚗️烧瓶', paper:'📜符咒', instrument:'🎵乐器', harp:'🎵竖琴',
            fist:'👊拳', gauntlet:'👊拳套', fan:'🪭扇', whip:'🪢鞭', syringe:'💉注射器',
            tome:'📖书', elixir:'⚗️灵药', scythe:'⚰️镰', charm_fan:'🪭魅惑扇',
            greatsword:'大剑', dual_axe:'双斧', dual_dagger:'双短剑', holy_sword:'圣剑',
            tower_shield:'塔盾', dragon_lance:'龙枪', sacred_wand:'圣杖', demon_sword:'魔剑'
        };
        const weaponLabels = (def.weapons || []).map(w => weaponMap[w] || w).join(' ');
        const weaponHtml = weaponLabels ? `<div style="font-size:0.75rem;color:var(--warning);margin-top:4px;">⚔️ 可装备：${weaponLabels}</div>` : '';

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
            <div style="font-size:0.9rem;font-weight:bold;margin-bottom:4px;">${tierIcon}${def.name} <span style="color:var(--text-dim);font-size:0.8rem;font-weight:normal;">(${roleLabel})</span>${(()=>{if(!def.element||def.element.length===0||(def.element.length===1&&def.element[0]==='none'))return'';const elNames={fire:'火',ice:'冰',lightning:'雷',wind:'风',earth:'土',water:'水',holy:'圣',dark:'暗',poison:'毒',blood:'血',charm:'魅',pierce:'穿',physical:'物',none:'无'};const tags=def.element.map(e=>{const icon=window.ELEMENT_ICONS?window.ELEMENT_ICONS[e]:'';const colors={fire:'#c44',ice:'#48f',lightning:'#fa4',wind:'#4a9',earth:'#8b5',water:'#48f',holy:'#d4af37',dark:'#a4f',poison:'#5a5',blood:'#c22',charm:'#f4a',pierce:'#a84',physical:'#888',none:'#888'};return`<span style="display:inline-block;padding:1px 6px;border-radius:4px;font-size:0.7rem;background:${colors[e]||'#444'}22;color:${colors[e]||'#aaa'};margin-left:3px;border:1px solid ${colors[e]||'#444'}44;">${icon||''}${elNames[e]||e}</span>`;}).join('');return tags;})()}</div>
            <div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:4px;">${def.desc}</div>
            ${weaponHtml}
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
        // V10.0: 显示异常状态影响后的属性（包括HP/MP减半）
        const lv = c.level || 1;
        let maxHp = c.maxHp || c.maxbase[0] || 1;
        let maxMp = c.maxMp || c.maxbase[1] || 1;
        let atk = c.cflag ? (c.cflag[11] || 20) : 20;
        let def = c.cflag ? (c.cflag[12] || 15) : 15;
        let spd = c.cflag ? (c.cflag[13] || 10) : 10;
        let hasSevere = false;
        // 应用异常状态修正并记录原始值
        if (typeof G !== 'undefined' && G._applyStatusAilmentEffects) {
            const fx = G._applyStatusAilmentEffects(c);
            if (fx.atkMod !== 0 || fx.defMod !== 0 || fx.spdMod !== 0 || fx.hpMod !== 0 || fx.mpMod !== 0) {
                hasSevere = true;
            }
            maxHp = Math.max(1, Math.floor(maxHp * (1 + (fx.hpMod || 0))));
            maxMp = Math.max(1, Math.floor(maxMp * (1 + (fx.mpMod || 0))));
            atk = Math.max(1, Math.floor(atk * (1 + fx.atkMod)));
            def = Math.max(0, Math.floor(def * (1 + fx.defMod)));
            spd = Math.max(1, Math.floor(spd * (1 + fx.spdMod)));
        }
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
                <div style="position:relative;background:var(--bg-card);border-radius:4px;height:20px;overflow:hidden;border:1px solid var(--border);margin:4px 0;">
                    <div style="background:linear-gradient(90deg,#4ecdc4,#44a08d);height:100%;width:${expPct}%;transition:width 0.3s;"></div>
                    <span style="position:absolute;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:0.7rem;color:var(--text);text-shadow:0 0 2px rgba(0,0,0,0.5);">${curExp}/${needExp} (${expPct}%)</span>
                </div>
            </div>`;
        }

        const severeLabel = hasSevere ? `<span style="color:var(--danger);font-size:0.75rem;margin-left:6px;">🩸 重伤（属性减半）</span>` : '';
        const statsHtml = `
        <div class="chara-section">
            <div class="chara-section-title">基础属性 · 综合战力 ⚔️${power}${severeLabel}</div>
            <div class="chara-stat-grid">
                <div class="chara-stat-item"><span class="chara-stat-name">HP</span><span class="chara-stat-val">${maxHp}</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">MP</span><span class="chara-stat-val">${maxMp}</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">攻击</span><span class="chara-stat-val" style="${hasSevere?'color:var(--danger);':''}">${atk}</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">防御</span><span class="chara-stat-val" style="${hasSevere?'color:var(--danger);':''}">${def}</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">速度</span><span class="chara-stat-val" style="${hasSevere?'color:var(--danger);':''}">${spd}</span></div>
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
        // V7.0: 性经历统计整合到经验区
        const sRec = (typeof G !== 'undefined' && G._getSexualRecords) ? G._getSexualRecords(c) : {};
        const sTotal = sRec.totalSexCount || 0;
        const sPartners = (sRec.sexPartners || []).length;
        if (sTotal > 0 || sPartners > 0) {
            expHtml += `<div class="chara-stat-item"><span class="chara-stat-name">💋 性交次数</span><span class="chara-stat-val">${sTotal} 次</span></div>`;
            expHtml += `<div class="chara-stat-item"><span class="chara-stat-name">💋 对象人数</span><span class="chara-stat-val">${sPartners} 人</span></div>`;
            if (sRec.vaginalCount > 0) expHtml += `<div class="chara-stat-item"><span class="chara-stat-name">  阴道</span><span class="chara-stat-val">${sRec.vaginalCount}</span></div>`;
            if (sRec.analCount > 0) expHtml += `<div class="chara-stat-item"><span class="chara-stat-name">  肛门</span><span class="chara-stat-val">${sRec.analCount}</span></div>`;
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

        // 刻印
        let marksHtml = '';
        if (type !== 'hero') {
            for (let i = 0; i < 8; i++) {
                if (c.mark[i] > 0 && MARK_DEFS[i]) {
                    marksHtml += `<div class="chara-mark-item">${MARK_DEFS[i].name}<span class="chara-mark-lv">Lv.${c.mark[i]}</span></div>`;
                }
            }
            if (!marksHtml) marksHtml = '<span style="color:var(--text-dim);font-size:0.8rem;">无刻印</span>';
        }

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
        <div class="chara-two-col">
            <div class="chara-section">
                <div class="chara-section-title">持有珠</div>
                <div class="chara-stat-grid">${juelHtml}</div>
            </div>
            ${type !== 'hero' ? `<div class="chara-section">
                <div class="chara-section-title">刻印</div>
                <div class="chara-mark-list">${marksHtml}</div>
            </div>` : ''}
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
                // 跳过 job/combat_skill（职业和战斗技能已在「职业信息」面板展示）
                if (def.group === 'appearance' || def.group === 'job' || def.group === 'combat_skill') continue;
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

        // V12.0: 心声日记（整合到素质背景页）
        let voiceHtml = '';
        const advData = (typeof G !== 'undefined' && G._getAdventureData) ? G._getAdventureData(c) : { logs: [] };
        const voiceLogs = (advData.logs || []).filter(l => l.type === 'voice').slice(-5);
        if (voiceLogs.length > 0) {
            voiceHtml = '<div class="chara-section" style="border-color:var(--accent-dim);margin-top:12px;">';
            voiceHtml += '<div class="chara-section-title" style="color:var(--accent-dim);">💭 心声日记</div>';
            for (const v of voiceLogs) {
                voiceHtml += `<div class="chara-backstory-item" style="font-style:italic;color:var(--text-dim);margin:4px 0;padding:4px 8px;background:var(--bg);border-radius:4px;"><span style="color:var(--accent-dim);font-weight:bold;">第${v.day}天</span> ${v.text}</div>`;
            }
            voiceHtml += '</div>';
        }

        return `
        <div class="chara-section">
            <div class="chara-section-title">素质</div>
            ${traitsHtml}
        </div>
        ${voiceHtml}
        `;
    },

    _renderCharaPageHistory(c, type = 'chara') {
        const isHero = type === 'hero';

        // V7.0: 称号面板
        let title = c.cstr ? c.cstr[CFLAGS.CURRENT_TITLE] : '';
        // 防御性检查：防止JSON乱码
        if (title && (title.startsWith('{') || title.startsWith('['))) title = '';
        const titleStats = (typeof G !== 'undefined' && G._getTitleStats) ? G._getTitleStats(c) : {};
        const titleHtml = `
        <div class="chara-section" style="border-color:#d4af37;">
            <div class="chara-section-title" style="color:#d4af37;">🏆 称号</div>
            <div style="font-size:1.1rem;font-weight:bold;color:#d4af37;">${title || '无称号'}</div>
            <div style="font-size:0.75rem;color:var(--text-dim);margin-top:6px;">
                精英击杀: ${titleStats.eliteKills || 0} | Boss击杀: ${titleStats.bossKills || 0} | 勇者击杀: ${titleStats.heroKills || 0}
                ${!isHero ? `| 调教: ${titleStats.trainCount || 0} | 高潮: ${titleStats.orgasmCount || 0}` : ''}
            </div>
        </div>`;

        // V7.0: 冒险履历
        const advData = (typeof G !== 'undefined' && G._getAdventureData) ? G._getAdventureData(c) : { logs: [] };
        const logs = advData.logs || [];
        const EVENT_ICONS = {
            first_adventure: '🏰', elite_kill: '⚔️', boss_kill: '👑', rare_item: '💎',
            squad_form: '🤝', squad_leader: '👑', squad_leave: '👋',
            hero_kill: '⚔️', encounter_maou: '👿', encounter_exhero: '💀', encounter_master: '👿',
            betrayal: '🔪', first_betrayal: '😈', level_milestone: '⭐', title_gained: '🏆',
            first_kiss: '💋', first_penetration: '💔', first_orgasm: '🔥', first_anal: '🍑',
            first_train: '⛓️',
            captured: '⛓️', surrender: '🏳️', released: '🔓',
            commission_complete: '📜', floor_clear: '📶',
            class_promote: '⚜️', curse_equip: '🌑',
            severe_injury: '🩸', injury_healed: '💊',
        };
        let logHtml = '';
        if (logs.length === 0) {
            logHtml = '<div style="color:var(--text-dim);font-size:0.85rem;">暂无冒险记录</div>';
        } else {
            logHtml = '<div style="max-height:280px;overflow-y:auto;padding-right:4px;">';
            for (let i = logs.length - 1; i >= 0; i--) {
                const l = logs[i];
                const icon = EVENT_ICONS[l.type] || '📌';
                logHtml += `<div style="font-size:0.82rem;margin:4px 0;padding:3px 0;border-bottom:1px dashed var(--border);">
                    <span style="color:var(--accent);font-weight:bold;">第${l.day}天</span>
                    <span style="color:var(--text-dim);">${icon} ${l.text}</span>
                </div>`;
            }
            logHtml += '</div>';
        }

        // V7.0: 调教履历（所有角色）
        let sexHtml = '';
        const records = (typeof G !== 'undefined' && G._getSexualRecords) ? G._getSexualRecords(c) : {};
        const dayLabel = (d) => d === 0 ? '（入手前）' : `第${d}天`;
        sexHtml = `
        <div class="chara-section" style="border-color:#c44;">
            <div class="chara-section-title" style="color:#c44;">💋 性经历</div>
            <div style="font-size:0.85rem;line-height:1.9;">
                ${records.firstKiss ? `💋 初吻：${dayLabel(records.firstKiss.day)}，${records.firstKiss.partner}` : '💋 初吻：仍保持'}<br>
                ${records.firstPenetration ? `💔 破处：${dayLabel(records.firstPenetration.day)}，${records.firstPenetration.partner}` : '💔 破处：仍是处女'}<br>
                ${records.firstOrgasm ? `🔥 初潮：${dayLabel(records.firstOrgasm.day)}，${records.firstOrgasm.partner}` : '🔥 初潮：尚未经历'}<br>
                ${records.firstAnal ? `🍑 初肛：${dayLabel(records.firstAnal.day)}，${records.firstAnal.partner}` : '🍑 初肛：尚未经历'}<br>
                ${records.firstTrain ? `⛓️ 初调：${dayLabel(records.firstTrain.day)}，${records.firstTrain.partner}` : '⛓️ 初调：尚未经历'}<br>
                ${records.firstPregnancy ? `🤰 初孕：${dayLabel(records.firstPregnancy.day)}，${records.firstPregnancy.partner}` : '🤰 初孕：尚未经历'}
            </div>
            ${(records.trainHistory && records.trainHistory.length > 0) ? `
            <div style="font-size:0.82rem;margin-top:8px;border-top:1px dashed var(--border);padding-top:8px;">
                <b>【调教记录】</b>
                ${records.trainHistory.slice(-10).map(h => `<div style="padding:2px 0;">· 第${h.day}天 — ${h.text}</div>`).join('')}
                ${records.trainHistory.length > 10 ? `<div style="color:var(--text-dim);">...还有 ${records.trainHistory.length - 10} 条更早的记录</div>` : ''}
            </div>` : ''}
        </div>`;

        // 堕落路线（仅奴隶）
        let fallenHtml = '';
        if (!isHero) {
            const routeNames = ['顺从','欲望','痛苦','露出','支配'];
            const routeColors = ['#61afef','#e06c75','#c678dd','#e5c07b','#98c379'];
            const thresholds = [0, 100, 300, 600, 1000, 1500];
            let routeRows = '';
            for (let r = 0; r < 5; r++) {
                const lv = c.routeLevel ? (c.routeLevel[r] || 0) : 0;
                const exp = c.routeExp ? (c.routeExp[r] || 0) : 0;
                const nextExp = thresholds[Math.min(5, lv + 1)];
                const isMain = c.mainRoute === r;
                const isSub = c.subRoutes && c.subRoutes.includes(r);
                const badge = isMain ? '【主】' : (isSub ? '【副】' : '');
                const badgeColor = isMain ? routeColors[r] : (isSub ? routeColors[r] + 'aa' : 'var(--text-dim)');
                let stagesHtml = '';
                for (let s = 1; s <= 5; s++) {
                    const unlocked = lv >= s;
                    const roman = ['I','II','III','IV','V'][s - 1];
                    stagesHtml += `<span style="display:inline-block;width:18px;text-align:center;font-size:0.7rem;border-radius:3px;margin-right:2px;color:${unlocked ? routeColors[r] : 'var(--text-dim)'};background:${unlocked ? routeColors[r] + '22' : 'transparent'};border:${unlocked ? '1px solid ' + routeColors[r] : '1px solid var(--border)'};">${roman}</span>`;
                }
                routeRows += `
                <div style="display:flex;align-items:center;gap:6px;padding:4px 8px;background:rgba(255,255,255,0.02);border-radius:4px;">
                    <span style="font-size:0.72rem;color:${badgeColor};min-width:32px;">${badge}</span>
                    <span style="color:${routeColors[r]};font-weight:bold;font-size:0.85rem;min-width:36px;">${routeNames[r]}</span>
                    <span style="flex:1;text-align:center;">${stagesHtml}</span>
                    <span style="font-size:0.7rem;color:var(--text-dim);min-width:60px;text-align:right;">${exp}/${nextExp}</span>
                </div>`;
            }
            fallenHtml = `
            <div class="chara-section" style="border-color:#a855f7;">
                <div class="chara-section-title" style="color:#a855f7;">🌑 堕落</div>
                <div style="display:flex;flex-direction:column;gap:6px;">${routeRows}</div>
            </div>`;
        }

        return `${titleHtml}
        <div class="chara-section">
            <div class="chara-section-title">📜 冒险履历</div>
            ${logHtml}
        </div>
        ${sexHtml}${fallenHtml}`;
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
                // V8.0: 未鉴定装备显示鉴定按钮
                if (!item.identified) {
                    actionBtns += `<button class="game-btn info" style="font-size:0.65rem;padding:2px 6px;margin-left:4px;" onclick="UI.identifyGear(G, ${charaIndex}, '${s.key}', -1)">🔍 鉴定</button>`;
                }
                // V8.0: 已鉴定的诅咒装备显示解诅咒按钮
                if (item.identified && item.cursed) {
                    const cost = GearSystem.getUncurseCost(item.rarity);
                    actionBtns += `<button class="game-btn warning" style="font-size:0.65rem;padding:2px 6px;margin-left:4px;" onclick="UI.uncurseGear(G, ${charaIndex}, '${s.key}', -1)">✨ 解诅咒(${cost}G)</button>`;
                }
                actionBtns += `<button class="game-btn danger" style="font-size:0.65rem;padding:2px 6px;margin-left:4px;" onclick="UI.unequipGear(G, ${charaIndex}, '${s.key}', -1)">卸下</button>`;
                actionBtns += `<button class="game-btn" style="font-size:0.65rem;padding:2px 6px;margin-left:4px;" onclick="UI.discardGear(G, ${charaIndex}, '${s.key}', -1)">丢弃</button>`;
                actionBtns += `<button class="game-btn accent" style="font-size:0.65rem;padding:2px 6px;margin-left:4px;" onclick="UI.confiscateToMuseum(G, ${charaIndex}, '${s.key}', -1)">没收</button>`;
            }
            armorHtml += `<div class="chara-stat-item"><span class="chara-stat-name">${s.label}</span><span class="chara-stat-val" style="font-size:0.75rem;flex:1;min-width:0;">${desc}</span><span style="white-space:nowrap;flex-shrink:0;">${actionBtns}</span></div>`;
        }
        let weaponHtml = '';
        if (g.weapons && g.weapons.length > 0) {
            for (let i = 0; i < g.weapons.length; i++) {
                const w = g.weapons[i];
                let actionBtns = '';
                if (isMasterView && charaIndex >= 0) {
                    // V8.0: 未鉴定装备显示鉴定按钮
                    if (!w.identified) {
                        actionBtns += `<button class="game-btn info" style="font-size:0.65rem;padding:2px 6px;margin-left:4px;" onclick="UI.identifyGear(G, ${charaIndex}, 'weapon', ${i})">🔍 鉴定</button>`;
                    }
                    // V8.0: 已鉴定的诅咒装备显示解诅咒按钮
                    if (w.identified && w.cursed) {
                        const cost = GearSystem.getUncurseCost(w.rarity);
                        actionBtns += `<button class="game-btn warning" style="font-size:0.65rem;padding:2px 6px;margin-left:4px;" onclick="UI.uncurseGear(G, ${charaIndex}, 'weapon', ${i})">✨ 解诅咒(${cost}G)</button>`;
                    }
                    actionBtns += `<button class="game-btn danger" style="font-size:0.65rem;padding:2px 6px;margin-left:4px;" onclick="UI.unequipGear(G, ${charaIndex}, 'weapon', ${i})">卸下</button>`;
                    actionBtns += `<button class="game-btn" style="font-size:0.65rem;padding:2px 6px;margin-left:4px;" onclick="UI.discardGear(G, ${charaIndex}, 'weapon', ${i})">丢弃</button>`;
                    actionBtns += `<button class="game-btn accent" style="font-size:0.65rem;padding:2px 6px;margin-left:4px;" onclick="UI.confiscateToMuseum(G, ${charaIndex}, 'weapon', ${i})">没收</button>`;
                }
                weaponHtml += `<div class="chara-stat-item"><span class="chara-stat-name">武器${i + 1}</span><span class="chara-stat-val" style="font-size:0.75rem;flex:1;min-width:0;">${GearSystem.getGearDesc(w)}</span><span style="white-space:nowrap;flex-shrink:0;">${actionBtns}</span></div>`;
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
                itemHtml += `<div class="chara-stat-item"><span class="chara-stat-name">道具${i + 1}</span><span class="chara-stat-val" style="font-size:0.75rem;flex:1;min-width:0;">${GearSystem.getGearDesc(it)}</span><span style="white-space:nowrap;flex-shrink:0;">${actionBtns}</span></div>`;
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
                <div class="chara-stat-item"><span class="chara-stat-name">HP</span><span class="chara-stat-val" style="color:${bonus.hp > 0 ? 'var(--success)' : ''}">${bonus.hp > 0 ? '+' : ''}${bonus.hp}</span></div>
                <div class="chara-stat-item"><span class="chara-stat-name">MP</span><span class="chara-stat-val" style="color:${bonus.mp > 0 ? 'var(--success)' : ''}">${bonus.mp > 0 ? '+' : ''}${bonus.mp}</span></div>
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
                const isFallen = (c.mark[0] >= 3) || (c.mark[2] >= 3) || c.talent[85];
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
