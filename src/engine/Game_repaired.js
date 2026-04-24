/**
 * Game Main Controller — Emuera core state machine
 * States: TITLE → FIRST → SHOP →(TRAIN → AFTERTRAIN → ABLUP → TURNEND → SHOP)
 */
class Game {
    constructor() {
        this.state = "TITLE";
        this.prevState = "";

        // Global vars (FLAG, ITEM, MONEY, etc.)
        this.flag = new Array(2000).fill(0);
        this.item = new Array(200).fill(0);      // 持有数量
        this.money = 0;
        this.day = 1;
        this.time = 0; // 0=Morning 1=Noon 2=Evening 3=Night

        // Character list (CHARANUM, TARGET, ASSI, MASTER)
        this.characters = [];
        this.target = -1;   // 当前调教目标索引
        this.assi = -1;     // 助手索引
        this.master = 0;    // 魔王(玩家)索引

        // Training related
        this.selectcom = -1;    // 当前选择的指令ID
        this.trainCount = 0;    // 本回合已执行指令数
        this.tflag = new Array(50).fill(0); // 临时标记
        this.masterExp = 0;     // 魔王调教经验 (累计执行指令数

        // Command filter (FLAG:25)
        this.commandFilter = 0; // bitflag

        // Save管理
        this.saveManager = new SaveManager();

        // SLG: 地下城设施系统
        this.facility = new Array(20).fill(0);     // 设施等级 [facilityId] = level
        this.strategies = [];                       // 已购买的御敌策略ID列表
        this.prisoners = [];                        // 俘虏的勇者列表
        this.invaders = [];                         // 当前入侵的勇者
        this.dungeonDepth = 1;                      // 地下城层数
        this.nextInvasionDay = 0;                   // 下次勇者入侵日
        this._slaveMarketCandidates = null;         // 奴隶市场缓存

        // 收藏馆系统
        this.museum = {
            specimens: [],  // 标本: { name, level, job, personality, talentSnapshot, markSnapshot, method, description, day, id }
            items: []       // 展品物品: { gear, source, day, id }
        };

        // 系统模块
        this.dialogueSystem = new DialogueSystem();
        this.trainSystem = new TrainSystem(this);
        this.shopSystem = new ShopSystem(this);
        this.dayEndSystem = new DayEndSystem(this);
        this.eventSystem = new EventSystem(this);
    }

    // ========== Character management ==========
    addChara(templateId) {
        const c = CharaTemplates.create(templateId) || new Character(templateId);
        this.characters.push(c);
        return this.characters.length - 1;
    }

    addCharaFromTemplate(charaObj) {
        this.characters.push(charaObj);
        return this.characters.length - 1;
    }

    delChara(index) {
        if (index < 0 || index >= this.characters.length) return;
        this.characters.splice(index, 1);
        // 修正索引引用
        if (this.target === index) this.target = -1;
        else if (this.target > index) this.target--;
        if (this.assi === index) this.assi = -1;
        else if (this.assi > index) this.assi--;
        if (this.master === index) this.master = -1;
        else if (this.master > index) this.master--;
    }

    getChara(index) {
        return this.characters[index] || null;
    }

    getTarget() {
        return this.target >= 0 ? this.characters[this.target] : null;
    }

    getAssi() {
        return this.assi >= 0 ? this.characters[this.assi] : null;
    }

    getMaster() {
        return this.master >= 0 ? this.characters[this.master] : null;
    }

    marrySlave(index) {
        // 清除所有角色的结婚标记（一夫一妻制）
        for (const ch of this.characters) {
            if (ch) ch.cflag[CFLAGS.LOVE_POINTS] = 0;
        }
        if (index < 0 || index === this.master) return true; // 仅解除婚约
        const c = this.getChara(index);
        if (!c) return false;
        c.cflag[CFLAGS.LOVE_POINTS] = 1;
        return true;
    }

    // ========== State switching ==========
    setState(newState, data = null) {
        this.prevState = this.state;
        this.state = newState;

        switch (newState) {
            case "TITLE":
                UI.renderTitle();
                break;
            case "FIRST":
                this.eventFirst();
                break;
            case "SHOP":
                this.eventShop();
                break;
            case "TRAIN":
                this.eventTrain(data);
                break;
            case "AFTERTRAIN":
                this.eventAfterTrain();
                break;
            case "ABLUP":
                UI.renderAblUp(this);
                break;
            case "TURNEND":
                this.eventTurnEnd();
                break;
            case "CONFIG":
                UI.renderConfig(this);
                break;
            case "SAVE":
                UI.renderSaveLoad(this, "save");
                break;
            case "LOAD":
                UI.renderSaveLoad(this, "load");
                break;
            case "MUSEUM":
                UI.renderMuseum(this);
                break;
        }
    }

    // ========== TITLE ==========
    eventFirst() {
        this.resetData();

        // Create Master (Player)
        const master = CharaTemplates.create(0);
        master.name = "魔王";
        master.callname = "魔王";
        master.talent[122] = 1; // 男性
        this.master = this.addCharaFromTemplate(master);

        // Initial slave: 莉莉 (template 24) - 固定开局
        const slave = CharaTemplates.create(24);
        if (slave) {
            slave.cflag[CFLAGS.CAPTURE_STATUS] = 1; // Captured status
            this.addCharaFromTemplate(slave);
        }

        this.money = 3000;
        this.day = 1;
        this.nextInvasionDay = 5 + RAND(3); // 首次入侵在第5-7天
        this.flag[500] = HERO_INVASION_CONFIG.defaultGenderRatio; // 勇者女性比例(默认90%)
        this.flag[501] = 2; // 日常事件数量 (默认2个

        // Opening story
        UI.appendText("━━━━━━━━━━━━━━━━━━━━━━━━\n");
        UI.appendText("　　【序章：魔王的觉醒】\n");
        UI.appendText("━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
        UI.appendText("在黑暗的王座之间，沉睡了千年的魔王缓缓睁开了双眼。\n");
        UI.appendText("腐朽的城堡重新升腾起魔力的雾气，魔族的眷属们从石棺中苏醒。\n\n");
        UI.appendText("『吾主，欢迎归来。』\n");
        UI.appendText("忠诚的臣仆跪伏在地，向新生的魔王献上敬意。\n\n");
        UI.appendText("然而，久远的沉睡让魔王的魔力几近枯竭。\n");
        UI.appendText("想要恢复昔日的力量，就需要“养分”——人类的欲望与快感的结晶。\n\n");
        UI.appendText("『去，为吾主抓来合适的猎物。』\n\n");
        UI.appendText("魔族的爪牙潜入夜色之中。\n");
        UI.appendText("它们的目标是边境村庄里，那个传闻中纯洁而倔强的乡下少女……\n\n");
        UI.appendText("━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
        UI.appendText("【莉莉】成为了你的奴隶。\n");
        UI.appendText("这位来自边境村落的少女，眼中还燃烧着不屈的火焰。\n");
        UI.appendText("她的身体与心灵，都将成为你恢复魔力的源泉。\n\n");
        UI.appendText("调教，现在开始。\n");
        UI.waitClick(() => this.setState("SHOP"));
    }

    resetData() {
        this.characters = [];
        this.target = -1;
        this.assi = -1;
        this.master = -1;
        this.flag.fill(0);
        this.item.fill(0);
        this.money = 0;
        this.day = 1;
        this.time = 0;
        this.selectcom = -1;
        this.trainCount = 0;
        this.tflag.fill(0);
        this.masterExp = 0;
        this.commandFilter = 0;
        // SLG reset
        this.facility.fill(0);
        this.strategies = [];
        this.prisoners = [];
        this.invaders = [];
        this.dungeonDepth = 1;
        this.nextInvasionDay = 0;
        this._slaveMarketCandidates = null;
        this.museum = { specimens: [], items: [] };
    }

    // ========== SHOP ==========
    eventShop() {
        this.target = -1;
        this.assi = -1;
        UI.renderShop(this);
    }

    shopAction(action, data = null) {
        switch (action) {
            case "select_target":
                this.target = data;
                if (this.assi === this.target) this.assi = -1;
                this.setState("TRAIN", { target: this.target });
                break;
            case "select_assi":
                this.assi = data;
                if (this.assi === this.target) this.assi = -1;
                UI.renderShop(this);
                break;
            case "chara_info":
                UI.renderCharaList(this);
                break;
            case "merged_shop":
                UI.renderMergedShop(this);
                break;
            case "slave_market":
                UI.renderSlaveMarket(this);
                break;
            case "mystery_upgrade":
                UI.renderMysteryUpgrade(this);
                break;
            case "dispose":
                UI.renderDisposeList(this);
                break;
            case "rest":
                this.setState("TURNEND");
                break;
            case "config":
                this.setState("CONFIG");
                break;
            case "save":
                this.setState("SAVE");
                break;
            case "load":
                this.setState("LOAD");
                break;
            case "museum":
                this.setState("MUSEUM");
                break;
        }
    }

    // ========== TRAIN ==========
    eventTrain(data) {
        const target = this.getTarget();
        if (!target) {
            this.setState("SHOP");
            return;
        }

        // Init training state
        target.resetForTrain();
        this.trainCount = 0;
        this.selectcom = -1;
        this.tflag.fill(0);

        // Train start dialogue
        this.dialogueSystem.onTrainStart(target);

        UI.renderTrain(this);
    }

    selectCommand(comId) {
        this.selectcom = comId;
        this.trainSystem.execute(comId);
        this.trainCount++;

        // Check if target HP depleted
        const target = this.getTarget();
        if (target && target.hp <= 0) {
            UI.appendText(`\n【{target.name}昏了过去……】\n`);
            UI.waitClick(() => this.setState("AFTERTRAIN"));
            return;
        }

        // 继续显示训练界面
        UI.renderTrain(this);
    }

    endTrain() {
        this.setState("AFTERTRAIN");
    }

    // ========== AFTERTRAIN ==========
    eventAfterTrain() {
        const target = this.getTarget();
        if (target) {
            // train end dialogue
            this.dialogueSystem.onTrainEnd(target);
            target.endTrain();
        }
        UI.renderAfterTrain(this);
    }

    // ========== ABLUP ==========
    doAblUp(ablId) {
        const target = this.getTarget();
        if (!target) return false;
        if (target.doAblUp(ablId)) {
            UI.showToast(`${ABL_DEFS[ablId]?.name || ablId} 升级了！`, "success");
            return true;
        }
        return false;
    }

    finishAblUp() {
        this.setState("TURNEND");
    }

    // ========== TURNEND ==========
    eventTurnEnd() {
        // Day end settlement (包含天数推进、事件触发等)
        this.dayEndSystem.process();
        if (this.time < 3) {
            this.time++;
        } else {
            this.time = 0;
        }

        // 自动回到主界面，不再等待点击
        this.setState("SHOP");
    }

    // ========== 存档 ==========
    saveGame(slot) {
        const data = {
            flag: [...this.flag],
            item: [...this.item],
            money: this.money,
            day: this.day,
            time: this.time,
            characters: this.characters.map(c => c.serialize()),
            target: this.target,
            assi: this.assi,
            master: this.master,
            commandFilter: this.commandFilter,
            masterExp: this.masterExp,
            // SLG data
            facility: [...this.facility],
            strategies: [...this.strategies],
            prisoners: this.prisoners.map(c => c.serialize()),
            invaders: this.invaders.map(c => c.serialize()),
            dungeonDepth: this.dungeonDepth,
            nextInvasionDay: this.nextInvasionDay,
            museum: JSON.parse(JSON.stringify(this.museum))
        };
        this.saveManager.save(slot, data);
        UI.showToast(`已保存到档位 ${slot}`);
    }

    loadGame(slot) {
        const data = this.saveManager.load(slot);
        if (!data) {
            UI.showToast("存档为空！", "danger");
            return false;
        }
        this.flag = [...data.flag];
        this.item = [...data.item];
        this.money = data.money;
        this.day = data.day;
        this.time = data.time;
        this.characters = data.characters.map(c => Character.deserialize(c));
        this.target = data.target;
        this.assi = data.assi;
        this.master = data.master;
        this.commandFilter = data.commandFilter || 0;
        this.masterExp = data.masterExp || 0;
        // SLG data
        this.facility = [...(data.facility || new Array(20).fill(0))];
        this.strategies = [...(data.strategies || [])];
        this.prisoners = (data.prisoners || []).map(c => Character.deserialize(c));
        this.invaders = (data.invaders || []).map(c => Character.deserialize(c));
        this.dungeonDepth = data.dungeonDepth || 1;
        this.nextInvasionDay = data.nextInvasionDay || 0;
        this.museum = data.museum || { specimens: [], items: [] };
        UI.showToast("读档成功！");
        this.setState("SHOP");
        return true;
    }

    // ========== 奴隶市场 ==========
    buyRandomSlave(index) {
        if (!this._slaveMarketCandidates || !this._slaveMarketCandidates[index]) return;
        const { slave, price } = this._slaveMarketCandidates[index];
        if (this.money < price) {
            UI.showToast("金钱不足！", "danger");
            return;
        }
        this.money -= price;
        slave.cflag[CFLAGS.CAPTURE_STATUS] = 1;
        this.addCharaFromTemplate(slave);
        UI.showToast(`购买了【{slave.name}】！`);
        // 从候选列表移除
        this._slaveMarketCandidates.splice(index, 1);
        UI.renderSlaveMarket(this);
    }

    refreshSlaveMarket() {
        if (this.money < 500) {
            UI.showToast("金钱不足！", "danger");
            return;
        }
        this.money -= 500;
        this._slaveMarketCandidates = null;
        UI.showToast("已刷新奴隶市场商品");
        UI.renderSlaveMarket(this);
    }

    // ========== 肉体改造==========
    bodyModifyLevelUp(index) {
        const c = this.getChara(index);
        if (!c) return { success: false, msg: '角色不存在' };
        if (this.money < 10000) return { success: false, msg: '金钱不足！需要10000G' };
        this.money -= 10000;
        c.level += 1;
        c.cflag[CFLAGS.BASE_HP] = c.level;
        // 提升基础属性        c.maxHp = Math.floor(c.maxHp * 1.1);
        c.hp = c.maxHp;
        c.maxMp = Math.floor(c.maxMp * 1.05);
        c.mp = c.maxMp;
        c.atk += 5;
        c.def += 3;
        return { success: true, msg: `${c.name} 接受改造后升到Lv.${c.level}！` };
    }

    bodyModifyLactation(index) {
        const c = this.getChara(index);
        if (!c) return { success: false, msg: '角色不存在' };
        if (c.talent[130]) return { success: false, msg: `${c.name} 已经是母乳体质了` };
        c.talent[130] = 1;
        // 胸围变大一个size
        const breastOrder = [116, 109, 110, 114]; // 绝壁→贫乳→巨乳→爆乳
        let currentIdx = -1;
        for (let i = 0; i < breastOrder.length; i++) {
            if (c.talent[breastOrder[i]]) {
                currentIdx = i;
                break;
            }
        }
        if (currentIdx >= 0 && currentIdx < breastOrder.length - 1) {
            c.talent[breastOrder[currentIdx]] = 0;
            c.talent[breastOrder[currentIdx + 1]] = 1;
        } else if (currentIdx === -1) {
            // 没有任何胸部特质，默认给巨乳
            c.talent[110] = 1;
        }
        // 如果是男性则清除男性特质（扶她化）
        if (c.talent[122]) {
            c.talent[122] = 0;
            c.talent[121] = 1; // 变为扶她
        }
        return { success: true, msg: `${c.name} 的乳腺被改造激活，开始泌乳。胸部变得更加丰满了……` };
    }

    // ========== 设施与地下城系统 ==========
    getFacilityLevel(id) {
        return this.facility[id] || 0;
    }

    canBuildFacility(id) {
        const def = FACILITY_DEFS[id];
        if (!def) return { ok: false, reason: "设施不存在" };
        const curLv = this.getFacilityLevel(id);
        if (curLv >= def.maxLv) return { ok: false, reason: "已达最高等级" };
        const cost = def.cost[curLv];
        if (this.money < cost) return { ok: false, reason: `需要${cost}G` };
        return { ok: true, cost: cost, nextLv: curLv + 1 };
    }

    buildFacility(id) {
        const check = this.canBuildFacility(id);
        if (!check.ok) {
            UI.showToast(check.reason, "danger");
            return false;
        }
        this.money -= check.cost;
        this.facility[id] = check.nextLv;
        const def = FACILITY_DEFS[id];
        UI.showToast(`【${def.name}】升级到 Lv.${check.nextLv}！${def.effects[check.nextLv - 1]}`);
        return true;
    }

    getFacilityIncome() {
        return this.getDailyIncome();
    }

    // 魔王每日领地收入：根据地下城各层等级计算
    getDailyIncome() {
        let income = 0;
        const floorBonus = [1000, 2000, 3000, 5000]; // Lv0,1,2,3
        for (let fid = 1; fid <= 10; fid++) {
            const lv = this.getFloorLevel(fid);
            income += floorBonus[lv] || 0;
        }
        // 俘虏勇者每日上交金币（基于新物价体系）
        for (const p of this.prisoners) {
            income += Math.floor(p.level * p.level + p.gold * 0.05);
            p.gold = Math.floor(p.gold * 0.95); // 上交5%持有金
}
        return income;
    }

    // ========== 收藏馆系统==========

    // 将角色制作成标本加入收藏馆
    addSpecimen(chara, method) {
        const specimen = {
            id: Date.now() + RAND(100000),
            name: chara.name,
            level: chara.level,
            job: this._getJobNameForSpecimen(chara),
            personality: chara.getPersonalityName ? chara.getPersonalityName() : '未知',
            gender: chara.talent[122] ? '男' : '女',
            talentSnapshot: this._snapshotTalents(chara),
            markSnapshot: [...chara.mark],
            method: method,
            description: this._generateSpecimenDesc(chara, method),
            day: this.day,
            hp: chara.maxHp,
            mp: chara.maxMp,
            atk: chara.atk,
            def: chara.def
        };
        this.museum.specimens.push(specimen);
        return specimen;
    }

    _getJobNameForSpecimen(c) {
        for (let i = 200; i <= 210; i++) {
            if (c.talent[i] && TALENT_DEFS[i]) return TALENT_DEFS[i].name;
        }
        return '无职业';
    }

    _snapshotTalents(chara) {
        const keyTalents = [];
        const important = [0,1,10,11,12,13,14,15,30,31,32,40,41,42,50,60,70,71,74,75,76,77,78,80,81,82,83,85,88,89,91,92,93,99,100,109,110,114,116,121,122,130,153,157,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,179];
        for (const tid of important) {
            if (chara.talent[tid] && TALENT_DEFS[tid]) {
                keyTalents.push(TALENT_DEFS[tid].name);
            }
        }
        return keyTalents.slice(0, 8);
    }

    _generateSpecimenDesc(chara, method) {
        const descs = {
            specimen: `${chara.name}的遗体被魔王的炼金术士精心处理。肌肤被注入了防腐魔药，保持着生前最后的表情——那是混杂着恐惧与屈辱的神情。双眼被换成了宝石，在黑暗中依然倒映着魔王城的烛火。她的身体被摆成跪伏的姿态，仿佛仍在向魔王献上永恒的臣服。旁边的铭牌记载着她生前的等级与罪状：「入侵魔王城，下场如此。」`
        };
        return descs[method] || descs.specimen;
    }

    // 将物品加入收藏馆
    addMuseumItem(gear, sourceName) {
        if (!gear) return false;
        this.museum.items.push({
            id: Date.now() + RAND(100000),
            gear: JSON.parse(JSON.stringify(gear)),
            source: sourceName || '未知来源',
            day: this.day
        });
        return true;
    }

    // 没收角色身上的一件装备道具
    confiscateGear(charaIndex, slot, windex) {
        const c = this.getChara(charaIndex);
        if (!c || !c.gear) return { success: false, msg: '角色不存在' };
        let removed = null;
        if (slot === 'weapon' && c.gear.weapons && c.gear.weapons[windex]) {
            removed = c.gear.weapons[windex];
            c.gear.weapons.splice(windex, 1);
        } else if (slot === 'item' && c.gear.items && c.gear.items[windex]) {
            removed = c.gear.items[windex];
            c.gear.items.splice(windex, 1);
        } else if (c.gear[slot]) {
            removed = c.gear[slot];
            c.gear[slot] = null;
        }
        if (!removed) return { success: false, msg: '没有可没收的物品' };
        this.addMuseumItem(removed, `没收【{c.name}`);
        return { success: true, gear: removed, msg: `没收了【${removed.name}` };
    }

    // 将收藏馆物品赠与角色
    giftMuseumItemToChara(itemIndex, charaIndex) {
        const item = this.museum.items[itemIndex];
        if (!item) return { success: false, msg: '物品不存在' };
        const c = this.getChara(charaIndex);
        if (!c) return { success: false, msg: '角色不存在' };
        const r = GearSystem.equipItem(c, item.gear, true);
        if (r.success) {
            this.museum.items.splice(itemIndex, 1);
        }
        return r;
    }

    // 卖出收藏馆物品
    sellMuseumItem(index) {
        const item = this.museum.items[index];
        if (!item) return 0;
        const price = this._calcGearPrice(item.gear);
        this.money += price;
        this.museum.items.splice(index, 1);
        return price;
    }

    // 扔掉收藏馆物品
    discardMuseumItem(index) {
        if (index < 0 || index >= this.museum.items.length) return false;
        this.museum.items.splice(index, 1);
        return true;
    }

    getMaxPrisoners() {
        const prisonLv = this.getFacilityLevel(6);
        if (prisonLv >= 3) return 8;
        if (prisonLv >= 2) return 4;
        if (prisonLv >= 1) return 2;
        return 0;
    }

    canBuyStrategy(id) {
        const def = STRATEGY_DEFS[id];
        if (!def) return { ok: false, reason: "策略不存在" };
        if (this.strategies.includes(id)) return { ok: false, reason: "已拥有该策略" };
        // 检查设施解锁
        if (def.unlockFacilityLv) {
            for (const [fid, minLv] of Object.entries(def.unlockFacilityLv)) {
                if (this.getFacilityLevel(parseInt(fid)) < minLv) {
                    const fdef = FACILITY_DEFS[fid];
                    return { ok: false, reason: `需要先建造【{fdef?.name || '设施'}】Lv.${minLv}` };
                }
            }
        }
        if (this.money < def.price) return { ok: false, reason: `需要${def.price}G` };
        return { ok: true, price: def.price };
    }

    buyStrategy(id) {
        const check = this.canBuyStrategy(id);
        if (!check.ok) {
            UI.showToast(check.reason, "danger");
            return false;
        }
        const def = STRATEGY_DEFS[id];
        this.money -= def.price;
        this.strategies.push(id);
        UI.showToast(`习得御敌策略【{def.name}】！`);
        return true;
    }

    // ========== 地下城层管理 ==========
    getFloorLevel(floorId) {
        // floorLevel存储在flag中 flag[200 + floorId] = level
        return this.flag[200 + floorId] || 0;
    }

    canUpgradeFloor(floorId) {
        const def = DUNGEON_FLOOR_DEFS[floorId];
        if (!def) return { ok: false, reason: "层不存在" };
        const curLv = this.getFloorLevel(floorId);
        if (curLv >= 3) return { ok: false, reason: "已达最高等级Lv.3" };
        const cost = def.upgradeCost[curLv];
        if (this.money < cost) return { ok: false, reason: `需要${cost}G` };
        return { ok: true, cost: cost, nextLv: curLv + 1 };
    }

    upgradeFloor(floorId) {
        const check = this.canUpgradeFloor(floorId);
        if (!check.ok) {
            UI.showToast(check.reason, "danger");
            return false;
        }
        this.money -= check.cost;
        this.flag[200 + floorId] = check.nextLv;
        const def = DUNGEON_FLOOR_DEFS[floorId];
        const up = def.upgrades[check.nextLv - 1];
        UI.showToast(`【{def.name}】升到Lv.${check.nextLv}【{up.description}`);
        return true;
    }

    getDungeonMaxDepth() {
        // 解锁深度由设施等级决定，默认1层
        let max = 1;
        if (this.getFacilityLevel(3) >= 1) max = 3;  // 肉体改造室解锁深层
        if (this.getFacilityLevel(3) >= 2) max = 5;
        if (this.getFacilityLevel(3) >= 3) max = 7;
        if (this.getFacilityLevel(3) >= 4) max = 10;
        return max;
    }

    // 获取勇者当前所在层（入侵时从第1层开始）
    getHeroFloor(hero) {
        return hero.cflag[CFLAGS.HERO_FLOOR] || 1;
    }

    // 获取勇者当前层内进度(0-100)
    getHeroProgress(hero) {
        return hero.cflag[CFLAGS.HERO_PROGRESS] || 0;
    }

    // 计算策略对勇者速度的影响
    _getStrategySpeedMod(sdef) {
        const effect = sdef.effect;
        const val = sdef.value || 0;
        let speed = 0, hpDmg = 0, mpDmg = 0;
        switch (effect) {
            case 'damage':   speed = -2; hpDmg = val; break;
            case 'fire':     speed = -2; hpDmg = val; break;
            case 'shoot':    speed = -3; hpDmg = val; break;
            case 'teleport': speed = -5; break;
            case 'confuse':  speed = -3; mpDmg = Math.floor(val * 0.5); break;
            case 'darkness': speed = -2; hpDmg = Math.floor(val * 0.7); break;
            case 'net':      speed = -3; hpDmg = val; break;
            case 'stun':     speed = -4; hpDmg = val; break;
            case 'lust':     speed = -1; mpDmg = Math.floor(val * 0.5); break;
            case 'charm':    speed = -2; hpDmg = Math.floor(val * 0.3); mpDmg = Math.floor(val * 0.5); break;
            case 'hypnotize':speed = -4; mpDmg = val; break;
            case 'weaken_def':case 'weaken_atk':case 'weaken_mag': speed = -1; break;
            case 'debuff':   speed = -3; hpDmg = Math.floor(val * 0.8); mpDmg = Math.floor(val * 0.5); break;
            case 'oil':      speed = -2; break;
            case 'summon':   speed = -3; hpDmg = Math.floor(val * 0.7); break;
            case 'curse':    speed = -3; hpDmg = val; mpDmg = val; break;
            case 'worm':     speed = -2; hpDmg = Math.floor(val * 0.8); mpDmg = Math.floor(val * 0.6); break;
            case 'gem':      speed = -1; break;
            case 'merchant': speed = 0; break;
            case 'illusion': speed = -4; hpDmg = Math.floor(val * 0.8); mpDmg = val; break;
            case 'terror':   speed = -5; hpDmg = val; mpDmg = val; break;
            case 'break':    speed = -6; hpDmg = val; mpDmg = val; break;
            case 'slime':    speed = -2; hpDmg = val; break;
            case 'mimic':    speed = -3; hpDmg = Math.floor(val * 0.7); mpDmg = Math.floor(val * 0.5); break;
        }
        return { speed, hpDmg, mpDmg };
    }

    // 计算勇者主动撤退概率（根据状态和性格）
    _calcRetreatChance(hero, hpPct, mpPct) {
        let chance = 0;
        if (hpPct < 0.15) chance += 40;
        else if (hpPct < 0.3) chance += 25;
        if (mpPct < 0.1) chance += 30;
        else if (mpPct < 0.2) chance += 15;
        if (hero.talent[12]) chance += 20;
        else if (hero.talent[10]) chance += 10;
        else if (hero.talent[11]) chance -= 15;
        else if (hero.talent[14]) chance -= 10;
        else if (hero.talent[16]) chance -= 10;
        else if (hero.talent[18]) chance -= 15;
        return Math.max(0, Math.min(90, chance));
    }

    // 勇者每日层内移动（新规则：基础+5%，可往回走）
    moveHeroDaily(hero) {
        const floorId = this.getHeroFloor(hero);
        if (floorId > 10) {
            return { action: 'reach_throne', hero, message: '勇者到达魔王宫殿！' };
        }

        let progress = this.getHeroProgress(hero);
        const floorLv = this.getFloorLevel(floorId);

        // 基础侵略进度：随等级上升： 【50【0% 【200【0%
        let moveSpeed;
        if (hero.level <= 50) {
            moveSpeed = 5 + Math.floor((hero.level - 1) * 25 / 49);
        } else {
            moveSpeed = 30 + Math.floor((hero.level - 50) * 30 / 150);
        }

        // 层升级减缓
        if (floorLv >= 1) moveSpeed -= 1;
        if (floorLv >= 2) moveSpeed -= 1;
        if (floorLv >= 3) moveSpeed -= 1;

        // 高层地下城额外减缓侵略度（第6层起）
        if (floorId >= 6) {
            moveSpeed -= (floorId - 5); // 6层1%, 7层2%, 8层3%, 9层4%, 10层5%
        }

        // 探索当前层，触发事件/策略/环境效果
        const explore = this.exploreFloor(hero);

        // 应用策略/事件造成的速度和伤害        moveSpeed += explore.speedMod;
        if (explore.hpDmg > 0) {
            hero.hp = Math.max(0, hero.hp - explore.hpDmg);
        }
        if (explore.mpDmg > 0) {
            hero.mp = Math.max(0, hero.mp - explore.mpDmg);
        }

        // 检查状态，判断是否主动撤退
        const hpPct = hero.maxHp > 0 ? hero.hp / hero.maxHp : 1;
        const mpPct = hero.maxMp > 0 ? hero.mp / hero.maxMp : 1;

        // 如果被击败，进行逃跑判定
        if (explore.results._defeated) {
            const captureResult = this._processCapture(hero, explore.results._monster);

            if (captureResult.type === 'escape') {
                // 逃跑成功：侵略度-50%，不足则回上一层0%
                if (progress >= 50) {
                    hero.cflag[CFLAGS.HERO_PROGRESS] = progress - 50;
                    // 恢复少量状态以便继续入侵                    hero.hp = Math.max(1, Math.floor(hero.maxHp * 0.15));
                    hero.mp = Math.max(1, Math.floor(hero.maxMp * 0.1));
                    return { action: 'defeat_escape', hero, results: explore.results, captureResult, moveSpeed: -50 };
                } else if (floorId > 1) {
                    hero.cflag[CFLAGS.HERO_FLOOR] = floorId - 1;
                    hero.cflag[CFLAGS.HERO_PROGRESS] = 50;
                    hero.hp = Math.max(1, Math.floor(hero.maxHp * 0.15));
                    hero.mp = Math.max(1, Math.floor(hero.maxMp * 0.1));
                    return { action: 'defeat_escape', hero, floor: floorId - 1, results: explore.results, captureResult, moveSpeed: -100 };
                } else {
                    // 第一层且进度<50%，只能回小镇
                    return { action: 'retreat_to_town', hero, results: explore.results, captureResult, moveSpeed: -100 };
                }
            }

            // 逃跑失败：俘虏投降/入狱
            return { action: 'captured', hero, monster: explore.results._monster, captureResult, results: explore.results, moveSpeed: -100 };
        }

        const retreatChance = this._calcRetreatChance(hero, hpPct, mpPct);
        if (retreatChance > 0 && RAND(100) < retreatChance) {
            moveSpeed = -5; // 主动往回走
        }

        // 检查进度宝箱（在更新进度前记录旧进度）
        const oldProgress = this.getHeroProgress(hero);
        const chestEvents = this._checkProgressChests(hero, oldProgress, oldProgress + moveSpeed, floorId);
        if (chestEvents.length > 0) {
            explore.results.chests = chestEvents;
        }

        // 更新进度
        progress += moveSpeed;

        // 处理边界情况
        if (progress >= 100) {
            hero.cflag[CFLAGS.HERO_FLOOR] = floorId + 1;
            hero.cflag[CFLAGS.HERO_PROGRESS] = 0;
            hero.cflag[503] = 0; // 重置新楼层宝箱标记
            return { action: 'next_floor', hero, floor: floorId + 1, results: explore.results, moveSpeed };
        } else if (progress <= 0) {
            if (floorId <= 1) {
                return { action: 'retreat_to_town', hero, results: explore.results, moveSpeed };
            } else {
                hero.cflag[CFLAGS.HERO_FLOOR] = floorId - 1;
                hero.cflag[CFLAGS.HERO_PROGRESS] = 80;
                return { action: 'prev_floor', hero, floor: floorId - 1, results: explore.results, moveSpeed };
            }
        } else {
            hero.cflag[CFLAGS.HERO_PROGRESS] = progress;
            return { action: 'move', hero, progress, results: explore.results, moveSpeed };
        }
    }

    // 检查进度宝箱：25%/50%/75%高级宝箱，100%传说宝箱
    _checkProgressChests(hero, oldProgress, newProgress, floorId) {
        const events = [];
        // 勇者用 cflag[503]，奴隶/前勇者用 cflag[CFLAGS.DESIRE]
        const flagSlot = hero.talent[200] ? 704 : 503;
        const mask = hero.cflag[flagSlot] || 0;
        const thresholds = [
            { pct: 25, bit: 1, type: 'advanced' },
            { pct: 50, bit: 2, type: 'advanced' },
            { pct: 75, bit: 4, type: 'advanced' },
            { pct: 100, bit: 8, type: 'legendary' }
        ];
        for (const t of thresholds) {
            if ((mask & t.bit) !== 0) continue; // 已开启            // 前勇者无法打开关底(100%)传说宝箱
            if (hero.talent[200] && t.pct === 100) continue;
            // 检查是否经过了该阈值
            const crossed = (oldProgress < t.pct && newProgress >= t.pct) || (oldProgress > t.pct && newProgress <= t.pct);
            if (!crossed) continue;
            hero.cflag[flagSlot] = (hero.cflag[flagSlot] || 0) | t.bit;
            // 宝箱金币奖励（新平衡：与楼层²挂钩）
            const goldBase = t.type === 'legendary' ? 500 : 100;
            const goldGain = Math.floor(goldBase * floorId * floorId);
            hero.gold += goldGain;
            const item = this._generateChestLoot(hero.level, t.type, hero, floorId);
            let equipResult = null;
            if (item) {
                const r = GearSystem.equipItem(hero, item);
                equipResult = r;
                events.push({
                    type: t.type,
                    threshold: t.pct,
                    item: GearSystem.getGearDesc(item),
                    success: r.success,
                    msg: r.msg,
                    curseTriggered: r.curseTriggered,
                    gold: goldGain
                });
            } else {
                events.push({
                    type: t.type,
                    threshold: t.pct,
                    item: null,
                    success: false,
                    msg: `获得【{goldGain}G`,
                    curseTriggered: false,
                    gold: goldGain
                });
            }
        }
        return events;
    }

    // 生成宝箱物品（根据楼层限制品质）
    _generateChestLoot(level, chestType, hero, floorId) {
        // 楼层品质限制
        let maxRarity = 5; // 默认无限制
        let minRarity = 0;
        let legendaryRarity = 2; // 默认传说宝箱最低绿色
        if (floorId <= 3) {
            maxRarity = 2; // 最多绿色            legendaryRarity = 3; // 关底蓝色
        } else if (floorId <= 6) {
            maxRarity = 3; // 最多蓝色            legendaryRarity = 4; // 关底紫色
        } else if (floorId <= 9) {
            maxRarity = 4; // 最多紫色            legendaryRarity = 5; // 关底橙色
        } else {
            maxRarity = 5; // 10层：紫色到橙色            legendaryRarity = 5; // 关底橙色
            minRarity = 4; // 10层高级宝箱最低紫色
}

        const roll = Math.random();
        // 小概率出特殊物品
        if (roll < 0.02) {
            return GearSystem.generateSpecialItem('cleanse_potion', level, chestType === 'legendary');
        }
        if (roll < 0.03) {
            return GearSystem.generateSpecialItem('supreme_ring', level, chestType === 'legendary');
        }
        // 普通物品
        if (chestType === 'legendary') {
            // 传说宝箱：无诅咒，品质由楼层决定
            const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
            const itypes = ['heal', 'mana', 'buff'];
            const kind = Math.random() < 0.5 ? 'gear' : 'item';
            if (kind === 'gear') {
                const slot = slotTypes[RAND(slotTypes.length)];
                return GearSystem.generateGear(slot, level, legendaryRarity);
            } else {
                return GearSystem.generateItem(itypes[RAND(itypes.length)], level, legendaryRarity);
            }
        } else {
            // 高级宝箱：可能诅咒，品质受楼层限制
            const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
            const itypes = ['heal', 'mana', 'buff', 'cleanse'];
            const kind = Math.random() < 0.6 ? 'gear' : 'item';
            if (kind === 'gear') {
                const slot = slotTypes[RAND(slotTypes.length)];
                const r = GearSystem._rollRarityCapped(maxRarity, minRarity);
                return GearSystem.generateGear(slot, level, r);
            } else {
                const r = GearSystem._rollRarityCapped(maxRarity, minRarity);
                return GearSystem.generateItem(itypes[RAND(itypes.length)], level, r);
            }
        }
    }

    // 处理勇者探索一层（触发事件，返回数值效果）
    exploreFloor(hero) {
        const floorId = this.getHeroFloor(hero);
        const floorDef = DUNGEON_FLOOR_DEFS[floorId];
        const floorLv = this.getFloorLevel(floorId);
        const results = [];
        let speedMod = 0;
        let hpDmg = 0;
        let mpDmg = 0;

        // 1. 层环境效果
        if (floorLv >= 1) {
            const up = floorDef.upgrades[0];
            results.push({ type: "env", name: up.name, description: up.description });
            speedMod -= 1;
        }

        // 2. 触发御敌策略（如果有）
        if (this.strategies.length > 0) {
            const sid = this.strategies[RAND(this.strategies.length)];
            const sdef = STRATEGY_DEFS[sid];
            results.push({ type: "strategy", name: sdef.name, description: sdef.description, icon: sdef.icon });
            const mod = this._getStrategySpeedMod(sdef);
            speedMod += mod.speed;
            hpDmg += mod.hpDmg;
            mpDmg += mod.mpDmg;
        }

        // 3. 随机事件或遇敌(60%事件【0%遇敌)
        const roll = RAND(100);
        if (roll < 40) {
            // 遇敌战斗
            const monsters = FLOOR_MONSTER_DEFS[floorId];
            if (monsters && monsters.length > 0) {
                const monster = monsters[RAND(monsters.length)];

                // 检查是否属于小队
                const squadId = hero.cflag[CFLAGS.SQUAD_ID];
                if (squadId && hero.cflag[CFLAGS.SQUAD_LEADER] !== 1) {
                    // 小队成员但不是队长，跳过战斗（由队长统一处理）                    // 什么都不做，队长的结果会统一记录
                } else if (squadId && hero.cflag[CFLAGS.SQUAD_LEADER] === 1) {
                    // 队长：触发小队战斗
                    const squad = this.invaders.filter(h => h.cflag[CFLAGS.SQUAD_ID] === squadId);
                    const combat = this._doSquadCombat(squad, monster);
                    results.push({
                        type: "scombat",
                        name: `小队遭遇${monster.name}`,
                        description: `${monster.icon} ${monster.description}`,
                        icon: "👥",
                        combatLog: combat.combatLog,
                        victory: combat.victory,
                        defeated: combat.defeated
                    });
                    // 标记所有成员已战斗
                    for (const member of squad) {
                        member.cflag[902] = 1;
                    }
                    if (combat.victory) {
                        speedMod -= 1;
                        for (const member of squad) {
                            if (member.hp > 0) {
                                member.hp = Math.min(member.maxHp, member.hp + Math.floor(member.maxHp * 0.03));
                                member.mp = Math.min(member.maxMp, member.mp + Math.floor(member.maxMp * 0.03));
                            }
                        }
                    } else if (combat.defeated) {
                        speedMod = -20;
                        for (const member of squad) {
                            member.hp = Math.max(1, member.hp);
                        }
                        results._defeated = true;
                        results._monster = monster;
                    } else {
                        speedMod -= 2;
                        hpDmg += Math.floor(monster.atk * 0.3);
                        mpDmg += Math.floor(monster.atk * 0.2);
                    }
                } else {
                    // 单人战斗
                    const combat = this._doCombat(hero, monster);
                    results.push({
                        type: "combat",
                        name: `遭遇${monster.name}`,
                        description: `${monster.icon} ${monster.description}`,
                        icon: monster.icon,
                        combatLog: combat.combatLog,
                        victory: combat.victory,
                        defeated: combat.defeated
                    });
                    if (combat.victory) {
                        speedMod -= 1;
                        hero.hp = Math.min(hero.maxHp, hero.hp + Math.floor(hero.maxHp * 0.03));
                        hero.mp = Math.min(hero.maxMp, hero.mp + Math.floor(hero.maxMp * 0.03));
                    } else if (combat.defeated) {
                        speedMod = -20;
                        hero.hp = 1;
                        results._defeated = true;
                        results._monster = monster;
                    } else {
                        speedMod -= 2;
                        hpDmg += Math.floor(monster.atk * 0.3);
                        mpDmg += Math.floor(monster.atk * 0.2);
                    }
                }
            }
        } else {
            // 随机事件
            const event = this.processDungeonEvent(hero);
            if (event) {
                results.push({ type: "event", name: event.name, description: event.description, icon: event.icon });
                if (event.type === 'damage' || event.type === 'combat') {
                    speedMod -= 2;
                    hpDmg += (event.value || 50);
                } else if (event.type === 'debuff') {
                    speedMod -= 2;
                } else if (event.type === 'heal') {
                    speedMod += 1;
                    hero.hp = Math.min(hero.maxHp, hero.hp + (event.value || 50));
                } else if (event.type === 'treasure') {
                    // 宝箱事件获得金币（新平衡）
                    const goldGain = Math.floor((event.value || 100) * floorId * floorId * 0.5);
                    hero.gold += goldGain;
                    results.push({ type: "gold", name: "发现财宝", description: `获得${goldGain}G`, icon: "💰", amount: goldGain });
                }
            }
            // 每层10%概率触发隐藏商店
            if (Math.random() < 0.10) {
                const shopResult = this._triggerHiddenShop(hero, floorId);
                if (shopResult) {
                    results.push(shopResult);
                }
            }
            // 5%概率触发奸商事件（与隐藏商店互斥，但如果都触发则优先显示奸商）
            if (Math.random() < 0.05) {
                const swindlerResult = this._triggerSwindler(hero, floorId);
                if (swindlerResult) {
                    results.push(swindlerResult);
                }
            }
        }

        // 4. 层负面效果（Lv2+）
        if (floorLv >= 2) {
            const up = floorDef.upgrades[1];
            results.push({ type: "trap", name: up.name, description: up.description });
            speedMod -= 1;
        }

        return { results, speedMod, hpDmg, mpDmg };
    }

    // ========== 隐藏商店系统 ==========
    _triggerHiddenShop(hero, floorId) {
        // 生成一件该层对应等级的物品
        const level = Math.max(1, floorId * 5 + RAND(5));
        const maxRarity = Math.min(5, Math.floor((floorId + 1) / 2));
        const minRarity = Math.max(0, Math.floor((floorId - 2) / 2));
        const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
        const itemTypes = ['heal', 'mana', 'buff', 'cleanse'];
        const kind = Math.random() < 0.5 ? 'gear' : 'item';
        let item;
        if (kind === 'gear') {
            const slot = slotTypes[RAND(slotTypes.length)];
            const r = GearSystem._rollRarityCapped(maxRarity, minRarity);
            item = GearSystem.generateGear(slot, level, r);
        } else {
            const r = GearSystem._rollRarityCapped(maxRarity, minRarity);
            item = GearSystem.generateItem(itemTypes[RAND(itemTypes.length)], level, r);
        }
        const basePrice = this._calcGearPrice(item);
        const shopPrice = basePrice * 10; // 隐藏商店售价为同类物品售价的10倍        // AI决定是否购买（有50%概率购买，如果金币足够）
        if (hero.gold >= shopPrice && Math.random() < 0.5) {
            hero.gold -= shopPrice;
            const r = GearSystem.equipItem(hero, item);
            return {
                type: "shop",
                name: "隐藏商店",
                description: `发现隐藏商店，花【{shopPrice}G购买【{item.name}【{r.success ? r.msg : '但无法携带）}`,
                icon: "🏪",
                item: item,
                price: shopPrice,
                bought: r.success
            };
        }
        return {
            type: "shop",
            name: "隐藏商店",
            description: `发现隐藏商店，有${item.name}出售【{shopPrice}G），【{hero.gold < shopPrice ? '金币不足' : '没有购买'}。`,
            icon: "🏪",
            item: item,
            price: shopPrice,
            bought: false
        };
    }

    // ========== 奸商系统 ==========
    _triggerSwindler(hero, floorId) {
        // 奸商卖出的物品必然带诅咒，必然比该层物品等级高一级
        const level = Math.max(1, floorId * 5 + RAND(5) + 5); // 高一级= 等级+5
        const maxRarity = Math.min(5, Math.floor((floorId + 2) / 2));
        const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
        const itemTypes = ['heal', 'mana', 'buff'];
        const kind = Math.random() < 0.5 ? 'gear' : 'item';
        let item;
        if (kind === 'gear') {
            const slot = slotTypes[RAND(slotTypes.length)];
            item = GearSystem.generateGear(slot, level, maxRarity);
        } else {
            item = GearSystem.generateItem(itemTypes[RAND(itemTypes.length)], level, maxRarity);
        }
        item.cursed = true; // 必然诅咒
        const basePrice = this._calcGearPrice(item);
        const buyPrice = basePrice * 2; // 奸商卖出价格（比正常贵）
        let resultDesc = `遇到了神秘的奸商，正在兜【{item.name}（诅咒）…`;
        // AI购买判定【0%概率购买
        let bought = false;
        if (hero.gold >= buyPrice && Math.random() < 0.3) {
            hero.gold -= buyPrice;
            const r = GearSystem.equipItem(hero, item);
            bought = r.success;
            resultDesc += `花费${buyPrice}G购买了它【{r.msg}`;
        } else {
            resultDesc += `没有购买。`;
        }
        // 奸商回收物品（价格减半）
        let sold = null;
        if (hero.gear && Math.random() < 0.4) {
            // 尝试卖出身上一件物品（优先道具，然后是最低价值的装备】
            const toSell = this._findWorstGearToSell(hero);
            if (toSell) {
                const sellPrice = Math.floor(this._calcGearPrice(toSell.gear) * 0.5);
                if (sellPrice > 0) {
                    hero.gold += sellPrice;
                    sold = { gear: toSell.gear, price: sellPrice };
                    // 移除物品
                    if (toSell.slot === 'weapon') {
                        hero.gear.weapons.splice(toSell.index, 1);
                    } else if (toSell.slot === 'item') {
                        hero.gear.items.splice(toSell.index, 1);
                    } else {
                        hero.gear[toSell.slot] = null;
                    }
                    resultDesc += ` 并将${toSell.gear.name}卖给了奸商（${sellPrice}G）。`;
                }
            }
        }
        return {
            type: "swindler",
            name: "奸商",
            description: resultDesc,
            icon: "🦊",
            item: item,
            price: buyPrice,
            bought: bought,
            sold: sold
        };
    }

    // 计算装备/道具的基础售价（新物价体系统    // 灰色10G / 白色100G / 绿色1000G / 蓝色10000G / 紫色100000G / 橙色1000000G
    // 武器×2，道具【.5，等级系数每【2%
    _calcGearPrice(gear) {
        if (!gear) return 0;
        const basePrices = [10, 100, 1000, 10000, 100000, 1000000];
        const base = basePrices[gear.rarity] || 10;
        const levelMult = 1 + (gear.level || 1) * 0.02;
        let price = Math.floor(base * levelMult);
        if (gear.type === 'weapon') {
            price *= 2; // 武器价格是防具的2【        } else if (gear.type === 'item') {
            price = Math.floor(price * 0.5); // 道具价格是防具的一【
}
        return price;
    }

    // 找到身上最差的可出售装】
    _findWorstGearToSell(c) {
        if (!c.gear) return null;
        let worst = null;
        let worstPrice = Infinity;
        // 检查道具栏
        if (c.gear.items) {
            for (let i = 0; i < c.gear.items.length; i++) {
                const price = this._calcGearPrice(c.gear.items[i]);
                if (price < worstPrice) {
                    worstPrice = price;
                    worst = { slot: 'item', index: i, gear: c.gear.items[i] };
                }
            }
        }
        // 检查装备槽
        const slots = ['head', 'body', 'legs', 'hands', 'neck', 'ring'];
        for (const s of slots) {
            const g = c.gear[s];
            if (!g) continue;
            const price = this._calcGearPrice(g);
            if (price < worstPrice) {
                worstPrice = price;
                worst = { slot: s, index: -1, gear: g };
            }
        }
        // 检查武】
        if (c.gear.weapons) {
            for (let i = 0; i < c.gear.weapons.length; i++) {
                const price = this._calcGearPrice(c.gear.weapons[i]);
                if (price < worstPrice) {
                    worstPrice = price;
                    worst = { slot: 'weapon', index: i, gear: c.gear.weapons[i] };
                }
            }
        }
        return worst;
    }

    // 回合制战斗：勇【vs 地下城怪物
    // 规则：根据敏捷决定出手顺序，攻击【防御【实际伤害，支持回【增益/特殊技】
    _doCombat(hero, monster) {
        let heroHp = hero.hp;
        let heroMp = hero.mp;
        let monHp = monster.hp;

        // 勇者装备加】
        const gBonus = GearSystem.applyGearBonus(hero, false);
        // 勇者基础属】
        const heroBaseAtk = (hero.cflag[CFLAGS.ATK] || 20) + (gBonus.atk || 0);
        const heroBaseDef = (hero.cflag[CFLAGS.DEF] || 15) + (gBonus.def || 0);
        const heroSpd = hero.cflag[CFLAGS.SPD] || 10 + hero.level * 2;

        // 战斗中的增益/减益状】
        let heroAtkMod = 0;
        let heroDefMod = 0;
        let heroBuffTurns = 0;
        let monAtkMod = 0;
        let monDefMod = 0;
        let monBuffTurns = 0;

        const getHeroAtk = () => Math.max(1, heroBaseAtk + heroAtkMod);
        const getHeroDef = () => Math.max(0, heroBaseDef + heroDefMod);
        const getMonAtk = () => Math.max(1, monster.atk + monAtkMod);
        const getMonDef = () => Math.max(0, monster.def + monDefMod);

        let rounds = 0;
        const maxRounds = 20;
        const combatLog = [];

        while (rounds < maxRounds && heroHp > 0 && monHp > 0) {
            rounds++;

            // 根据敏捷决定行动顺序
            const heroFirst = heroSpd >= monster.spd;
            const actors = heroFirst ? ['hero', 'monster'] : ['monster', 'hero'];

            for (const actor of actors) {
                if (heroHp <= 0 || monHp <= 0) break;

                if (actor === 'hero') {
                    // ===== 勇者AI决策 =====
                    const hpPct = heroHp / hero.maxHp;
                    const mpPct = heroMp / Math.max(1, hero.maxMp);
                    const needHeal = hpPct < 0.35 && heroMp >= 15;
                    const canBuff = heroMp >= 20 && heroBuffTurns <= 0 && RAND(100) < 20;

                    if (needHeal) {
                        // 回复魔法：消耗MP恢复HP
                        const healAmt = Math.floor(hero.level * 6 + heroBaseAtk * 0.3);
                        heroHp = Math.min(hero.maxHp, heroHp + healAmt);
                        heroMp -= 15;
                        combatLog.push(`【{rounds}回合] 勇者使用回复魔【【恢复${healAmt}HP (MP:${heroMp})`);
                    } else if (canBuff) {
                        // 增益魔法：攻击力提升20%，持【回合
                        heroAtkMod = Math.floor(heroBaseAtk * 0.2);
                        heroBuffTurns = 2;
                        heroMp -= 20;
                        combatLog.push(`【{rounds}回合] 勇者使用强化魔【💪 攻击【${heroAtkMod} (持续2回合)`);
                    } else {
                        // 普通攻击：攻击【- 怪物防御】
                        const dmg = Math.max(1, getHeroAtk() - getMonDef());
                        monHp -= dmg;
                        combatLog.push(`【{rounds}回合] 勇者攻【⚔️ 造成${dmg}伤害 (怪物HP:${Math.max(0,monHp)})`);
                    }
                } else {
                    // ===== 怪物AI决策（根据属性分类）=====
                    const aiType = this._getMonsterAIType(monster);
                    const monHpPct = monHp / monster.hp;
                    const roll = RAND(100);

                    if (aiType === 'attack') {
                        // 攻击型：高输】
                        if (roll < 50) {
                            // 猛击【.5倍伤】
                            const rawDmg = Math.floor(getMonAtk() * 1.5);
                            const dmg = Math.max(1, rawDmg - getHeroDef());
                            heroHp -= dmg;
                            combatLog.push(`【{rounds}回合] ${monster.name}猛击 💢 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                        } else if (roll < 80) {
                            // 普通攻】
                            const dmg = Math.max(1, getMonAtk() - getHeroDef());
                            heroHp -= dmg;
                            combatLog.push(`【{rounds}回合] ${monster.name}攻击 🗡️，造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                        } else if (roll < 95 && monBuffTurns <= 0) {
                            // 蓄力：下回合atk+30%
                            monAtkMod = Math.floor(monster.atk * 0.3);
                            monBuffTurns = 1;
                            combatLog.push(`【{rounds}回合] ${monster.name}正在蓄力 【下回合攻击力大幅提升`);
                        } else {
                            // 防御
                            combatLog.push(`【{rounds}回合] ${monster.name}采取防御姿【🛡️`);
                        }
                    } else if (aiType === 'defense') {
                        // 防御型：高生】
                        if (roll < 40) {
                            const dmg = Math.max(1, getMonAtk() - getHeroDef());
                            heroHp -= dmg;
                            combatLog.push(`【{rounds}回合] ${monster.name}攻击 🗡️，造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                        } else if (roll < 75 && monBuffTurns <= 0) {
                            // 铁壁：防【30%
                            monDefMod = Math.floor(monster.def * 0.3);
                            monBuffTurns = 2;
                            combatLog.push(`【{rounds}回合] ${monster.name}展开铁壁 🛡【防御【${monDefMod}`);
                        } else if (roll < 95) {
                            // 自愈：回复HP
                            const heal = Math.floor(monster.level * 5);
                            monHp = Math.min(monster.hp, monHp + heal);
                            combatLog.push(`【{rounds}回合] ${monster.name}自愈 🌿 恢复${heal}HP (怪物HP:${monHp})`);
                        } else {
                            // 反击姿【                            combatLog.push(`【{rounds}回合] ${monster.name}摆出反击姿【👁️`);
                        }
                    } else if (aiType === 'magic') {
                        // 魔法型：魔法伤害+回复
                        if (roll < 45) {
                            // 魔法弹：无视30%防御
                            const pierceDef = Math.floor(getHeroDef() * 0.3);
                            const dmg = Math.max(1, Math.floor(getMonAtk() * 1.2) - (getHeroDef() - pierceDef));
                            heroHp -= dmg;
                            combatLog.push(`【{rounds}回合] ${monster.name}魔法【🔮 造成${dmg}伤害(穿【 (勇者HP:${Math.max(0,heroHp)})`);
                        } else if (roll < 70) {
                            const dmg = Math.max(1, getMonAtk() - getHeroDef());
                            heroHp -= dmg;
                            combatLog.push(`【{rounds}回合] ${monster.name}攻击 🗡️，造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                        } else if (roll < 90 && monMp >= 10) {
                            // 治疗
                            const heal = Math.floor(monster.mp * 0.2);
                            monHp = Math.min(monster.hp, monHp + heal);
                            monMp -= 10;
                            combatLog.push(`【{rounds}回合] ${monster.name}治疗 【恢复${heal}HP (怪物HP:${monHp})`);
                        } else if (monBuffTurns <= 0) {
                            // 魔力增幅
                            monAtkMod = Math.floor(monster.atk * 0.2);
                            monBuffTurns = 2;
                            combatLog.push(`【{rounds}回合] ${monster.name}魔力增幅 🔮 攻击【${monAtkMod}`);
                        } else {
                            const dmg = Math.max(1, getMonAtk() - getHeroDef());
                            heroHp -= dmg;
                            combatLog.push(`【{rounds}回合] ${monster.name}攻击 🗡️，造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                        }
                    } else if (aiType === 'speed') {
                        // 速度型：连击+闪避
                        if (roll < 40) {
                            // 迅捷连击：攻【】
                            const dmg1 = Math.max(1, Math.floor(getMonAtk() * 0.7) - getHeroDef());
                            const dmg2 = Math.max(1, Math.floor(getMonAtk() * 0.6) - getHeroDef());
                            heroHp -= dmg1;
                            const hpAfter1 = heroHp;
                            if (heroHp > 0) heroHp -= dmg2;
                            combatLog.push(`【{rounds}回合] ${monster.name}迅捷连击 【${dmg1}+${dmg2}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                        } else if (roll < 75) {
                            const dmg = Math.max(1, getMonAtk() - getHeroDef());
                            heroHp -= dmg;
                            combatLog.push(`【{rounds}回合] ${monster.name}攻击 🗡️，造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                        } else if (roll < 95 && monBuffTurns <= 0) {
                            // 闪避姿态：30%闪避【                            monDefMod = Math.floor(monster.def * 0.5);
                            monBuffTurns = 2;
                            combatLog.push(`【{rounds}回合] ${monster.name}闪避姿【💨 防御提升`);
                        } else {
                            const dmg = Math.max(1, getMonAtk() - getHeroDef());
                            heroHp -= dmg;
                            combatLog.push(`【{rounds}回合] ${monster.name}攻击 🗡️，造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                        }
                    } else {
                        // 均衡】
                        if (roll < 50) {
                            const dmg = Math.max(1, getMonAtk() - getHeroDef());
                            heroHp -= dmg;
                            combatLog.push(`【{rounds}回合] ${monster.name}攻击 🗡️，造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                        } else if (roll < 75) {
                            // 特殊攻击【.3】
                            const rawDmg = Math.floor(getMonAtk() * 1.3);
                            const dmg = Math.max(1, rawDmg - getHeroDef());
                            heroHp -= dmg;
                            combatLog.push(`【{rounds}回合] ${monster.name}强力攻击 💥 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            if (RAND(100) < 20) {
                                const debuffVal = Math.max(3, Math.floor(heroBaseDef * 0.1));
                                heroDefMod = -debuffVal;
                                combatLog.push(`  【勇者防御力下降${debuffVal}！`);
                            }
                        } else if (roll < 90) {
                            const heal = Math.floor(monster.level * 3);
                            monHp = Math.min(monster.hp, monHp + heal);
                            combatLog.push(`【{rounds}回合] ${monster.name}恢复 🌿 恢复${heal}HP (怪物HP:${monHp})`);
                        } else if (monBuffTurns <= 0) {
                            monAtkMod = Math.floor(monster.atk * 0.15);
                            monBuffTurns = 2;
                            combatLog.push(`【{rounds}回合] ${monster.name}强化 💪 攻击【${monAtkMod}`);
                        } else {
                            const dmg = Math.max(1, getMonAtk() - getHeroDef());
                            heroHp -= dmg;
                            combatLog.push(`【{rounds}回合] ${monster.name}攻击 🗡️，造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                        }
                    }
                }
            }

            // 回合结束：处理增【减益持续时间
            if (heroBuffTurns > 0) {
                heroBuffTurns--;
                if (heroBuffTurns <= 0) {
                    heroAtkMod = 0;
                    combatLog.push(`  【勇者的攻击力增益效果消失了`);
                }
            }
            if (monBuffTurns > 0) {
                monBuffTurns--;
                if (monBuffTurns <= 0) {
                    monAtkMod = 0;
                    combatLog.push(`  【${monster.name}的增益效果消失了`);
                }
            }
        }

        // 更新勇者的实际HP/MP
        hero.hp = Math.max(0, heroHp);
        hero.mp = Math.max(0, heroMp);

        const victory = monHp <= 0;
        const defeated = heroHp <= 0;
        const escaped = !victory && !defeated;

        let drop = null;
        if (victory) {
            const expGain = monster.level * 10;
            hero.exp[0] = (hero.exp[0] || 0) + expGain;
            // 击败怪物获得金币（新平衡：level²×2 + 随机波动】
            const goldGain = Math.floor(monster.level * monster.level * 2 + RAND(monster.level * 10));
            hero.gold += goldGain;
            combatLog.push(`【勇者击败了${monster.name}与战斗${rounds}回合) 获得${expGain}EXP【{goldGain}G`);
            // 战斗掉落
            if (Math.random() < 0.30) {
                const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
                const slot = slotTypes[RAND(slotTypes.length)];
                drop = GearSystem.generateGear(slot, monster.level);
                const r = GearSystem.equipItem(hero, drop);
                if (r.success) combatLog.push(`🎁 ${r.msg}`);
            }
        } else if (defeated) {
            combatLog.push(`【勇者被${monster.name}击败【..`);
        } else {
            combatLog.push(`【勇者从战斗中撤退了`);
        }

        return { victory, defeated, escaped, rounds, combatLog, monster, drop };
    }

    // 根据怪物属性判断AI类型
    _getMonsterAIType(monster) {
        const atkRatio = monster.atk / (monster.def + 1);
        const spdRatio = monster.spd / (monster.atk + 1);
        const mpRatio = monster.mp / (monster.hp + 1);

        if (atkRatio > 1.5) return 'attack';     // 攻击型：攻击力远高于防御
        if (monster.def > monster.atk * 1.2) return 'defense'; // 防御型：防御高于攻击
        if (mpRatio > 0.25 && monster.atk < monster.def * 1.2) return 'magic'; // 魔法型：MP】
        if (spdRatio > 1.0 && monster.spd > monster.atk && monster.spd > monster.def) return 'speed'; // 速度】
        return 'balanced'; // 均衡【
}

    // ========== 勇者俘虏系统==========

    // 处理被击败勇者的俘虏流程
    _processCapture(hero, monster) {
        // 逃跑者特质特殊处】
        const isEscapee = hero.talent[203];

        // 1. 逃跑判定
        const escapeResult = this._tryEscape(hero, monster);
        if (escapeResult.success) {
            if (isEscapee) {
                return { type: 'escape', message: `${hero.name}再次从魔王手中逃脱【..但她知道，自己终究会回来的。` };
            }
            return { type: 'escape', message: escapeResult.message };
        }

        // 2. 逃跑失败，进入投降判】
        const surrenderResult = this._trySurrender(hero);
        if (isEscapee) {
            // 逃跑者再次被捕时，投降率大幅提升
            let modChance = 50 + Math.floor((1 - hero.hp / Math.max(1, hero.maxHp)) * 40);
            modChance = Math.max(0, Math.min(95, modChance));
            if (RAND(100) < modChance) {
                this._convertHeroToSlave(hero);
                return { type: 'surrender', message: `${hero.name}再次被魔王捕【..她的身体比意志更先屈服了。「欢迎回来，我的奴隶。」魔王在她耳边低语。` };
            }
        }
        if (surrenderResult.success) {
            // 投降：转化为奴隶，服从Lv3
            this._convertHeroToSlave(hero);
            return { type: 'surrender', message: surrenderResult.message };
        } else {
            // 不投降：关入监狱
            this._imprisonHero(hero);
            return { type: 'imprisoned', message: surrenderResult.message };
        }
    }

    // 逃跑判定：勇者尝试从被击败状态中逃跑
    _tryEscape(hero, monster) {
        let chance = 50; // 基础逃跑【0%

        const hpPct = hero.hp / Math.max(1, hero.maxHp);

        if (hpPct < 0.2) {
            // 血【20%时，血量越低逃跑成功率越【            // 血量从20%降到0%，逃跑率从50%降到30%
            const hpPenalty = Math.floor((0.2 - hpPct) / 0.2 * 20);
            chance -= hpPenalty;

            // 性格修正（仅在血【20%时生效）
            if (hero.talent[10]) chance += 15;      // 胆】
            if (hero.talent[162]) chance += 15;     // 懦弱
            if (hero.talent[16]) chance += 5;       // 低姿】
            if (hero.talent[12]) chance -= 15;      // 刚强
            if (hero.talent[11]) chance -= 10;      // 反抗】
            if (hero.talent[14]) chance -= 10;      // 傲慢
            if (hero.talent[15]) chance -= 10;      // 高姿【
}

        // 伪装者惩罚：如果小队中有伪装者，逃跑【30%
        const squadId = hero.cflag[CFLAGS.SQUAD_ID];
        if (squadId) {
            const squadMembers = this.invaders.filter(h => h.cflag[CFLAGS.SQUAD_ID] === squadId);
            const hasSpy = squadMembers.some(h => h.talent[201]);
            if (hasSpy) chance -= 30;
        }

        // 限制范围：最【0%，最【5%
        chance = Math.max(10, Math.min(95, chance));

        if (RAND(100) < chance) {
            return { success: true, message: `${hero.name}在混乱中成功逃脱了！` };
        } else {
            return { success: false, message: `${hero.name}试图逃跑但被怪物拦住【..` };
        }
    }

    // 投降判定：被俘勇者是否选择投降
    _trySurrender(hero) {
        let chance = 30; // 基础投降【0%

        // HP/MP状态修正（越低越容易投降）
        const hpPct = hero.hp / Math.max(1, hero.maxHp);
        const mpPct = hero.mp / Math.max(1, hero.maxMp);
        chance += Math.floor((1 - hpPct) * 30); // HP越低+越多
        chance += Math.floor((1 - mpPct) * 10); // MP越低+越多

        // 性格修正
        if (hero.talent[10]) chance += 20;      // 胆】
        if (hero.talent[162]) chance += 20;     // 懦弱
        if (hero.talent[16]) chance += 15;      // 低姿】
        if (hero.talent[17]) chance += 10;      // 老实
        if (hero.talent[12]) chance -= 20;      // 刚强
        if (hero.talent[11]) chance -= 15;      // 反抗】
        if (hero.talent[14]) chance -= 15;      // 傲慢
        if (hero.talent[15]) chance -= 15;      // 高姿】
        if (hero.talent[18]) chance -= 5;       // 傲娇

        // 限制范围
        chance = Math.max(0, Math.min(90, chance));

        if (RAND(100) < chance) {
            return { success: true, message: `${hero.name}精神崩溃，选择了投降服【..` };
        } else {
            return { success: false, message: `${hero.name}虽然被俘，但眼神中仍带着不屈...` };
        }
    }

    // 投降勇者转化为奴隶
    _convertHeroToSlave(hero) {
        // 服从度直接设为Lv3
        hero.mark[0] = 3;

        // 赋予"前勇【特质
        hero.talent[200] = 1;

        // 清除勇者专属标【        hero.cflag[CFLAGS.HERO_FLOOR] = 0;
        hero.cflag[CFLAGS.HERO_PROGRESS] = 0;
        hero.cflag[CFLAGS.LOVE_POINTS] = 0;

        // 初始化探索标【        hero.cflag[CFLAGS.FALLEN_DEPTH] = 0; // 0=未探【 1=探索【        hero.cflag[CFLAGS.FALLEN_STAGE] = 10; // 当前楼层(反向从第10层开【
        hero.cflag[CFLAGS.CORRUPTION] = 0; // 当前进度
        hero.cflag[703] = 0; // 累计获得EXP

        // 恢复部分状【        hero.hp = Math.floor(hero.maxHp * 0.3);
        hero.mp = Math.floor(hero.maxMp * 0.2);

        // 加入奴隶列表
        this.characters.push(hero);
        UI.showToast(`勇者${hero.name} 投降了！成为了你的奴【(服从Lv.${hero.mark[0]})`, 'success');
    }

    // 将勇者关入监】
    _imprisonHero(hero) {
        // 检查监狱容】
        const maxCap = this.getMaxPrisoners();
        if (this.prisoners.length >= maxCap) {
            // 监狱已满，最老的俘虏被处决或释放（简化：移除第一个）
            const removed = this.prisoners.shift();
            UI.showToast(`监狱已满【{removed.name} 被处决了`, 'danger');
        }

        // 勇者被俘时，金币被魔王没收
        const confiscatedGold = hero.gold;
        if (confiscatedGold > 0) {
            this.money += confiscatedGold;
            hero.gold = 0;
            UI.showToast(`从勇【${hero.name} 身上没收【${confiscatedGold}G！`, 'success');
        }

        // 标记俘虏状【        hero.cflag[CFLAGS.LOVE_POINTS] = 1; // 俘虏标记
        hero.cflag[CFLAGS.OBEDIENCE_POINTS] = this.day; // 被俘天数

        // 恢复少量状态（保证存活【        hero.hp = Math.max(1, Math.floor(hero.maxHp * 0.1));
        hero.mp = Math.max(1, Math.floor(hero.maxMp * 0.1));

        this.prisoners.push(hero);
        UI.showToast(`勇者${hero.name} 被俘，关入监狱！`, 'warning');
    }

    // ========== 伪装者派遣系统==========

    // 派遣前勇者奴隶伪装混入勇者队】
    sendSpy(index) {
        const slave = this.getChara(index);
        if (!slave || !slave.talent[200]) {
            UI.showToast('该角色不是前勇者，无法派遣伪装', 'danger');
            return false;
        }
        if (slave.cflag[CFLAGS.FALLEN_DEPTH]) {
            UI.showToast(`${slave.name} 正在探索中，无法派遣`, 'warning');
            return false;
        }
        if (slave.cflag[CFLAGS.PLEASURE]) {
            UI.showToast(`${slave.name} 已经派出了伪装者`, 'warning');
            return false;
        }

        // 创建伪装者：复制前勇者的数据
        const spy = new Character(-2);
        spy.name = slave.name;
        spy.callname = slave.callname;
        spy.base = [...slave.base];
        spy.maxbase = [...slave.maxbase];
        spy.hp = Math.floor(slave.maxHp * 0.6);
        spy.mp = Math.floor(slave.maxMp * 0.5);
        spy.level = slave.level;
        spy.cflag[CFLAGS.BASE_HP] = slave.level;
        spy.cflag[CFLAGS.ATK] = slave.cflag[CFLAGS.ATK] || 20 + slave.level * 5;
        spy.cflag[CFLAGS.DEF] = slave.cflag[CFLAGS.DEF] || 15 + slave.level * 4;
        spy.cflag[CFLAGS.SPD] = slave.cflag[CFLAGS.SPD] || 10 + slave.level * 3;
        spy.talent = [...slave.talent];
        spy.talent[200] = 1; // 前勇【        spy.talent[201] = 1; // 伪装者标【        spy.mark = [...slave.mark];
        spy.abl = [...slave.abl];

        // 初始化勇者入侵标【        spy.cflag[CFLAGS.HERO_FLOOR] = 1;
        spy.cflag[CFLAGS.HERO_PROGRESS] = 0;

        // 标记原奴隶已派出伪装
        slave.cflag[CFLAGS.PLEASURE] = 1;

        this.invaders.push(spy);
        UI.showToast(`${slave.name} 伪装成勇者混入了入侵者队伍！`, 'warning');
        return true;
    }

    // ========== 奴隶反向探索系统 ==========

    // 派出前勇者奴隶进行地下城反向探索
    sendSlaveExplore(index) {
        const slave = this.getChara(index);
        if (!slave || !slave.talent[200]) {
            UI.showToast('该角色不是前勇者，无法派出探索', 'danger');
            return false;
        }
        if (slave.cflag[CFLAGS.FALLEN_DEPTH]) {
            UI.showToast(`${slave.name} 已经在探索中了`, 'warning');
            return false;
        }
        slave.cflag[CFLAGS.FALLEN_DEPTH] = 1; // 标记探索【        slave.cflag[CFLAGS.FALLEN_STAGE] = 10; // 从第10层开【        slave.cflag[CFLAGS.CORRUPTION] = 0; // 进度0
        UI.showToast(`派出【${slave.name} 前往地下城第10层探索！`, 'success');
        return true;
    }

    // 召回探索中的奴隶
    recallSlaveExplore(index) {
        const slave = this.getChara(index);
        if (!slave || !slave.cflag[CFLAGS.FALLEN_DEPTH]) {
            UI.showToast('该角色没有在探索', 'warning');
            return false;
        }
        slave.cflag[CFLAGS.FALLEN_DEPTH] = 0;
        UI.showToast(`召回【${slave.name} (累计获得${slave.cflag[703] || 0}EXP)`, 'info');
        return true;
    }

    // 处理奴隶每日探索
    processSlaveExploreDaily() {
        const results = [];
        const processed = new Set();

        for (const slave of this.characters) {
            if (!slave.talent[200] || !slave.cflag[CFLAGS.FALLEN_DEPTH]) continue;
            if (processed.has(slave)) continue;

            // 处理返回魔王宫的奴隶
            if (slave.cflag[CFLAGS.DEPRAVITY]) {
                const squadId = slave.cflag[CFLAGS.SQUAD_ID];
                // 如果属于小队但不是队长，跳过（由队长统一处理）
                if (squadId && slave.cflag[CFLAGS.SQUAD_LEADER] !== 1) {
                    processed.add(slave);
                    continue;
                }
                let squad = [];
                if (squadId && slave.cflag[CFLAGS.SQUAD_LEADER] === 1) {
                    squad = this.characters.filter(c => c !== slave && c.talent[200] && c.cflag[CFLAGS.SQUAD_ID] === squadId);
                    for (const member of squad) processed.add(member);
                }
                // 触发复命事件
                const reportResult = this._processSlaveReport(slave, squad);
                results.push(reportResult);
                processed.add(slave);
                continue;
            }

            const floorId = slave.cflag[CFLAGS.FALLEN_STAGE] || 10;
            let progress = slave.cflag[CFLAGS.CORRUPTION] || 0;

            // 反向探索：每天基础+5%进度
            let moveSpeed = 5 + Math.floor((slave.level - 1) * 10 / 49);
            if (moveSpeed > 15) moveSpeed = 15;

            // 检查是否属于小队
            const squadId = slave.cflag[CFLAGS.SQUAD_ID];
            let squad = [];
            if (squadId && slave.cflag[CFLAGS.SQUAD_LEADER] === 1) {
                // 队长：收集所有小队成【                squad = this.characters.filter(c => c !== slave && c.talent[200] && c.cflag[CFLAGS.SQUAD_ID] === squadId);
                for (const member of squad) processed.add(member);
            } else if (squadId && slave.cflag[CFLAGS.SQUAD_LEADER] !== 1) {
                // 非队长：跳过（由队长处理【                continue;
            }

            // 40%触发好事件，60%触发修炼事件
            const roll = RAND(100);
            if (roll < 40) {
                // 好事】
                if (squad.length > 0) {
                    // 小队好事件：效果共享
                    const goodEvent = this._processSlaveGoodEvent(slave, floorId);
                    results.push({ name: `${slave.name}小队`, type: 'good', text: goodEvent.text, exp: goodEvent.exp, gold: goodEvent.gold });
                    for (const member of squad) {
                        member.hp = Math.min(member.maxHp, member.hp + Math.floor(member.maxHp * 0.05));
                        member.mp = Math.min(member.maxMp, member.mp + Math.floor(member.maxMp * 0.03));
                    }
                } else {
                    const goodEvent = this._processSlaveGoodEvent(slave, floorId);
                    results.push({ name: slave.name, type: 'good', text: goodEvent.text, exp: goodEvent.exp, gold: goodEvent.gold });
                }
            } else {
                // 修炼事件
                if (squad.length > 0) {
                    // 小队修炼：遇到怪物，小队一起战】
                    const monsters = FLOOR_MONSTER_DEFS[floorId];
                    if (monsters && monsters.length > 0) {
                        const monster = monsters[RAND(monsters.length)];
                        const fullSquad = [slave, ...squad];
                        const combat = this._doSquadCombat(fullSquad, monster);
                        const expPerMember = combat.victory ? Math.floor(monster.level * 10 / fullSquad.filter(s => s.hp > 0).length) : 0;
                        results.push({
                            name: `${slave.name}小队`,
                            type: 'train',
                            text: `遭遇${monster.name} ${combat.victory ? '胜利' : (combat.defeated ? '败北' : '撤退')} ${combat.victory ? `(+${expPerMember}EXP)` : ''}`,
                            exp: expPerMember
                        });
                    } else {
                        const trainEvent = this._processSlaveTrainEvent(slave, floorId);
                        results.push({ name: slave.name, type: 'train', text: trainEvent.text, exp: trainEvent.exp, gold: trainEvent.gold });
                    }
                } else {
                    const trainEvent = this._processSlaveTrainEvent(slave, floorId);
                    results.push({ name: slave.name, type: 'train', text: trainEvent.text, exp: trainEvent.exp, gold: trainEvent.gold });
                }
            }

            // 前勇者探索也可能触发隐藏商店（每【%概率）和奸商【%概率】
            if (Math.random() < 0.08) {
                const shopResult = this._triggerHiddenShop(slave, floorId);
                if (shopResult) results.push({ name: slave.name, ...shopResult });
            }
            if (Math.random() < 0.04) {
                const swindlerResult = this._triggerSwindler(slave, floorId);
                if (swindlerResult) results.push({ name: slave.name, ...swindlerResult });
            }

            // 前勇者训练补偿：5%概率随机升级身上一件装备（最高橙色）
            if (roll >= 40) {
                const upgradeTargets = [slave, ...squad].filter(m => m && m.gear);
                for (const target of upgradeTargets) {
                    if (Math.random() < 0.05) {
                        const upgraded = GearSystem.randomUpgradeGear(target);
                        if (upgraded) {
                            results.push({
                                name: target.name,
                                type: 'upgrade',
                                text: `在修炼中顿悟【{upgraded.name}的品质提升了！当前品质：${GearSystem.getRarityName(upgraded.rarity)}`
                            });
                        }
                    }
                }
            }

            // 检查进度宝箱（奴隶探索也触发）
            const oldProgress = slave.cflag[CFLAGS.CORRUPTION] || 0;
            const slaveChests = this._checkProgressChests(slave, oldProgress, oldProgress + moveSpeed, floorId);
            if (slaveChests.length > 0) {
                for (const chest of slaveChests) {
                    results.push({
                        name: slave.name,
                        type: 'chest',
                        text: `【${chest.threshold}%处发现${chest.type === 'legendary' ? '传说宝箱' : '高级宝箱'}】${chest.msg}${chest.curseTriggered ? ' ⚠️受到诅咒' : ''}`
                    });
                }
            }

            // 更新进度（所有成员同步）
            progress += moveSpeed;
            if (progress >= 100) {
                if (floorId > 1) {
                    slave.cflag[CFLAGS.FALLEN_STAGE] = floorId - 1;
                    slave.cflag[CFLAGS.CORRUPTION] = 0;
                    slave.cflag[CFLAGS.DESIRE] = 0; // 重置宝箱标记
                    for (const member of squad) {
                        member.cflag[CFLAGS.FALLEN_STAGE] = floorId - 1;
                        member.cflag[CFLAGS.CORRUPTION] = 0;
                        member.cflag[CFLAGS.DESIRE] = 0;
                    }
                    results.push({ name: slave.name, type: 'floor', text: `小队到达【{floorId - 1}层！` });
                } else {
                    // 到达【层出口，开始返回魔王宫
                    slave.cflag[CFLAGS.DEPRAVITY] = 1; // 标记为返回中
                    slave.cflag[CFLAGS.CORRUPTION] = 0;
                    slave.cflag[CFLAGS.DESIRE] = 0;
                    for (const member of squad) {
                        member.cflag[CFLAGS.DEPRAVITY] = 1;
                        member.cflag[CFLAGS.CORRUPTION] = 0;
                        member.cflag[CFLAGS.DESIRE] = 0;
                    }
                    results.push({ name: slave.name, type: 'floor', text: `小队到达【层出口，开始返回魔王宫…` });
                }
            } else {
                slave.cflag[CFLAGS.CORRUPTION] = progress;
                for (const member of squad) {
                    member.cflag[CFLAGS.CORRUPTION] = progress;
                }
            }

            // 自动恢复
            slave.hp = Math.min(slave.maxHp, slave.hp + Math.floor(slave.maxHp * 0.05));
            slave.mp = Math.min(slave.maxMp, slave.mp + Math.floor(slave.maxMp * 0.03));
            processed.add(slave);
        }
        return results;
    }

    // 奴隶好事】
    _processSlaveGoodEvent(slave, floorId) {
        const monLevel = floorId * 5; // 该层平均怪物等级参】
        const events = [
            { weight: 3, text: `发现了隐藏的宝箱，获【{monLevel * monLevel}G`, gold: monLevel * monLevel },
            { weight: 3, text: `发现了魔力结晶，MP完全恢复`, restoreMp: 1 },
            { weight: 2, text: `找到了治愈泉水，HP完全恢复`, restoreHp: 1 },
            { weight: 2, text: `遇到了友善的低级魔物，获【{floorId * 5}EXP`, exp: floorId * 5 },
            { weight: 1, text: `发现了古代遗迹，获得${floorId * 15}EXP`, exp: floorId * 15 },
            { weight: 2, text: `休息了一整天，状态恢复`, restoreBoth: 0.3 },
            { weight: 2, text: `发现了被遗忘的财宝库`, gold: monLevel * monLevel * 2 },
        ];
        const evt = this._weightedRandom(events);
        let text = evt.text;
        let gainedExp = evt.exp || 0;
        let gainedGold = evt.gold || 0;

        if (gainedGold > 0) {
            slave.gold += gainedGold;
            text += ` [${slave.name}金币:${slave.gold}G]`;
        }
        if (evt.restoreMp) {
            slave.mp = slave.maxMp;
        }
        if (evt.restoreHp) {
            slave.hp = slave.maxHp;
        }
        if (evt.restoreBoth) {
            slave.hp = Math.min(slave.maxHp, slave.hp + Math.floor(slave.maxHp * evt.restoreBoth));
            slave.mp = Math.min(slave.maxMp, slave.mp + Math.floor(slave.maxMp * evt.restoreBoth));
        }
        if (gainedExp > 0) {
            slave.exp[0] = (slave.exp[0] || 0) + gainedExp;
            slave.cflag[703] = (slave.cflag[703] || 0) + gainedExp;
            text += ` (+${gainedExp}EXP)`;
        }

        return { text, exp: gainedExp, gold: gainedGold };
    }

    // 奴隶修炼事件
    _processSlaveTrainEvent(slave, floorId) {
        const monsters = FLOOR_MONSTER_DEFS[floorId];
        const monLevel = monsters && monsters.length > 0 ? monsters[RAND(monsters.length)].level : floorId * 5;
        const expGain = monLevel; // 修炼结果 = 当楼层怪物等级的经【        // 前勇者修炼获得金币（新平衡：与怪物等级²挂钩】
        const goldGain = Math.floor(monLevel * monLevel + RAND(monLevel * 5));
        slave.gold += goldGain;

        slave.exp[0] = (slave.exp[0] || 0) + expGain;
        slave.cflag[703] = (slave.cflag[703] || 0) + expGain;

        const trainTexts = [
            `与地下城魔物战斗修炼，击败了${monsters ? monsters[RAND(monsters.length)].name : '魔物'}`,
            `在魔力浓郁的区域冥想修炼`,
            `反复演练战斗技巧`,
            `独自深入危险区域历练`,
            `研究了古代战斗壁画`,
            `与幻影进行模拟战斗`,
        ];
        const text = trainTexts[RAND(trainTexts.length)] + ` (+${expGain}EXP, +${goldGain}G)`;

        return { text, exp: expGain, gold: goldGain };
    }

    // 前勇者返回魔王宫复命
    _processSlaveReport(slave, squad) {
        const totalExp = slave.cflag[703] || 0;
        const totalGold = slave.gold;
        const allMembers = [slave, ...squad];

        // 重置所有成员探索状】
        for (const member of allMembers) {
            member.cflag[CFLAGS.FALLEN_DEPTH] = 0;
            member.cflag[CFLAGS.FALLEN_STAGE] = 10;
            member.cflag[CFLAGS.CORRUPTION] = 0;
            member.cflag[703] = 0;
            member.cflag[CFLAGS.DESIRE] = 0;
            member.cflag[CFLAGS.DEPRAVITY] = 0;
            member.cflag[CFLAGS.SQUAD_ID] = 0;
            member.cflag[CFLAGS.SQUAD_LEADER] = 0;
            // 恢复状【            member.hp = Math.min(member.maxHp, member.hp + Math.floor(member.maxHp * 0.5));
            member.mp = Math.min(member.maxMp, member.mp + Math.floor(member.maxMp * 0.5));
        }

        // 30%概率触发魔王性爱奖励事件
        const triggerReward = Math.random() < 0.3;
        let rewardText = '';
        if (triggerReward) {
            // 魔王奖励效果
            slave.addPalam(5, 3000);  // 欲情
            slave.addPalam(4, 2000);  // 顺从
            slave.addPalam(6, 2000);  // 屈服
            slave.addExp(2, 3);        // 绝顶经验+3
            slave.addExp(4, 2);        // 性交经验+2
            slave.addMark(1, 1);       // 快乐刻印+1
            if (slave.abl[10] < 5) slave.abl[10]++; // 顺从+1
            if (slave.abl[11] < 5) slave.abl[11]++; // 欲望+1
            // 魔王获得调教经验
            this.masterExp += 5;
            rewardText = `\n🏰 【魔王的爱奖励】\n${slave.name}回到魔王宫复命，魔王对她的表现非常满意。\n「做得很好，值得奖励。」魔王将她拉入怀中…\n在魔王的宠爱下，${slave.name}的身体变得火热，顺从心增加了。\n获得：绝顶经【3、快乐刻【1、顺【欲望上升、魔王经【5`;
        } else {
            rewardText = `\n${slave.name}顺利返回魔王宫复命。`;
        }

        const squadText = squad.length > 0 ? `（小队共${allMembers.length}人）` : '';
        return {
            name: slave.name,
            type: 'complete',
            text: `${squadText}完成了地下城探索！累计获【{totalExp}EXP、持有金【{totalGold}G【{rewardText}`,
            exp: totalExp,
            gold: totalGold,
            reward: triggerReward
        };
    }

    // 加权随机选择
    _weightedRandom(items) {
        const total = items.reduce((s, e) => s + e.weight, 0);
        let roll = RAND(total);
        for (const item of items) {
            roll -= item.weight;
            if (roll < 0) return item;
        }
        return items[items.length - 1];
    }

    // ========== 勇者相【伪装系统 ==========

    // 处理所有勇者之间的相遇事件
    _processHeroEncounters() {
        const results = [];
        const processed = new Set(); // 避免重复处理

        for (let i = 0; i < this.invaders.length; i++) {
            for (let j = i + 1; j < this.invaders.length; j++) {
                const a = this.invaders[i];
                const b = this.invaders[j];

                // 检查是否在同一】
                if (this.getHeroFloor(a) !== this.getHeroFloor(b)) continue;

                const pairKey = `${a.name}_${b.name}`;
                if (processed.has(pairKey)) continue;
                processed.add(pairKey);

                // 25%概率触发相遇
                if (RAND(100) >= 25) continue;

                // 随机选择发起】
                const actor = RAND(2) === 0 ? a : b;
                const target = actor === a ? b : a;

                // 发起者决定行动：对战 / 伪装 / 什么都不做
                const action = this._decideHeroEncounterAction(actor);

                if (action === 'combat') {
                    // 直接对战
                    const combatResult = this._doHeroVsHeroCombat(actor, target);
                    results.push({
                        title: `⚔️ 勇者内战`,
                        text: combatResult.text
                    });
                } else if (action === 'disguise') {
                    const disguise = this._tryDisguise(actor);
                    if (disguise.success) {
                        const eventResult = this._doDisguiseEvent(actor, target);
                        results.push({
                            title: `🎭 勇者相遇`,
                            text: `${actor.name}伪装成同伴接【{target.name} 【${eventResult.text}`
                        });
                    } else {
                        results.push({
                            title: `👥 勇者相遇`,
                            text: `${actor.name}遇到【{target.name}，伪装被识破`
                        });
                    }
                } else {
                    // 什么都不做
                    results.push({
                        title: `👥 勇者相遇`,
                        text: `${actor.name}遇到【{target.name}，但没有采取行动`
                    });
                }
            }
        }
        return results;
    }

    // 伪装判定：勇者尝试伪装成同伴
    _tryDisguise(hero) {
        let chance = 30; // 基础伪装【0%

        // 性格修正
        if (hero.talent[164]) chance += 15;      // 冷静（善于伪装）
        if (hero.talent[15]) chance += 10;       // 高姿态（有领导力气质】
        if (hero.talent[14]) chance += 5;        // 傲慢（自信能骗过对方】
        if (hero.talent[11]) chance += 10;       // 反抗心（善于欺骗】
        if (hero.talent[13]) chance -= 15;       // 坦率（不会说谎）
        if (hero.talent[17]) chance -= 10;       // 老实（不擅长欺骗】
        if (hero.talent[12]) chance -= 5;        // 刚强（太直率【
        // 限制范围
        chance = Math.max(5, Math.min(80, chance));

        if (RAND(100) < chance) {
            return { success: true, message: `${hero.name}成功伪装成同伴！` };
        } else {
            return { success: false, message: `${hero.name}的伪装被识破【..` };
        }
    }

    // 伪装后的特殊事件
    _doDisguiseEvent(actor, target) {
        const events = [
            {
                weight: 3,
                name: '下药',
                text: `${actor.name}在食物中下了麻痹药，${target.name}的HP大幅下降！`,
                effect: (a, t) => {
                    const dmg = Math.floor(t.maxHp * 0.25);
                    t.hp = Math.max(1, t.hp - dmg);
                    return `HP-${dmg}`;
                }
            },
            {
                weight: 3,
                name: '带错路',
                text: `${actor.name}故意带错了路，${target.name}的侵略度大幅降低！`,
                effect: (a, t) => {
                    let progress = t.cflag[CFLAGS.HERO_PROGRESS] || 0;
                    progress -= 30;
                    if (progress < 0) {
                        const floorId = this.getHeroFloor(t);
                        if (floorId > 1) {
                            t.cflag[CFLAGS.HERO_FLOOR] = floorId - 1;
                            t.cflag[CFLAGS.HERO_PROGRESS] = 80 + progress;
                        } else {
                            t.cflag[CFLAGS.HERO_PROGRESS] = 0;
                        }
                    } else {
                        t.cflag[CFLAGS.HERO_PROGRESS] = progress;
                    }
                    return `侵略【30%`;
                }
            },
            {
                weight: 2,
                name: '散布谣言',
                text: `${actor.name}散布了魔王城恐怖的谣言【{target.name}的精神受到打击！`,
                effect: (a, t) => {
                    t.mp = Math.max(0, t.mp - Math.floor(t.maxMp * 0.3));
                    return `MP-${Math.floor(t.maxMp * 0.3)}`;
                }
            },
            {
                weight: 2,
                name: '破坏装备',
                text: `${actor.name}趁夜破坏【{target.name}的装备，攻击力下降！`,
                effect: (a, t) => {
                    const debuff = Math.max(5, Math.floor((t.cflag[CFLAGS.ATK] || 20) * 0.15));
                    t.cflag[CFLAGS.ATK] = Math.max(1, (t.cflag[CFLAGS.ATK] || 20) - debuff);
                    return `攻击【${debuff}`;
                }
            },
            {
                weight: 2,
                name: '挑拨离间',
                text: `${actor.name}挑拨【{target.name}与其他勇者的关系！`,
                effect: (a, t) => {
                    // 降低目标速度（行动力下降】
                    const debuff = Math.max(3, Math.floor((t.cflag[CFLAGS.SPD] || 10) * 0.2));
                    t.cflag[CFLAGS.SPD] = Math.max(1, (t.cflag[CFLAGS.SPD] || 10) - debuff);
                    return `敏捷-${debuff}`;
                }
            },
            {
                weight: 1,
                name: '陷阱诱饵',
                text: `${actor.name}【{target.name}引入了陷阱区域！`,
                effect: (a, t) => {
                    const dmg = Math.floor(t.maxHp * 0.15);
                    t.hp = Math.max(1, t.hp - dmg);
                    let progress = t.cflag[CFLAGS.HERO_PROGRESS] || 0;
                    progress -= 15;
                    t.cflag[CFLAGS.HERO_PROGRESS] = Math.max(0, progress);
                    return `HP-${dmg}, 侵略【15%`;
                }
            }
        ];

        const evt = this._weightedRandom(events);
        const effectText = evt.effect(actor, target);

        return {
            name: evt.name,
            text: `${evt.text} (${effectText})`
        };
    }

    // 勇者相遇时决定行动：对【/ 伪装 / 什么都不做
    _decideHeroEncounterAction(hero) {
        let combatChance = 30; // 基础对战【0%

        // 性格修正
        if (hero.talent[12]) combatChance += 20;      // 刚强（喜欢正面冲突）
        if (hero.talent[11]) combatChance += 10;      // 反抗心（好战】
        if (hero.talent[14]) combatChance += 15;      // 傲慢（轻视对手）
        if (hero.talent[164]) combatChance -= 10;     // 冷静（倾向于智取）
        if (hero.talent[16]) combatChance -= 5;       // 低姿态（避免冲突【
        // 限制范围
        combatChance = Math.max(10, Math.min(70, combatChance));

        const roll = RAND(100);
        if (roll < combatChance) {
            return 'combat';
        } else if (roll < combatChance + 35) {
            return 'disguise';
        } else {
            return 'none';
        }
    }

    // 勇【vs 勇者战】
    _doHeroVsHeroCombat(a, b) {
        const aAtk = a.cflag[CFLAGS.ATK] || 20;
        const aDef = a.cflag[CFLAGS.DEF] || 15;
        const aSpd = a.cflag[CFLAGS.SPD] || 10 + a.level * 2;
        const bAtk = b.cflag[CFLAGS.ATK] || 20;
        const bDef = b.cflag[CFLAGS.DEF] || 15;
        const bSpd = b.cflag[CFLAGS.SPD] || 10 + b.level * 2;

        let aHp = a.hp;
        let bHp = b.hp;
        const rounds = 3; // 3回合快速决】
        const log = [];

        for (let r = 1; r <= rounds; r++) {
            if (aHp <= 0 || bHp <= 0) break;

            // 根据敏捷决定先手
            const aFirst = aSpd >= bSpd;
            const first = aFirst ? { name: a.name, atk: aAtk, def: aDef, hpRef: 'a' } : { name: b.name, atk: bAtk, def: bDef, hpRef: 'b' };
            const second = aFirst ? { name: b.name, atk: bAtk, def: bDef, hpRef: 'b' } : { name: a.name, atk: aAtk, def: aDef, hpRef: 'a' };

            // 先手攻击
            const dmg1 = Math.max(1, first.atk - second.def);
            if (first.hpRef === 'a') {
                bHp -= dmg1;
            } else {
                aHp -= dmg1;
            }
            log.push(`${first.name}攻击造成${dmg1}伤害`);

            if (aHp <= 0 || bHp <= 0) break;

            // 后手攻击
            const dmg2 = Math.max(1, second.atk - first.def);
            if (second.hpRef === 'a') {
                bHp -= dmg2;
            } else {
                aHp -= dmg2;
            }
            log.push(`${second.name}反击造成${dmg2}伤害`);
        }

        // 更新实际HP
        a.hp = Math.max(1, aHp);
        b.hp = Math.max(1, bHp);

        const aWin = aHp > bHp;
        const bWin = bHp > aHp;

        let resultText;
        if (aWin) {
            resultText = `${a.name}获胜【{b.name}受到重创(HP:${b.hp}/${b.maxHp})`;
            // 败者侵略度大减
            let progress = b.cflag[CFLAGS.HERO_PROGRESS] || 0;
            progress -= 20;
            if (progress < 0) {
                const floorId = this.getHeroFloor(b);
                if (floorId > 1) {
                    b.cflag[CFLAGS.HERO_FLOOR] = floorId - 1;
                    b.cflag[CFLAGS.HERO_PROGRESS] = 80 + progress;
                } else {
                    b.cflag[CFLAGS.HERO_PROGRESS] = 0;
                }
            } else {
                b.cflag[CFLAGS.HERO_PROGRESS] = progress;
            }
        } else if (bWin) {
            resultText = `${b.name}获胜【{a.name}受到重创(HP:${a.hp}/${a.maxHp})`;
            let progress = a.cflag[CFLAGS.HERO_PROGRESS] || 0;
            progress -= 20;
            if (progress < 0) {
                const floorId = this.getHeroFloor(a);
                if (floorId > 1) {
                    a.cflag[CFLAGS.HERO_FLOOR] = floorId - 1;
                    a.cflag[CFLAGS.HERO_PROGRESS] = 80 + progress;
                } else {
                    a.cflag[CFLAGS.HERO_PROGRESS] = 0;
                }
            } else {
                a.cflag[CFLAGS.HERO_PROGRESS] = progress;
            }
        } else {
            resultText = `双方势均力敌，各自负伤后撤退`;
        }

        return {
            text: `${a.name} vs ${b.name} (${log.join('、')}) 【${resultText}】`
        };
    }

    // ========== 勇【前勇者小队系统==========

    // 清除所有小队标】
    _clearSquadFlags() {
        for (const hero of this.invaders) {
            hero.cflag[CFLAGS.SQUAD_ID] = 0; // 小队ID
            hero.cflag[CFLAGS.SQUAD_LEADER] = 0; // 队长标记
            hero.cflag[902] = 0; // 今日已战【
}
        for (const c of this.characters) {
            if (c.talent[200]) {
                c.cflag[CFLAGS.SQUAD_ID] = 0;
                c.cflag[CFLAGS.SQUAD_LEADER] = 0;
                c.cflag[902] = 0;
            }
        }
    }

    // 勇者自动组队：同一层且进度【=15%的自动组】
    _formHeroSquads() {
        this._clearSquadFlags();
        let squadId = 1;
        const assigned = new Set();

        for (let i = 0; i < this.invaders.length; i++) {
            if (assigned.has(i)) continue;
            const hero = this.invaders[i];
            const floorId = this.getHeroFloor(hero);
            const progress = this.getHeroProgress(hero);

            const squad = [hero];
            assigned.add(i);

            for (let j = i + 1; j < this.invaders.length; j++) {
                if (assigned.has(j)) continue;
                if (squad.length >= 3) break; // 小队最【】
                const other = this.invaders[j];
                if (this.getHeroFloor(other) === floorId) {
                    const diff = Math.abs(this.getHeroProgress(other) - progress);
                    if (diff <= 15) {
                        squad.push(other);
                        assigned.add(j);
                    }
                }
            }

            if (squad.length >= 2) {
                // 设置小队标记，速度最高的为队】
                const leader = squad.reduce((best, h) => {
                    const spd = h.cflag[CFLAGS.SPD] || 10 + h.level * 2;
                    const bestSpd = best.cflag[CFLAGS.SPD] || 10 + best.level * 2;
                    return spd > bestSpd ? h : best;
                }, squad[0]);

                for (const member of squad) {
                    member.cflag[CFLAGS.SQUAD_ID] = squadId;
                    member.cflag[CFLAGS.SQUAD_LEADER] = member === leader ? 1 : 0;
                    // 被组队的撤退勇者重新振】
                    if (member.cflag[503]) member.cflag[503] = 0;
                }
                squadId++;
            }
        }
    }

    // 前勇者奴隶自动组】
    _formSlaveSquads() {
        let squadId = 100; // 前勇者小队ID【00开始，避免冲突
        const assigned = new Set();

        const explorers = this.characters.filter(c => c.talent[200] && c.cflag[CFLAGS.FALLEN_DEPTH]);

        for (let i = 0; i < explorers.length; i++) {
            if (assigned.has(i)) continue;
            const slave = explorers[i];
            const floorId = slave.cflag[CFLAGS.FALLEN_STAGE] || 10;
            const progress = slave.cflag[CFLAGS.CORRUPTION] || 0;

            const squad = [slave];
            assigned.add(i);

            for (let j = i + 1; j < explorers.length; j++) {
                if (assigned.has(j)) continue;
                const other = explorers[j];
                if ((other.cflag[CFLAGS.FALLEN_STAGE] || 10) === floorId) {
                    const diff = Math.abs((other.cflag[CFLAGS.CORRUPTION] || 0) - progress);
                    if (diff <= 15) {
                        squad.push(other);
                        assigned.add(j);
                    }
                }
            }

            if (squad.length > 1) {
                const leader = squad.reduce((best, s) => {
                    const spd = s.cflag[CFLAGS.SPD] || 10 + s.level * 2;
                    const bestSpd = best.cflag[CFLAGS.SPD] || 10 + best.level * 2;
                    return spd > bestSpd ? s : best;
                }, squad[0]);

                for (const member of squad) {
                    member.cflag[CFLAGS.SQUAD_ID] = squadId;
                    member.cflag[CFLAGS.SQUAD_LEADER] = member === leader ? 1 : 0;
                }
                squadId++;
            }
        }
    }

    // 获取勇者的小队成员（不包括自己】
    _getHeroSquad(hero) {
        const squadId = hero.cflag[CFLAGS.SQUAD_ID];
        if (!squadId) return [];
        return this.invaders.filter(h => h !== hero && h.cflag[CFLAGS.SQUAD_ID] === squadId);
    }

    // 获取前勇者奴隶的小队成员
    _getSlaveSquad(slave) {
        const squadId = slave.cflag[CFLAGS.SQUAD_ID];
        if (!squadId) return [];
        return this.characters.filter(c => c !== slave && c.talent[200] && c.cflag[CFLAGS.SQUAD_ID] === squadId);
    }

    // 小队战斗：多对一回合制，速度高的先手
    _doSquadCombat(squad, monster) {
        let monHp = monster.hp;
        let monMp = monster.mp;
        let rounds = 0;
        const maxRounds = 15;
        const combatLog = [];

        // 检测伪装】
        const spies = squad.filter(h => h.talent[201]);
        const realHeroes = squad.filter(h => !h.talent[201]);
        const hasSpy = spies.length > 0;
        // 每有一个伪装者，全队属【25%（对怪物也有效，因为伪装者在拖后腿）
        const attrMod = Math.max(0.25, 1 - spies.length * 0.25);

        // 叛变检测：勇者总HP < (伪装者HP + 怪物HP) * 0.25 时叛】
        let betrayed = false;
        if (hasSpy && realHeroes.length > 0) {
            const totalHeroHp = realHeroes.reduce((s, h) => s + h.hp, 0);
            const spyTotalHp = spies.reduce((s, h) => s + h.hp, 0);
            if (totalHeroHp < (spyTotalHp + monster.hp) * 0.25) {
                betrayed = true;
                combatLog.push(`⚠️ ${spies.map(s => s.name).join('、')} 叛变了！转而攻击勇者！`);
            }
        }

        // 收集所有参与者并按速度排序
        const actors = [];
        for (const member of squad) {
            actors.push({
                type: 'hero',
                entity: member,
                spd: member.cflag[CFLAGS.SPD] || 10 + member.level * 2,
                name: member.name,
                isSpy: !!member.talent[201]
            });
        }
        actors.push({
            type: 'monster',
            entity: monster,
            spd: monster.spd,
            name: monster.name
        });

        while (rounds < maxRounds && monHp > 0) {
            const aliveHeroes = squad.filter(h => h.hp > 0);
            if (aliveHeroes.length === 0) break;

            rounds++;

            // 每回合按速度重新排序
            actors.sort((a, b) => b.spd - a.spd);

            for (const actor of actors) {
                if (monHp <= 0) break;

                if (actor.type === 'hero' && actor.entity.hp > 0) {
                    const hero = actor.entity;
                    if (actor.isSpy) {
                        // 伪装者消极作战：不攻击怪物
                        // 如果已叛变，攻击勇者方HP最低】
                        if (betrayed) {
                            const aliveTargets = realHeroes.filter(h => h.hp > 0);
                            if (aliveTargets.length > 0) {
                                const target = aliveTargets.reduce((min, h) => h.hp < min.hp ? h : min, aliveTargets[0]);
                                const spyAtk = Math.floor((hero.cflag[CFLAGS.ATK] || 20) * 0.5); // 叛变后只【0%攻击】
                                const dmg = Math.max(1, spyAtk - (target.cflag[CFLAGS.DEF] || 15));
                                target.hp = Math.max(0, target.hp - dmg);
                                combatLog.push(`💀 ${hero.name}(叛变)攻击${target.name}，造成${dmg}伤害`);
                            }
                        } else {
                            combatLog.push(`😶 ${hero.name}(伪装【消极作战，没有攻击`);
                        }
                        continue;
                    }
                    const gBonus = GearSystem.applyGearBonus(hero, !!hero.talent[200]); // 奴隶(talent[200])免疫诅咒
                    const heroAtk = Math.floor(((hero.cflag[CFLAGS.ATK] || 20) + (gBonus.atk || 0)) * attrMod);
                    const dmg = Math.max(1, heroAtk - monster.def);
                    monHp -= dmg;
                    combatLog.push(`${hero.name}攻击${monster.name}，造成${dmg}伤害`);
                } else if (actor.type === 'monster' && monHp > 0) {
                    // 怪物攻击小队中HP最低且存活的成员（优先攻击非伪装者）
                    let aliveTargets = squad.filter(h => h.hp > 0);
                    if (aliveTargets.length === 0) break;
                    // 优先攻击非伪装】
                    const realTargets = aliveTargets.filter(h => !h.talent[201]);
                    const target = realTargets.length > 0
                        ? realTargets.reduce((min, h) => h.hp < min.hp ? h : min, realTargets[0])
                        : aliveTargets.reduce((min, h) => h.hp < min.hp ? h : min, aliveTargets[0]);
                    const monAtk = Math.floor(monster.atk * (hasSpy && !betrayed ? 1.25 : 1)); // 有伪装者时怪物更强
                    const tBonus = GearSystem.applyGearBonus(target, !!target.talent[200]);
                    const targetDef = (target.cflag[CFLAGS.DEF] || 15) + (tBonus.def || 0);
                    const monDmg = Math.max(1, monAtk - targetDef);
                    target.hp = Math.max(0, target.hp - monDmg);
                    combatLog.push(`${monster.name}攻击${target.name}，造成${monDmg}伤害`);
                }
            }
        }

        const victory = monHp <= 0;
        const allDefeated = squad.filter(h => !h.talent[201]).every(h => h.hp <= 0); // 只有真勇者全灭才【defeat
        const survivors = squad.filter(h => h.hp > 0);

        let drop = null;
        if (victory) {
            const expPerMember = Math.floor(monster.level * 10 / survivors.length);
            for (const hero of survivors) {
                if (!hero.talent[201]) hero.exp[0] = (hero.exp[0] || 0) + expPerMember;
            }
            combatLog.push(`【小队击败【{monster.name}与战斗${rounds}回合) 每人获得${expPerMember}EXP`);
            // 战斗掉落
            if (Math.random() < 0.30) {
                const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
                const slot = slotTypes[RAND(slotTypes.length)];
                drop = GearSystem.generateGear(slot, monster.level);
                const lucky = survivors[RAND(survivors.length)];
                const r = GearSystem.equipItem(lucky, drop);
                if (r.success) combatLog.push(`🎁 ${lucky.name}获得【{r.msg}`);
            }
        } else if (allDefeated) {
            combatLog.push(`【小队】{monster.name}全灭【..`);
        } else {
            combatLog.push(`【小队】{monster.name}陷入僵局后撤退`);
        }

        return { victory, defeated: allDefeated, escaped: !victory && !allDefeated, rounds, combatLog, monster, betrayed };
    }

    // 生成入侵勇】
    generateHero() {
        const cfg = HERO_INVASION_CONFIG;
        const femaleRatio = this.flag[500] || 90;
        const isFemale = RAND(100) < femaleRatio;
        const template = isFemale ? cfg.heroTemplates.female : cfg.heroTemplates.male;
        const pools = template.namePools;
        const cultures = Object.keys(pools);
        const culture = cultures[RAND(cultures.length)];
        const pool = pools[culture];
        const family = pool.family[RAND(pool.family.length)];
        const given = pool.given[RAND(pool.given.length)];
        const name = template.namePrefix + family + given;
        let power = Math.floor(1 + this.day * cfg.powerScale);
        if (power > 200) power = 200; // 等级上限200
        const hero = new Character(-2);
        hero.name = name;
        hero.callname = name;
        hero.base[0] = 1000 + power * 200 + RAND(power * 100);
        hero.maxbase[0] = hero.base[0];
        hero.hp = hero.base[0];
        hero.base[1] = 500 + power * 100;
        hero.maxbase[1] = hero.base[1];
        hero.mp = hero.base[1];
        hero.level = power;
        hero.cflag[CFLAGS.BASE_HP] = power;
        hero.cflag[CFLAGS.ATK] = 20 + power * 5;  // 攻击【        hero.cflag[CFLAGS.DEF] = 15 + power * 4;  // 防御【        hero.cflag[CFLAGS.SPD] = 10 + power * 3;  // 敏捷(速度)
        // 勇者初始金币（新平衡）
        hero.gold = Math.floor(power * power + RAND(power * 10));
        if (!isFemale) hero.talent[122] = 1; // 男性（女性不设置talent[122]【        // 随机勇者性格
        const personalities = [10, 11, 12, 13, 14, 15, 16, 17, 18];
        hero.talent[personalities[RAND(personalities.length)]] = 1;
        return hero;
    }

    // 处理勇者入】
    processHeroInvasion() {
        if (this.day < this.nextInvasionDay) return null;
        const cfg = HERO_INVASION_CONFIG;
        // 设置下次入侵
        this.nextInvasionDay = this.day + RAND_RANGE(cfg.intervalMin, cfg.intervalMax);
        // 生成勇】
        const hero = this.generateHero();
        this.invaders.push(hero);
        return hero;
    }

    // 处理地下城探索（勇者遭遇事件）
    processDungeonEvent(hero) {
        // 收集可用事件
        const available = [];
        for (const [id, def] of Object.entries(DUNGEON_EVENT_DEFS)) {
            let ok = true;
            if (def.requireFacility) {
                for (const [fid, minLv] of Object.entries(def.requireFacility)) {
                    if (this.getFacilityLevel(parseInt(fid)) < minLv) { ok = false; break; }
                }
            }
            if (ok) available.push({ id: parseInt(id), ...def });
        }
        if (available.length === 0) return null;
        // 按权重随】
        const totalWeight = available.reduce((s, e) => s + e.weight, 0);
        let roll = RAND(totalWeight);
        for (const e of available) {
            roll -= e.weight;
            if (roll < 0) return e;
        }
        return available[available.length - 1];
    }

    // ========== 魔王等级 ==========
    getMasterRank() {
        const exp = this.masterExp || 0;
        for (let i = MASTER_RANK_EXP.length - 1; i >= 0; i--) {
            if (exp >= MASTER_RANK_EXP[i]) return i;
        }
        return 0;
    }

    getMasterRankName() {
        return MASTER_RANK_NAMES[this.getMasterRank()] || "新手调教者";
    }

    // ========== 过滤【==========
    toggleFilter(groupBit) {
        this.commandFilter ^= (1 << groupBit);
        if (this.state === "TRAIN") UI.renderTrain(this);
    }

    isGroupFiltered(groupName) {
        const map = { "caress":0, "tool":1, "vaginal":2, "anal":3, "service":4, "sm":5, "rough":6, "monster":7, "assistant":8, "arena":9 };
        const bit = map[groupName];
        if (bit === undefined) return false;
        return (this.commandFilter & (1 << bit)) !== 0;
    }
}

window.Game = Game;
