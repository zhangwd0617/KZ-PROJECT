/**
 * EventDefs.js — V12.0 事件系统定义集中管理
 * 
 * 本文件提供事件扩展接口，方便后续Agent读取并补充新事件。
 * 事件分为三大类：
 *   1. 魔王日常事件（master_daily）— processMasterDaily() 触发
 *   2. 冒险日常事件（adventure_daily）— processAdventureDaily() 触发
 *   3. 特殊事件（special）— 条件触发
 * 
 * 添加新事件步骤：
 *   1. 在对应事件池中按格式添加定义
 *   2. 在 EventSystem.js 中实现对应的 _evtXxx 处理函数
 *   3. 将事件加入 _getXxxEventPool() 的返回数组
 */

// ========== 魔王日常事件池（结束一天后触发）==========
// 这些事件在 EventSystem._getDailyEventPool() 中定义
// 涵盖：魔王自身、未陷落奴隶、已陷落奴隶、奴隶互动、特殊事件

// ========== 冒险日常事件池（观察勇者活动后触发）==========
// 勇者地下城事件在 EventSystem._getDungeonEventPool() 中定义
// 魔王军冒险事件在 EventSystem._getDemonArmyEventPool() 中定义

// ========== 事件定义模板 ==========
/*
{
    id: 'event_unique_id',      // 唯一标识符
    type: 'single',             // 'single' | 'squad' | 'relation' | 'master' | 'demon_army'
    weight: 10,                 // 事件池中的权重（越高越容易被抽中）
    condition: (actor, game) => {   // 可选：触发条件
        return actor.level >= 5;
    },
    handler: (game, actor) => {     // 事件效果处理
        actor.hp = Math.min(actor.maxHp, actor.hp + 50);
        return {
            title: '事件标题',
            text: `${actor.name} 发现了神秘泉水，恢复了50点HP！`,
            effects: [{ type: 'heal', value: 50 }]
        };
    }
}
*/

// ========== 勇者单人事件（10个）==========
window.HERO_SINGLE_EVENT_TEMPLATES = [
    {
        id: 'find_treasure',
        name: '发现宝物',
        desc: '获得随机装备/道具',
        type: 'single',
        weight: 10,
        handler: (g, hero) => {
            // 实现见 EventSystem._evtHeroChestXxx
        }
    },
    {
        id: 'trap_damage',
        name: '遭遇陷阱',
        desc: 'HP-20%或中毒',
        type: 'single',
        weight: 8,
        handler: (g, hero) => {
            // 实现见 EventSystem._evtHeroTrap
        }
    },
    {
        id: 'monster_ambush',
        name: '被魔物偷袭',
        desc: '进入战斗',
        type: 'single',
        weight: 7,
        handler: (g, hero) => {
            // 实现见 DungeonExplorer exploreFloor
        }
    },
    {
        id: 'teleport',
        name: '误入传送门',
        desc: '随机传送到其他层',
        type: 'single',
        weight: 3,
        handler: (g, hero) => {
            const newFloor = Math.max(1, Math.min(10, (g.getHeroFloor(hero) || 1) + (RAND(2) === 0 ? -1 : 1)));
            hero.cflag[CFLAGS.HERO_FLOOR] = newFloor;
            hero.cflag[CFLAGS.HERO_PROGRESS] = RAND(100);
            return {
                title: `【地下城】${hero.name}误入了传送门`,
                text: `${hero.name}眼前一花，周围景象完全变了！被传送到了第${newFloor}层。`,
                effects: [{ target: hero.name, floor: newFloor }]
            };
        }
    },
    {
        id: 'fog_confusion',
        name: '迷雾迷惑',
        desc: '层内进度随机变化',
        type: 'single',
        weight: 4,
        handler: (g, hero) => {
            const newProgress = RAND(100);
            hero.cflag[CFLAGS.HERO_PROGRESS] = newProgress;
            return {
                title: `【地下城】${hero.name}被迷雾迷惑`,
                text: `浓雾笼罩了四周，${hero.name}完全失去了方向感...`,
                effects: [{ target: hero.name, progress: newProgress }]
            };
        }
    },
    {
        id: 'divine_blessing',
        name: '神明庇护',
        desc: '恢复全部HP/MP',
        type: 'single',
        weight: 3,
        handler: (g, hero) => {
            hero.hp = hero.maxHp;
            hero.mp = hero.maxMp;
            return {
                title: `【地下城】${hero.name}得到了神明庇护`,
                text: `一道圣光从天而降，${hero.name}感到全身充满了力量！HP/MP全恢复。`,
                effects: [{ target: hero.name, heal: 'full' }]
            };
        }
    },
    {
        id: 'find_corpse',
        name: '找到勇者尸体',
        desc: '获得死者装备',
        type: 'single',
        weight: 2,
        handler: (g, hero) => {
            const loot = GearSystem.generateGear('body', hero.level, 1 + RAND(2));
            const r = GearSystem.equipItem(hero, loot);
            return {
                title: `【地下城】${hero.name}发现了勇者的遗体`,
                text: `${hero.name}在一具风干的尸体旁发现了还能用的装备。${r.msg}`,
                effects: [{ target: hero.name, item: GearSystem.getGearDesc(loot) }]
            };
        }
    },
    {
        id: 'ancient_item',
        name: '上古道具',
        desc: '获得高级未鉴定道具',
        type: 'single',
        weight: 3,
        handler: (g, hero) => {
            const item = GearSystem.generateItem('buff', hero.level, 3 + RAND(2));
            item.identified = false;
            const r = GearSystem.equipItem(hero, item);
            return {
                title: `【地下城】${hero.name}发现了上古道具`,
                text: `${hero.name}在古老祭坛上发现了一件散发着神秘气息的道具。${r.msg}（未鉴定）`,
                effects: [{ target: hero.name, item: GearSystem.getGearDesc(item) }]
            };
        }
    },
    {
        id: 'meet_appraiser',
        name: '遭遇鉴定师',
        desc: '免费鉴定1件物品',
        type: 'single',
        weight: 3,
        handler: (g, hero) => {
            const allGear = [hero.gear.head, hero.gear.body, hero.gear.legs, hero.gear.hands, hero.gear.neck, hero.gear.ring, ...(hero.gear.weapons || [])];
            const unidentified = allGear.filter(g => g && !g.identified);
            if (unidentified.length > 0) {
                const target = unidentified[RAND(unidentified.length)];
                GearSystem.identifyGear(target);
                return {
                    title: `【地下城】${hero.name}遇到了迷途鉴定师`,
                    text: `一位流浪的鉴定师愿意为${hero.name}免费鉴定一件物品。鉴定了【${target.name}】。`,
                    effects: [{ target: hero.name, identified: target.name }]
                };
            }
            return {
                title: `【地下城】${hero.name}遇到了迷途鉴定师`,
                text: `一位流浪的鉴定师想为${hero.name}免费鉴定，但身上没有未鉴定的物品。`,
                effects: []
            };
        }
    },
    {
        id: 'mystic_spring',
        name: '神秘泉水',
        desc: '恢复/中毒50%概率',
        type: 'single',
        weight: 4,
        handler: (g, hero) => {
            if (RAND(2) === 0) {
                const heal = Math.floor(hero.maxHp * 0.3);
                hero.hp = Math.min(hero.maxHp, hero.hp + heal);
                return {
                    title: `【地下城】${hero.name}饮用了神秘泉水`,
                    text: `泉水甘甜可口，${hero.name}感到体力恢复了。HP +${heal}`,
                    effects: [{ target: hero.name, hp: heal }]
                };
            } else {
                g._addStatusAilment(hero, 'poison', 3);
                return {
                    title: `【地下城】${hero.name}饮用了被污染的泉水`,
                    text: `泉水味道苦涩，${hero.name}感到一阵恶心...中毒了！`,
                    effects: [{ target: hero.name, status: 'poison' }]
                };
            }
        }
    }
];

// ========== 勇者小队事件（8个）==========
window.HERO_SQUAD_EVENT_TEMPLATES = [
    {
        id: 'squad_dispute',
        name: '分赃不均',
        desc: '关系-1',
        type: 'squad',
        weight: 5,
        handler: (g, squad) => {
            // 随机选两人关系恶化
            if (squad.length >= 2) {
                const a = squad[RAND(squad.length)];
                const b = squad.filter(s => s !== a)[RAND(squad.length - 1)];
                g._setHeroRelation(a, b, -1, 'loot_dispute');
                return {
                    title: `【小队】${a.name}与${b.name}发生了争执`,
                    text: `分赃不均导致小队内部产生裂痕，两人关系恶化了。`,
                    effects: [{ type: 'relation', value: -1 }]
                };
            }
            return null;
        }
    },
    {
        id: 'squad_bigchest',
        name: '发现大宝箱',
        desc: '全队获得装备',
        type: 'squad',
        weight: 4,
        handler: (g, squad) => {
            const logs = [];
            for (const member of squad) {
                const gear = GearSystem.generateGear('ring', member.level, 1 + RAND(2));
                const r = GearSystem.equipItem(member, gear);
                logs.push(`${member.name}: ${r.msg}`);
            }
            return {
                title: `【小队】${squad[0].name}的小队发现了大宝箱`,
                text: `全队瓜分了宝箱中的战利品。\n${logs.join('\n')}`,
                effects: [{ type: 'loot' }]
            };
        }
    },
    {
        id: 'squad_maze',
        name: '误入迷宫',
        desc: '进度-20%',
        type: 'squad',
        weight: 4,
        handler: (g, squad) => {
            for (const member of squad) {
                const p = Math.max(0, (g.getHeroProgress(member) || 0) - 20);
                member.cflag[CFLAGS.HERO_PROGRESS] = p;
            }
            return {
                title: `【小队】${squad[0].name}的小队误入了迷宫`,
                text: `错综复杂的通道让小队迷失了方向，浪费了大量时间。`,
                effects: [{ type: 'progress', value: -20 }]
            };
        }
    },
    {
        id: 'squad_elitegroup',
        name: '遭遇精英群',
        desc: '战斗',
        type: 'squad',
        weight: 5,
        handler: (g, squad) => {
            // 由 DungeonExplorer 处理战斗
            return {
                title: `【小队】${squad[0].name}的小队遭遇了精英怪物群`,
                text: `数只精英魔物从暗处涌出，小队被迫进入战斗！`,
                effects: [{ type: 'combat' }]
            };
        }
    },
    {
        id: 'squad_campfire',
        name: '篝火休息',
        desc: '恢复30%HP',
        type: 'squad',
        weight: 6,
        handler: (g, squad) => {
            for (const member of squad) {
                const heal = Math.floor(member.maxHp * 0.3);
                member.hp = Math.min(member.maxHp, member.hp + heal);
            }
            return {
                title: `【小队】${squad[0].name}的小队围坐在篝火旁休息`,
                text: `温暖的篝火让疲惫的勇者们恢复了些许体力。全队HP恢复30%。`,
                effects: [{ type: 'heal', value: 30 }]
            };
        }
    },
    {
        id: 'squad_encourage',
        name: '互相激励',
        desc: '关系+1，全队攻击力+10%当天',
        type: 'squad',
        weight: 5,
        handler: (g, squad) => {
            for (let i = 0; i < squad.length; i++) {
                for (let j = i + 1; j < squad.length; j++) {
                    g._setHeroRelation(squad[i], squad[j], 1, 'encourage');
                }
            }
            return {
                title: `【小队】${squad[0].name}的小队互相激励`,
                text: `在艰难的旅途中，队员们互相鼓励，关系变得更加紧密了。`,
                effects: [{ type: 'relation', value: 1 }]
            };
        }
    },
    {
        id: 'squad_lost',
        name: '迷路',
        desc: '小队随机分散',
        type: 'squad',
        weight: 3,
        handler: (g, squad) => {
            // 解散小队
            for (const member of squad) {
                member.cflag[CFLAGS.SQUAD_ID] = 0;
                member.cflag[CFLAGS.SQUAD_LEADER] = 0;
            }
            return {
                title: `【小队】${squad[0].name}的小队在迷雾中走散了`,
                text: `浓雾遮蔽了一切，当视野恢复时，小队成员已经分散在各处。`,
                effects: [{ type: 'disband' }]
            };
        }
    },
    {
        id: 'squad_hidden_shop',
        name: '发现隐藏商店',
        desc: '可购买特殊道具',
        type: 'squad',
        weight: 4,
        handler: (g, squad) => {
            return {
                title: `【小队】${squad[0].name}的小队发现了隐藏商店`,
                text: `地下城的隐秘角落中，一位神秘商人正在贩卖稀有道具。`,
                effects: [{ type: 'shop' }]
            };
        }
    }
];

// ========== 关系事件（6个）==========
window.HERO_RELATION_EVENT_TEMPLATES = [
    {
        id: 'relation_love',
        name: '恋爱',
        desc: '关系+3',
        type: 'relation',
        weight: 3,
        condition: (a, b) => { const r = G._getHeroRelation(a, b); return r.level >= 3; },
        handler: (g, a, b) => {
            g._setHeroRelation(a, b, 3, 'love');
            return { title: `💕 ${a.name}与${b.name}坠入爱河`, text: `两人在战斗中建立了深厚的羁绊...`, effects: [{ type: 'relation', value: 3 }] };
        }
    },
    {
        id: 'relation_propose',
        name: '求婚',
        desc: '高关系时触发',
        type: 'relation',
        weight: 2,
        condition: (a, b) => { const r = G._getHeroRelation(a, b); return r.level >= 5; },
        handler: (g, a, b) => {
            return { title: `💍 ${a.name}向${b.name}求婚了`, text: `在地下城的深处，${a.name}单膝跪地...`, effects: [{ type: 'proposal' }] };
        }
    },
    {
        id: 'relation_rival',
        name: '情敌内斗',
        desc: '关系破裂→战斗',
        type: 'relation',
        weight: 2,
        condition: (a, b) => { const r = G._getHeroRelation(a, b); return r.level <= 1; },
        handler: (g, a, b) => {
            g._setHeroRelation(a, b, -2, 'rival_fight');
            return { title: `⚔️ ${a.name}与${b.name}爆发了内斗`, text: `积压已久的矛盾终于爆发，两人拔剑相向...`, effects: [{ type: 'combat' }] };
        }
    },
    {
        id: 'relation_rescue',
        name: '孤注一掷',
        desc: '低HP时互相救助',
        type: 'relation',
        weight: 4,
        condition: (a, b) => (a.hp / a.maxHp < 0.3) || (b.hp / b.maxHp < 0.3),
        handler: (g, a, b) => {
            const healA = Math.floor(a.maxHp * 0.2);
            const healB = Math.floor(b.maxHp * 0.2);
            a.hp = Math.min(a.maxHp, a.hp + healA);
            b.hp = Math.min(b.maxHp, b.hp + healB);
            return { title: `🤝 ${a.name}与${b.name}互相救助`, text: `在生死关头，两人伸出援手...`, effects: [{ type: 'heal' }] };
        }
    },
    {
        id: 'relation_betrayal',
        name: '背叛',
        desc: '低关系时离队',
        type: 'relation',
        weight: 2,
        condition: (a, b) => { const r = G._getHeroRelation(a, b); return r.level <= 0; },
        handler: (g, a, b) => {
            a.cflag[CFLAGS.SQUAD_ID] = 0;
            a.cflag[CFLAGS.SQUAD_LEADER] = 0;
            return { title: `😠 ${a.name}背叛了${b.name}`, text: `${a.name}无法忍受${b.name}，选择独自离开...`, effects: [{ type: 'leave' }] };
        }
    },
    {
        id: 'relation_share',
        name: '分享战利品',
        desc: '关系+1',
        type: 'relation',
        weight: 6,
        handler: (g, a, b) => {
            g._setHeroRelation(a, b, 1, 'share_loot');
            return { title: `🎁 ${a.name}与${b.name}分享了战利品`, text: `两人平分了发现的宝物，关系变好了。`, effects: [{ type: 'relation', value: 1 }] };
        }
    }
];

// ========== 魔王军冒险事件（6个）==========
// 这些已在 EventSystem._getDemonArmyEventPool() 中实现
window.DEMON_ARMY_EVENT_TEMPLATES = [
    { id: 'demon_train',    name: '训练魔物',     desc: 'EXP+等级×3' },
    { id: 'demon_crystal',  name: '发现堕落结晶', desc: '获得道具' },
    { id: 'demon_rumor',    name: '散播谣言',     desc: '地下城声望+10' },
    { id: 'demon_equip',    name: '强化装备',     desc: '装备品质临时提升' },
    { id: 'demon_capture',  name: '捕获落单勇者', desc: '直接俘虏' },
    { id: 'demon_meditate', name: '冥想修炼',     desc: 'MP恢复，EXP+等级×2' }
];

console.log('[EventDefs] 事件定义模板加载完成：', {
    heroSingle: window.HERO_SINGLE_EVENT_TEMPLATES.length,
    heroSquad: window.HERO_SQUAD_EVENT_TEMPLATES.length,
    heroRelation: window.HERO_RELATION_EVENT_TEMPLATES.length,
    demonArmy: window.DEMON_ARMY_EVENT_TEMPLATES.length
});
