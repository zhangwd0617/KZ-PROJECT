with open('js/systems/TrainSystem.js', 'r', encoding='utf-8', errors='replace') as f:
    lines = f.readlines()

# Replace lines 1212-1220 (1-indexed) -> indices 1211-1219 (0-indexed)
new_block = [
    "        // Apply SOURCE to PALAM with energy state modifier\n",
    "        const energyState = target.getEnergyState ? target.getEnergyState() : { palamMult: 1.0 };\n",
    "        let palamMult = energyState.palamMult || 1.0;\n",
    "\n",
    "        // 失神检查（崩解状态）：本回合PALAMx1.8（从1.5提升）\n",
    '        if (energyState.special && energyState.special.effect === "faint" && Math.random() < (energyState.special.chance || 0.10)) {\n',
    "            palamMult *= 1.2; // 1.5 * 1.2 = 1.8\n",
    "            target._faintNextTurn = true;\n",
    '            UI.appendText(`【${target.name}在崩解中失神了...本回合PALAM暴增，下回合无法行动】\\n`, "danger");\n',
    "        }\n",
    "\n",
    "        for (let i = 0; i < target.source.length; i++) {\n",
    "            if (target.source[i] > 0) {\n",
    "                const palamId = SOURCE_TO_PALAM[i];\n",
    "                if (palamId !== undefined && palamId >= 0) {\n",
    "                    target.addPalam(palamId, Math.floor(target.source[i] * palamMult));\n",
    "                }\n",
    "            }\n",
    "        }\n",
    "\n",
    "        // 挣扎检查（清醒状态）：10%概率PALAM-30%\n",
    '        if (energyState.special && energyState.special.effect === "struggle" && Math.random() < energyState.special.chance) {\n',
    '            UI.appendText(`【${target.name}在清醒状态下挣扎抵抗...PALAM获取-30%】\\n`, "warning");\n',
    "            for (let i = 0; i < target.palam.length; i++) {\n",
    "                const delta = target.palam[i] - (before.palam[i] || 0);\n",
    "                if (delta > 0) {\n",
    "                    target.palam[i] = Math.max(before.palam[i] || 0, target.palam[i] - Math.floor(delta * 0.3));\n",
    "                }\n",
    "            }\n",
    "        }\n",
    "\n",
    "        // 恍惚：羞耻30%转化为快乐（欲情）\n",
    '        if (energyState.special && energyState.special.effect === "shame_to_joy") {\n',
    "            const shameDelta = (target.palam[8] || 0) - (before.palam[8] || 0);\n",
    "            if (shameDelta > 0) {\n",
    "                const transfer = Math.floor(shameDelta * 0.3);\n",
    "                target.palam[8] = Math.max(0, (target.palam[8] || 0) - transfer);\n",
    "                target.palam[5] = (target.palam[5] || 0) + transfer;\n",
    '                UI.appendText(`【${target.name}在恍惚中，羞耻转化为快乐...（+${transfer}）】\\n`, "info");\n',
    "            }\n",
    "        }\n",
]

new_lines = lines[:1211] + new_block + lines[1220:]
with open('js/systems/TrainSystem.js', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print('OK')
