// Injects methods into the global UI object
Object.assign(UI, {
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
                const days = game.day - (p.cflag[CFLAGS.OBEDIENCE_POINTS] || game.day);
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

        const onTask = taskers.filter(t => (t.chara.cflag[CFLAGS.SLAVE_TASK_TYPE] || 0) !== 0);
        const idle = taskers.filter(t => (t.chara.cflag[CFLAGS.SLAVE_TASK_TYPE] || 0) === 0);

        if (onTask.length > 0) {
            this.appendText(`📋 正在执行任务：`, "success");
            for (const t of onTask) {
                const c = t.chara;
                const taskType = c.cflag[CFLAGS.SLAVE_TASK_TYPE];
                const taskDef = SLAVE_TASK_DEFS[taskType];
                const currentFloor = c.cflag[CFLAGS.SLAVE_TASK_CURRENT_FLOOR] || c.cflag[CFLAGS.SLAVE_TASK_FLOOR] || '?';
                const progress = c.cflag[CFLAGS.SLAVE_TASK_PROGRESS] || 0;
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
            const taskType = c.cflag[CFLAGS.SLAVE_TASK_TYPE];
            const taskDef = SLAVE_TASK_DEFS[taskType];
            const currentFloor = c.cflag[CFLAGS.SLAVE_TASK_CURRENT_FLOOR] || c.cflag[CFLAGS.SLAVE_TASK_FLOOR] || '?';
            const progress = c.cflag[CFLAGS.SLAVE_TASK_PROGRESS] || 0;
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

        if ((c.cflag[CFLAGS.SLAVE_TASK_TYPE] || 0) !== 0) {
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
                const days = game.day - (p.cflag[CFLAGS.OBEDIENCE_POINTS] || game.day);
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
                if ((c.cflag[CFLAGS.SLAVE_TASK_TYPE] || 0) === 0) continue;
                const taskFloor = c.cflag[CFLAGS.SLAVE_TASK_CURRENT_FLOOR] || c.cflag[CFLAGS.SLAVE_TASK_FLOOR] || 10;
                if (taskFloor === fid) {
                    const progress = c.cflag[CFLAGS.SLAVE_TASK_PROGRESS] || 0;
                    const isMaster = game.getMaster() === c;
                    const taskType = c.cflag[CFLAGS.SLAVE_TASK_TYPE] || 0;
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
});
