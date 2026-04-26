/**
 * EventSystem - NSFW日常事件版（扩充文本）
 */
class EventSystem {
    constructor(game) {
        this.game = game;
    }

    // V12.0: 阶段D重构——拆分为魔王日常和冒险日常
    processMasterDaily() {
        // 魔王日常事件：结束一天后触发（魔王/奴隶/俘虏互动）
        const results = [];
        const dailyCount = this.game.flag[501] || 2;
        results.push(...this._processDailyEvents(dailyCount));
        return results;
    }

    processAdventureDaily() {
        // 冒险日常事件：观察勇者活动后触发（勇者地下城事件+魔王军冒险事件）
        const results = [];
        // 每日开始时清零间谍标记
        for (const hero of this.game.invaders) {
            hero.cflag[CFLAGS.SPY_SENT] = 0;
        }
        results.push(...this._processDungeonEvents());
        results.push(...this._processDemonArmyEvents());
        return results;
    }

    // 兼容旧调用
    processDayEnd() {
        return this.processMasterDaily();
    }

    _processDailyEvents(count) {
        const results = [];
        const triggerRate = this.game.flag[502] !== undefined ? this.game.flag[502] : 10;
        for (let i = 0; i < count; i++) {
            if (RAND(100) >= triggerRate) continue;
            const evt = this._pickWeightedDailyEvent();
            const result = evt.handler(this.game);
            if (result) results.push({ type: 'daily', ...result });
        }
        return results;
    }

    _pickWeightedDailyEvent() {
        const pool = this._getDailyEventPool();
        const totalWeight = pool.reduce((s, e) => s + e.weight, 0);
        let roll = RAND(totalWeight);
        for (const e of pool) {
            roll -= e.weight;
            if (roll < 0) return e;
        }
        return pool[pool.length - 1];
    }

    _getDailyEventPool() {
        const pool = [
            { id: 'master_meditation', weight: 8, handler: (g) => this._evtMasterMeditation(g) },
            { id: 'master_research',   weight: 6, handler: (g) => this._evtMasterResearch(g) },
            { id: 'master_essence',    weight: 5, handler: (g) => this._evtMasterEssence(g) },
            { id: 'master_patrol',     weight: 6, handler: (g) => this._evtMasterPatrol(g) },
            { id: 'master_tome',       weight: 4, handler: (g) => this._evtMasterTome(g) },
            { id: 'master_darkritual', weight: 3, handler: (g) => this._evtMasterDarkRitual(g) },
            { id: 'unfallen_service',    weight: 10, handler: (g) => this._evtUnfallenService(g) },
            { id: 'unfallen_walk',       weight: 8,  handler: (g) => this._evtUnfallenWalk(g) },
            { id: 'unfallen_bondage',    weight: 7,  handler: (g) => this._evtUnfallenBondage(g) },
            { id: 'unfallen_chastity',   weight: 6,  handler: (g) => this._evtUnfallenChastity(g) },
            { id: 'unfallen_nighttrain', weight: 8,  handler: (g) => this._evtUnfallenNightTrain(g) },
            { id: 'unfallen_drug',       weight: 5,  handler: (g) => this._evtUnfallenDrug(g) },
            { id: 'unfallen_show',       weight: 7,  handler: (g) => this._evtUnfallenShow(g) },
            { id: 'unfallen_whip',       weight: 6,  handler: (g) => this._evtUnfallenWhip(g) },
            { id: 'unfallen_brainwash',  weight: 5,  handler: (g) => this._evtUnfallenBrainwash(g) },
            { id: 'unfallen_inspection', weight: 6,  handler: (g) => this._evtUnfallenInspection(g) },
            { id: 'unfallen_sensory',    weight: 5,  handler: (g) => this._evtUnfallenSensory(g) },
            { id: 'unfallen_shamepose',  weight: 6,  handler: (g) => this._evtUnfallenShamePose(g) },
            { id: 'unfallen_public',     weight: 5,  handler: (g) => this._evtUnfallenPublic(g) },
            { id: 'unfallen_bathe',      weight: 6,  handler: (g) => this._evtUnfallenBathe(g) },
            { id: 'slave_dream',         weight: 6,  handler: (g) => this._evtSlaveDream(g) },
            { id: 'fallen_service',      weight: 10, handler: (g) => this._evtFallenService(g) },
            { id: 'fallen_masturbate',   weight: 9,  handler: (g) => this._evtFallenMasturbate(g) },
            { id: 'fallen_yuri',         weight: 8,  handler: (g) => this._evtFallenYuri(g) },
            { id: 'fallen_crave',        weight: 7,  handler: (g) => this._evtFallenCrave(g) },
            { id: 'fallen_lingerie',     weight: 6,  handler: (g) => this._evtFallenLingerie(g) },
            { id: 'fallen_beg',          weight: 7,  handler: (g) => this._evtFallenBeg(g) },
            { id: 'fallen_dream',        weight: 6,  handler: (g) => this._evtFallenDream(g) },
            { id: 'fallen_mutual',       weight: 7,  handler: (g) => this._evtFallenMutual(g) },
            { id: 'fallen_expose',       weight: 6,  handler: (g) => this._evtFallenExpose(g) },
            { id: 'fallen_compete',      weight: 5,  handler: (g) => this._evtFallenCompete(g) },
            { id: 'fallen_sensitive',    weight: 6,  handler: (g) => this._evtFallenSensitive(g) },
            { id: 'fallen_memory',       weight: 5,  handler: (g) => this._evtFallenMemory(g) },
            { id: 'fallen_dirtytalk',    weight: 5,  handler: (g) => this._evtFallenDirtyTalk(g) },
            { id: 'fallen_milking',      weight: 5,  handler: (g) => this._evtFallenMilking(g) },
            { id: 'fallen_breedwish',    weight: 4,  handler: (g) => this._evtFallenBreedWish(g) },
            { id: 'fallen_petplay',      weight: 5,  handler: (g) => this._evtFallenPetPlay(g) },
            { id: 'fallen_heat',         weight: 6,  handler: (g) => this._evtFallenHeat(g) },
            { id: 'slave_chat',      weight: 4, handler: (g) => this._evtSlaveChat(g) },
            { id: 'slave_argue',     weight: 3, handler: (g) => this._evtSlaveArgue(g) },
            { id: 'slave_bond',      weight: 4, handler: (g) => this._evtSlaveBond(g) },
            { id: 'find_treasure',   weight: 3, handler: (g) => this._evtFindTreasure(g) },
            { id: 'slave_ill',       weight: 2, handler: (g) => this._evtSlaveIll(g) },
            { id: 'slave_escape',    weight: 2, handler: (g) => this._evtSlaveEscapeTry(g) },
            { id: 'memory_recovery', weight: 5, handler: (g) => this._evtMemoryRecovery(g) },
            { id: 'orgy_feast',           weight: 4, handler: (g) => this._evtOrgyFeast(g) },
            { id: 'fallen_teaches',       weight: 5, handler: (g) => this._evtFallenTeachesUnfallen(g) },
            // V12.0: 新增魔王专属事件（20个）
            { id: 'master_torture_insight', weight: 4, handler: (g) => this._evtMasterTortureInsight(g) },
            { id: 'master_slave_chat',      weight: 5, handler: (g) => this._evtMasterSlaveChat(g) },
            { id: 'master_past_diary',      weight: 3, handler: (g) => this._evtMasterPastDiary(g) },
            { id: 'master_dream_past',      weight: 4, handler: (g) => this._evtMasterDreamPast(g) },
            { id: 'master_visitor',         weight: 3, handler: (g) => this._evtMasterVisitor(g) },
            { id: 'master_rebellion_quell', weight: 3, handler: (g) => this._evtMasterRebellionQuell(g) },
            { id: 'master_ritual_upgrade',  weight: 3, handler: (g) => this._evtMasterRitualUpgrade(g) },
            { id: 'master_spy_report',      weight: 5, handler: (g) => this._evtMasterSpyReport(g) },
            { id: 'master_hero_analysis',   weight: 4, handler: (g) => this._evtMasterHeroAnalysis(g) },
            { id: 'master_weapon_forge',    weight: 3, handler: (g) => this._evtMasterWeaponForge(g) },
            { id: 'master_curse_study',     weight: 3, handler: (g) => this._evtMasterCurseStudy(g) },
            { id: 'master_potion_brew',     weight: 4, handler: (g) => this._evtMasterPotionBrew(g) },
            { id: 'master_trap_set',        weight: 4, handler: (g) => this._evtMasterTrapSet(g) },
            { id: 'master_dungeon_expand',  weight: 2, handler: (g) => this._evtMasterDungeonExpand(g) },
            { id: 'master_alliance_break',  weight: 3, handler: (g) => this._evtMasterAllianceBreak(g) },
            { id: 'master_pride_growth',    weight: 4, handler: (g) => this._evtMasterPrideGrowth(g) },
            { id: 'master_lonely',          weight: 4, handler: (g) => this._evtMasterLonely(g) },
            { id: 'master_slave_gift',      weight: 5, handler: (g) => this._evtMasterSlaveGift(g) },
            { id: 'master_omen',            weight: 3, handler: (g) => this._evtMasterOmen(g) },
            { id: 'master_final_prep',      weight: 2, handler: (g) => this._evtMasterFinalPrep(g) }
        ];
        // 结婚事件：仅当存在结婚对象时加入池子
        if (this._getMarriedSlave(this.game)) {
            pool.push({ id: 'wedding_night', weight: 8, handler: (g) => this._evtWeddingNight(g) });
        }
        return pool;
    }

    _getRandomSlave(g, excludeMaster = true) {
        const list = excludeMaster ? g.characters.filter((c, i) => i !== g.master) : g.characters;
        if (list.length === 0) return null;
        return list[RAND(list.length)];
    }

    _getTwoSlaves(g) {
        const slaves = g.characters.filter((c, i) => i !== g.master);
        if (slaves.length < 2) return null;
        let a = slaves[RAND(slaves.length)];
        let b = slaves[RAND(slaves.length)];
        if (a === b) b = slaves[(slaves.indexOf(a) + 1) % slaves.length];
        return [a, b];
    }

    _getMarriedSlave(g) {
        return g.characters.find((c, i) => i !== g.master && c.cflag[CFLAGS.LOVE_POINTS]) || null;
    }

    _isFallen(c) {
        // V4.0: Fallen if submission mark (mark[0]) OR service mark (mark[2]) reaches Lv3
        return (c.mark[0] || 0) >= 3 || (c.mark[2] || 0) >= 3;
    }

    /**
     * 根据角色talent生成事件文本修饰
     */
    _getTalentFlavor(c) {
        if (!c) return null;
        const parts = [];
        const T = (id) => c.talent[id];
        if (T(10)) parts.push(`${c.name}始终低着头，不敢直视任何人的眼睛。`);
        if (T(11)) parts.push(`${c.name}的眼中闪过一丝不甘，但很快又被压抑下去。`);
        if (T(12)) parts.push(`${c.name}咬紧牙关，强忍着不让自己发出任何声音。`);
        if (T(14)) parts.push(`${c.name}虽然顺从了，但眼神中依然带着高傲。`);
        if (T(16)) parts.push(`${c.name}全程都保持着卑微的姿态，仿佛这是她的荣幸。`);
        if (T(18)) parts.push(`${c.name}别过脸去，但耳根却红透了。`);
        if (T(20)) parts.push(`${c.name}努力克制着自己的反应，但身体已经诚实了。`);
        if (T(21)) parts.push(`${c.name}面无表情，仿佛这一切都和她无关。`);
        if (T(23)) parts.push(`${c.name}好奇地观察着周围的一切，眼中闪烁着求知的光芒。`);
        if (T(25)) parts.push(`${c.name}看起来竟然很开心，完全不像是一个被囚禁的奴隶。`);
        if (T(26)) parts.push(`${c.name}的眼中满是绝望，似乎已经预料到了最糟糕的结果。`);
        if (T(27)) parts.push(`${c.name}保持着高度警惕，随时准备应对突发状况。`);
        if (T(30)) parts.push(`${c.name}咬着嘴唇，显然对即将发生的事感到非常抵触。`);
        if (T(33)) parts.push(`${c.name}兴奋得浑身颤抖，迫不及待地想要开始。`);
        if (T(35)) parts.push(`${c.name}的脸红得像熟透的苹果，全程都不敢抬头。`);
        if (T(36)) parts.push(`${c.name}完全没有羞耻的样子，反而主动展示着自己。`);
        if (T(40)) parts.push(`${c.name}的身体在微微颤抖，显然非常害怕疼痛。`);
        if (T(41)) parts.push(`${c.name}面无表情地承受着一切，仿佛感受不到痛苦。`);
        if (T(44)) parts.push(`${c.name}的眼眶已经红了，随时可能哭出来。`);
        if (T(60)) parts.push(`${c.name}的手指不自觉地在自己的大腿上摩挲着，似乎很想触碰自己。`);
        if (T(74)) parts.push(`${c.name}的眼神迷离，手指不断摩挲着身体的敏感部位。`);
        if (T(75)) parts.push(`${c.name}的腰肢不自觉地扭动着，显然在渴求着被填充。`);
        if (T(76)) parts.push(`${c.name}的呼吸急促，眼中满是欲求不满的渴望。`);
        if (T(77)) parts.push(`${c.name}不自觉地用手抚摸着自己的臀部，似乎在回味着什么。`);
        if (T(78)) parts.push(`${c.name}的双手一直停留在自己的胸部上，不肯离开。`);
        if (T(79)) parts.push(`${c.name}举止豪爽，完全不像是面临调教的样子。`);
        if (T(80)) parts.push(`${c.name}的嘴角挂着一丝变态的微笑，似乎很享受这一切。`);
        if (T(81)) parts.push(`${c.name}对同性投去了暧昧的目光。`);
        if (T(82)) parts.push(`${c.name}对男性投去了厌恶的目光。`);
        if (T(83)) parts.push(`${c.name}的眼中闪烁着施虐的光芒，似乎在盘算着什么。`);
        if (T(85)) parts.push(`${c.name}的眼中只有魔王，仿佛全世界都不存在了。`);
        if (T(86)) parts.push(`${c.name}的眼神虔诚，仿佛在进行某种神圣的仪式。`);
        if (T(87)) parts.push(`${c.name}狡黠地笑着，似乎在计划着什么恶作剧。`);
        if (T(88)) parts.push(`${c.name}渴望着更多的痛苦，每一次刺激都让她更加兴奋。`);
        if (T(89)) parts.push(`${c.name}被观看的感觉让她更加兴奋，私处已经湿透了。`);
        if (T(91)) parts.push(`${c.name}身上散发着一股迷人的魅力，让人无法移开视线。`);
        if (T(92)) parts.push(`${c.name}的存在本身就让人感到一种不可抗拒的吸引力。`);
        if (T(93)) parts.push(`${c.name}的周围弥漫着一股令人窒息的压迫感。`);
        if (T(160)) parts.push(`${c.name}温柔地注视着周围的一切，眼中充满了慈爱。`);
        if (T(161)) parts.push(`${c.name}自信满满，仿佛一切尽在掌握之中。`);
        if (T(162)) parts.push(`${c.name}缩在角落里，像一只受惊的小动物。`);
        if (T(163)) parts.push(`${c.name}始终保持着优雅的举止，即使在最屈辱的时刻也不失风度。`);
        if (T(164)) parts.push(`${c.name}冷静地分析着眼前的状况，面无表情。`);
        if (T(165)) parts.push(`${c.name}的威严让人不由自主地想要臣服。`);
        if (T(166)) parts.push(`${c.name}的眼中闪过一丝恶作剧的光芒。`);
        if (T(171)) parts.push(`${c.name}纯洁得像一朵百合花，让人不忍心伤害。`);
        if (T(172)) parts.push(`${c.name}默默观察着一切，似乎在收集数据。`);
        if (T(174)) parts.push(`${c.name}保持着贵族般的优雅，即使在屈服时也不失高傲。`);
        if (T(175)) parts.push(`${c.name}机灵地观察着周围的一切，随时准备应对。`);
        return parts.length > 0 ? parts[RAND(parts.length)] : null;
    }

    /**
     * 初体验保护检查：涉及初吻/初夜/初肛的事件对无经验者豁免
     * @param {Character} c 目标角色
     * @param {string} type 'kiss'|'vaginal'|'anal'
     * @returns {boolean} true=可触发, false=需豁免
     */
    _checkFirstTimeProtection(c, type) {
        if (!c) return false;
        if (type === 'kiss' && (c.exp[22] || 0) === 0) return false;
        if (type === 'vaginal' && (c.talent[0] || c.talent[123])) return false;
        if (type === 'anal' && (c.exp[1] || 0) === 0) return false;
        return true;
    }

    _gainPalam(c, type, val) {
        if (!c.palam) return;
        const map = { 5: 6, 6: 5 };
        const realType = map[type] !== undefined ? map[type] : type;
        c.palam[realType] = (c.palam[realType] || 0) + val;
    }

    _evtMasterMeditation(g) {
        const mpGain = 30 + RAND(50);
        const expGain = 3 + RAND(5);
        const master = g.getMaster();
        if (master) master.mp = Math.min(master.maxMp, master.mp + mpGain);
        g.masterExp += expGain;
        return {
            title: `【魔王】深夜冥想`,
            text: `魔王独自坐在地下城最高处的冥想室中。四周一片寂静，只有魔力流淌时发出的微弱嗡鸣声。他闭上眼睛，将意识沉入体内，感受着魔核中涌动的黑暗力量。\n\n随着呼吸的节奏，外界的魔力缓缓流入他的身体，像是一条条黑色的丝线，编织成更加坚固的魔力回路。每一次吐纳，都有杂质被排出体外，留下的只有最纯粹的黑暗精华。\n\n在冥想的过程中，魔王回顾了今天发生的一切——哪些奴隶需要加倍的调教，哪些勇者需要重点提防，地下城的防御还有哪些漏洞。他的思维如同精密的齿轮，将所有的信息整合成明日的计划。\n\n当冥想结束时，黎明的第一缕光芒正好穿透地下城的缝隙。魔王睁开眼睛，瞳孔中闪过一道紫黑色的光芒。他的魔力已经恢复到了巅峰状态，甚至比昨天更加强大。\n\n气力 +${mpGain}，调教经验 +${expGain}。`,
            effects: [{ target: `魔王`, mp: mpGain, exp: expGain }]
        };
    }

    _evtMasterResearch(g) {
        const expGain = 5 + RAND(8);
        g.masterExp += expGain;
        const master = g.getMaster();
        if (master) master.mp = Math.min(master.maxMp, master.mp + 20);
        return {
            title: `【魔王】调教术研究`,
            text: `深夜的魔王书房中，烛火摇曳，将满墙的书架投射出怪异的阴影。魔王正坐在堆满古籍的桌前，手中捧着一本封面用不知名生物皮革装订的禁书。\n\n书页泛黄，上面记载着早已失传的古老调教术式，包括如何通过魔力链接直接刺激奴隶的神经末梢，如何制造持续数日的快感幻觉，以及如何让奴隶在清醒状态下完全丧失抵抗意志。魔王一边阅读，一边用羽毛笔在羊皮纸上做着笔记，偶尔还会低声念诵几句咒文，测试新学到的技巧。\n\n空气中弥漫着墨水和陈旧纸张的味道，混合着魔王身上淡淡的魔力气息。经过一整夜的研究，魔王对奴隶身体的了解又深入了一层——他知道如何用最轻微的刺激引发最强烈的反应，知道每一种痛苦与快感的临界点在哪里。这些知识将成为明天调教的有力武器。\n\n调教经验 +${expGain}，魔力 +20。`,
            effects: [{ target: `魔王`, exp: expGain, mp: 20 }]
        };
    }

    _evtMasterEssence(g) {
        const slaves = g.characters.filter((c, i) => i !== g.master && c.hp > 0);
        if (slaves.length === 0) return this._evtMasterMeditation(g);
        const target = slaves[RAND(slaves.length)];
        const mpGain = 40 + RAND(40);
        const expGain = 5 + RAND(5);
        const master = g.getMaster();
        if (master) master.mp = Math.min(master.maxMp, master.mp + mpGain);
        g.masterExp += expGain;
        const hpDrain = 10 + RAND(15);
        target.hp = Math.max(1, target.hp - hpDrain);
        this._gainPalam(target, 6, 50);
        return {
            title: `【魔王】精气吸取`,
            text: `魔王将${target.name}唤至寝室深处的一间密室。房间中央摆放着一张由黑曜石打造的床榻，四周的墙壁上镶嵌着发光的魔晶，将室内映照成暧昧的紫红色。\n\n${target.name}被命令脱去所有衣物，平躺在冰凉的石床上。魔王伸出右手，掌心浮现出一个旋转的魔力漩涡，缓缓按在${target.name}的腹部。刹那间，${target.name}感到一股强大的吸力从体内涌出，仿佛有什么珍贵的东西正被强行抽离。\n\n她的生命精气化作淡金色的光点，顺着魔王的手臂流入他的体内，带来一阵温暖的充实感。与此同时，${target.name}的脸色逐渐苍白，身体不由自主地颤抖着，但奇怪的是，她的眼神却变得迷离起来——精气流失的过程伴随着一种诡异的快感，仿佛最私密的部位被无形的手指不断撩拨。\n\n魔王一边吸取精气，一边用另一只手在${target.name}的身体上游走，感受着那逐渐虚弱却依然温热的肌肤。他的手指滑过锁骨、乳房、腰肢，最后在私处的上方停留，用魔力激发出一波又一波的酥麻感。${target.name}想要挣扎，但身体却软得像棉花一样，只能发出细碎的呻吟。\n\n当吸取结束时，${target.name}已经瘫软在床榻上，大口喘息着，私处湿润得不成样子。而魔王则容光焕发，魔力充盈得几乎要溢出来。他俯身在${target.name}耳边低语：「你的身体……比昨天更加美味了。」\n\n魔王魔力 +${mpGain}，调教经验 +${expGain}。${target.name} HP -${hpDrain}，情欲上升。`,
            effects: [{ target: `魔王`, mp: mpGain, exp: expGain }, { target: target.name, hp: -hpDrain }]
        };
    }

    _evtMasterPatrol(g) {
        g.masterExp += 4;
        const income = 50 + RAND(100);
        g.money += income;
        return {
            title: `【魔王】地下城巡视`,
            text: `魔王决定亲自巡视地下城的每一个角落。他从最底层开始，沿着蜿蜒的石阶向上走去。每一层都有魔物们恭敬地俯首行礼，陷阱装置在他的魔力波动下自动解除。\n\n在第五层的一个隐蔽角落，魔王发现了一处前人遗留下来的密室，里面散落着一些古旧的金币和珠宝——显然是过去某位失败勇者的遗物。魔王随手一挥，将这些财宝收入囊中。继续向上，他在第七层检查了新安装的陷阱机关，确认一切运转正常。\n\n巡视结束后，魔王回到王座厅，清点着今日的收获。虽然只是些零散的金币，但积少成多，这些财富可以用来购买更好的调教道具，或者升级地下城的设施。\n\n发现并回收了散落的财宝 ${income}G。调教经验 +4。`,
            effects: [{ target: `魔王`, exp: 4, money: income }]
        };
    }

    _evtMasterTome(g) {
        g.masterExp += 8;
        const master = g.getMaster();
        if (master) master.mp = Math.min(master.maxMp, master.mp + 60);
        return {
            title: `【魔王】古籍解读`,
            text: `魔王在地下城最深层的古老藏书室中度过了一整天。这里收藏着自上古时代流传下来的魔导书，每一本都价值连城，记载着失传已久的秘术。\n\n在一堆尘封的古籍中，魔王偶然发现了一本与众不同的册子——封面用龙鳞包裹，书脊上镶嵌着七颗不同颜色的宝石。翻开第一页，魔王的眼中立刻闪烁出兴奋的光芒：这是一本记载着淫魔术式的魔导书，书中详细描述了如何利用魔力直接操控生物的感官系统，如何制造持续性的快感脉冲，甚至如何将奴隶的身体改造成对特定刺激极度敏感的体质。\n\n魔王如饥似渴地阅读着，将每一个术式都牢记在心。当最后一页翻过时，天色已暗，但魔王的精神却异常亢奋。他合上书本，感受着脑海中新增的知识，迫不及待地想要在下一次调教中实践这些失传的秘术。\n\n调教经验 +8，魔力 +60。`,
            effects: [{ target: `魔王`, exp: 8, mp: 60 }]
        };
    }

    _evtMasterDarkRitual(g) {
        const expGain = 10 + RAND(10);
        g.masterExp += expGain;
        const master = g.getMaster();
        if (master) {
            master.mp = Math.min(master.maxMp, master.mp + 80);
            master.hp = Math.min(master.maxHp, master.hp + 30);
        }
        return {
            title: `【魔王】黑暗仪式`,
            text: `地下城最深处的祭坛上，魔王正在进行一场古老而禁忌的黑暗仪式。祭坛由整块黑曜石雕刻而成，表面刻满了繁复的符文，在魔力的注入下发出暗红色的幽光。\n\n魔王赤裸上身，手中握着一把由龙骨打磨而成的匕首，在自己的手掌上划出一道伤口。鲜血滴落在祭坛中央，瞬间被符文吸收，整个祭坛开始剧烈震动。四周的空气中出现了无数扭曲的暗影，它们围绕着魔王旋转、尖啸，最终化作纯粹的黑暗能量钻入魔王体内。\n\n仪式持续了整个午夜，当最后一丝暗影被吸收后，魔王仰天长啸，声浪震得地下城都在颤抖。他的身体散发出前所未有的强大魔力波动，皮肤上浮现出古老而神秘的魔纹。这场仪式不仅大幅提升了魔王的魔力储备和生命力，更让他的灵魂与地下城的本源建立了更深层次的连接。从今往后，这座地下城将成为他身体的延伸，而其中的每一个奴隶，都将更加无法逃脱他的掌控。\n\n调教经验 +${expGain}，魔力 +80，HP +30。`,
            effects: [{ target: `魔王`, exp: expGain, mp: 80, hp: 30 }]
        };
    }

    _evtSlaveChat(g) {
        const pair = this._getTwoSlaves(g);
        if (!pair) return null;
        const [a, b] = pair;
        this._gainPalam(a, 5, 20);
        this._gainPalam(b, 5, 20);
        const flavorChat = this._getTalentFlavor(a) || this._getTalentFlavor(b);
        return {
            title: `【日常】${a.name}与${b.name}的私语`,
            text: `地下城的深夜，两个奴隶趁着守卫换班的间隙，在牢房的角落中低声交谈。她们背靠着冰冷的石壁，用只有彼此能听见的声音分享着各自的遭遇。\n\n${a.name}讲述着白天被魔王调教的细节，语气中混合着羞耻与某种难以言喻的复杂情感；${b.name}则倾诉着自己对故乡的思念，眼泪无声地滑落脸颊。在这个暗无天日的地方，这样的私语是她们唯一的慰藉。\n\n她们互相安慰，互相鼓励，约定无论如何都要活下去。当远处传来脚步声时，两人立刻分开，装作正在熟睡的样子。在这短暂的几分钟里，她们不是奴隶，只是两个互相依靠的普通女孩。${flavorChat ? '\n\n' + flavorChat : ''}\n\n两人的屈服小幅上升。`,
            effects: []
        };
    }

    _evtSlaveArgue(g) {
        const pair = this._getTwoSlaves(g);
        if (!pair) return null;
        const [a, b] = pair;
        // 已陷落或特殊奴隶不会争执
        if (this._isFallen(a) || a.talent[199] || this._isFallen(b) || b.talent[199]) return this._evtSlaveBond(g);
        this._gainPalam(a, 7, 20);
        this._gainPalam(b, 7, 20);
        return {
            title: `【日常】${a.name}与${b.name}的争执`,
            text: `压抑的环境终究让两个奴隶爆发了争执。起因只是一件微不足道的小事——${a.name}在分配食物时多拿了一块面包。但在这种暗无天日的地方，哪怕是最微小的不公也会被无限放大。\n\n争吵很快升级，从互相指责到推搡，最后甚至扭打在一起。其他奴隶们要么冷漠地看着，要么低声劝解，但没有人敢大声制止——生怕引来魔王的注意。最终，一名年长的奴隶出面将两人拉开。\n\n筋疲力尽的两人背对着背坐在牢房两端，谁也不肯先开口道歉。在这场争吵中，她们失去的不仅是一块面包，还有彼此之间那脆弱的信任。\n\n两人的恐怖小幅上升。`,
            effects: []
        };
    }

    _evtSlaveBond(g) {
        const pair = this._getTwoSlaves(g);
        if (!pair) return null;
        const [a, b] = pair;
        this._gainPalam(a, 5, 40);
        this._gainPalam(b, 5, 40);
        // 好事件可能增加最大HP或气力
        const hpUp = RAND(4) === 0;
        if (hpUp) { a.maxHp += 5; a.hp += 5; b.maxHp += 5; b.hp += 5; }
        const mpUp = !hpUp && RAND(4) === 0;
        if (mpUp) { a.maxMp += 5; a.mp += 5; b.maxMp += 5; b.mp += 5; }
        let extra = ``;
        if (hpUp) extra = `\n\n两人的最大HP +5。`;
        else if (mpUp) extra = `\n\n两人的最大气力 +5。`;
        const flavorBond = this._getTalentFlavor(a) || this._getTalentFlavor(b);
        return {
            title: `【日常】羁绊加深`,
            text: `深夜的牢房中传来压抑的啜泣声。${a.name}正蜷缩在角落中颤抖，白天的调教让她的身心都濒临崩溃。就在这时，${b.name}悄悄爬了过来，没有说任何安慰的话语，只是默默地握住了她的手。\n\n那只手温暖而坚定，传递着无声的支持和陪伴。哭泣的${a.name}将头靠在${b.name}的肩膀上，泪水浸湿了对方的衣衫。两人就这样依偎在一起，在黑暗中分享着彼此的体温。\n\n在这个充满绝望的地方，这种纯粹的肢体接触比任何言语都更有力量。她们知道明天还要继续面对魔王的调教，但此刻，至少她们不是孤单一人。这种在苦难中诞生的羁绊，虽然无法改变命运，却成为了支撑她们活下去的最后一根稻草。${flavorBond ? '\n\n' + flavorBond : ''}\n\n屈服上升。` + extra,
            effects: [].concat(hpUp ? [{ target: a.name + `/` + b.name, maxHp: `+5` }] : (mpUp ? [{ target: a.name + `/` + b.name, maxMp: `+5` }] : []))
        };
    }

    _evtFindTreasure(g) {
        const amt = 200 + RAND(300);
        g.money += amt;
        return {
            title: `【日常】发现财宝`,
            text: `魔王在巡视地下城时，偶然在一处坍塌的墙壁后发现了一个隐藏的密室。密室的入口被藤蔓和碎石掩盖，若不是魔王敏锐的魔力感知，恐怕永远也不会被发现。\n\n推开门，里面弥漫着一股陈旧的霉味，显然已经尘封了数十年。墙壁上挂着几幅褪色的画像，房间中央放着一个锈迹斑斑的铁箱。魔王走上前，用魔力轻松腐蚀了锁扣。\n\n箱子里装满了金币和珠宝，在魔晶灯的照耀下闪烁着诱人的光芒。这些财富显然是某位古代勇者的遗物——他可能死在了探索地下城的途中。\n\n金钱 +${amt}G。`,
            effects: [{ target: `money`, money: amt }]
        };
    }

    _evtSlaveIll(g) {
        const candidates = g.characters.filter((c, i) => i !== g.master && (c.mark[0] || 0) < 3 && !c.talent[199]);
        if (candidates.length === 0) return null;
        const c = candidates[RAND(candidates.length)];
        c.hp = Math.max(1, c.hp - 50);
        return {
            title: `【日常】${c.name}生病了`,
            text: `地下城的湿气远比想象中更加严重，尤其是深层的牢房，墙壁上常年凝结着水珠，空气中弥漫着一股腐朽的霉味。在这样的环境中生活，奴隶们的身体难免会出现问题。\n\n今天，${c.name}突然发起了高烧，蜷缩在冰冷的石床上，浑身颤抖，额头滚烫。她的同伴们焦急地围在周围，却束手无策——她们没有药物，也没有治疗魔法，只能用最原始的方式照顾她：用湿布敷在额头降温，喂她喝一些干净的凉水。\n\n看着昔日健康的同伴如今虚弱不堪的样子，其他奴隶们心中充满了恐惧和无力感。魔王得知此事后，冷漠地命令将她隔离，以免传染给其他财产。\n\nHP -50。`,
            effects: [{ target: c.name, hp: -50 }]
        };
    }

    _evtSlaveEscapeTry(g) {
        const candidates = g.characters.filter((c, i) => i !== g.master && (c.mark[0] || 0) < 3 && !c.talent[199]);
        if (candidates.length === 0) return null;
        const c = candidates[RAND(candidates.length)];
        const success = RAND(100) < 5;
        if (success) {
            const idx = g.characters.indexOf(c);
            if (idx > 0) g.delChara(idx);
            // 逃跑者转化为勇者重新冒险
            const hero = new Character(-2);
            hero.name = c.name;
            hero.callname = c.callname;
            hero.base = [...c.base];
            hero.maxbase = [...c.maxbase];
            hero.hp = Math.floor(c.maxHp * 0.5);
            hero.mp = Math.floor(c.maxMp * 0.4);
            hero.level = c.level;
            hero.cflag[CFLAGS.BASE_HP] = c.level;
            hero.cflag[CFLAGS.ATK] = c.cflag[CFLAGS.ATK] || 20 + c.level * 5;
            hero.cflag[CFLAGS.DEF] = c.cflag[CFLAGS.DEF] || 15 + c.level * 4;
            hero.cflag[CFLAGS.SPD] = c.cflag[CFLAGS.SPD] || 10 + c.level * 3;
            hero.talent = [...c.talent];
            hero.talent[200] = 0; // 不再是前勇者
            hero.cflag[912] = 0; // 不是伪装者
            hero.cflag[CFLAGS.HERO_RARITY] = c.cflag[CFLAGS.HERO_RARITY] || 'N'; // 继承原角色稀有度
            hero.talent[203] = 1; // 逃跑者特质
            hero.abl = [...c.abl];
            hero.mark = new Array(20).fill(0);
            hero.cflag[CFLAGS.HERO_FLOOR] = 1;
            hero.cflag[CFLAGS.HERO_PROGRESS] = 0;
            hero.hp = Math.floor(c.maxHp * 0.5);
            hero.mp = Math.floor(c.maxMp * 0.4);
            g.invaders.push(hero);
            return {
                title: `【日常】${c.name}逃跑了！`,
                text: `深夜，${c.name}趁着守卫换班的间隙，开始了她的逃跑计划。她已经观察了数周，摸清了守卫的巡逻路线和换班时间。\n\n她悄悄挪开事先松动的一块地砖，露出下面狭窄的通风管道。管道中弥漫着腐臭的气味，但她顾不了那么多，咬紧牙关钻了进去。\n\n借着夜色的掩护，${c.name}成功逃出了魔王城。她夺回了自由，但身体已经被魔王调教得敏感不堪。她发誓要变得更强，总有一天会回来复仇。\n\n${c.name}成为了新的入侵勇者，带着逃跑者的记忆潜入了地下城。`,
                effects: []
            };
        }
        return {
            title: `【日常】${c.name}的逃跑企图`,
            text: `深夜，${c.name}趁着守卫换班的间隙，开始了她的逃跑计划。她已经观察了数周，摸清了守卫的巡逻路线和换班时间。\n\n她悄悄挪开事先松动的一块地砖，露出下面狭窄的通风管道。然而就在她即将钻进去的那一刻，一只冰冷的爪子搭在了她的肩膀上。\n\n魔物守卫不知何时已经站在了她的身后，猩红的眼睛中闪烁着嘲弄的光芒。${c.name}被当场抓获，毫无反抗之力。\n\n作为惩罚，${c.name}被关进了禁闭室一晚。那个狭小黑暗的石头房间里，连呼吸都是一种折磨。`,
            effects: []
        };
    }

    _evtSlaveDream(g) {
        const c = this._getRandomSlave(g);
        if (!c) return null;
        c.mp = Math.min(c.maxMp, c.mp + 15);
        // 好事件可能增加最大HP或气力
        const hpUp = RAND(3) === 0;
        const mpUp = !hpUp && RAND(3) === 0;
        if (hpUp) { c.maxHp += 10; c.hp += 10; }
        if (mpUp) { c.maxMp += 10; c.mp += 10; }
        let extra = ``;
        if (hpUp) extra = `\n\n最大HP +10。`;
        else if (mpUp) extra = `\n\n最大气力 +10。`;
        const flavorDream = this._getTalentFlavor(c);
        return {
            title: `【日常】${c.name}的美梦`,
            text: `在漫长而痛苦的一天结束后，${c.name}终于陷入了沉睡。或许是因为白天被调教时产生的快感还残留在身体中，她的梦境异常甜美。\n\n在梦中，她回到了故乡的小村庄，阳光温暖，鸟语花香。她站在自家的院子里，看见母亲正在晾晒衣物，父亲在田里劳作，弟弟追着蝴蝶奔跑。一切都是那么熟悉，那么美好。\n\n梦中的她没有经历过任何苦难，只是一个普通的农家女孩，有着简单却幸福的生活。当清晨的阳光透过牢房的铁窗洒在她脸上时，她从梦中缓缓醒来。\n\n那一刻，她几乎分不清梦境和现实。直到身体的酸痛和私处残留的异样感觉提醒了她——那一切美好都只是虚幻的泡影。泪水无声地从眼角滑落，浸湿了破旧的枕巾。${flavorDream ? '\n\n' + flavorDream : ''}\n\n气力 +15。` + extra,
            effects: [{ target: c.name, mp: 15 }].concat(hpUp ? [{ target: c.name, maxHp: `+10` }] : (mpUp ? [{ target: c.name, maxMp: `+10` }] : []))
        };
    }

    // ========== 未陷落奴隶事件 ==========
    _evtUnfallenService(g) {
        const c = this._getRandomSlave(g);
        if (!c) return null;
        if (!this._checkFirstTimeProtection(c, 'kiss')) return this._evtUnfallenWalk(g);
        const oldMark = c.mark[0] || 0;
        c.addMark(0, 1);
        c.addMark(3, -1);
        this._gainPalam(c, 5, 80);
        this._gainPalam(c, 6, 30);
        const ablUp = RAND(3) === 0;
        if (ablUp) c.addAbl(13);
        const flavorUf1 = this._getTalentFlavor(c);
        return {
            title: `【调教】${c.name}的强制侍奉`,
            text: `魔王将${c.name}单独召进了王座厅。厅内昏暗而空旷，只有几支蜡烛在角落里燃烧，将魔王的影子拉得格外修长。魔王坐在高高的王座上，居高临下地俯视着跪在地上的${c.name}。\n\n「抬起头来。」魔王的声音低沉而威严，不容置疑。${c.name}咬着下唇，眼中含着屈辱的泪水，却不得不服从。她缓缓抬起头，正对上魔王那双深不见底的眼睛。魔王站起身来，走到她面前，解开腰间的衣带，将性器抵在了${c.name}的唇边。\n\n「张开嘴。」${c.name}的身体在颤抖，她咬紧牙关，试图做最后的抵抗。但魔王只是冷冷地看着她，眼神中没有一丝怜悯。最终，在巨大的心理压力下，${c.name}的眼角滑落一滴泪水，缓缓张开了嘴。魔王的性器侵入她的口腔，那股浓烈的气味让她几欲作呕，但她不敢反抗，只能用舌头笨拙地配合着。\n\n魔王的手按在她的后脑勺上，控制着节奏，时而深入喉底，时而抽出让她的唾液拉丝垂落。${c.name}的喉咙不断收缩，发出压抑的干呕声，但身体却渐渐开始发热——不知道是屈辱还是某种更深层的东西在作祟。\n\n当一切结束时，${c.name}跪在地上大口喘息着，嘴角还残留着白色的痕迹。${flavorUf1 ? '\n\n' + flavorUf1 : ''}\n\n服从度 ${oldMark}→${c.mark[0]}，反抗刻印 -1` + (ablUp ? `，侍奉技术 +1` : ``) + `。`,
            effects: [{ target: c.name, mark0: c.mark[0], mark3: -1 }]
        };
    }

    _evtUnfallenWalk(g) {
        const c = this._getRandomSlave(g);
        if (!c) return null;
        c.addMark(0, 1);
        c.addMark(3, -1);
        this._gainPalam(c, 6, 60);
        this._gainPalam(c, 5, 60);
        const ablUp = RAND(4) === 0;
        if (ablUp) c.addAbl(17);
        const flavorUf2 = this._getTalentFlavor(c);
        return {
            title: `【调教】${c.name}的羞耻露出行`,
            text: `魔王命令${c.name}脱去所有衣物，然后跟在自己身后，在地下城的主要走廊中行走。走廊两侧是无数魔物的巢穴，当${c.name}赤裸的身体暴露在空气中时，她能感受到无数道贪婪的目光从四面八方射来，像实质性的触手一样在她身上游走。\n\n${c.name}试图用手遮挡住胸部和私处，但魔王只是冷冷地命令道：「把手放下。你的身体是我的财产，要让所有人都看到。」她颤抖着放下了双手，将最羞耻的部位完全暴露在众目睽睽之下。\n\n每一步都像是走在刀尖上，冰冷的石地板刺激着脚底，而更让她难以忍受的是那种被观看的感觉——魔物们趴在栏杆上，发出低声的嘶吼和淫邪的笑声。有一只哥布林甚至伸手想要触碰她的大腿，被魔王一脚踢开。\n\n「看清楚，」魔王对周围的魔物们说，「这就是反抗我的下场。你们谁想试试，也可以来摸一摸。」${c.name}的脸涨得通红，羞耻心几乎要将她撕裂，但她只能继续向前走，任由那些目光将她剥夺得一干二净。${flavorUf2 ? '\n\n' + flavorUf2 : ''}\n\n服从度 +1，反抗刻印 -1` + (ablUp ? `，露出癖 +1` : ``) + `。`,
            effects: [{ target: c.name, mark0: `+1`, mark3: `-1` }]
        };
    }

    _evtUnfallenBondage(g) {
        const c = this._getRandomSlave(g);
        if (!c) return null;
        c.addMark(0, 1);
        c.addMark(3, -1);
        this._gainPalam(c, 5, 100);
        this._gainPalam(c, 7, 40);
        return {
            title: `【调教】${c.name}的捆绑监禁`,
            text: `魔王将${c.name}带到了一间专门的刑讯室。房间中央的天花板上垂下几根粗壮的锁链，墙壁上的挂钩上还残留着前任使用者干涸的血迹。空气中弥漫着皮革、汗水和某种暧昧的气息。\n\n${c.name}被命令脱光衣服，然后魔王取出了魔法加固的绳索，开始一圈一圈地缠绕她的身体。绳索首先捆住了她的手腕，在背后交叉，然后绕过胸部，在乳房的上下方各勒紧了一圈，让那柔软的肉团被迫凸出，变得更加敏感。\n\n接着魔王将她的双腿分开，用绳索固定在墙壁两侧的挂钩上，形成一个羞耻的大字型。${c.name}试图挣扎，但绳索上附着的魔法让她的力气迅速流失，只能无力地悬挂在半空中。\n\n魔王退后几步，欣赏着自己的作品。${c.name}被吊在刑讯室中度过了整整一夜，血液循环受阻的四肢带来了麻酥酥的刺痛感，而无法合拢的双腿让私处在冷空气中完全暴露，每一次轻微的晃动都会让绳索摩擦到最敏感的部位。\n\n当第二天被放下来时，${c.name}已经浑身是汗，眼神空洞，私处湿润得不成样子。\n\n服从度 +1，反抗刻印 -1，屈服大幅上升。`,
            effects: [{ target: c.name, mark0: `+1`, mark3: `-1` }]
        };
    }

    _evtUnfallenChastity(g) {
        const c = this._getRandomSlave(g);
        if (!c) return null;
        c.addMark(0, 1);
        c.addMark(3, -1);
        this._gainPalam(c, 6, 80);
        return {
            title: `【调教】${c.name}的贞操带惩戒`,
            text: `魔王取出了一个精致的金属装置——那是由魔法金属打造的贞操带，表面刻满了封印符文，在烛光下闪烁着冷冽的银光。${c.name}看到那个东西，脸色瞬间变得惨白。\n\n「不……不要……」她下意识地后退，但被魔王一把抓住手腕，拖到了床边。魔王命令她仰面躺下，双腿分开。${c.name}紧闭着双腿，做着最后的抵抗，但魔王只是冷冷地打了她一个耳光，她立刻安静下来，泪水在眼眶中打转。\n\n魔王将贞操带的底座贴合在她的下体上，金属的冰冷让她倒吸一口凉气。前端的盖板精准地覆盖住了她的阴蒂和阴道口，后端的细链则穿过了臀沟，固定在腰间的扣环上。魔王取出一把小巧的魔法钥匙，将锁扣「咔哒」一声锁死，然后把钥匙贴身收进了怀中。\n\n「从今天起，没有我的允许，你不能触碰那里。」魔王的声音像是从地狱深处传来。\n\n穿上衣物后，贞操带的金属部分紧紧压迫着${c.name}的阴蒂，每一次走路都带来微妙的摩擦，让她坐立难安。更可怕的是，魔王偶尔会远程激活贞操带内置的微型振动器，让她在众人面前突然颤抖、呻吟，却无从解释。\n\n服从度 +1，反抗刻印 -1，情欲上升。`,
            effects: [{ target: c.name, mark0: `+1`, mark3: `-1` }]
        };
    }

    _evtUnfallenNightTrain(g) {
        const c = this._getRandomSlave(g);
        if (!c) return null;
        if (!this._checkFirstTimeProtection(c, 'vaginal')) return this._evtUnfallenSensory(g);
        const oldMark = c.mark[0] || 0;
        c.addMark(0, 1);
        c.addMark(3, -2);
        if (c.mark[3] < 0) c.mark[3] = 0;
        this._gainPalam(c, 5, 120);
        this._gainPalam(c, 6, 100);
        const ablUp = RAND(3) === 0;
        if (ablUp) c.addAbl(14);
        return {
            title: `【调教】${c.name}的夜间调教`,
            text: `深夜，整个地下城都陷入了沉睡，只有魔王的寝室还亮着微弱的烛光。魔王悄无声息地来到了${c.name}的牢房前，用魔力解开了门锁。\n\n${c.name}正在睡梦中，蜷缩在破旧的草席上，身上只盖着一张薄薄的毯子。魔王走到她身边，俯身看着她安详的睡脸，然后伸手掀开了毯子。\n\n冰凉的空气让${c.name}皱了皱眉，但还没有醒来。魔王的手抚上了她的胸部，隔着单薄的内衣揉捏着那柔软的肉团。${c.name}在睡梦中发出了轻微的呻吟，身体不自觉地扭动着。魔王冷笑一声，扯开了她的内衣，将乳头含入口中，用舌头来回拨弄。\n\n「嗯……不要……」${c.name}在半梦半醒间含糊地呢喃着，却分不清这是噩梦还是现实。魔王趁机分开她的双腿，将手指探入她湿润的私处，感受着那紧致的内壁。\n\n「你的身体已经很诚实了，还在嘴硬什么？」魔王在她耳边低语，声音如同魔咒般钻入她的意识。${c.name}的眼角滑落泪水，但身体却不争气地迎合着魔王的手指，腰肢不自觉地向上挺起。\n\n当一切结束时，${c.name}瘫软在草席上，床单上留下了一片湿漉漉的痕迹。魔王整理好自己的衣物，转身离去，只留下她一个人在黑暗中大口喘息。\n\n服从度 ${oldMark}→${c.mark[0]}，反抗刻印 -2` + (ablUp ? `，性交技术 +1` : ``) + `。`,
            effects: [{ target: c.name, mark0: c.mark[0], mark3: -2 }]
        };
    }

    _evtUnfallenDrug(g) {
        const c = this._getRandomSlave(g);
        if (!c) return null;
        c.addMark(0, 1);
        c.addMark(3, -1);
        this._gainPalam(c, 6, 150);
        this._gainPalam(c, 0, 80);
        this._gainPalam(c, 2, 60);
        return {
            title: `【调教】${c.name}的药剂实验`,
            text: `魔王将${c.name}带到了魔法研究所的地下室。房间中央的实验台上摆满了各种颜色的药剂瓶，空气中弥漫着甜腻而诡异的气味。\n\n「这是最新研发的媚药，」魔王拿起一瓶粉色的液体，在${c.name}面前晃了晃，「我想知道它对你这样的顽固分子会有什么样的效果。」\n\n${c.name}拼命摇头，但魔王强行捏住她的下巴，将整瓶药剂灌入了她的口中。那液体带着一股奇怪的甜味，入口即化，顺着喉咙流入了胃里。\n\n不到一刻钟，${c.name}的身体开始发生变化。她的脸颊泛起不自然的潮红，呼吸变得急促而紊乱，瞳孔也逐渐放大。她感到全身如火般燃烧，每一寸肌肤都变得异常敏感——衣服的摩擦、空气的流动，甚至自己的心跳，都变成了强烈的刺激。\n\n「好热……好难受……」${c.name}撕扯着自己的衣服，试图缓解那股燥热，但越是触碰，那种空虚感就越强烈。她开始在实验台上扭动，双腿不自觉地摩擦着，发出甜美的呻吟。\n\n魔王站在一旁，冷静地观察着她的反应，记录着每一个数据。当${c.name}达到高潮时，她的身体剧烈颤抖，大量透明的液体从私处喷涌而出，打湿了实验台。\n\n服从度 +1，反抗刻印 -1，情欲与快感大幅上升。`,
            effects: [{ target: c.name, mark0: `+1`, mark3: `-1` }]
        };
    }

    _evtUnfallenShow(g) {
        const c = this._getRandomSlave(g);
        if (!c) return null;
        c.addMark(0, 1);
        c.addMark(3, -1);
        this._gainPalam(c, 5, 70);
        this._gainPalam(c, 6, 50);
        const ablUp = RAND(4) === 0;
        if (ablUp) c.addAbl(12);
        return {
            title: `【调教】${c.name}的羞耻展示`,
            text: `魔王将所有奴隶召集到了大厅中央，然后命令${c.name}站在台上。大厅里鸦雀无声，所有人都注视着她，等待着接下来将要发生的事。\n\n「脱光，然后自慰。」魔王的声音不大，却清晰地传入了每个人的耳中。${c.name}的脸色瞬间变得惨白，她摇着头向后退去，但被两名魔物守卫架住了手臂，动弹不得。\n\n在无数道目光的注视下，${c.name}颤抖着脱去了衣物。她的身体在众人的注视下微微发抖，双手试图遮挡住私处和胸部，但在魔王的目光逼迫下，她不得不放下了双手。\n\n「开始。」魔王命令道。${c.name}咬着下唇，缓缓将手伸向自己的私处。在众目睽睽之下，她的手指触碰到了那个羞耻的部位，身体像触电般颤抖了一下。她开始缓慢地摩擦，起初只是机械地运动，但在周围人的注视和私语中，一种奇异的羞耻感开始转化为某种诡异的快感。\n\n她的动作渐渐加快，呼吸也变得急促起来，乳房随着身体的晃动而摇曳。其他奴隶们有的别过头去，有的则忍不住偷看。当${c.name}最终达到高潮时，她的身体弓起，发出一声压抑的尖叫，大量液体从私处涌出，顺着大腿内侧流下。\n\n服从度 +1，反抗刻印 -1` + (ablUp ? `，技巧 +1` : ``) + `。`,
            effects: [{ target: c.name, mark0: `+1`, mark3: `-1` }]
        };
    }

    _evtUnfallenWhip(g) {
        const c = this._getRandomSlave(g);
        if (!c) return null;
        c.addMark(0, 1);
        c.addMark(3, -1);
        c.hp = Math.max(1, c.hp - 15);
        this._gainPalam(c, 5, 60);
        this._gainPalam(c, 7, 30);
        return {
            title: `【调教】${c.name}的鞭打惩戒`,
            text: `魔王将${c.name}绑在了刑讯室的木架上，双手高举过头顶，双脚分开固定在两侧的镣铐中。她的背部、臀部和大腿完全暴露在空气中，没有任何遮挡。魔王从墙上取下了一根黑色的皮鞭，鞭身上镶嵌着细小的魔法水晶，每一次抽打都会释放出微弱的电流。\n\n「知道错了吗？」魔王站在她身后，声音冰冷。${c.name}咬紧牙关，倔强地不肯回答。魔王冷笑一声，挥动了手臂。\n\n「啪！」第一鞭落在她的臀部上，留下了一道鲜红的鞭痕。${c.name}的身体猛地绷紧，发出一声闷哼。还没等她缓过气来，第二鞭、第三鞭接踵而至，分别落在了她的背部和大腿内侧。每一鞭都精准地避开了要害，却带来了最大限度的痛苦。\n\n「啪！啪！啪！」鞭打声在刑讯室中回荡，${c.name}的背部和臀部上已经布满了纵横交错的鞭痕，有些地方甚至渗出了血丝。她的身体不受控制地颤抖着，眼泪大颗大颗地滚落。\n\n但奇怪的是，在痛苦之中，一种诡异的酥麻感开始从下腹部升起。当魔王停止鞭打，用手掌抚摸那些红肿的伤痕时，${c.name}竟然发出了轻微的呻吟——那声音中混合着痛苦和某种难以启齿的快感。\n\n服从度 +1，反抗刻印 -1，HP -15。`,
            effects: [{ target: c.name, mark0: `+1`, mark3: `-1`, hp: -15 }]
        };
    }

    _evtUnfallenBrainwash(g) {
        const c = this._getRandomSlave(g);
        if (!c) return null;
        const oldMark = c.mark[0] || 0;
        c.addMark(0, 1);
        c.addMark(3, -2);
        if (c.mark[3] < 0) c.mark[3] = 0;
        c.addExp(81, 2); // 洗脑经验+2
        this._gainPalam(c, 5, 150);
        return {
            title: `【调教】${c.name}的催眠洗脑`,
            text: `魔王将${c.name}带到了一间特殊的房间。这里没有刑具，没有枷锁，只有一张舒适的躺椅和四周墙壁上镶嵌的魔晶屏幕。${c.name}被命令躺在躺椅上，头枕在柔软的垫子上。\n\n「看着这些画面。」魔王按下一个机关，四周的屏幕同时亮起，开始播放淫靡的影像——那是其他奴隶被调教时的场景，有呻吟、有高潮、有屈服后的幸福表情。同时，魔王的低语从四面八方传来，像是从她的大脑深处直接响起。\n\n「你是魔王的奴隶……你的身心都属于魔王……服从是唯一的快乐……反抗只会带来痛苦……」这些话语配合着画面中的淫靡场景，一遍又一遍地重复着。${c.name}起初还在心中默念着反抗的誓言，但随着时间的推移，那些誓言开始变得模糊。\n\n屏幕上突然出现了一个画面——那是她自己，但画面中的她满脸潮红，眼神迷离，正主动侍奉着魔王，脸上带着幸福的笑容。「这就是你，」魔王的声音在耳边响起，「这是你内心最真实的渴望。」\n\n${c.name}摇着头想要否认，但画面中的自己看起来是那么快乐，那么满足。一种奇妙的空虚感开始在她体内蔓延，她突然觉得，也许……服从并不是那么可怕的事？\n\n当洗脑结束时，${c.name}的眼神变得有些空洞，但当她看向魔王时，眼中多了一丝连她自己都没有意识到的顺从。\n\n服从度 ${oldMark}→${c.mark[0]}，反抗刻印 -2，洗脑经验+2，屈服大幅上升。`,
            effects: [{ target: c.name, mark0: c.mark[0], mark3: -2, brainwashExp: 2 }]
        };
    }

    _evtUnfallenInspection(g) {
        const c = this._getRandomSlave(g);
        if (!c) return null;
        c.addMark(0, 1);
        c.addMark(3, -1);
        this._gainPalam(c, 5, 50);
        this._gainPalam(c, 6, 40);
        return {
            title: `【调教】${c.name}的身体检查`,
            text: `魔王将${c.name}带到了一间布置得像诊所的房间。房间中央是一张铺着白色床单的检查台，旁边放着各种奇怪的仪器。${c.name}被命令脱去所有衣物，躺在了检查台上。\n\n「双腿分开。」魔王戴上了一副皮质手套，走到检查台前。${c.name}羞耻地将双腿分开，用手臂遮住眼睛，不敢看接下来会发生什么。魔王首先检查了 breasts，用手掌测量着大小和柔软度，然后用拇指和食指捏住乳头，轻轻拉扯。\n\n${c.name}的身体颤抖了一下，乳头在刺激下变得硬挺。魔王满意地点了点头，在记录板上写下了一行字。接着，他的手滑向了她的腹部，然后来到了大腿内侧。\n\n「这里已经这么湿了……」魔王的手指触碰到了她湿润的私处，沾上了透明的液体，「还在嘴硬吗？」${c.name}的脸涨得通红，拼命摇头否认，但身体的反应却无法欺骗任何人。\n\n魔王用手指分开了她的阴唇，仔细观察着内部的结构，不时用仪器测量温度和收缩力度。整个过程中，${c.name}都咬着下唇忍耐着，但那种被彻底检查的感觉让她的羞耻心达到了顶点。\n\n服从度 +1，反抗刻印 -1。`,
            effects: [{ target: c.name, mark0: `+1`, mark3: `-1` }]
        };
    }

    _evtUnfallenSensory(g) {
        const c = this._getRandomSlave(g);
        if (!c) return null;
        c.addMark(0, 1);
        c.addMark(3, -1);
        this._gainPalam(c, 5, 90);
        this._gainPalam(c, 7, 40);
        return {
            title: `【调教】${c.name}的感官剥夺`,
            text: `魔王将${c.name}带到了一个特殊的房间。房间里没有窗户，没有光源，没有任何声音。魔王首先用黑色的丝绸眼罩遮住了${c.name}的双眼，然后用特制的耳塞堵住了她的耳朵，最后用柔软的布条封住了她的嘴。\n\n在一片漆黑和寂静中，${c.name}失去了视觉、听觉和言语能力。她只能感受到自己的心跳和呼吸，以及皮肤上偶尔传来的空气流动。魔王将她固定在一张椅子上，四肢都被柔软的拘束带绑住，无法动弹。\n\n时间在这种环境中变得无比漫长。${c.name}不知道自己已经被关了多久——是一个小时？还是整整一天？她开始产生幻觉，觉得有无数只手在自己身上游走，觉得有冰冷的手指在触碰她的私处。但每当她试图确认时，那些感觉又消失得无影无踪。\n\n这种未知和无法预知下一步的恐惧比任何肉体的痛苦都更加折磨人。她的其他感官在这种极端环境下变得异常敏锐——空气中细微的温度变化、皮肤上最轻微的触碰，都被无限放大。\n\n当魔王终于摘下她的眼罩时，${c.name}已经被这种极端的孤独和恐惧折磨得近乎崩溃。她大口喘息着，泪水模糊了视线，当看到魔王的脸时，她竟然产生了一种诡异的安心感。\n\n服从度 +1，反抗刻印 -1，屈服大幅上升。`,
            effects: [{ target: c.name, mark0: `+1`, mark3: `-1` }]
        };
    }

    _evtUnfallenShamePose(g) {
        const c = this._getRandomSlave(g);
        if (!c) return null;
        c.addMark(0, 1);
        c.addMark(3, -1);
        this._gainPalam(c, 5, 70);
        this._gainPalam(c, 6, 60);
        return {
            title: `【调教】${c.name}的羞耻姿势`,
            text: `魔王将${c.name}带到了一间布置精美的房间。房间中央摆着一面巨大的落地镜，周围是各种奇怪的道具和装置。魔王命令${c.name}脱光衣服，站在镜子前。\n\n「看着我。」魔王站在她身后，双手搭在她的肩膀上，「我要你摆出最羞耻的姿势，然后自己看着镜子里的样子。」${c.name}颤抖着，在魔王的指导下，将双手背在身后，双膝跪地，臀部高高抬起。\n\n镜子里的自己让她感到无比羞耻——那个 naked 的女孩跪在地上，私处完全暴露，乳房下垂，脸上带着屈辱的表情。魔王从一旁拿起一台魔法照相机，开始记录每一个角度。\n\n「把腿再张开一点……对，就是这样。」魔王一边指挥，一边按下快门。闪光灯一次次亮起，将${c.name}最羞耻的姿态永远定格在了影像中。\n\n接着，魔王又让她趴在桌上，臀部朝向镜子；让她站在墙角，双手抱头，双腿大大分开；让她躺在地上，双腿举起用手抱住……每一个姿势都比前一个更加羞耻，更加暴露。\n\n当拍摄结束时，${c.name}已经瘫软在地上，不敢再看镜子里的自己。魔王收起照相机，满意地离开了房间，留下了满地的羞耻记忆。\n\n服从度 +1，反抗刻印 -1。`,
            effects: [{ target: c.name, mark0: `+1`, mark3: `-1` }]
        };
    }

    _evtUnfallenPublic(g) {
        const c = this._getRandomSlave(g);
        if (!c) return null;
        c.addMark(0, 1);
        c.addMark(3, -2);
        if (c.mark[3] < 0) c.mark[3] = 0;
        this._gainPalam(c, 5, 100);
        this._gainPalam(c, 6, 80);
        return {
            title: `【调教】${c.name}的公开羞辱`,
            text: `魔王在地下城的中央大厅举行了一场「展示会」。大厅里聚集了数百只魔物，从低级的哥布林到高级的恶魔，所有的目光都聚焦在台中央的${c.name}身上。她被命令脱光衣物，然后固定在一个可以旋转的展示台上，每一寸肌肤都被无数双眼睛贪婪地审视。\n\n「这就是反抗我的下场。」魔王的声音在大厅中回荡，「但魔王是仁慈的，只要她愿意屈服，就可以免受更多的痛苦。」说完，魔王开始在大庭广众之下对${c.name}进行「示范调教」。\n\n魔王的手指在她的身体上游走，从颈部滑向胸部，在乳头上停留片刻，然后继续向下，经过腹部，最终来到私处。每到一个部位，魔王都会向台下的魔物们讲解：「这里是她的敏感点，轻轻触碰就会颤抖」「这里的反应最强烈」「如果她撒谎，这里的颜色会变化」……\n\n${c.name}在无数道目光的注视下被彻底剥夺得一干二净——不仅是衣物，还有尊严、羞耻心和最后的一点抵抗意志。当魔王的手指最终探入她湿润的私处时，她发出了呻吟，那声音在大厅中回荡，被所有的魔物听在耳中。\n\n展示会结束后，${c.name}被拖回牢房，她的眼神空洞，但身体却残留着奇异的余韵。\n\n服从度 +1，反抗刻印 -2，屈服大幅上升。`,
            effects: [{ target: c.name, mark0: `+1`, mark3: -2 }]
        };
    }

    _evtUnfallenBathe(g) {
        const c = this._getRandomSlave(g);
        if (!c) return null;
        c.addMark(0, 1);
        c.addMark(3, -1);
        c.hp = Math.min(c.maxHp, c.hp + 20);
        this._gainPalam(c, 5, 40);
        return {
            title: `【调教】${c.name}的浴室侍奉`,
            text: `魔王将${c.name}带到了地下城最奢华的浴室。这里有一个巨大的圆形浴池，池水是用魔法加热的温泉，水面上漂浮着花瓣，空气中弥漫着薰衣草的香气。墙壁上镶嵌着发光的魔晶，将整个房间映照成温暖的橙黄色。\n\n「服侍我沐浴。」魔王命令道。${c.name}被命令脱光衣服，然后跟着魔王一起进入了浴池。温热的水流包裹着她的身体，让她紧张的情绪稍微放松了一些。但当她看到魔王 naked 的身体时，那种放松立刻变成了羞耻。\n\n魔王靠在池边，闭上眼睛。${c.name}颤抖着拿起一块海绵，沾上香皂，开始为魔王擦洗身体。她的双手在魔王宽阔的背部游走，感受着那结实而温热的肌肉。水汽让视线变得模糊，但肌肤的触感却格外清晰。\n\n「前面也要。」魔王命令道。${c.name}绕到魔王身前，海绵滑过胸膛、腹部，最后来到了下身。她的脸涨得通红，但还是用颤抖的双手完成了清洗。当她的手触碰到魔王的性器时，她能感受到那个部位在她的触摸下逐渐变得坚硬。\n\n魔王突然抓住她的手腕，将她拉入怀中。两人的身体在水中紧密相贴，滑腻的肥皂泡沫让皮肤不断摩擦。魔王的手在她的身体上游走，从背部滑向臀部，然后探入了她双腿之间……\n\n当沐浴结束时，${c.name}已经浑身无力，被魔王抱出了浴池。\n\n服从度 +1，反抗刻印 -1，HP +20。`,
            effects: [{ target: c.name, mark0: `+1`, mark3: `-1`, hp: 20 }]
        };
    }

    _evtFallenService(g) {
        const c = this._getRandomSlave(g);
        if (!c || !this._isFallen(c)) return this._evtUnfallenService(g);
        if (!this._checkFirstTimeProtection(c, 'kiss')) return this._evtFallenMasturbate(g);
        c.addAbl(13);
        c.addAbl(10);
        this._gainPalam(c, 6, 100);
        this._gainPalam(c, 5, 60);
        const flavorF1 = this._getTalentFlavor(c);
        return {
            title: `【沉沦】${c.name}的自愿侍奉`,
            text: `魔王正坐在王座上批阅文件，${c.name}悄无声息地走了进来，在魔王面前跪下。她的眼中已经没有了初次侍奉时的屈辱和恐惧，取而代之的是一种近乎痴迷的顺从。\n\n「请让奴隶来服侍您……」${c.name}主动请缨，声音中带着一丝期待被宠幸的颤抖。魔王放下手中的文件，饶有兴致地看着她。${c.name}熟练地解开魔王的衣带，将那已经半硬的性器释放出来，然后迫不及待地含入口中。\n\n她的技巧已经炉火纯青——舌头灵巧地缠绕着柱身，时而用舌尖挑逗着龟头下方的敏感带，时而将整根深入喉底，发出满足的呜咽声。她的唾液分泌得格外旺盛，白色的泡沫沿着嘴角流下，滴落在她赤裸的胸部上。\n\n魔王的手按在她的后脑勺上，她不仅没有抗拒，反而更加卖力地侍奉着，仿佛这是世界上最重要的事情。当魔王终于在她口中释放时，${c.name}贪婪地吞咽着每一滴精液，然后用舌头仔细清理干净，确保没有遗漏。\n\n「奴隶侍奉得……还让您满意吗？」她仰起头，眼中闪烁着期待夸奖的光芒，嘴角还残留着白色的痕迹。${flavorF1 ? '\n\n' + flavorF1 : ''}\n\n侍奉技术 +1，顺从 +1，情欲上升。`,
            effects: [{ target: c.name, abl13: `+1`, abl10: `+1` }]
        };
    }

    _evtFallenMasturbate(g) {
        const c = this._getRandomSlave(g);
        if (!c || !this._isFallen(c)) return this._evtUnfallenShow(g);
        c.addAbl(11);
        c.addAbl(31);
        this._gainPalam(c, 6, 120);
        this._gainPalam(c, 0, 60);
        this._gainPalam(c, 2, 50);
        const flavorF2 = this._getTalentFlavor(c);
        return {
            title: `【沉沦】${c.name}的自慰展示`,
            text: `${c.name}独自躺在自己的牢房中，双腿大大分开，一只手在乳房上揉捏，另一只手则在私处激烈地进出自慰。她的牢房门并没有上锁——这是魔王给予「已陷落奴隶」的特殊待遇。\n\n就在她即将达到高潮的瞬间，魔王推门走了进来。${c.name}愣了一下，但出乎魔王意料的是，她并没有停下来，反而更加激烈地展示给魔王看。她的手指在自己体内进出的速度越来越快，发出淫靡的水声，眼神迷离地看着魔王，仿佛在说「请看着我」。\n\n「啊……魔王大人……看着奴隶……」${c.name}一边自慰一边用甜美的声音呼唤着魔王，已经完全不在乎羞耻了。她的身体剧烈颤抖，最终在一阵痉挛中达到了高潮，大量透明的液体从私处喷涌而出，打湿了身下的床单。\n\n高潮过后，她并没有停下来，而是继续用手指在敏感的部位画着圈，眼神中满是欲求不满的渴望。${flavorF2 ? '\n\n' + flavorF2 : ''}\n\n欲望 +1，自慰成瘾 +1，情欲大幅上升。`,
            effects: [{ target: c.name, abl11: `+1`, abl31: `+1` }]
        };
    }

    _evtFallenYuri(g) {
        const pair = this._getTwoSlaves(g);
        if (!pair) return this._evtFallenMasturbate(g);
        const [a, b] = pair;
        if (!this._isFallen(a) && !this._isFallen(b)) return this._evtSlaveBond(g);
        if (this._isFallen(a)) { a.addAbl(22); a.addAbl(12); this._gainPalam(a, 6, 100); }
        if (this._isFallen(b)) { b.addAbl(22); b.addAbl(12); this._gainPalam(b, 6, 100); }
        return {
            title: `【沉沦】${a.name}与${b.name}的百合互动`,
            text: `深夜，魔王路过牢房区时，听到了一阵淫靡的水声和压抑的呻吟。他停下脚步，透过铁栏向里面看去——${a.name}和${b.name}正交缠在一起，互相用舌头和手指取悦对方。\n\n${a.name}将${b.name}压在身下，一只手揉捏着对方的乳头，另一只手则在对方湿润的私处中抽插。她的舌头在${b.name}的脖子上留下一个个红色的吻痕，然后滑向胸部，含住那挺立的乳头轻轻吸吮。${b.name}仰着头，大口喘息着，双腿紧紧夹住${a.name}的腰肢。\n\n「啊……那里……再用力一点……」${b.name}发出了甜美的哀求。${a.name}顺从地加快了手指的速度，同时用拇指按压着对方肿胀的阴蒂。两人在黑暗中交缠，汗水和体液混合在一起，发出淫靡的气息。\n\n魔王并没有打扰她们，只是静静地观赏着这场由他的调教催生的百合盛宴。\n\n已陷落者的百合气质 +1，技巧 +1。`,
            effects: [{ target: a.name + `/` + b.name, abl22: `+1`, abl12: `+1` }]
        };
    }

    _evtFallenCrave(g) {
        const c = this._getRandomSlave(g);
        if (!c || !this._isFallen(c)) return this._evtUnfallenNightTrain(g);
        if (!this._checkFirstTimeProtection(c, 'vaginal')) return this._evtFallenBeg(g);
        c.addAbl(11);
        c.addAbl(14);
        this._gainPalam(c, 6, 150);
        this._gainPalam(c, 2, 80);
        const flavorF3 = this._getTalentFlavor(c);
        return {
            title: `【沉沦】${c.name}的渴求`,
            text: `深夜，魔王的寝室门被轻轻推开了。${c.name}赤身裸体地站在门口，脸颊泛着潮红，眼神中燃烧着赤裸的欲望。她缓缓爬上魔王的床，跨坐在魔王身上，扭动着腰肢渴求着。\n\n「请……请使用奴隶的身体……」${c.name}抱着魔王的大腿哀求着，私处已经湿润得不成样子，透明的爱液顺着大腿内侧流下。魔王伸手捏住她的乳头，轻轻扭转。${c.name}仰起头发出高亢的呻吟，主动抬起臀部，将湿润的私处对准了魔王的性器，然后缓缓坐了下去。\n\n「啊……进来了……好满……」${c.name}的瞳孔放大，露出陶醉的表情。她开始主动扭动腰肢，时而快速上下起落，时而缓慢画着圆圈，用自己的身体取悦着魔王。\n\n「奴隶的身体……是魔王大人的东西……请尽情使用……」她一边运动一边喃喃自语，完全沉浸在交合的快感中。${flavorF3 ? '\n\n' + flavorF3 : ''}\n\n欲望 +1，性交技术 +1，情欲大幅上升。`,
            effects: [{ target: c.name, abl11: `+1`, abl14: `+1` }]
        };
    }

    _evtFallenLingerie(g) {
        const c = this._getRandomSlave(g);
        if (!c || !this._isFallen(c)) return this._evtUnfallenWalk(g);
        c.addAbl(17);
        c.addAbl(11);
        this._gainPalam(c, 6, 80);
        return {
            title: `【沉沦】${c.name}的情趣装扮`,
            text: `${c.name}主动穿上了魔王准备的淫靡情趣服。那是一套半透明的黑色蕾丝内衣，布料少得可怜，几乎遮不住任何东西，反而更加凸显了身体的曲线。她还戴上了一对猫耳发箍，身后插着一根毛茸茸的尾巴插件。\n\n这件衣服很适合奴隶吗？${c.name}红着脸展示着，在魔王面前转了一圈。她的乳房几乎完全暴露，只有两小块蕾丝勉强遮住乳头；内裤是开档设计，私处若隐若现；后面的尾巴随着走动左右摇晃，不时摩擦到敏感的部位，让她发出甜美的呻吟。\n\n眼中却充满了期待被夸奖的渴望。魔王走上前，伸手扯开了那单薄的蕾丝，将她压在了墙上。\n\n露出癖 +1，欲望 +1，情欲上升。`,
            effects: [{ target: c.name, abl17: `+1`, abl11: `+1` }]
        };
    }

    _evtFallenBeg(g) {
        const c = this._getRandomSlave(g);
        if (!c || !this._isFallen(c)) return this._evtUnfallenService(g);
        c.addAbl(10);
        c.addAbl(13);
        this._gainPalam(c, 6, 100);
        this._gainPalam(c, 5, 80);
        return {
            title: `【沉沦】${c.name}的主动求欢`,
            text: `${c.name}跪在魔王脚边，用脸颊蹭着魔王的小腿，像一只讨好主人的宠物。「求求您……请疼爱奴隶……」她的声音软糯而甜腻，带着一丝哭腔。\n\n「奴隶已经忍不了了……请让奴隶服侍您……」${c.name}不断亲吻着魔王的靴尖，眼神迷离。她主动张开双腿展示给魔王看，私处已经湿润得不成样子。\n\n「请进来……奴隶的身体是魔王大人的东西……」她一边说着淫靡的话语，一边用手指分开自己的阴唇，将最羞耻的部位完全展示出来。\n\n顺从 +1，侍奉技术 +1，情欲上升。`,
            effects: [{ target: c.name, abl10: `+1`, abl13: `+1` }]
        };
    }

    _evtFallenDream(g) {
        const c = this._getRandomSlave(g);
        if (!c || !this._isFallen(c)) return this._evtSlaveDream(g);
        if (!this._checkFirstTimeProtection(c, 'vaginal')) return this._evtFallenMasturbate(g);
        c.addAbl(11);
        this._gainPalam(c, 6, 80);
        c.mp = Math.min(c.maxMp, c.mp + 30);
        return {
            title: `【沉沦】${c.name}的淫梦`,
            text: `${c.name}在梦中不断被魔王侵犯。梦里，她被绑在一张巨大的床上，四肢张开无法动弹，而魔王则站在床边，用贪婪的目光审视着她的每一寸肌肤。\n\n魔王俯下身，将性器抵在她的唇边，命令她张开嘴。她顺从地含住，用尽技巧侍奉着。然后魔王又来到她的下体，将她彻底贯穿。在梦中，她不断地被侵犯、被占有，一波又一波的快感如潮水般涌来。\n\n醒来时，她发现床单已经湿了一片，脸上带着幸福的笑容。那种被完全占有的感觉让她无比满足。\n\n欲望 +1，气力 +30，情欲上升。`,
            effects: [{ target: c.name, abl11: `+1`, mp: 30 }]
        };
    }

    _evtFallenMutual(g) {
        const pair = this._getTwoSlaves(g);
        if (!pair) return this._evtFallenMasturbate(g);
        const [a, b] = pair;
        if (this._isFallen(a)) { a.addAbl(12); this._gainPalam(a, 6, 80); }
        if (this._isFallen(b)) { b.addAbl(12); this._gainPalam(b, 6, 80); }
        return {
            title: `【沉沦】奴隶间的互相抚慰`,
            text: `${a.name}和${b.name}在牢房中互相抚慰，用手指和舌头让对方达到高潮。两人的身体紧密贴合，发出淫靡的水声。\n\n${a.name}将手指插入${b.name}的体内，同时用嘴含住对方的乳头，两人都沉浸在快乐中。汗水和体液混合在一起，空气中弥漫着暧昧的气息。\n\n已陷落者技巧 +1，情欲上升。`,
            effects: [{ target: a.name + `/` + b.name, abl12: `+1` }]
        };
    }

    _evtFallenExpose(g) {
        const c = this._getRandomSlave(g);
        if (!c || !this._isFallen(c)) return this._evtUnfallenWalk(g);
        c.addAbl(17);
        c.addAbl(36);
        this._gainPalam(c, 6, 100);
        return {
            title: `【沉沦】${c.name}的露出快感`,
            text: `${c.name}主动要求在魔物面前露出身体。「请让大家看看奴隶属于魔王大人的身体……」她站在大厅中央， naked 的身体完全暴露在无数道目光之下。\n\n被众多目光注视的${c.name}不仅没有羞耻，反而因兴奋而颤抖，私处不断分泌着爱液。她甚至主动摆出了更加羞耻的姿势，让魔物们能够看得更清楚。\n\n露出癖 +1，露出成瘾 +1，情欲上升。`,
            effects: [{ target: c.name, abl17: `+1`, abl36: `+1` }]
        };
    }

    _evtFallenCompete(g) {
        const pair = this._getTwoSlaves(g);
        if (!pair) return this._evtFallenService(g);
        const [a, b] = pair;
        if (this._isFallen(a)) { a.addAbl(13); this._gainPalam(a, 6, 60); }
        if (this._isFallen(b)) { b.addAbl(13); this._gainPalam(b, 6, 60); }
        return {
            title: `【沉沦】奴隶间的侍奉竞争`,
            text: `${a.name}和${b.name}争相侍奉魔王，两人互不相让，用更激烈的技巧争宠。「奴隶会更努力地服侍魔王大人！」她们的舌头和手指的动作越发激烈，试图证明自己才是更值得宠爱的那一个。\n\n已陷落者侍奉技术 +1，情欲上升。`,
            effects: [{ target: a.name + `/` + b.name, abl13: `+1` }]
        };
    }

    _evtFallenSensitive(g) {
        const c = this._getRandomSlave(g);
        if (!c || !this._isFallen(c)) return this._evtUnfallenDrug(g);
        const sens = RAND(5);
        const sensNames = [`阴蒂`, `胸部`, `阴道`, `肛门`, `口腔`];
        c.addAbl(sens);
        c.addAbl(11);
        this._gainPalam(c, sens, 100);
        this._gainPalam(c, 6, 80);
        return {
            title: `【沉沦】${c.name}的${sensNames[sens]}敏感化`,
            text: `魔王对${c.name}的${sensNames[sens]}进行了特殊开发，敏感带被彻底觉醒，轻微的触碰都能带来强烈快感。\n\n「已经……碰一下就要去了……」${c.name}颤抖着说道。经过持续的刺激，她的${sensNames[sens]}在魔王的精心调教下，已经成为了最强的快感源泉。\n\n${sensNames[sens]}感觉 +1，欲望 +1，情欲上升。`,
            effects: [{ target: c.name, [`abl${sens}`]: `+1`, abl11: `+1` }]
        };
    }

    _evtFallenMemory(g) {
        const c = this._getRandomSlave(g);
        if (!c || !this._isFallen(c)) return this._evtSlaveDream(g);
        c.addAbl(11);
        c.addAbl(30);
        this._gainPalam(c, 6, 100);
        return {
            title: `【沉沦】${c.name}的快感记忆`,
            text: `${c.name}在独处时不断回想着被魔王侵犯的记忆，那些画面让她不由自主地开始自慰。「魔王大人的味道……」她贪婪地嗅着带有魔王气味的物品，脑海中全是淫靡的画面。\n\n她的身体已经记住了魔王的形状，即使没有触碰，私处也会不自觉地收缩，渴求着被填充。\n\n欲望 +1，性交成瘾 +1，情欲上升。`,
            effects: [{ target: c.name, abl11: `+1`, abl30: `+1` }]
        };
    }

    _evtFallenDirtyTalk(g) {
        const c = this._getRandomSlave(g);
        if (!c || !this._isFallen(c)) return this._evtUnfallenBrainwash(g);
        c.addAbl(15);
        c.addAbl(11);
        this._gainPalam(c, 6, 80);
        return {
            title: `【沉沦】${c.name}的淫语练习`,
            text: `${c.name}红着脸说出了淫靡的话语。魔王命令她一边自慰一边描述自己的感受。${c.name}已经能够流利地说出各种淫语，请求魔王把她变成只懂得侍奉的便器。\n\n话术 +1，欲望 +1，情欲上升。`,
            effects: [{ target: c.name, abl15: `+1`, abl11: `+1` }]
        };
    }

    _evtFallenMilking(g) {
        const c = this._getRandomSlave(g);
        if (!c || !this._isFallen(c)) return this._evtFallenMasturbate(g);
        c.addAbl(1);
        c.addAbl(11);
        this._gainPalam(c, 1, 100);
        this._gainPalam(c, 6, 60);
        return {
            title: `【沉沦】${c.name}的搾乳调教`,
            text: `魔王为${c.name}安装了自动搾乳装置。持续的吸吮让她的乳房不断分泌乳汁。${c.name}在搾乳过程中不断呻吟，胸部被刺激得异常敏感，乳汁喷涌而出。\n\n啊，胸部要坏了。${c.name}在搾乳器的刺激下颤抖着，乳汁和汗水混在一起。\n\n胸部感觉 +1，欲望 +1，情欲上升。`,
            effects: [{ target: c.name, abl1: `+1`, abl11: `+1` }]
        };
    }

    _evtFallenBreedWish(g) {
        const c = this._getRandomSlave(g);
        if (!c || !this._isFallen(c)) return this._evtFallenCrave(g);
        if (!this._checkFirstTimeProtection(c, 'vaginal')) return this._evtFallenBeg(g);
        c.addAbl(11);
        c.addAbl(14);
        this._gainPalam(c, 6, 120);
        this._gainPalam(c, 2, 100);
        return {
            title: `【沉沦】${c.name}的受孕愿望`,
            text: `${c.name}抱着魔王哀求，请让奴隶怀上魔王大人的孩子。她主动抬起臀部，露出湿润的私处，渴求着受孕。\n\n${c.name}不断幻想着怀上魔王子嗣的场景，这种念头让她更加疯狂地渴求着魔王的精液。\n\n欲望 +1，性交技术 +1，情欲大幅上升。`,
            effects: [{ target: c.name, abl11: `+1`, abl14: `+1` }]
        };
    }

    _evtFallenPetPlay(g) {
        const c = this._getRandomSlave(g);
        if (!c || !this._isFallen(c)) return this._evtUnfallenBondage(g);
        c.addAbl(10);
        c.addAbl(21);
        this._gainPalam(c, 5, 80);
        this._gainPalam(c, 6, 80);
        return {
            title: `【沉沦】${c.name}的宠物扮演`,
            text: `${c.name}戴着项圈和猫耳，像宠物一样爬行在魔王脚边。她四肢着地，臀部摇摇晃晃，完全进入了宠物状态。\n\n魔王牵着${c.name}的项圈在城堡中散步，她不时发出喵呜的声音，尾巴插件随着走动而摇晃，让她不住颤抖。\n\n顺从 +1，抖M气质 +1，情欲上升。`,
            effects: [{ target: c.name, abl10: `+1`, abl21: `+1` }]
        };
    }

    _evtFallenHeat(g) {
        const c = this._getRandomSlave(g);
        if (!c || !this._isFallen(c)) return this._evtUnfallenDrug(g);
        c.addAbl(11);
        c.addAbl(30);
        this._gainPalam(c, 6, 200);
        this._gainPalam(c, 0, 100);
        this._gainPalam(c, 2, 100);
        c.mp = Math.max(0, c.mp - 20);
        return {
            title: `【沉沦】${c.name}的发情期`,
            text: `${c.name}突然进入了发情期，全身滚烫，不断摩擦着大腿，发出甜美的喘息。\n\n好热，身体好热。${c.name}撕扯着自己的衣服，眼神迷离地向魔王伸出双手。发情中的她失去了理智，主动抱住魔王，不断扭动身体渴求着交合。\n\n欲望 +1，性交成瘾 +1，情欲大幅上升，气力 -20。`,
            effects: [{ target: c.name, abl11: `+1`, abl30: `+1`, mp: -20 }]
        };
    }

    _evtMemoryRecovery(g) {
        const c = g.characters.find((ch, i) => i !== g.master && ch.talent[202]);
        if (!c) return null;
        if (!this._checkFirstTimeProtection(c, 'vaginal')) return this._evtSlaveDream(g);
        c.talent[202] = 0; // 清除记忆清除特质，恢复记忆
        c.mark[0] = 3; // 服从度直接恢复
        this._gainPalam(c, 5, 200);
        this._gainPalam(c, 6, 150);
        return {
            title: `【记忆恢复】${c.name}的回忆`,
            text: `魔王将${c.name}压在身下，粗暴地贯穿了她。在剧烈的快感冲击中，${c.name}的脑海中突然闪过无数画面——被囚禁的日子、被调教的时刻、曾经的屈辱与屈服。那些被封锁的记忆如洪水般涌来。\\n\\n啊……我想起来了……我是魔王的奴隶……${c.name}泪流满面，却主动抱紧了魔王。她恢复了所有记忆，对魔王的服从比以往更加深刻。\\n\\n服从度恢复为Lv.3，屈服与情欲大幅上升。`,
            effects: [{ target: c.name, mark0: 3 }]
        };
    }



    // ========== 特殊事件 ==========

    _evtWeddingNight(g) {
        const c = this._getMarriedSlave(g);
        if (!c) return null;
        c.addMark(0, 1);
        c.addMark(3, -2);
        if (c.mark[3] < 0) c.mark[3] = 0;
        c.exp[23] = (c.exp[23] || 0) + 5;
        this._gainPalam(c, 5, 300);
        this._gainPalam(c, 6, 300);
        this._gainPalam(c, 2, 150);
        const master = g.getMaster();
        if (master) master.mp = Math.min(master.maxMp, master.mp + 100);
        return {
            title: "【特殊】" + c.name + "的新婚之夜",
            text: "地下城最深层的密室被装点成了洞房的模样。墙壁上挂满了红色的绸缎和燃烧的龙凤烛，空气中弥漫着玫瑰花瓣与麝香混合的甜腻香气。" + c.name + "穿着一袭由魔丝织就的红色嫁衣，端坐在铺满天鹅绒的床榻边缘，双手紧张地交叠在膝上。\n\n魔王推开门，身上不再是平日的黑色铠甲，而是一套暗红色的华贵礼服。他缓步走到" + c.name + "面前，伸手挑起了她的下巴。" + c.name + "的脸颊染上了比嫁衣还要艳丽的潮红，眼中既有新娘的羞涩，又有奴隶对主人本能的顺从。\n\n「从今天起，你不仅是我的奴隶，更是我的妻子。」魔王低沉的声音让" + c.name + "浑身一颤。她仰起头，主动献上了自己的嘴唇。那是一个漫长而深情的吻，两人的舌头交缠在一起，唾液混合着，发出淫靡的水声。\n\n魔王将" + c.name + "压倒在柔软的天鹅绒床榻上，一层一层解开她的嫁衣。当最后一层薄纱被揭开时，" + c.name + "赤裸的身体在烛光下泛着珍珠般的光泽。魔王俯下身，从锁骨一路吻到乳房，舌尖挑逗着那已经挺立的乳头。\n\n「啊……夫君……」" + c.name + "发出了甜美的呻吟，双腿不自觉地缠上了魔王的腰肢。魔王分开她的双腿，将已经硬挺的性器抵在了她湿润的入口处。\n\n「叫我主人。」魔王在她耳边低语。\n\n「主……主人……请占有您的妻子……」" + c.name + "哀求着，私处早已分泌出大量的爱液。魔王缓缓挺入，感受着那紧致的内壁紧紧包裹着自己。" + c.name + "仰起头，发出了一声高亢而幸福的呻吟。\n\n这一夜漫长而激烈。魔王一次又一次地占有着自己的新娘，而" + c.name + "则在快感中不断地呼唤着「主人」和「夫君」。当黎明的光芒透过缝隙照进密室时，两人交缠在一起的身体仍未分开，床单上留下了无数爱的痕迹。\n\n爱情经验 +5，服从度 +1，反抗刻印 -2，情欲与屈服大幅上升，魔王气力 +100。",
            effects: [{ target: c.name, mark0: "+1", mark3: "-2", love: "+5" }]
        };
    }

    // ========== V12.0: 新增魔王专属事件（20个）==========

    _evtMasterTortureInsight(g) {
        const c = this._getRandomSlave(g);
        if (!c) return null;
        c.addMark(3, -1);
        if (c.mark[3] < 0) c.mark[3] = 0;
        return { title: `【魔王】拷问洞察`, text: `魔王在对${c.name}的拷问中意外发现了勇者的弱点情报。这些情报将在未来的战斗中派上用场。`, effects: [{ target: c.name, mark3: -1 }] };
    }

    _evtMasterSlaveChat(g) {
        const c = this._getRandomSlave(g);
        if (!c) return null;
        return { title: `【魔王】与${c.name}的对话`, text: `魔王罕见地没有进行调教，而是与${c.name}进行了一场平静的对话。${c.name}透露了一些关于地表世界的近况。`, effects: [{ target: c.name, info: '地表情报' }] };
    }

    _evtMasterPastDiary(g) {
        const master = g.getMaster();
        if (master) master.mp = Math.min(master.maxMp, master.mp + 30);
        return { title: `【魔王】发现过去的日记`, text: `魔王在地下城深处发现了一本古老的日记。上面记载着上一代魔王的心得——「不要信任勇者，也不要憎恨他们。我们都是在轮回中挣扎的囚徒。」`, effects: [{ target: '魔王', mp: 30 }] };
    }

    _evtMasterDreamPast(g) {
        const master = g.getMaster();
        if (master) master.mp = Math.min(master.maxMp, master.mp + 50);
        return { title: `【魔王】梦见过去`, text: `魔王做了一个梦。梦中，自己还是一名年轻的勇者，站在阳光下的村庄里。那时的他还没有铠甲，也没有野心，只有一个简单的愿望——保护身边的人。`, effects: [{ target: '魔王', mp: 50 }] };
    }

    _evtMasterVisitor(g) {
        g.money = (g.money || 0) + 200;
        return { title: `【魔王】神秘访客`, text: `一位身披斗篷的神秘访客来到魔王城，留下了一袋金币和一句警告：「小心那些自称正义的人，他们往往比恶魔更危险。」金币 +200`, effects: [{ target: '魔王', gold: 200 }] };
    }

    _evtMasterRebellionQuell(g) {
        const slaves = g.characters.filter((c, i) => i !== g.master && c.hp > 0);
        if (slaves.length === 0) return null;
        for (const s of slaves) s.addMark(0, 1);
        return { title: `【魔王】镇压叛乱`, text: `几名奴隶试图策划叛乱，但被魔王的威严所震慑。叛乱在萌芽阶段就被扑灭，奴隶们的服从度有所提升。`, effects: [{ target: '全体奴隶', mark0: '+1' }] };
    }

    _evtMasterRitualUpgrade(g) {
        const master = g.getMaster();
        if (master) { master.atk = (master.atk || 0) + 3; master.def = (master.def || 0) + 3; }
        return { title: `【魔王】仪式升级`, text: `魔王完成了一个古老的黑暗仪式，力量得到了进一步提升。`, effects: [{ target: '魔王', atk: 3, def: 3 }] };
    }

    _evtMasterSpyReport(g) {
        const targets = g.invaders.filter(h => h.hp > 0);
        const info = targets.length > 0 ? `发现${targets.length}名勇者活跃` : '地表平静';
        return { title: `【魔王】间谍报告`, text: `潜伏在地表的间谍传回了最新情报：${info}。`, effects: [{ target: '魔王', info }] };
    }

    _evtMasterHeroAnalysis(g) {
        const target = g.invaders[RAND(g.invaders.length)];
        if (!target) return null;
        return { title: `【魔王】分析勇者${target.name}`, text: `魔王仔细研究了${target.name}的战斗记录和性格特征，制定了针对性的应对策略。`, effects: [{ target: target.name, analyzed: true }] };
    }

    _evtMasterWeaponForge(g) {
        const master = g.getMaster();
        if (master) master.atk = (master.atk || 0) + 5;
        return { title: `【魔王】锻造魔器`, text: `魔王在熔炉中锻造了一件新的魔器，攻击力获得了提升。`, effects: [{ target: '魔王', atk: 5 }] };
    }

    _evtMasterCurseStudy(g) {
        return { title: `【魔王】诅咒研究`, text: `魔王深入研究了古代诅咒的奥秘。今后施加的诅咒效果将更加持久和强大。`, effects: [{ target: '魔王', curse_power: 1 }] };
    }

    _evtMasterPotionBrew(g) {
        const master = g.getMaster();
        if (master) master.hp = Math.min(master.maxHp, master.hp + 50);
        return { title: `【魔王】魔药调制`, text: `魔王成功调制了一瓶恢复魔药，饮下后感觉体力充沛。HP +50`, effects: [{ target: '魔王', hp: 50 }] };
    }

    _evtMasterTrapSet(g) {
        g.flag[997] = (g.flag[997] || 0) + 1;
        return { title: `【魔王】设置陷阱`, text: `魔王亲自设计了一套精妙的陷阱系统，布置在地下城的关键通道上。勇者们的通行将更加危险。`, effects: [{ target: '魔王', trap: 1 }] };
    }

    _evtMasterDungeonExpand(g) {
        return { title: `【魔王】扩张地下城`, text: `魔王命令魔物们开凿了新的通道和房间。地下城的规模进一步扩大，勇者们将面对更多未知的危险。`, effects: [{ target: '魔王', expand: 1 }] };
    }

    _evtMasterAllianceBreak(g) {
        const heroes = g.invaders.filter(h => h.hp > 0);
        if (heroes.length >= 2) {
            const a = heroes[RAND(heroes.length)];
            const b = heroes[RAND(heroes.length)];
            if (a !== b && g._setHeroRelation) g._setHeroRelation(a, b, -1, 'alliance_break');
        }
        return { title: `【魔王】破坏勇者联盟`, text: `魔王派出的间谍成功在勇者之间散布了猜忌和不信任。`, effects: [{ target: '勇者关系', relation: -1 }] };
    }

    _evtMasterPrideGrowth(g) {
        const master = g.getMaster();
        if (master) { master.atk = (master.atk || 0) + 3; master.def = (master.def || 0) + 2; }
        return { title: `【魔王】傲慢增长`, text: `随着俘虏的增加，魔王的自信心也在膨胀。力量提升了，但也许...傲慢会是最大的敌人。`, effects: [{ target: '魔王', atk: 3, def: 2 }] };
    }

    _evtMasterLonely(g) {
        const master = g.getMaster();
        if (master) master.mp = Math.max(0, master.mp - 20);
        return { title: `【魔王】孤独`, text: `深夜，魔王独自坐在王座上，周围是空荡荡的大厅。即使拥有无尽的权力和奴隶，内心深处依然感到一种无法填补的空虚。`, effects: [{ target: '魔王', mp: -20 }] };
    }

    _evtMasterSlaveGift(g) {
        const c = this._getRandomSlave(g);
        if (!c) return null;
        g.money = (g.money || 0) + 100;
        c.addMark(0, 1);
        return { title: `【魔王】${c.name}的献礼`, text: `${c.name}将自己珍藏的物品献给了魔王。虽然只值100G，但这份心意让魔王感到满意。`, effects: [{ target: c.name, mark0: '+1', gold: 100 }] };
    }

    _evtMasterOmen(g) {
        return { title: `【魔王】不祥预兆`, text: `魔王在水晶球中看到了模糊的画面——一位从未见过的勇者正在向地下城深处进发。那个勇者的眼神中，有着和曾经的自己一样的东西。`, effects: [{ target: '魔王', omen: '新勇者接近' }] };
    }

    _evtMasterFinalPrep(g) {
        const master = g.getMaster();
        if (master) { master.hp = master.maxHp; master.mp = master.maxMp; master.atk = (master.atk || 0) + 10; master.def = (master.def || 0) + 10; }
        return { title: `【魔王】最终决战准备`, text: `魔王感受到了决战的气息。所有力量都被调动起来，为即将到来的最终对决做准备。全属性大幅提升！`, effects: [{ target: '魔王', hp: 'MAX', mp: 'MAX', atk: 10, def: 10 }] };
    }

    _evtOrgyFeast(g) {
        const slaves = g.characters.filter((c, i) => i !== g.master && c.hp > 0);
        if (slaves.length < 3) return null;
        const participants = [];
        const indices = [];
        while (participants.length < Math.min(5, slaves.length) && indices.length < slaves.length) {
            const idx = RAND(slaves.length);
            if (!indices.includes(idx)) {
                indices.push(idx);
                participants.push(slaves[idx]);
            }
        }
        if (participants.length < 3) return null;
        const names = participants.map(c => c.name).join("、");
        for (const c of participants) {
            c.addAbl(11);
            this._gainPalam(c, 6, 150);
            this._gainPalam(c, 5, 100);
            c.addMark(0, 1);
        }
        return {
            title: "【特殊】群交盛宴",
            text: "魔王在地下城的中央大厅举办了一场前所未有的淫乱盛宴。大厅中央铺设着巨大的圆形软垫，周围点燃了数百支散发着催情香气的蜡烛。" + names + "等" + participants.length + "名奴隶被召集至此，她们被告知今晚将是一场「全员参与的狂欢」。\n\n音乐响起，那是能够挑动情欲的淫魔之音。奴隶们在魔药和音乐的双重作用下，眼神逐渐变得迷离。起初只是互相抚摸、亲吻，但很快，衣物被一件一件褪去，赤裸的身体交缠在一起。\n\n" + participants[0].name + "将" + participants[1].name + "压在身下，舌头在对方的乳房和私处间游走；" + participants[2].name + "则跪在一旁，同时用双手取悦着两个人。更多的奴隶加入了这场混乱的交媾——有人被按在软垫上贯穿，有人主动骑坐在别人身上扭动腰肢，还有人互相用嘴巴侍奉着对方的敏感部位。\n\n魔王端坐在王座上，欣赏着这场由自己一手导演的群交盛宴。空气中弥漫着汗水、爱液和精液混合的气息，淫靡的水声和甜美的呻吟交织成一首放荡的交响曲。\n\n当盛宴结束时，所有参与者都精疲力竭地瘫软在软垫上，身上沾满了各种体液，眼神中却都带着满足的神色。魔王满意地点了点头——这场盛宴不仅满足了欲望，更让奴隶们明白了：在魔王城中，个体的羞耻毫无意义，只有集体的淫乱才是永恒的快乐。\n\n所有参与者欲望 +1，服从度 +1，情欲与屈服大幅上升。",
            effects: participants.map(c => ({ target: c.name, abl11: "+1", mark0: "+1" }))
        };
    }

    _evtFallenTeachesUnfallen(g) {
        const fallenList = g.characters.filter((c, i) => i !== g.master && this._isFallen(c) && c.hp > 0);
        const unfallenList = g.characters.filter((c, i) => i !== g.master && !this._isFallen(c) && c.hp > 0);
        if (fallenList.length === 0 || unfallenList.length === 0) return null;
        const teacher = fallenList[RAND(fallenList.length)];
        const student = unfallenList[RAND(unfallenList.length)];
        teacher.addAbl(12);
        teacher.addAbl(33);
        const oldMark = student.mark[0] || 0;
        student.addMark(0, 1);
        student.addMark(3, -1);
        this._gainPalam(student, 5, 150);
        this._gainPalam(student, 6, 120);
        this._gainPalam(teacher, 6, 100);
        return {
            title: "【特殊】" + teacher.name + "对" + student.name + "的「启蒙」",
            text: "深夜，魔王将" + teacher.name + "和" + student.name + "带到了一间特殊的调教室。" + student.name + "还不明白即将发生什么，但" + teacher.name + "的眼中却闪烁着期待的光芒——魔王命令她「好好教导这位新来的妹妹」。\n\n「不用担心，」" + teacher.name + "走到" + student.name + "面前，用温柔却带着一丝邪气的声音说道，「很快就会舒服起来的。」她伸手解开了" + student.name + "的衣带，将手掌覆上了对方颤抖的乳房。" + student.name + "试图后退，但魔物守卫已经封锁了门口。\n\n" + teacher.name + "的技术炉火纯青。她先用舌尖描摹着" + student.name + "的耳垂和脖颈，留下一串串湿润的吻痕，然后缓缓下移，含住了那已经因紧张而挺立的乳头。" + student.name + "发出了一声压抑的呻吟，身体不由自主地颤抖起来。\n\n「看，身体已经这么诚实了。」" + teacher.name + "的手指滑向" + student.name + "的私处，那里已经分泌出了透明的液体。她用手指轻轻拨弄着那敏感的花核，感受着" + student.name + "的腰肢因快感而微微挺起。\n\n「不要……这样……好奇怪……」" + student.name + "摇着头，但身体却背叛了她的意志。" + teacher.name + "趁机分开了她的双腿，用舌头舔舐着那湿润的缝隙。" + student.name + "发出了高亢的尖叫，双手紧紧抓住" + teacher.name + "的头发，不知是要推开还是按得更紧。\n\n在" + teacher.name + "的「教导」下，" + student.name + "第一次体验到了同性带来的快感。当" + teacher.name + "的手指插入她体内，找到那最敏感的一点时，" + student.name + "的身体剧烈痉挛，达到了前所未有的高潮。\n\n「欢迎加入魔王的阵营。」" + teacher.name + "舔去嘴角的液体，微笑着说道。\n\n" + student.name + "服从度" + oldMark + "→" + student.mark[0] + "，反抗刻印 -1；" + teacher.name + "技巧 +1，施虐快乐 +1。",
            effects: [{ target: student.name, mark0: student.mark[0], mark3: -1 }, { target: teacher.name, abl12: "+1", abl33: "+1" }]
        };
    }

    // ========== 地下城事件（勇者） ==========
    _processDungeonEvents() {
        const results = [];
        const processedSquads = new Set();
        for (const hero of this.game.invaders) {
            // 如果已经触发过事件，跳过
            if (this.game._hasTriggeredDailyEvent(hero)) continue;

            const squadId = hero.cflag[CFLAGS.SQUAD_ID];
            const isLeader = hero.cflag[CFLAGS.SQUAD_LEADER] === 1;

            // 如果是小队成员（非队长），跳过——由队长统一处理
            if (squadId && !isLeader) continue;

            if (squadId && isLeader) {
                // 队长：二选一——小队事件 or 单人事件
                if (processedSquads.has(squadId)) continue;
                processedSquads.add(squadId);

                // 获取小队所有成员（包括队长）
                const squad = this.game.invaders.filter(h => h.cflag[CFLAGS.SQUAD_ID] === squadId);

                if (RAND(100) < 50) {
                    // 50%概率触发小队事件
                    const squadResult = this._processSquadEvent(this.game, hero);
                    if (squadResult) {
                        results.push({ type: `squad`, hero: hero.name, ...squadResult });
                        // 标记全队已触发
                        for (const m of squad) this.game._markDailyEventTriggered(m);
                    }
                } else {
                    // 50%概率：随机选一名成员触发单人事件
                    const target = squad[RAND(squad.length)];
                    const evt = this._pickDungeonEvent(target);
                    if (evt) {
                        const result = evt.handler(this.game, target);
                        if (result) {
                            results.push({ type: `dungeon`, hero: target.name, ...result });
                            // 标记全队已触发（小队一天最多一个事件）
                            for (const m of squad) this.game._markDailyEventTriggered(m);
                        }
                    }
                }
            } else {
                // 独行侠：正常触发单人事件
                const evt = this._pickDungeonEvent(hero);
                if (evt) {
                    const result = evt.handler(this.game, hero);
                    if (result) {
                        results.push({ type: `dungeon`, hero: hero.name, ...result });
                        this.game._markDailyEventTriggered(hero);
                    }
                }
            }
        }
        return results;
    }

    _pickDungeonEvent(hero) {
        const pool = this._getDungeonEventPool();
        const totalWeight = pool.reduce((s, e) => s + e.weight, 0);
        let roll = RAND(totalWeight);
        for (const e of pool) {
            roll -= e.weight;
            if (roll < 0) return e;
        }
        return pool[0];
    }

    _getDungeonEventPool() {
        return [
            { id: `hero_heal`, name: `神秘治疗`, weight: 8, handler: (g, h) => this._evtHeroHeal(g, h) },
            { id: `hero_supply`, name: `遗留物资`, weight: 7, handler: (g, h) => this._evtHeroSupply(g, h) },
            { id: `hero_shortcut`, name: `隐藏通道`, weight: 5, handler: (g, h) => this._evtHeroShortcut(g, h) },
            { id: `hero_guide`, name: `神秘向导`, weight: 4, handler: (g, h) => this._evtHeroGuide(g, h) },
            { id: `hero_spring`, name: `治愈之泉`, weight: 6, handler: (g, h) => this._evtHeroSpring(g, h) },
            { id: `hero_relic`, name: `古代遗物`, weight: 4, handler: (g, h) => this._evtHeroRelic(g, h) },
            { id: `hero_inspire`, name: `勇气鼓舞`, weight: 5, handler: (g, h) => this._evtHeroInspire(g, h) },
            { id: `hero_trap`, name: `陷阱`, weight: 8, handler: (g, h) => this._evtHeroTrap(g, h) },
            { id: `hero_ambush`, name: `魔物伏击`, weight: 7, handler: (g, h) => this._evtHeroAmbush(g, h) },
            { id: `hero_curse`, name: `古老诅咒`, weight: 4, handler: (g, h) => this._evtHeroCurse(g, h) },
            { id: `hero_env`, name: `环境灾害`, weight: 6, handler: (g, h) => this._evtHeroEnv(g, h) },
            { id: `hero_chest_gear`, name: `装备宝箱`, weight: 5, handler: (g, h) => this._evtHeroChestGear(g, h) },
            { id: `hero_chest_weapon`, name: `武器宝箱`, weight: 3, handler: (g, h) => this._evtHeroChestWeapon(g, h) },
            { id: `hero_chest_item`, name: `道具宝箱`, weight: 4, handler: (g, h) => this._evtHeroChestItem(g, h) },
            { id: `hero_chest_cleanse`, name: `净化之光`, weight: 2, handler: (g, h) => this._evtHeroChestCleanse(g, h) },
            { id: `hero_lore`, name: `历史碎片`, weight: 5, handler: (g, h) => this._evtHeroLore(g, h) },
            // V12.0: 新增勇者单人事件（20个）
            { id: `hero_starvation`, name: `饥饿`, weight: 6, handler: (g, h) => this._evtHeroStarvation(g, h) },
            { id: `hero_morale_boost`, name: `士气高涨`, weight: 5, handler: (g, h) => this._evtHeroMoraleBoost(g, h) },
            { id: `hero_blessing`, name: `神明祝福`, weight: 4, handler: (g, h) => this._evtHeroBlessing(g, h) },
            { id: `hero_mirror`, name: `魔镜恐惧`, weight: 4, handler: (g, h) => this._evtHeroMirror(g, h) },
            { id: `hero_whispers`, name: `地下城低语`, weight: 5, handler: (g, h) => this._evtHeroWhispers(g, h) },
            { id: `hero_fog`, name: `迷雾`, weight: 5, handler: (g, h) => this._evtHeroFog(g, h) },
            { id: `hero_sacrifice_altar`, name: `献祭祭坛`, weight: 3, handler: (g, h) => this._evtHeroSacrificeAltar(g, h) },
            { id: `hero_ghost_hero`, name: `勇者亡魂`, weight: 4, handler: (g, h) => this._evtHeroGhost(g, h) },
            { id: `hero_treasure_map`, name: `藏宝图`, weight: 3, handler: (g, h) => this._evtHeroTreasureMap(g, h) },
            { id: `hero_black_market`, name: `黑市商人`, weight: 3, handler: (g, h) => this._evtHeroBlackMarket(g, h) },
            { id: `hero_mimic`, name: `宝箱怪`, weight: 4, handler: (g, h) => this._evtHeroMimic(g, h) },
            { id: `hero_potion_overflow`, name: `药水溢出`, weight: 4, handler: (g, h) => this._evtHeroPotionOverflow(g, h) },
            { id: `hero_equipment_rust`, name: `装备锈蚀`, weight: 4, handler: (g, h) => this._evtHeroEquipmentRust(g, h) },
            { id: `hero_reinforcement`, name: `援军`, weight: 3, handler: (g, h) => this._evtHeroReinforcement(g, h) },
            { id: `hero_trap_room`, name: `陷阱房间`, weight: 5, handler: (g, h) => this._evtHeroTrapRoom(g, h) },
            { id: `hero_secret_door`, name: `密道`, weight: 4, handler: (g, h) => this._evtHeroSecretDoor(g, h) },
            { id: `hero_rest_site`, name: `安全休息点`, weight: 4, handler: (g, h) => this._evtHeroRestSite(g, h) },
            { id: `hero_cursed_gold`, name: `诅咒金币`, weight: 4, handler: (g, h) => this._evtHeroCursedGold(g, h) },
            { id: `hero_memory_shard`, name: `记忆碎片`, weight: 3, handler: (g, h) => this._evtHeroMemoryShard(g, h) },
            { id: `hero_blood_moon`, name: `血月`, weight: 2, handler: (g, h) => this._evtHeroBloodMoon(g, h) },
        ];
    }

    _evtHeroHeal(g, hero) {
        const heal = 100 + RAND(150);
        hero.hp = Math.min(hero.maxHp, hero.hp + heal);
        return {
            title: `【地下城】${hero.name}得到了神秘治疗`,
            text: `一位披着斗篷的神秘人出现在${hero.name}面前，留下了治疗的药剂后悄然消失。HP +${heal}`,
            effects: [{ target: hero.name, hp: heal }]
        };
    }

    _evtHeroSupply(g, hero) {
        const items = [`回复药`, `强化药`, `解毒草`, `火把`, `干粮`];
        const item = items[RAND(items.length)];
        hero.hp = Math.min(hero.maxHp, hero.hp + 50);
        hero.mp = Math.min(hero.maxMp, hero.mp + 30);
        return {
            title: `【地下城】${hero.name}发现了遗留物资`,
            text: `${hero.name}在角落发现了一具风干的白骨，旁边放着其他勇者遗留的背包。获得了【${item}】，HP/MP 小幅恢复。`,
            effects: []
        };
    }

    _evtHeroShortcut(g, hero) {
        const floorId = g.getHeroFloor(hero);
        let progress = g.getHeroProgress(hero);
        progress += 15;
        if (progress >= 100) {
            progress = 0;
            hero.cflag[CFLAGS.HERO_FLOOR] = floorId + 1;
        }
        hero.cflag[CFLAGS.HERO_PROGRESS] = progress;
        return {
            title: `【地下城】${hero.name}发现了隐藏通道`,
            text: `${hero.name}注意到了墙壁上不起眼的裂缝，推开后果然是一条捷径！侵略进度大幅推进。`,
            effects: [{ target: hero.name, progress: 15 }]
        };
    }

    _evtHeroGuide(g, hero) {
        const tips = [
            `前方的房间里潜伏着危险的魔物`,
            `魔王似乎在第10层等待着什么`,
            `地下城的深处有通往地面的密道`,
            `某位强大的勇者曾死在前方的陷阱里`
        ];
        return {
            title: `【地下城】${hero.name}遇到了神秘向导`,
            text: `一个模糊的影子出现在${hero.name}面前，低声说道：「${tips[RAND(tips.length)]}」说完便消散在黑暗中。`,
            effects: []
        };
    }

    _evtHeroSpring(g, hero) {
        const heal = 200 + RAND(100);
        hero.hp = Math.min(hero.maxHp, hero.hp + heal);
        hero.mp = Math.min(hero.maxMp, hero.mp + heal);
        return {
            title: `【地下城】${hero.name}发现了治愈之泉`,
            text: `地下深处有一汪散发着微光的泉水，${hero.name}饮用后感到全身充满了力量。HP +${heal} MP +${heal}`,
            effects: [{ target: hero.name, hp: heal, mp: heal }]
        };
    }

    _evtHeroRelic(g, hero) {
        const buffs = [
            { name: `攻击力上升`, stat: 'atk', val: 0.15 },
            { name: `防御力上升`, stat: 'def', val: 0.15 },
            { name: `速度上升`, stat: 'spd', val: 0.10 },
            { name: `魔力抗性`, stat: 'mpPct', val: 0.20 }
        ];
        const buff = buffs[RAND(buffs.length)];
        // V12.0: 古代遗物现在提供实际buff效果（持续3天）
        const expireDay = (g.day || 1) + 3;
        const relicBuffs = JSON.parse(hero.cstr[CSTRS.RELIC_BUFFS] || '[]');
        relicBuffs.push({ name: buff.name, stat: buff.stat, val: buff.val, expire: expireDay });
        hero.cstr[CSTRS.RELIC_BUFFS] = JSON.stringify(relicBuffs);
        // 立即应用buff
        if (buff.stat === 'atk') hero.atk = Math.floor(hero.atk * (1 + buff.val));
        else if (buff.stat === 'def') hero.def = Math.floor(hero.def * (1 + buff.val));
        else if (buff.stat === 'spd') hero.spd = Math.floor(hero.spd * (1 + buff.val));
        else if (buff.stat === 'mpPct') hero.maxMp = Math.floor(hero.maxMp * (1 + buff.val));
        return {
            title: `【地下城】${hero.name}获得了古代遗物`,
            text: `${hero.name}从石棺中取出了闪耀着微光的遗物。获得了临时增益：${buff.name}（持续3天）`,
            effects: [{ target: hero.name, buff: buff.name }]
        };
    }

    _evtHeroInspire(g, hero) {
        hero.mp = Math.min(hero.maxMp, hero.mp + 50);
        return {
            title: `【地下城】${hero.name}受到了勇气鼓舞`,
            text: `${hero.name}回想起故乡等待自己的人们，内心涌起无尽的勇气。气力 +50`,
            effects: [{ target: hero.name, mp: 50 }]
        };
    }

    _evtHeroTrap(g, hero) {
        const dmg = 50 + RAND(100);
        hero.hp = Math.max(0, hero.hp - dmg);
        return {
            title: `【地下城】${hero.name}触发了陷阱`,
            text: `地板突然塌陷，${hero.name}跌入了一个布满尖刺的深坑。HP -${dmg}`,
            effects: [{ target: hero.name, hp: -dmg }]
        };
    }

    _evtHeroAmbush(g, hero) {
        const dmg = 80 + RAND(120);
        hero.hp = Math.max(0, hero.hp - dmg);
        return {
            title: `【地下城】${hero.name}遭到魔物伏击`,
            text: `黑暗中数只魔物同时扑向${hero.name}，虽然勉强击退了它们，但受了不轻的伤。HP -${dmg}`,
            effects: [{ target: hero.name, hp: -dmg }]
        };
    }

    _evtHeroCurse(g, hero) {
        hero.mp = Math.max(0, hero.mp - 40);
        return {
            title: `【地下城】${hero.name}受到了古老诅咒`,
            text: `${hero.name}触碰了不该触碰的石碑，一股阴冷的气息钻入了体内。气力 -40`,
            effects: [{ target: hero.name, mp: -40 }]
        };
    }

    _evtHeroEnv(g, hero) {
        const dmg = 30 + RAND(50);
        hero.hp = Math.max(0, hero.hp - dmg);
        return {
            title: `【地下城】${hero.name}遭遇了环境灾害`,
            text: `突然出现的落石/毒气/冰锥袭击了${hero.name}。HP -${dmg}`,
            effects: [{ target: hero.name, hp: -dmg }]
        };
    }

    _evtHeroChestGear(g, hero) {
        const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring'];
        const slot = slotTypes[RAND(slotTypes.length)];
        const gear = GearSystem.generateGear(slot, hero.level);
        const r = GearSystem.equipItem(hero, gear);
        const curseWarn = (r.curseTriggered && !hero.cflag[CFLAGS.SQUAD_ID]) ? ' 但这股力量似乎不太对劲...' : '';
        return {
            title: `【地下城】${hero.name}发现了装备宝箱`,
            text: `${hero.name}在一具古老骑士的遗骸旁发现了一个锈迹斑斑的铁箱。箱内闪烁着微弱的光芒——是一件${GearSystem.SLOT_NAMES[slot]}！${r.msg}${curseWarn}`,
            effects: [{ target: hero.name, gear: GearSystem.getGearDesc(gear) }]
        };
    }

    _evtHeroChestWeapon(g, hero) {
        const weapon = GearSystem.generateWeapon(hero.level);
        const r = GearSystem.equipItem(hero, weapon);
        const curseWarn = (r.curseTriggered && !hero.cflag[CFLAGS.SQUAD_ID]) ? ' 但这把武器散发着不祥的气息...' : '';
        return {
            title: `【地下城】${hero.name}发现了武器宝箱`,
            text: `${hero.name}推开一面活动的石墙，露出了一个隐秘的武库。架子上陈列着各种武器，其中一把引起了${hero.name}的注意。${r.msg}${curseWarn}`,
            effects: [{ target: hero.name, weapon: GearSystem.getGearDesc(weapon) }]
        };
    }

    _evtHeroChestItem(g, hero) {
        // V8.0: 移除buff，新增town_portal
        const itemTypes = ['heal', 'mana', 'cleanse', 'town_portal'];
        const itype = itemTypes[RAND(itemTypes.length)];
        const item = GearSystem.generateItem(itype, hero.level);
        // V8.0: 智能装备比较（道具直接装备）
        const r = itype === 'town_portal' ? GearSystem.equipItem(hero, item) : GearSystem.equipItem(hero, item);
        const curseWarn = (r.curseTriggered && !hero.cflag[CFLAGS.SQUAD_ID]) ? ' 但这东西看起来有些诡异...' : '';
        return {
            title: `【地下城】${hero.name}发现了道具宝箱`,
            text: `${hero.name}在拐角处发现了一个被藤蔓覆盖的小木箱。打开后，里面放着一些冒险者留下的物资。${r.msg}${curseWarn}`,
            effects: [{ target: hero.name, item: GearSystem.getGearDesc(item) }]
        };
    }

    _evtHeroChestCleanse(g, hero) {
        const cleanse = GearSystem.generateItem('cleanse', hero.level, Math.min(5, 1 + RAND(3)));
        const r = GearSystem.equipItem(hero, cleanse);
        return {
            title: `【地下城】${hero.name}发现了净化之光`,
            text: `${hero.name}走进一间被圣光笼罩的小礼拜堂。祭坛上摆放着一卷散发着温暖光芒的卷轴。${r.msg}`,
            effects: [{ target: hero.name, item: GearSystem.getGearDesc(cleanse) }]
        };
    }

    // ========== V12.0: 魔王军冒险事件 ==========
    _processDemonArmyEvents() {
        const results = [];
        const processedSquads = new Set();
        // 遍历执行任务的魔王军角色（前勇者/魔王）
        const demonArmies = this.game.characters.filter(c => {
            if (c.hp <= 0) return false;
            const isMaster = this.game.getMaster() === c;
            const isExHero = c.talent && c.talent[200];
            if (!isMaster && !isExHero) return false;
            // 只给正在执行任务的魔王军触发冒险事件
            const taskType = c.cflag[CFLAGS.SLAVE_TASK_TYPE] || 0;
            return taskType !== 0;
        });
        for (const actor of demonArmies) {
            if (this.game._hasTriggeredDailyEvent(actor)) continue;
            const isMaster = this.game.getMaster() === actor;
            // V12.0: 魔王单人出击时触发魔王专属地下城事件
            if (isMaster) {
                if (RAND(100) >= 30) continue;
                const evt = this._pickMasterRaidEvent();
                if (evt) {
                    const result = evt.handler(this.game, actor);
                    if (result) {
                        results.push({ type: 'master_raid', actor: actor.name, ...result });
                        this.game._markDailyEventTriggered(actor);
                    }
                }
                continue;
            }
            // V12.0: 魔王军（手下）应用小队2选1规则
            const squadMarker = actor.cflag[998];
            const isLeader = actor.cflag[CFLAGS.SQUAD_LEADER] === 1;
            // 小队成员跳过独立事件（由队长统一决策）
            if (squadMarker && !isLeader) continue;
            // 队长决策：小队事件 or 单人事件
            if (squadMarker && isLeader && !processedSquads.has(squadMarker)) {
                processedSquads.add(squadMarker);
                if (RAND(100) < 25) {
                    // 25%触发小队事件（全体）
                    const squadResult = this._processDemonSquadEvent(this.game, actor);
                    if (squadResult) {
                        results.push({ type: 'demon_squad', actor: actor.name, ...squadResult });
                        // 标记全队已触发
                        const squad = demonArmies.filter(c => c.cflag[998] === squadMarker);
                        for (const m of squad) this.game._markDailyEventTriggered(m);
                        continue;
                    }
                }
                // 否则：队长自己触发单人事件（队员不触发）
            }
            // 单人事件（独行魔王军 or 队长未触发小队事件时）
            if (RAND(100) >= 30) continue;
            const evt = this._pickDemonArmyEvent(actor);
            if (evt) {
                const result = evt.handler(this.game, actor);
                if (result) {
                    results.push({ type: 'demon_army', actor: actor.name, ...result });
                    this.game._markDailyEventTriggered(actor);
                }
            }
        }
        return results;
    }

    _pickDemonArmyEvent(actor) {
        const pool = this._getDemonArmyEventPool();
        const totalWeight = pool.reduce((s, e) => s + e.weight, 0);
        let roll = RAND(totalWeight);
        for (const e of pool) {
            roll -= e.weight;
            if (roll < 0) return e;
        }
        return pool[0];
    }

    _pickMasterRaidEvent() {
        const pool = this._getMasterRaidEventPool();
        const totalWeight = pool.reduce((s, e) => s + e.weight, 0);
        let roll = RAND(totalWeight);
        for (const e of pool) {
            roll -= e.weight;
            if (roll < 0) return e;
        }
        return pool[0];
    }

    _getDemonArmyEventPool() {
        return [
            { id: 'demon_train',      name: '训练魔物',     weight: 8, handler: (g, a) => this._evtDemonTrain(g, a) },
            { id: 'demon_crystal',    name: '发现堕落结晶', weight: 5, handler: (g, a) => this._evtDemonCrystal(g, a) },
            { id: 'demon_rumor',      name: '散播谣言',     weight: 6, handler: (g, a) => this._evtDemonRumor(g, a) },
            { id: 'demon_equip',      name: '强化装备',     weight: 5, handler: (g, a) => this._evtDemonEquip(g, a) },
            { id: 'demon_capture',    name: '捕获落单勇者', weight: 4, handler: (g, a) => this._evtDemonCapture(g, a) },
            { id: 'demon_meditate',   name: '冥想修炼',     weight: 7, handler: (g, a) => this._evtDemonMeditate(g, a) },
            // V12.0: 新增魔王军冒险事件（第一批10个）
            { id: 'demon_scout',      name: '侦察勇者',     weight: 6, handler: (g, a) => this._evtDemonScout(g, a) },
            { id: 'demon_trap_set',   name: '设置陷阱',     weight: 5, handler: (g, a) => this._evtDemonTrapSet(g, a) },
            { id: 'demon_potion',     name: '调制魔药',     weight: 4, handler: (g, a) => this._evtDemonPotion(g, a) },
            { id: 'demon_forge',      name: '锻造魔器',     weight: 4, handler: (g, a) => this._evtDemonForge(g, a) },
            { id: 'domen_ritual',     name: '黑暗仪式',     weight: 3, handler: (g, a) => this._evtDemonRitual(g, a) },
            { id: 'demon_spy_report', name: '间谍报告',     weight: 5, handler: (g, a) => this._evtDemonSpyReport(g, a) },
            { id: 'demon_ambush_plan',name: '埋伏计划',     weight: 4, handler: (g, a) => this._evtDemonAmbushPlan(g, a) },
            { id: 'demon_corrupt_ground', name: '腐化大地', weight: 3, handler: (g, a) => this._evtDemonCorruptGround(g, a) },
            { id: 'demon_summon',     name: '召唤魔物',     weight: 4, handler: (g, a) => this._evtDemonSummon(g, a) },
            { id: 'demon_intimidate', name: '恐吓勇者',     weight: 5, handler: (g, a) => this._evtDemonIntimidate(g, a) },
            // V12.0: 新增魔王军冒险事件（第二批10个）
            { id: 'demon_ambush',      name: '伏击落单勇者', weight: 4, handler: (g, a) => this._evtDemonAmbush(g, a) },
            { id: 'demon_sabotage',    name: '破坏补给',     weight: 4, handler: (g, a) => this._evtDemonSabotage(g, a) },
            { id: 'demon_forage',      name: '采集资源',     weight: 5, handler: (g, a) => this._evtDemonForage(g, a) },
            { id: 'demon_prisoner_interrogate', name: '审讯俘虏', weight: 3, handler: (g, a) => this._evtDemonPrisonerInterrogate(g, a) },
            { id: 'demon_armor_enchant', name: '护甲附魔',   weight: 4, handler: (g, a) => this._evtDemonArmorEnchant(g, a) },
            { id: 'demon_map_draw',    name: '绘制地图',     weight: 4, handler: (g, a) => this._evtDemonMapDraw(g, a) },
            { id: 'demon_blood_pact',  name: '血契',         weight: 3, handler: (g, a) => this._evtDemonBloodPact(g, a) },
            { id: 'demon_soul_harvest', name: '灵魂收割',    weight: 3, handler: (g, a) => this._evtDemonSoulHarvest(g, a) },
            { id: 'demon_monster_breed', name: '魔物培育',   weight: 4, handler: (g, a) => this._evtDemonMonsterBreed(g, a) },
            { id: 'demon_chaos_ritual', name: '混沌仪式',    weight: 2, handler: (g, a) => this._evtDemonChaosRitual(g, a) },
        ];
    }

    _getMasterRaidEventPool() {
        // V12.0: 魔王单人出击时触发的地下城专属事件
        return [
            { id: 'master_raid_diary',    name: '地下城古文献', weight: 5, handler: (g, a) => this._evtMasterRaidDiary(g, a) },
            { id: 'master_raid_forge',    name: '地下城熔炉',   weight: 4, handler: (g, a) => this._evtMasterRaidForge(g, a) },
            { id: 'master_raid_curse',    name: '诅咒研究',     weight: 4, handler: (g, a) => this._evtMasterRaidCurse(g, a) },
            { id: 'master_raid_trap',     name: '布置陷阱',     weight: 5, handler: (g, a) => this._evtMasterRaidTrap(g, a) },
            { id: 'master_raid_potion',   name: '采集制药',     weight: 4, handler: (g, a) => this._evtMasterRaidPotion(g, a) },
            { id: 'master_raid_spy',     name: '观察勇者',     weight: 5, handler: (g, a) => this._evtMasterRaidSpy(g, a) },
            { id: 'master_raid_ritual',   name: '黑暗仪式',     weight: 3, handler: (g, a) => this._evtMasterRaidRitual(g, a) },
            { id: 'master_raid_pride',    name: '傲慢增长',     weight: 4, handler: (g, a) => this._evtMasterRaidPride(g, a) },
            { id: 'master_raid_omen',    name: '不祥预感',     weight: 4, handler: (g, a) => this._evtMasterRaidOmen(g, a) },
            { id: 'master_raid_dungeon', name: '地下城共鸣',   weight: 3, handler: (g, a) => this._evtMasterRaidDungeon(g, a) },
        ];
    }

    _evtDemonTrain(g, actor) {
        const expGain = actor.level * 3;
        // V12.0: EXP现在实际生效，存入exp[102]并检查升级
        actor.exp[102] = (actor.exp[102] || 0) + expGain;
        if (typeof g.checkLevelUp === 'function') g.checkLevelUp(actor);
        // V12.0: 训练强化标记——后续地下城怪物更强
        g.flag[998] = (g.flag[998] || 0) + 1;
        return {
            title: `【魔王军】${actor.name}训练了魔物`,
            text: `${actor.name}在地下城中训练了一批新生魔物，教导它们如何更有效地伏击勇者。魔物们的凶性被激发，地下城的威胁提升了。EXP +${expGain}`,
            effects: [{ target: actor.name, exp: expGain }]
        };
    }

    _evtDemonCrystal(g, actor) {
        const crystal = GearSystem.generateItem('buff', actor.level, 2 + RAND(2));
        const r = GearSystem.equipItem(actor, crystal);
        // V12.0: 标记持有堕落结晶，用于后续装备强化事件链
        actor.cflag[CFLAGS.DEMON_CRYSTAL] = (actor.cflag[CFLAGS.DEMON_CRYSTAL] || 0) + 1;
        return {
            title: `【魔王军】${actor.name}发现了堕落结晶`,
            text: `${actor.name}在地下城深处发现了一块散发着诡异紫光的堕落结晶。将其收好后，感觉力量有所提升。${r.msg}`,
            effects: [{ target: actor.name, item: GearSystem.getGearDesc(crystal) }]
        };
    }

    _evtDemonRumor(g, actor) {
        g.addFame(10);
        // V12.0: 谣言事件链——设置谣言标记，影响后续捕获事件
        g.flag[996] = g.day || 1;
        // 谣言使所有勇者移动速度临时降低（恐慌效果）
        let affected = 0;
        for (const h of g.invaders) {
            if (h.hp > 0) {
                h.cflag[CFLAGS.PANIC_DAY] = (g.day || 1) + 2; // 恐慌标记，持续2天
                affected++;
            }
        }
        return {
            title: `【魔王军】${actor.name}散播了谣言`,
            text: `${actor.name}在地下城中散播关于魔王的恐怖传言，勇者们闻风丧胆。${affected > 0 ? `共有${affected}名勇者陷入恐慌，行动力下降。` : ''}魔王声望 +10`,
            effects: [{ target: '魔王', fame: 10 }]
        };
    }

    _evtDemonEquip(g, actor) {
        if (!actor.gear) return null;
        const slots = ['head', 'body', 'legs', 'hands', 'neck', 'ring'];
        const slot = slots[RAND(slots.length)];
        const gear = actor.gear[slot];
        if (!gear || gear.rarity >= 5) return null;
        // V12.0: 事件链——如果有堕落结晶，强化效果翻倍
        const hasCrystal = (actor.cflag[CFLAGS.DEMON_CRYSTAL] || 0) > 0;
        const boost = hasCrystal ? 2 : 1;
        gear.rarity = Math.min(5, gear.rarity + boost);
        if (hasCrystal) actor.cflag[CFLAGS.DEMON_CRYSTAL] = Math.max(0, (actor.cflag[CFLAGS.DEMON_CRYSTAL] || 0) - 1);
        return {
            title: `【魔王军】${actor.name}强化了装备`,
            text: `${actor.name}${hasCrystal ? '利用堕落结晶的力量' : '利用地下城的魔力'}强化了${gear.name}，装备品质提升至【${GearSystem.getRarityName(gear.rarity)}】。`,
            effects: [{ target: actor.name, gear: gear.name }]
        };
    }

    _evtDemonCapture(g, actor) {
        // V12.0: 事件链——谣言期间捕获条件放宽
        const rumorDay = g.flag[996] || 0;
        const rumorActive = rumorDay > 0 && (g.day - rumorDay) <= 3;
        const hpThreshold = rumorActive ? 0.5 : 0.3; // 谣言期间HP<50%即可捕获
        const targets = g.invaders.filter(h => {
            if (h.hp <= 0) return false;
            if (!rumorActive && (h.cflag[CFLAGS.SQUAD_ID] || 0) > 0) return false; // 非谣言期只抓独行
            const hpPct = h.maxHp > 0 ? h.hp / h.maxHp : 1;
            return hpPct < hpThreshold;
        });
        if (targets.length === 0) return null;
        const target = targets[RAND(targets.length)];
        g._imprisonHero(target, 0);
        return {
            title: `【魔王军】${actor.name}捕获了${rumorActive ? '恐慌中的' : '落单'}勇者`,
            text: `${actor.name}在地下城阴影中发现了${rumorActive ? '因谣言而恐慌逃窜的' : '身受重伤的'}${target.name}，轻松将其俘虏并带回魔王城。`,
            effects: [{ target: target.name, captured: true }]
        };
    }

    _evtDemonMeditate(g, actor) {
        const mpGain = Math.floor(actor.maxMp * 0.5);
        const expGain = actor.level * 2;
        actor.mp = Math.min(actor.maxMp, actor.mp + mpGain);
        // V12.0: EXP现在实际生效
        actor.exp[102] = (actor.exp[102] || 0) + expGain;
        if (typeof g.checkLevelUp === 'function') g.checkLevelUp(actor);
        return {
            title: `【魔王军】${actor.name}进行了冥想修炼`,
            text: `${actor.name}在地下城的静谧角落冥想，恢复了MP并领悟了新的战斗技巧。MP +${mpGain}，EXP +${expGain}`,
            effects: [{ target: actor.name, mp: mpGain, exp: expGain }]
        };
    }

    // V12.0: 地下城历史碎片事件
    _evtHeroLore(g, hero) {
        const floorId = g.getHeroFloor(hero);
        const lore = DUNGEON_LORE_DEFS[floorId] || DUNGEON_LORE_DEFS[1];
        hero.fame = (hero.fame || 0) + 2;
        if (g._addAdventureLog) g._addAdventureLog(hero, 'lore_found', `在第${floorId}层发现了历史碎片`);
        return {
            title: `【地下城】${hero.name}发现了历史碎片`,
            text: `${hero.name}在${lore.location}发现了一些古老的遗迹。${lore.text}\n\n这段历史让人不寒而栗，但也让${hero.name}对这个世界有了更深的理解。声望 +2`,
            effects: [{ target: hero.name, fame: 2 }]
        };
    }

    // ========== V12.0: 新增勇者单人事件（20个）==========

    _evtHeroStarvation(g, hero) {
        const dmg = Math.floor(hero.maxHp * 0.1);
        hero.hp = Math.max(1, hero.hp - dmg);
        const voices = ['肚子好饿...已经两天没吃东西了...', '干粮在路上弄丢了，必须尽快找到补给...'];
        if (g._addAdventureLog) g._addAdventureLog(hero, 'voice', voices[RAND(voices.length)]);
        return { title: `【地下城】${hero.name}饥肠辘辘`, text: `长时间没有进食，${hero.name}感到体力在流失。HP -${dmg}`, effects: [{ target: hero.name, hp: -dmg }] };
    }

    _evtHeroMoraleBoost(g, hero) {
        const mpGain = Math.floor(hero.maxMp * 0.3);
        hero.mp = Math.min(hero.maxMp, hero.mp + mpGain);
        return { title: `【地下城】${hero.name}士气高涨`, text: `${hero.name}回想起家乡的温暖，一股力量涌上心头。MP +${mpGain}`, effects: [{ target: hero.name, mp: mpGain }] };
    }

    _evtHeroBlessing(g, hero) {
        const expire = (g.day || 1) + 3;
        const blessings = JSON.parse(hero.cstr[CSTRS.RELIC_BUFFS] || '[]');
        blessings.push({ name: '神明祝福', stat: 'atk', val: 0.10, expire });
        blessings.push({ name: '神明祝福', stat: 'def', val: 0.10, expire });
        hero.cstr[CSTRS.RELIC_BUFFS] = JSON.stringify(blessings);
        hero.atk = Math.floor(hero.atk * 1.1);
        hero.def = Math.floor(hero.def * 1.1);
        return { title: `【地下城】${hero.name}受到神明祝福`, text: `一道圣光笼罩了${hero.name}，全属性临时提升10%（持续3天）！`, effects: [{ target: hero.name, buff: '全属性+10%' }] };
    }

    _evtHeroMirror(g, hero) {
        const dmg = Math.floor(hero.maxMp * 0.2);
        hero.mp = Math.max(0, hero.mp - dmg);
        const voices = [`魔镜中映出的不是我的脸...那是谁？`, `我看到了...我最恐惧的东西...`];
        if (g._addAdventureLog) g._addAdventureLog(hero, 'voice', voices[RAND(voices.length)]);
        return { title: `【地下城】${hero.name}被魔镜恐吓`, text: `一面古老的魔镜映出了${hero.name}内心最深处的恐惧。MP -${dmg}`, effects: [{ target: hero.name, mp: -dmg }] };
    }

    _evtHeroWhispers(g, hero) {
        if (RAND(2) === 0) {
            hero.fame = (hero.fame || 0) + 3;
            return { title: `【地下城】${hero.name}听到了有用的低语`, text: `地下城的墙壁似乎在低语...${hero.name}从中获取了关于前方陷阱的情报。声望 +3`, effects: [{ target: hero.name, fame: 3 }] };
        } else {
            const dmg = Math.floor(hero.maxMp * 0.15);
            hero.mp = Math.max(0, hero.mp - dmg);
            return { title: `【地下城】${hero.name}被低语折磨`, text: `不可名状的声音在${hero.name}脑海中回荡，精神受到了冲击。MP -${dmg}`, effects: [{ target: hero.name, mp: -dmg }] };
        }
    }

    _evtHeroFog(g, hero) {
        let progress = g.getHeroProgress(hero);
        progress = Math.max(0, progress - 10);
        hero.cflag[CFLAGS.HERO_PROGRESS] = progress;
        return { title: `【地下城】${hero.name}在迷雾中迷路`, text: `浓重的迷雾遮蔽了视线，${hero.name}迷失了方向。进度 -10%`, effects: [{ target: hero.name, progress: -10 }] };
    }

    _evtHeroSacrificeAltar(g, hero) {
        const hpCost = Math.floor(hero.maxHp * 0.2);
        hero.hp = Math.max(1, hero.hp - hpCost);
        const stats = ['atk', 'def', 'spd'];
        const stat = stats[RAND(stats.length)];
        if (stat === 'atk') hero.atk += 2;
        else if (stat === 'def') hero.def += 2;
        else hero.spd += 2;
        return { title: `【地下城】${hero.name}在祭坛献祭`, text: `${hero.name}在古老祭坛上献祭了鲜血，获得了永久的属性提升。HP -${hpCost}，${stat.toUpperCase()} +2`, effects: [{ target: hero.name, stat: stat, val: 2 }] };
    }

    _evtHeroGhost(g, hero) {
        const floorId = g.getHeroFloor(hero);
        const nextFloor = Math.min(10, floorId + 1);
        hero.fame = (hero.fame || 0) + 2;
        return { title: `【地下城】${hero.name}遇到了勇者亡魂`, text: `一位已故勇者的灵魂向${hero.name}诉说了第${nextFloor}层的危险。声望 +2`, effects: [{ target: hero.name, fame: 2 }] };
    }

    _evtHeroTreasureMap(g, hero) {
        hero.cflag[994] = (g.day || 1) + 2; // 藏宝图标记，2天内金币翻倍
        return { title: `【地下城】${hero.name}发现了藏宝图`, text: `${hero.name}在一具骷髅手中发现了一张残破的藏宝图。未来2天内获得的金币将翻倍！`, effects: [{ target: hero.name, buff: '金币翻倍(2天)' }] };
    }

    _evtHeroBlackMarket(g, hero) {
        const items = [`回复药`, `强化药`, `火把`, `解毒草`];
        const item = items[RAND(items.length)];
        const cost = 50 + RAND(100);
        if (hero.gold >= cost) {
            hero.gold -= cost;
            return { title: `【地下城】${hero.name}遇到了黑市商人`, text: `一个可疑的商人在阴影中向${hero.name}兜售商品。花费${cost}G购买了【${item}】。`, effects: [{ target: hero.name, gold: -cost }] };
        }
        return { title: `【地下城】${hero.name}遇到了黑市商人`, text: `一个可疑的商人向${hero.name}展示了商品，但价格太高只好放弃。`, effects: [] };
    }

    _evtHeroMimic(g, hero) {
        const floorId = g.getHeroFloor(hero);
        const monster = g._spawnMonster ? g._spawnMonster(floorId, 'normal') : null;
        if (monster) {
            monster.name = '宝箱怪';
            monster.icon = '🎁';
            monster.atk = Math.floor(monster.atk * 1.2);
            return { title: `【地下城】${hero.name}遭遇了宝箱怪！`, text: `那个闪闪发光的宝箱突然张开了血盆大口！原来是一只宝箱怪！`, effects: [{ target: hero.name, combat: true, monster }] };
        }
        return { title: `【地下城】${hero.name}差点被宝箱怪袭击`, text: `一个可疑的宝箱在${hero.name}靠近时抖动了一下，但很快恢复了平静。`, effects: [] };
    }

    _evtHeroPotionOverflow(g, hero) {
        const effects = [
            () => { hero.hp = Math.min(hero.maxHp, hero.hp + 50); return 'HP +50'; },
            () => { hero.mp = Math.min(hero.maxMp, hero.mp + 30); return 'MP +30'; },
            () => { hero.hp = Math.max(1, hero.hp - 30); return 'HP -30（变质了！）'; },
            () => { hero.atk += 3; return '攻击力 +3'; },
        ];
        const effect = effects[RAND(effects.length)];
        const result = effect();
        return { title: `【地下城】${hero.name}饮用了神秘药水`, text: `${hero.name}发现了一瓶未标注的药水，喝下去后...${result}`, effects: [{ target: hero.name, text: result }] };
    }

    _evtHeroEquipmentRust(g, hero) {
        const slots = ['head', 'body', 'legs', 'hands', 'neck', 'ring'];
        const slot = slots[RAND(slots.length)];
        const gear = hero.gear ? hero.gear[slot] : null;
        if (gear && gear.rarity > 1) {
            gear.rarity -= 1;
            return { title: `【地下城】${hero.name}的装备锈蚀了`, text: `地下城的潮湿环境让${hero.name}的${gear.name}生了锈，品质下降了！`, effects: [{ target: hero.name, gear: gear.name }] };
        }
        return { title: `【地下城】${hero.name}发现了锈蚀痕迹`, text: `${hero.name}注意到周围的金属都在快速锈蚀，幸好自己的装备没有受到影响。`, effects: [] };
    }

    _evtHeroReinforcement(g, hero) {
        const hpBoost = Math.floor(hero.maxHp * 0.5);
        hero.hp = Math.min(hero.maxHp, hero.hp + hpBoost);
        return { title: `【地下城】${hero.name}遇到了援军`, text: `一位受伤的退伍老兵将自己的剩余物资交给了${hero.name}。HP +${hpBoost}`, effects: [{ target: hero.name, hp: hpBoost }] };
    }

    _evtHeroTrapRoom(g, hero) {
        const dmg = Math.floor(hero.maxHp * 0.3);
        hero.hp = Math.max(1, hero.hp - dmg);
        return { title: `【地下城】${hero.name}触发了陷阱房间`, text: `${hero.name}踏入了一个布满机关的房间，无数暗器从四面八方射来！HP -${dmg}`, effects: [{ target: hero.name, hp: -dmg }] };
    }

    _evtHeroSecretDoor(g, hero) {
        let progress = g.getHeroProgress(hero);
        progress += 20;
        if (progress >= 100) {
            progress = 0;
            hero.cflag[CFLAGS.HERO_FLOOR] = (g.getHeroFloor(hero) || 1) + 1;
        }
        hero.cflag[CFLAGS.HERO_PROGRESS] = progress;
        return { title: `【地下城】${hero.name}发现了密道`, text: `${hero.name}推开书架后露出了一条隐秘通道，大幅缩短了路程。进度 +20%`, effects: [{ target: hero.name, progress: 20 }] };
    }

    _evtHeroRestSite(g, hero) {
        const hpHeal = hero.maxHp - hero.hp;
        const mpHeal = hero.maxMp - hero.mp;
        hero.hp = hero.maxHp;
        hero.mp = hero.maxMp;
        return { title: `【地下城】${hero.name}找到了安全休息点`, text: `一个被圣光庇护的小房间，${hero.name}在这里得到了充分的休息。HP/MP完全恢复！`, effects: [{ target: hero.name, hp: hpHeal, mp: mpHeal }] };
    }

    _evtHeroCursedGold(g, hero) {
        const gold = 100 + RAND(200);
        hero.gold += gold;
        hero.cflag[994] = 0; // 清除可能的藏宝图标记
        return { title: `【地下城】${hero.name}发现了诅咒金币`, text: `${hero.name}在一具干尸身上发现了${gold}G，但拿到钱的那一刻感到一阵寒意...这些金币被诅咒了。`, effects: [{ target: hero.name, gold }] };
    }

    _evtHeroMemoryShard(g, hero) {
        hero.fame = (hero.fame || 0) + 3;
        const voices = ['这些记忆...不属于我...但又那么熟悉...', '我看到了上一轮回的自己...那是...'];
        if (g._addAdventureLog) g._addAdventureLog(hero, 'voice', voices[RAND(voices.length)]);
        return { title: `【地下城】${hero.name}触碰了记忆碎片`, text: `${hero.name}触碰了一块散发着微光的水晶碎片，无数不属于自己记忆涌入脑海。声望 +3`, effects: [{ target: hero.name, fame: 3 }] };
    }

    _evtHeroBloodMoon(g, hero) {
        hero.cflag[993] = (g.day || 1) + 1; // 血月标记，1天内遇敌率提升
        return { title: `【地下城】血月降临`, text: `一轮血红色的月亮悬挂在地下城的天花板上（不知从何而来），${hero.name}感到周围的魔物变得躁动不安。今日遇敌率大幅提升！`, effects: [{ target: hero.name, buff: '遇敌率提升' }] };
    }

    // ========== V12.0: 新增魔王军冒险事件（10个）==========

    _evtDemonScout(g, actor) {
        const target = g.invaders[RAND(g.invaders.length)];
        const floor = target ? (g.getHeroFloor ? g.getHeroFloor(target) : '?') : '?';
        return { title: `【魔王军】${actor.name}侦察了勇者动向`, text: `${actor.name}潜伏在阴影中观察，发现勇者${target ? target.name : '某人'}正在第${floor}层活动。`, effects: [{ target: actor.name, info: '勇者位置情报' }] };
    }

    _evtDemonTrapSet(g, actor) {
        g.flag[997] = (g.flag[997] || 0) + 1; // 陷阱层数标记
        return { title: `【魔王军】${actor.name}设置了陷阱`, text: `${actor.name}在地下城通道中布置了精密的陷阱，勇者们的通行将更加危险。`, effects: [{ target: actor.name, trap: 1 }] };
    }

    _evtDemonPotion(g, actor) {
        const potion = GearSystem.generateItem('buff', actor.level, 1 + RAND(2));
        GearSystem.equipItem(actor, potion);
        return { title: `【魔王军】${actor.name}调制了魔药`, text: `${actor.name}利用地下城的奇异植物调制了一瓶强力魔药。${potion.name}已装备。`, effects: [{ target: actor.name, item: potion.name }] };
    }

    _evtDemonForge(g, actor) {
        if (!actor.gear || !actor.gear.weapons) return null;
        const w = actor.gear.weapons[RAND(actor.gear.weapons.length)];
        if (!w) return null;
        w.atk = (w.atk || 0) + 2 + RAND(3);
        return { title: `【魔王军】${actor.name}锻造了魔器`, text: `${actor.name}在地下城熔炉中锻造了${w.name}，攻击力获得了提升。`, effects: [{ target: actor.name, weapon: w.name }] };
    }

    _evtDemonRitual(g, actor) {
        const hpCost = Math.floor(actor.maxHp * 0.1);
        actor.hp = Math.max(1, actor.hp - hpCost);
        actor.atk = (actor.atk || 0) + 5;
        actor.def = (actor.def || 0) + 5;
        return { title: `【魔王军】${actor.name}执行了黑暗仪式`, text: `${actor.name}以自身鲜血为代价，换取了强大的黑暗力量。HP -${hpCost}，攻防 +5`, effects: [{ target: actor.name, hp: -hpCost, atk: 5, def: 5 }] };
    }

    _evtDemonSpyReport(g, actor) {
        const targets = g.invaders.filter(h => h.hp > 0);
        const info = targets.length > 0 ? `发现${targets.length}名活跃勇者` : '未发现勇者踪迹';
        return { title: `【魔王军】${actor.name}收到了间谍报告`, text: `潜伏在勇者中的间谍传回了情报：${info}。`, effects: [{ target: actor.name, info }] };
    }

    _evtDemonAmbushPlan(g, actor) {
        g.flag[998] = (g.flag[998] || 0) + 1; // 与训练共用标记，增强地下城
        return { title: `【魔王军】${actor.name}制定了埋伏计划`, text: `${actor.name}精心策划了针对勇者小队的埋伏，地下城的威胁进一步提升了。`, effects: [{ target: actor.name, plan: '埋伏' }] };
    }

    _evtDemonCorruptGround(g, actor) {
        for (const h of g.invaders) {
            if (h.hp > 0) h.hp = Math.max(1, h.hp - 10);
        }
        return { title: `【魔王军】${actor.name}腐化了大地`, text: `${actor.name}释放的黑暗能量污染了地下城的环境，所有勇者受到了持续伤害。`, effects: [{ target: '全体勇者', hp: -10 }] };
    }

    _evtDemonSummon(g, actor) {
        const floorId = actor.cflag[CFLAGS.SLAVE_TASK_CURRENT_FLOOR] || actor.cflag[CFLAGS.SLAVE_TASK_FLOOR] || 1;
        const monster = g._spawnMonster ? g._spawnMonster(floorId, 'chief') : null;
        if (monster) {
            return { title: `【魔王军】${actor.name}召唤了精英魔物`, text: `${actor.name}通过禁忌仪式召唤了一只强大的${monster.name}来守护地下城！`, effects: [{ target: actor.name, monster: monster.name }] };
        }
        return { title: `【魔王军】${actor.name}尝试召唤魔物`, text: `${actor.name}的召唤仪式只唤来了几只普通史莱姆...`, effects: [] };
    }

    _evtDemonIntimidate(g, actor) {
        const target = g.invaders[RAND(g.invaders.length)];
        if (target) {
            target.mp = Math.max(0, target.mp - 20);
            const voices = [`${actor.name}...那个名字让我不寒而栗...`, `魔王军越来越近了...我们能赢吗？`];
            if (g._addAdventureLog) g._addAdventureLog(target, 'voice', voices[RAND(voices.length)]);
        }
        return { title: `【魔王军】${actor.name}恐吓了勇者`, text: `${actor.name}在勇者营地附近故意留下恐怖的标记，削弱了对方的士气。`, effects: [{ target: target ? target.name : '勇者', mp: -20 }] };
    }

    // ========== V12.0: 魔王军冒险事件（第二批10个）==========

    _evtDemonAmbush(g, actor) {
        const target = g.invaders.filter(h => h.hp > 0 && !h.cflag[CFLAGS.SQUAD_ID])[RAND(g.invaders.length)];
        if (!target) return null;
        const dmg = Math.floor(target.maxHp * 0.2);
        target.hp = Math.max(1, target.hp - dmg);
        const gold = 50 + RAND(100);
        g.money = (g.money || 0) + gold;
        return { title: `【魔王军】${actor.name}伏击了勇者`, text: `${actor.name}在地下城暗处成功伏击了落单的${target.name}，${target.name}受到了重创。缴获了${gold}G。`, effects: [{ target: target.name, hp: -dmg }, { target: '魔王', gold }] };
    }

    _evtDemonSabotage(g, actor) {
        for (const h of g.invaders) {
            if (h.hp > 0) h.hp = Math.max(1, h.hp - 15);
        }
        return { title: `【魔王军】${actor.name}破坏了勇者补给`, text: `${actor.name}潜入勇者营地，破坏了他们的食物和水源。所有勇者受到了伤害。`, effects: [{ target: '全体勇者', hp: -15 }] };
    }

    _evtDemonForage(g, actor) {
        const heal = Math.floor(actor.maxHp * 0.3);
        actor.hp = Math.min(actor.maxHp, actor.hp + heal);
        const item = GearSystem.generateItem('heal', actor.level);
        GearSystem.equipItem(actor, item);
        return { title: `【魔王军】${actor.name}采集了地下城资源`, text: `${actor.name}在地下城的角落发现了珍稀的草药和矿石，制作了恢复药剂。HP +${heal}，获得${item.name}。`, effects: [{ target: actor.name, hp: heal, item: item.name }] };
    }

    _evtDemonPrisonerInterrogate(g, actor) {
        const prisoners = g.prisoners || [];
        if (prisoners.length === 0) return null;
        const p = prisoners[RAND(prisoners.length)];
        const intel = g.invaders[RAND(g.invaders.length)];
        return { title: `【魔王军】${actor.name}审讯了俘虏`, text: `${actor.name}从俘虏${p.name}口中撬出了情报：${intel ? intel.name : '某位勇者'}正在策划大规模进攻。`, effects: [{ target: actor.name, info: '勇者情报' }] };
    }

    _evtDemonArmorEnchant(g, actor) {
        if (!actor.gear) return null;
        const slots = ['head', 'body', 'legs', 'hands', 'neck', 'ring'];
        const slot = slots[RAND(slots.length)];
        const gear = actor.gear[slot];
        if (!gear) return null;
        gear.def = (gear.def || 0) + 3 + RAND(3);
        return { title: `【魔王军】${actor.name}附魔了护甲`, text: `${actor.name}利用地下城的魔力为${gear.name}附魔，防御力大幅提升。`, effects: [{ target: actor.name, gear: gear.name }] };
    }

    _evtDemonMapDraw(g, actor) {
        actor.cflag[992] = (actor.cflag[992] || 0) + 1; // 地图完成度标记
        const expGain = actor.level * 2;
        actor.exp[102] = (actor.exp[102] || 0) + expGain;
        if (typeof g.checkLevelUp === 'function') g.checkLevelUp(actor);
        return { title: `【魔王军】${actor.name}绘制了地下城地图`, text: `${actor.name}仔细勘察了地下城的地形，绘制了详尽的地图。这将有助于未来的作战计划。EXP +${expGain}`, effects: [{ target: actor.name, exp: expGain }] };
    }

    _evtDemonBloodPact(g, actor) {
        const hpCost = Math.floor(actor.maxHp * 0.2);
        actor.hp = Math.max(1, actor.hp - hpCost);
        actor.atk = (actor.atk || 0) + 8;
        actor.cflag[991] = (g.day || 1) + 3; // 血契标记，3天内属性提升
        return { title: `【魔王军】${actor.name}缔结了血契`, text: `${actor.name}与地下城的黑暗意志缔结了血契，以鲜血换取了强大的力量。HP -${hpCost}，攻击 +8（3天）`, effects: [{ target: actor.name, hp: -hpCost, atk: 8 }] };
    }

    _evtDemonSoulHarvest(g, actor) {
        const deadHeroes = g.invaders.filter(h => h.hp <= 0);
        if (deadHeroes.length === 0) {
            actor.mp = Math.min(actor.maxMp, actor.mp + 30);
            return { title: `【魔王军】${actor.name}尝试收割灵魂`, text: `${actor.name}没有发现可供收割的灵魂，但吸收了一些游离的魔力。MP +30`, effects: [{ target: actor.name, mp: 30 }] };
        }
        const soulPower = deadHeroes.length * 5;
        actor.atk = (actor.atk || 0) + soulPower;
        return { title: `【魔王军】${actor.name}收割了勇者灵魂`, text: `${actor.name}收割了${deadHeroes.length}名勇者的灵魂，力量获得了大幅提升。攻击 +${soulPower}`, effects: [{ target: actor.name, atk: soulPower }] };
    }

    _evtDemonMonsterBreed(g, actor) {
        const floorId = actor.cflag[CFLAGS.SLAVE_TASK_CURRENT_FLOOR] || actor.cflag[CFLAGS.SLAVE_TASK_FLOOR] || 1;
        const monster = g._spawnMonster ? g._spawnMonster(floorId) : null;
        g.flag[998] = (g.flag[998] || 0) + 1;
        if (monster) {
            return { title: `【魔王军】${actor.name}培育了新魔物`, text: `${actor.name}成功培育了一只${monster.name}，并教导它如何伏击勇者。地下城威胁提升。`, effects: [{ target: actor.name, monster: monster.name }] };
        }
        return { title: `【魔王军】${actor.name}尝试培育魔物`, text: `${actor.name}的培育实验失败了...但积累了一些经验。`, effects: [] };
    }

    _evtDemonChaosRitual(g, actor) {
        const hpCost = Math.floor(actor.maxHp * 0.15);
        actor.hp = Math.max(1, actor.hp - hpCost);
        const affected = [];
        for (const h of g.invaders) {
            if (h.hp > 0) {
                h.hp = Math.max(1, h.hp - 20);
                h.mp = Math.max(0, h.mp - 20);
                affected.push(h.name);
            }
        }
        g.flag[998] = (g.flag[998] || 0) + 2;
        return { title: `【魔王军】${actor.name}执行了混沌仪式`, text: `${actor.name}以自身鲜血为代价，释放了混沌能量。所有勇者受到了重创，地下城进一步被腐化。`, effects: [{ target: actor.name, hp: -hpCost }, { target: '全体勇者', hp: -20, mp: -20 }] };
    }

    // ========== V12.0: 魔王军小队事件 ==========

    _processDemonSquadEvent(g, actor) {
        const squadMarker = actor.cflag[998];
        if (!squadMarker) return null;
        const squad = g.characters.filter(c => {
            if (c.hp <= 0) return false;
            const isExHero = c.talent && c.talent[200];
            if (!isExHero) return false;
            return c.cflag[998] === squadMarker && c !== actor;
        });
        if (squad.length === 0) return null;
        const events = [
            (g, a, s) => this._evtDemonSquadPatrol(g, a, s),
            (g, a, s) => this._evtDemonSquadAssault(g, a, s),
            (g, a, s) => this._evtDemonSquadTactical(g, a, s),
            (g, a, s) => this._evtDemonSquadRest(g, a, s),
            (g, a, s) => this._evtDemonSquadRivalry(g, a, s),
            (g, a, s) => this._evtDemonSquadBetrayal(g, a, s),
            (g, a, s) => this._evtDemonSquadTraining(g, a, s),
            (g, a, s) => this._evtDemonSquadLoot(g, a, s),
            (g, a, s) => this._evtDemonSquadSacrifice(g, a, s),
            (g, a, s) => this._evtDemonSquadVictory(g, a, s),
        ];
        const evt = events[RAND(events.length)];
        return evt(g, actor, squad);
    }

    _evtDemonSquadPatrol(g, actor, squad) {
        for (const m of squad) m.hp = Math.min(m.maxHp, m.hp + 15);
        actor.hp = Math.min(actor.maxHp, actor.hp + 15);
        return { title: `【魔王军小队】联合巡逻`, text: `${actor.name}带领小队进行了联合巡逻，确保地下城通道的安全。全队HP恢复。`, effects: [{ target: '全体小队', hp: 15 }] };
    }

    _evtDemonSquadAssault(g, actor, squad) {
        const target = g.invaders.filter(h => h.hp > 0)[RAND(g.invaders.length)];
        if (!target) return null;
        const dmg = Math.floor(target.maxHp * 0.25);
        target.hp = Math.max(1, target.hp - dmg);
        return { title: `【魔王军小队】联合突击`, text: `${actor.name}指挥小队对${target.name}发起了联合突击！${target.name}受到了重创。`, effects: [{ target: target.name, hp: -dmg }] };
    }

    _evtDemonSquadTactical(g, actor, squad) {
        for (const m of squad) m.cflag[989] = (g.day || 1) + 1;
        actor.cflag[989] = (g.day || 1) + 1;
        return { title: `【魔王军小队】战术会议`, text: `${actor.name}召集小队进行了战术会议，制定了针对勇者的作战计划。明日全队伤害提升。`, effects: [{ target: '全体小队', buff: '伤害+20%(1天)' }] };
    }

    _evtDemonSquadRest(g, actor, squad) {
        for (const m of squad) m.mp = Math.min(m.maxMp, m.mp + 20);
        actor.mp = Math.min(actor.maxMp, actor.mp + 20);
        return { title: `【魔王军小队】休整`, text: `小队在安全区域进行了休整，恢复了MP。`, effects: [{ target: '全体小队', mp: 20 }] };
    }

    _evtDemonSquadRivalry(g, actor, squad) {
        const mate = squad[RAND(squad.length)];
        actor.atk = Math.floor((actor.atk || 0) * 1.05);
        mate.atk = Math.floor((mate.atk || 0) * 1.05);
        return { title: `【魔王军小队】内部竞争`, text: `${actor.name}和${mate.name}暗中较劲，互相激励之下战斗力都有所提升。`, effects: [{ target: `${actor.name}&${mate.name}`, atk: '5%' }] };
    }

    _evtDemonSquadBetrayal(g, actor, squad) {
        const mate = squad[RAND(squad.length)];
        mate.hp = Math.max(1, mate.hp - 30);
        return { title: `【魔王军小队】背叛`, text: `${mate.name}在战斗中故意退缩，导致${actor.name}陷入了险境。${mate.name}的HP受到了伤害。`, effects: [{ target: mate.name, hp: -30 }] };
    }

    _evtDemonSquadTraining(g, actor, squad) {
        for (const m of squad) {
            m.exp[102] = (m.exp[102] || 0) + Math.floor(m.level * 3);
            if (typeof g.checkLevelUp === 'function') g.checkLevelUp(m);
        }
        actor.exp[102] = (actor.exp[102] || 0) + Math.floor(actor.level * 3);
        if (typeof g.checkLevelUp === 'function') g.checkLevelUp(actor);
        return { title: `【魔王军小队】集体训练`, text: `小队进行了集体训练，每个人的经验值都获得了提升。`, effects: [{ target: '全体小队', exp: '提升' }] };
    }

    _evtDemonSquadLoot(g, actor, squad) {
        const gold = 100 + RAND(200);
        g.money = (g.money || 0) + gold;
        return { title: `【魔王军小队】掠夺`, text: `小队掠夺了一处勇者营地，获得了${gold}G。`, effects: [{ target: '魔王', gold }] };
    }

    _evtDemonSquadSacrifice(g, actor, squad) {
        const mate = squad[RAND(squad.length)];
        const hpCost = Math.floor(mate.maxHp * 0.2);
        mate.hp = Math.max(1, mate.hp - hpCost);
        actor.atk = (actor.atk || 0) + 10;
        return { title: `【魔王军小队】献祭`, text: `${actor.name}以${mate.name}的鲜血为代价，换取了强大的黑暗力量。${mate.name}HP -${hpCost}，${actor.name}攻击 +10`, effects: [{ target: mate.name, hp: -hpCost }, { target: actor.name, atk: 10 }] };
    }

    _evtDemonSquadVictory(g, actor, squad) {
        for (const m of squad) {
            m.hp = Math.min(m.maxHp, m.hp + 20);
            m.mp = Math.min(m.maxMp, m.mp + 20);
        }
        actor.hp = Math.min(actor.maxHp, actor.hp + 20);
        actor.mp = Math.min(actor.maxMp, actor.mp + 20);
        g.addFame(5);
        return { title: `【魔王军小队】胜利庆祝`, text: `小队成功完成了一次重大任务，举行了简短的庆祝。全队状态恢复，魔王声望 +5。`, effects: [{ target: '全体小队', hp: 20, mp: 20 }, { target: '魔王', fame: 5 }] };
    }

    // ========== V12.0: 魔王单人出击事件 ==========

    _evtMasterRaidDiary(g, actor) {
        actor.mp = Math.min(actor.maxMp, actor.mp + 30);
        return { title: `【魔王出击】发现古文献`, text: `${actor.name}在地下城深处发现了一块刻有古老文字的石板。上面记载着上一代魔王的遗言：「地下城本身就是一座牢笼，而我们都是其中的囚徒。」`, effects: [{ target: actor.name, mp: 30 }] };
    }

    _evtMasterRaidForge(g, actor) {
        actor.atk = (actor.atk || 0) + 5;
        return { title: `【魔王出击】地下城熔炉锻造`, text: `${actor.name}在地下城熔炉中锻造了一件新的魔器。熔炉中的火焰似乎有自己的意志，锻造出的武器散发着不祥的光芒。攻击 +5`, effects: [{ target: actor.name, atk: 5 }] };
    }

    _evtMasterRaidCurse(g, actor) {
        g.flag[995] = (g.flag[995] || 0) + 1; // 诅咒强度标记
        return { title: `【魔王出击】诅咒研究`, text: `${actor.name}在地下城发现了古代诅咒的符文。深入研究后，对诅咒的理解更加深刻了。今后的诅咒效果将更强。`, effects: [{ target: actor.name, curse_power: 1 }] };
    }

    _evtMasterRaidTrap(g, actor) {
        g.flag[997] = (g.flag[997] || 0) + 2;
        return { title: `【魔王出击】布置陷阱`, text: `${actor.name}亲自设计了一套精妙的陷阱系统，布置在地下城的关键通道上。这些陷阱连经验丰富的勇者都难以察觉。`, effects: [{ target: actor.name, trap: 2 }] };
    }

    _evtMasterRaidPotion(g, actor) {
        actor.hp = Math.min(actor.maxHp, actor.hp + 50);
        return { title: `【魔王出击】采集制药`, text: `${actor.name}在地下城采集了珍稀的草药，成功调制了一瓶强效的恢复魔药。HP +50`, effects: [{ target: actor.name, hp: 50 }] };
    }

    _evtMasterRaidSpy(g, actor) {
        const targets = g.invaders.filter(h => h.hp > 0);
        const info = targets.length > 0 ? `发现${targets.length}名活跃勇者` : '地表平静';
        return { title: `【魔王出击】观察勇者`, text: `${actor.name}潜伏在暗处观察勇者的动向，收集到了宝贵的情报：${info}。`, effects: [{ target: actor.name, info }] };
    }

    _evtMasterRaidRitual(g, actor) {
        const hpCost = Math.floor(actor.maxHp * 0.1);
        actor.hp = Math.max(1, actor.hp - hpCost);
        actor.atk = (actor.atk || 0) + 8;
        actor.def = (actor.def || 0) + 8;
        return { title: `【魔王出击】黑暗仪式`, text: `${actor.name}在地下城祭坛执行了禁忌的黑暗仪式，以自身鲜血为代价换取了强大的力量。HP -${hpCost}，攻防 +8`, effects: [{ target: actor.name, hp: -hpCost, atk: 8, def: 8 }] };
    }

    _evtMasterRaidPride(g, actor) {
        actor.atk = (actor.atk || 0) + 3;
        actor.def = (actor.def || 0) + 2;
        return { title: `【魔王出击】傲慢增长`, text: `随着每一次胜利，${actor.name}的自信心也在膨胀。力量提升了，但也许...傲慢会是最大的敌人。`, effects: [{ target: actor.name, atk: 3, def: 2 }] };
    }

    _evtMasterRaidOmen(g, actor) {
        return { title: `【魔王出击】不祥预感`, text: `${actor.name}在地下城深处感受到了异样的气息——一位强大的勇者正在接近。那个勇者的眼神中，有着和曾经的自己一样的东西。`, effects: [{ target: actor.name, omen: '强敌接近' }] };
    }

    _evtMasterRaidDungeon(g, actor) {
        actor.mp = Math.min(actor.maxMp, actor.mp + 40);
        g.masterExp = (g.masterExp || 0) + 10;
        return { title: `【魔王出击】地下城共鸣`, text: `${actor.name}感受到了地下城本身的脉动。这座古老建筑似乎有自己的意识，正在回应魔王的呼唤。MP +40，魔王经验 +10`, effects: [{ target: actor.name, mp: 40, exp: 10 }] };
    }

    // ========== V12.0: 勇者小队事件（20个）==========

    _processSquadEvent(g, hero) {
        const squadId = hero.cflag[CFLAGS.SQUAD_ID];
        if (!squadId) return null;
        const squad = g.invaders.filter(h => h.cflag[CFLAGS.SQUAD_ID] === squadId && h !== hero);
        if (squad.length === 0) return null;
        const events = [
            (g, h, s) => this._evtSquadNightTalk(g, h, s),
            (g, h, s) => this._evtSquadArgument(g, h, s),
            (g, h, s) => this._evtSquadMutualAid(g, h, s),
            (g, h, s) => this._evtSquadTactical(g, h, s),
            (g, h, s) => this._evtSquadFoodShare(g, h, s),
            (g, h, s) => this._evtSquadCampfire(g, h, s),
            (g, h, s) => this._evtSquadBetrayalThought(g, h, s),
            (g, h, s) => this._evtSquadRivalry(g, h, s),
            (g, h, s) => this._evtSquadMentor(g, h, s),
            (g, h, s) => this._evtSquadRescue(g, h, s),
            (g, h, s) => this._evtSquadCombined(g, h, s),
            (g, h, s) => this._evtSquadGuard(g, h, s),
            (g, h, s) => this._evtSquadTreasureDispute(g, h, s),
            (g, h, s) => this._evtSquadSecret(g, h, s),
            (g, h, s) => this._evtSquadOath(g, h, s),
            (g, h, s) => this._evtSquadSacrifice(g, h, s),
            (g, h, s) => this._evtSquadVictory(g, h, s),
            (g, h, s) => this._evtSquadLoveTriangle(g, h, s),
            (g, h, s) => this._evtSquadReunion(g, h, s),
            (g, h, s) => this._evtSquadFarewell(g, h, s),
        ];
        const evt = events[RAND(events.length)];
        return evt(g, hero, squad);
    }

    _evtSquadNightTalk(g, hero, squad) {
        const mate = squad[RAND(squad.length)];
        if (g._setHeroRelation) g._setHeroRelation(hero, mate, 1, 'night_talk');
        return { title: `【小队】${hero.name}与${mate.name}的夜间谈话`, text: `营火旁，${hero.name}和${mate.name}分享了彼此的故事，关系变得更加亲密。`, effects: [{ target: `${hero.name}&${mate.name}`, relation: +1 }] };
    }

    _evtSquadArgument(g, hero, squad) {
        const mate = squad[RAND(squad.length)];
        if (g._setHeroRelation) g._setHeroRelation(hero, mate, -1, 'argument');
        return { title: `【小队】${hero.name}与${mate.name}发生争执`, text: `因为路线选择的分歧，${hero.name}和${mate.name}发生了激烈的争吵。`, effects: [{ target: `${hero.name}&${mate.name}`, relation: -1 }] };
    }

    _evtSquadMutualAid(g, hero, squad) {
        for (const m of squad) {
            m.hp = Math.min(m.maxHp, m.hp + Math.floor(m.maxHp * 0.1));
        }
        hero.hp = Math.min(hero.maxHp, hero.hp + Math.floor(hero.maxHp * 0.1));
        return { title: `【小队】互相救助`, text: `小队成员互相包扎伤口，分享药剂， everyone's condition improved.`, effects: [{ target: '全体小队', hp: '10%' }] };
    }

    _evtSquadTactical(g, hero, squad) {
        hero.cflag[989] = (g.day || 1) + 1; // 战术buff标记
        for (const m of squad) m.cflag[989] = (g.day || 1) + 1;
        return { title: `【小队】战术讨论`, text: `${hero.name}召集小队进行了战术讨论，明日战斗中的伤害将提升20%。`, effects: [{ target: '全体小队', buff: '伤害+20%(1天)' }] };
    }

    _evtSquadFoodShare(g, hero, squad) {
        return { title: `【小队】分享食物`, text: `物资匮乏之际，小队成员将仅剩的食物平均分配。没有人挨饿，士气得到了维持。`, effects: [{ target: '全体小队', morale: 1 }] };
    }

    _evtSquadCampfire(g, hero, squad) {
        for (const m of squad) m.mp = Math.min(m.maxMp, m.mp + 20);
        hero.mp = Math.min(hero.maxMp, hero.mp + 20);
        return { title: `【小队】营火歌声`, text: `有人轻声唱起了故乡的歌谣，疲惫的小队在温暖的火光旁恢复了精神。MP +20`, effects: [{ target: '全体小队', mp: 20 }] };
    }

    _evtSquadBetrayalThought(g, hero, squad) {
        const mate = squad[RAND(squad.length)];
        if (g._setHeroRelation) g._setHeroRelation(hero, mate, -2, 'betrayal_thought');
        const voices = [`${mate.name}...真的值得信任吗？`, `如果情况危急，${mate.name}会不会抛弃我...`];
        if (g._addAdventureLog) g._addAdventureLog(hero, 'voice', voices[RAND(voices.length)]);
        return { title: `【小队】背叛的念头`, text: `深夜，${hero.name}看着${mate.name}的背影，脑海中闪过了不祥的念头...`, effects: [{ target: `${hero.name}&${mate.name}`, relation: -2 }] };
    }

    _evtSquadRivalry(g, hero, squad) {
        const mate = squad[RAND(squad.length)];
        hero.atk = Math.floor((hero.atk || 0) * 1.05);
        mate.atk = Math.floor((mate.atk || 0) * 1.05);
        return { title: `【小队】良性竞争`, text: `${hero.name}和${mate.name}暗中较劲，互相激励之下战斗力都有所提升。`, effects: [{ target: `${hero.name}&${mate.name}`, atk: '5%' }] };
    }

    _evtSquadMentor(g, hero, squad) {
        const junior = squad.find(m => (m.level || 1) < (hero.level || 1)) || squad[RAND(squad.length)];
        junior.exp[102] = (junior.exp[102] || 0) + Math.floor(junior.level * 5);
        return { title: `【小队】老带新`, text: `${hero.name}向${junior.name}传授了战斗经验。${junior.name}的EXP获得了提升。`, effects: [{ target: junior.name, exp: '提升' }] };
    }

    _evtSquadRescue(g, hero, squad) {
        const wounded = squad.find(m => m.hp > 0 && m.hp < m.maxHp * 0.3);
        if (wounded) {
            wounded.hp = Math.min(wounded.maxHp, wounded.hp + Math.floor(wounded.maxHp * 0.4));
            return { title: `【小队】紧急救援`, text: `${hero.name}在战斗中及时救助了濒死的${wounded.name}！`, effects: [{ target: wounded.name, hp: '40%' }] };
        }
        return { title: `【小队】预防性救助`, text: `小队互相照应，没有发现需要紧急救助的同伴。`, effects: [] };
    }

    _evtSquadCombined(g, hero, squad) {
        return { title: `【小队】联合技演练`, text: `小队成员配合演练了一套联合攻击技巧，下次遭遇战将造成额外伤害。`, effects: [{ target: '全体小队', buff: '联合攻击' }] };
    }

    _evtSquadGuard(g, hero, squad) {
        return { title: `【小队】守夜轮班`, text: `小队安排了守夜轮班，夜间没有遭遇任何袭击。每个人都得到了充分的休息。`, effects: [{ target: '全体小队', buff: '安全休息' }] };
    }

    _evtSquadTreasureDispute(g, hero, squad) {
        const mate = squad[RAND(squad.length)];
        if (g._setHeroRelation) g._setHeroRelation(hero, mate, -1, 'treasure_dispute');
        return { title: `【小队】宝物分配争执`, text: `${hero.name}和${mate.name}因为战利品分配产生了争执。`, effects: [{ target: `${hero.name}&${mate.name}`, relation: -1 }] };
    }

    _evtSquadSecret(g, hero, squad) {
        const mate = squad[RAND(squad.length)];
        return { title: `【小队】秘密揭露`, text: `在一次醉酒后，${mate.name}不小心透露了自己隐藏已久的秘密——原来${mate.name}曾是一名贵族的私生子。`, effects: [{ target: mate.name, secret: 'revealed' }] };
    }

    _evtSquadOath(g, hero, squad) {
        for (const m of squad) {
            if (g._setHeroRelation) g._setHeroRelation(hero, m, 1, 'oath_renewal');
        }
        return { title: `【小队】重温誓言`, text: `在月光下，小队成员再次宣誓要共同进退，彼此间的羁绊更加深厚了。`, effects: [{ target: '全体小队', relation: +1 }] };
    }

    _evtSquadSacrifice(g, hero, squad) {
        const mate = squad[RAND(squad.length)];
        const dmg = Math.floor(hero.maxHp * 0.15);
        hero.hp = Math.max(1, hero.hp - dmg);
        mate.hp = Math.min(mate.maxHp, mate.hp + Math.floor(mate.maxHp * 0.3));
        return { title: `【小队】舍身相护`, text: `${hero.name}挺身而出，替${mate.name}挡下了致命一击！`, effects: [{ target: hero.name, hp: -dmg }, { target: mate.name, hp: '30%' }] };
    }

    _evtSquadVictory(g, hero, squad) {
        for (const m of squad) {
            m.hp = Math.min(m.maxHp, m.hp + 20);
            m.mp = Math.min(m.maxMp, m.mp + 20);
        }
        hero.hp = Math.min(hero.maxHp, hero.hp + 20);
        hero.mp = Math.min(hero.maxMp, hero.mp + 20);
        return { title: `【小队】胜利庆祝`, text: `击败强敌后，小队举行了简短的庆祝。每个人都分享了一份喜悦。HP/MP +20`, effects: [{ target: '全体小队', hp: 20, mp: 20 }] };
    }

    _evtSquadLoveTriangle(g, hero, squad) {
        if (squad.length < 2) return null;
        const a = squad[0], b = squad[1];
        if (g._setHeroRelation) {
            g._setHeroRelation(hero, a, -1, 'love_triangle');
            g._setHeroRelation(hero, b, -1, 'love_triangle');
            g._setHeroRelation(a, b, -1, 'love_triangle');
        }
        return { title: `【小队】三角关系`, text: `小队中复杂的感情纠葛让气氛变得微妙起来...`, effects: [{ target: '小队关系', relation: -1 }] };
    }

    _evtSquadReunion(g, hero, squad) {
        return { title: `【小队】失散同伴重逢`, text: `原以为已经阵亡的同伴突然出现在营地门口！小队再次团聚。`, effects: [{ target: '全体小队', morale: 2 }] };
    }

    _evtSquadFarewell(g, hero, squad) {
        const mate = squad[RAND(squad.length)];
        return { title: `【小队】离别`, text: `${mate.name}因为个人原因决定暂时离队。小队的实力有所削弱。`, effects: [{ target: mate.name, action: '离队' }] };
    }
}

// V12.0: 地下城历史碎片定义
window.DUNGEON_LORE_DEFS = {
    1: {
        location: '入口大厅的壁画前',
        text: `壁画上描绘着初代勇者封印魔王的场景。但仔细辨认后会发现，那位「魔王」的面容与现在的魔王截然不同——这意味着，所谓的「魔王」只是一个不断更替的称号。而勇者们，也在不断轮回中重复着同样的命运。`
    },
    2: {
        location: '一处坍塌的民居废墟中',
        text: `碎石下压着一本烧焦的日记。最后一页写着：「他们说要保护我们，可勇者们的战斗摧毁了一切。村子没了，家人也没了。也许...魔王才是带来秩序的那个人？」`
    },
    3: {
        location: '石棺底部的暗格里',
        text: `一张泛黄的羊皮纸上记录着上一代魔王的独白：「我并非生来就是魔王。我也曾是一名勇者，直到我发现——勇者讨伐魔王后，自己会成为新的魔王。这是一个无尽的循环，而我们都是其中的一部分。」`
    },
    4: {
        location: '被遗弃的图书馆角落',
        text: `残破的典籍记载着一个被遗忘的名字：「轮回系统」。每隔数十年，就会出现一名新的魔王和一群新的勇者。勇者杀死魔王，勇者变成魔王，新的勇者再来讨伐——这就是这个世界的真相。没有人真正胜利，只有永恒的轮回。`
    },
    5: {
        location: '祭坛下方的密室',
        text: `密室的墙壁上刻满了名字——都是曾经的魔王和勇者。每个名字后面都标注着相同的日期间隔：正好三十年。这就是轮回的周期。而更令人恐惧的是，最早的名字已经模糊到无法辨认，这意味着这个循环已经持续了...数千年。`
    },
    6: {
        location: '战场遗迹中的阵亡者身边',
        text: `两具紧紧抱在一起的骸骨旁边有一封信：「对不起，我的挚友。为了救你，我不得不对另一位同伴下手。但我不后悔...在这个残酷的世界里，友情是我们唯一的救赎。」原来，勇者之间也会互相背叛。`
    },
    7: {
        location: '魔王研究所的废墟',
        text: `实验记录上写着：「第47号实验体成功转化为魔王。转化过程：勇者杀死前任魔王后，体内会被注入『魔王因子』。72小时后，实验体将失去自我意识，成为新的魔王。建议：提前准备好下一批勇者。」`
    },
    8: {
        location: '地下城核心控制室',
        text: `一台仍在运转的古老装置上显示着令人震惊的信息：「地下城并非自然形成，而是人为建造的培养皿。目的是通过勇者-魔王的循环，持续产出『战斗经验结晶』——这就是这个世界真正的能源。」`
    },
    9: {
        location: '世界树枯死的根系旁',
        text: `树皮下刻着最后的留言：「世界树正在死去。每一次轮回都在抽取它的生命力。当树彻底枯死时，这个世界也将终结。但那些操纵轮回的人不在乎——他们会在世界毁灭前，带着结晶前往下一个世界。」`
    },
    10: {
        location: '魔王王座背后的密道',
        text: `密道尽头的石碑上刻着：「如果你读到了这段文字，说明你已经接近真相。魔王和勇者都是棋子，真正的棋手在高处俯瞰着一切。打破循环的唯一方法...是同时存在魔王和勇者，让他们共存而非互相杀戮。」`
    }
};

window.EventSystem = EventSystem;
