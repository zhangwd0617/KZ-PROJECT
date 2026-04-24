import re

# === Fix Game.js ===
with open(r'D:\KZ PROJECT\js\engine\Game.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. eventAfterTrain route exp: add sameRouteExpMult
old1 = '''            // === NEW (P2): Route EXP settlement from source ===
            if (target.source) {
                const routeMap = [
                    { palam: 4,  route: 0 },   // 顺从
                    { palam: 5,  route: 1 },   // 欲情 -> 欲望
                    { palam: 16, route: 2 },   // 痛苦
                    { palam: 8,  route: 3 },   // 羞耻 -> 露出
                    { palam: 20, route: 4 }    // 支配(反感/支配感)
                ];
                for (const m of routeMap) {
                    const val = target.source[m.palam] || target.palam[m.palam] || 0;
                    if (val > 0 && target.addRouteExp) {
                        target.addRouteExp(m.route, Math.floor(val / 100));
                    }
                }
            }'''

new1 = '''            // === NEW (P2): Route EXP settlement from source ===
            if (target.source) {
                const routeMap = [
                    { palam: 4,  route: 0 },   // 顺从
                    { palam: 5,  route: 1 },   // 欲情 -> 欲望
                    { palam: 16, route: 2 },   // 痛苦
                    { palam: 8,  route: 3 },   // 羞耻 -> 露出
                    { palam: 20, route: 4 }    // 支配(反感/支配感)
                ];
                // Check assistant same-route exp multiplier (Stage5 buff)
                let sameRouteMult = 1.0;
                if (assi && assi._assistantBuff && assi._assistantBuff.sameRouteExpMult) {
                    if (target.mainRoute >= 0 && assi.mainRoute === target.mainRoute) {
                        sameRouteMult = assi._assistantBuff.sameRouteExpMult;
                    }
                }
                for (const m of routeMap) {
                    const val = target.source[m.palam] || target.palam[m.palam] || 0;
                    if (val > 0 && target.addRouteExp) {
                        let expGain = Math.floor(val / 100);
                        if (sameRouteMult > 1.0 && m.route === target.mainRoute) {
                            expGain = Math.floor(expGain * sameRouteMult);
                        }
                        target.addRouteExp(m.route, expGain);
                    }
                }
            }'''

content = content.replace(old1, new1)

# 2. eventTrain: add wetStart and postOrgasmBoost
old2 = '''        // Reset assistant stamina & rest flags
        const assi = this.getAssi();
        if (assi) {
            assi._assistantStamina = assi._assistantMaxStamina || 80;
            assi._assistantRestNextTurn = false;
        }'''

new2 = '''        // Reset assistant stamina & rest flags
        const assi = this.getAssi();
        if (assi) {
            assi._assistantStamina = assi._assistantMaxStamina || 80;
            assi._assistantRestNextTurn = false;
            // === NEW (P2-2): Stage5 assistant buffs - wetStart ===
            if (assi._assistantBuff && assi._assistantBuff.wetStart) {
                target.addPalam(3, assi._assistantBuff.wetStart); // 润滑PALAM
                UI.appendText(`【${assi.name}的秘术让${target.name}提前湿润了...（润滑+${assi._assistantBuff.wetStart}）】\\n`, 'info');
            }
            // === NEW (P2-2): postOrgasmBoost - apply if set from previous train ===
            if (target._postOrgasmBoostNextTrain) {
                const boostAmount = target._postOrgasmBoostNextTrain;
                for (let i = 0; i < target.palam.length; i++) {
                    if (target.palam[i] > 0) target.addPalam(i, boostAmount);
                }
                UI.appendText(`【${target.name}还沉浸在先前的绝顶余韵中...（全PALAM+${boostAmount}）】\\n`, 'accent');
                target._postOrgasmBoostNextTrain = 0;
            }
        }'''

content = content.replace(old2, new2)

with open(r'D:\KZ PROJECT\js\engine\Game.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Game.js done')

# === Fix TrainSystem.js ===
with open(r'D:\KZ PROJECT\js\systems\TrainSystem.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 3. postOrgasmBoost after applyOrgasm
old3 = '''                // 8. Apply orgasm
                if (typeof applyOrgasm === 'function') {
                    const result = applyOrgasm(target, orgasmResult);
                    if (result && result.msg) UI.appendText(result.msg + "\\n", "accent");
                    if (result && result.line) UI.appendText(result.line + "\\n", "info");
                    if (result && result.riskTriggered && result.riskType === "ultimate_awakening") {
                        target.talent[291] = 1; // 全觉之体
                    }
                }

                // Dialogue trigger
                if (this.game.dialogueSystem) this.game.dialogueSystem.onPalamCng(target, "climax");'''

new3 = '''                // 8. Apply orgasm
                if (typeof applyOrgasm === 'function') {
                    const result = applyOrgasm(target, orgasmResult);
                    if (result && result.msg) UI.appendText(result.msg + "\\n", "accent");
                    if (result && result.line) UI.appendText(result.line + "\\n", "info");
                    if (result && result.riskTriggered && result.riskType === "ultimate_awakening") {
                        target.talent[291] = 1; // 全觉之体
                    }
                }

                // === NEW (P2-2): Stage5 assistant buff - postOrgasmBoost ===
                const assiOrgasm = this.game.getAssi();
                if (assiOrgasm && assiOrgasm._assistantBuff && assiOrgasm._assistantBuff.postOrgasmBoost) {
                    target._postOrgasmBoostNextTrain = assiOrgasm._assistantBuff.postOrgasmBoost;
                    UI.appendText(`【${assiOrgasm.name}的秘术将快感封印在${target.name}体内...（下回合全PALAM+${assiOrgasm._assistantBuff.postOrgasmBoost}）】\\n`, 'accent');
                }

                // Dialogue trigger
                if (this.game.dialogueSystem) this.game.dialogueSystem.onPalamCng(target, "climax");'''

content = content.replace(old3, new3)

# 4. mark acquisition with markExpMult
old4 = '''        // Check mark acquisition
        if (target.palam[9] > 5000 && target.mark[0] < 3) { // Pain -> Pain mark
            if (RAND(3) === 0) {
                target.addMark(0, 1);
                UI.appendText(`【${target.name}获得了苦痛刻印 Lv.${target.mark[0]}】\\n`);
                if (this.game.dialogueSystem) this.game.dialogueSystem.onMarkCng(target, "pain_lv" + target.mark[0]);
            }
        }
        if (target.palam[5] > 8000 && target.mark[1] < 3) { // Lust -> Pleasure mark
            if (RAND(3) === 0) {
                target.addMark(1, 1);
                UI.appendText(`【${target.name}获得了快乐刻印 Lv.${target.mark[1]}】\\n`);
                if (this.game.dialogueSystem) this.game.dialogueSystem.onMarkCng(target, "pleasure_lv" + target.mark[1]);
            }
        }
        if (target.palam[6] > 6000 && target.mark[2] < 3) { // Yield -> Yield mark
            if (RAND(3) === 0) {
                target.addMark(2, 1);
                UI.appendText(`【${target.name}获得了屈服刻印 Lv.${target.mark[2]}】\\n`);
                if (this.game.dialogueSystem) this.game.dialogueSystem.onMarkCng(target, "yield_lv" + target.mark[2]);
            }
        }'''

new4 = '''        // Check mark acquisition
        // === NEW (P2-2): Stage5 assistant buff - markExpMult ===
        const assiMark = this.game.getAssi();
        let markChanceBase = 3;
        let markExpMult = 1.0;
        if (assiMark && assiMark._assistantBuff && assiMark._assistantBuff.markExpMult) {
            markExpMult = assiMark._assistantBuff.markExpMult;
            markChanceBase = Math.max(1, Math.floor(markChanceBase / markExpMult));
        }
        if (target.palam[9] > 5000 && target.mark[0] < 3) { // Pain -> Pain mark
            if (RAND(markChanceBase) === 0) {
                const addLv = Math.max(1, Math.floor(1 * markExpMult));
                target.addMark(0, addLv);
                UI.appendText(`【${target.name}获得了苦痛刻印 Lv.${target.mark[0]}】\\n`);
                if (this.game.dialogueSystem) this.game.dialogueSystem.onMarkCng(target, "pain_lv" + target.mark[0]);
            }
        }
        if (target.palam[5] > 8000 && target.mark[1] < 3) { // Lust -> Pleasure mark
            if (RAND(markChanceBase) === 0) {
                const addLv = Math.max(1, Math.floor(1 * markExpMult));
                target.addMark(1, addLv);
                UI.appendText(`【${target.name}获得了快乐刻印 Lv.${target.mark[1]}】\\n`);
                if (this.game.dialogueSystem) this.game.dialogueSystem.onMarkCng(target, "pleasure_lv" + target.mark[1]);
            }
        }
        if (target.palam[6] > 6000 && target.mark[2] < 3) { // Yield -> Yield mark
            if (RAND(markChanceBase) === 0) {
                const addLv = Math.max(1, Math.floor(1 * markExpMult));
                target.addMark(2, addLv);
                UI.appendText(`【${target.name}获得了屈服刻印 Lv.${target.mark[2]}】\\n`);
                if (this.game.dialogueSystem) this.game.dialogueSystem.onMarkCng(target, "yield_lv" + target.mark[2]);
            }
        }'''

content = content.replace(old4, new4)

with open(r'D:\KZ PROJECT\js\systems\TrainSystem.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('TrainSystem.js done')
print('All P2-2 Stage5 buff effects applied!')
