with open('js/ui/UI.js', 'r', encoding='utf-8', errors='replace') as f:
    lines = f.readlines()

# Patch 1: replace lines 342-343
new1 = [
    "        const pEff = target.getPersonalityEffects ? target.getPersonalityEffects() : { activeModes: [], uiColors: [] };\n",
    "        for (let i = 0; i < (pEff.activeModes || []).length; i++) {\n",
    "            const mode = pEff.activeModes[i];\n",
    "            const color = (pEff.uiColors && pEff.uiColors[i]) ? pEff.uiColors[i] : '#98c379';\n",
    "            tags.push({ text: mode, color: color });\n",
    "        }\n"
]
lines = lines[:342] + new1 + lines[344:]
print('Patch 1 OK')

# Patch 2: after shift (+4 lines), old lines 526-528 become 530-532
idx = 530
new2 = [
    "        if (pEff && pEff.activeModes && pEff.activeModes.length > 0) {\n",
    "            const modeColors = pEff.uiColors || [];\n",
    "            const coloredModes = pEff.activeModes.map((m, i) => `<span style=\"color:${modeColors[i] || '#98c379'}\">${m}</span>`);\n",
    '            html += `<div style="font-size:0.75rem;color:var(--success);margin-bottom:10px;">性格修正: ${coloredModes.join(\' / \')}</div>`;\n',
    "        }\n"
]
lines = lines[:idx] + new2 + lines[idx+3:]
print('Patch 2 OK')

with open('js/ui/UI.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)
