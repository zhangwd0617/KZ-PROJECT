with open(r'D:\KZ PROJECT\js\engine\Character.js', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''    getEnergyState() {
        const pct = this._maxEnergy > 0 ? this._energy / this._maxEnergy : 1;
        if (pct > 0.81) {
            return {
                state: "awake", name: "\u6e05\u9192",
                palamMult: 0.85, refuseMod: 0.15, orgasmThresholdMod: 0.25,
                desc: "\u62d2\u7edd\u7387+15% \u7edd\u9876\u95e8\u69db+25%",
                color: "#98c379",
                special: { name: "\u6323\u624e", chance: 0.10, effect: "struggle" }
            };
        }
        if (pct > 0.51) {
            return {
                state: "wavering", name: "\u52a8\u6447",
                palamMult: 1.00, refuseMod: 0, orgasmThresholdMod: 0,
                desc: "\u57fa\u51c6\u7ebf",
                color: "#e5c07b", special: null
            };
        }
        if (pct > 0.31) {
            return {
                state: "dazed", name: "\u604d\u60da",
                palamMult: 1.25, refuseMod: -0.20, orgasmThresholdMod: -0.20,
                desc: "\u62d2\u7edd\u7387-20% \u7edd\u9876\u95e8\u69d4-20% \u7f9e\u803b\u8f6c\u5feb\u4e50",
                color: "#e06c75",
                special: { name: "\u7f9e\u803b\u8f6c\u5feb\u4e50", effect: "shame_to_joy" }
            };
        }
        if (pct > 0.11) {
            return {
                state: "collapsing", name: "\u5d29\u89e3",
                palamMult: 1.50, refuseMod: -0.40, orgasmThresholdMod: -0.35,
                desc: "\u62d2\u7edd\u7387-40% \u7edd\u9876\u95e8\u69d4-35% 10%\u5931\u795e",
                color: "#c678dd",
                special: { name: "\u5931\u795e", chance: 0.10, effect: "faint" }
            };
        }
        if (pct > 0.01) {
            return {
                state: "broken", name: "\u574f\u6389",
                palamMult: 1.80, refuseMod: 0, orgasmThresholdMod: -0.50,
                desc: "\u62d2\u7edd\u73870% \u7edd\u9876\u95e8\u69d4-50% \u6bcf\u56de\u5408-3%\u4f53\u529b",
                color: "#ff3333",
                special: { name: "\u4f53\u529b\u81ea\u6bc1", effect: "self_destruct" }
            };
        }
        // 0% - collapsed
        return {
            state: "collapsed", name: "\u5d29\u6e83",
            palamMult: 2.00, refuseMod: 0, orgasmThresholdMod: -0.50,
            desc: "PALAM\u00d72.0 \u7d20\u8d28\u83b7\u53d6 \u4e0b\u56de\u5408\u6062\u590d15%",
            color: "#ff0000",
            special: { name: "\u5d29\u6e83\u7ed3\u7b97", effect: "collapse_settlement" }
        };
    }'''

new = '''    getEnergyState() {
        const pct = this._maxEnergy > 0 ? this._energy / this._maxEnergy : 1;
        // === NEW (P2-3): Accelerator refuse & threshold mods ===
        const accelRefuse = (this._accelRefuseMod || 0) + (this._accelPainRefuseMod || 0);
        const accelThreshold = this._accelOrgasmThresholdMod || 0;
        let state, result;
        if (pct > 0.81) {
            state = "awake";
            result = {
                state, name: "\u6e05\u9192",
                palamMult: 0.85, refuseMod: 0.15 + accelRefuse, orgasmThresholdMod: 0.25 + accelThreshold,
                desc: "\u62d2\u7edd\u7387+15% \u7edd\u9876\u95e8\u69db+25%",
                color: "#98c379",
                special: { name: "\u6323\u624e", chance: 0.10, effect: "struggle" }
            };
        } else if (pct > 0.51) {
            state = "wavering";
            result = {
                state, name: "\u52a8\u6447",
                palamMult: 1.00, refuseMod: 0 + accelRefuse, orgasmThresholdMod: 0 + accelThreshold,
                desc: "\u57fa\u51c6\u7ebf",
                color: "#e5c07b", special: null
            };
        } else if (pct > 0.31) {
            state = "dazed";
            result = {
                state, name: "\u604d\u60da",
                palamMult: 1.25, refuseMod: -0.20 + accelRefuse, orgasmThresholdMod: -0.20 + accelThreshold,
                desc: "\u62d2\u7edd\u7387-20% \u7edd\u9876\u95e8\u69d4-20% \u7f9e\u803b\u8f6c\u5feb\u4e50",
                color: "#e06c75",
                special: { name: "\u7f9e\u803b\u8f6c\u5feb\u4e50", effect: "shame_to_joy" }
            };
        } else if (pct > 0.11) {
            state = "collapsing";
            result = {
                state, name: "\u5d29\u89e3",
                palamMult: 1.50, refuseMod: -0.40 + accelRefuse, orgasmThresholdMod: -0.35 + accelThreshold,
                desc: "\u62d2\u7edd\u7387-40% \u7edd\u9876\u95e8\u69d4-35% 10%\u5931\u795e",
                color: "#c678dd",
                special: { name: "\u5931\u795e", chance: 0.10, effect: "faint" }
            };
        } else if (pct > 0.01) {
            state = "broken";
            result = {
                state, name: "\u574f\u6389",
                palamMult: 1.80, refuseMod: 0, orgasmThresholdMod: -0.50 + accelThreshold,
                desc: "\u62d2\u7edd\u73870% \u7edd\u9876\u95e8\u69d4-50% \u6bcf\u56de\u5408-3%\u4f53\u529b",
                color: "#ff3333",
                special: { name: "\u4f53\u529b\u81ea\u6bc1", effect: "self_destruct" }
            };
        } else {
            state = "collapsed";
            result = {
                state, name: "\u5d29\u6e83",
                palamMult: 2.00, refuseMod: 0, orgasmThresholdMod: -0.50 + accelThreshold,
                desc: "PALAM\u00d72.0 \u7d20\u8d28\u83b7\u53d6 \u4e0b\u56de\u5408\u6062\u590d15%",
                color: "#ff0000",
                special: { name: "\u5d29\u6e83\u7ed3\u7b97", effect: "collapse_settlement" }
            };
        }
        return result;
    }'''

content = content.replace(old, new)

with open(r'D:\KZ PROJECT\js\engine\Character.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Character.js getEnergyState updated')
