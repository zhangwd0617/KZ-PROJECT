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
        this.bystander = -1;  // 副奴隶索引(P2+)

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

        // 楼层进度宝箱全局状态（25%/50%/75%共享，10天刷新）
        // { floorId: { refreshDay: number, takenMask: number } }
        // takenMask: 1=25%被拿, 2=50%被拿, 4=75%被拿
        this._floorChestState = {};

        // 系统模块
        this.dialogueSystem = new DialogueSystem();
        this.trainSystem = new TrainSystem(this);
        this.shopSystem = new ShopSystem(this);
        this.dayEndSystem = new DayEndSystem(this);
        this.eventSystem = new EventSystem(this);

        // 相性系统：勇者之间的关系记录
        // key: "nameA|nameB"(按字母序), value: { level: 0-4, history: [{day, event, delta}] }
        this._heroRelations = {};
    }

    // ========== Character management ==========
    addChara(templateId) {
        const c = CharaTemplates.create(templateId) || new Character(templateId);
        if (c.affinity === 50 && typeof RACE_AFFINITY !== 'undefined') {
            c.affinity = this.generateAffinity(c);
        }
        this.characters.push(c);
        return this.characters.length - 1;
    }

    addCharaFromTemplate(charaObj) {
        if (charaObj.affinity === 50 && typeof RACE_AFFINITY !== 'undefined') {
            charaObj.affinity = this.generateAffinity(charaObj);
        }
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
            if (ch) ch.cflag[600] = 0;
        }
        if (index < 0 || index === this.master) return true; // 仅解除婚约
        const c = this.getChara(index);
        if (!c) return false;
        c.cflag[600] = 1;
        return true;
    }

    // ========== State switching ==========
    setState(newState, data = null) {
        this.prevState = this.state;
        this.state = newState;

        // 离开 TRAIN 状态时清理调教布局
        if (this.prevState === 'TRAIN' && newState !== 'TRAIN') {
            const gc = document.getElementById('game-container');
            if (gc) gc.classList.remove('train-layout');
            UI._trainTextInited = false;
        }

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
        master.talent[94] = 1; // 灭世魔王（主角专属：调教效果+50%）
        // 魔王初始10级，攻防默认100，其他属性按勇者power=10公式
        master.level = 10;
        master.cflag[9] = 10;
        master.cflag[11] = 100; // 攻击默认100
        master.cflag[12] = 100; // 防御默认100
        master.cflag[13] = 10 + 10 * 3; // 速度按勇者公式
        master.base[0] = 1000 + 10 * 200 + RAND(10 * 100);
        master.maxbase[0] = master.base[0];
        master.hp = master.base[0];
        master.base[1] = 500 + 10 * 100;
        master.maxbase[1] = master.base[1];
        master.mp = master.base[1];
        master.affinity = this.generateAffinity(master);
        this.master = this.addCharaFromTemplate(master);

        // Initial slave: fully random generated
        const slave = CharaTemplates.createRandomSlave(1, 5);
        if (slave) {
            slave.cflag[1] = 1; // Captured status
            slave.affinity = this.generateAffinity(slave);
            this.addCharaFromTemplate(slave);
        }

        this.money = 3000;
        this.day = 1;
        this.nextInvasionDay = 1; // 新机制：每天自动刷新勇者
        this.flag[500] = HERO_INVASION_CONFIG.defaultGenderRatio; // 勇者女性比例(默认90%)
        this.flag[501] = 2; // 日常事件数量 (默认2个
        this.flag[503] = 0; // 魔王声望 (初始0)

        // Opening story
        UI.appendText("━━━━━━━━━━━━━━━━━━━━━━━━\n");
        UI.appendText("　　【序章：魔王的觉醒】\n");
        UI.appendText("━━━━━━━━━━━━━━━━━━━━━━━━\n\n");
        UI.appendText("在黑暗的王座之间，沉睡了千年的魔王缓缓睁开了双眼。\n");
        UI.appendText("腐朽的城堡重新升腾起魔力的雾气，魔族的眷属们从石棺中苏醒。\n\n");
        UI.appendText("\u300c\u543e\u4e3b\uff0c\u6b22\u8fce\u5f52\u6765\u3002\u300d\n");
        UI.appendText("忠诚的臣仆跪伏在地，向新生的魔王献上敬意。\n\n");
        UI.appendText("然而，久远的沉睡让魔王的魔力几近枯竭。\n");
        UI.appendText("想要恢复昔日的力量，就需要“养分”——人类的欲望与快感的结晶。\n\n");
        UI.appendText("\u300c\u53bb\uff0c\u4e3a\u543e\u4e3b\u6293\u6765\u5408\u9002\u7684\u730e\u7269\u3002\u300d\n\n");
        UI.appendText("魔族的爪牙潜入夜色之中。\n");
        UI.appendText("它们的目标是边境村庄里，那个传闻中纯洁而倔强的乡下少女...\n\n");
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
        this.bystander = (data && data.bystander !== undefined) ? data.bystander : -1;
        UI._trainHistory = [];
        UI._trainTextInited = false;

        // Reset part gauges for new train session
        if (target.partGauge) target.partGauge.fill(0);
        if (target.orgasmCooldown) target.orgasmCooldown.fill(0);
        target.totalOrgasmGauge = 0;
        target.isCharging = false;
        target.chargeLevel = 0;
        target.chargeTurns = 0;

        // Train start dialogue
        this.dialogueSystem.onTrainStart(target);

        UI.renderTrain(this);
    }

    selectCommand(comId) {
        // 保存上次指令记录到历史，并清空当前显示
        if (this.trainCount > 0 && this.selectcom >= 0) {
            const prevDef = TRAIN_DEFS[this.selectcom];
            UI._saveTrainHistory(this.trainCount, prevDef?.name || '未知');
        }
        UI._clearTrainCurrent();

        this.selectcom = comId;

        // === NEW (P2/P4): Master skills, assistant, recovery commands ===
        if (comId === 990) {
            UI.showReleasePreview();
            return;
        } else if (comId >= 989 && comId <= 992) {
            this._executeMasterSkill(comId);
        } else if (comId === 900 || comId === 901) {
            this._executeAssistantCommand(comId);
        } else if (comId === 998 || comId === 999) {
            this._executeRecovery(comId);
        } else {
            this.trainSystem.execute(comId);
        }
        this.trainCount++;

        // Check if target HP depleted
        const target = this.getTarget();
        if (target && target.hp <= 0) {
            UI.appendText(`\n【${target.name}\u660f\u4e86\u8fc7\u53bb\u2026\u2026】\n`);
            this.setState("AFTERTRAIN");
            return;
        }

        // 继续显示训练界面
        UI.renderTrain(this);
    }

    _executeMasterSkill(comId) {
        const target = this.getTarget();
        if (!target) return;
        const master = this.getMaster();
        switch (comId) {
            case 989:
                UI.appendText(`\n\u2500\u2500\u2500\u2500 \u5f3a\u5236\u7edd\u9876 [#${this.trainCount + 1}] \u2500\u2500\u2500\u2500\n`);
                UI.appendText(`${master.name}\u4f7f\u7528\u9b54\u529b\u5f3a\u5236${target.name}\u8fbe\u5230\u7edd\u9876\uff01\n`, "danger");
                for (let i = 0; i < 8; i++) target.addPartGain(i, 500);
                if (typeof calculateTotalGauge === 'function') calculateTotalGauge(target);
                if (typeof checkOrgasm === 'function') {
                    const result = checkOrgasm(target);
                    if (result && result.canClimax && typeof applyOrgasm === 'function') {
                        const o = applyOrgasm(target, result);
                        if (o && o.msg) UI.appendText(o.msg + "\n", "accent");
                        if (o && o.line) UI.appendText(o.line + "\n", "info");
                    }
                }
                master.mp -= 50;
                break;
            case 990:
                UI.appendText(`\n\u2500\u2500\u2500\u2500 \u91ca\u653e\u8bb8\u53ef [#${this.trainCount + 1}] \u2500\u2500\u2500\u2500\n`);
                UI.appendText(`${master.name}\u5141\u8bb8${target.name}\u91ca\u653e\u79ef\u84c4\u7684\u5feb\u611f\u2026\u2026\n`, "info");
                if (target.isCharging && target.chargeLevel > 0) {
                    target.isCharging = false;
                    const releaseMult = 1.0 + target.chargeLevel * 0.5;
                    for (let i = 0; i < 8; i++) {
                        target.addPartGain(i, Math.floor((target.partGauge[i] || 0) * releaseMult * 0.3));
                    }
                    if (typeof calculateTotalGauge === 'function') calculateTotalGauge(target);
                    if (typeof checkOrgasm === 'function') {
                        const result = checkOrgasm(target);
                        if (result && result.canClimax && typeof applyOrgasm === 'function') {
                            const o = applyOrgasm(target, result);
                            if (o && o.msg) UI.appendText(o.msg + "\n", "accent");
                            if (o && o.line) UI.appendText(o.line + "\n", "info");
                        }
                    }
                    target.chargeLevel = 0;
                    target.chargeTurns = 0;
                } else {
                    UI.appendText(`\u4f46${target.name}\u5e76\u6ca1\u6709\u5728\u84c4\u529b\u2026\u2026\n`, "dim");
                }
                break;
            case 991:
                UI.appendText(`\n\u2500\u2500\u2500\u2500 \u8fb9\u7f18\u63a7\u5236 [#${this.trainCount + 1}] \u2500\u2500\u2500\u2500\n`);
                UI.appendText(`${master.name}\u5728${target.name}\u5373\u5c06\u7edd\u9876\u7684\u77ac\u95f4\u963b\u6b62\u4e86\u5feb\u611f\u2026\u2026\n`, "warning");
                target.isCharging = true;
                target.chargeLevel = Math.min(3, (target.chargeLevel || 0) + 1);
                target.chargeTurns = 0;
                UI.appendText(`\u3010${target.name}\u8fdb\u5165\u84c4\u529b\u72b6\u6001 C${target.chargeLevel}\u3011\n`, "accent");
                break;
            case 992:
                UI.appendText(`\n\u2500\u2500\u2500\u2500 \u5f3a\u5236\u84c4\u529b [#${this.trainCount + 1}] \u2500\u2500\u2500\u2500\n`);
                UI.appendText(`${master.name}\u5f3a\u8feb${target.name}\u5fcd\u8010\u5feb\u611f\uff0c\u5f00\u59cb\u84c4\u529b\u2026\u2026\n`, "danger");
                target.isCharging = true;
                target.chargeLevel = Math.min(4, (target.chargeLevel || 0) + 1);
                target.chargeTurns = 0;
                if (target.chargeLevel >= 4) {
                    UI.appendText(`\u3010${target.name}\u8fbe\u5230Overcharge\u72b6\u6001\uff01\u98ce\u9669\u6781\u9ad8\uff01\u3011\n`, "danger");
                } else {
                    UI.appendText(`\u3010${target.name}\u8fdb\u5165\u84c4\u529b\u72b6\u6001 C${target.chargeLevel}\u3011\n`, "accent");
                }
                target.energy -= 10;
                break;
        }
    }

    _executeAssistantCommand(comId) {
        const assi = this.getAssi();
        const target = this.getTarget();
        if (comId === 900) {
            if (!assi) { UI.appendText(`\u6ca1\u6709\u52a9\u624b\uff0c\u65e0\u6cd5\u4ee3\u884c\u3002\n`, "warning"); return; }
            UI.appendText(`\n${assi.name}\u4ee3\u66ff\u9b54\u738b\u6267\u884c\u8c03\u6559\uff0c${target.name}\u7684\u4f53\u9a8c\u7565\u6709\u4e0d\u540c\u2026\u2026\n`, "info");
            this.trainSystem.execute(this.selectcom >= 0 ? this.selectcom : 0);
            if (assi.energy !== undefined) assi.energy -= 5;
        } else if (comId === 901) {
            if (!assi) { UI.appendText(`\u6ca1\u6709\u52a9\u624b\uff0c\u65e0\u6cd5\u53c2\u4e0e\u3002\n`, "warning"); return; }
            UI.appendText(`\n${assi.name}\u52a0\u5165\u4e86\u8c03\u6559\uff0c${target.name}\u7684\u5feb\u611f\u500d\u589e\uff01\n`, "info");
            this.trainSystem.execute(this.selectcom >= 0 ? this.selectcom : 0);
            if (target.addPartGain) for (let i = 0; i < 8; i++) target.addPartGain(i, Math.floor((target.partGauge[i] || 0) * 0.2));
            if (assi.energy !== undefined) assi.energy -= 3;
        }
    }

    _executeRecovery(comId) {
        const target = this.getTarget();
        const master = this.getMaster();
        if (!target) return;
        const meta = (typeof TRAIN_COMMAND_META !== 'undefined') ? TRAIN_COMMAND_META[comId] : null;
        const stmHeal = meta ? (Math.abs(meta.staminaCost?.target || 0)) : (comId === 999 ? 30 : 20);
        const nrgHeal = meta ? (Math.abs(meta.energyCost?.target || 0)) : (comId === 999 ? 15 : 10);

        if (comId === 998) {
            UI.appendText(`\n\u2500\u2500\u2500\u2500 \u5b89\u629a [#${this.trainCount + 1}] \u2500\u2500\u2500\u2500\n`);
            UI.appendText(`${master.name}\u6e29\u67d4\u5730\u5b89\u629a\u4e86${target.name}\u2026\u2026\n`, "info");
        } else {
            UI.appendText(`\n\u2500\u2500\u2500\u2500 \u4f11\u606f [#${this.trainCount + 1}] \u2500\u2500\u2500\u2500\n`);
            UI.appendText(`${master.name}\u8ba9${target.name}\u7565\u4f5c\u4f11\u606f\u2026\u2026\n`, "info");
        }

        if (target.stamina !== undefined) target.stamina = Math.min(target.maxbase[2] || 1000, target.stamina + stmHeal);
        if (target.energy !== undefined) target.energy = Math.min(target.maxEnergy || 500, (target.energy || 0) + nrgHeal);
        target.base[2] = target.stamina || target.base[2];
        target.hp = Math.min(target.maxhp || target.hp, target.hp + stmHeal);

        UI.appendText(`\u4f53\u529b+${stmHeal} \u6c14\u529b+${nrgHeal}\n`, "success");
    }

    endTrain() {
        this.setState("AFTERTRAIN");
    }

    switchTrainTarget() {
        const assi = this.getAssi();
        const target = this.getTarget();
        if (!assi || !target) return;
        // 交换 target 和 assi
        const tmp = this.target;
        this.target = this.assi;
        this.assi = tmp;
        // 重置调教状态
        const newTarget = this.getTarget();
        if (newTarget) {
            newTarget.resetForTrain();
        }
        this.trainCount = 0;
        this.selectcom = -1;
        this.tflag.fill(0);
        UI._trainTextInited = false;
        UI.renderTrain(this);
    }

    // ========== AFTERTRAIN ==========

    /**
     * 基础素质自动获取：技能Lv + EXP达标时自动获得
     * 在调教过程中实时检查，也在调教结束后最终确认
     */
    checkAutoTalents(chara) {
        if (!chara) return [];
        const newTalents = [];
        const conditions = [
            // === 身体感觉类 ===
            { id: 42, name: '容易湿', check: c => c.abl[2] >= 2 && !c.talent[42] },
            { id: 230, name: '淫核感觉上升', check: c => c.abl[0] >= 3 && c.exp[11] >= 25 && c.exp[2] >= 25 && !c.talent[230] },
            { id: 231, name: '淫乳感觉上升', check: c => c.abl[1] >= 3 && c.exp[54] >= 15 && c.exp[2] >= 25 && !c.talent[231] },
            { id: 232, name: '淫壶感觉上升', check: c => c.abl[2] >= 3 && c.exp[0] >= 25 && c.exp[2] >= 25 && !c.talent[232] },
            { id: 233, name: '淫肛感觉上升', check: c => c.abl[3] >= 3 && c.exp[32] >= 25 && c.exp[2] >= 25 && !c.talent[233] },
            { id: 136, name: '淫核', check: c => c.abl[11] >= 3 && c.exp[56] >= 25 && !c.talent[136] },

            // === 淫荡行为类 ===
            { id: 60, name: '容易自慰', check: c => c.exp[10] >= 15 && !c.talent[60] },
            { id: 74, name: '自慰狂', check: c => (c.exp[10] >= 60 || c.exp[11] >= 30) && c.abl[31] >= 2 && !c.talent[74] },
            { id: 75, name: '性交狂', check: c => c.exp[4] >= 60 && c.abl[30] >= 2 && !c.talent[75] },
            { id: 76, name: '淫乱', check: c => c.mark[1] >= 2 && c.abl[11] >= 3 && !c.talent[76] },
            { id: 77, name: '尻穴狂', check: c => c.exp[1] >= 60 && c.abl[3] >= 3 && !c.talent[77] },
            { id: 78, name: '乳狂', check: c => c.exp[35] >= 60 && c.abl[1] >= 3 && !c.talent[78] },
            { id: 47, name: '精液爱好', check: c => c.exp[20] >= 30 && c.abl[32] >= 2 && !c.talent[47] },
            { id: 52, name: '擅用舌头', check: c => c.exp[22] >= 30 && c.abl[4] >= 3 && !c.talent[52] },

            // === SM/异常类 ===
            { id: 88, name: '被虐狂', check: c => (c.exp[30] >= 30 || c.exp[51] >= 15) && c.abl[21] >= 2 && !c.talent[88] },
            { id: 83, name: '施虐狂', check: c => c.exp[33] >= 30 && c.abl[20] >= 2 && !c.talent[83] },
            { id: 89, name: '露出狂', check: c => c.abl[17] >= 2 && c.abl[36] >= 1 && !c.talent[89] },
            { id: 80, name: '变态', check: c => c.exp[50] >= 25 && !c.talent[80] },
            { id: 72, name: '容易上瘾', check: c => c.exp[57] >= 15 && !c.talent[72] },
            { id: 70, name: '接受快感', check: c => c.mark[1] >= 1 && c.abl[11] >= 2 && !c.talent[70] },
            { id: 73, name: '容易陷落', check: c => c.mark[2] >= 1 && c.exp[23] >= 25 && !c.talent[73] },

            // === 情感/精神类 ===
            { id: 85, name: '爱慕', check: c => c.mark[2] >= 2 && c.abl[10] >= 2 && c.exp[23] >= 15 && !c.talent[85] },

            // === 特殊职业/倾向 ===
            { id: 158, name: '同性恋', check: c => (c.exp[40] >= 10 || c.exp[41] >= 10) && !c.talent[158] },
            { id: 180, name: '娼妇', check: c => c.exp[74] >= 25 && (c.mark[4] || 0) <= 1 && c.abl[11] >= 2 && !c.talent[180] },
            { id: 188, name: '母性', check: c => c.exp[60] >= 15 && !c.talent[188] },
            { id: 57, name: '抄袭者', check: c => c.exp[31] >= 15 && !c.talent[57] },

            // === 崩坏 ===
            { id: 9, name: '崩坏', check: c => c.mark[0] >= 3 && c.mark[6] >= 2 && !c.talent[9] },

            // === 魅力 ===
            { id: 91, name: '魅惑', check: c => c.abl[10] >= 3 && c.abl[11] >= 2 && c.mark[1] >= 2 && !c.talent[91] && !c.talent[92] },
            { id: 93, name: '压迫感', check: c => c.mark[0] >= 2 && c.abl[20] >= 2 && c.abl[21] >= 2 && !c.talent[93] },
        ];
        for (const cond of conditions) {
            if (cond.check(chara)) {
                chara.talent[cond.id] = 1;
                newTalents.push(cond);
            }
        }
        return newTalents;
    }

    /**
     * 上位Talent升级判定：仅在调教结束后根据最终数值判定
     * 上位Talent需要前置素质作为基础，是素质进化的最终形态
     */
    _checkAdvancedTalentUpgrade(chara) {
        if (!chara) return [];
        const newTalents = [];
        const conditions = [
            // === 四淫感觉上升 → 淫魔 ===
            { id: 272, name: '淫魔', check: c => c.talent[230] && c.talent[231] && c.talent[232] && c.talent[233] && !c.talent[272] },
            // === 爱慕/淫乱 → 挚爱 ===
            { id: 182, name: '挚爱', check: c => ((c.talent[85] && c.exp[23] >= 80 && c.abl[10] >= 4) || (c.talent[76] && c.exp[23] >= 60 && c.abl[10] >= 3)) && !c.talent[182] },
            // === 崩坏+洗脑 → 重塑 ===
            { id: 183, name: '重塑', check: c => c.talent[9] && c.mark[0] >= 3 && (c.mark[6] || 0) >= 2 && c.exp[81] >= 5 && !c.talent[183] },
            // === 爱慕/淫乱/重塑 → 盲信 ===
            { id: 86, name: '盲信', check: c => ((c.talent[85] && c.exp[81] >= 3 && c.abl[10] >= 3) || (c.talent[76] && c.exp[81] >= 5 && c.abl[10] >= 4) || (c.talent[183] && c.exp[81] >= 3 && c.abl[10] >= 3)) && !c.talent[86] },
            // === 魅惑 → 谜之魅力 ===
            { id: 92, name: '谜之魅力', check: c => c.talent[91] && c.abl[10] >= 4 && c.abl[11] >= 3 && c.mark[1] >= 3 && !c.talent[92] },
            // === 娼妇 → 卖春 ===
            { id: 181, name: '卖春', check: c => c.exp[74] >= 50 && (c.mark[4] || 0) <= 1 && c.talent[180] && !c.talent[181] },
        ];
        for (const cond of conditions) {
            if (cond.check(chara)) {
                chara.talent[cond.id] = 1;
                newTalents.push(cond);
            }
        }
        return newTalents;
    }

    eventAfterTrain() {
        const target = this.getTarget();
        const assi = this.getAssi();
        const bystander = this.bystander >= 0 ? this.characters[this.bystander] : null;

        if (target) {
            // train end dialogue
            this.dialogueSystem.onTrainEnd(target);
            target.endTrain();

            // === NEW (P2): Route EXP settlement from source ===
            if (target.source) {
                const routeMap = [
                    { palam: 4,  route: 0 },   // 顺从
                    { palam: 5,  route: 1 },   // 欲情 -> 欲望
                    { palam: 16, route: 2 },   // 痛苦
                    { palam: 8,  route: 3 },   // 羞耻 -> 露出
                    { palam: 20, route: 4 }    // 支配(反感/支配感)
                ];
                for (const m of routeMap) {
                    const val = target.source[m.palam] || target.palam[m.palam] || 0;
                    if (val > 0 && target.addRouteExp) {
                        target.addRouteExp(m.route, Math.floor(val / 100));
                    }
                }
            }

            // === NEW (P2): Train level EXP ===
            if (target.addTrainExp) {
                target.addTrainExp(Math.floor(this.trainCount * 2));
            }

            // === NEW (P2): Energy natural decay ===
            if (target.energy !== undefined) {
                target.energy -= 2;
            }

            // === NEW (P2): Charge reaction settlement ===
            if (target.isCharging && target.chargeLevel > 0) {
                const pEff = target.getPersonalityEffects ? target.getPersonalityEffects() : null;
                if (pEff && pEff.activeModes && pEff.activeModes.length > 0) {
                    UI.appendText(`【${target.name}\u5728${pEff.activeModes.join('/')}\u6a21\u5f0f\u4e0b\u7ee7\u7eed\u84c4\u529b...】\n`, "info");
                }
                target.chargeTurns++;
                // === NEW (P5): Personality charge event ===
                if (typeof getChargeEvent === 'function') {
                    const ev = getChargeEvent(target);
                    if (ev) UI.appendText(ev + "\n", "dim");
                }
                // Risk of overcharge collapse
                const chargeInfo = (typeof CHARGE_LEVELS !== 'undefined') ? CHARGE_LEVELS[target.chargeLevel] : null;
                if (chargeInfo && chargeInfo.risk > 0 && Math.random() < chargeInfo.risk) {
                    UI.appendText(`【${target.name}\u5728\u84c4\u529b\u4e2d\u5931\u63a7\u4e86\uff01】\n`, "danger");
                    target.isCharging = false;
                    target.chargeLevel = 0;
                    target.chargeTurns = 0;
                }
            }

            // === NEW (P2): Check talent tree first ===
            if (target.checkTalentTree) {
                const treeResults = target.checkTalentTree();
                for (const r of treeResults) {
                    if (r && r.msg) UI.appendText(r.msg + "\n", "accent");
                }
            }

            // === NEW (P2): Hidden trait unlock check ===
            if (target.checkHiddenTraitUnlock) {
                const hiddenResult = target.checkHiddenTraitUnlock();
                if (hiddenResult) {
                    UI.appendText(hiddenResult.msg + "\n", "accent");
                    if (hiddenResult.unlockLine) UI.appendText(hiddenResult.unlockLine + "\n", "dim");
                }
            }

            // 最终确认基础素质
            const targetNew = this.checkAutoTalents(target);
            for (const t of targetNew) {
                UI.appendText(`【${target.name}获得了"${t.name}"的素质！】\n`, "accent");
            }
            // 上位Talent升级判定（仅在调教结束后）
            const targetAdvanced = this._checkAdvancedTalentUpgrade(target);
            for (const t of targetAdvanced) {
                UI.appendText(`【${target.name}的素质进化为"${t.name}"！】\n`, "accent");
            }
        }

        if (assi) {
            // === NEW (P2): Assistant energy decay ===
            if (assi.energy !== undefined) assi.energy -= 1;

            const assiNew = this.checkAutoTalents(assi);
            for (const t of assiNew) {
                UI.appendText(`【${assi.name}获得了"${t.name}"的素质！】\n`, "accent");
            }
            const assiAdvanced = this._checkAdvancedTalentUpgrade(assi);
            for (const t of assiAdvanced) {
                UI.appendText(`【${assi.name}的素质进化为"${t.name}"！】\n`, "accent");
            }
        }

        // === NEW (P2): Bystander processing ===
        if (bystander) {
            this.processBystander(bystander, target);
        }

        // Reset bystander for next train
        this.bystander = -1;

        UI.renderAfterTrain(this);
    }

    processBystander(bystander, target) {
        if (!bystander || !target) return;
        // 副奴获得主奴20%旁观PALAM（转化为对应部位快感值的20%）
        if (bystander.partGauge && target.partGauge) {
            for (let i = 0; i < 8; i++) {
                const val = target.partGauge[i] || 0;
                if (val > 0 && bystander.addPartGain) {
                    bystander.addPartGain(i, Math.floor(val * 0.2));
                }
            }
        }
        // 固定体力-3，气力-1
        if (bystander.stamina !== undefined) bystander.stamina -= 3;
        if (bystander.energy !== undefined) bystander.energy -= 1;

        // 检查副奴状态
        const states = [];
        if (bystander.energy < bystander.maxEnergy * 0.5) states.push("脸红");
        if (bystander.energy < bystander.maxEnergy * 0.3) states.push("移开视线");
        if (bystander.energy < bystander.maxEnergy * 0.2) states.push("请求参与");
        if (states.length > 0) {
            UI.appendText(`【${bystander.name}\u65c1\u89c2\u4e2d：${states.join(',')}】\n`, "dim");
        }
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

    doRouteTalentUp(talentId) {
        const target = this.getTarget();
        if (!target) return false;
        const node = (typeof TALENT_TREE !== 'undefined') ? TALENT_TREE[talentId] : null;
        if (!node) return false;
        const result = tryUnlockTalent(target, node);
        if (result && result.success) {
            UI.showToast(result.msg, "success");
            if (typeof applyRouteAccelerators === 'function') applyRouteAccelerators(target);
            return true;
        } else {
            UI.showToast(result.msg || '\u89e3\u9501\u5931\u8d25', "warning");
            return false;
        }
    }

    finishAblUp() {
        this.setState("TURNEND");
    }

    // ========== TURNEND ==========
    eventTurnEnd() {
        // Phase1: 日常结算（恢复,怀孕,事件,天数推进）
        this.dayEndSystem.processPhase1();
        if (this.time < 3) {
            this.time++;
        } else {
            this.time = 0;
        }

        // 回到主界面，等待玩家点击"观察勇者行动"
        this.setState("SHOP");
    }

    eventPhase2() {
        // Phase2: 勇者移动,战斗,奴隶探索
        try {
            this.dayEndSystem.processPhase2();
        } catch (e) {
            console.error('[eventPhase2] ERROR:', e);
            UI.showToast('勇者行动处理出错：' + e.message, 'danger');
        }
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
            museum: JSON.parse(JSON.stringify(this.museum)),
            _floorChestState: JSON.parse(JSON.stringify(this._floorChestState || {})),
            _heroRelations: JSON.parse(JSON.stringify(this._heroRelations || {}))
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
        this._floorChestState = data._floorChestState || {};
        this._heroRelations = data._heroRelations || {};
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
        slave.cflag[1] = 1;
        this.addCharaFromTemplate(slave);
        UI.showToast(`购买了【${slave.name}】！`);
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
        c.cflag[9] = c.level;
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
        if (this.money < 50000) return { success: false, msg: '金钱不足！需要50000G' };
        this.money -= 50000;
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
        // 如果是男性则变为无穴扶她
        if (c.talent[122]) {
            c.talent[122] = 0;
            c.talent[121] = 1;
            c.talent[123] = 1;
        }
        return { success: true, msg: `${c.name} 的乳腺被改造激活，开始泌乳。胸部变得更加丰满了...` };
    }

    bodyModifyFutanari(index) {
        const c = this.getChara(index);
        if (!c) return { success: false, msg: '角色不存在' };
        if (c.talent[121]) return { success: false, msg: `${c.name} 已经是扶她了` };
        if (this.money < 50000) return { success: false, msg: '金钱不足！需要50000G' };
        this.money -= 50000;
        c.talent[121] = 1;
        if (c.talent[122]) {
            // 男性→无穴扶她
            c.talent[122] = 0;
            c.talent[123] = 1;
            return { success: true, msg: `${c.name} 接受了扶她化改造，变成了无穴扶她。` };
        } else {
            // 女性→有穴扶她（保留处女状态）
            return { success: true, msg: `${c.name} 接受了扶她化改造，变成了有穴扶她。` };
        }
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
        this.addFame(3); // 制作标本 +3 声望
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
            specimen: `${chara.name}的遗体被魔王的炼金术士精心处理。肌肤被注入了防腐魔药，保持着生前最后的表情——那是混杂着恐惧与屈辱的神情。双眼被换成了宝石，在黑暗中依然倒映着魔王城的烛火。她的身体被摆成跪伏的姿态，仿佛仍在向魔王献上永恒的臣服。旁边的铭牌记载着她生前的等级与罪状："入侵魔王城，下场如此。"`
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
        this.addMuseumItem(removed, `没收${c.name}的装备`);
        return { success: true, gear: removed, msg: `没收了${removed.name}的装备` };
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
        return 9999; // 俘虏无上限
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
                    return { ok: false, reason: `需要先建造【${fdef?.name || '设施'}】Lv.${minLv}` };
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
        UI.showToast(`习得御敌策略【${def.name}】！`);
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
        this.addFame(10); // 地下城升级 +10 声望
        UI.showToast(`【${def.name}】升到Lv.${check.nextLv} ${up.description}（魔王声望 +10）`);
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
        return hero.cflag[501] || 1;
    }

    // 获取勇者当前层内进度(0-100)
    getHeroProgress(hero) {
        return hero.cflag[502] || 0;
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

        // 基础侵略进度：随等级上升，上限20%
        let moveSpeed;
        if (hero.level <= 50) {
            moveSpeed = 5 + Math.floor((hero.level - 1) * 15 / 49);
        } else {
            moveSpeed = 20; // 上限20%
        }

        // 层升级减缓
        if (floorLv >= 1) moveSpeed -= 1;
        if (floorLv >= 2) moveSpeed -= 1;
        if (floorLv >= 3) moveSpeed -= 1;

        // 高层地下城额外减缓侵略度（第6层起）
        if (floorId >= 6) {
            moveSpeed -= (floorId - 5); // 6层1%, 7层2%, 8层3%, 9层4%, 10层5%
        }

        // === 任务状态检查 ===
        const taskType = hero.cflag[980] || 0;
        const taskTargetFloor = hero.cflag[981] || 0;
        const hpPct = hero.maxHp > 0 ? hero.hp / hero.maxHp : 1;

        // 回城恢复：HP<30%时自动触发
        if (hpPct < 0.3 && taskType !== 3) {
            hero.cflag[980] = 3;
            hero.cflag[981] = 0;
            hero.cflag[982] = 0;
            hero.cflag[983] = 0;
            hero.cflag[984] = 0;
            hero.cstr[340] = '受到重创，紧急返回城镇恢复伤势';
        }

        if (taskType === 3) {
            // 回城恢复：强制向后移动
            moveSpeed = -Math.max(5, Math.floor(hero.level / 5));
            // 如果已在第1层且进度接近起点，直接回城
            if (floorId <= 1 && progress <= Math.abs(moveSpeed)) {
                hero.hp = Math.min(hero.maxHp, hero.hp + Math.floor(hero.maxHp * 0.5));
                hero.mp = Math.min(hero.maxMp, hero.mp + Math.floor(hero.maxMp * 0.3));
                this.clearHeroTask(hero);
                this._markDailyEventTriggered(hero);
                return { action: 'retreat_to_town', hero, results: { events: [{ type: 'event', name: '回城恢复', description: '受到重创后成功返回城镇恢复', icon: '🏥' }] }, moveSpeed, taskComplete: true };
            }
        }

        // === 安营扎寨判定 ===
        if (this._shouldCamp(hero)) {
            const campResult = this._doCamp(hero, moveSpeed);
            if (campResult) {
                // 将安营日志加入探索结果
                const campExplore = { speedMod: 0, hpDmg: 0, mpDmg: 0, results: { camp: campResult, events: [] } };
                campExplore.results.events.push(...campResult.logs);
                this._markDailyEventTriggered(hero);
                return { action: 'camp', hero, results: campExplore.results, moveSpeed: 0, campResult };
            }
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

        // === 守关Boss战判定 ===
        const oldProgress = this.getHeroProgress(hero);
        if (!explore.results._defeated && oldProgress < 100 && oldProgress + moveSpeed >= 100) {
            const bossMonster = this._spawnMonster(floorId, 'chief');
            let bossCombat = null;
            const squadId = hero.cflag[900];
            if (squadId && hero.cflag[901] === 1) {
                const squad = this.invaders.filter(h => h.cflag[900] === squadId);
                const reinforcements = this._findReinforcements(squad, floorId, oldProgress, 'hero');
                if (reinforcements.length > 0) {
                    for (const r of reinforcements) squad.push(r);
                }
                bossCombat = this._doTeamCombat(squad, [bossMonster]);
            } else if (!squadId) {
                const reinforcements = this._findReinforcements([hero], floorId, oldProgress, 'hero');
                const leftTeam = [hero, ...reinforcements];
                bossCombat = this._doTeamCombat(leftTeam, [bossMonster]);
            }
            if (bossCombat) {
                explore.results.leftTeam = bossCombat.leftTeam;
                explore.results.rightTeam = bossCombat.rightTeam;
                explore.results.events = explore.results.events || [];
                explore.results.events.push({
                    type: 'boss',
                    name: `⚔️ 守关Boss战`,
                    description: `${bossMonster.icon} ${bossMonster.name} Lv.${bossMonster.level}`,
                    icon: bossMonster.icon,
                    combatLog: bossCombat.combatLog,
                    victory: bossCombat.victory,
                    defeated: bossCombat.defeated
                });
                if (bossCombat.victory) {
                    // 检查讨伐任务完成
                    if ((hero.cflag[980] || 0) === 1 && (hero.cflag[981] || 0) === floorId) {
                        hero.cflag[984] = 1;
                        hero.cstr[340] += ' 【讨伐任务完成，准备返回城镇】';
                    }
                    // 通关地下城 + 击败Boss 声望奖励
                    const bossFame = 10 + floorId * 5;
                    hero.fame += bossFame;
                    // 关底宝箱奖励
                    const chestItem = this._generateChestLoot(hero.level, 'legendary', hero, floorId);
                    if (chestItem) {
                        const r = GearSystem.equipItem(hero, chestItem);
                        explore.results.events.push({
                            type: 'boss_chest',
                            name: '📦 关底宝箱',
                            description: r.msg || '获得传说级装备',
                            icon: '📦'
                        });
                    }
                    // 进入下一层
                    hero.cflag[501] = floorId + 1;
                    hero.cflag[502] = 0;
                    hero.cflag[503] = 0;
                    return { action: 'boss_victory', hero, floor: floorId + 1, results: explore.results, moveSpeed };
                } else {
                    // Boss战败或撤退：标记为 defeated
                    explore.results._defeated = true;
                    explore.results._monster = bossMonster;
                }
            }
        }

        // 检查状态，判断是否主动撤退
        const mpPct = hero.maxMp > 0 ? hero.mp / hero.maxMp : 1;

        // 如果被击败，进行逃跑判定
        if (explore.results._defeated) {
            const captureResult = this._processCapture(hero, explore.results._monster);

            if (captureResult.type === 'escape') {
                // 逃跑成功：侵略度-50%，不足则回上一层0%
                if (progress >= 50) {
                    hero.cflag[502] = progress - 50;
                    // 恢复少量状态以便继续入侵                    hero.hp = Math.max(1, Math.floor(hero.maxHp * 0.15));
                    hero.mp = Math.max(1, Math.floor(hero.maxMp * 0.1));
                    hero.cflag[911] = 1; // 被击败后保持低调
                    this._markDailyEventTriggered(hero);
                    return { action: 'defeat_escape', hero, results: explore.results, captureResult, moveSpeed: -50 };
                } else if (floorId > 1) {
                    hero.cflag[501] = floorId - 1;
                    hero.cflag[502] = 50;
                    hero.hp = Math.max(1, Math.floor(hero.maxHp * 0.15));
                    hero.mp = Math.max(1, Math.floor(hero.maxMp * 0.1));
                    hero.cflag[911] = 1; // 被击败后保持低调
                    this._markDailyEventTriggered(hero);
                    return { action: 'defeat_escape', hero, floor: floorId - 1, results: explore.results, captureResult, moveSpeed: -100 };
                } else {
                    // 第一层且进度<50%，只能回小镇
                    hero.cflag[911] = 1; // 被击败后保持低调
                    this._markDailyEventTriggered(hero);
                    return { action: 'retreat_to_town', hero, results: explore.results, captureResult, moveSpeed: -100 };
                }
            }

            // 逃跑失败：俘虏投降/入狱
            this._markDailyEventTriggered(hero);
            return { action: 'captured', hero, monster: explore.results._monster, captureResult, results: explore.results, moveSpeed: -100 };
        }

        const retreatChance = this._calcRetreatChance(hero, hpPct, mpPct);
        if (retreatChance > 0 && RAND(100) < retreatChance) {
            moveSpeed = -5; // 主动往回走
        }

        // 检查楼层设施
        const facilityEvents = this._checkFloorFacilities(hero, oldProgress, oldProgress + moveSpeed, floorId, explore);
        if (facilityEvents.length > 0) {
            explore.results.events = explore.results.events || [];
            explore.results.events.push(...facilityEvents);
        }
        if (facilityEvents._haltMove) {
            moveSpeed = 0;
        }

        // 检查进度宝箱（在更新进度前记录旧进度）
        const chestEvents = this._checkProgressChests(hero, oldProgress, oldProgress + moveSpeed, floorId);
        if (chestEvents.length > 0) {
            explore.results.chests = chestEvents;
        }

        // 更新进度
        progress += moveSpeed;

        // 处理边界情况
        if (progress >= 100) {
            hero.cflag[501] = floorId + 1;
            hero.cflag[502] = 0;
            hero.cflag[503] = 0; // 重置新楼层宝箱标记
            return { action: 'next_floor', hero, floor: floorId + 1, results: explore.results, moveSpeed };
        } else if (progress <= 0) {
            if (floorId <= 1) {
                return { action: 'retreat_to_town', hero, results: explore.results, moveSpeed };
            } else {
                hero.cflag[501] = floorId - 1;
                hero.cflag[502] = 80;
                return { action: 'prev_floor', hero, floor: floorId - 1, results: explore.results, moveSpeed };
            }
        } else {
            hero.cflag[502] = progress;
            return { action: 'move', hero, progress, results: explore.results, moveSpeed };
        }
    }

    // 检查进度宝箱：25%/50%/75%高级宝箱，100%传说宝箱
    _checkProgressChests(hero, oldProgress, newProgress, floorId) {
        const events = [];
        // 勇者用 cflag[503]，奴隶/前勇者用 cflag[704]
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
            // 进度宝箱（25%/50%/75%）全局共享：检查是否已被其他勇者获取
            if (t.type !== 'legendary') {
                const state = this._floorChestState[floorId];
                if (state && (state.takenMask & t.bit) !== 0) {
                    // 该宝箱已被拿走，仅清除个人掩码位（防止下次再提示）
                    hero.cflag[flagSlot] = (hero.cflag[flagSlot] || 0) | t.bit;
                    continue;
                }
                // 标记全局已被获取
                if (!this._floorChestState[floorId]) {
                    this._floorChestState[floorId] = { refreshDay: this.day + 10, takenMask: 0 };
                }
                this._floorChestState[floorId].takenMask |= t.bit;
            }
            hero.cflag[flagSlot] = (hero.cflag[flagSlot] || 0) | t.bit;
            // 宝箱金币奖励（新平衡：与楼层²挂钩）
            const goldBase = t.type === 'legendary' ? 500 : 100;
            const goldGain = Math.floor(goldBase * floorId * floorId);
            hero.gold += goldGain;
            const item = this._generateChestLoot(hero.level, t.type, hero, floorId);
            let equipResult = null;
            let disputeText = '';
            // 分赃不均判定：同楼层有其他勇者且获得高级装备时（受每日事件限制）
            if (item && t.type === 'advanced' && !this._hasTriggeredDailyEvent(hero)) {
                const others = this.invaders.filter(h => h !== hero && h.hp > 0 && this.getHeroFloor(h) === floorId);
                let hasDispute = false;
                for (const other of others) {
                    const rel = this._getHeroRelation(hero, other);
                    // 关系一般的勇者更容易因为分赃不均产生矛盾
                    if (rel.level <= 3 && RAND(100) < 20 + (3 - rel.level) * 10) {
                        this._setHeroRelation(hero, other, -1, 'loot_dispute');
                        disputeText += `（与${other.name}因分赃不均产生矛盾！）`;
                        hasDispute = true;
                    }
                }
                if (hasDispute) {
                    this._markDailyEventTriggered(hero);
                }
            }
            if (item) {
                const r = GearSystem.equipItem(hero, item);
                equipResult = r;
                events.push({
                    type: t.type,
                    threshold: t.pct,
                    item: GearSystem.getGearDesc(item),
                    success: r.success,
                    msg: r.msg + disputeText,
                    curseTriggered: r.curseTriggered,
                    gold: goldGain
                });
            } else {
                events.push({
                    type: t.type,
                    threshold: t.pct,
                    item: null,
                    success: false,
                    msg: `获得${goldGain}G` + disputeText,
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

    // 获取楼层怪物等级上限
    _getFloorMaxMonsterLevel(floorId) {
        const monsters = FLOOR_MONSTER_DEFS[floorId];
        if (!monsters || monsters.length === 0) return floorId * 10;
        return Math.max(...monsters.map(m => m.level));
    }

    // 获取楼层掉落品质上限（与宝箱系统保持一致）
    _getFloorDropMaxRarity(floorId) {
        if (floorId <= 3) return 2; // 精品
        if (floorId <= 6) return 3; // 大师
        if (floorId <= 9) return 4; // 传说
        return 5; // 神话
    }

    // 生成怪物（普通/首领/霸主）
    _spawnMonster(floorId, eliteType) {
        const monsters = FLOOR_MONSTER_DEFS[floorId];
        if (!monsters || monsters.length === 0) return null;
        const maxLevel = this._getFloorMaxMonsterLevel(floorId);
        let baseMonster;
        if (eliteType === 'normal' || !eliteType) {
            baseMonster = monsters[RAND(monsters.length)];
        } else {
            // 精英怪以该楼层最高等级怪物为模板
            baseMonster = monsters.reduce((max, m) => m.level > max.level ? m : max, monsters[0]);
        }
        const monster = Object.assign({}, baseMonster);
        monster.eliteType = eliteType || 'normal';
        if (eliteType === 'chief' || eliteType === 'overlord') {
            const def = ELITE_TYPE_DEFS[eliteType];
            if (def) {
                monster.level = maxLevel + def.levelMod;
                monster.hp = Math.floor(monster.hp * def.statMult);
                monster.mp = Math.floor(monster.mp * def.statMult);
                monster.atk = Math.floor(monster.atk * def.statMult);
                monster.def = Math.floor(monster.def * def.statMult);
                monster.spd = Math.floor(monster.spd * def.statMult);
                monster.name = def.namePrefix + monster.name;
                monster.icon = def.icon;
                monster.description = monster.description + def.descSuffix;
            }
        }
        return monster;
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

        // 3. 随机事件或遇敌(35%事件 65%遇敌)
        // 每日事件限制：已触发事件的勇者/小队跳过
        const squadId = hero.cflag[900];
        const isLeader = hero.cflag[901] === 1;
        const dailyEventBlocked = squadId ? !isLeader : this._hasTriggeredDailyEvent(hero);
        // 非队长成员始终由队长统一处理；队长/单人检查标记
        const canTriggerEvent = !dailyEventBlocked && (!squadId || isLeader);

        if (canTriggerEvent) {
            const roll = RAND(100);
            // 被击败后保持低调：遇敌概率最高10%
            const encounterChance = hero.cflag[911] ? 10 : 65;
            if (roll < encounterChance) {
                // 遇敌战斗：90%普通怪物，10%首领级精英
                let monster;
                if (RAND(100) < 10) {
                    monster = this._spawnMonster(floorId, 'chief');
                } else {
                    monster = this._spawnMonster(floorId, 'normal');
                }
                if (monster) {

                    if (squadId && isLeader) {
                    // 队长：触发小队战斗
                    const squad = this.invaders.filter(h => h.cflag[900] === squadId);
                    const heroProgress = this.getHeroProgress(hero);
                    const reinforcements = this._findReinforcements(squad, floorId, heroProgress, 'hero');
                    if (reinforcements.length > 0) {
                        for (const r of reinforcements) squad.push(r);
                    }
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
                        // 击败魔物获得声望
                        const monFame = Math.max(1, Math.floor((monster.level || 1) / 2));
                        for (const member of squad) { member.fame += monFame; }
                        // 共度难关：击败精英怪物时小队成员关系变好
                        if (monster && (monster.eliteType === 'chief' || monster.eliteType === 'overlord')) {
                            for (let si = 0; si < squad.length; si++) {
                                for (let sj = si + 1; sj < squad.length; sj++) {
                                    const rel = this._getHeroRelation(squad[si], squad[sj]);
                                    if (rel.level < 4 && RAND(100) < 40) {
                                        this._setHeroRelation(squad[si], squad[sj], 1, 'defeat_elite');
                                    }
                                }
                            }
                        }
                        // 检查委托：击败精英（以队长为准）
                        this._checkCommissionComplete(hero, 'combat', { floorId, monster });
                    } else if (combat.defeated) {
                        speedMod = -20;
                        // 一意孤行判定：小队HP很低时仍被击败，关系恶化
                        const totalHpRatio = squad.reduce((s, m) => s + (m.maxHp > 0 ? m.hp / m.maxHp : 1), 0);
                        if (totalHpRatio / squad.length < 0.3) {
                            for (let si = 0; si < squad.length; si++) {
                                for (let sj = si + 1; sj < squad.length; sj++) {
                                    this._setHeroRelation(squad[si], squad[sj], -1, 'reckless');
                                }
                            }
                        }
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
                    // 单人战斗 —— 检查是否有关系好的勇者拔刀相助
                    let helpers = [];
                    const otherHeroes = this.invaders.filter(h => h !== hero && h.hp > 0 && this.getHeroFloor(h) === floorId && !h.cflag[912]);
                    for (const other of otherHeroes) {
                        const rel = this._getHeroRelation(hero, other);
                        if (rel.level >= 3 && RAND(100) < (rel.level >= 4 ? 50 : 30)) {
                            helpers.push(other);
                            this._setHeroRelation(hero, other, 1, 'help_combat');
                        }
                    }
                    if (helpers.length > 0) {
                        // 拔刀相助：关系好的勇者加入战斗
                        const squad = [hero, ...helpers];
                        const combat = this._doTeamCombat(squad, [monster]);
                        const helperNames = helpers.map(h => h.name).join(',');
                        results.push({
                            type: "scombat",
                            name: `拔刀相助：遭遇${monster.name}`,
                            description: `${hero.name}遇险，${helperNames}前来相助！${monster.icon} ${monster.description}`,
                            icon: "🤝",
                            combatLog: combat.combatLog,
                            victory: combat.victory,
                            defeated: combat.defeated,
                            monster: monster,
                            leftTeam: combat.leftTeam,
                            rightTeam: combat.rightTeam,
                            isSquad: true,
                            heroName: hero.name,
                            squad: squad
                        });
                        if (combat.victory) {
                            speedMod -= 1;
                            for (const member of squad) {
                                if (member.hp > 0) {
                                    member.hp = Math.min(member.maxHp, member.hp + Math.floor(member.maxHp * 0.03));
                                    member.mp = Math.min(member.maxMp, member.mp + Math.floor(member.maxMp * 0.03));
                                }
                            }
                            this._checkCommissionComplete(hero, 'combat', { floorId, monster });
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
                        // 真正的单人战斗
                        const reinforcements = this._findReinforcements([hero], floorId, this.getHeroProgress(hero), 'hero');
                        const leftTeam = [hero, ...reinforcements];
                        const combat = this._doTeamCombat(leftTeam, [monster]);
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
                        });
                        if (combat.victory) {
                            speedMod -= 1;
                            hero.hp = Math.min(hero.maxHp, hero.hp + Math.floor(hero.maxHp * 0.03));
                            hero.mp = Math.min(hero.maxMp, hero.mp + Math.floor(hero.maxMp * 0.03));
                            // 击败魔物获得声望
                            hero.fame += Math.max(1, Math.floor((monster.level || 1) / 2));
                            // 检查委托：击败精英
                            this._checkCommissionComplete(hero, 'combat', { floorId, monster });
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
                } else if (event.type === 'healer') {
                    speedMod += 1;
                    const healAmt = Math.floor(hero.maxHp * (event.value || 30) / 100);
                    hero.hp = Math.min(hero.maxHp, hero.hp + healAmt);
                    const cured = this._tryCureStatusAilment(hero, "healer_event");
                    results.push({ type: "healer", name: "治疗师的帮助", description: `恢复${healAmt}HP` + (cured.length > 0 ? `，解除：${cured.join(',')}` : ''), icon: "💊" });
                } else if (event.type === 'curse') {
                    speedMod -= 2;
                    this._addStatusAilment(hero, "curse", 5);
                    results.push({ type: "curse", name: "诅咒之泉", description: "勇者被诅咒了！", icon: "🌑" });
                } else if (event.type === 'aphrodisiac') {
                    speedMod -= 1;
                    this._addStatusAilment(hero, "aphrodisiac", 4);
                    results.push({ type: "aphrodisiac", name: "媚药雾气", description: "勇者吸入了媚药雾气！", icon: "💕" });
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
            // 标记勇者/小队今天已触发事件
            this._markDailyEventTriggered(hero);
        }

        // 4. 层负面效果（Lv2+）
        if (floorLv >= 2) {
            const up = floorDef.upgrades[1];
            results.push({ type: "trap", name: up.name, description: up.description });
            speedMod -= 1;
        }

        // === 委托完成检查（探索类）===
        this._checkCommissionComplete(hero, 'explore', { floorId });

        return { results, speedMod, hpDmg, mpDmg };
    }

    _checkCommissionComplete(hero, triggerType, data = {}) {
        if (!hero || (hero.cflag[980] || 0) !== 2) return; // 不是委托任务
        if ((hero.cflag[984] || 0) !== 0) return; // 已完成或已结算
        const comId = hero.cflag[982] || 0;
        const comDef = COMMISSION_DEFS[comId];
        if (!comDef) return;
        const targetFloor = hero.cflag[981] || 0;

        let completed = false;
        if (comDef.type === 'find_hero' && triggerType === 'meet_hero') {
            // 遇到目标勇者即完成
            completed = true;
        } else if (comDef.type === 'find_item' && triggerType === 'explore') {
            // 在目标楼层探索时概率完成
            if (data.floorId === targetFloor && RAND(100) < 30) completed = true;
        } else if (comDef.type === 'defeat_elite' && triggerType === 'combat') {
            // 击败精英怪且在当前楼层
            if (data.floorId === targetFloor && data.monster && data.monster.eliteType === 'chief') completed = true;
        } else if (comDef.type === 'escort' && triggerType === 'explore') {
            // 穿越目标楼层即完成（只需在该楼层探索一次）
            if (data.floorId === targetFloor) completed = true;
        } else if (comDef.type === 'investigate' && triggerType === 'explore') {
            // 在目标楼层调查完成
            if (data.floorId === targetFloor && RAND(100) < 50) completed = true;
        }

        if (completed) {
            hero.cflag[984] = 1; // 标记已完成待汇报
            hero.cstr[340] += ' 【委托完成，返回城镇领取报酬】';
        }
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
                description: `发现隐藏商店，花${shopPrice}G购买${item.name},${r.success ? r.msg : '但无法携带'}`,
                icon: "🏪",
                item: item,
                price: shopPrice,
                bought: r.success
            };
        }
        return {
            type: "shop",
            name: "隐藏商店",
            description: `发现隐藏商店，有${item.name}出售（${shopPrice}G），${hero.gold < shopPrice ? '金币不足' : '没有购买'}。`,
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
        let resultDesc = `遇到了神秘的奸商，正在兜【售${item.name}（诅咒）…`;
        // AI购买判定【0%概率购买
        let bought = false;
        if (hero.gold >= buyPrice && Math.random() < 0.3) {
            hero.gold -= buyPrice;
            const r = GearSystem.equipItem(hero, item);
            bought = r.success;
            resultDesc += `花费${buyPrice}G购买了它【${r.msg}`;
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

    // ========== 楼层设施系统 ==========

    // 检查勇者是否跨越了楼层设施位置
    _checkFloorFacilities(hero, oldProgress, newProgress, floorId, explore) {
        const events = [];
        if (!FLOOR_FACILITY_DEFS) return events;

        // 商店：2/4/6/8层，40%处，每层一次
        const shopDef = FLOOR_FACILITY_DEFS.shop;
        if (shopDef && shopDef.floors.includes(floorId)) {
            const pos = shopDef.progress;
            if (oldProgress < pos && newProgress >= pos) {
                const mask = hero.cflag[960] || 0;
                const bit = 1 << (floorId - 1);
                if ((mask & bit) === 0) {
                    const squadId = hero.cflag[900];
                    let canAccess = true;
                    if (squadId) {
                        if (hero.cflag[901] !== 1) {
                            canAccess = false;
                        } else {
                            const squad = this.invaders.filter(h => h.cflag[900] === squadId);
                            for (const m of squad) {
                                m.cflag[960] = (m.cflag[960] || 0) | bit;
                            }
                        }
                    }
                    if (canAccess && !squadId) {
                        hero.cflag[960] = mask | bit;
                    }
                    if (canAccess) {
                        const shopResult = this._triggerFloorShop(hero, floorId);
                        if (shopResult) events.push(shopResult);
                    }
                }
            }
        }

        // 回复泉水：1-9层，80%处，每次经过都触发
        const springDef = FLOOR_FACILITY_DEFS.spring;
        if (springDef && springDef.floors.includes(floorId)) {
            const pos = springDef.progress;
            if (oldProgress < pos && newProgress >= pos) {
                const healAmt = Math.floor(hero.maxHp * 0.05);
                hero.hp = Math.min(hero.maxHp, hero.hp + healAmt);
                events.push({
                    type: 'spring',
                    name: '💧 回复泉水',
                    description: `${hero.name}经过回复泉水，恢复${healAmt}HP`,
                    icon: '💧',
                    heal: healAmt
                });
            }
        }

        // 竞技场：3/5/7层，70%处，每层一次
        const arenaDef = FLOOR_FACILITY_DEFS.arena;
        if (arenaDef && arenaDef.floors.includes(floorId)) {
            const pos = arenaDef.progress;
            if (oldProgress < pos && newProgress >= pos) {
                const mask = hero.cflag[962] || 0;
                const bit = 1 << (floorId - 1);
                if ((mask & bit) === 0) {
                    const squadId = hero.cflag[900];
                    let canAccess = true;
                    if (squadId && hero.cflag[901] !== 1) {
                        canAccess = false;
                    } else if (squadId && hero.cflag[901] === 1) {
                        const squad = this.invaders.filter(h => h.cflag[900] === squadId);
                        for (const m of squad) {
                            m.cflag[962] = (m.cflag[962] || 0) | bit;
                        }
                    } else {
                        hero.cflag[962] = mask | bit;
                    }
                    if (canAccess) {
                        const arenaResult = this._triggerArena(hero, floorId, squadId);
                        if (arenaResult) {
                            events.push(arenaResult);
                            if (arenaResult.victory) {
                                // 胜利：恢复5%HP已在 _triggerArena 中处理
                            } else if (arenaResult.defeated) {
                                // 战败：标记 defeated，走被俘/逃跑流程
                                explore.results._defeated = true;
                                explore.results._monster = arenaResult._monster;
                            } else {
                                // 撤退：当日停止移动
                                events._haltMove = true;
                            }
                        }
                    }
                }
            }
        }

        return events;
    }

    // 触发地下城商店
    _triggerFloorShop(hero, floorId) {
        const level = Math.max(1, floorId * 5 + RAND(5));
        const maxRarity = Math.min(5, Math.floor((floorId + 1) / 2));
        const minRarity = Math.max(0, Math.floor((floorId - 2) / 2));
        const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
        const itemTypes = ['heal', 'mana', 'buff'];

        const items = [];
        // 装备
        const slot = slotTypes[RAND(slotTypes.length)];
        const r1 = GearSystem._rollRarityCapped(maxRarity, minRarity);
        const gear = GearSystem.generateGear(slot, level, r1);
        const gearPrice = Math.max(50, Math.floor(this._calcGearPrice(gear) * 2));
        items.push({ item: gear, price: gearPrice, type: 'gear' });

        // 消耗品
        const r2 = GearSystem._rollRarityCapped(maxRarity, minRarity);
        const consumable = GearSystem.generateItem(itemTypes[RAND(itemTypes.length)], level, r2);
        const consPrice = Math.max(30, Math.floor(this._calcGearPrice(consumable) * 1.5));
        items.push({ item: consumable, price: consPrice, type: 'item' });

        let bought = [];
        for (const entry of items) {
            if (hero.gold >= entry.price && Math.random() < 0.7) {
                hero.gold -= entry.price;
                const r = GearSystem.equipItem(hero, entry.item);
                if (r.success) {
                    bought.push(`${entry.item.name}(${entry.price}G)`);
                }
            }
        }

        return {
            type: 'floor_shop',
            name: '🏪 地下城商店',
            description: `${hero.name}在地下城商店浏览，${bought.length > 0 ? '购买了：' + bought.join(',') : '没有购买任何物品'}`,
            icon: '🏪',
            bought: bought
        };
    }

    // 触发竞技场
    _triggerArena(hero, floorId, squadId) {
        const monster = this._spawnMonster(floorId, 'chief');
        let combat;
        if (squadId && hero.cflag[901] === 1) {
            const squad = this.invaders.filter(h => h.cflag[900] === squadId);
            combat = this._doTeamCombat(squad, [monster]);
        } else {
            combat = this._doTeamCombat([hero], [monster]);
        }

        const result = {
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
        };

        if (combat.victory) {
            // 高级物品奖励
            const maxRarity = Math.min(5, Math.floor((floorId + 2) / 2));
            const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
            const slot = slotTypes[RAND(slotTypes.length)];
            const item = GearSystem.generateGear(slot, monster.level, maxRarity);
            const r = GearSystem.equipItem(hero, item);
            result.itemName = item.name;
            result.itemMsg = r.msg;

            // 额外金币
            const bonusGold = Math.floor(monster.level * monster.level * 5);
            hero.gold += bonusGold;
            result.gold = bonusGold;

            // 恢复5%HP
            const healAmt = Math.floor(hero.maxHp * 0.05);
            hero.hp = Math.min(hero.maxHp, hero.hp + healAmt);
            result.heal = healAmt;

            result.description += ` | 胜利！获得${item.name}和${bonusGold}G，恢复${healAmt}HP`;
        } else if (combat.defeated) {
            result.description += ` | 战败...`;
        } else {
            result.description += ` | 撤退，次日可再来挑战`;
        }

        return result;
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
        let monMp = monster.mp || 0;

        // 勇者装备加成
        const gBonus = GearSystem.applyGearBonus(hero, false);
        // 勇者基础属性
        let heroBaseAtk = (hero.cflag[11] || 20) + (gBonus.atk || 0);
        let heroBaseDef = (hero.cflag[12] || 15) + (gBonus.def || 0);
        let heroSpd = hero.cflag[13] || 10 + hero.level * 2;

        // === 异常状态效果 ===
        const statusFx = this._applyStatusAilmentEffects(hero);
        heroBaseAtk = Math.max(1, Math.floor(heroBaseAtk * (1 + statusFx.atkMod)));
        heroBaseDef = Math.max(0, Math.floor(heroBaseDef * (1 + statusFx.defMod)));
        heroSpd = Math.max(1, Math.floor(heroSpd * (1 + statusFx.spdMod)));
        if (statusFx.dotHp > 0) {
            heroHp = Math.max(1, heroHp - statusFx.dotHp);
        }
        if (statusFx.dotMp > 0) {
            heroMp = Math.max(0, heroMp - statusFx.dotMp);
        }

        // 战斗中的增益/减益状态
        let heroAtkMod = 0;
        let heroDefMod = 0;
        let heroSpdMod = 0;
        let heroBuffTurns = 0;
        let monAtkMod = 0;
        let monDefMod = 0;
        let monBuffTurns = 0;
        let heroInvincible = 0;

        const getHeroAtk = () => Math.max(1, heroBaseAtk + heroAtkMod);
        const getHeroDef = () => Math.max(0, heroBaseDef + heroDefMod);
        const getHeroSpd = () => Math.max(1, heroSpd + heroSpdMod);
        const getMonAtk = () => Math.max(1, monster.atk + monAtkMod);
        const getMonDef = () => Math.max(0, monster.def + monDefMod);

        let rounds = 0;
        const maxRounds = 50;
        const combatLog = [];

        // 记录初始HP（用于战斗UI显示）
        combatLog.push(`【初始】勇者HP:${heroHp} 怪物HP:${monHp}`);

        // 若有异常状态，战斗开始时报告
        if (statusFx.dotHp > 0 || statusFx.dotMp > 0) {
            const stText = this._getStatusAilmentText(hero);
            if (stText) combatLog.push(`⚠️ ${hero.name}处于异常状态：${stText}`);
        }

        while (rounds < maxRounds && heroHp > 0 && monHp > 0) {
            rounds++;

            // === 逃跑判定 ===
            const fleeChance = Math.max(5, Math.min(95, 30 + (hero.level - monster.level) * 5));
            if (RAND(100) < fleeChance) {
                combatLog.push(`【${rounds}回合】${hero.name}成功撤离了战斗！`);
                hero.hp = Math.max(0, heroHp);
                hero.mp = Math.max(0, heroMp);
                monster.maxHp = monster.hp;
                monster.hp = Math.max(0, monHp);
                return { victory: false, defeated: false, escaped: true, rounds, combatLog, monster, drop: null };
            }

            // 根据敏捷决定行动顺序
            const heroFirst = getHeroSpd() >= monster.spd;
            const actors = heroFirst ? ['hero', 'monster'] : ['monster', 'hero'];

            for (const actor of actors) {
                if (heroHp <= 0 || monHp <= 0) break;

                if (actor === 'hero') {
                    // ===== 勇者AI决策 =====
                    const hpPct = heroHp / hero.maxHp;
                    const mpPct = heroMp / Math.max(1, hero.maxMp);

                    // 异常状态：麻痹/冰冻/恐惧/混乱/魅惑可能导致无法行动或行为异常
                    if (statusFx.actionBlock > 0 && RAND(100) < statusFx.actionBlock * 100) {
                        combatLog.push(`【${rounds}回合】${hero.name}因异常状态无法行动！`);
                        continue;
                    }
                    if (statusFx.friendlyFire > 0 && RAND(100) < statusFx.friendlyFire * 100) {
                        // 混乱/魅惑：自己伤害自己
                        const selfDmg = Math.max(1, Math.floor(getHeroAtk() * 0.3));
                        heroHp -= selfDmg;
                        combatLog.push(`【${rounds}回合】${hero.name}陷入混乱，攻击了自己！💫 受到${selfDmg}伤害`);
                        continue;
                    }

                    // 尝试使用职业技能
                    const skillId = this._chooseHeroSkill(hero, "solo");
                    const skillDef = skillId ? HERO_SKILL_DEFS[skillId] : null;
                    const canUseSkill = skillDef && heroMp >= skillDef.cost;

                    if (canUseSkill) {
                        heroMp -= skillDef.cost;
                        const skillResult = this._useHeroSkill(hero, skillId, monster, { isSolo: true });
                        if (skillResult && skillResult.used) {
                            combatLog.push(`【${rounds}回合】${skillResult.log}`);
                            if (skillResult.damage) {
                                if (skillResult.isAoE) {
                                    monHp -= skillResult.damage;
                                } else {
                                    monHp -= skillResult.damage;
                                }
                            }
                            if (skillResult.heal) {
                                heroHp = Math.min(hero.maxHp, heroHp + skillResult.heal);
                            }
                            if (skillResult.buff) {
                                const b = skillResult.buff;
                                if (b.type === 'atk' || b.type === 'all') heroAtkMod += b.value;
                                if (b.type === 'def' || b.type === 'all') heroDefMod += b.value;
                                if (b.type === 'spd' || b.type === 'all') heroSpdMod += b.value;
                                heroBuffTurns = Math.max(heroBuffTurns, b.duration || 3);
                            }
                            if (skillResult.debuff) {
                                const d = skillResult.debuff;
                                if (d.type === 'atk' || d.type === 'all') monAtkMod -= d.value;
                                if (d.type === 'def' || d.type === 'all') monDefMod -= d.value;
                                monBuffTurns = Math.max(monBuffTurns, d.duration || 3);
                            }
                            if (skillResult.invincible) {
                                heroInvincible = skillResult.duration || 1;
                            }
                            if (skillResult.ailment) {
                                // 怪物也会被添加异常状态（简化：用战斗内标记表示）
                                combatLog.push(`  → ${monster.name}被施加了异常效果！`);
                            }
                            if (skillResult.cleanse) {
                                // 净化自身异常
                                const cured = this._tryCureStatusAilment(hero, "skill_cleanse");
                                if (cured.length > 0) combatLog.push(`  → ${cured.join(',')}`);
                            }
                            if (skillResult.berserk) {
                                const b = skillResult.buff;
                                const d = skillResult.debuff;
                                if (b) { heroAtkMod += b.value; heroBuffTurns = Math.max(heroBuffTurns, b.duration || 3); }
                                if (d) { heroDefMod += d.value; }
                            }
                            continue;
                        }
                    }

                    // 默认AI：回复 / 增益 / 普通攻击
                    const needHeal = hpPct < 0.35 && heroMp >= 15;
                    const canBuff = heroMp >= 20 && heroBuffTurns <= 0 && RAND(100) < 20;

                    if (needHeal) {
                        const healAmt = Math.floor(hero.level * 6 + heroBaseAtk * 0.3);
                        heroHp = Math.min(hero.maxHp, heroHp + healAmt);
                        heroMp -= 15;
                        combatLog.push(`【${rounds}回合】${hero.name}使用回复魔法 ✨ 恢复${healAmt}HP (MP:${heroMp})`);
                    } else if (canBuff) {
                        heroAtkMod = Math.floor(heroBaseAtk * 0.2);
                        heroBuffTurns = 2;
                        heroMp -= 20;
                        combatLog.push(`【${rounds}回合】${hero.name}使用强化魔法 💪 攻击+${heroAtkMod} (持续2回合)`);
                    } else {
                        const dmg = Math.max(1, getHeroAtk() - getMonDef());
                        monHp -= dmg;
                        combatLog.push(`【${rounds}回合】${hero.name}攻击 ⚔️ 造成${dmg}伤害 (怪物HP:${Math.max(0,monHp)})`);
                    }
                } else {
                    // ===== 怪物AI决策 =====
                    if (heroInvincible > 0) {
                        combatLog.push(`【${rounds}回合】${monster.name}的攻击被${hero.name}挡下了！🛡️ (无敌)`);
                    } else {
                        const aiType = this._getMonsterAIType(monster);
                        const monHpPct = monHp / monster.hp;
                        const roll = RAND(100);

                        if (aiType === 'attack') {
                            if (roll < 50) {
                                const rawDmg = Math.floor(getMonAtk() * 1.5);
                                const dmg = Math.max(1, rawDmg - getHeroDef());
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}猛击 💢 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            } else if (roll < 80) {
                                const dmg = Math.max(1, getMonAtk() - getHeroDef());
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            } else if (roll < 95 && monBuffTurns <= 0) {
                                monAtkMod = Math.floor(monster.atk * 0.3);
                                monBuffTurns = 1;
                                combatLog.push(`【${rounds}回合】${monster.name}正在蓄力 ⚡ 下回合攻击力大幅提升`);
                            } else {
                                combatLog.push(`【${rounds}回合】${monster.name}采取防御姿态 🛡️`);
                            }
                        } else if (aiType === 'defense') {
                            if (roll < 40) {
                                const dmg = Math.max(1, getMonAtk() - getHeroDef());
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            } else if (roll < 75 && monBuffTurns <= 0) {
                                monDefMod = Math.floor(monster.def * 0.3);
                                monBuffTurns = 2;
                                combatLog.push(`【${rounds}回合】${monster.name}展开铁壁 🛡️ 防御+${monDefMod}`);
                            } else if (roll < 95) {
                                const heal = Math.floor(monster.level * 5);
                                monHp = Math.min(monster.hp, monHp + heal);
                                combatLog.push(`【${rounds}回合】${monster.name}自愈 🌿 恢复${heal}HP (怪物HP:${monHp})`);
                            } else {
                                combatLog.push(`【${rounds}回合】${monster.name}摆出反击姿态 👁️`);
                            }
                        } else if (aiType === 'magic') {
                            if (roll < 45) {
                                const pierceDef = Math.floor(getHeroDef() * 0.3);
                                const dmg = Math.max(1, Math.floor(getMonAtk() * 1.2) - (getHeroDef() - pierceDef));
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}魔法弹 🔮 造成${dmg}伤害(穿透) (勇者HP:${Math.max(0,heroHp)})`);
                                // 魔法型怪物有概率附加异常状态
                                if (RAND(100) < 15) {
                                    this._addStatusAilment(hero, "paralysis", 2);
                                    combatLog.push(`  → ${hero.name}被麻痹了！`);
                                }
                            } else if (roll < 70) {
                                const dmg = Math.max(1, getMonAtk() - getHeroDef());
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            } else if (roll < 90 && monMp >= 10) {
                                const heal = Math.floor(monster.mp * 0.2);
                                monHp = Math.min(monster.hp, monHp + heal);
                                monMp -= 10;
                                combatLog.push(`【${rounds}回合】${monster.name}治疗 ✨ 恢复${heal}HP (怪物HP:${monHp})`);
                            } else if (monBuffTurns <= 0) {
                                monAtkMod = Math.floor(monster.atk * 0.2);
                                monBuffTurns = 2;
                                combatLog.push(`【${rounds}回合】${monster.name}魔力增幅 🔮 攻击+${monAtkMod}`);
                            } else {
                                const dmg = Math.max(1, getMonAtk() - getHeroDef());
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            }
                        } else if (aiType === 'speed') {
                            if (roll < 40) {
                                const dmg1 = Math.max(1, Math.floor(getMonAtk() * 0.7) - getHeroDef());
                                const dmg2 = Math.max(1, Math.floor(getMonAtk() * 0.6) - getHeroDef());
                                heroHp -= dmg1;
                                if (heroHp > 0) heroHp -= dmg2;
                                combatLog.push(`【${rounds}回合】${monster.name}迅捷连击 💨 ${dmg1}+${dmg2}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            } else if (roll < 75) {
                                const dmg = Math.max(1, getMonAtk() - getHeroDef());
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            } else if (roll < 95 && monBuffTurns <= 0) {
                                monDefMod = Math.floor(monster.def * 0.5);
                                monBuffTurns = 2;
                                combatLog.push(`【${rounds}回合】${monster.name}闪避姿态 💨 防御提升`);
                            } else {
                                const dmg = Math.max(1, getMonAtk() - getHeroDef());
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            }
                        } else {
                            if (roll < 50) {
                                const dmg = Math.max(1, getMonAtk() - getHeroDef());
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            } else if (roll < 75) {
                                const rawDmg = Math.floor(getMonAtk() * 1.3);
                                const dmg = Math.max(1, rawDmg - getHeroDef());
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}强力攻击 💥 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                                if (RAND(100) < 20) {
                                    const debuffVal = Math.max(3, Math.floor(heroBaseDef * 0.1));
                                    heroDefMod = -debuffVal;
                                    combatLog.push(`  → 勇者防御力下降${debuffVal}！`);
                                }
                                // 均衡型怪物有概率附加异常状态
                                if (RAND(100) < 10) {
                                    const ailments = ["weak", "burn", "poison", "fear"];
                                    const aType = ailments[RAND(ailments.length)];
                                    this._addStatusAilment(hero, aType, 2 + RAND(2));
                                    combatLog.push(`  → ${hero.name}被施加了【${STATUS_AILMENT_DEFS[aType].name}】！`);
                                }
                            } else if (roll < 90) {
                                const heal = Math.floor(monster.level * 3);
                                monHp = Math.min(monster.hp, monHp + heal);
                                combatLog.push(`【${rounds}回合】${monster.name}恢复 🌿 恢复${heal}HP (怪物HP:${monHp})`);
                            } else if (monBuffTurns <= 0) {
                                monAtkMod = Math.floor(monster.atk * 0.15);
                                monBuffTurns = 2;
                                combatLog.push(`【${rounds}回合】${monster.name}强化 💪 攻击+${monAtkMod}`);
                            } else {
                                const dmg = Math.max(1, getMonAtk() - getHeroDef());
                                heroHp -= dmg;
                                combatLog.push(`【${rounds}回合】${monster.name}攻击 🗡️ 造成${dmg}伤害 (勇者HP:${Math.max(0,heroHp)})`);
                            }
                        }
                    }
                }
            }

            // 回合结束：处理增益/减益持续时间
            if (heroBuffTurns > 0) {
                heroBuffTurns--;
                if (heroBuffTurns <= 0) {
                    heroAtkMod = 0;
                    heroDefMod = 0;
                    heroSpdMod = 0;
                    combatLog.push(`  【${hero.name}的增益效果消失了`);
                }
            }
            if (monBuffTurns > 0) {
                monBuffTurns--;
                if (monBuffTurns <= 0) {
                    monAtkMod = 0;
                    monDefMod = 0;
                    combatLog.push(`  【${monster.name}的增益效果消失了`);
                }
            }
            if (heroInvincible > 0) {
                heroInvincible--;
                if (heroInvincible <= 0) {
                    combatLog.push(`  【${hero.name}的无敌效果消失了`);
                }
            }
        }

        // 更新勇者的实际HP/MP
        hero.hp = Math.max(0, heroHp);
        hero.mp = Math.max(0, heroMp);

        let victory = monHp <= 0;
        let defeated = heroHp <= 0;
        let escaped = false;

        // 50回合后未分胜负，按总剩余血量判胜负
        if (!victory && !defeated) {
            if (heroHp > monHp) {
                victory = true;
                combatLog.push(`【血量判定】${hero.name}以剩余HP优势获胜！(勇者${heroHp} vs 怪物${monHp})`);
            } else if (monHp > heroHp) {
                defeated = true;
                combatLog.push(`【血量判定】${monster.name}以剩余HP优势获胜！(怪物${monHp} vs 勇者${heroHp})`);
            } else {
                escaped = true;
                combatLog.push(`【平手】双方激战50回合，势均力敌，各自撤退`);
            }
        }

        let drop = null;
        if (victory) {
            const expGain = monster.level * 10;
            hero.exp[0] = (hero.exp[0] || 0) + expGain;
            const goldGain = Math.floor(monster.level * monster.level * 2 + RAND(monster.level * 10));
            hero.gold += goldGain;
            combatLog.push(`【胜利】${hero.name}击败了${monster.name}(战斗${rounds}回合) 获得${expGain}EXP ${goldGain}G`);
            // 精英怪物掉落处理
            let dropChance = 0.30;
            let rarityBonus = 0;
            let dropLevel = monster.level;
            const floorId = this.getHeroFloor(hero);
            const maxRarity = this._getFloorDropMaxRarity(floorId);
            if (monster.eliteType === 'chief') {
                dropChance = 1.0;
                rarityBonus = ELITE_TYPE_DEFS.chief.dropRarityBonus;
            } else if (monster.eliteType === 'overlord') {
                dropChance = 1.0;
                rarityBonus = ELITE_TYPE_DEFS.overlord.dropRarityBonus;
                if (RAND(100) < 50) {
                    const nextFloor = Math.min(10, floorId + 1);
                    dropLevel = this._getFloorMaxMonsterLevel(nextFloor) + 5;
                }
            }
            if (Math.random() < dropChance) {
                const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
                const slot = slotTypes[RAND(slotTypes.length)];
                let rarity = GearSystem._rollRarity();
                rarity = Math.min(maxRarity, rarity + rarityBonus);
                drop = GearSystem.generateGear(slot, dropLevel, rarity);
                const r = GearSystem.equipItem(hero, drop);
                if (r.success) combatLog.push(`🎁 ${r.msg}`);
            }
        } else if (defeated) {
            combatLog.push(`【败北】${hero.name}被${monster.name}击败了...`);
        } else if (escaped) {
            combatLog.push(`【撤退】${hero.name}从战斗中撤退了`);
        }

        // 更新怪物最终HP（用于UI显示）
        monster.maxHp = monster.hp;
        monster.hp = Math.max(0, monHp);
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
    // skipEscape: 奴隶/魔王主动出击时，跳过逃跑判定（勇者无法从主动出击方手中逃脱）
    _processCapture(hero, monster, skipEscape = false) {
        // 逃跑者特质特殊处】
        const isEscapee = hero.talent[203];

        // 1. 逃跑判定（奴隶/魔王主动出击时跳过）
        if (!skipEscape) {
            const escapeResult = this._tryEscape(hero, monster);
            if (escapeResult.success) {
                if (isEscapee) {
                    return { type: 'escape', message: `${hero.name}再次从魔王手中逃脱【..但她知道，自己终究会回来的。` };
                }
                return { type: 'escape', message: escapeResult.message };
            }
        }

        // 2. 进入投降判】
        const surrenderResult = this._trySurrender(hero);
        if (isEscapee) {
            // 逃跑者再次被捕时，投降率大幅提升
            let modChance = 50 + Math.floor((1 - hero.hp / Math.max(1, hero.maxHp)) * 40);
            modChance = Math.max(0, Math.min(95, modChance));
            if (RAND(100) < modChance) {
                this._convertHeroToSlave(hero);
                return { type: 'surrender', message: `${hero.name}再次被魔王捕【..她的身体比意志更先屈服了。"欢迎回来，我的奴隶。"魔王在她耳边低语。` };
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
        const squadId = hero.cflag[900];
        if (squadId) {
            const squadMembers = this.invaders.filter(h => h.cflag[900] === squadId);
            const hasSpy = squadMembers.some(h => h.cflag[912]);
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

        // 赋予"前勇者"特质
        hero.talent[200] = 1;

        // 声望减半（勇者时期声望 × 0.5）
        hero.fame = Math.floor(hero.fame * 0.5);

        // 清除勇者专属标记
        hero.cflag[501] = 0;
        hero.cflag[502] = 0;
        hero.cflag[600] = 0;

        // 初始化探索标【        hero.cflag[700] = 0; // 0=未探【 1=探索【        hero.cflag[701] = 10; // 当前楼层(反向从第10层开【
        hero.cflag[702] = 0; // 当前进度
        hero.cflag[703] = 0; // 累计获得EXP

        // 恢复部分状【        hero.hp = Math.floor(hero.maxHp * 0.3);
        hero.mp = Math.floor(hero.maxMp * 0.2);

        // 加入奴隶列表
        hero.affinity = this.generateAffinity(hero);
        this.addCharaFromTemplate(hero);
        UI.showToast(`勇者${hero.name} 投降了！成为了你的奴【(服从Lv.${hero.mark[0]})`, 'success');
    }

    // 将勇者关入监】
    _imprisonHero(hero) {
        // 检查监狱容】
        const maxCap = this.getMaxPrisoners();
        if (this.prisoners.length >= maxCap) {
            // 监狱已满，最老的俘虏被处决或释放（简化：移除第一个）
            const removed = this.prisoners.shift();
            UI.showToast(`监狱已满，${removed.name} 被处决了`, 'danger');
        }

        // 勇者被俘时，金币被魔王没收
        const confiscatedGold = hero.gold;
        if (confiscatedGold > 0) {
            this.money += confiscatedGold;
            hero.gold = 0;
            UI.showToast(`从勇【${hero.name} 身上没收【${confiscatedGold}G！`, 'success');
        }

        // 标记俘虏状【        hero.cflag[600] = 1; // 俘虏标记
        hero.cflag[601] = this.day; // 被俘天数

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
        if (slave.cflag[700]) {
            UI.showToast(`${slave.name} 正在探索中，无法派遣`, 'warning');
            return false;
        }
        if (slave.cflag[705]) {
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
        spy.cflag[9] = slave.level;
        spy.cflag[11] = slave.cflag[11] || 20 + slave.level * 5;
        spy.cflag[12] = slave.cflag[12] || 15 + slave.level * 4;
        spy.cflag[13] = slave.cflag[13] || 10 + slave.level * 3;
        spy.talent = [...slave.talent];
        spy.talent[200] = 1; // 前勇者标记
        spy.cflag[912] = 1; // 伪装者标记
        spy.mark = [...slave.mark];
        spy.abl = [...slave.abl];

        // 初始化勇者入侵标【        spy.cflag[501] = 1;
        spy.cflag[502] = 0;

        // 标记原奴隶已派出伪装
        slave.cflag[705] = 1;

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
        if (slave.cflag[700]) {
            UI.showToast(`${slave.name} 已经在探索中了`, 'warning');
            return false;
        }
        slave.cflag[700] = 1; // 标记探索【        slave.cflag[701] = 10; // 从第10层开【        slave.cflag[702] = 0; // 进度0
        UI.showToast(`派出【${slave.name} 前往地下城第10层探索！`, 'success');
        return true;
    }

    // 召回探索中的奴隶
    recallSlaveExplore(index) {
        const slave = this.getChara(index);
        if (!slave || !slave.cflag[700]) {
            UI.showToast('该角色没有在探索', 'warning');
            return false;
        }
        slave.cflag[700] = 0;
        UI.showToast(`召回【${slave.name} (累计获得${slave.cflag[703] || 0}EXP)`, 'info');
        return true;
    }

    // 处理奴隶每日探索
    processSlaveExploreDaily() {
        const results = [];
        const processed = new Set();

        for (const slave of this.characters) {
            if (!slave.talent[200] || !slave.cflag[700]) continue;
            if (processed.has(slave)) continue;

            // 处理返回魔王宫的奴隶
            if (slave.cflag[706]) {
                const squadId = slave.cflag[900];
                // 如果属于小队但不是队长，跳过（由队长统一处理）
                if (squadId && slave.cflag[901] !== 1) {
                    processed.add(slave);
                    continue;
                }
                let squad = [];
                if (squadId && slave.cflag[901] === 1) {
                    squad = this.characters.filter(c => c !== slave && c.talent[200] && c.cflag[900] === squadId);
                    for (const member of squad) processed.add(member);
                }
                // 触发复命事件
                const reportResult = this._processSlaveReport(slave, squad);
                results.push(reportResult);
                processed.add(slave);
                continue;
            }

            const floorId = slave.cflag[701] || 10;
            let progress = slave.cflag[702] || 0;

            // 反向探索：每天基础+5%进度
            let moveSpeed = 5 + Math.floor((slave.level - 1) * 10 / 49);
            if (moveSpeed > 15) moveSpeed = 15;

            // 检查是否属于小队
            const squadId = slave.cflag[900];
            let squad = [];
            if (squadId && slave.cflag[901] === 1) {
                // 队长：收集所有小队成【                squad = this.characters.filter(c => c !== slave && c.talent[200] && c.cflag[900] === squadId);
                for (const member of squad) processed.add(member);
            } else if (squadId && slave.cflag[901] !== 1) {
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
                        const combat = this._doTeamCombat(fullSquad, [monster]);
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
                                text: `在修炼中顿悟，${GearSystem.getGearNameHtml(upgraded)} 的品质提升了！当前品质：${GearSystem.getRarityName(upgraded.rarity)}`
                            });
                        }
                    }
                }
            }

            // 检查进度宝箱（奴隶探索也触发）
            const oldProgress = slave.cflag[702] || 0;
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
                    slave.cflag[701] = floorId - 1;
                    slave.cflag[702] = 0;
                    slave.cflag[704] = 0; // 重置宝箱标记
                    for (const member of squad) {
                        member.cflag[701] = floorId - 1;
                        member.cflag[702] = 0;
                        member.cflag[704] = 0;
                    }
                    results.push({ name: slave.name, type: 'floor', text: `小队到达第${floorId - 1}层！` });
                } else {
                    // 到达【层出口，开始返回魔王宫
                    slave.cflag[706] = 1; // 标记为返回中
                    slave.cflag[702] = 0;
                    slave.cflag[704] = 0;
                    for (const member of squad) {
                        member.cflag[706] = 1;
                        member.cflag[702] = 0;
                        member.cflag[704] = 0;
                    }
                    results.push({ name: slave.name, type: 'floor', text: `小队到达【层出口，开始返回魔王宫…` });
                }
            } else {
                slave.cflag[702] = progress;
                for (const member of squad) {
                    member.cflag[702] = progress;
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
            { weight: 3, text: `发现了隐藏的宝箱，获得${monLevel * monLevel}G`, gold: monLevel * monLevel },
            { weight: 3, text: `发现了魔力结晶，MP完全恢复`, restoreMp: 1 },
            { weight: 2, text: `找到了治愈泉水，HP完全恢复`, restoreHp: 1 },
            { weight: 2, text: `遇到了友善的低级魔物，获得${floorId * 5}EXP`, exp: floorId * 5 },
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
            member.cflag[700] = 0;
            member.cflag[701] = 10;
            member.cflag[702] = 0;
            member.cflag[703] = 0;
            member.cflag[704] = 0;
            member.cflag[706] = 0;
            member.cflag[900] = 0;
            member.cflag[901] = 0;
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
            rewardText = `\n🏰 【魔王的爱奖励】\n${slave.name}回到魔王宫复命，魔王对她的表现非常满意。\n"做得很好，值得奖励。"魔王将她拉入怀中…\n在魔王的宠爱下，${slave.name}的身体变得火热，顺从心增加了。\n获得：绝顶经【3,快乐刻【1,顺【欲望上升,魔王经【5`;
        } else {
            rewardText = `\n${slave.name}顺利返回魔王宫复命。`;
        }

        const squadText = squad.length > 0 ? `（小队共${allMembers.length}人）` : '';
        return {
            name: slave.name,
            type: 'complete',
            text: `${squadText}完成了地下城探索！累计获得${totalExp}EXP,持有金${totalGold}G，${rewardText}`,
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

                // 每日事件限制：双方（或所在小队）今天已触发事件则跳过
                if (this._hasTriggeredDailyEvent(a) || this._hasTriggeredDailyEvent(b)) continue;

                // 检查委托：寻找勇者（双方都可能完成委托）
                this._checkCommissionComplete(a, 'meet_hero');
                this._checkCommissionComplete(b, 'meet_hero');

                // 随机选择发起】
                const actor = RAND(2) === 0 ? a : b;
                const target = actor === a ? b : a;

                // 获取两人关系
                const rel = this._getHeroRelation(actor, target);
                const isFirstMeet = rel.history.length === 0;

                // 发起者决定行动
                let action = 'none';
                if (actor.cflag[912] && target.cflag[912]) {
                    // 双方都是伪装者（奴隶/间谍）：绝不内战，自发组队互助
                    action = 'spy_teamup';
                } else if (actor.cflag[912]) {
                    // 伪装者对普通勇者执行破坏
                    action = 'disguise';
                } else if (target.cflag[912]) {
                    // 普通勇者遇到伪装者：伪装者可能主动出手
                    action = 'disguise';
                } else if (isFirstMeet && RAND(100) < 60) {
                    // 初次相遇：较高概率自发组队
                    action = 'first_teamup';
                } else if (rel.level <= 0) {
                    // 不死不休：必定内战
                    action = 'combat';
                } else if (rel.level >= 4 && RAND(100) < 40) {
                    // 莫逆之交：有概率互相增益
                    action = 'help';
                } else {
                    // 普通勇者：根据关系调整内战概率
                    action = this._decideHeroEncounterAction(actor, rel.level);
                }

                if (action === 'combat') {
                    // 直接对战
                    const combatResult = this._doHeroVsHeroCombat(actor, target);
                    // 内战导致关系恶化
                    if (rel.level > 0) {
                        this._setHeroRelation(actor, target, -1, 'reckless');
                    }
                    this._markDailyEventTriggered(actor);
                    this._markDailyEventTriggered(target);
                    results.push({
                        type: 'combat',
                        title: `⚔️ 勇者内战`,
                        text: combatResult.text,
                        battle: {
                            type: 'team',
                            hero: actor,
                            heroName: actor.name,
                            leftTeam: combatResult.combat.leftTeam,
                            rightTeam: combatResult.combat.rightTeam,
                            combatLog: combatResult.combat.combatLog,
                            victory: combatResult.combat.victory,
                            defeated: combatResult.combat.defeated,
                            escaped: combatResult.combat.escaped,
                            rounds: combatResult.combat.rounds
                        }
                    });
                } else if (action === 'disguise') {
                    // 伪装者执行破坏事件
                    const spy = actor.cflag[912] ? actor : target;
                    const victim = spy === actor ? target : actor;
                    const eventResult = this._doDisguiseEvent(spy, victim);
                    this._markDailyEventTriggered(actor);
                    this._markDailyEventTriggered(target);
                    results.push({
                        title: `🎭 伪装者行动`,
                        text: `${spy.name}伪装成同伴接近了${victim.name}！${eventResult.text}`
                    });
                } else if (action === 'spy_teamup') {
                    // 奴隶/间谍相遇：绝不内战，自发组队互助
                    const healAmt = Math.floor(actor.maxHp * 0.1);
                    actor.hp = Math.min(actor.maxHp, actor.hp + healAmt);
                    target.hp = Math.min(target.maxHp, target.hp + healAmt);
                    // 尝试组队（最多3人）
                    const merged = this._tryMergeSquad(actor, target);
                    this._markDailyEventTriggered(actor);
                    this._markDailyEventTriggered(target);
                    results.push({
                        title: `🛡️ 奴隶汇合`,
                        text: `${actor.name}与${target.name}都是魔王的仆从，相遇后互相掩护并恢复了${healAmt}HP，${merged ? '自发组成小队行动。' : '但因队伍已满无法组队。'}`
                    });
                } else if (action === 'first_teamup') {
                    // 初次相遇：勇者自发组队
                    const healAmt = Math.floor(actor.maxHp * 0.05);
                    actor.hp = Math.min(actor.maxHp, actor.hp + healAmt);
                    target.hp = Math.min(target.maxHp, target.hp + healAmt);
                    // 尝试组队（最多3人）
                    const merged = this._tryMergeSquad(actor, target);
                    // 记录初次相遇为点头之交（如果相性差很大，保持原有初始化等级）
                    if (rel.level >= 2) {
                        this._setHeroRelation(actor, target, 0, 'complete_quest');
                    }
                    this._markDailyEventTriggered(actor);
                    this._markDailyEventTriggered(target);
                    results.push({
                        title: `🤝 初次组队`,
                        text: `${actor.name}与${target.name}初次相遇，一拍即合结为同伴！两人互相支援并恢复了${healAmt}HP，${merged ? `组成小队共同冒险。（关系：${this._getRelationLabel(this._getHeroRelation(actor, target).level)}）` : '但因队伍已满无法组队。'}`
                    });
                } else if (action === 'help') {
                    // 莫逆之交：互相治疗/增益
                    const healAmt = Math.floor(actor.maxHp * 0.08);
                    actor.hp = Math.min(actor.maxHp, actor.hp + healAmt);
                    target.hp = Math.min(target.maxHp, target.hp + healAmt);
                    this._setHeroRelation(actor, target, 1, 'share_rest');
                    this._markDailyEventTriggered(actor);
                    this._markDailyEventTriggered(target);
                    results.push({
                        title: `💕 同甘共苦`,
                        text: `${actor.name}与${target.name}互相鼓舞，恢复了${healAmt}HP！关系变得更好。`
                    });
                } else {
                    // 什么都不做
                    results.push({
                        title: `👥 勇者相遇`,
                        text: `${actor.name}遇到${target.name}，但没有采取行动（关系：${this._getRelationLabel(rel.level)}）`
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
                    let progress = t.cflag[502] || 0;
                    progress -= 30;
                    if (progress < 0) {
                        const floorId = this.getHeroFloor(t);
                        if (floorId > 1) {
                            t.cflag[501] = floorId - 1;
                            t.cflag[502] = 80 + progress;
                        } else {
                            t.cflag[502] = 0;
                        }
                    } else {
                        t.cflag[502] = progress;
                    }
                    return `侵略【30%`;
                }
            },
            {
                weight: 2,
                name: '散布谣言',
                text: `${actor.name}散布了魔王城恐怖的谣言使${target.name}的精神受到打击！`,
                effect: (a, t) => {
                    t.mp = Math.max(0, t.mp - Math.floor(t.maxMp * 0.3));
                    return `MP-${Math.floor(t.maxMp * 0.3)}`;
                }
            },
            {
                weight: 2,
                name: '破坏装备',
                text: `${actor.name}趁夜破坏${target.name}的装备，攻击力下降！`,
                effect: (a, t) => {
                    const debuff = Math.max(5, Math.floor((t.cflag[11] || 20) * 0.15));
                    t.cflag[11] = Math.max(1, (t.cflag[11] || 20) - debuff);
                    return `攻击【${debuff}`;
                }
            },
            {
                weight: 2,
                name: '挑拨离间',
                text: `${actor.name}挑拨${target.name}与其他勇者的关系！`,
                effect: (a, t) => {
                    // 降低目标速度（行动力下降】
                    const debuff = Math.max(3, Math.floor((t.cflag[13] || 10) * 0.2));
                    t.cflag[13] = Math.max(1, (t.cflag[13] || 10) - debuff);
                    return `敏捷-${debuff}`;
                }
            },
            {
                weight: 1,
                name: '陷阱诱饵',
                text: `${actor.name}将${target.name}引入了陷阱区域！`,
                effect: (a, t) => {
                    const dmg = Math.floor(t.maxHp * 0.15);
                    t.hp = Math.max(1, t.hp - dmg);
                    let progress = t.cflag[502] || 0;
                    progress -= 15;
                    t.cflag[502] = Math.max(0, progress);
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

    // 勇者相遇时决定行动：对战 / 什么都不做
    // relationLevel: 0-4，影响内战概率
    _decideHeroEncounterAction(hero, relationLevel = 2) {
        let combatChance = 30; // 基础对战30%

        // 性格修正
        if (hero.talent[12]) combatChance += 20;      // 刚强（喜欢正面冲突）
        if (hero.talent[11]) combatChance += 10;      // 反抗心（好战）
        if (hero.talent[14]) combatChance += 15;      // 傲慢（轻视对手）
        if (hero.talent[164]) combatChance -= 10;     // 冷静（倾向于回避）
        if (hero.talent[16]) combatChance -= 5;       // 低姿态（避免冲突）

        // 关系修正：关系越差越容易内战，关系越好越和平
        if (relationLevel <= 1) combatChance += 25;   // 敌视：+25%
        else if (relationLevel >= 3) combatChance -= 15; // 好感：-15%
        else if (relationLevel >= 4) combatChance -= 25; // 莫逆之交：-25%

        // 限制范围
        combatChance = Math.max(5, Math.min(80, combatChance));

        if (RAND(100) < combatChance) {
            return 'combat';
        } else {
            return 'none';
        }
    }

    // 勇【vs 勇者战】
    _doHeroVsHeroCombat(a, b) {
        // 使用标准团队战斗系统
        const floorId = this.getHeroFloor(a);
        const progress = this.getHeroProgress(a);
        const aReinforcements = this._findReinforcements([a], floorId, progress, 'hero');
        const bReinforcements = this._findReinforcements([b], floorId, progress, 'hero');
        const leftTeam = [a, ...aReinforcements];
        const rightTeam = [b, ...bReinforcements];
        const combat = this._doTeamCombat(leftTeam, rightTeam, { noExp: true, noDrop: true, maxRounds: 50 });
        const aHp = a.hp;
        const bHp = b.hp;
        const aWin = aHp > bHp;
        const bWin = bHp > aHp;

        let resultText;
        let lootText = '';
        // 50回合未分胜负或双方撤退时视为平手
        if (!combat.victory && !combat.defeated) {
            resultText = `双方势均力敌，各自负伤后撤退`;
        } else if (aWin) {
            resultText = `${a.name}获胜，${b.name}受到重创(HP:${b.hp}/${b.maxHp})`;
            let progress = b.cflag[502] || 0;
            progress -= 20;
            if (progress < 0) {
                const floorId = this.getHeroFloor(b);
                if (floorId > 1) {
                    b.cflag[501] = floorId - 1;
                    b.cflag[502] = 80 + progress;
                } else {
                    b.cflag[502] = 0;
                }
            } else {
                b.cflag[502] = progress;
            }
            if (RAND(100) < 20) {
                const ailKeys = Object.keys(STATUS_AILMENT_DEFS);
                const randAil = ailKeys[RAND(ailKeys.length)];
                this._addStatusAilment(a, randAil, 2);
            }
            // 胜利者没收失败者装备与金钱
            lootText = this._confiscateFromLoser(a, b);
        } else if (bWin) {
            resultText = `${b.name}获胜，${a.name}受到重创(HP:${a.hp}/${a.maxHp})`;
            let progress = a.cflag[502] || 0;
            progress -= 20;
            if (progress < 0) {
                const floorId = this.getHeroFloor(a);
                if (floorId > 1) {
                    a.cflag[501] = floorId - 1;
                    a.cflag[502] = 80 + progress;
                } else {
                    a.cflag[502] = 0;
                }
            } else {
                a.cflag[502] = progress;
            }
            if (RAND(100) < 20) {
                const ailKeys = Object.keys(STATUS_AILMENT_DEFS);
                const randAil = ailKeys[RAND(ailKeys.length)];
                this._addStatusAilment(b, randAil, 2);
            }
            // 胜利者没收失败者装备与金钱
            lootText = this._confiscateFromLoser(b, a);
        } else {
            resultText = `双方势均力敌，各自负伤后撤退`;
        }
        if (lootText) resultText += ' ' + lootText;

        // 追加结局到 combatLog
        combat.combatLog.push(`【${resultText}】`);

        return {
            text: `${a.name} vs ${b.name} 【${resultText}】`,
            combat: combat
        };
    }

    // 勇者内战胜利者没收失败者装备与金钱
    _confiscateFromLoser(winner, loser) {
        if (!loser || !winner) return '';
        const parts = [];

        // 1. 没收金钱（100%）
        const goldTaken = loser.gold || 0;
        if (goldTaken > 0) {
            winner.gold += goldTaken;
            loser.gold = 0;
            parts.push(`夺走了${goldTaken}G`);
        }

        // 2. 没收装备（50%概率）
        if (RAND(100) < 50 && loser.gear) {
            const g = loser.gear;
            const slots = ['head', 'body', 'legs', 'hands', 'neck', 'ring'];
            const takenNames = [];
            for (const slot of slots) {
                if (g[slot]) {
                    const item = g[slot];
                    this.addMuseumItem(item, `${winner.name}从${loser.name}身上没收的装备`);
                    takenNames.push(item.name);
                    g[slot] = null;
                }
            }
            // 武器
            if (g.weapons && g.weapons.length > 0) {
                for (const w of g.weapons) {
                    this.addMuseumItem(w, `${winner.name}从${loser.name}身上没收的装备`);
                    takenNames.push(w.name);
                }
                g.weapons = [];
            }
            // 道具
            if (g.items && g.items.length > 0) {
                for (const item of g.items) {
                    this.addMuseumItem(item, `${winner.name}从${loser.name}身上没收的装备`);
                    takenNames.push(item.name);
                }
                g.items = [];
            }
            if (takenNames.length > 0) {
                parts.push(`没收了装备：${takenNames.join(',')}（已收入收藏馆）`);
            }
        }

        return parts.length > 0 ? `【战利品】${winner.name}从${loser.name}身上${parts.join('，')}` : '';
    }

    // ========== 勇者每日事件标记系统 ==========

    // 检查勇者或小队今天是否已触发事件
    _hasTriggeredDailyEvent(hero) {
        const squadId = hero.cflag[900];
        if (squadId) {
            return this.invaders.some(h => h.cflag[900] === squadId && h.cflag[910]);
        }
        return !!hero.cflag[910];
    }

    // 标记勇者或小队今天已触发事件
    _markDailyEventTriggered(hero) {
        const squadId = hero.cflag[900];
        if (squadId) {
            for (const h of this.invaders) {
                if (h.cflag[900] === squadId) h.cflag[910] = 1;
            }
        } else {
            hero.cflag[910] = 1;
        }
    }

    // ========== 勇【前勇者小队系统==========

    // 清除所有小队标】
    _clearSquadFlags() {
        for (const hero of this.invaders) {
            hero.cflag[900] = 0; // 小队ID
            hero.cflag[901] = 0; // 队长标记
            hero.cflag[902] = 0; // 今日已战【
}
        for (const c of this.characters) {
            if (c.talent[200]) {
                c.cflag[900] = 0;
                c.cflag[901] = 0;
                c.cflag[902] = 0;
            }
        }
    }

    // 勇者自动组队：同一层且进度接近的自动组队，相性好的优先
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
                if (squad.length >= 3) break; // 小队最多3人
                const other = this.invaders[j];
                if (this.getHeroFloor(other) === floorId) {
                    const diff = Math.abs(this.getHeroProgress(other) - progress);
                    const rel = this._getHeroRelation(hero, other);
                    // 相性影响组队范围：关系好放宽到25%，关系差不允许组队
                    let threshold = 15;
                    if (rel.level >= 4) threshold = 30;      // 莫逆之交：范围更大
                    else if (rel.level >= 3) threshold = 25; // 好感：范围放宽
                    else if (rel.level <= 1) continue;       // 敌视/不死不休：不组队
                    if (diff <= threshold) {
                        squad.push(other);
                        assigned.add(j);
                        // 首次组队触发关系事件（仅一次，受每日事件限制）
                        if (!rel.history.some(h => h.event === '齐心协力' || h.event === '同甘共苦')) {
                            if (!this._hasTriggeredDailyEvent(hero) && !this._hasTriggeredDailyEvent(other)) {
                                if (rel.level >= 3 && RAND(100) < 30) {
                                    this._setHeroRelation(hero, other, 1, 'complete_quest');
                                    hero.cflag[910] = 1;
                                    other.cflag[910] = 1;
                                }
                            }
                        }
                    }
                }
            }

            if (squad.length >= 2) {
                // 设置小队标记，速度最高的为队长
                const leader = squad.reduce((best, h) => {
                    const spd = h.cflag[13] || 10 + h.level * 2;
                    const bestSpd = best.cflag[13] || 10 + best.level * 2;
                    return spd > bestSpd ? h : best;
                }, squad[0]);

                const squadName = this._generateSquadName(leader);
                for (const member of squad) {
                    member.cflag[900] = squadId;
                    member.cflag[901] = member === leader ? 1 : 0;
                    member.cstr[1] = squadName;
                    // 被组队的撤退勇者重新振作
                    if (member.cflag[503]) member.cflag[503] = 0;
                }
                // 每日事件标记同步：如果小队中任何成员已触发事件，整队同步
                const anyTriggered = squad.some(m => m.cflag[910]);
                if (anyTriggered) {
                    for (const member of squad) {
                        member.cflag[910] = 1;
                    }
                }
                // 治疗职业小队恢复
                this._applySquadHealing(squad);
                squadId++;
            }
        }
    }

    // 小队治疗职业自动恢复
    _applySquadHealing(squad) {
        if (!squad || squad.length < 2) return;
        const healerClasses = [202, 205, 209]; // 神官,炼金术士,巫女
        const healers = squad.filter(m => healerClasses.includes(m.cflag[950] || 0));
        if (healers.length === 0) return;
        for (const member of squad) {
            if (member.hp <= 0) continue;
            // 恢复HP
            const maxHp = member.maxHp || member.base[0] || 100;
            const healAmount = Math.floor(maxHp * 0.05 * healers.length);
            const oldHp = member.hp;
            member.hp = Math.min(maxHp, member.hp + healAmount);
            const actualHeal = member.hp - oldHp;
            // 清除1个非诅咒异常状态（50%概率每个治疗者）
            const ailmentMask = member.cflag[920] || 0;
            if (ailmentMask > 0) {
                for (const h of healers) {
                    if (RAND(100) < 50) {
                        // 优先清除严重状态
                        const priority = ['poison', 'burn', 'aphrodisiac', 'freeze', 'sleep', 'confuse', 'fear', 'weak'];
                        for (const key of priority) {
                            const def = STATUS_AILMENT_DEFS[key];
                            if (def && (ailmentMask & def.bit)) {
                                this._removeStatusAilment(member, key);
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        }
    }

    // 前勇者奴隶自动组】
    _formSlaveSquads() {
        let squadId = 100; // 前勇者小队ID【00开始，避免冲突
        const assigned = new Set();

        const explorers = this.characters.filter(c => c.talent[200] && c.cflag[700]);

        for (let i = 0; i < explorers.length; i++) {
            if (assigned.has(i)) continue;
            const slave = explorers[i];
            const floorId = slave.cflag[701] || 10;
            const progress = slave.cflag[702] || 0;

            const squad = [slave];
            assigned.add(i);

            for (let j = i + 1; j < explorers.length; j++) {
                if (assigned.has(j)) continue;
                if (squad.length >= 3) break;
                const other = explorers[j];
                if ((other.cflag[701] || 10) === floorId) {
                    const diff = Math.abs((other.cflag[702] || 0) - progress);
                    if (diff <= 15) {
                        squad.push(other);
                        assigned.add(j);
                    }
                }
            }

            if (squad.length > 1) {
                const leader = squad.reduce((best, s) => {
                    const spd = s.cflag[13] || 10 + s.level * 2;
                    const bestSpd = best.cflag[13] || 10 + best.level * 2;
                    return spd > bestSpd ? s : best;
                }, squad[0]);

                const squadName = this._generateSquadName(leader);
                for (const member of squad) {
                    member.cflag[900] = squadId;
                    member.cflag[901] = member === leader ? 1 : 0;
                    member.cstr[1] = squadName;
                }
                squadId++;
            }
        }
    }

    // 获取勇者的小队成员（不包括自己】
    _getHeroSquad(hero) {
        const squadId = hero.cflag[900];
        if (!squadId) return [];
        return this.invaders.filter(h => h !== hero && h.cflag[900] === squadId);
    }

    // 尝试将两个勇者加入同一小队，最多3人
    _tryMergeSquad(a, b) {
        const aId = a.cflag[900];
        const bId = b.cflag[900];
        if (aId && bId && aId === bId) return true; // 已经在同一小队
        const aSquad = aId ? this.invaders.filter(h => h.cflag[900] === aId) : [a];
        const bSquad = bId ? this.invaders.filter(h => h.cflag[900] === bId) : [b];
        if (aSquad.length + bSquad.length > 3) return false; // 超过3人上限
        const newId = aId || bId || (100 + a.id + b.id);
        const allMembers = [...new Set([...aSquad, ...bSquad])];
        const leader = allMembers.reduce((best, h) => {
            const spd = h.cflag[13] || 10 + h.level * 2;
            const bestSpd = best.cflag[13] || 10 + best.level * 2;
            return spd > bestSpd ? h : best;
        }, allMembers[0]);
        for (const m of allMembers) {
            m.cflag[900] = newId;
            m.cflag[901] = m === leader ? 1 : 0;
        }
        return true;
    }

    // 获取前勇者奴隶的小队成员
    _getSlaveSquad(slave) {
        const squadId = slave.cflag[900];
        if (!squadId) return [];
        return this.characters.filter(c => c !== slave && c.talent[200] && c.cflag[900] === squadId);
    }

    // 寻找战斗增援：同一层20%进度范围内的勇者/前勇者可能加入战斗
    _findReinforcements(fighters, floorId, progress, side = 'hero') {
        const reinforcements = [];
        const candidates = this.invaders.filter(h => {
            if (h.hp <= 0) return false;
            if (fighters.includes(h)) return false;
            if (this.getHeroFloor(h) !== floorId) return false;
            const p = this.getHeroProgress(h);
            return Math.abs(p - progress) <= 20;
        });
        for (const candidate of candidates) {
            const isSpy = candidate.cflag[912];
            if (side === 'hero') {
                if (isSpy) continue; // 伪装者不帮助勇者方
                let totalRel = 0, count = 0;
                for (const f of fighters) {
                    if (f.cflag[912]) continue;
                    const rel = this._getHeroRelation(f, candidate);
                    totalRel += rel.level;
                    count++;
                }
                const avgRel = count > 0 ? totalRel / count : 1;
                const chance = Math.min(70, 15 + avgRel * 12);
                if (RAND(100) < chance) reinforcements.push(candidate);
            } else if (side === 'monster') {
                if (isSpy) {
                    if (RAND(100) < 35) reinforcements.push(candidate);
                } else {
                    // 普通勇者反叛到怪物方概率极低
                    if ((candidate.mark[0] || 0) >= 2 && RAND(100) < 8) {
                        reinforcements.push(candidate);
                    }
                }
            }
        }
        return reinforcements.slice(0, 1); // 最多1个增援
    }

    // 小队战斗：多对一回合制，速度高的先手
    _doSquadCombat(squad, monster) {
        let monHp = monster.hp;
        let monMp = monster.mp || 0;
        let rounds = 0;
        const maxRounds = 50;
        const combatLog = [];

        // 记录初始HP（用于战斗UI显示）
        combatLog.push(`【初始】小队HP:${squad.reduce((s,h)=>s+h.hp,0)} 怪物HP:${monHp}`);

        // 检测伪装者
        const spies = squad.filter(h => h.cflag[912]);
        const realHeroes = squad.filter(h => !h.cflag[912]);
        const hasSpy = spies.length > 0;
        const attrMod = Math.max(0.25, 1 - spies.length * 0.25);

        // 叛变检测
        let betrayed = false;
        if (hasSpy && realHeroes.length > 0) {
            const totalHeroHp = realHeroes.reduce((s, h) => s + h.hp, 0);
            const spyTotalHp = spies.reduce((s, h) => s + h.hp, 0);
            if (totalHeroHp < (spyTotalHp + monster.hp) * 0.25) {
                betrayed = true;
                combatLog.push(`⚠️ ${spies.map(s => s.name).join(',')} 叛变了！转而攻击勇者！`);
            }
        }

        // 收集所有参与者并按速度排序
        const actors = [];
        for (const member of squad) {
            const statusFx = this._applyStatusAilmentEffects(member);
            let spd = member.cflag[13] || 10 + member.level * 2;
            spd = Math.max(1, Math.floor(spd * (1 + statusFx.spdMod)));
            actors.push({
                type: 'hero',
                entity: member,
                spd: spd,
                baseSpd: member.cflag[13] || 10 + member.level * 2,
                name: member.name,
                isSpy: !!member.cflag[912]
            });
        }
        actors.push({
            type: 'monster',
            entity: monster,
            spd: monster.spd,
            name: monster.name
        });

        // 回合开始时报告异常状态
        for (const h of realHeroes) {
            const stText = this._getStatusAilmentText(h);
            if (stText) combatLog.push(`⚠️ ${h.name}处于异常状态：${stText}`);
        }

        while (rounds < maxRounds && monHp > 0) {
            const aliveHeroes = squad.filter(h => h.hp > 0);
            if (aliveHeroes.length === 0) break;

            rounds++;

            // === 逃跑判定 ===
            const realAlive = aliveHeroes.filter(h => !h.cflag[912]);
            if (realAlive.length > 0) {
                const maxHeroLevel = Math.max(...realAlive.map(h => h.level));
                const fleeChance = Math.max(5, Math.min(95, 30 + (maxHeroLevel - monster.level) * 5));
                if (RAND(100) < fleeChance) {
                    combatLog.push(`【${rounds}回合】小队成功撤离了战斗！`);
                    monster.maxHp = monster.hp;
                    monster.hp = Math.max(0, monHp);
                    return { victory: false, defeated: false, escaped: true, rounds, combatLog, monster, betrayed };
                }
            }

            // 每回合按速度重新排序
            actors.sort((a, b) => b.spd - a.spd);

            for (const actor of actors) {
                if (monHp <= 0) break;

                if (actor.type === 'hero' && actor.entity.hp > 0) {
                    const hero = actor.entity;
                    if (actor.isSpy) {
                        if (betrayed) {
                            const aliveTargets = realHeroes.filter(h => h.hp > 0);
                            if (aliveTargets.length > 0) {
                                const target = aliveTargets.reduce((min, h) => h.hp < min.hp ? h : min, aliveTargets[0]);
                                const spyAtk = Math.floor((hero.cflag[11] || 20) * 0.5);
                                const dmg = Math.max(1, spyAtk - (target.cflag[12] || 15));
                                target.hp = Math.max(0, target.hp - dmg);
                                combatLog.push(`💀 ${hero.name}(叛变)攻击${target.name}，造成${dmg}伤害`);
                            }
                        } else {
                            combatLog.push(`😶 ${hero.name}(伪装者)消极作战，没有攻击`);
                        }
                        continue;
                    }

                    // 应用异常状态效果
                    const statusFx = this._applyStatusAilmentEffects(hero);
                    let heroBaseAtk = (hero.cflag[11] || 20);
                    let heroBaseDef = (hero.cflag[12] || 15);
                    heroBaseAtk = Math.max(1, Math.floor(heroBaseAtk * (1 + statusFx.atkMod)));
                    heroBaseDef = Math.max(0, Math.floor(heroBaseDef * (1 + statusFx.defMod)));

                    // 异常状态：无法行动判定
                    if (statusFx.actionBlock > 0 && RAND(100) < statusFx.actionBlock * 100) {
                        combatLog.push(`【${rounds}回合】${hero.name}因异常状态无法行动！`);
                        continue;
                    }
                    if (statusFx.friendlyFire > 0 && RAND(100) < statusFx.friendlyFire * 100) {
                        const selfDmg = Math.max(1, Math.floor(heroBaseAtk * 0.3));
                        hero.hp = Math.max(1, hero.hp - selfDmg);
                        combatLog.push(`【${rounds}回合】${hero.name}陷入混乱，攻击了自己！💫 受到${selfDmg}伤害`);
                        continue;
                    }

                    // 治疗职业回合开始时治疗最低HP队友
                    const cls = this._getHeroClass(hero);
                    if (cls && HEALER_CLASS_IDS.includes(hero.cflag[950])) {
                        const allies = realHeroes.filter(h => h.hp > 0 && h.hp < h.maxHp * 0.6);
                        if (allies.length > 0 && RAND(100) < 30) {
                            const target = allies.reduce((min, h) => h.hp / h.maxHp < min.hp / min.maxHp ? h : min, allies[0]);
                            const healAmt = Math.floor(hero.level * 4 + heroBaseAtk * 0.2);
                            target.hp = Math.min(target.maxHp, target.hp + healAmt);
                            combatLog.push(`【${rounds}回合】${hero.name}(治疗)恢复${target.name}${healAmt}HP`);
                        }
                    }

                    // 尝试使用职业技能
                    const skillId = this._chooseHeroSkill(hero, "squad");
                    const skillDef = skillId ? HERO_SKILL_DEFS[skillId] : null;
                    const canUseSkill = skillDef && hero.mp >= skillDef.cost;

                    if (canUseSkill) {
                        hero.mp -= skillDef.cost;
                        const skillResult = this._useHeroSkill(hero, skillId, monster, { isSolo: false, squad: realHeroes });
                        if (skillResult && skillResult.used) {
                            combatLog.push(`【${rounds}回合】${skillResult.log}`);
                            if (skillResult.damage) {
                                monHp -= skillResult.damage;
                            }
                            if (skillResult.heal) {
                                if (skillResult.isMass) {
                                    for (const ally of realHeroes) {
                                        if (ally.hp > 0) ally.hp = Math.min(ally.maxHp, ally.hp + skillResult.heal);
                                    }
                                } else {
                                    const healTarget = realHeroes.filter(h => h.hp > 0).reduce((min, h) => h.hp < min.hp ? h : min, realHeroes[0]);
                                    if (healTarget) healTarget.hp = Math.min(healTarget.maxHp, healTarget.hp + skillResult.heal);
                                }
                            }
                            if (skillResult.buff) {
                                // 小队战斗中增益效果只作用于自己（简化）
                                combatLog.push(`  → ${hero.name}获得增益效果`);
                            }
                            if (skillResult.cleanse) {
                                const cured = this._tryCureStatusAilment(hero, "skill_cleanse");
                                if (cured.length > 0) combatLog.push(`  → ${cured.join(',')}`);
                            }
                            if (skillResult.invincible) {
                                combatLog.push(`  → ${hero.name}进入无敌状态`);
                            }
                            continue;
                        }
                    }

                    // 普通攻击
                    const gBonus = GearSystem.applyGearBonus(hero, !!hero.talent[200]);
                    const heroAtk = Math.floor(((hero.cflag[11] || 20) + (gBonus.atk || 0)) * attrMod);
                    const dmg = Math.max(1, heroAtk - monster.def);
                    monHp -= dmg;
                    combatLog.push(`【${rounds}回合】${hero.name}攻击${monster.name}，造成${dmg}伤害`);

                } else if (actor.type === 'monster' && monHp > 0) {
                    let aliveTargets = squad.filter(h => h.hp > 0);
                    if (aliveTargets.length === 0) break;
                    const realTargets = aliveTargets.filter(h => !h.cflag[912]);
                    const target = realTargets.length > 0
                        ? realTargets.reduce((min, h) => h.hp < min.hp ? h : min, realTargets[0])
                        : aliveTargets.reduce((min, h) => h.hp < min.hp ? h : min, aliveTargets[0]);
                    const monAtk = Math.floor(monster.atk * (hasSpy && !betrayed ? 1.25 : 1));
                    const tBonus = GearSystem.applyGearBonus(target, !!target.talent[200]);
                    const targetDef = (target.cflag[12] || 15) + (tBonus.def || 0);
                    const monDmg = Math.max(1, monAtk - targetDef);
                    target.hp = Math.max(0, target.hp - monDmg);
                    combatLog.push(`【${rounds}回合】${monster.name}攻击${target.name}，造成${monDmg}伤害`);

                    // 怪物有概率附加异常状态
                    const aiType = this._getMonsterAIType(monster);
                    if (aiType === 'magic' && RAND(100) < 15) {
                        this._addStatusAilment(target, "paralysis", 2);
                        combatLog.push(`  → ${target.name}被麻痹了！`);
                    } else if (RAND(100) < 8) {
                        const ailments = ["weak", "burn", "poison", "fear"];
                        const aType = ailments[RAND(ailments.length)];
                        this._addStatusAilment(target, aType, 2 + RAND(2));
                        combatLog.push(`  → ${target.name}被施加了【${STATUS_AILMENT_DEFS[aType].name}】！`);
                    }
                }
            }
        }

        let victory = monHp <= 0;
        const allDefeated = squad.filter(h => !h.cflag[912]).every(h => h.hp <= 0);
        const survivors = squad.filter(h => h.hp > 0);
        let escaped = false;

        // 50回合后未分胜负，按总剩余血量判胜负
        if (!victory && !allDefeated) {
            const heroHp = survivors.filter(h => !h.cflag[912]).reduce((s, h) => s + h.hp, 0);
            if (heroHp > monHp) {
                victory = true;
                combatLog.push(`【血量判定】小队以剩余HP优势获胜！(小队${heroHp} vs 怪物${monHp})`);
            } else if (monHp > heroHp) {
                combatLog.push(`【血量判定】${monster.name}以剩余HP优势获胜！(怪物${monHp} vs 小队${heroHp})`);
            } else {
                escaped = true;
                combatLog.push(`【平手】双方激战50回合，势均力敌，各自撤退`);
            }
        }

        let drop = null;
        if (victory) {
            const expPerMember = Math.floor(monster.level * 10 / Math.max(1, survivors.filter(h => !h.cflag[912]).length));
            for (const hero of survivors) {
                if (!hero.cflag[912]) hero.exp[0] = (hero.exp[0] || 0) + expPerMember;
            }
            combatLog.push(`【胜利】小队击败了${monster.name}(战斗${rounds}回合) 每人获得${expPerMember}EXP`);
            // 精英怪物掉落处理
            let dropChance = 0.30;
            let rarityBonus = 0;
            let dropLevel = monster.level;
            const floorId = survivors.length > 0 ? this.getHeroFloor(survivors[0]) : 1;
            const maxRarity = this._getFloorDropMaxRarity(floorId);
            if (monster.eliteType === 'chief') {
                dropChance = 1.0;
                rarityBonus = ELITE_TYPE_DEFS.chief.dropRarityBonus;
            } else if (monster.eliteType === 'overlord') {
                dropChance = 1.0;
                rarityBonus = ELITE_TYPE_DEFS.overlord.dropRarityBonus;
                if (RAND(100) < 50) {
                    const nextFloor = Math.min(10, floorId + 1);
                    dropLevel = this._getFloorMaxMonsterLevel(nextFloor) + 5;
                }
            }
            if (Math.random() < dropChance) {
                const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
                const slot = slotTypes[RAND(slotTypes.length)];
                let rarity = GearSystem._rollRarity();
                rarity = Math.min(maxRarity, rarity + rarityBonus);
                drop = GearSystem.generateGear(slot, dropLevel, rarity);
                const lucky = survivors[RAND(survivors.length)];
                const r = GearSystem.equipItem(lucky, drop);
                if (r.success) combatLog.push(`🎁 ${lucky.name}获得了${r.msg}`);
            }
        } else if (allDefeated) {
            combatLog.push(`【败北】小队被${monster.name}全灭了...`);
        } else if (escaped) {
            combatLog.push(`【撤退】小队从战斗中撤退了`);
        }

        // 更新怪物最终HP（用于UI显示）
        monster.maxHp = monster.hp;
        monster.hp = Math.max(0, monHp);
        return { victory, defeated: allDefeated, escaped, rounds, combatLog, monster, betrayed };
    }

    // 团队战斗：双方均可组队（最多3标准位+1临时位）
    _doTeamCombat(leftTeam, rightTeam, options = {}) {
        const maxRounds = options.maxRounds || 50;
        const combatLog = [];
        let rounds = 0;

        const wrapUnit = (entity, teamSide, index) => {
            const isMonster = !entity.talent;
            const isExHero = entity.talent && entity.talent[200];
            const isSpy = entity.talent && entity.cflag[912];
            const isMaster = !isMonster && this.getMaster() === entity;
            const gBonus = isMonster ? {} : GearSystem.applyGearBonus(entity, !!isExHero);
            // 魔王声望等级加成（每100声望=1级）
            const fameLv = isMaster ? this.getMasterFameLevel() : 0;
            const effLevel = (entity.level || 1) + fameLv;
            const baseAtk = isMonster ? (entity.atk || 0) : ((entity.cflag[11] || 20) + (gBonus.atk || 0) + fameLv * 5);
            const baseDef = isMonster ? (entity.def || 0) : ((entity.cflag[12] || 15) + (gBonus.def || 0) + fameLv * 4);
            const baseSpd = isMonster ? (entity.spd || 0) : ((entity.cflag[13] || 10) + effLevel * 2 + fameLv * 3);
            const statusFx = isMonster ? { atkMod:0, defMod:0, spdMod:0, dotHp:0, dotMp:0, actionBlock:0, friendlyFire:0 } : this._applyStatusAilmentEffects(entity);
            // 勋章加成（仅前勇者/奴隶）
            const medalMult = (!isMonster && isExHero) ? this.getMedalBonus(entity) : 1;
            return {
                id: teamSide + '_' + index,
                name: entity.name || '???',
                entity: entity,
                team: teamSide,
                isMonster: isMonster,
                isExHero: !!isExHero,
                isSpy: !!isSpy,
                initialHp: Math.floor((entity.hp || 0) * medalMult),
                initialMp: Math.floor((entity.mp || 0) * medalMult),
                hp: Math.floor((entity.hp || 0) * medalMult),
                maxHp: Math.floor((entity.maxHp || entity.hp || 1) * medalMult),
                mp: isMonster ? (entity.mp || 0) : Math.floor((entity.mp || 0) * medalMult),
                maxMp: isMonster ? (entity.mp || 0) : Math.floor((entity.maxMp || entity.mp || 1) * medalMult),
                baseAtk: Math.max(1, Math.floor(baseAtk * (1 + statusFx.atkMod) * medalMult * (isMaster ? 1.25 : 1))),
                baseDef: Math.max(0, Math.floor(baseDef * (1 + statusFx.defMod) * medalMult * (isMaster ? 1.25 : 1))),
                baseSpd: Math.max(1, Math.floor(baseSpd * (1 + statusFx.spdMod) * medalMult * (isMaster ? 1.25 : 1))),
                atkMod: 0, defMod: 0, spdMod: 0,
                buffTurns: 0,
                invincible: 0,
                statusFx: statusFx,
                classId: isMonster ? 0 : (entity.cflag[950] || 0),
                level: effLevel
            };
        };

        const leftUnits = leftTeam.map((e, i) => wrapUnit(e, 'left', i));
        const rightUnits = rightTeam.map((e, i) => wrapUnit(e, 'right', i));

        const snapshotHp = () => {
            const leftStr = leftUnits.filter(u => u.hp > 0).map(u => `${u.name}:${u.hp}/${u.maxHp}`).join(' ');
            const rightStr = rightUnits.filter(u => u.hp > 0).map(u => `${u.name}:${u.hp}/${u.maxHp}`).join(' ');
            return `L:${leftStr || '全灭'} | R:${rightStr || '全灭'}`;
        };
        combatLog.push(`【初始】${snapshotHp()}`);

        for (const u of leftUnits) {
            if (u.statusFx.dotHp > 0 || u.statusFx.dotMp > 0) {
                const stText = this._getStatusAilmentText(u.entity);
                if (stText) combatLog.push(`⚠️ ${u.name}处于异常状态：${stText}`);
            }
        }

        let betrayed = false;
        const spies = leftUnits.filter(u => u.isSpy);
        const realLeft = leftUnits.filter(u => !u.isSpy);
        if (spies.length > 0 && realLeft.length > 0) {
            const leftTotalHp = realLeft.reduce((s, u) => s + u.hp, 0);
            const rightTotalHp = rightUnits.reduce((s, u) => s + u.hp, 0);
            if (leftTotalHp < (spies.reduce((s, u) => s + u.hp, 0) + rightTotalHp) * 0.25) {
                betrayed = true;
                combatLog.push(`💀 ${spies.map(s => s.name).join(',')} 叛变了！转而攻击同伴！`);
            }
        }

        let allActors = [...leftUnits, ...rightUnits];

        while (rounds < maxRounds) {
            const aliveLeft = leftUnits.filter(u => u.hp > 0);
            const aliveRight = rightUnits.filter(u => u.hp > 0);
            if (aliveLeft.length === 0 || aliveRight.length === 0) break;

            rounds++;

            // === 逃跑判定：勇者方每回合可以尝试撤离 ===
            const leftHasHero = aliveLeft.some(u => !u.isMonster && !u.isExHero && !u.isSpy && !u.isMaster);
            const rightHasHero = aliveRight.some(u => !u.isMonster && !u.isExHero && !u.isSpy && !u.isMaster);
            if (leftHasHero !== rightHasHero) {
                const heroSide = leftHasHero ? aliveLeft : aliveRight;
                const enemySide = leftHasHero ? aliveRight : aliveLeft;
                const heroMaxLevel = Math.max(...heroSide.map(u => u.level));
                const enemyMaxLevel = enemySide.length > 0 ? Math.max(...enemySide.map(u => u.level)) : 1;
                const fleeChance = Math.max(5, Math.min(95, 30 + (heroMaxLevel - enemyMaxLevel) * 5));
                if (RAND(100) < fleeChance) {
                    combatLog.push(`【${rounds}回合】勇者方成功撤离了战斗！`);
                    for (const u of leftUnits) { u.entity.hp = u.hp; u.entity.mp = u.mp; }
                    for (const u of rightUnits) { u.entity.hp = u.hp; u.entity.mp = u.mp; }
                    return { victory: false, defeated: false, escaped: true, rounds, combatLog, leftTeam: leftUnits, rightTeam: rightUnits, drop: null, betrayed, monster: rightUnits[0] ? rightUnits[0].entity : null };
                }
            }

            allActors.sort((a, b) => (b.baseSpd + b.spdMod) - (a.baseSpd + a.spdMod));

            for (const actor of allActors) {
                if (actor.hp <= 0) continue;
                const enemyAlive = actor.team === 'left'
                    ? rightUnits.filter(u => u.hp > 0)
                    : leftUnits.filter(u => u.hp > 0);
                if (enemyAlive.length === 0) break;

                if (actor.isSpy && actor.team === 'left') {
                    if (betrayed) {
                        const targets = leftUnits.filter(u => u.hp > 0 && !u.isSpy);
                        if (targets.length > 0) {
                            const target = targets.reduce((min, u) => u.hp < min.hp ? u : min, targets[0]);
                            const dmg = Math.max(1, Math.floor(actor.baseAtk * 0.5));
                            target.hp = Math.max(0, target.hp - dmg);
                            combatLog.push(`【${rounds}回合】💀 ${actor.name}(叛变)攻击${target.name}，造成${dmg}伤害`);
                        }
                    } else {
                        combatLog.push(`【${rounds}回合】😶 ${actor.name}(伪装者)消极作战，没有攻击`);
                    }
                    continue;
                }

                if (actor.statusFx.actionBlock > 0 && RAND(100) < actor.statusFx.actionBlock * 100) {
                    combatLog.push(`【${rounds}回合】${actor.name}因异常状态无法行动！`);
                    continue;
                }
                if (actor.statusFx.friendlyFire > 0 && RAND(100) < actor.statusFx.friendlyFire * 100) {
                    const selfDmg = Math.max(1, Math.floor((actor.baseAtk + actor.atkMod) * 0.3));
                    actor.hp = Math.max(1, actor.hp - selfDmg);
                    combatLog.push(`【${rounds}回合】${actor.name}陷入混乱，攻击了自己！💫 受到${selfDmg}伤害`);
                    continue;
                }

                const target = enemyAlive.reduce((min, u) => u.hp < min.hp ? u : min, enemyAlive[0]);

                if (!actor.isMonster && actor.mp >= 10) {
                    const skillCtx = actor.team === 'left' ? 'squad' : 'solo';
                    const skillId = this._chooseHeroSkill(actor.entity, skillCtx);
                    const skillDef = skillId ? HERO_SKILL_DEFS[skillId] : null;
                    if (skillDef && actor.mp >= skillDef.cost) {
                        actor.mp -= skillDef.cost;
                        const skillResult = this._useHeroSkill(actor.entity, skillId, target.entity, { isSolo: actor.team !== 'left', squad: leftUnits.filter(u => u.hp > 0 && !u.isSpy).map(u => u.entity) });
                        if (skillResult && skillResult.used) {
                            combatLog.push(`【${rounds}回合】${skillResult.log}`);
                            if (skillResult.damage) {
                                target.hp = Math.max(0, target.hp - skillResult.damage);
                            }
                            if (skillResult.heal) {
                                const allies = (actor.team === 'left' ? leftUnits : rightUnits).filter(u => u.hp > 0);
                                if (skillResult.isMass) {
                                    for (const ally of allies) ally.hp = Math.min(ally.maxHp, ally.hp + skillResult.heal);
                                } else {
                                    const healTarget = allies.reduce((min, u) => u.hp < min.hp ? u : min, allies[0]);
                                    if (healTarget) healTarget.hp = Math.min(healTarget.maxHp, healTarget.hp + skillResult.heal);
                                }
                            }
                            if (skillResult.buff) {
                                const b = skillResult.buff;
                                if (b.type === 'atk' || b.type === 'all') actor.atkMod += b.value;
                                if (b.type === 'def' || b.type === 'all') actor.defMod += b.value;
                                actor.buffTurns = Math.max(actor.buffTurns, b.duration || 3);
                            }
                            if (skillResult.debuff) {
                                const d = skillResult.debuff;
                                if (d.type === 'atk' || d.type === 'all') target.atkMod -= d.value;
                                if (d.type === 'def' || d.type === 'all') target.defMod -= d.value;
                            }
                            if (skillResult.invincible) actor.invincible = skillResult.duration || 1;
                            if (skillResult.ailment) combatLog.push(`  → ${target.name}被施加了异常效果！`);
                            if (skillResult.cleanse) {
                                const cured = this._tryCureStatusAilment(actor.entity, "skill_cleanse");
                                if (cured.length > 0) combatLog.push(`  → ${cured.join(',')}`);
                            }
                            continue;
                        }
                    }
                }

                if (!actor.isMonster && HEALER_CLASS_IDS && HEALER_CLASS_IDS.includes(actor.classId)) {
                    const allies = (actor.team === 'left' ? leftUnits : rightUnits).filter(u => u.hp > 0 && u.hp < u.maxHp * 0.6);
                    if (allies.length > 0 && RAND(100) < 30) {
                        const healTarget = allies.reduce((min, u) => u.hp / u.maxHp < min.hp / min.maxHp ? u : min, allies[0]);
                        const healAmt = Math.floor(actor.level * 4 + actor.baseAtk * 0.2);
                        healTarget.hp = Math.min(healTarget.maxHp, healTarget.hp + healAmt);
                        combatLog.push(`【${rounds}回合】${actor.name}(治疗)恢复${healTarget.name}${healAmt}HP`);
                        continue;
                    }
                }

                const attackerAtk = Math.max(1, actor.baseAtk + actor.atkMod);
                const targetDef = Math.max(0, target.baseDef + target.defMod);
                let dmg = Math.max(1, attackerAtk - targetDef);

                if (actor.isMonster && actor.team === 'right' && spies.length > 0 && !betrayed) {
                    dmg = Math.floor(dmg * 1.25);
                }

                if (target.invincible > 0) {
                    combatLog.push(`【${rounds}回合】${actor.name}的攻击被${target.name}挡下了！🛡️ (无敌)`);
                    target.invincible--;
                    continue;
                }

                target.hp = Math.max(0, target.hp - dmg);
                combatLog.push(`【${rounds}回合】${actor.name}攻击${target.name}，造成${dmg}伤害`);

                if (actor.isMonster && RAND(100) < 10) {
                    const ailments = ["weak", "burn", "poison", "fear"];
                    const aType = ailments[RAND(ailments.length)];
                    this._addStatusAilment(target.entity, aType, 2 + RAND(2));
                    combatLog.push(`  → ${target.name}被施加了【${STATUS_AILMENT_DEFS[aType].name}】！`);
                }
            }

            combatLog.push(`【${rounds}回合结束】${snapshotHp()}`);

            for (const u of allActors) {
                if (u.buffTurns > 0) {
                    u.buffTurns--;
                    if (u.buffTurns <= 0) { u.atkMod = 0; u.defMod = 0; u.spdMod = 0; }
                }
                if (u.invincible > 0) u.invincible--;
            }
        }

        const aliveLeft = leftUnits.filter(u => u.hp > 0);
        const aliveRight = rightUnits.filter(u => u.hp > 0);
        let victory = aliveRight.length === 0 && aliveLeft.length > 0;
        let defeated = aliveLeft.length === 0;
        const realLeftAlive = leftUnits.filter(u => u.hp > 0 && !u.isSpy);
        let draw = false;

        // 50回合后未分胜负
        if (!victory && !defeated) {
            const leftHasMonster = leftUnits.some(u => u.isMonster);
            const rightHasMonster = rightUnits.some(u => u.isMonster);
            const leftHasMaster = leftUnits.some(u => u.isMaster);
            const rightHasMaster = rightUnits.some(u => u.isMaster);
            const isPvP = !leftHasMonster && !rightHasMonster && !leftHasMaster && !rightHasMaster;
            if (isPvP) {
                // 勇者内战50回合视为平手（撤退）
                combatLog.push(`【平手】双方激战50回合未分胜负，各自撤退`);
            } else {
                const leftHp = leftUnits.reduce((s, u) => s + Math.max(0, u.hp), 0);
                const rightHp = rightUnits.reduce((s, u) => s + Math.max(0, u.hp), 0);
                if (leftHp > rightHp) {
                    victory = true;
                    combatLog.push(`【血量判定】左方以剩余HP优势获胜！(左${leftHp} vs 右${rightHp})`);
                } else if (rightHp > leftHp) {
                    defeated = true;
                    combatLog.push(`【血量判定】右方以剩余HP优势获胜！(右${rightHp} vs 左${leftHp})`);
                } else {
                    combatLog.push(`【平手】双方激战50回合未分胜负，各自撤退`);
                }
            }
        }

        for (const u of leftUnits) { u.entity.hp = u.hp; u.entity.mp = u.mp; }
        for (const u of rightUnits) { u.entity.hp = u.hp; u.entity.mp = u.mp; }

        let drop = null;
        if (victory && aliveLeft.length > 0) {
            const highestLevelMonster = rightUnits.reduce((max, u) => u.level > max.level ? u : max, rightUnits[0]);
            if (!options.noExp) {
                const expPerMember = Math.floor(highestLevelMonster.level * 10 / Math.max(1, realLeftAlive.length));
                for (const u of realLeftAlive) {
                    u.entity.exp[0] = (u.entity.exp[0] || 0) + expPerMember;
                }
                combatLog.push(`【胜利】${aliveLeft.map(u => u.name).join(',')}击败了敌人(战斗${rounds}回合) 每人获得${expPerMember}EXP`);
            } else {
                combatLog.push(`【胜利】${aliveLeft.map(u => u.name).join(',')}获胜(战斗${rounds}回合)`);
            }
            if (!options.noDrop) {
                const elite = rightUnits.find(u => u.entity.eliteType);
                let dropChance = 0.30;
                let rarityBonus = 0;
                let dropLevel = highestLevelMonster.level;
                // 获取楼层用于限制掉落品质
                let floorId = 1;
                const heroUnit = aliveLeft.find(u => !u.isMonster && !u.isMaster);
                if (heroUnit) floorId = this.getHeroFloor(heroUnit.entity);
                const maxRarity = this._getFloorDropMaxRarity(floorId);
                if (elite) {
                    dropChance = 1.0;
                    const eliteDef = ELITE_TYPE_DEFS[elite.entity.eliteType];
                    if (eliteDef) {
                        rarityBonus = eliteDef.dropRarityBonus || 0;
                        if (elite.entity.eliteType === 'overlord' && RAND(100) < 50) {
                            dropLevel += 5;
                        }
                    }
                }
                if (Math.random() < dropChance) {
                    const slotTypes = ['head', 'body', 'legs', 'hands', 'neck', 'ring', 'weapon'];
                    const slot = slotTypes[RAND(slotTypes.length)];
                    let rarity = GearSystem._rollRarity ? GearSystem._rollRarity() : 1;
                    rarity = Math.min(maxRarity, rarity + rarityBonus);
                    drop = GearSystem.generateGear(slot, dropLevel, rarity);
                    const lucky = aliveLeft[RAND(aliveLeft.length)];
                    const r = GearSystem.equipItem(lucky.entity, drop);
                    if (r.success) combatLog.push(`🎁 ${lucky.name}获得了${r.msg}`);
                }
            }
        } else if (defeated) {
            combatLog.push(`【败北】${leftUnits.map(u => u.name).join(',')}被全灭了...`);
        } else if (draw) {
            combatLog.push(`【平手】从战斗中撤退了`);
        } else {
            combatLog.push(`【撤退】从战斗中撤退了`);
        }

        return { victory, defeated, escaped: !victory && !defeated && !draw, rounds, combatLog, leftTeam: leftUnits, rightTeam: rightUnits, drop, betrayed, monster: rightUnits[0] ? rightUnits[0].entity : null };
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
        // === 声望影响等级 ===
        const fame = this.flag[503] || 0;
        let power = Math.floor(5 + this.day * cfg.powerScale + fame * 0.15);
        power += RAND_RANGE(-2, 3); // 等级浮动
        if (power < 5) power = 5;
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
        hero.cflag[9] = power;
        hero.cflag[11] = 20 + power * 5;  // 攻击
        hero.cflag[12] = 15 + power * 4;  // 防御
        hero.cflag[13] = 10 + power * 3;  // 敏捷(速度)
        // 勇者初始金币（新平衡）
        hero.gold = Math.floor(power * power + RAND(power * 10));

        // === 勇者职业分配 ===
        if (typeof HERO_CLASS_POOL !== 'undefined') {
            const classId = HERO_CLASS_POOL[RAND(HERO_CLASS_POOL.length)];
            const cls = HERO_CLASS_DEFS[classId];
            if (cls) {
                hero.cflag[950] = classId; // 存储职业ID
                hero.talent[cls.talentId] = 1;
                // 应用职业属性修正
                const s = cls.baseStats;
                hero.base[0] = Math.floor(hero.base[0] * s.hp);
                hero.maxbase[0] = hero.base[0];
                hero.hp = hero.base[0];
                hero.base[1] = Math.floor(hero.base[1] * s.mp);
                hero.maxbase[1] = hero.base[1];
                hero.mp = hero.base[1];
                hero.cflag[11] = Math.floor(hero.cflag[11] * s.atk);
                hero.cflag[12] = Math.floor(hero.cflag[12] * s.def);
                hero.cflag[13] = Math.floor(hero.cflag[13] * s.spd);
            }
        }
        if (!isFemale) {
            hero.talent[122] = 1; // 男性
            hero.talent[1] = 1;   // 童贞
        }
        // 随机勇者性格
        const personalities = [10, 11, 12, 13, 14, 15, 16, 17, 18];
        hero.talent[personalities[RAND(personalities.length)]] = 1;

        // === 勇者基础素质随机分配 (参考原游戏CHARA_MAKE) ===
        if (typeof CharaTemplates !== 'undefined') {
            // personality2
            if (RAND(4) === 0) hero.talent[CharaTemplates.PERSONALITY2_POOL[RAND(CharaTemplates.PERSONALITY2_POOL.length)]] = 1;
            // 兴趣
            if (RAND(2) === 0) hero.talent[CharaTemplates.INTEREST_POOL[RAND(CharaTemplates.INTEREST_POOL.length)]] = 1;
            // 处女心
            for (const g of CharaTemplates.MAIDEN_POOL) if (RAND(3) === 0) hero.talent[g[RAND(g.length)]] = 1;
            // 体质
            for (const g of CharaTemplates.BODY_POOL) if (RAND(3) === 0) hero.talent[g[RAND(g.length)]] = 1;
            if (RAND(12) === 0) hero.talent[48] = 1;
            // 技术
            for (const g of CharaTemplates.TECH_POOL) if (RAND(4) === 0) hero.talent[g[RAND(g.length)]] = 1;
            if (RAND(50) === 0) hero.talent[57] = 1;
            // 忠诚
            for (const g of CharaTemplates.DEVOTION_POOL) if (RAND(4) === 0) hero.talent[g[RAND(g.length)]] = 1;
            // 诚实/性癖
            for (const g of CharaTemplates.HONESTY_POOL) if (RAND(6) === 0) hero.talent[g[RAND(g.length)]] = 1;
            // 体型
            if (RAND(6) === 0) hero.talent[CharaTemplates.PHYSIQUE_POOL[RAND(CharaTemplates.PHYSIQUE_POOL.length)]] = 1;
            for (const p of CharaTemplates.SENSE_POOLS) if (RAND(6) === 0) hero.talent[p[RAND(p.length)]] = 1;
            // 胸部 (女性/扶她)
            if (!hero.talent[122]) {
                hero.talent[CharaTemplates.BREAST_POOL[RAND(CharaTemplates.BREAST_POOL.length)]] = 1;
            }
            if (RAND(12) === 0) hero.talent[111 + RAND(3)] = 1;
            // 魅力
            if (RAND(20) === 0) hero.talent[91] = 1;
            if (RAND(20) === 0) hero.talent[92] = 1;
            if (RAND(20) === 0) hero.talent[93] = 1;
            // 特殊
            if (RAND(25) === 0) hero.talent[CharaTemplates.FAMILY_POOL[RAND(CharaTemplates.FAMILY_POOL.length)]] = 1;
            if (RAND(30) === 0) hero.talent[152] = 1;
            if (hero.talent[37] && RAND(4) === 0) hero.talent[290] = 1;
            else if (RAND(12) === 0) hero.talent[290] = 1;
            if (RAND(20) === 0) hero.talent[79] = 1;
            // 扶她 (极低概率)
            if (RAND(60) === 0) {
                hero.talent[121] = 1;
                hero.talent[1] = 1; // 扶她也算有阴茎，有童贞
            }
            // 元素能力 (极低概率)
            if (RAND(20) === 0) {
                const elements = [275, 276, 277, 278, 279];
                hero.talent[elements[RAND(elements.length)]] = 1;
            }
        }
        // === 勇者攻略目标 ===
        const goalIds = Object.keys(HERO_GOAL_DEFS);
        const goalId = goalIds[RAND(goalIds.length)];
        hero.cflag[951] = goalId; // 存储目标ID
        // === 勇者冒险口号 ===
        const mottoPool = HERO_MOTTO_POOLS[goalId] || HERO_MOTTO_POOLS.defeat_master;
        hero.cstr[0] = mottoPool[RAND(mottoPool.length)];

        // === 统一外观与背景生成 ===
        if (typeof CharaTemplates !== 'undefined') {
            CharaTemplates.applyRandomAppearance(hero);
            CharaTemplates.applyRandomBackstory(hero);
            CharaTemplates.generateAppearanceDesc(hero);
            // 赋予勇者一个 JOB_TABLE 职业（用于信息显示）
            if (typeof CharaTemplates.JOB_TABLE !== 'undefined') {
                const job = CharaTemplates.JOB_TABLE[RAND(CharaTemplates.JOB_TABLE.length)];
                hero.talent[job.id] = 1;
            }
        }

        // === 生成初始任务 ===
        this.generateHeroTask(hero);

        // === 生成相性值 ===
        hero.affinity = this.generateAffinity(hero);

        // P1+: init personality & genital config
        if (typeof generatePersonality === 'function') {
            hero.personality = generatePersonality(hero);
        }
        const isMale = hero.talent[122];
        const isFuta = hero.talent[121];
        hero.genitalConfig = {
            hasVagina: !isMale || isFuta,
            hasWomb: (!isMale || isFuta) && !hero.talent[123],
            penises: isMale || isFuta ? [{ id: 0, name: "\u8089\u68d2", ejaculationGauge: 0, sensitivity: 1.0, linkedParts: ["V", "A", "O"] }] : [],
            orgasmSystem: "standard"
        };

        return hero;
    }

    // ========== 勋章系统 ==========

    getMedalCount(character) {
        return character ? (character.cflag[988] || 0) : 0;
    }

    getMedalBonus(character) {
        const count = this.getMedalCount(character);
        return 1 + count * 0.01; // 每枚勋章+1%
    }

    addMedal(character, amount = 1) {
        if (!character || amount <= 0) return;
        const oldCount = this.getMedalCount(character);
        const newCount = oldCount + amount;
        character.cflag[988] = newCount;
        // 勋章经验 = 数量 × 5
        character.cflag[989] = newCount * 5;
    }

    addBrainwashExp(character, amount = 1) {
        if (!character || amount <= 0) return;
        character.exp[81] = (character.exp[81] || 0) + amount;
    }

    // ========== 奴隶任务系统 ==========

    _clearSlaveTask(slave) {
        if (!slave) return;
        slave.cflag[985] = 0;
        slave.cflag[986] = 0;
        slave.cflag[987] = 0;
        slave.cflag[990] = 0;
        slave.cflag[991] = 0;
        slave.cflag[912] = 0; // 清除伪装标记
        slave.cstr[341] = '';
    }

    // 公共接口：清除奴隶任务（供UI调用）
    clearSlaveTask(slave) {
        this._clearSlaveTask(slave);
    }

    // ========== 相性系统 ==========

    // 生成角色的相性值 (0-100)，基于种族,职业,性格
    generateAffinity(entity) {
        const race = entity.talent[314] || 1;
        const jobClass = entity.cflag[950] || 200;
        const personality = entity.getPersonality() || 10;

        const raceVal = (typeof RACE_AFFINITY !== 'undefined' ? RACE_AFFINITY[race] : null) || 50;
        const jobVal = (typeof JOB_AFFINITY !== 'undefined' ? JOB_AFFINITY[jobClass] : null) || 50;
        const persVal = (typeof PERSONALITY_AFFINITY !== 'undefined' ? PERSONALITY_AFFINITY[personality] : null) || 50;

        // 加权平均 + 随机偏移(-5~+5)，让相同配置也有细微差异
        let value = Math.floor(raceVal * 0.35 + jobVal * 0.35 + persVal * 0.3 + RAND_RANGE(-5, 6));
        return Math.min(100, Math.max(0, value));
    }

    // 生成随机小队名
    _generateSquadName(leader) {
        const prefixes = ['烈焰', '冰霜', '雷霆', '暗影', '圣光', '风暴', '钢铁', '疾风', '破晓', '暮色', '星辰', '月光', '狂涛', '雷电', '黑铁', '银翼'];
        const suffixes = ['之牙', '之刃', '之心', '之翼', '小队', '旅团', '骑士团', '猎手', '先锋', '守卫', '突击者', '远征军'];
        const prefix = prefixes[RAND(prefixes.length)];
        const suffix = suffixes[RAND(suffixes.length)];
        return `${prefix}${suffix}`;
    }

    // 计算两人相性差 (0-100)
    _getAffinityDiff(a, b) {
        if (!a || !b) return 50;
        const av = a.affinity !== undefined ? a.affinity : 50;
        const bv = b.affinity !== undefined ? b.affinity : 50;
        return Math.abs(av - bv);
    }

    // 根据相性差获取初始关系等级
    _getAffinityRelationLevel(diff) {
        const defs = typeof AFFINITY_DIFF_RELATION !== 'undefined' ? AFFINITY_DIFF_RELATION : [
            { maxDiff: 10, level: 4 },
            { maxDiff: 25, level: 3 },
            { maxDiff: 45, level: 2 },
            { maxDiff: 65, level: 1 },
            { maxDiff: 100, level: 0 }
        ];
        for (const d of defs) {
            if (diff <= d.maxDiff) return d.level;
        }
        return 2; // 默认点头之交
    }

    // 获取关系键（按名字字母序）
    _getHeroRelationKey(a, b) {
        if (!a || !b) return '';
        return a.name < b.name ? `${a.name}|${b.name}` : `${b.name}|${a.name}`;
    }

    // 获取两人关系数据
    _getHeroRelation(a, b) {
        const key = this._getHeroRelationKey(a, b);
        if (!key) return { level: 2, history: [] };
        let rel = this._heroRelations[key];
        if (!rel) {
            // 根据相性差初始化关系
            const diff = this._getAffinityDiff(a, b);
            const initLevel = this._getAffinityRelationLevel(diff);
            rel = { level: initLevel, history: [] };
            this._heroRelations[key] = rel;
        }
        return rel;
    }

    // 修改两人关系 (delta: +1/-1 等)
    _setHeroRelation(a, b, delta, eventType) {
        const rel = this._getHeroRelation(a, b);
        const oldLevel = rel.level;
        rel.level = Math.max(0, Math.min(4, rel.level + delta));
        if (eventType) {
            const evtDef = typeof RELATION_EVENT_DEFS !== 'undefined' ? RELATION_EVENT_DEFS[eventType] : null;
            rel.history.push({
                day: this.day,
                event: evtDef ? evtDef.name : eventType,
                delta: delta,
                level: rel.level
            });
            // 限制历史记录长度
            if (rel.history.length > 20) rel.history.shift();
        }
        return { oldLevel, newLevel: rel.level, changed: oldLevel !== rel.level };
    }

    // 获取关系等级标签
    _getRelationLabel(level) {
        const defs = typeof AFFINITY_RELATION_DEFS !== 'undefined' ? AFFINITY_RELATION_DEFS : {};
        const def = defs[level];
        return def ? `${def.icon} ${def.name}` : '?';
    }

    // 辅助：提升角色等级并同步属性（用于奴隶/魔王任务中的升级）
    // 前勇者和勇者采用同一套属性计算体系
    _levelUpEntity(entity, levels = 1) {
        if (!entity || levels <= 0) return;
        const oldLevel = entity.level || 1;
        const newLevel = oldLevel + levels;
        entity.level = newLevel;
        entity.cflag[9] = newLevel;
        const power = newLevel;
        const oldMaxHp = entity.maxHp || 100;
        const oldMaxMp = entity.maxMp || 50;
        // HP/MP 按勇者公式重新计算
        entity.base[0] = 1000 + power * 200 + RAND(power * 100);
        entity.maxbase[0] = entity.base[0];
        entity.base[1] = 500 + power * 100;
        entity.maxbase[1] = entity.base[1];
        // HP/MP 按比例保留
        const hpRatio = oldMaxHp > 0 ? entity.hp / oldMaxHp : 1;
        const mpRatio = oldMaxMp > 0 ? entity.mp / oldMaxMp : 1;
        entity.hp = Math.min(entity.maxHp, Math.max(1, Math.floor(entity.maxHp * hpRatio)));
        entity.mp = Math.min(entity.maxMp, Math.max(0, Math.floor(entity.maxMp * mpRatio)));
        // 战斗属性
        const isMaster = this.getMaster() === entity;
        if (isMaster) {
            // 魔王：攻防在现有值基础上累加（每级+5攻+4防）
            entity.cflag[11] = (entity.cflag[11] || 100) + levels * 5;
            entity.cflag[12] = (entity.cflag[12] || 100) + levels * 4;
        } else {
            // 其他：按勇者公式重新计算
            entity.cflag[11] = 20 + power * 5;
            entity.cflag[12] = 15 + power * 4;
        }
        entity.cflag[13] = 10 + power * 3;  // 敏捷(速度)
    }

    // 判断角色是否可以分配任务（魔王或已陷落/上位状态）
    canAssignTask(entity) {
        if (!entity) return false;
        if (this.getMaster() === entity) return true; // 魔王
        if ((entity.mark[0] || 0) >= 3) return true; // 服从刻印Lv3
        // 爱慕系
        if (entity.talent[85]) return true; // 爱慕
        if (entity.talent[86]) return true; // 盲信（爱慕上位）
        if (entity.talent[182]) return true; // 挚爱（爱慕上位）
        // 淫乱系
        if (entity.talent[76]) return true; // 淫乱
        if (entity.talent[272]) return true; // 淫魔（淫乱上位）
        return false;
    }

    // 分配奴隶任务（供UI调用）
    assignSlaveTask(slave, taskType, floor) {
        if (!this.canAssignTask(slave)) {
            return { success: false, msg: '该角色无法执行任务（需陷落或魔王）' };
        }
        const isMaster = this.getMaster() === slave;
        // 魔王只能执行讨伐任务（任务类型1）
        if (isMaster && taskType !== 1) {
            return { success: false, msg: '魔王只能执行出击讨伐任务' };
        }
        if ((slave.cflag[985] || 0) !== 0) {
            return { success: false, msg: '该角色已有任务进行中' };
        }
        const def = SLAVE_TASK_DEFS[taskType];
        if (!def) {
            return { success: false, msg: '无效的任务类型' };
        }

        slave.cflag[985] = taskType;
        slave.cflag[986] = taskType === 3 ? 0 : (floor || 10);
        slave.cflag[987] = taskType === 3 ? 0 : (floor || 10);
        slave.cflag[990] = 100;
        slave.cflag[991] = -1;
        slave.cstr[341] = `${def.icon} ${def.name}`;

        if (taskType === 3) {
            return { success: true, msg: `${slave.name}开始执行"${def.icon} ${def.name}"` };
        } else {
            return { success: true, msg: `${slave.name}从第${floor}层出发执行"${def.icon} ${def.name}"` };
        }
    }

    // 处理奴隶每日任务（返回事件结果供UI显示）
    processSlaveTaskDaily(slave) {
        const taskType = slave.cflag[985] || 0;
        if (taskType === 0) return null;
        if (taskType === 1) return this._processSlaveHuntHero(slave);
        if (taskType === 2) return this._processSlaveLurk(slave);
        if (taskType === 3) return this._processSlaveTownRaid(slave);
        return null;
    }

    // 奴隶任务1：讨伐勇者（反向移动，途中俘虏勇者）
    _processSlaveHuntHero(slave) {
        const startFloor = slave.cflag[986] || 10;
        let currentFloor = slave.cflag[987] || startFloor;
        let currentProgress = slave.cflag[990] || 100;
        const oldProgress = currentProgress;
        const moveSpeed = 20; // 固定每天20%
        currentProgress -= moveSpeed;

        const logs = [];
        let medalGained = false;

        // 每走过50%路程都有5%几率等级直接+1
        const milestones = [50];
        for (const m of milestones) {
            if (oldProgress > m && currentProgress <= m && RAND(100) < 5) {
                this._levelUpEntity(slave, 1);
                logs.push(`⭐ ${slave.name}在地下城中有所领悟，等级升至${slave.level}！`);
            }
        }

        // 检查同楼层是否有勇者（40%发现率）
        let combatData = null;
        const heroesOnFloor = this.invaders.filter(h => this.getHeroFloor(h) === currentFloor && h.hp > 0);
        if (heroesOnFloor.length > 0 && RAND(100) < 40) {
            const target = heroesOnFloor[RAND(heroesOnFloor.length)];
            logs.push(`👁️ ${slave.name}在第${currentFloor}层发现了${target.name}！`);
            const combat = this._doTeamCombat([slave], [target]);
            combatData = {
                type: 'team',
                hero: slave,
                heroName: slave.name,
                monster: target,
                leftTeam: combat.leftTeam,
                rightTeam: combat.rightTeam,
                combatLog: combat.combatLog,
                victory: combat.victory,
                defeated: combat.defeated,
                escaped: combat.escaped,
                rounds: combat.rounds
            };
            if (combat.victory) {
                logs.push(`⚔️ ${slave.name}击败了${target.name}！`);
                slave.fame += 5; // 击败勇者 +5 声望
                // 俘虏勇者（主动出击，跳过逃跑判定）
                const captureResult = this._processCapture(target, { name: '奴隶伏击者', hp: 100, atk: 20, def: 10, spd: 10 }, true);
                if (captureResult.type === 'surrender' || captureResult.type === 'imprisoned') {
                    logs.push(`⛓️ ${target.name}被俘虏！`);
                    slave.fame += 10; // 俘虏勇者 +10 声望
                    this.addBrainwashExp(slave, 1);
                    medalGained = true;
                    // 50%概率返回汇报，50%继续执行任务
                    if (RAND(100) < 50) {
                        this._clearSlaveTask(slave);
                        return {
                            type: 'hunt',
                            name: slave.name,
                            text: `${slave.name}在第${currentFloor}层俘虏了${target.name}后返回魔王处汇报工作。\n${logs.join('\n')}`,
                            medalGained: true,
                            combatData: combatData
                        };
                    }
                }
            } else if (combat.defeated) {
                // 被勇者击败：传送回魔王宫，触发惩罚事件，等级+5
                this._levelUpEntity(slave, 5);
                slave.hp = slave.maxHp;
                logs.push(`💔 ${slave.name}被${target.name}击败，被传送回魔王宫。`);
                logs.push(`😈 魔王对${slave.name}进行了惩罚强化，等级+5！（当前Lv.${slave.level}）`);
                this._clearSlaveTask(slave);
                return {
                    type: 'hunt',
                    name: slave.name,
                    text: `${slave.name}的任务以失败告终，但被魔王强化。\n${logs.join('\n')}`,
                    combatData: combatData
                };
            } else {
                logs.push(`🛡️ ${slave.name}与${target.name}交战未分胜负。`);
            }
        }

        // 更新位置
        if (currentProgress <= 0) {
            if (currentFloor <= 1) {
                this._clearSlaveTask(slave);
                return {
                    type: 'hunt',
                    name: slave.name,
                    text: `${slave.name}成功从第${startFloor}层返回到第一层入口，完成讨伐任务！\n${logs.join('\n')}`
                };
            } else {
                slave.cflag[987] = currentFloor - 1;
                slave.cflag[990] = 100;
                logs.push(`📍 抵达第${currentFloor - 1}层入口`);
            }
        } else {
            slave.cflag[987] = currentFloor;
            slave.cflag[990] = currentProgress;
        }

        return {
            type: 'hunt',
            name: slave.name,
            text: `${slave.name}正在第${currentFloor}层反向移动（进度${currentProgress}%）。\n${logs.join('\n')}`,
            combatData: combatData
        };
    }

    // 奴隶任务2：潜伏（消耗勇者MP使其屈服）
    _processSlaveLurk(slave) {
        slave.cflag[912] = 1; // 潜伏任务中标记为伪装者
        const startFloor = slave.cflag[986] || 10;
        let currentFloor = slave.cflag[987] || startFloor;
        let currentProgress = slave.cflag[990] || 100;
        const oldProgress = currentProgress;
        const moveSpeed = 20; // 固定每天20%
        currentProgress -= moveSpeed;

        const logs = [];

        // 每走过50%路程都有5%几率等级直接+1
        const milestones = [50];
        for (const m of milestones) {
            if (oldProgress > m && currentProgress <= m && RAND(100) < 5) {
                slave.level += 1;
                logs.push(`⭐ ${slave.name}在地下城中有所领悟，等级升至${slave.level}！`);
                if (typeof CharaTemplates !== 'undefined') {
                    CharaTemplates.recalcStats(slave);
                }
            }
        }

        // 检查是否正在潜伏某个勇者
        let lurkTargetIndex = slave.cflag[991] || -1;
        let lurkTarget = null;
        if (lurkTargetIndex >= 0 && lurkTargetIndex < this.invaders.length) {
            lurkTarget = this.invaders[lurkTargetIndex];
            if (!lurkTarget || lurkTarget.hp <= 0 || this.getHeroFloor(lurkTarget) !== currentFloor) {
                lurkTarget = null;
                slave.cflag[991] = -1;
            }
        }

        // 寻找新的潜伏目标
        if (!lurkTarget) {
            const heroesOnFloor = this.invaders.filter(h => this.getHeroFloor(h) === currentFloor && h.hp > 0);
            if (heroesOnFloor.length > 0 && RAND(100) < 50) {
                lurkTarget = heroesOnFloor[RAND(heroesOnFloor.length)];
                lurkTargetIndex = this.invaders.indexOf(lurkTarget);
                slave.cflag[991] = lurkTargetIndex;
                logs.push(`🎭 ${slave.name}伪装成同伴接近了${lurkTarget.name}！`);
            }
        }

        // 执行潜伏效果
        if (lurkTarget) {
            // === 每日伪装识破判定 ===
            let exposeChance = 10; // 基础识破率10%
            // 等级差修正：目标比奴隶等级高越多，越容易识破
            const lvDiff = (lurkTarget.level || 1) - (slave.level || 1);
            exposeChance += lvDiff * 3;
            // MP修正：目标MP低时精神不集中，反而更容易察觉异常
            const mpRatio = lurkTarget.maxMp > 0 ? lurkTarget.mp / lurkTarget.maxMp : 1;
            if (mpRatio < 0.3) exposeChance += 10;
            // 性格修正
            if (lurkTarget.talent[13]) exposeChance += 5;   // 坦率（容易发现破绽）
            if (lurkTarget.talent[164]) exposeChance += 5;  // 冷静（善于观察）
            if (lurkTarget.talent[17]) exposeChance += 3;   // 老实（直觉敏锐）
            if (lurkTarget.talent[175]) exposeChance += 5;  // 伶俐（聪明机警）
            // 限制范围：最低5%，最高30%
            exposeChance = Math.max(5, Math.min(30, exposeChance));

            if (RAND(100) < exposeChance) {
                // 伪装被识破！
                logs.push(`⚠️ ${slave.name}的伪装被${lurkTarget.name}识破了！（识破率${exposeChance}%）`);
                slave.cflag[991] = -1;
                // 勇者会攻击暴露的奴隶，触发战斗
                const combat = this._doTeamCombat([slave], [lurkTarget]);
                const combatData = {
                    type: 'team',
                    hero: slave,
                    heroName: slave.name,
                    monster: lurkTarget,
                    leftTeam: combat.leftTeam,
                    rightTeam: combat.rightTeam,
                    combatLog: combat.combatLog,
                    victory: combat.victory,
                    defeated: combat.defeated,
                    escaped: combat.escaped,
                    rounds: combat.rounds
                };
                if (combat.victory) {
                    logs.push(`⚔️ ${slave.name}在被识破后反而击败了${lurkTarget.name}！`);
                    slave.fame += 5; // 击败勇者 +5 声望
                    const captureResult = this._processCapture(lurkTarget, { name: '潜伏者', hp: 100, atk: 10, def: 5, spd: 10 }, true);
                    if (captureResult.type === 'surrender' || captureResult.type === 'imprisoned') {
                        logs.push(`⛓️ ${lurkTarget.name}被俘虏！`);
                        slave.fame += 10; // 俘虏勇者 +10 声望
                        this.addBrainwashExp(slave, 1);
                    }
                } else if (combat.defeated) {
                    // 奴隶被击败：传送回魔王宫，等级+5惩罚
                    this._levelUpEntity(slave, 5);
                    slave.hp = slave.maxHp;
                    logs.push(`💔 ${slave.name}被${lurkTarget.name}击败，被传送回魔王宫。`);
                    logs.push(`😈 魔王对${slave.name}进行了惩罚强化，等级+5！（当前Lv.${slave.level}）`);
                } else {
                    logs.push(`🛡️ 双方战斗未分胜负，${slave.name}趁乱撤退了。`);
                }
                this._clearSlaveTask(slave);
                return {
                    type: 'lurk',
                    name: slave.name,
                    text: `${slave.name}的伪装被识破了！\n${logs.join('\n')}`,
                    combatData: combatData
                };
            }

            // 伪装未被识破，继续潜伏效果
            const mpDrain = Math.floor(lurkTarget.maxMp * 0.25);
            lurkTarget.mp = Math.max(0, lurkTarget.mp - mpDrain);
            logs.push(`💤 ${lurkTarget.name}的气力被消耗了${mpDrain}点（剩余${lurkTarget.mp}/${lurkTarget.maxMp}）`);

            if (lurkTarget.mp <= 0) {
                // 判定屈服
                const yieldChance = 50 + (this.getMedalCount(slave) * 5);
                if (RAND(100) < yieldChance) {
                    lurkTarget.mark[0] = (lurkTarget.mark[0] || 0) + 1;
                    logs.push(`😵 ${lurkTarget.name}的屈服度上升了！（当前Lv.${lurkTarget.mark[0]}）`);
                    if (lurkTarget.mark[0] >= 3) {
                        logs.push(`🏳️ ${lurkTarget.name}完全屈服，向魔王投降！`);
                        // 俘虏勇者（主动出击，跳过逃跑判定）
                        const captureResult = this._processCapture(lurkTarget, { name: '潜伏者', hp: 100, atk: 10, def: 5, spd: 10 }, true);
                        if (captureResult.type !== 'escape') {
                            slave.fame += 10; // 俘虏勇者 +10 声望
                            this.addBrainwashExp(slave, 1);
                        }
                        slave.cflag[991] = -1;
                        // 50%概率返回
                        if (RAND(100) < 50) {
                            this._clearSlaveTask(slave);
                            return {
                                type: 'lurk',
                                name: slave.name,
                                text: `${slave.name}成功劝诱${lurkTarget.name}投降！\n${logs.join('\n')}`,
                                medalGained: true
                            };
                        }
                    }
                } else {
                    logs.push(`❌ ${lurkTarget.name}顽强抵抗，没有屈服...`);
                }
                // 重置MP以便下次判定
                lurkTarget.mp = Math.floor(lurkTarget.maxMp * 0.1);
            }
        }

        // 更新位置
        if (currentProgress <= 0) {
            if (currentFloor <= 1) {
                this._clearSlaveTask(slave);
                return {
                    type: 'lurk',
                    name: slave.name,
                    text: `${slave.name}成功返回到第一层入口，完成潜伏任务！\n${logs.join('\n')}`
                };
            } else {
                slave.cflag[987] = currentFloor - 1;
                slave.cflag[990] = 100;
                if (lurkTarget) logs.push(`📍 ${slave.name}跟随${lurkTarget.name}来到了第${currentFloor - 1}层`);
                else logs.push(`📍 抵达第${currentFloor - 1}层入口`);
            }
        } else {
            slave.cflag[987] = currentFloor;
            slave.cflag[990] = currentProgress;
        }

        return {
            type: 'lurk',
            name: slave.name,
            text: `${slave.name}正在第${currentFloor}层潜伏（进度${currentProgress}%）。\n${logs.join('\n')}`
        };
    }

    // 奴隶任务3：袭击城镇
    _processSlaveTownRaid(slave) {
        const logs = [];
        // 随机选择一个勇者作为对手
        const targets = this.invaders.filter(h => h.hp > 0);
        if (targets.length === 0) {
            this._clearSlaveTask(slave);
            return {
                type: 'raid',
                name: slave.name,
                text: `${slave.name}袭击了城镇，但没有遇到勇者。\n任务结束。`
            };
        }
        const target = targets[RAND(targets.length)];
        logs.push(`🔥 ${slave.name}带领怪物袭击了城镇！`);
        logs.push(`⚔️ 与${target.name}发生战斗！`);

        const combat = this._doTeamCombat([slave], [target]);
        const combatData = {
            type: 'team',
            hero: slave,
            heroName: slave.name,
            monster: target,
            leftTeam: combat.leftTeam,
            rightTeam: combat.rightTeam,
            combatLog: combat.combatLog,
            victory: combat.victory,
            defeated: combat.defeated,
            escaped: combat.escaped,
            rounds: combat.rounds
        };
        if (combat.victory) {
            logs.push(`✅ ${slave.name}战胜了${target.name}！`);
            slave.fame += 5; // 击败勇者 +5 声望
            // 50%概率抓捕（主动出击，跳过逃跑判定）
            if (RAND(100) < 50) {
                const captureResult = this._processCapture(target, { name: '袭击者', hp: 100, atk: 20, def: 10, spd: 10 }, true);
                if (captureResult.type !== 'escape') {
                    logs.push(`⛓️ ${target.name}被抓捕！`);
                    slave.fame += 10; // 俘虏勇者 +10 声望
                    this.addBrainwashExp(slave, 1);
                }
            }
            // 100%获得随机女性
            if (typeof CharaTemplates !== 'undefined') {
                const newSlave = CharaTemplates.createRandomSlave(1, Math.max(5, slave.level));
                newSlave.cflag[1] = 1;
                this.addCharaFromTemplate(newSlave);
                logs.push(`👩 获得了新的奴隶：${newSlave.name} Lv.${newSlave.level}`);
            }
            // 金币奖励
            const goldReward = slave.level * 200 + RAND(500);
            this.money += goldReward;
            logs.push(`💰 获得${goldReward}G`);
            // 声望
            this.addFame(10);
            slave.fame += 10; // 袭击城镇 +10 个人声望
            logs.push(`🏆 魔王声望+10，${slave.name}个人声望+10`);
        } else if (combat.defeated) {
            // 被勇者击败：传送回魔王宫，触发惩罚事件，等级+5
            slave.level += 5;
            if (typeof CharaTemplates !== 'undefined') {
                CharaTemplates.recalcStats(slave);
            }
            slave.hp = slave.maxHp;
            logs.push(`💔 ${slave.name}被${target.name}击败，被传送回魔王宫。`);
            logs.push(`😈 魔王对${slave.name}进行了惩罚强化，等级+5！（当前Lv.${slave.level}）`);
        } else {
            logs.push(`🛡️ 战斗未分胜负。`);
        }

        this._clearSlaveTask(slave);
        return {
            type: 'raid',
            name: slave.name,
            text: `${slave.name}的城镇袭击结束了。\n${logs.join('\n')}`,
            combatData: combatData
        };
    }

    // ========== 勇者任务系统 ==========

    // 为勇者生成任务（自动刷新）
    generateHeroTask(hero) {
        if (!hero) return;
        // 如果已有未完成任务，不覆盖
        if ((hero.cflag[980] || 0) !== 0 && (hero.cflag[984] || 0) === 0) return;

        const maxReachableFloor = Math.min(Math.ceil(hero.level / 5), 10);
        const roll = RAND(100);

        if (roll < 60) {
            // 60% 讨伐地下城
            const targetFloor = Math.min(Math.ceil(hero.level / 10) + 1 + RAND(2), 10);
            hero.cflag[980] = 1; // 讨伐地下城
            hero.cflag[981] = targetFloor;
            hero.cflag[982] = 0;
            hero.cflag[983] = 0;
            hero.cflag[984] = 0;
            const floorDef = DUNGEON_FLOOR_DEFS[targetFloor];
            hero.cstr[340] = `前往第${targetFloor}层${floorDef ? '"' + floorDef.name + '"' : ''}，击败关底Boss`;
        } else {
            // 40% 完成委托
            const comIds = Object.keys(COMMISSION_DEFS);
            let comId = parseInt(comIds[RAND(comIds.length)]);
            let comDef = COMMISSION_DEFS[comId];
            // 确保委托目标可达：委托楼层不超过勇者可达楼层
            let comFloor = Math.max(1, Math.min(maxReachableFloor, 1 + RAND(maxReachableFloor)));
            let targetName = '';
            if (comDef.type === 'find_hero') {
                // 寻找某个勇者（从当前入侵者中随机选）
                if (this.invaders.length > 1) {
                    const others = this.invaders.filter(h => h !== hero);
                    targetName = others[RAND(others.length)].name;
                } else {
                    targetName = "某位失踪的同伴";
                }
            } else if (comDef.type === 'find_item') {
                const items = window.COMMISSION_ITEM_NAMES || ["古代遗物"];
                targetName = items[RAND(items.length)];
            } else if (comDef.type === 'defeat_elite') {
                const monsters = FLOOR_MONSTER_DEFS[comFloor];
                targetName = monsters ? monsters[RAND(monsters.length)].name : "精英怪物";
            }
            hero.cflag[980] = 2; // 完成委托
            hero.cflag[981] = comFloor;
            hero.cflag[982] = comId;
            hero.cflag[983] = 0;
            hero.cflag[984] = 0;
            let desc = comDef.description
                .replace('{floor}', `${comFloor}层`)
                .replace('{target}', targetName)
                .replace('{heroName}', targetName)
                .replace('{itemName}', targetName)
                .replace('{monsterName}', targetName);
            hero.cstr[340] = `${comDef.icon || '📜'} ${comDef.name}：${desc}（报酬：${comDef.rewardGold}G + 声望+${comDef.rewardFame}）`;
        }
    }

    // 清除勇者任务
    clearHeroTask(hero) {
        if (!hero) return;
        hero.cflag[980] = 0;
        hero.cflag[981] = 0;
        hero.cflag[982] = 0;
        hero.cflag[983] = 0;
        hero.cflag[984] = 0;
        hero.cstr[340] = '';
    }


    // ========== 异常状态系统 ==========

    _hasStatusAilment(hero, type) {
        if (!hero || !STATUS_AILMENT_DEFS[type]) return false;
        const mask = hero.cflag[920] || 0;
        return (mask & STATUS_AILMENT_DEFS[type].bit) !== 0;
    }

    _addStatusAilment(hero, type, turns) {
        if (!hero || !STATUS_AILMENT_DEFS[type]) return;
        const def = STATUS_AILMENT_DEFS[type];
        hero.cflag[920] = (hero.cflag[920] || 0) | def.bit;
        const turnKey = STATUS_AILMENT_TURN_CFIDS[type];
        hero.cflag[turnKey] = Math.max(hero.cflag[turnKey] || 0, turns);
    }

    _removeStatusAilment(hero, type) {
        if (!hero || !STATUS_AILMENT_DEFS[type]) return;
        const def = STATUS_AILMENT_DEFS[type];
        hero.cflag[920] = (hero.cflag[920] || 0) & ~def.bit;
        const turnKey = STATUS_AILMENT_TURN_CFIDS[type];
        hero.cflag[turnKey] = 0;
    }

    _clearAllStatusAilments(hero) {
        if (!hero) return;
        hero.cflag[920] = 0;
        for (let i = 921; i <= 930; i++) hero.cflag[i] = 0;
    }

    _getStatusAilmentText(hero) {
        if (!hero) return "";
        const mask = hero.cflag[920] || 0;
        if (mask === 0) return "";
        const names = [];
        for (const key in STATUS_AILMENT_DEFS) {
            if ((mask & STATUS_AILMENT_DEFS[key].bit) !== 0) {
                const turns = hero.cflag[STATUS_AILMENT_TURN_CFIDS[key]] || 0;
                names.push(`${STATUS_AILMENT_DEFS[key].name}(${turns}T)`);
            }
        }
        return names.join(",");
    }

    _applyStatusAilmentEffects(hero) {
        if (!hero) return { atkMod: 0, defMod: 0, spdMod: 0, dotHp: 0, dotMp: 0, actionBlock: 0, friendlyFire: 0 };
        const mask = hero.cflag[920] || 0;
        let atkMod = 0, defMod = 0, spdMod = 0, dotHp = 0, dotMp = 0, actionBlock = 0, friendlyFire = 0;
        for (const key in STATUS_AILMENT_DEFS) {
            const def = STATUS_AILMENT_DEFS[key];
            if ((mask & def.bit) !== 0) {
                atkMod += def.effect.atkMod || 0;
                defMod += def.effect.defMod || 0;
                spdMod += def.effect.spdMod || 0;
                if (def.dot.type === "hp_percent") dotHp += Math.floor(hero.maxHp * def.dot.value);
                if (def.dot.type === "mp_percent") dotMp += Math.floor(hero.maxMp * def.dot.value);
                actionBlock = Math.max(actionBlock, def.actionBlock || 0);
                friendlyFire = Math.max(friendlyFire, def.friendlyFire || 0);
            }
        }
        return { atkMod, defMod, spdMod, dotHp, dotMp, actionBlock, friendlyFire };
    }

    _processStatusAilmentTurn(hero) {
        if (!hero) return [];
        const mask = hero.cflag[920] || 0;
        if (mask === 0) return [];
        const logs = [];
        for (const key in STATUS_AILMENT_DEFS) {
            const def = STATUS_AILMENT_DEFS[key];
            if ((mask & def.bit) !== 0) {
                const turnKey = STATUS_AILMENT_TURN_CFIDS[key];
                hero.cflag[turnKey] = (hero.cflag[turnKey] || 1) - 1;
                if (def.dot.type === "hp_percent") {
                    const dmg = Math.floor(hero.maxHp * def.dot.value);
                    hero.hp = Math.max(1, hero.hp - dmg);
                    logs.push(`${hero.name}因【${def.name}】损失${dmg}HP`);
                }
                if (def.dot.type === "mp_percent") {
                    const dmg = Math.floor(hero.maxMp * def.dot.value);
                    hero.mp = Math.max(0, hero.mp - dmg);
                    logs.push(`${hero.name}因【${def.name}】损失${dmg}MP`);
                }
                if (hero.cflag[turnKey] <= 0) {
                    hero.cflag[920] = (hero.cflag[920] || 0) & ~def.bit;
                    hero.cflag[turnKey] = 0;
                    logs.push(`${hero.name}的【${def.name}】解除了`);
                }
            }
        }
        return logs;
    }

    _tryCureStatusAilment(hero, method) {
        if (!hero) return [];
        const mask = hero.cflag[920] || 0;
        if (mask === 0) return [];
        const logs = [];
        for (const key in STATUS_AILMENT_DEFS) {
            const def = STATUS_AILMENT_DEFS[key];
            if ((mask & def.bit) === 0) continue;
            if (!def.cureMethods.includes(method)) continue;
            const chance = def.cureChance[method] || 0;
            if (RAND(100) < chance * 100) {
                this._removeStatusAilment(hero, key);
                logs.push(`${hero.name}的【${def.name}】被解除了`);
            }
        }
        return logs;
    }

    _applyRandomAilmentFromMonster(hero, monster) {
        if (!hero || !monster) return;
        const aiType = this._getMonsterAIType(monster);
        const possible = [];
        if (aiType === "magic") possible.push("curse", "paralysis");
        if (aiType === "attack") possible.push("weak", "bleed");
        if (monster.name && monster.name.includes("火")) possible.push("burn");
        if (monster.name && monster.name.includes("毒")) possible.push("poison");
        if (possible.length === 0) return;
        const type = possible[RAND(possible.length)];
        if (STATUS_AILMENT_DEFS[type]) {
            this._addStatusAilment(hero, type, 3 + RAND(3));
        }
    }

    // ========== 安营扎寨系统 ==========

    _shouldCamp(hero) {
        if (!hero) return false;
        const hpPct = hero.maxHp > 0 ? hero.hp / hero.maxHp : 1;
        // HP<50% 或有异常状态时考虑安营
        if (hpPct >= 0.5 && (hero.cflag[920] || 0) === 0) return false;
        // 根据性格判断
        let chance = 30; // 基础概率30%
        if (hpPct < 0.3) chance += 40;
        else if (hpPct < 0.5) chance += 20;
        const hasAilment = (hero.cflag[920] || 0) !== 0;
        if (hasAilment) chance += 15;
        // 性格修正
        if (hero.talent[12]) chance += 10; // 刚强：更不愿退缩
        if (hero.talent[13]) chance -= 5;  // 坦率：按部就班
        if (hero.talent[14]) chance -= 10; // 傲慢：不愿示弱
        if (hero.talent[16]) chance += 10; // 低姿态：更谨慎
        if (hero.talent[164]) chance += 15; // 冷静：理性判断
        if (hero.talent[165]) chance -= 10; // 叛逆：更激进
        if (hero.talent[170]) chance += 5;  // 孤独者：独自休息
        chance = Math.max(5, Math.min(90, chance));
        return RAND(100) < chance;
    }

    _doCamp(hero, moveSpeed) {
        if (!hero) return null;
        hero.cflag[911] = 0; // 安营扎寨后解除低调状态
        const hpPct = hero.maxHp > 0 ? hero.hp / hero.maxHp : 1;
        const hasAilment = (hero.cflag[920] || 0) !== 0;
        // 恢复HP：侵略度转化为HP恢复
        const healPct = Math.max(moveSpeed, 5) / 100;
        const healAmt = Math.floor(hero.maxHp * healPct);
        hero.hp = Math.min(hero.maxHp, hero.hp + healAmt);
        // 恢复少量MP
        const mpHeal = Math.floor(hero.maxMp * 0.03);
        hero.mp = Math.min(hero.maxMp, hero.mp + mpHeal);
        // 尝试解除非诅咒异常状态
        const cureLogs = this._tryCureStatusAilment(hero, "camp_rest");
        const logs = [`🏕️ ${hero.name}选择安营扎寨休息`, `HP恢复${healAmt}，MP恢复${mpHeal}`];
        if (cureLogs.length > 0) logs.push(...cureLogs);
        return {
            action: 'camp',
            hero,
            moveSpeed: 0,
            logs,
            healedHp: healAmt,
            healedMp: mpHeal
        };
    }

    // ========== 勇者职业技能系统 ==========

    _getHeroClass(hero) {
        if (!hero) return null;
        const classId = hero.cflag[950];
        if (!classId || !HERO_CLASS_DEFS[classId]) return null;
        return HERO_CLASS_DEFS[classId];
    }

    _getSkillPower(hero, skill) {
        if (!hero || !skill) return 0;
        const lv = hero.level || 1;
        return Math.floor(skill.power + skill.scale * lv);
    }

    // 尝试使用技能（勇者内战用简化版）
    _tryUseHeroSkill(hero) {
        if (!hero) return null;
        const classId = hero.cflag[950] || 0;
        const cls = HERO_CLASS_DEFS ? HERO_CLASS_DEFS[classId] : null;
        if (!cls || !cls.skills || cls.skills.length === 0) return null;
        const lv = hero.level || 1;
        // 按优先级检查技能：专属 > 通用2 > 通用1
        const skillIds = [cls.skills[2], cls.skills[1], cls.skills[0]].filter(Boolean);
        for (const sid of skillIds) {
            const skillDef = HERO_SKILL_DEFS ? HERO_SKILL_DEFS[sid] : null;
            if (!skillDef) continue;
            const prob = Math.min(50, lv * 3); // 基础概率，每级+3%，最高50%
            if (skillDef.effectType === 'berserk' || skillDef.effectType === 'execute' || skillDef.effectType === 'assassinate') {
                // 专属技能概率更低
                if (RAND(100) >= Math.min(40, lv * 2)) continue;
            } else {
                if (RAND(100) >= prob) continue;
            }
            // 构建简化技能对象
            const result = {
                name: skillDef.name,
                effectType: skillDef.effectType,
                damage: 0,
                heal: 0,
                ailmentChance: 0
            };
            const power = this._getSkillPower(hero, skillDef);
            switch (skillDef.effectType) {
                case 'damage':
                case 'crit_damage':
                case 'pierce':
                case 'execute':
                case 'execute_pierce':
                case 'berserk':
                    result.damage = power;
                    break;
                case 'aoe':
                case 'big_bang':
                    result.damage = Math.floor(power * 0.8);
                    break;
                case 'heal':
                case 'mass_heal':
                    result.heal = Math.min(0.3, power / 100);
                    break;
                case 'dot':
                    result.ailmentChance = 0.4;
                    result.damage = Math.floor(power * 0.5);
                    break;
                case 'stun':
                    result.ailmentChance = 0.5;
                    break;
                case 'debuff_atk':
                case 'debuff_def':
                case 'debuff_spd':
                    result.ailmentChance = 0.35;
                    break;
            }
            return result;
        }
        return null;
    }

    _useHeroSkill(hero, skillId, target, context) {
        if (!hero || !skillId) return null;
        const skill = HERO_SKILL_DEFS[skillId];
        if (!skill) return null;
        const power = this._getSkillPower(hero, skill);
        const result = { used: true, skillName: skill.name, cost: skill.cost, logs: [] };

        switch (skill.effectType) {
            case "damage":
            case "crit_damage":
            case "pierce":
            case "execute":
            case "execute_pierce": {
                const baseAtk = (hero.cflag[11] || 20);
                let dmg = Math.max(1, baseAtk + power - (target.def || 0));
                if (skill.effectType === "crit_damage" && RAND(100) < 40) dmg = Math.floor(dmg * 1.8);
                if (skill.effectType === "pierce" || skill.effectType === "execute_pierce") dmg = Math.floor(dmg * 1.3);
                if (skill.effectType === "execute" || skill.effectType === "execute_pierce") {
                    const tHpPct = target.hp / Math.max(1, target.maxHp || target.hp);
                    if (tHpPct < 0.3) dmg = Math.floor(dmg * 2.0);
                }
                result.damage = dmg;
                result.log = `【技能】${hero.name}使用${skill.name}造成${dmg}伤害`;
                break;
            }
            case "multi_damage": {
                const baseAtk = (hero.cflag[11] || 20);
                const hits = skill.hits || 2;
                let totalDmg = 0;
                for (let i = 0; i < hits; i++) {
                    const dmg = Math.max(1, baseAtk + Math.floor(power / hits) - (target.def || 0));
                    totalDmg += dmg;
                }
                result.damage = totalDmg;
                result.log = `【技能】${hero.name}使用${skill.name}连续攻击${hits}次，共造成${totalDmg}伤害`;
                break;
            }
            case "aoe":
            case "big_bang": {
                const baseAtk = (hero.cflag[11] || 20);
                result.damage = Math.max(1, baseAtk + power);
                result.isAoE = true;
                result.log = `【技能】${hero.name}使用${skill.name}造成范围伤害`;
                break;
            }
            case "heal": {
                const heal = Math.floor(power + hero.level * 2);
                result.heal = heal;
                result.log = `【技能】${hero.name}使用${skill.name}恢复${heal}HP`;
                break;
            }
            case "mass_heal": {
                const heal = Math.floor(power + hero.level * 1.5);
                result.heal = heal;
                result.isMass = true;
                result.log = `【技能】${hero.name}使用${skill.name}恢复全体${heal}HP`;
                break;
            }
            case "buff_atk": {
                result.buff = { type: "atk", value: power, duration: skill.duration || 3 };
                result.log = `【技能】${hero.name}使用${skill.name}，攻击力提升${power}`;
                break;
            }
            case "buff_def": {
                result.buff = { type: "def", value: power, duration: skill.duration || 3 };
                result.log = `【技能】${hero.name}使用${skill.name}，防御力提升${power}`;
                break;
            }
            case "buff_spd": {
                result.buff = { type: "spd", value: power, duration: skill.duration || 2 };
                result.log = `【技能】${hero.name}使用${skill.name}，速度提升${power}`;
                break;
            }
            case "buff_all": {
                result.buff = { type: "all", value: power, duration: skill.duration || 3 };
                result.log = `【技能】${hero.name}使用${skill.name}，全属性提升${power}`;
                break;
            }
            case "debuff_atk":
            case "debuff_def":
            case "debuff_spd":
            case "debuff_all":
            case "seal": {
                const debuffType = skill.effectType.replace("debuff_", "");
                result.debuff = { type: debuffType, value: power, duration: skill.duration || 3 };
                result.log = `【技能】${hero.name}使用${skill.name}，降低敌人${debuffType}${power}`;
                break;
            }
            case "dot": {
                result.ailment = { type: "poison", turns: skill.duration || 3 };
                result.log = `【技能】${hero.name}使用${skill.name}，敌人中毒了`;
                break;
            }
            case "cleanse": {
                result.cleanse = true;
                result.log = `【技能】${hero.name}使用${skill.name}净化异常`;
                break;
            }
            case "invincible": {
                result.invincible = true;
                result.duration = skill.duration || 1;
                result.log = `【技能】${hero.name}使用${skill.name}，一回合内无敌`;
                break;
            }
            case "berserk": {
                result.berserk = true;
                result.buff = { type: "atk", value: power, duration: skill.duration || 3 };
                result.debuff = { type: "def", value: -Math.floor(power * 0.5), duration: skill.duration || 3 };
                result.log = `【技能】${hero.name}使用${skill.name}，攻击力大幅提升但防御下降`;
                break;
            }
            default:
                result.used = false;
        }
        return result;
    }

    _chooseHeroSkill(hero, context) {
        if (!hero) return null;
        const cls = this._getHeroClass(hero);
        if (!cls || !cls.skills) return null;
        const hpPct = hero.hp / Math.max(1, hero.maxHp);
        const mpPct = hero.mp / Math.max(1, hero.maxMp);
        const [s1, s2, s3] = cls.skills;
        const sk1 = HERO_SKILL_DEFS[s1];
        const sk2 = HERO_SKILL_DEFS[s2];
        const sk3 = HERO_SKILL_DEFS[s3];

        // 专属技能：MP充足且战况需要时使用
        if (sk3 && mpPct >= 0.4 && RAND(100) < 15) {
            return s3;
        }

        // 根据AI倾向选择
        const ai = cls.ai || { aggressive: 0.5, defensive: 0.3, support: 0.2 };
        const roll = RAND(100);

        if (hpPct < 0.35 && sk1 && sk1.effectType === "heal") {
            return s1; // 优先治疗
        }
        if (context === "squad" && hpPct < 0.5 && sk2 && sk2.effectType === "mass_heal") {
            return s2;
        }

        if (roll < ai.aggressive * 100) {
            // 攻击倾向：选择伤害技能
            if (sk1 && (sk1.effectType.includes("damage") || sk1.effectType === "dot" || sk1.effectType === "execute")) return s1;
            if (sk2 && (sk2.effectType.includes("damage") || sk2.effectType === "dot" || sk2.effectType === "execute")) return s2;
        } else if (roll < (ai.aggressive + ai.defensive) * 100) {
            // 防御倾向：增益/护盾
            if (sk1 && sk1.effectType.includes("buff")) return s1;
            if (sk2 && sk2.effectType.includes("buff")) return s2;
        } else {
            // 辅助倾向：治疗/净化/减益
            if (sk1 && (sk1.effectType === "heal" || sk1.effectType === "cleanse" || sk1.effectType.includes("debuff"))) return s1;
            if (sk2 && (sk2.effectType === "heal" || sk2.effectType === "cleanse" || sk2.effectType.includes("debuff"))) return s2;
        }

        // 默认返回第一个可用技能
        if (sk1) return s1;
        if (sk2) return s2;
        return null;
    }
    // ========== 勇者入侵系统（新：声望驱动 + 每日刷新） ==========

    getHeroTargetCount() {
        const fame = this.flag[503] || 0;
        const day = this.day;
        // 基础3人，随天数和声望增长，上限20
        let count = 3 + Math.floor(day / 5) + Math.floor(fame / 20);
        if (count < 3) count = 3;
        if (count > 20) count = 20;
        return count;
    }

    getHeroFame() {
        return this.flag[503] || 0;
    }

    addFame(amount) {
        this.flag[503] = (this.flag[503] || 0) + amount;
    }

    // 处理勇者入侵（旧版兼容：返回单个勇者或null）
    processHeroInvasion() {
        const target = this.getHeroTargetCount();
        const current = this.invaders.length;
        if (current >= target) return null;
        // 补充到目标数量
        const hero = this.generateHero();
        this.invaders.push(hero);
        return hero;
    }

    // 每日批量刷新勇者（新版：返回所有新入侵者）
    refreshHeroInvaders() {
        const target = this.getHeroTargetCount();
        const current = this.invaders.length;
        const newcomers = [];
        if (current < target) {
            const need = target - current;
            for (let i = 0; i < need; i++) {
                const hero = this.generateHero();
                this.invaders.push(hero);
                newcomers.push(hero);
            }
        }
        // 为所有无任务的现有勇者刷新任务
        for (const hero of this.invaders) {
            if ((hero.cflag[980] || 0) === 0) {
                this.generateHeroTask(hero);
            }
        }
        return newcomers;
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

    // 魔王花费金币升级
    masterLevelUp() {
        const master = this.getMaster();
        if (!master) return { success: false, msg: '魔王不存在' };
        const cost = 100000;
        if (this.money < cost) {
            return { success: false, msg: `金币不足，需要${cost}G` };
        }
        this.money -= cost;
        this._levelUpEntity(master, 1);
        return { success: true, msg: `魔王等级提升至 Lv.${master.level}！\n攻击:${master.cflag[11]} 防御:${master.cflag[12]} 速度:${master.cflag[13]}` };
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

    // 地下城声望加成等级（每100声望=1级）
    getMasterFameLevel() {
        const fame = this.flag[503] || 0;
        return Math.floor(fame / 100);
    }

    // 魔王有效等级（基础等级+声望加成）
    getMasterEffectiveLevel() {
        const master = this.getMaster();
        if (!master) return 1;
        return (master.level || 1) + this.getMasterFameLevel();
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
