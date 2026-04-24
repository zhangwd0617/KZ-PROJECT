import re

# === 1. TrainSystem.js: _applyTalentEffects末尾添加personality source修正 + stamina/energyMod ===
with open(r'D:\KZ PROJECT\js\systems\TrainSystem.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1a. personality source修正
old1 = '''        // === 灭世魔王(94) — 主角专属：调教效果+50% ===
        const master = this.game.getMaster();
        if (master && master.talent[94]) {
            for (let i = 0; i < target.source.length; i++) {
                if (target.source[i] > 0) {
                    target.source[i] = Math.floor(target.source[i] * 1.5);
                }
            }
        }
    }'''

new1 = '''        // === 灭世魔王(94) — 主角专属：调教效果+50% ===
        const master = this.game.getMaster();
        if (master && master.talent[94]) {
            for (let i = 0; i < target.source.length; i++) {
                if (target.source[i] > 0) {
                    target.source[i] = Math.floor(target.source[i] * 1.5);
                }
            }
        }

        // === NEW (P3-1): Personality dynamic palamMods ===
        const pEff = target.getPersonalityEffects ? target.getPersonalityEffects() : null;
        if (pEff && pEff.palamMods) {
            for (const k in pEff.palamMods) {
                const pid = parseInt(k);
                const mod = pEff.palamMods[k];
                if (target.source[pid] > 0 && mod !== 0) {
                    target.source[pid] = Math.floor(target.source[pid] * (1 + mod));
                }
            }
        }
    }'''

content = content.replace(old1, new1)

# 1b. stamina/energy消耗处添加personality staminaMod/energyMod
old2 = '''        // 9. Apply stamina/energy costs from meta
        let stmCost = meta.staminaCost?.target || 0;
        // === NEW (P2-3): Stamina save accelerator ===
        if (target._accelStaminaSave > 0 && stmCost > 0) {
            stmCost = Math.floor(stmCost * (1 - target._accelStaminaSave));
        }
        target.stamina = (target.stamina || target.base[2] || 0) - stmCost;
        target.energy = (target.energy || 0) - (meta.energyCost?.target || 0);'''

new2 = '''        // 9. Apply stamina/energy costs from meta
        let stmCost = meta.staminaCost?.target || 0;
        let nrgCost = meta.energyCost?.target || 0;
        // === NEW (P2-3): Stamina save accelerator ===
        if (target._accelStaminaSave > 0 && stmCost > 0) {
            stmCost = Math.floor(stmCost * (1 - target._accelStaminaSave));
        }
        // === NEW (P3-1): Personality stamina/energy mods ===
        const pEffCost = target.getPersonalityEffects ? target.getPersonalityEffects() : null;
        if (pEffCost) {
            if (pEffCost.staminaMod) stmCost = Math.floor(stmCost * (1 - pEffCost.staminaMod));
            if (pEffCost.energyMod) nrgCost = Math.floor(nrgCost * (1 - pEffCost.energyMod));
        }
        target.stamina = (target.stamina || target.base[2] || 0) - stmCost;
        target.energy = (target.energy || 0) - nrgCost;'''

content = content.replace(old2, new2)

with open(r'D:\KZ PROJECT\js\systems\TrainSystem.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('TrainSystem.js P3-1 bridge done')

# === 2. Character.js: getEnergyState() 叠加 personality refuseMod ===
with open(r'D:\KZ PROJECT\js\engine\Character.js', 'r', encoding='utf-8') as f:
    content = f.read()

old3 = '''        // === NEW (P2-3): Accelerator refuse & threshold mods ===
        const accelRefuse = (this._accelRefuseMod || 0) + (this._accelPainRefuseMod || 0);
        const accelThreshold = this._accelOrgasmThresholdMod || 0;'''

new3 = '''        // === NEW (P2-3): Accelerator refuse & threshold mods ===
        const accelRefuse = (this._accelRefuseMod || 0) + (this._accelPainRefuseMod || 0);
        const accelThreshold = this._accelOrgasmThresholdMod || 0;
        // === NEW (P3-1): Personality refuse mod ===
        let personalityRefuse = 0;
        if (typeof getPersonalityEffects === 'function') {
            const pEff = getPersonalityEffects(this);
            if (pEff) personalityRefuse = pEff.refuseMod || 0;
        }'''

content = content.replace(old3, new3)

# Update all refuseMod lines to include personalityRefuse
content = content.replace('refuseMod: 0.15 + accelRefuse,', 'refuseMod: 0.15 + accelRefuse + personalityRefuse,')
content = content.replace('refuseMod: 0 + accelRefuse,', 'refuseMod: 0 + accelRefuse + personalityRefuse,')
content = content.replace('refuseMod: -0.20 + accelRefuse,', 'refuseMod: -0.20 + accelRefuse + personalityRefuse,')
content = content.replace('refuseMod: -0.40 + accelRefuse,', 'refuseMod: -0.40 + accelRefuse + personalityRefuse,')

with open(r'D:\KZ PROJECT\js\engine\Character.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Character.js personality refuseMod done')

# === 3. OrgasmSystem.js: checkOrgasm 叠加 personality orgasmMod ===
with open(r'D:\KZ PROJECT\js\data\OrgasmSystem.js', 'r', encoding='utf-8') as f:
    content = f.read()

old4 = '''    // Dynamic threshold based on energy state
    let threshold = 800;
    const es = chara.getEnergyState ? chara.getEnergyState() : null;
    if (es) {
        if (es.thresholdMod) threshold = Math.floor(800 * (1 + es.thresholdMod));
    }
    // ... check active parts against threshold'''

# Need to find exact text
pattern = r"let threshold = 800;\s*const es = chara\.getEnergyState \? chara\.getEnergyState\(\) : null;\s*if \(es\) \{\s*if \(es\.thresholdMod\) threshold = Math\.floor\(800 \* \(1 \+ es\.thresholdMod\)\);\s*\}"

replacement = '''let threshold = 800;
    const es = chara.getEnergyState ? chara.getEnergyState() : null;
    if (es) {
        if (es.thresholdMod) threshold = Math.floor(800 * (1 + es.thresholdMod));
    }
    // === NEW (P3-1): Personality orgasm mod ===
    const pEffOrgasm = chara.getPersonalityEffects ? chara.getPersonalityEffects() : null;
    if (pEffOrgasm && pEffOrgasm.orgasmMod) {
        threshold = Math.floor(threshold * (1 - pEffOrgasm.orgasmMod));
    }'''

content = re.sub(pattern, replacement, content)

with open(r'D:\KZ PROJECT\js\data\OrgasmSystem.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('OrgasmSystem.js personality orgasmMod done')
print('All P3-1 bridge effects applied!')
