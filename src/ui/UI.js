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
        html += `<button class="game-btn" onclick="UI.renderWorldWiki()">📚 世界百科</button>`;
        html += `<button class="game-btn" onclick="G.setState('MAP')">🗺️ 世界地图</button>`;
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


// 训练状态栏已迁移到 #train-status-bar，底部覆盖代码已移除
// UI._renderTrainStatus 现在直接在对象方法中操作 DOM


};
window.UI = UI;
