import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('D:/KZ PROJECT/js/systems/ShopSystem.js', 'r', encoding='utf-8') as f:
    content = f.read()
    lines = content.split('\n')

# Find process() method
start_idx = None
end_idx = None
brace_count = 0
for i, line in enumerate(lines):
    if '    process() {' in line:
        start_idx = i
        brace_count = 1
    elif start_idx is not None:
        brace_count += line.count('{') - line.count('}')
        if brace_count == 0:
            end_idx = i
            break

body_lines = lines[start_idx+1:end_idx]

# Split into three parts
p1_head = []
p2_body = []
p1_tail = []
state = 'head'
for line in body_lines:
    stripped = line.strip()
    if state == 'head':
        if stripped.startswith('// 勇者每日移动'):
            state = 'phase2'
            continue
        p1_head.append(line)
    elif state == 'phase2':
        if stripped.startswith('// 每天刷新奴隶市场'):
            state = 'tail'
        else:
            p2_body.append(line)
    if state == 'tail':
        p1_tail.append(line)

# Modify p1_head: change combatEvents -> dailyEvents
p1_head_new = []
for line in p1_head:
    if 'const combatEvents = [];' in line:
        p1_head_new.append('        const dailyEvents = [];')
    elif 'combatEvents.push' in line:
        p1_head_new.append(line.replace('combatEvents.push', 'dailyEvents.push'))
    else:
        p1_head_new.append(line)

# Modify p2_body: add declarations and income event
p2_body_new = [
    '        const combatEvents = [];',
    '        const combatQueue = []; // 战斗弹窗队列',
    '        // 记录领地收入事件（放入地下城日志）',
    '        const income = g.getFacilityIncome ? g.getFacilityIncome() : 0;',
    '        if (income > 0) {',
    '            combatEvents.push({',
    "                type: 'dungeon',",
    "                title: '💰 领地收入',",
    "                text: `魔王领地今日产生${income}G收入（地下城层数发展+俘虏勇者上缴）`",
    '            });',
    '        }',
    ''
]

# Append rest of p2_body (skip original declarations)
for line in p2_body:
    stripped = line.strip()
    if stripped == '':
        continue
    if 'const retreatHeroes' in stripped:
        p2_body_new.append(line)
    elif 'const combatQueue' in stripped:
        continue
    elif '// 领地每日收益' in stripped:
        continue
    elif 'const income' in stripped:
        continue
    elif 'combatEvents.push' in stripped and '💰' in stripped:
        continue
    elif '});' in stripped and '💰' in stripped:
        continue
    else:
        p2_body_new.append(line)

# Modify p1_tail: simplify - remove combatEvents/combatQueue references
p1_tail_new = []
for line in p1_tail:
    stripped = line.strip()
    if 'if (combatEvents.length > 0)' in stripped:
        p1_tail_new.append('            g._pendingDungeonEvents = dungeonEvents;')
        continue
    if 'dungeonEvents.push(...combatEvents);' in stripped:
        continue
    if 'const afterEvents' in stripped and 'combatQueue' in stripped:
        continue
    if 'if (combatQueue.length > 0' in stripped:
        continue
    if 'UI.showCombatQueue' in stripped:
        continue
    if 'afterEvents();' in stripped:
        p1_tail_new.append(line.replace('afterEvents();', 'afterDaily();'))
        continue
    if 'const afterEvents' in stripped:
        continue
    if '});' in stripped and (p1_tail_new and 'afterDaily' in p1_tail_new[-1]):
        continue
    p1_tail_new.append(line)

# Cleanup: replace afterEvents with afterDaily where it exists in variable names
for i, line in enumerate(p1_tail_new):
    if 'afterEvents' in line and 'afterDaily' not in line:
        p1_tail_new[i] = line.replace('afterEvents', 'afterDaily')

# Build phase2 tail
phase2_tail = """        // 合并地下城事件
        let dungeonEvents = g._pendingDungeonEvents || [];
        g._pendingDungeonEvents = null;
        if (combatEvents.length > 0) {
            dungeonEvents.push(...combatEvents);
        }
        if (dungeonEvents.length > 0) {
            if (!g._dayEventLog) g._dayEventLog = [];
            g._dayEventLog.unshift({ day: g.day, events: dungeonEvents });
            if (g._dayEventLog.length > 30) g._dayEventLog.pop();
        }

        // 设置阶段
        g._dayPhase = 1;

        // 战斗弹窗
        const afterCombats = () => {
            if (typeof UI !== 'undefined' && G && G.state === 'SHOP') {
                UI.renderShop(G);
            }
        };
        if (combatQueue.length > 0 && typeof UI !== 'undefined') {
            UI.showCombatQueue(combatQueue, () => {
                afterCombats();
            });
        } else {
            afterCombats();
        }
"""

# Build new methods
new_methods_lines = [
    '    process() {',
    '        this.processPhase1();',
    '        this.processPhase2();',
    '    }',
    '',
    '    processPhase1() {'
]
new_methods_lines.extend(p1_head_new)
new_methods_lines.extend(p1_tail_new)
new_methods_lines.append('    }')
new_methods_lines.append('')
new_methods_lines.append('    processPhase2() {')
new_methods_lines.extend(p2_body_new)
new_methods_lines.append(phase2_tail)
new_methods_lines.append('    }')

old_method = '\n'.join(lines[start_idx:end_idx+1])
new_methods = '\n'.join(new_methods_lines)
new_content = content.replace(old_method, new_methods)

with open('D:/KZ PROJECT/js/systems/ShopSystem.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('ShopSystem.js updated successfully')
