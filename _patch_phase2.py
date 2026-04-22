import sys
sys.stdout.reconfigure(encoding='utf-8')

# 1. EventSystem.js - 添加概率检查
with open('D:/KZ PROJECT/js/systems/EventSystem.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_process = '''    _processDailyEvents(count) {
        const results = [];
        for (let i = 0; i < count; i++) {
            const evt = this._pickWeightedDailyEvent();
            const result = evt.handler(this.game);
            if (result) results.push({ type: 'daily', ...result });
        }
        return results;
    }'''

new_process = '''    _processDailyEvents(count) {
        const results = [];
        const triggerRate = this.game.flag[502] !== undefined ? this.game.flag[502] : 10;
        for (let i = 0; i < count; i++) {
            if (RAND(100) >= triggerRate) continue;
            const evt = this._pickWeightedDailyEvent();
            const result = evt.handler(this.game);
            if (result) results.push({ type: 'daily', ...result });
        }
        return results;
    }'''

if old_process in content:
    content = content.replace(old_process, new_process)
    print('✅ EventSystem._processDailyEvents updated')
else:
    print('❌ EventSystem._processDailyEvents not found')

with open('D:/KZ PROJECT/js/systems/EventSystem.js', 'w', encoding='utf-8') as f:
    f.write(content)

# 2. UI.js - renderConfig 添加概率设定
with open('D:/KZ PROJECT/js/ui/UI.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_config = '''        // 日常事件数量设定
        const dailyCount = game.flag[501] || 2;
        this.appendText(`日常事件数量`, "accent");
        this.appendText(`当前: 每天 ${dailyCount} 个事件`);
        this.appendText(`每日结束时触发的魔王城日常事件数量。`);
        this.appendDivider();

        this.clearButtons();
        let html = '<div class="btn-grid">';
        html += `<div style="grid-column:1/-1;font-weight:bold;color:var(--accent);">勇者性别比例</div>`;'''

new_config = '''        // 日常事件数量设定
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
        html += `<div style="grid-column:1/-1;font-weight:bold;color:var(--accent);">勇者性别比例</div>`;'''

if old_config in content:
    content = content.replace(old_config, new_config)
    print('✅ UI.renderConfig text updated')
else:
    print('❌ UI.renderConfig text not found')

old_config_btns = '''        html += `<div style="grid-column:1/-1;font-weight:bold;color:var(--accent);margin-top:4px;">日常事件数量</div>`;
        html += `<button class="game-btn" onclick="G.flag[501] = Math.max(0, (G.flag[501]||2) - 1); UI.renderConfig(G)">➖ 减少1个</button>`;
        html += `<button class="game-btn" onclick="G.flag[501] = Math.min(5, (G.flag[501]||2) + 1); UI.renderConfig(G)">➕ 增加1个</button>`;
        html += `<button class="game-btn" onclick="G.flag[501] = 2; UI.renderConfig(G)">恢复默认 (2个)</button>`;
        html += '</div>';'''

new_config_btns = '''        html += `<div style="grid-column:1/-1;font-weight:bold;color:var(--accent);margin-top:4px;">日常事件数量</div>`;
        html += `<button class="game-btn" onclick="G.flag[501] = Math.max(0, (G.flag[501]||2) - 1); UI.renderConfig(G)">➖ 减少1个</button>`;
        html += `<button class="game-btn" onclick="G.flag[501] = Math.min(5, (G.flag[501]||2) + 1); UI.renderConfig(G)">➕ 增加1个</button>`;
        html += `<button class="game-btn" onclick="G.flag[501] = 2; UI.renderConfig(G)">恢复默认 (2个)</button>`;
        html += `<div style="grid-column:1/-1;font-weight:bold;color:var(--accent);margin-top:4px;">日常事件触发概率</div>`;
        html += `<button class="game-btn" onclick="G.flag[502] = Math.max(0, (G.flag[502]!==undefined?G.flag[502]:10) - 5); UI.renderConfig(G)">➖ -5%</button>`;
        html += `<button class="game-btn" onclick="G.flag[502] = Math.min(100, (G.flag[502]!==undefined?G.flag[502]:10) + 5); UI.renderConfig(G)">➕ +5%</button>`;
        html += `<button class="game-btn" onclick="G.flag[502] = 0; UI.renderConfig(G)">0% (关闭)</button>`;
        html += `<button class="game-btn" onclick="G.flag[502] = 100; UI.renderConfig(G)">100% (必触发)</button>`;
        html += `<button class="game-btn" onclick="G.flag[502] = 10; UI.renderConfig(G)">恢复默认 (10%)</button>`;
        html += '</div>';'''

if old_config_btns in content:
    content = content.replace(old_config_btns, new_config_btns)
    print('✅ UI.renderConfig buttons updated')
else:
    print('❌ UI.renderConfig buttons not found')

with open('D:/KZ PROJECT/js/ui/UI.js', 'w', encoding='utf-8') as f:
    f.write(content)

# 3. index.html - 弹窗尺寸固定
with open('D:/KZ PROJECT/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_modal = '''.modal-box {
    background: var(--bg-panel);
    border: 1px solid var(--border);
    border-radius: 12px;
    width: 90%;
    max-width: 520px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow);
}'''

new_modal = '''.modal-box {
    background: var(--bg-panel);
    border: 1px solid var(--border);
    border-radius: 12px;
    width: 520px;
    max-width: 92vw;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: var(--shadow);
}'''

if old_modal in content:
    content = content.replace(old_modal, new_modal)
    print('✅ modal-box CSS updated')
else:
    print('❌ modal-box CSS not found')

with open('D:/KZ PROJECT/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
