with open('js/engine/Game.js', 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# Patch 1: eventTrain - reset assistant stamina
old_eventtrain = '''        // Reset part gauges for new train session
        if (target.partGauge) target.partGauge.fill(0);
        if (target.orgasmCooldown) target.orgasmCooldown.fill(0);
        target.totalOrgasmGauge = 0;
        target.isCharging = false;
        target.chargeLevel = 0;
        target.chargeTurns = 0;'''

new_eventtrain = '''        // Reset part gauges for new train session
        if (target.partGauge) target.partGauge.fill(0);
        if (target.orgasmCooldown) target.orgasmCooldown.fill(0);
        target.totalOrgasmGauge = 0;
        target.isCharging = false;
        target.chargeLevel = 0;
        target.chargeTurns = 0;

        // Reset assistant stamina & rest flags
        const assi = this.getAssi();
        if (assi) {
            assi._assistantStamina = assi._assistantMaxStamina || 80;
            assi._assistantRestNextTurn = false;
        }'''

if old_eventtrain in content:
    content = content.replace(old_eventtrain, new_eventtrain)
    print('Patch A OK: eventTrain assistant stamina reset')
else:
    print('Patch A FAIL')

# Patch 2: _executeAssistantCommand - add stamina checks & same-sex/same-route bonuses
old_assi = '''    _executeAssistantCommand(comId) {
        this._assistantParticipatedThisTrain = true;
        const assi = this.getAssi();
        const target = this.getTarget();
        if (comId === 900) {
            if (!assi) { UI.appendText(`没有助手，无法代行。\\n`, "warning"); return; }
            UI.appendText(`\\n${assi.name}代替魔王执行调教，${target.name}的体验略有不同……\\n`, "info");
            this.trainSystem.execute(this.selectcom >= 0 ? this.selectcom : 0);
            if (assi.energy !== undefined) assi.energy -= 5;
        } else if (comId === 901) {
            if (!assi) { UI.appendText(`没有助手，无法参与。\\n`, "warning"); return; }
            UI.appendText(`\\n${assi.name}加入了调教，${target.name}的快感倍增！\\n`, "info");
            this.trainSystem.execute(this.selectcom >= 0 ? this.selectcom : 0);
            if (target.addPartGain) for (let i = 0; i < 8; i++) target.addPartGain(i, Math.floor((target.partGauge[i] || 0) * 0.2));
            if (assi.energy !== undefined) assi.energy -= 3;
        }
    }'''

new_assi = '''    _executeAssistantCommand(comId) {
        this._assistantParticipatedThisTrain = true;
        const assi = this.getAssi();
        const target = this.getTarget();
        if (comId === 900) {
            if (!assi) { UI.appendText(`没有助手，无法代行。\\n`, "warning"); return; }
            // 检查助手临时体力（<20%无法代行）
            const assiStaminaPct = (assi._assistantMaxStamina || 80) > 0 ? (assi._assistantStamina / (assi._assistantMaxStamina || 80)) : 1;
            if (assiStaminaPct < 0.20) {
                UI.appendText(`【${assi.name}体力不足，无法代行...（${assi._assistantStamina}/${assi._assistantMaxStamina}）】\\n`, "warning");
                return;
            }
            UI.appendText(`\\n${assi.name}代替魔王执行调教，${target.name}的体验略有不同……\\n`, "info");
            this.trainSystem.execute(this.selectcom >= 0 ? this.selectcom : 0);
            // 主奴获得90%PALAM（代行不如魔王熟练）
            for (let i = 0; i < target.palam.length; i++) {
                if (target.palam[i] > 0) target.palam[i] = Math.floor(target.palam[i] * 0.9);
            }
            // 消耗助手体力
            assi._assistantStamina -= 15;
            if (assi.energy !== undefined) assi.energy -= 5;
            // 代行后下回合自动休息
            assi._assistantRestNextTurn = true;
            UI.appendText(`【${assi.name}代行后需要休息一回合】\\n`, "dim");
        } else if (comId === 901) {
            if (!assi) { UI.appendText(`没有助手，无法参与。\\n`, "warning"); return; }
            // 检查助手体力
            if (assi._assistantStamina <= 0) {
                UI.appendText(`【${assi.name}已经脱力，无法参与...】\\n`, "warning");
                return;
            }
            UI.appendText(`\\n${assi.name}加入了调教，${target.name}的快感倍增！\\n`, "info");
            this.trainSystem.execute(this.selectcom >= 0 ? this.selectcom : 0);

            // 同性/同路线检测
            const sameSex = (assi.talent[121] && target.talent[121]) || (assi.talent[122] && target.talent[122]);
            const sameRoute = (assi.mainRoute >= 0 && assi.mainRoute === target.mainRoute);
            let bonuses = [];
            if (sameSex) bonuses.push("同性共鸣：羞耻+20%");
            if (sameRoute) bonuses.push("同路线共鸣：+25%");
            if (bonuses.length > 0) UI.appendText(`【${bonuses.join("、")}】\\n`, "info");

            // 主奴部位快感+20%（基础）+同性/同路线额外
            if (target.addPartGain) {
                for (let i = 0; i < 8; i++) {
                    let boost = 0.2;
                    if (sameRoute) boost += 0.25;
                    target.addPartGain(i, Math.floor((target.partGauge[i] || 0) * boost));
                }
            }
            // 助手获得70%PALAM（简化：复制快感到助手）
            if (assi.addPartGain) {
                for (let i = 0; i < 8; i++) {
                    let ratio = 0.7;
                    if (sameSex && [0,1,2,3,14,15].includes(i)) ratio += 0.20; // 同性快感加成
                    if (sameRoute) ratio += 0.25;
                    assi.addPartGain(i, Math.floor((target.partGauge[i] || 0) * ratio));
                }
            }

            // 消耗助手体力
            assi._assistantStamina -= 10;
            if (assi.energy !== undefined) assi.energy -= 3;

            // 检查助手脱力
            if (assi._assistantStamina <= 0) {
                UI.appendText(`【${assi.name}在参与中脱力了...】\\n`, "danger");
            }
        }
    }'''

if old_assi in content:
    content = content.replace(old_assi, new_assi)
    print('Patch B OK: assistant command stamina & bonuses')
else:
    print('Patch B FAIL')

# Patch 3: selectCommand - add assistant rest check
old_sc = '''        // === P0: Self-destruct (坏掉时每回合-3%体力) ===
        if (target && target.energy !== undefined && target.maxbase[2] > 0) {'''

new_sc = '''        // === P1: Assistant rest check ===
        const assi = this.getAssi();
        if (assi && assi._assistantRestNextTurn) {
            UI.appendText(`【${assi.name}正在休息，无法行动...】\\n`, "dim");
            assi._assistantRestNextTurn = false;
        }

        // === P0: Self-destruct (坏掉时每回合-3%体力) ===
        if (target && target.energy !== undefined && target.maxbase[2] > 0) {'''

if old_sc in content:
    content = content.replace(old_sc, new_sc)
    print('Patch C OK: assistant rest check')
else:
    print('Patch C FAIL')

with open('js/engine/Game.js', 'w', encoding='utf-8') as f:
    f.write(content)
