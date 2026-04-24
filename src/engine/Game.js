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
            case "MAP":
                UI.renderWorldMap(this);
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
        master.cflag[CFLAGS.BASE_HP] = 10;
        master.cflag[CFLAGS.ATK] = 100; // 攻击默认100
        master.cflag[CFLAGS.DEF] = 100; // 防御默认100
        master.cflag[CFLAGS.SPD] = 10 + 10 * 3; // 速度按勇者公式
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
            slave.cflag[CFLAGS.CAPTURE_STATUS] = 1; // Captured status
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
        const slaveName = slave ? slave.name : '\u5c11\u5973';
        UI.appendText(`【${slaveName}】成为了你的奴隶。\n`);
        UI.appendText(`这位被捕获的${slaveName}，眼中还燃烧着不屈的火焰。\n`);
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
        this._assistantParticipatedThisTrain = false;
        UI._trainHistory = [];
        UI._trainTextInited = false;

        // Reset part gauges for new train session
        if (target.partGauge) target.partGauge.fill(0);
        if (target.orgasmCooldown) target.orgasmCooldown.fill(0);
        target.totalOrgasmGauge = 0;
        target.isCharging = false;
        target.chargeLevel = 0;
        target.chargeTurns = 0;

        // Reset assistant stamina & rest flags
        const assi = this.getAssi();
        if (assi) {
            assi._assistantStamina = assi._assistantMaxStamina || 80;
            assi._assistantRestNextTurn = false;
            // === NEW (P2-2): Stage5 assistant buffs - wetStart ===
            if (assi._assistantBuff && assi._assistantBuff.wetStart) {
                target.addPalam(3, assi._assistantBuff.wetStart); // 润滑PALAM
                UI.appendText(`【${assi.name}的秘术让${target.name}提前湿润了...（润滑+${assi._assistantBuff.wetStart}）】\n`, 'info');
            }
            // === NEW (P2-2): postOrgasmBoost - apply if set from previous train ===
            if (target._postOrgasmBoostNextTrain) {
                const boostAmount = target._postOrgasmBoostNextTrain;
                for (let i = 0; i < target.palam.length; i++) {
                    if (target.palam[i] > 0) target.addPalam(i, boostAmount);
                }
                UI.appendText(`【${target.name}还沉浸在先前的绝顶余韵中...（全PALAM+${boostAmount}）】\n`, 'accent');
                target._postOrgasmBoostNextTrain = 0;
            }
        }

        // Train start dialogue
        this.dialogueSystem.onTrainStart(target);

        UI.renderTrain(this);
    }

    selectCommand(comId) {
        const target = this.getTarget();

        // === P0: Faint check (崩解失神跳过下回合) ===
        if (target && target._faintNextTurn) {
            UI.appendText(`【${target.name}还处于失神状态，无法行动...】\n`, "dim");
            target._faintNextTurn = false;
            this.trainCount++;
            // 体力归零检查
            if (target.hp <= 0) {
                UI.appendText(`\n【${target.name}昏了过去……】\n`);
                this.setState("AFTERTRAIN");
                return;
            }
            UI.renderTrain(this);
            return;
        }

        // === P1: Assistant rest check ===
        const assi = this.getAssi();
        if (assi && assi._assistantRestNextTurn) {
            UI.appendText(`【${assi.name}正在休息，无法行动...】\n`, "dim");
            assi._assistantRestNextTurn = false;
        }

        // === P0: Self-destruct (坏掉时每回合-3%体力) ===
        if (target && target.energy !== undefined && target.maxbase[2] > 0) {
            const energyState = target.getEnergyState ? target.getEnergyState() : null;
            if (energyState && energyState.special && energyState.special.effect === "self_destruct") {
                const staminaLoss = Math.max(1, Math.floor(target.maxbase[2] * 0.03));
                target.stamina = Math.max(0, target.stamina - staminaLoss);
                target.base[2] = target.stamina;
                UI.appendText(`【${target.name}在坏掉的状态下，肉体开始自毁...体力-${staminaLoss}】\n`, "danger");
            }
        }

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
        } else if (comId === 996) {
            this._executeInsightEye();
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
        if (target && target.hp <= 0) {
            UI.appendText(`\n【${target.name}\u660f\u4e86\u8fc7\u53bb\u2026\u2026】\n`);
            this.setState("AFTERTRAIN");
            return;
        }

        // 继续显示训练界面
        UI.renderTrain(this);
    }

    _executeInsightEye() {
        const target = this.getTarget();
        const master = this.getMaster();
        if (!target) return;
        UI.appendText(`\n\u2500\u2500\u2500\u2500 \u6d1e\u5bdf\u4e4b\u773c [#${this.trainCount + 1}] \u2500\u2500\u2500\u2500\n`);
        UI.appendText(`${master.name}\u6ce8\u89c6\u7740${target.name}\u7684\u5185\u5fc3\uff0c\u4f3c\u4e4e\u770b\u7a7f\u4e86\u4ec0\u4e48...\n`, "info");
        // 主奴气力-10
        if (target.energy !== undefined) {
            target.energy = Math.max(0, target.energy - 10);
        }
        // 揭示隐藏特质
        if (target.personality && target.personality.hidden) {
            const h = target.personality.hidden;
            if (!h.revealed) {
                // === NEW (P3-3): Insight eye adds hidden trait progress ===
                if (typeof addHiddenTraitProgress === 'function') {
                    addHiddenTraitProgress(target, 15);
                    UI.appendText(`【${target.name}\u7684\u9690\u85cf\u7279\u8d28\u8fdb\u5ea6\u589e\u52a0\u4e86\uff01\uff08+15\uff09\u3011\n`, "info");
                }
                if (typeof revealHiddenTrait === 'function') {
                    const result = revealHiddenTrait(target);
                    if (result && result.msg) UI.appendText(result.msg + "\n", "accent");
                    if (result && result.unlockLine) UI.appendText(result.unlockLine + "\n", "dim");
                } else {
                    h.revealed = true;
                    UI.appendText(`【${target.name}\u7684\u9690\u85cf\u7279\u8d28\u88ab\u5f3a\u884c\u63ed\u793a\u4e86\uff01\u3011\n`, "accent");
                }
            } else if (!h.full) {
                // Already partially revealed, add progress toward full
                if (typeof addHiddenTraitProgress === 'function') {
                    addHiddenTraitProgress(target, 15);
                    UI.appendText(`【${target.name}\u7684\u9690\u85cf\u7279\u8d28\u8fdb\u4e00\u6b65\u89e3\u9501\u4e2d...\uff08+15\uff09\u3011\n`, "info");
                    const result = revealHiddenTrait(target);
                    if (result && result.full) {
                        UI.appendText(result.msg + "\n", "accent");
                    }
                }
            }
        } else {
            UI.appendText(`【${target.name}\u6ca1\u6709\u9690\u85cf\u7684\u7279\u8d28\u6216\u5df2\u7ecf\u63ed\u793a\u3011\n`, "dim");
        }
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
        this._assistantParticipatedThisTrain = true;
        const assi = this.getAssi();
        const target = this.getTarget();
        if (comId === 900) {
            if (!assi) { UI.appendText(`没有助手，无法代行。\n`, "warning"); return; }
            // 检查助手临时体力（<20%无法代行）
            const assiStaminaPct = (assi._assistantMaxStamina || 80) > 0 ? (assi._assistantStamina / (assi._assistantMaxStamina || 80)) : 1;
            if (assiStaminaPct < 0.20) {
                UI.appendText(`【${assi.name}体力不足，无法代行...（${assi._assistantStamina}/${assi._assistantMaxStamina}）】\n`, "warning");
                return;
            }
            UI.appendText(`\n${assi.name}代替魔王执行调教，${target.name}的体验略有不同……\n`, "info");
            this.trainSystem.execute(this.selectcom >= 0 ? this.selectcom : 0);
            // 主奴获得90%PALAM（代行不如魔王熟练）
            for (let i = 0; i < target.palam.length; i++) {
                if (target.palam[i] > 0) target.palam[i] = Math.floor(target.palam[i] * 0.9);
            }
            // 消耗助手体力
            assi._assistantStamina -= 15;
            if (assi.energy !== undefined) assi.energy -= 5;
            // 代行后下回合自动休息
            assi._assistantRestNextTurn = true;
            UI.appendText(`【${assi.name}代行后需要休息一回合】\n`, "dim");
        } else if (comId === 901) {
            if (!assi) { UI.appendText(`没有助手，无法参与。\n`, "warning"); return; }
            // 检查助手体力
            if (assi._assistantStamina <= 0) {
                UI.appendText(`【${assi.name}已经脱力，无法参与...】\n`, "warning");
                return;
            }
            UI.appendText(`\n${assi.name}加入了调教，${target.name}的快感倍增！\n`, "info");
            this.trainSystem.execute(this.selectcom >= 0 ? this.selectcom : 0);

            // 同性/同路线检测
            const sameSex = (assi.talent[121] && target.talent[121]) || (assi.talent[122] && target.talent[122]);
            const sameRoute = (assi.mainRoute >= 0 && assi.mainRoute === target.mainRoute);
            let bonuses = [];
            if (sameSex) bonuses.push("同性共鸣：羞耻+20%");
            if (sameRoute) bonuses.push("同路线共鸣：+25%");
            if (bonuses.length > 0) UI.appendText(`【${bonuses.join("、")}】\n`, "info");

            // 主奴部位快感加成
            if (target.addPartGain) {
                for (let i = 0; i < 8; i++) {
                    let boost = 0.2;
                    if (sameRoute) boost += 0.25;
                    target.addPartGain(i, Math.floor((target.partGauge[i] || 0) * boost));
                }
            }
            // 助手获得70%PALAM（简化）
            if (assi.addPartGain) {
                for (let i = 0; i < 8; i++) {
                    let ratio = 0.7;
                    if (sameSex) ratio += 0.20;
                    if (sameRoute) ratio += 0.25;
                    assi.addPartGain(i, Math.floor((target.partGauge[i] || 0) * ratio));
                }
            }

            // 消耗助手体力
            assi._assistantStamina -= 10;
            if (assi.energy !== undefined) assi.energy -= 3;

            // 检查助手脱力
            if (assi._assistantStamina <= 0) {
                UI.appendText(`【${assi.name}在参与中脱力了...】\n`, "danger");
            }
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

            // === P0: Collapse settlement (energy 0%) ===
            if (target.energy !== undefined && target._maxEnergy > 0 && target.energy <= 0) {
                UI.appendText(`【${target.name}精神崩溃了...】\n`, "danger");
                // One-time talent gain based on main route
                const mainRoute = target.mainRoute;
                const routeTalentMap = {
                    0: 70,   // 顺从路线 -> 顺从之心
                    1: 71,   // 欲望路线 -> 欲望之火
                    2: 76,   // 痛苦路线 -> 痛苦承受
                    3: 72,   // 露出路线 -> 露出癖
                    4: 73    // 支配路线 -> 支配欲
                };
                const routeNames = ['顺从', '欲望', '痛苦', '露出', '支配'];
                if (mainRoute >= 0 && routeTalentMap[mainRoute] !== undefined) {
                    const tid = routeTalentMap[mainRoute];
                    if (!target.talent[tid]) {
                        target.talent[tid] = 1;
                        const tName = (typeof TALENT_DEFS !== 'undefined' && TALENT_DEFS[tid]) ? TALENT_DEFS[tid].name : '路线感悟';
                        UI.appendText(`【崩溃中顿悟】${target.name}获得了「${tName}」！\n`, "accent");
                    }
                } else {
                    UI.appendText(`【${target.name}在${routeNames[mainRoute] || '未知'}路线中获得了新的感悟...】\n`, "accent");
                }
                // Recover 15% energy for next train
                const recoverEnergy = Math.floor(target._maxEnergy * 0.15);
                target.energy = recoverEnergy;
                UI.appendText(`【${target.name}的气力恢复至${recoverEnergy}】\n`, "info");
                // === NEW (P3-3): Collapse adds hidden trait progress ===
                if (typeof addHiddenTraitProgress === 'function') {
                    addHiddenTraitProgress(target, 20);
                    UI.appendText(`【${target.name}在崩溃中触及了深层潜意识...（隐藏进度+20）】\n`, "accent");
                }
            }

            // === NEW (P2): Route EXP settlement from source ===
            if (target.source) {
                const routeMap = [
                    { palam: 4,  route: 0 },   // 顺从
                    { palam: 5,  route: 1 },   // 欲情 -> 欲望
                    { palam: 16, route: 2 },   // 痛苦
                    { palam: 8,  route: 3 },   // 羞耻 -> 露出
                    { palam: 20, route: 4 }    // 支配(反感/支配感)
                ];
                // Check assistant same-route exp multiplier (Stage5 buff)
                let sameRouteMult = 1.0;
                if (assi && assi._assistantBuff && assi._assistantBuff.sameRouteExpMult) {
                    if (target.mainRoute >= 0 && assi.mainRoute === target.mainRoute) {
                        sameRouteMult = assi._assistantBuff.sameRouteExpMult;
                    }
                }
                for (const m of routeMap) {
                    const val = target.source[m.palam] || target.palam[m.palam] || 0;
                    if (val > 0 && target.addRouteExp) {
                        let expGain = Math.floor(val / 100);
                        if (sameRouteMult > 1.0 && m.route === target.mainRoute) {
                            expGain = Math.floor(expGain * sameRouteMult);
                        }
                        target.addRouteExp(m.route, expGain);
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

        const turns = this.trainCount || 1;
        bystander._bystanderCount++;

        // Pleasure transfer ratio: 20% base, 40% when assistant participates
        const assistantJoined = this._assistantParticipatedThisTrain;
        let pleasureRatio = assistantJoined ? 0.4 : 0.2;

        // 副奴获得主奴部位快感传导
        if (bystander.partGauge && target.partGauge) {
            for (let i = 0; i < 8; i++) {
                const val = target.partGauge[i] || 0;
                if (val > 0 && bystander.addPartGain) {
                    bystander.addPartGain(i, Math.floor(val * pleasureRatio));
                }
            }
        }

        // 每回合消耗：体力-3，气力-1
        const staminaLoss = 3 * turns;
        const baseEnergyLoss = 1 * turns;
        // 每3回合累计一次+1气力惩罚
        const extraPenalty = Math.floor(turns / 3);
        const totalEnergyLoss = baseEnergyLoss + extraPenalty;

        if (bystander.stamina !== undefined) bystander.stamina = Math.max(0, bystander.stamina - staminaLoss);
        if (bystander.energy !== undefined) bystander.energy = Math.max(0, bystander.energy - totalEnergyLoss);

        // 副奴学习技能经验+1
        if (bystander.addTrainExp) {
            bystander.addTrainExp(1);
        }

        // 助手参与时触发「混乱」状态：拒绝率-20%
        if (assistantJoined) {
            bystander._bystanderConfused = true;
            if (bystander.refuseMod !== undefined) {
                bystander.refuseMod = (bystander.refuseMod || 0) - 0.20;
            }
        }

        // 检查副奴状态
        const states = [];
        if (bystander.energy < bystander.maxEnergy * 0.5) states.push('脸红');
        if (bystander.energy < bystander.maxEnergy * 0.3) states.push('移开视线');
        if (bystander.energy < bystander.maxEnergy * 0.2) states.push('请求参与');
        if (assistantJoined) states.push('混乱');
        if (states.length > 0) {
            const penaltyInfo = extraPenalty > 0 ? ' (累计惩罚-' + extraPenalty + ')' : '';
            UI.appendText('【' + bystander.name + '旁观中：' + states.join(',') + penaltyInfo + '】\n', 'dim');
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

    clickRouteAllocation(routeId) {
        const target = this.getTarget();
        if (!target) return;
        if (target.mainRoute === routeId) {
            target.setMainRoute(-1);
        } else if (target.subRoutes.includes(routeId)) {
            target.toggleSubRoute(routeId);
        } else if (target.mainRoute < 0) {
            target.setMainRoute(routeId);
        } else {
            const result = target.toggleSubRoute(routeId);
            if (result && result.action === 'full') {
                UI.showToast('\u8f85\u52a9\u8def\u7ebf\u6700\u591a2\u6761', "warning");
            }
        }
        UI.renderAblUp(this);
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
    _hasTriggeredDailyEvent(hero) {
        const squadId = hero.cflag[CFLAGS.SQUAD_ID];
        if (squadId) {
            return this.invaders.some(h => h.cflag[CFLAGS.SQUAD_ID] === squadId && h.cflag[CFLAGS.SPY_SENT]);
        }
        return !!hero.cflag[CFLAGS.SPY_SENT];
    }

    // 标记勇者或小队今天已触发事件
    _markDailyEventTriggered(hero) {
        const squadId = hero.cflag[CFLAGS.SQUAD_ID];
        if (squadId) {
            for (const h of this.invaders) {
                if (h.cflag[CFLAGS.SQUAD_ID] === squadId) h.cflag[CFLAGS.SPY_SENT] = 1;
            }
        } else {
            hero.cflag[CFLAGS.SPY_SENT] = 1;
        }
    }

    // ========== 勇【前勇者小队系统==========

    // 清除所有小队标】
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
            if ((hero.cflag[CFLAGS.HERO_TASK_TYPE] || 0) === 0) {
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
        return { success: true, msg: `魔王等级提升至 Lv.${master.level}！\n攻击:${master.cflag[CFLAGS.ATK]} 防御:${master.cflag[CFLAGS.DEF]} 速度:${master.cflag[CFLAGS.SPD]}` };
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

