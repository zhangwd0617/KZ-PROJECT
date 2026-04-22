import sys, re
sys.stdout.reconfigure(encoding='utf-8')

with open('D:/KZ PROJECT/js/ui/UI.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Modify _renderCombatSides to support leftTeam/rightTeam
old_render_sides = '''    // 渲染双方信息面板
    _renderCombatSides(battle) {
        const left = document.getElementById('combat-left');
        const right = document.getElementById('combat-right');
        const parsed = this._combatParsed || {};

        // 左侧：勇者/小队
        let leftHtml = '';
        if (battle.isSquad && battle.squad) {
            leftHtml += `<div style="font-weight:bold;margin-bottom:6px;">👥 ${battle.heroName}小队</div>`;
            for (const m of battle.squad) {
                const hpPct = m.maxHp > 0 ? Math.floor(m.hp / m.maxHp * 100) : 0;
                leftHtml += `<div style="font-size:0.75rem;margin:2px 0;">${m.name} Lv.${m.level}</div>`;
                leftHtml += `<div style="height:6px;background:var(--hp-bg);border-radius:3px;overflow:hidden;margin-bottom:4px;"><div style="height:100%;width:${hpPct}%;background:linear-gradient(90deg,#4caf50,#8bc34a);border-radius:3px;"></div></div>`;
            }
        } else if (battle.hero) {
            const h = battle.hero;
            // 使用 combatLog 中记录的初始HP，如果没有则回退到当前 hero.hp
            const initHp = parsed.initialHeroHp !== null ? parsed.initialHeroHp : h.hp;
            const hpPct = h.maxHp > 0 ? Math.floor(initHp / h.maxHp * 100) : 0;
            const mpPct = h.maxMp > 0 ? Math.floor(h.mp / h.maxMp * 100) : 0;
            leftHtml += `<div style="font-size:1.1rem;margin-bottom:4px;">🗡️ ${h.name}</div>`;
            leftHtml += `<div style="font-size:0.75rem;color:var(--text-dim);">Lv.${h.level} ${this._getHeroClassName(h)}</div>`;
            leftHtml += `<div style="margin-top:6px;"><div style="display:flex;justify-content:space-between;font-size:0.7rem;"><span>HP</span><span id="combat-hero-hp-text">${initHp}/${h.maxHp}</span></div>`;
            leftHtml += `<div style="height:8px;background:var(--hp-bg);border-radius:4px;overflow:hidden;"><div id="combat-hero-hp-bar" style="height:100%;width:${hpPct}%;background:linear-gradient(90deg,var(--success),#8bc34a);border-radius:4px;transition:width 0.3s;"></div></div></div>`;
            leftHtml += `<div style="margin-top:4px;"><div style="display:flex;justify-content:space-between;font-size:0.7rem;"><span>MP</span><span>${h.mp}/${h.maxMp}</span></div>`;
            leftHtml += `<div style="height:6px;background:var(--hp-bg);border-radius:3px;overflow:hidden;"><div id="combat-hero-mp-bar" style="height:100%;width:${mpPct}%;background:linear-gradient(90deg,#2196f3,#64b5f6);border-radius:3px;transition:width 0.3s;"></div></div></div>`;
        }
        left.innerHTML = leftHtml;

        // 右侧：怪物
        const m = battle.monster || {};
        const monMaxHp = m.maxHp || m.hp || 1;
        // 使用 combatLog 中记录的初始HP
        const initMonHp = parsed.initialMonHp !== null ? parsed.initialMonHp : (m.hp || 0);
        const monHpPct = monMaxHp > 0 ? Math.floor(initMonHp / monMaxHp * 100) : 0;
        let rightHtml = `<div style="font-size:1.1rem;margin-bottom:4px;">${m.icon || '👹'} ${m.name || '???'}</div>`;
        rightHtml += `<div style="font-size:0.75rem;color:var(--text-dim);">Lv.${m.level || '?'} ${m.eliteType === 'chief' ? '【首领】' : (m.eliteType === 'overlord' ? '【霸主】' : '')}</div>`;
        rightHtml += `<div style="margin-top:6px;"><div style="display:flex;justify-content:space-between;font-size:0.7rem;"><span>HP</span><span id="combat-mon-hp-text">${initMonHp}/${monMaxHp}</span></div>`;
        rightHtml += `<div style="height:8px;background:var(--hp-bg);border-radius:4px;overflow:hidden;"><div id="combat-mon-hp-bar" style="height:100%;width:${monHpPct}%;background:linear-gradient(90deg,var(--danger),#ff7043);border-radius:4px;transition:width 0.3s;"></div></div></div>`;
        rightHtml += `<div style="margin-top:4px;font-size:0.7rem;color:var(--text-dim);">ATK:${m.atk || 0} DEF:${m.def || 0} SPD:${m.spd || 0}</div>`;
        right.innerHTML = rightHtml;
    },'''

new_render_sides = '''    // 渲染双方信息面板
    _renderCombatSides(battle) {
        const left = document.getElementById('combat-left');
        const right = document.getElementById('combat-right');
        const parsed = this._combatParsed || {};

        // 左侧：勇者方队伍
        let leftHtml = '';
        const leftTeam = battle.leftTeam || (battle.isSquad && battle.squad ? battle.squad.map((e,i)=>({name:e.name,hp:e.hp,maxHp:e.maxHp,level:e.level,mp:e.mp,maxMp:e.maxMp,isSpy:!!e.talent[201],entity:e})) : (battle.hero ? [{name:battle.hero.name,hp:battle.hero.hp,maxHp:battle.hero.maxHp,level:battle.hero.level,mp:battle.hero.mp,maxMp:battle.hero.maxMp,isSpy:false,entity:battle.hero}] : []));

        if (leftTeam.length > 1) {
            leftHtml += `<div style="font-weight:bold;margin-bottom:6px;">👥 ${battle.heroName || '勇者'}小队</div>`;
        }
        for (let i = 0; i < leftTeam.length; i++) {
            const u = leftTeam[i];
            const isSpy = u.isSpy || (u.entity && u.entity.talent && u.entity.talent[201]);
            const spyLabel = isSpy ? ' <span style="color:var(--danger);font-size:0.65rem;">(伪装)</span>' : '';
            const initHp = parsed.initialHeroHp !== null && i === 0 ? parsed.initialHeroHp : u.hp;
            const hpPct = u.maxHp > 0 ? Math.floor(initHp / u.maxHp * 100) : 0;
            const mpPct = u.maxMp > 0 ? Math.floor(u.mp / u.maxMp * 100) : 0;
            leftHtml += `<div style="font-size:0.75rem;margin:2px 0;">${u.name} Lv.${u.level}${spyLabel}</div>`;
            leftHtml += `<div style="display:flex;justify-content:space-between;font-size:0.7rem;margin-bottom:2px;"><span>HP</span><span id="combat-left-hp-text-${i}">${initHp}/${u.maxHp}</span></div>`;
            leftHtml += `<div style="height:6px;background:var(--hp-bg);border-radius:3px;overflow:hidden;margin-bottom:4px;"><div id="combat-left-hp-bar-${i}" style="height:100%;width:${hpPct}%;background:linear-gradient(90deg,var(--success),#8bc34a);border-radius:3px;transition:width 0.3s;"></div></div>`;
        }
        left.innerHTML = leftHtml || '<div style="color:var(--text-dim);font-size:0.8rem;">无参战单位</div>';

        // 右侧：怪物方队伍
        let rightHtml = '';
        const rightTeam = battle.rightTeam || (battle.monster ? [{name:battle.monster.name,hp:battle.monster.hp,maxHp:battle.monster.maxHp,level:battle.monster.level,mp:battle.monster.mp||0,maxMp:battle.monster.mp||0,isMonster:true,entity:battle.monster}] : []);

        if (rightTeam.length > 1) {
            rightHtml += `<div style="font-weight:bold;margin-bottom:6px;">👹 怪物小队</div>`;
        }
        for (let i = 0; i < rightTeam.length; i++) {
            const u = rightTeam[i];
            const isExHero = u.isExHero || (u.entity && u.entity.talent && u.entity.talent[200]);
            const icon = isExHero ? '🛡️' : (u.entity && u.entity.icon ? u.entity.icon : '👹');
            const eliteLabel = u.entity && u.entity.eliteType === 'chief' ? '【首领】' : (u.entity && u.entity.eliteType === 'overlord' ? '【霸主】' : '');
            const initHp = parsed.initialMonHp !== null && i === 0 ? parsed.initialMonHp : u.hp;
            const hpPct = u.maxHp > 0 ? Math.floor(initHp / u.maxHp * 100) : 0;
            rightHtml += `<div style="font-size:0.75rem;margin:2px 0;">${icon} ${u.name} Lv.${u.level} <span style="color:var(--text-dim);font-size:0.65rem;">${eliteLabel}</span></div>`;
            rightHtml += `<div style="display:flex;justify-content:space-between;font-size:0.7rem;margin-bottom:2px;"><span>HP</span><span id="combat-right-hp-text-${i}">${initHp}/${u.maxHp}</span></div>`;
            rightHtml += `<div style="height:6px;background:var(--hp-bg);border-radius:3px;overflow:hidden;margin-bottom:4px;"><div id="combat-right-hp-bar-${i}" style="height:100%;width:${hpPct}%;background:linear-gradient(90deg,var(--danger),#ff7043);border-radius:3px;transition:width 0.3s;"></div></div>`;
        }
        right.innerHTML = rightHtml || '<div style="color:var(--text-dim);font-size:0.8rem;">无参战单位</div>';
    },'''

if old_render_sides in content:
    content = content.replace(old_render_sides, new_render_sides)
    print('✅ _renderCombatSides updated')
else:
    print('❌ _renderCombatSides not found')

# 2. Modify _updateCombatHpBars to support multi-unit
old_update_hp = '''    // 更新战斗双方HP条
    _updateCombatHpBars(snapshot) {
        const battle = this._combatQueue[this._combatIndex];
        if (!battle) return;

        // 更新勇者HP
        if (snapshot.heroHp !== null && battle.hero && battle.hero.maxHp > 0) {
            const h = battle.hero;
            const hpPct = Math.floor(snapshot.heroHp / h.maxHp * 100);
            const hpBar = document.getElementById('combat-hero-hp-bar');
            const hpText = document.getElementById('combat-hero-hp-text');
            if (hpBar) hpBar.style.width = hpPct + '%';
            if (hpText) hpText.textContent = `${snapshot.heroHp}/${h.maxHp}`;
        }

        // 更新怪物HP
        if (snapshot.monHp !== null) {
            const m = battle.monster || {};
            const maxHp = m.maxHp || m.hp || 1;
            const hpPct = Math.floor(snapshot.monHp / maxHp * 100);
            const hpBar = document.getElementById('combat-mon-hp-bar');
            const hpText = document.getElementById('combat-mon-hp-text');
            if (hpBar) hpBar.style.width = hpPct + '%';
            if (hpText) hpText.textContent = `${snapshot.monHp}/${maxHp}`;
        }
    },'''

new_update_hp = '''    // 更新战斗双方HP条（支持多单位）
    _updateCombatHpBars(snapshot) {
        const battle = this._combatQueue[this._combatIndex];
        if (!battle) return;

        // 支持新的 leftTeam/rightTeam 格式和旧的 hero/monster 格式
        const leftTeam = battle.leftTeam || (battle.isSquad && battle.squad ? battle.squad.map(e=>({name:e.name,hp:e.hp,maxHp:e.maxHp})) : (battle.hero ? [{name:battle.hero.name,hp:battle.hero.hp,maxHp:battle.hero.maxHp}] : []));
        const rightTeam = battle.rightTeam || (battle.monster ? [{name:battle.monster.name,hp:battle.monster.hp,maxHp:battle.monster.maxHp}] : []);

        // 更新左侧单位HP
        for (let i = 0; i < leftTeam.length; i++) {
            const u = leftTeam[i];
            const hpBar = document.getElementById(`combat-left-hp-bar-${i}`);
            const hpText = document.getElementById(`combat-left-hp-text-${i}`);
            if (hpBar && hpText && u.maxHp > 0) {
                const hpPct = Math.floor(u.hp / u.maxHp * 100);
                hpBar.style.width = hpPct + '%';
                hpText.textContent = `${u.hp}/${u.maxHp}`;
            }
        }

        // 更新右侧单位HP
        for (let i = 0; i < rightTeam.length; i++) {
            const u = rightTeam[i];
            const hpBar = document.getElementById(`combat-right-hp-bar-${i}`);
            const hpText = document.getElementById(`combat-right-hp-text-${i}`);
            if (hpBar && hpText && u.maxHp > 0) {
                const hpPct = Math.floor(u.hp / u.maxHp * 100);
                hpBar.style.width = hpPct + '%';
                hpText.textContent = `${u.hp}/${u.maxHp}`;
            }
        }
    },'''

if old_update_hp in content:
    content = content.replace(old_update_hp, new_update_hp)
    print('✅ _updateCombatHpBars updated')
else:
    print('❌ _updateCombatHpBars not found')

with open('D:/KZ PROJECT/js/ui/UI.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')
