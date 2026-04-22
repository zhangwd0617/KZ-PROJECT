import sys
sys.stdout.reconfigure(encoding='utf-8')

# 1. Modify Game.js
with open('D:/KZ PROJECT/js/engine/Game.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_event_train = '''    eventTrain(data) {
        const target = this.getTarget();
        if (!target) {
            this.setState("SHOP");
            return;
        }

        // Init training state
        target.resetForTrain();
        this.trainCount = 0;
        this.selectcom = -1;
        this.tflag.fill(0);

        // Train start dialogue
        this.dialogueSystem.onTrainStart(target);

        UI.renderTrain(this);
    }'''

new_event_train = '''    eventTrain(data) {
        const target = this.getTarget();
        if (!target) {
            this.setState("SHOP");
            return;
        }

        // Init training state
        target.resetForTrain();
        this.trainCount = 0;
        this.selectcom = -1;
        this.tflag.fill(0);
        UI._trainHistory = [];
        UI._trainTextInited = false;

        // Train start dialogue
        this.dialogueSystem.onTrainStart(target);

        UI.renderTrain(this);
    }'''

if old_event_train in content:
    content = content.replace(old_event_train, new_event_train)
    print('✅ eventTrain updated')
else:
    print('❌ eventTrain not found')

old_select_cmd = '''    selectCommand(comId) {
        this.selectcom = comId;
        this.trainSystem.execute(comId);
        this.trainCount++;

        // Check if target HP depleted
        const target = this.getTarget();
        if (target && target.hp <= 0) {
            UI.appendText(`\\n【{target.name}昏了过去……】\\n`);
            UI.waitClick(() => this.setState("AFTERTRAIN"));
            return;
        }

        // 继续显示训练界面
        UI.renderTrain(this);
    }'''

new_select_cmd = '''    selectCommand(comId) {
        // 保存上次指令记录到历史，并清空当前显示
        if (this.trainCount > 0 && this.selectcom >= 0) {
            const prevDef = TRAIN_DEFS[this.selectcom];
            UI._saveTrainHistory(this.trainCount, prevDef?.name || '未知');
        }
        UI._clearTrainCurrent();

        this.selectcom = comId;
        this.trainSystem.execute(comId);
        this.trainCount++;

        // Check if target HP depleted
        const target = this.getTarget();
        if (target && target.hp <= 0) {
            UI.appendText(`\\n【${target.name}昏了过去……】\\n`);
            UI.waitClick(() => this.setState("AFTERTRAIN"));
            return;
        }

        // 继续显示训练界面
        UI.renderTrain(this);
    }'''

if old_select_cmd in content:
    content = content.replace(old_select_cmd, new_select_cmd)
    print('✅ selectCommand updated')
else:
    print('❌ selectCommand not found')

with open('D:/KZ PROJECT/js/engine/Game.js', 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Modify UI.js
with open('D:/KZ PROJECT/js/ui/UI.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add history button in _renderTrainStatus
old_status_right = '''        // 右侧：头像 + 按钮
        let rightHtml = '';
        rightHtml += `<div class="train-avatar">👤</div>`;
        rightHtml += `<button class="game-btn danger" style="font-size:0.7rem;padding:3px 8px;width:90px;" onclick="G.endTrain()">⏹ 结束调教</button>`;
        if (assi) {
            rightHtml += `<button class="game-btn" style="font-size:0.7rem;padding:3px 8px;width:90px;" onclick="G.switchTrainTarget()">🔄 切换为${assi.name}</button>`;
        } else {
            rightHtml += `<button class="game-btn" style="font-size:0.7rem;padding:3px 8px;width:90px;opacity:0.4;" disabled title="无助手无法切换">🔄 切换对象</button>`;
        }'''

new_status_right = '''        // 右侧：头像 + 按钮
        let rightHtml = '';
        rightHtml += `<div class="train-avatar">👤</div>`;
        rightHtml += `<button class="game-btn danger" style="font-size:0.7rem;padding:3px 8px;width:90px;" onclick="G.endTrain()">⏹ 结束调教</button>`;
        rightHtml += `<button class="game-btn" style="font-size:0.7rem;padding:3px 8px;width:90px;" onclick="UI.showTrainHistory()">📜 显示历史</button>`;
        if (assi) {
            rightHtml += `<button class="game-btn" style="font-size:0.7rem;padding:3px 8px;width:90px;" onclick="G.switchTrainTarget()">🔄 切换为${assi.name}</button>`;
        } else {
            rightHtml += `<button class="game-btn" style="font-size:0.7rem;padding:3px 8px;width:90px;opacity:0.4;" disabled title="无助手无法切换">🔄 切换对象</button>`;
        }'''

if old_status_right in content:
    content = content.replace(old_status_right, new_status_right)
    print('✅ _renderTrainStatus updated')
else:
    print('❌ _renderTrainStatus not found')

# Add _saveTrainHistory, _clearTrainCurrent, showTrainHistory methods
# Insert before hideTrainStatus
old_hide_status = '''    hideTrainStatus() {
        const bar = document.getElementById('train-status-bar');
        if (bar) bar.style.display = 'none';
    },'''

new_methods = '''    _saveTrainHistory(count, commandName) {
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

    hideTrainStatus() {
        const bar = document.getElementById('train-status-bar');
        if (bar) bar.style.display = 'none';
    },'''

if old_hide_status in content:
    content = content.replace(old_hide_status, new_methods)
    print('✅ history methods added')
else:
    print('❌ hideTrainStatus not found')

with open('D:/KZ PROJECT/js/ui/UI.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
