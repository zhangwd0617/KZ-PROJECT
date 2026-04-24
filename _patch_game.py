with open('js/engine/Game.js', 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# Patch 1: selectCommand - add faint + self-destruct checks
old_select = '''    selectCommand(comId) {
        // 保存上次指令记录到历史，并清空当前显示
        if (this.trainCount > 0 && this.selectcom >= 0) {
            const prevDef = TRAIN_DEFS[this.selectcom];
            UI._saveTrainHistory(this.trainCount, prevDef?.name || '未知');
        }
        UI._clearTrainCurrent();

        this.selectcom = comId;'''

new_select = '''    selectCommand(comId) {
        const target = this.getTarget();

        // === P0: Faint check (崩解失神跳过下回合) ===
        if (target && target._faintNextTurn) {
            UI.appendText(`【${target.name}还处于失神状态，无法行动...】\\n`, "dim");
            target._faintNextTurn = false;
            this.trainCount++;
            // 体力归零检查
            if (target.hp <= 0) {
                UI.appendText(`\\n【${target.name}昏了过去……】\\n`);
                this.setState("AFTERTRAIN");
                return;
            }
            UI.renderTrain(this);
            return;
        }

        // === P0: Self-destruct (坏掉时每回合-3%体力) ===
        if (target && target.energy !== undefined && target.maxbase[2] > 0) {
            const energyState = target.getEnergyState ? target.getEnergyState() : null;
            if (energyState && energyState.special && energyState.special.effect === "self_destruct") {
                const staminaLoss = Math.max(1, Math.floor(target.maxbase[2] * 0.03));
                target.stamina = Math.max(0, target.stamina - staminaLoss);
                target.base[2] = target.stamina;
                UI.appendText(`【${target.name}在坏掉的状态下，肉体开始自毁...体力-${staminaLoss}】\\n`, "danger");
            }
        }

        // 保存上次指令记录到历史，并清空当前显示
        if (this.trainCount > 0 && this.selectcom >= 0) {
            const prevDef = TRAIN_DEFS[this.selectcom];
            UI._saveTrainHistory(this.trainCount, prevDef?.name || '未知');
        }
        UI._clearTrainCurrent();

        this.selectcom = comId;'''

if old_select in content:
    content = content.replace(old_select, new_select)
    print('Patch 1 OK: selectCommand')
else:
    print('Patch 1 FAIL: selectCommand not found')

# Patch 2: eventAfterTrain - add collapse settlement
old_after = '''        if (target) {
            // train end dialogue
            this.dialogueSystem.onTrainEnd(target);
            target.endTrain();'''

new_after = '''        if (target) {
            // train end dialogue
            this.dialogueSystem.onTrainEnd(target);
            target.endTrain();

            // === P0: Collapse settlement (energy 0%) ===
            if (target.energy !== undefined && target._maxEnergy > 0 && target.energy <= 0) {
                UI.appendText(`【${target.name}精神崩溃了...】\\n`, "danger");
                // One-time talent gain based on main route
                const mainRoute = target.mainRoute;
                const routeTalentMap = {
                    0: 70,   // 顺从路线 -> 顺从之心
                    1: 71,   // 欲望路线 -> 欲望之火
                    2: 76,   // 痛苦路线 -> 痛苦承受
                    3: 72,   // 露出路线 -> 露出癖
                    4: 73    // 支配路线 -> 支配欲
                };
                const routeNames = ['顺从', '欲望', '痛苦', '露出', '支配'];
                if (mainRoute >= 0 && routeTalentMap[mainRoute] !== undefined) {
                    const tid = routeTalentMap[mainRoute];
                    if (!target.talent[tid]) {
                        target.talent[tid] = 1;
                        const tName = (typeof TALENT_DEFS !== 'undefined' && TALENT_DEFS[tid]) ? TALENT_DEFS[tid].name : '路线感悟';
                        UI.appendText(`【崩溃中顿悟】${target.name}获得了「${tName}」！\\n`, "accent");
                    }
                } else {
                    UI.appendText(`【${target.name}在${routeNames[mainRoute] || '未知'}路线中获得了新的感悟...】\\n`, "accent");
                }
                // Recover 15% energy for next train
                const recoverEnergy = Math.floor(target._maxEnergy * 0.15);
                target.energy = recoverEnergy;
                UI.appendText(`【${target.name}的气力恢复至${recoverEnergy}】\\n`, "info");
            }'''

if old_after in content:
    content = content.replace(old_after, new_after)
    print('Patch 2 OK: eventAfterTrain collapse')
else:
    print('Patch 2 FAIL: eventAfterTrain not found')

with open('js/engine/Game.js', 'w', encoding='utf-8') as f:
    f.write(content)
