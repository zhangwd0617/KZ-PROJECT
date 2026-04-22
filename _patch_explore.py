import sys
sys.stdout.reconfigure(encoding='utf-8')
with open('D:/KZ PROJECT/js/engine/Game.js', 'r', encoding='utf-8') as f:
    content = f.read()

# exploreFloor solo combat
old1 = '''                    // 单人战斗
                    const combat = this._doTeamCombat([hero], [monster]);
                    results.push({
                        type: "combat",
                        name: `遭遇${monster.name}`,
                        description: `${monster.icon} ${monster.description}`,
                        icon: monster.icon,
                        combatLog: combat.combatLog,
                        victory: combat.victory,
                        defeated: combat.defeated,
                        monster: monster
                    });'''
new1 = '''                    // 单人战斗
                    const combat = this._doTeamCombat([hero], [monster]);
                    results.push({
                        type: "combat",
                        name: `遭遇${monster.name}`,
                        description: `${monster.icon} ${monster.description}`,
                        icon: monster.icon,
                        combatLog: combat.combatLog,
                        victory: combat.victory,
                        defeated: combat.defeated,
                        monster: monster,
                        leftTeam: combat.leftTeam,
                        rightTeam: combat.rightTeam
                    });'''
content = content.replace(old1, new1)

# exploreFloor squad combat
old2 = '''                    // 队长：触发小队战斗
                    const squad = this.invaders.filter(h => h.cflag[900] === squadId);
                    const combat = this._doTeamCombat(squad, [monster]);
                    results.push({
                        type: "scombat",
                        name: `小队遭遇${monster.name}`,
                        description: `${monster.icon} ${monster.description}`,
                        icon: "👥",
                        combatLog: combat.combatLog,
                        victory: combat.victory,
                        defeated: combat.defeated,
                        monster: monster
                    });'''
new2 = '''                    // 队长：触发小队战斗
                    const squad = this.invaders.filter(h => h.cflag[900] === squadId);
                    const combat = this._doTeamCombat(squad, [monster]);
                    results.push({
                        type: "scombat",
                        name: `小队遭遇${monster.name}`,
                        description: `${monster.icon} ${monster.description}`,
                        icon: "👥",
                        combatLog: combat.combatLog,
                        victory: combat.victory,
                        defeated: combat.defeated,
                        monster: monster,
                        leftTeam: combat.leftTeam,
                        rightTeam: combat.rightTeam
                    });'''
content = content.replace(old2, new2)

# Boss battle
old3 = '''            if (bossCombat) {
                explore.results.events = explore.results.events || [];'''
new3 = '''            if (bossCombat) {
                explore.results.leftTeam = bossCombat.leftTeam;
                explore.results.rightTeam = bossCombat.rightTeam;
                explore.results.events = explore.results.events || [];'''
content = content.replace(old3, new3)

# Arena
old4 = '''        const result = {
            type: 'arena',
            name: '⚔️ 竞技场',
            description: `${monster.icon} ${monster.name} Lv.${monster.level}`,
            icon: '⚔️',
            combatLog: combat.combatLog,
            victory: combat.victory,
            defeated: combat.defeated,
            _monster: monster
        };'''
new4 = '''        const result = {
            type: 'arena',
            name: '⚔️ 竞技场',
            description: `${monster.icon} ${monster.name} Lv.${monster.level}`,
            icon: '⚔️',
            combatLog: combat.combatLog,
            victory: combat.victory,
            defeated: combat.defeated,
            _monster: monster,
            leftTeam: combat.leftTeam,
            rightTeam: combat.rightTeam
        };'''
content = content.replace(old4, new4)

with open('D:/KZ PROJECT/js/engine/Game.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('SUCCESS')
