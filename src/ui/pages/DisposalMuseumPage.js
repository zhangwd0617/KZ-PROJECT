// Injects methods into the global UI object
Object.assign(UI, {
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
            const isMarried = c.cflag[CFLAGS.LOVE_POINTS] ? true : false;
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
        const isMarried = c.cflag[CFLAGS.LOVE_POINTS] ? true : false;
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
        const isMarried = c.cflag[CFLAGS.LOVE_POINTS] ? true : false;
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
            c.cflag[CFLAGS.LOVE_POINTS] = 0;
            c.cflag[CFLAGS.OBEDIENCE_POINTS] = 0;
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
            newHero.cflag[CFLAGS.BASE_HP] = c.level;
            newHero.cflag[CFLAGS.ATK] = c.cflag[CFLAGS.ATK] || 20;
            newHero.cflag[CFLAGS.DEF] = c.cflag[CFLAGS.DEF] || 15;
            newHero.cflag[CFLAGS.SPD] = c.cflag[CFLAGS.SPD] || 10;
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
});
