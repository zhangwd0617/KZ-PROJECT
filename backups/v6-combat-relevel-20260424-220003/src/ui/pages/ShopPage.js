// Injects methods into the global UI object
Object.assign(UI, {
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
});
