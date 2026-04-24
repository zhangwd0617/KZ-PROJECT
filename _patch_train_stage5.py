with open('js/systems/TrainSystem.js', 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# Patch 1: In execute(), after _applyPartBasedSystem, before _postProcess, add SM mult
old1 = '''        // === NEW (P2/P3): Part-based orgasm system ===
        this._applyPartBasedSystem(comId, target, master);

        // 4. Post-process (SOURCE -> PALAM, climax/mark checks)
        this._postProcess(target, master);'''

new1 = '''        // === NEW (P2/P3): Part-based orgasm system ===
        this._applyPartBasedSystem(comId, target, master);

        // === P2: Assistant Stage5 SM buff ===
        const assi = this.game.getAssi();
        if (assi && assi._assistantBuff && assi._assistantBuff.smMult) {
            const def2 = TRAIN_DEFS[comId];
            if (def2 && def2.category === "sm") {
                for (let i = 0; i < target.source.length; i++) {
                    if (target.source[i] > 0) {
                        target.source[i] = Math.floor(target.source[i] * assi._assistantBuff.smMult);
                    }
                }
            }
        }

        // 4. Post-process (SOURCE -> PALAM, climax/mark checks)
        this._postProcess(target, master);

        // === P2: Assistant Stage5 buff effects (after post-process) ===
        this._applyAssistantStage5Buff(target);'''

if old1 in content:
    content = content.replace(old1, new1)
    print('Patch 1 OK: SM mult + buff hook')
else:
    print('Patch 1 FAIL')

# Patch 2: Add _applyAssistantStage5Buff method before _postProcess
old2 = '''    _postProcess(target, master) {'''

new2 = '''    _applyAssistantStage5Buff(target) {
        const assi = this.game.getAssi();
        if (!assi || !assi._assistantBuff) return;
        const buff = assi._assistantBuff;
        const effects = [];

        // 顺从: 每回合+50恭顺PALAM
        if (buff.perTurnPalam) {
            for (const [pid, val] of Object.entries(buff.perTurnPalam)) {
                target.addPalam(parseInt(pid), val);
                effects.push(`恭顺+${val}`);
            }
        }

        // 欲望: 快乐\u00d71.25
        if (buff.joyMult && target.palam[5] > 0) {
            target.palam[5] = Math.floor(target.palam[5] * buff.joyMult);
            effects.push(`快乐\u00d7${buff.joyMult}`);
        }

        // 痛苦: 痛苦80%转快乐
        if (buff.painToJoy && target.palam[9] > 0) {
            const transfer = Math.floor(target.palam[9] * buff.painToJoy);
            target.palam[9] -= transfer;
            target.palam[5] = (target.palam[5] || 0) + transfer;
            effects.push(`痛苦\u2192快乐+${transfer}`);
        }

        // 露出: 羞耻\u00d71.3
        if (buff.shameMult && target.palam[8] > 0) {
            target.palam[8] = Math.floor(target.palam[8] * buff.shameMult);
            effects.push(`羞耻\u00d7${buff.shameMult}`);
        }

        // 露出: 副奴在场羞耻\u00d71.2
        if (buff.bystanderShameMult && this.game.bystander >= 0 && target.palam[8] > 0) {
            target.palam[8] = Math.floor(target.palam[8] * buff.bystanderShameMult);
            effects.push(`副奴羞耻\u00d7${buff.bystanderShameMult}`);
        }

        // 支配: 反感50%转恭顺
        if (buff.hateToObey && target.palam[11] > 0) {
            const transfer = Math.floor(target.palam[11] * buff.hateToObey);
            target.palam[11] -= transfer;
            target.palam[4] = (target.palam[4] || 0) + transfer;
            effects.push(`反感\u2192恭顺+${transfer}`);
        }

        if (effects.length > 0) {
            UI.appendText(`【${assi.name}\u52a9\u624b\u589e\u76ca】${effects.join('\\u3001')}】\\n`, "info");
        }
    }

    _postProcess(target, master) {'''

if old2 in content:
    content = content.replace(old2, new2)
    print('Patch 2 OK: _applyAssistantStage5Buff method')
else:
    print('Patch 2 FAIL')

with open('js/systems/TrainSystem.js', 'w', encoding='utf-8') as f:
    f.write(content)
